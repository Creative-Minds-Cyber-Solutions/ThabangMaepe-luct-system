const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// POST - Mark attendance (Student only)
router.post('/', authenticateToken, authorizeRoles('Student'), async (req, res) => {
    const { class_id } = req.body;
    const student_id = req.user.id;

    if (!class_id) {
        return res.status(400).json({ message: 'class_id is required' });
    }

    try {
        // Check if student is enrolled
        const [enrollment] = await db.query(
            'SELECT * FROM class_students WHERE student_id = ? AND class_id = ?',
            [student_id, class_id]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({ message: 'You are not enrolled in this class' });
        }

        // Check if already marked
        const [existing] = await db.query(
            'SELECT * FROM attendance WHERE student_id = ? AND class_id = ?',
            [student_id, class_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        // Mark attendance
        await db.query(
            'INSERT INTO attendance (student_id, class_id, marked_at) VALUES (?, ?, NOW())',
            [student_id, class_id]
        );

        res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (err) {
        console.error('Mark attendance error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET - View student's attendance
router.get('/', authenticateToken, authorizeRoles('Student'), async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT a.class_id, a.marked_at, cl.class_name, co.course_name
             FROM attendance a
             JOIN classes cl ON a.class_id = cl.id
             JOIN courses co ON cl.course_id = co.id
             WHERE a.student_id = ?
             ORDER BY a.marked_at DESC`,
            [req.user.id]
        );

        res.json(results);
    } catch (err) {
        console.error('Get attendance error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
