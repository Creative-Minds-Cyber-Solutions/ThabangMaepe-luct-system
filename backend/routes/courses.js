const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

//courses - everyone can view
router.get('/courses', authenticateToken, (req, res) => {
    db.query(
        'SELECT c.*, u.username as lecturer_name FROM courses c LEFT JOIN users u ON c.lecturer_id = u.id',
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

//courses - only PL & PRL can add courses
router.post('/courses', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    const { course_name, course_code, faculty, lecturer_id } = req.body;

    db.query(
        'INSERT INTO courses (course_name, course_code, faculty, lecturer_id) VALUES (?, ?, ?, ?)',
        [course_name, course_code, faculty, lecturer_id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Course added' });
        }
    );
});

module.exports = router;
