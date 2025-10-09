require('dotenv').config();
const mysql = require('mysql2');

// Create connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('MySQL connected successfully');
    connection.release();
});

// Export promise-based pool for async/await usage
module.exports = pool.promise();
