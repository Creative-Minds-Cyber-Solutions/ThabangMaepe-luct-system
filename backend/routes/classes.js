const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

//classes - optional filter by course or faculty
router.get('/classes', authenticateToken, (req, res) => {
    const { course_id, faculty } = req.query;

    let query = `
        SELECT cl.*, co.course_name, co.faculty
        FROM classes cl
        LEFT JOIN courses co ON cl.course_id = co.id
    `;
    
    const conditions = [];
    const params = [];

    if (course_id) {
        conditions.push('cl.course_id = ?');
        params.push(course_id);
    }
    if (faculty) {
        conditions.push('co.faculty = ?');
        params.push(faculty);
    }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//classes - only PL & PRL can add classes
router.post('/classes', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    const { class_name, course_id, total_registered, venue, scheduled_time } = req.body;

    db.query(
        'INSERT INTO classes (class_name, course_id, total_registered, venue, scheduled_time) VALUES (?, ?, ?, ?, ?)',
        [class_name, course_id, total_registered, venue, scheduled_time],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Class added' });
        }
    );
});

module.exports = router;
