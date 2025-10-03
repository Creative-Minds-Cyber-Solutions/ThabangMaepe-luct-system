const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'luct_secret';

// Register
router.post('/register', async (req, res) => {
    const { username, password, role, faculty } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.query(
        'INSERT INTO users (username, password, role, faculty) VALUES (?, ?, ?, ?)',
        [username, hash, role, faculty],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'User registered' });
        }
    );
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Wrong password' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
        res.json({ token, role: user.role, username: user.username, id: user.id });
    });
});

module.exports = router;
