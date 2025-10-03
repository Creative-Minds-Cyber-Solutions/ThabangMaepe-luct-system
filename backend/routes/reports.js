// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

//optional filter by lecturer and/or faculty
router.get('/reports', authenticateToken, (req, res) => {
    const { lecturer_id, faculty } = req.query;

    let query = `
        SELECT r.id, r.week_of_reporting, r.date_of_lecture, r.topic_taught, r.learning_outcomes, 
               r.recommendations, r.actual_students, r.feedback,
               c.class_name, c.total_registered, c.venue, c.scheduled_time,
               u.username as lecturer_name
        FROM reports r
        JOIN classes c ON r.class_id = c.id
        JOIN users u ON r.lecturer_id = u.id
    `;

    const params = [];
    const conditions = [];

    if (lecturer_id) conditions.push('r.lecturer_id = ?');
    if (faculty) conditions.push('c.faculty = ?');

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');

    db.query(query, lecturer_id && faculty ? [lecturer_id, faculty] : params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//only Lecturers can submit reports
router.post('/reports', authenticateToken, authorizeRoles('Lecturer'), (req, res) => {
    const { lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, learning_outcomes, recommendations, actual_students } = req.body;

    // Validate actual_students <= total_registered
    db.query('SELECT total_registered FROM classes WHERE id = ?', [class_id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(400).json({ message: 'Class not found' });
        if (actual_students > results[0].total_registered) 
            return res.status(400).json({ message: 'Actual students cannot exceed total registered students' });

        db.query(`
            INSERT INTO reports 
            (lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, learning_outcomes, recommendations, actual_students)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, learning_outcomes, recommendations, actual_students],
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ message: 'Report submitted' });
            }
        );
    });
});

//only PRL and PL can add feedback
router.put('/reports/:id/feedback', authenticateToken, authorizeRoles('PRL', 'PL'), (req, res) => {
    const reportId = req.params.id;
    const { feedback } = req.body;

    db.query('UPDATE reports SET feedback = ? WHERE id = ?', [feedback, reportId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Feedback added' });
    });
});

module.exports = router;
