const { Pool } = require('pg');
const dotenv = require('dotenv').config();
const DB = new Pool({
user: process.env.PSQL_USER,
host: process.env.PSQL_HOST,
database: process.env.PSQL_DATABASE,
password: process.env.PSQL_PASSWORD,
port: process.env.PSQL_PORT,
ssl: {rejectUnauthorized: false}
});

module.exports = DB;