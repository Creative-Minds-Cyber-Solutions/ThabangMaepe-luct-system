const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all users with filtering and search (PL & PRL only)
router.get('/', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { faculty, department, role, search } = req.query;

    try {
        let query = 'SELECT id, username, role, faculty, department FROM users WHERE 1=1';
        const params = [];

        if (faculty) {
            query += ' AND faculty = ?';
            params.push(faculty);
        }

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ' AND (username LIKE ? OR faculty LIKE ? OR department LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY username';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET lecturers only
router.get('/lecturers', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { search } = req.query;

    try {
        let query = `SELECT id, username, faculty, department 
                     FROM users 
                     WHERE role = 'Lecturer'`;
        const params = [];

        if (search) {
            query += ' AND username LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY username';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get lecturers error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET students only
router.get('/students', authenticateToken, authorizeRoles('PL', 'PRL'), async (req, res) => {
    const { search } = req.query;

    try {
        let query = `SELECT id, username, faculty, department 
                     FROM users 
                     WHERE role = 'Student'`;
        const params = [];

        if (search) {
            query += ' AND username LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY username';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET single user
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, role, faculty, department FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
