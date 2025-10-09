const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// GET all reports with filtering and search
router.get('/', authenticateToken, async (req, res) => {
    const { lecturer_id, faculty, course_id, week, date_from, date_to, search } = req.query;
    const user = req.user;

    try {
        let query = `
            SELECT r.id, r.week_of_reporting, r.date_of_lecture, r.topic_taught, 
                   r.learning_outcomes, r.recommendations, r.actual_students, r.feedback,
                   cl.class_name, cl.total_registered, cl.venue, cl.scheduled_time,
                   co.course_name, co.course_code, co.faculty, co.department,
                   u.username AS lecturer_name, u.id AS lecturer_id
            FROM reports r
            JOIN classes cl ON r.class_id = cl.id
            JOIN courses co ON cl.course_id = co.id
            JOIN users u ON r.lecturer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based filtering
        if (user.role === 'Lecturer') {
            query += ' AND r.lecturer_id = ?';
            params.push(user.id);
        } else if (user.role === 'PRL') {
            query += ' AND co.department = ?';
            params.push(user.department);
        }
        // PL and Student can see all

        // Additional filters
        if (lecturer_id) {
            query += ' AND r.lecturer_id = ?';
            params.push(lecturer_id);
        }

        if (faculty) {
            query += ' AND co.faculty = ?';
            params.push(faculty);
        }

        if (course_id) {
            query += ' AND co.id = ?';
            params.push(course_id);
        }

        if (week) {
            query += ' AND r.week_of_reporting = ?';
            params.push(week);
        }

        if (date_from) {
            query += ' AND r.date_of_lecture >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND r.date_of_lecture <= ?';
            params.push(date_to);
        }

        // SEARCH functionality (extra credit)
        if (search) {
            query += ` AND (
                co.course_name LIKE ? OR 
                co.course_code LIKE ? OR 
                cl.class_name LIKE ? OR 
                r.topic_taught LIKE ? OR
                u.username LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY r.date_of_lecture DESC, r.created_at DESC';

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Get reports error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST - Submit a new report
router.post('/', authenticateToken, authorizeRoles('Lecturer'), async (req, res) => {
    const {
        class_id,
        week_of_reporting,
        date_of_lecture,
        topic_taught,
        learning_outcomes,
        recommendations,
        actual_students
    } = req.body;

    const lecturer_id = req.user.id;

    // Validate required fields
    if (!class_id || !week_of_reporting || !date_of_lecture || 
        !topic_taught || !learning_outcomes || actual_students === undefined) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    try {
        // Validate class exists and get total registered
        const [classes] = await db.query(
            'SELECT total_registered FROM classes WHERE id = ?', 
            [class_id]
        );

        if (classes.length === 0) {
            return res.status(400).json({ message: 'Class not found' });
        }

        // Validate actual students
        if (actual_students > classes[0].total_registered) {
            return res.status(400).json({ 
                message: 'Actual students cannot exceed total registered' 
            });
        }

        // Insert report
        const [result] = await db.query(
            `INSERT INTO reports
            (lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, 
             learning_outcomes, recommendations, actual_students)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [lecturer_id, class_id, week_of_reporting, date_of_lecture, topic_taught, 
             learning_outcomes, recommendations, actual_students]
        );

        res.status(201).json({ 
            message: 'Report submitted successfully',
            reportId: result.insertId
        });
    } catch (err) {
        console.error('Submit report error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT - Add feedback to a report (PRL & PL only)
router.put('/:id/feedback', authenticateToken, authorizeRoles('PRL', 'PL'), async (req, res) => {
    const reportId = req.params.id;
    const { feedback } = req.body;

    if (!feedback) {
        return res.status(400).json({ message: 'Feedback text is required' });
    }

    try {
        const [result] = await db.query(
            'UPDATE reports SET feedback = ? WHERE id = ?', 
            [feedback, reportId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ message: 'Feedback added successfully' });
    } catch (err) {
        console.error('Add feedback error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// EXCEL EXPORT (Extra credit)
router.get('/export', authenticateToken, async (req, res) => {
    const { date_from, date_to } = req.query;
    const user = req.user;

    try {
        let query = `
            SELECT r.week_of_reporting, r.date_of_lecture, r.topic_taught, 
                   r.learning_outcomes, r.recommendations, r.actual_students,
                   cl.class_name, cl.total_registered, cl.venue, cl.scheduled_time,
                   co.course_name, co.course_code, co.faculty, co.department,
                   u.username AS lecturer_name
            FROM reports r
            JOIN classes cl ON r.class_id = cl.id
            JOIN courses co ON cl.course_id = co.id
            JOIN users u ON r.lecturer_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based filtering
        if (user.role === 'Lecturer') {
            query += ' AND r.lecturer_id = ?';
            params.push(user.id);
        } else if (user.role === 'PRL') {
            query += ' AND co.department = ?';
            params.push(user.department);
        }

        if (date_from) {
            query += ' AND r.date_of_lecture >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND r.date_of_lecture <= ?';
            params.push(date_to);
        }

        query += ' ORDER BY r.date_of_lecture DESC';

        const [results] = await db.query(query, params);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Lecture Reports');

        // Add headers
        worksheet.columns = [
            { header: 'Faculty', key: 'faculty', width: 15 },
            { header: 'Department', key: 'department', width: 25 },
            { header: 'Course Code', key: 'course_code', width: 12 },
            { header: 'Course Name', key: 'course_name', width: 30 },
            { header: 'Class Name', key: 'class_name', width: 20 },
            { header: 'Lecturer', key: 'lecturer_name', width: 20 },
            { header: 'Week', key: 'week_of_reporting', width: 8 },
            { header: 'Date', key: 'date_of_lecture', width: 12 },
            { header: 'Venue', key: 'venue', width: 15 },
            { header: 'Time', key: 'scheduled_time', width: 10 },
            { header: 'Topic Taught', key: 'topic_taught', width: 40 },
            { header: 'Learning Outcomes', key: 'learning_outcomes', width: 40 },
            { header: 'Actual Students', key: 'actual_students', width: 12 },
            { header: 'Total Registered', key: 'total_registered', width: 12 },
            { header: 'Recommendations', key: 'recommendations', width: 40 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data
        results.forEach(report => {
            worksheet.addRow(report);
        });

        // Generate Excel file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=lecture-reports-${Date.now()}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ message: 'Export error', error: err.message });
    }
});

module.exports = router;