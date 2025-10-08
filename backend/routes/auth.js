require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luct_secret';

// -------- LOGIN --------
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

    // Debug: log incoming request
    console.log('Login attempt:', username);

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        if (results.length === 0) {
            console.log('No user found with username:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, role: user.role, department: user.department, faculty: user.faculty },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('Login success:', username);
            res.json({
                token,
                role: user.role,
                username: user.username,
                department: user.department,
                faculty: user.faculty,
                id: user.id
            });
        } catch (error) {
            console.error('Error comparing password:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
});

module.exports = router;
