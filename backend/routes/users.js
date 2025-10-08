const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/users/  → all users (PL & PRL only)
router.get('/', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    db.query('SELECT id, username, role, faculty, department FROM users', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// GET /api/users/filter?faculty=FICT  → filtered users
router.get('/filter', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    const { faculty } = req.query;
    let query = 'SELECT id, username, role, faculty, department FROM users';
    const params = [];

    if (faculty) {
        query += ' WHERE faculty = ?';
        params.push(faculty);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

module.exports = router;
