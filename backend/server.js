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

// Test route
app.get('/', (req, res) => res.send('LUCT API running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
