require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luct_secret';

// REGISTER
router.post('/register', async (req, res) => {
    const { username, password, role, department } = req.body;
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

    try {
        // Check if username exists
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password (ensure numeric passwords work)
        const hash = await bcrypt.hash(password.toString(), 10);

        // Insert user
        await db.query(
            'INSERT INTO users (username, password, role, faculty, department) VALUES (?, ?, ?, ?, ?)',
            [username, hash, role, faculty, department]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }

    try {
        const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password.toString(), user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role, 
                department: user.department, 
                faculty: user.faculty,
                username: user.username
            },
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
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, role, faculty, department FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
