require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Import DB
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const classRoutes = require('./routes/classes');
const reportRoutes = require('./routes/reports');
const ratingRoutes = require('./routes/ratings');
const enrollmentRoutes = require('./routes/enrollments');
const attendanceRoutes = require('./routes/attendance');
const monitoringRoutes = require('./routes/monitoring');

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes with consistent prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Test route
app.get('/', (req, res) => res.send('LUCT API running'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
