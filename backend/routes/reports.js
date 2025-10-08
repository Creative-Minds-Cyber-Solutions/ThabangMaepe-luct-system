// reports.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/reports', authenticateToken, (req, res) => {
    const { lecturer_id, faculty } = req.query;

    let query = `
        SELECT r.id, r.week_of_reporting, r.date_of_lecture, r.topic_taught, 
               r.learning_outcomes, r.recommendations, r.actual_students, r.feedback,
               c.class_name, c.total_registered, c.venue, c.scheduled_time,
               co.course_name, co.course_code, co.faculty,
               u.username AS lecturer_name
        FROM reports r
        JOIN classes c ON r.class_id = c.id
        JOIN courses co ON c.course_id = co.id
        JOIN users u ON r.lecturer_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (lecturer_id) {
        conditions.push('r.lecturer_id = ?');
        params.push(lecturer_id);
    }

    if (faculty) {
        conditions.push('co.faculty = ?');
        params.push(faculty);
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});


router.post('/reports', authenticateToken, authorizeRoles('Lecturer'), (req, res) => {
    const {
        lecturer_id,
        class_id,
        week_of_reporting,
        date_of_lecture,
        topic_taught,
        learning_outcomes,
        recommendations,
        actual_students
    } = req.body;

    // Validate class exists
    db.query('SELECT total_registered FROM classes WHERE id = ?', [class_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(400).json({ message: 'Class not found' });

        // Validate actual students
        if (actual_students > results[0].total_registered)
            return res.status(400).json({ message: 'Actual students cannot exceed total registered' });

        // Insert report
        const sql = `
            INSERT INTO reports
            (lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, learning_outcomes, recommendations, actual_students)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            sql,
            [lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, learning_outcomes, recommendations, actual_students],
            (err2) => {
                if (err2) return res.status(500).json({ message: 'Database error', error: err2 });
                res.status(201).json({ message: 'Report submitted successfully' });
            }
        );
    });
});


router.put('/reports/:id/feedback', authenticateToken, authorizeRoles('PRL', 'PL'), (req, res) => {
    const reportId = req.params.id;
    const { feedback } = req.body;

    db.query('UPDATE reports SET feedback = ? WHERE id = ?', [feedback, reportId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Feedback added successfully' });
    });
});

module.exports = router;
