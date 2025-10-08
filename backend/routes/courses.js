const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/courses', authenticateToken, (req, res) => {
    const user = req.user; // from JWT
    let query = `
        SELECT c.id, c.course_name, c.course_code, c.faculty, c.department,
               u.username AS lecturer_name
        FROM courses c
        LEFT JOIN users u ON c.lecturer_id = u.id
    `;
    const params = [];

    if (user.role === 'PRL') {
        // PRL sees only courses in their department
        query += ` WHERE c.department = ?`;
        params.push(user.department);
    } 
    // PL sees all courses (no filter)
    // Student/Lecturer can see only their faculty
    else if (user.role === 'Lecturer' || user.role === 'Student') {
        query += ` WHERE c.faculty = ?`;
        params.push(user.faculty);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

router.post('/courses', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
    const { course_name, course_code, faculty, department, lecturer_id } = req.body;

    if (!course_name || !course_code || !faculty || !department || !lecturer_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO courses (course_name, course_code, faculty, department, lecturer_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [course_name, course_code, faculty, department, lecturer_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Course added successfully', courseId: result.insertId });
    });
});

module.exports = router;
