const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { authenticate } = require('./middleware');
require('dotenv').config();
const server = express();
server.use(express.json());
server.use(cors());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASS,
  database: 'sharing_expenses',
};

const pool = mysql.createPool(dbConfig);

const userSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
    );
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /register
server.post('/register', async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const query =
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
    await pool.query(query, [value.full_name, value.email, hashedPassword]);

    return res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    return res.status(500).json({ error: 'Failed to save user data' });
  }
});

//Login
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Out of data' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  pool
    .query(query, [email])
    .then(([results]) => {
      if (results.length === 0) {
        return res.status(401).json({ error: 'No user found with this email' });
      }

      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
          return res
            .status(401)
            .json({ error: 'Invalid email, email address or password' });
        }

        const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET);
        return res.status(200).json({ token });
      });
    })
    .catch((error) => {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    });
});

//Groups POST
server.post('/groups', authenticateUser, async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const query = 'INSERT INTO groups (name, description) VALUES (?, ?)';
    await pool.query(query, [name, description]);

    return res.status(201).json({ message: 'Group created successfully' });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// Groups Get - Get information of the groups table
server.get('/groups', authenticateUser, async (req, res) => {
  try {
    const query = 'SELECT * FROM groups';
    const [results] = await pool.query(query);

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /accounts - Assign user to a group
server.post('/accounts', authenticateUser, async (req, res) => {
  const { group_id } = req.body;
  const { user_id } = req.user;

  if (!group_id) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    const checkGroupQuery = 'SELECT * FROM groups WHERE id = ?';
    const [groupResults] = await pool.query(checkGroupQuery, [group_id]);

    if (groupResults.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const insertAccountQuery =
      'INSERT INTO accounts (user_id, group_id) VALUES (?, ?)';
    await pool.query(insertAccountQuery, [user_id, group_id]);

    return res
      .status(201)
      .json({ message: 'User assigned to group successfully' });
  } catch (error) {
    console.error('Error assigning user to group:', error);
    return res.status(500).json({ error: 'Failed to assign user to group' });
  }
});
// GET /accounts
server.get('/accounts', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT groups.*
      FROM groups
      JOIN users_groups ON groups.id = users_groups.group_id
      WHERE users_groups.user_id = ?
    `;
    const [rows] = await pool.query(query, [userId]);

    return res.status(200).json({ groups: rows });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});
// GET /bills/:group_id - Get all bills for a specific group
server.get('/bills/:group_id', authenticateUser, async (req, res) => {
  const { group_id } = req.params;

  try {
    const getBillsQuery = 'SELECT * FROM bills WHERE group_id = ?';
    const [billsResults] = await pool.query(getBillsQuery, [group_id]);

    return res.status(200).json({ bills: billsResults });
  } catch (error) {
    console.error('Error retrieving bills:', error);
    return res.status(500).json({ error: 'Failed to retrieve bills' });
  }
});

// POST /bills - Record a new bill for a specific group
server.post('/bills', authenticateUser, async (req, res) => {
  const { group_id, amount, description } = req.body;

  if (!group_id || !amount || !description) {
    return res
      .status(400)
      .json({ error: 'Group ID, amount, and description are required' });
  }

  try {
    const checkGroupQuery = 'SELECT * FROM groups WHERE id = ?';
    const [groupResults] = await pool.query(checkGroupQuery, [group_id]);

    if (groupResults.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const insertBillQuery =
      'INSERT INTO bills (group_id, amount, description) VALUES (?, ?, ?)';
    await pool.query(insertBillQuery, [group_id, amount, description]);

    return res.status(201).json({ message: 'Bill recorded successfully' });
  } catch (error) {
    console.error('Error recording bill:', error);
    return res.status(500).json({ error: 'Failed to record bill' });
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
