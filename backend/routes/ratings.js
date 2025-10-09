const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST - Submit rating
router.post('/', authenticateToken, async (req, res) => {
    const { user_id, class_id, rating, comment } = req.body;

    if (!class_id || !rating) {
        return res.status(400).json({ message: 'Class ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        // Check for duplicate rating
        const [existing] = await db.query(
            'SELECT * FROM ratings WHERE user_id = ? AND class_id = ?',
            [req.user.id, class_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You already rated this class' });
        }

        // Insert rating
        await db.query(
            'INSERT INTO ratings (user_id, class_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.user.id, class_id, rating, comment || null]
        );

        res.status(201).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        console.error('Submit rating error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET all ratings with filtering and search
router.get('/', authenticateToken, async (req, res) => {
    const { class_id, lecturer_id, search } = req.query;

    try {
        let query = `
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.username AS rater_name,
                   cl.class_name,
                   co.course_name, co.course_code,
                   lec.username AS lecturer_name
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            JOIN classes cl ON r.class_id = cl.id
            JOIN courses co ON cl.course_id = co.id
            JOIN users lec ON cl.lecturer_id = lec.id
            WHERE 1=1
        `;
        const params = [];

        if (class_id) {
            query += ' AND r.class_id = ?';
            params.push(class_id);
        }

        if (lecturer_id) {
            query += ' AND cl.lecturer_id = ?';
            params.push(lecturer_id);
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ` AND (
                cl.class_name LIKE ? OR 
                co.course_name LIKE ? OR 
                co.course_code LIKE ? OR
                lec.username LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY r.created_at DESC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get ratings error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET average rating for a class
router.get('/class/:classId/average', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query(
            'SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE class_id = ?',
            [req.params.classId]
        );

        res.json(result[0]);
    } catch (err) {
        console.error('Get average rating error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET average rating for a lecturer
router.get('/lecturer/:lecturerId/average', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.query(
            `SELECT AVG(r.rating) as average_rating, COUNT(*) as total_ratings
             FROM ratings r
             JOIN classes cl ON r.class_id = cl.id
             WHERE cl.lecturer_id = ?`,
            [req.params.lecturerId]
        );

        res.json(result[0]);
    } catch (err) {
        console.error('Get lecturer rating error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
