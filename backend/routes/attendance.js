const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/attendance', authenticateToken, authorizeRoles('Student'), (req, res) => {
    const { class_id } = req.body;
    const student_id = req.user.id;

    db.query('SELECT * FROM class_students WHERE student_id = ? AND class_id = ?', [student_id, class_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });
        if (results.length === 0) return res.status(403).json({ message: 'Not enrolled' });

        db.query('SELECT * FROM attendance WHERE student_id = ? AND class_id = ?', [student_id, class_id], (err2, attResults) => {
            if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
            if (attResults.length > 0) return res.status(400).json({ message: 'Attendance already marked' });

            db.query('INSERT INTO attendance (student_id, class_id, marked_at) VALUES (?, ?, NOW())', [student_id, class_id], (err3) => {
                if (err3) return res.status(500).json({ message: 'DB error', error: err3 });
                res.status(201).json({ message: 'Attendance marked successfully' });
            });
        });
    });
});

router.get('/attendance', authenticateToken, authorizeRoles('Student'), (req, res) => {
    db.query('SELECT class_id FROM attendance WHERE student_id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });
        res.json(results);
    });
});

module.exports = router;
