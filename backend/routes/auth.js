// backend/routes/auth.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luct_secret';

// ----------------- REGISTER -----------------
router.post('/register', async (req, res) => {
    const { username, password, role, department } = req.body;

    // Faculty is always FICT
    const faculty = 'FICT';

    // Validate fields
    if (!username || !password || !role || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Only allow Student and Lecturer to self-register
    const allowedRoles = ['Student', 'Lecturer'];
    if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Unauthorized role selection' });
    }

    // Allowed departments
    const allowedDepartments = [
        'Information Technology',
        'Business Information Technology',
        'Software Engineering'
    ];
    if (!allowedDepartments.includes(department)) {
        return res.status(400).json({ message: 'Invalid department selection' });
    }

    // Password minimum length
    if (password.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    try {
        // Check if username already exists
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0)
                return res.status(400).json({ message: 'Username already exists' });

            // Hash password
            const hash = await bcrypt.hash(password, 10);

            // Insert user with department and faculty
            db.query(
                'INSERT INTO users (username, password, role, faculty, department) VALUES (?, ?, ?, ?, ?)',
                [username, hash, role, faculty, department],
                (err, results) => {
                    if (err) return res.status(500).json(err);
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

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token
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
    });
});

module.exports = router;
