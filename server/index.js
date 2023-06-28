const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const DB_CONFIG = require('./src/config/db-config');

require('dotenv').config();
/*
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken'); */

const server = express();
server.use(express.json());
server.use(cors());

const pool = mysql.createPool(DB_CONFIG);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`server is runing on PORT: ${PORT}`));
