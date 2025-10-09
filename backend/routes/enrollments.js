const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all enrollments
router.get('/', authenticateToken, async (req, res) => {
    const { role, id: userId } = req.user;
    const { search } = req.query;

    try {
        let query = `
            SELECT e.id, e.student_id, u.username AS student_name, 
                   e.class_id, cl.class_name, co.course_name, co.course_code
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN classes cl ON e.class_id = cl.id
            JOIN courses co ON cl.course_id = co.id
            WHERE 1=1
        `;
        const params = [];

        if (role === 'Student') {
            query += ' AND e.student_id = ?';
            params.push(userId);
        } else if (role === 'Lecturer') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ` AND (
                u.username LIKE ? OR 
                cl.class_name LIKE ? OR 
                co.course_name LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY u.username';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get enrollments error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST - Add enrollment
router.post('/', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { student_id, class_id } = req.body;

    if (!student_id || !class_id) {
        return res.status(400).json({ message: 'student_id and class_id are required' });
    }

    try {
        // Check for duplicate
        const [existing] = await db.query(
            'SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?',
            [student_id, class_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Student already enrolled in this class' });
        }

        await db.query(
            'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)',
            [student_id, class_id]
        );

        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (err) {
        console.error('Enroll student error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE - Remove enrollment
router.delete('/:id', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM enrollments WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.json({ message: 'Enrollment removed successfully' });
    } catch (err) {
        console.error('Delete enrollment error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
