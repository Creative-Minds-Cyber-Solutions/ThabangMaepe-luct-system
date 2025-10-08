// enrollments.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/enrollments', authenticateToken, (req, res) => {
  const { role, id: userId } = req.user;

  let query = `
    SELECT e.id, e.student_id, u.username AS student_name, 
           e.class_id, cl.class_name, co.course_name
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN classes cl ON e.class_id = cl.id
    JOIN courses co ON cl.course_id = co.id
  `;
  const params = [];

  if (role === 'Student') {
    query += ' WHERE e.student_id = ?';
    params.push(userId);
  } else if (role === 'Lecturer') {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json(results);
  });
});


router.post('/enrollments', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
  const { student_id, class_id } = req.body;

  if (!student_id || !class_id) {
    return res.status(400).json({ message: 'student_id and class_id are required' });
  }

  // Prevent duplicate enrollment
  db.query(
    'SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?',
    [student_id, class_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.length > 0)
        return res.status(400).json({ message: 'Student already enrolled in this class' });

      // Insert enrollment
      db.query(
        'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)',
        [student_id, class_id],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: 'Database error', error: err2 });
          res.status(201).json({ message: 'Student enrolled successfully', enrollmentId: result.insertId });
        }
      );
    }
  );
});


router.delete('/enrollments/:id', authenticateToken, authorizeRoles('PL', 'PRL'), (req, res) => {
  const enrollmentId = req.params.id;

  db.query('DELETE FROM enrollments WHERE id = ?', [enrollmentId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Enrollment removed successfully' });
  });
});

module.exports = router;
