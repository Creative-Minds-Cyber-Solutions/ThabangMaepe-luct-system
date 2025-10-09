const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET attendance statistics
router.get('/attendance-stats', authenticateToken, async (req, res) => {
    const user = req.user;

    try {
        let query = `
            SELECT 
                cl.id,
                cl.class_name,
                co.course_name,
                cl.total_registered,
                COUNT(DISTINCT a.student_id) as total_attended,
                ROUND((COUNT(DISTINCT a.student_id) / cl.total_registered) * 100, 2) as attendance_percentage
            FROM classes cl
            JOIN courses co ON cl.course_id = co.id
            LEFT JOIN attendance a ON a.class_id = cl.id
            WHERE 1=1
        `;
        const params = [];

        if (user.role === 'Lecturer') {
            query += ' AND cl.lecturer_id = ?';
            params.push(user.id);
        } else if (user.role === 'PRL') {
            query += ' AND co.department = ?';
            params.push(user.department);
        }

        query += ' GROUP BY cl.id ORDER BY attendance_percentage DESC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get attendance stats error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET reports summary
router.get('/reports-summary', authenticateToken, async (req, res) => {
    const user = req.user;

    try {
        let query = `
            SELECT 
                DATE(r.date_of_lecture) as date,
                COUNT(*) as total_reports,
                AVG(r.actual_students) as avg_attendance,
                SUM(CASE WHEN r.feedback IS NOT NULL THEN 1 ELSE 0 END) as reports_with_feedback
            FROM reports r
            JOIN classes cl ON r.class_id = cl.id
            JOIN courses co ON cl.course_id = co.id
            WHERE 1=1
        `;
        const params = [];

        if (user.role === 'Lecturer') {
            query += ' AND r.lecturer_id = ?';
            params.push(user.id);
        } else if (user.role === 'PRL') {
            query += ' AND co.department = ?';
            params.push(user.department);
        }

        query += ' GROUP BY DATE(r.date_of_lecture) ORDER BY date DESC LIMIT 30';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get reports summary error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET lecturer performance
router.get('/lecturer-performance', authenticateToken, authorizeRoles('PRL', 'PL'), async (req, res) => {
    const user = req.user;

    try {
        let query = `
            SELECT 
                u.id,
                u.username,
                COUNT(DISTINCT r.id) as total_reports,
                AVG(r.actual_students / cl.total_registered * 100) as avg_attendance_rate,
                COUNT(DISTINCT cl.id) as total_classes,
                AVG(rat.rating) as avg_rating
            FROM users u
            LEFT JOIN reports r ON u.id = r.lecturer_id
            LEFT JOIN classes cl ON r.class_id = cl.id
            LEFT JOIN courses co ON cl.course_id = co.id
            LEFT JOIN ratings rat ON rat.class_id = cl.id
            WHERE u.role = 'Lecturer'
        `;
        const params = [];

        if (user.role === 'PRL') {
            query += ' AND co.department = ?';
            params.push(user.department);
        }

        query += ' GROUP BY u.id ORDER BY total_reports DESC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get lecturer performance error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
    const user = req.user;

    try {
        let stats = {};

        if (user.role === 'Student') {
            // Student stats
            const [classes] = await db.query(
                `SELECT COUNT(*) as total FROM class_students WHERE student_id = ?`,
                [user.id]
            );
            const [attendance] = await db.query(
                `SELECT COUNT(*) as total FROM attendance WHERE student_id = ?`,
                [user.id]
            );

            stats = {
                total_classes: classes[0].total,
                total_attendance: attendance[0].total
            };
        } else if (user.role === 'Lecturer') {
            // Lecturer stats
            const [classes] = await db.query(
                `SELECT COUNT(*) as total FROM classes WHERE lecturer_id = ?`,
                [user.id]
            );
            const [reports] = await db.query(
                `SELECT COUNT(*) as total FROM reports WHERE lecturer_id = ?`,
                [user.id]
            );
            const [ratings] = await db.query(
                `SELECT AVG(r.rating) as avg_rating
                 FROM ratings r
                 JOIN classes cl ON r.class_id = cl.id
                 WHERE cl.lecturer_id = ?`,
                [user.id]
            );

            stats = {
                total_classes: classes[0].total,
                total_reports: reports[0].total,
                avg_rating: ratings[0].avg_rating || 0
            };
        } else if (user.role === 'PRL') {
            // PRL stats
            const [courses] = await db.query(
                `SELECT COUNT(*) as total FROM courses WHERE department = ?`,
                [user.department]
            );
            const [classes] = await db.query(
                `SELECT COUNT(*) as total 
                 FROM classes cl
                 JOIN courses co ON cl.course_id = co.id
                 WHERE co.department = ?`,
                [user.department]
            );
            const [reports] = await db.query(
                `SELECT COUNT(*) as total 
                 FROM reports r
                 JOIN classes cl ON r.class_id = cl.id
                 JOIN courses co ON cl.course_id = co.id
                 WHERE co.department = ?`,
                [user.department]
            );

            stats = {
                total_courses: courses[0].total,
                total_classes: classes[0].total,
                total_reports: reports[0].total
            };
        } else if (user.role === 'PL') {
            // PL stats
            const [courses] = await db.query(`SELECT COUNT(*) as total FROM courses`);
            const [classes] = await db.query(`SELECT COUNT(*) as total FROM classes`);
            const [reports] = await db.query(`SELECT COUNT(*) as total FROM reports`);
            const [lecturers] = await db.query(
                `SELECT COUNT(*) as total FROM users WHERE role = 'Lecturer'`
            );

            stats = {
                total_courses: courses[0].total,
                total_classes: classes[0].total,
                total_reports: reports[0].total,
                total_lecturers: lecturers[0].total
            };
        }

        res.json(stats);
    } catch (err) {
        console.error('Get dashboard stats error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;