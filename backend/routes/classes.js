const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all classes with filtering and search
router.get('/', authenticateToken, async (req, res) => {
    const user = req.user;
    const { search, course_id } = req.query;

    try {
        let query = `
            SELECT cl.id, cl.class_name, cl.total_registered, cl.venue, cl.scheduled_time,
                   co.id AS course_id, co.course_name, co.course_code, co.faculty, co.department,
                   u.username AS lecturer_name, u.id AS lecturer_id
            FROM classes cl
            JOIN courses co ON cl.course_id = co.id
            JOIN users u ON cl.lecturer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based filtering
        if (user.role === 'Student') {
            query = `
                SELECT cl.id, cl.class_name, cl.total_registered, cl.venue, cl.scheduled_time,
                       co.id AS course_id, co.course_name, co.course_code, co.faculty,
                       u.username AS lecturer_name
                FROM classes cl
                JOIN courses co ON cl.course_id = co.id
                JOIN users u ON cl.lecturer_id = u.id
                INNER JOIN class_students cs ON cl.id = cs.class_id
                WHERE cs.student_id = ?
            `;
            params.push(user.id);
        } else if (user.role === 'Lecturer') {
            query += ` AND cl.lecturer_id = ?`;
            params.push(user.id);
        } else if (user.role === 'PRL') {
            query += ` AND co.department = ?`;
            params.push(user.department);
        }

        // Additional filters
        if (course_id) {
            query += ' AND cl.course_id = ?';
            params.push(course_id);
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ` AND (
                cl.class_name LIKE ? OR 
                co.course_name LIKE ? OR 
                co.course_code LIKE ? OR
                cl.venue LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY cl.class_name';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get classes error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET single class
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [classes] = await db.query(
            `SELECT cl.*, co.course_name, co.course_code, u.username AS lecturer_name
             FROM classes cl
             JOIN courses co ON cl.course_id = co.id
             JOIN users u ON cl.lecturer_id = u.id
             WHERE cl.id = ?`,
            [req.params.id]
        );

        if (classes.length === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.json(classes[0]);
    } catch (err) {
        console.error('Get class error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET students in a class with attendance
router.get('/:id/students-attendance', authenticateToken, authorizeRoles('Lecturer', 'PRL', 'PL'), async (req, res) => {
    const classId = req.params.id;

    try {
        const [results] = await db.query(
            `SELECT u.id, u.username, u.faculty, u.department, a.marked_at
             FROM class_students cs
             JOIN users u ON cs.student_id = u.id
             LEFT JOIN attendance a ON a.class_id = cs.class_id AND a.student_id = u.id
             WHERE cs.class_id = ?
             ORDER BY u.username`,
            [classId]
        );

        res.json(results);
    } catch (err) {
        console.error('Get attendance error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST - Add new class (PL & PRL only)
router.post('/', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { class_name, course_id, lecturer_id, total_registered, venue, scheduled_time } = req.body;

    if (!class_name || !course_id || !lecturer_id || !total_registered || !venue || !scheduled_time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO classes (class_name, course_id, lecturer_id, total_registered, venue, scheduled_time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [class_name, course_id, lecturer_id, total_registered, venue, scheduled_time]
        );

        res.status(201).json({ 
            message: 'Class created successfully', 
            classId: result.insertId 
        });
    } catch (err) {
        console.error('Create class error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT - Update class (PL & PRL only)
router.put('/:id', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { class_name, total_registered, venue, scheduled_time } = req.body;
    const classId = req.params.id;

    try {
        const [result] = await db.query(
            `UPDATE classes 
             SET class_name = ?, total_registered = ?, venue = ?, scheduled_time = ?
             WHERE id = ?`,
            [class_name, total_registered, venue, scheduled_time, classId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.json({ message: 'Class updated successfully' });
    } catch (err) {
        console.error('Update class error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;