const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/classes', authenticateToken, (req, res) => {
    const user = req.user;
    let query = `SELECT cl.id, cl.class_name, cl.total_registered, cl.venue, cl.scheduled_time, co.course_name, co.faculty, u.username AS lecturer_name FROM classes cl LEFT JOIN courses co ON cl.course_id = co.id LEFT JOIN users u ON cl.lecturer_id = u.id`;
    const params = [];

    if (user.role === 'Student') {
        query += ` INNER JOIN class_students cs ON cl.id = cs.class_id WHERE cs.student_id = ?`;
        params.push(user.id);
    } else if (user.role === 'Lecturer') {
        query += ` WHERE cl.lecturer_id = ?`;
        params.push(user.id);
    } else if (user.role === 'PRL') {
        query += ` WHERE co.faculty = ?`;
        params.push(user.faculty);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });
        res.json(results);
    });
});

router.get('/classes/:id/students-attendance', authenticateToken, authorizeRoles('Lecturer', 'PRL', 'PL'), (req, res) => {
    const classId = req.params.id;
    const query = `SELECT u.id, u.username, u.faculty, a.marked_at FROM class_students cs JOIN users u ON cs.student_id = u.id LEFT JOIN attendance a ON a.class_id = cs.class_id AND a.student_id = u.id WHERE cs.class_id = ?`;
    db.query(query, [classId], (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });
        res.json(results);
    });
});

module.exports = router;
