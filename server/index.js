const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
