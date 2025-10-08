require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db'); // use pool
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luct_secret';

// ----------------- REGISTER -----------------
router.post('/register', async (req, res) => {
    const { username, password, role, department } = req.body;
    const faculty = 'FICT';

    if (!username || !password || !role || !department)
        return res.status(400).json({ message: 'All fields are required' });

    const allowedRoles = ['Student', 'Lecturer'];
    if (!allowedRoles.includes(role))
        return res.status(403).json({ message: 'Unauthorized role selection' });

    const allowedDepartments = [
        'Information Technology',
        'Business Information Technology',
        'Software Engineering'
    ];
    if (!allowedDepartments.includes(department))
        return res.status(400).json({ message: 'Invalid department selection' });

    if (password.length < 4)
        return res.status(400).json({ message: 'Password must be at least 4 characters' });

    try {
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', error: err.message });
            if (results.length > 0)
                return res.status(400).json({ message: 'Username already exists' });

            const hash = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO users (username, password, role, faculty, department) VALUES (?, ?, ?, ?, ?)',
                [username, hash, role, faculty, department],
                (err) => {
                    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ----------------- LOGIN -----------------
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Missing credentials' });

    // Use pool.query and handle ECONNRESET
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('DB query error:', err);
            return res.status(500).json({ message: 'Database connection error', error: err.message });
        }

        if (results.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });

        try {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign(
                { id: user.id, role: user.role, department: user.department, faculty: user.faculty },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                role: user.role,
                username: user.username,
                department: user.department,
                faculty: user.faculty,
                id: user.id
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
});

module.exports = router;
