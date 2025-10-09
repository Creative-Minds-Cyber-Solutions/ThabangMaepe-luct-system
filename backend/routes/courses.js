const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all courses with filtering and search
router.get('/', authenticateToken, async (req, res) => {
    const user = req.user;
    const { search, faculty, department } = req.query;

    try {
        let query = `
            SELECT c.id, c.course_name, c.course_code, c.faculty, c.department,
                   u.username AS lecturer_name, u.id AS lecturer_id
            FROM courses c
            LEFT JOIN users u ON c.lecturer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based filtering
        if (user.role === 'PRL') {
            query += ` AND c.department = ?`;
            params.push(user.department);
        } else if (user.role === 'Lecturer' || user.role === 'Student') {
            query += ` AND c.faculty = ?`;
            params.push(user.faculty);
        }

        // Additional filters
        if (faculty) {
            query += ' AND c.faculty = ?';
            params.push(faculty);
        }

        if (department) {
            query += ' AND c.department = ?';
            params.push(department);
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ` AND (
                c.course_name LIKE ? OR 
                c.course_code LIKE ? OR 
                u.username LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY c.course_name';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get courses error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET single course
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [courses] = await db.query(
            `SELECT c.*, u.username AS lecturer_name
             FROM courses c
             LEFT JOIN users u ON c.lecturer_id = u.id
             WHERE c.id = ?`,
            [req.params.id]
        );

        if (courses.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(courses[0]);
    } catch (err) {
        console.error('Get course error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST - Add new course (PL & PRL only)
router.post('/', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { course_name, course_code, faculty, department, lecturer_id } = req.body;

    if (!course_name || !course_code || !faculty || !department || !lecturer_id) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if course code already exists
        const [existing] = await db.query(
            'SELECT id FROM courses WHERE course_code = ?',
            [course_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        // Verify lecturer exists
        const [lecturer] = await db.query(
            'SELECT id FROM users WHERE id = ? AND role = "Lecturer"',
            [lecturer_id]
        );

        if (lecturer.length === 0) {
            return res.status(400).json({ message: 'Invalid lecturer ID' });
        }

        const [result] = await db.query(
            `INSERT INTO courses (course_name, course_code, faculty, department, lecturer_id)
             VALUES (?, ?, ?, ?, ?)`,
            [course_name, course_code, faculty, department, lecturer_id]
        );

        res.status(201).json({ 
            message: 'Course added successfully', 
            courseId: result.insertId 
        });
    } catch (err) {
        console.error('Add course error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT - Update course (PL only)
router.put('/:id', authenticateToken, authorizeRoles('PL'), async (req, res) => {
    const { course_name, course_code, faculty, department, lecturer_id } = req.body;
    const courseId = req.params.id;

    try {
        const [result] = await db.query(
            `UPDATE courses 
             SET course_name = ?, course_code = ?, faculty = ?, department = ?, lecturer_id = ?
             WHERE id = ?`,
            [course_name, course_code, faculty, department, lecturer_id, courseId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course updated successfully' });
    } catch (err) {
        console.error('Update course error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE - Remove course (PL only)
router.delete('/:id', authenticateToken, authorizeRoles('PL'), async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Delete course error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
