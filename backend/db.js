require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,        // e.g., sql8.freesqldatabase.com
    user: process.env.DB_USER,        // your hosted DB username
    password: process.env.DB_PASS,    // your hosted DB password
    database: process.env.DB_NAME,    // your hosted DB name
    port: process.env.DB_PORT || 3306,
    ssl: false                         // important for free hosts
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err.message);
    } else {
        console.log('✅ Connected to hosted MySQL database');
    }
});

module.exports = db;
