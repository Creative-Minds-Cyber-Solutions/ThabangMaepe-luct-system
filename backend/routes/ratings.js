// backend/routes/ratings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

//ratings - submit rating, prevent duplicate
router.post('/ratings', authenticateToken, (req, res) => {
    const { user_id, class_id, rating } = req.body;

    db.query(
        'SELECT * FROM ratings WHERE user_id = ? AND class_id = ?',
        [user_id, class_id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0)
                return res.status(400).json({ message: 'You already rated this class' });

            db.query(
                'INSERT INTO ratings (user_id, class_id, rating) VALUES (?, ?, ?)',
                [user_id, class_id, rating],
                (err, result) => {
                    if (err) return res.status(500).json(err);
                    res.json({ message: 'Rating submitted' });
                }
            );
        }
    );
});


router.get('/ratings', authenticateToken, (req, res) => {
    db.query('SELECT * FROM ratings', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

module.exports = router;
