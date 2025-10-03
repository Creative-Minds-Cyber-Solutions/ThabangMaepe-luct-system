// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

//users - only PL & PRL can view all users
router.get('/users', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    db.query(
        'SELECT id, username, role, faculty FROM users',
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});


router.get('/users/filter', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    const { faculty } = req.query;
    let query = 'SELECT id, username, role, faculty FROM users';
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
