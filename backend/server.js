// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');        // login & register
const userRoutes = require('./routes/users');       // user management
const courseRoutes = require('./routes/courses');   // courses
const classRoutes = require('./routes/classes');    // classes
const reportRoutes = require('./routes/reports');   // reports
const ratingRoutes = require('./routes/ratings');   // ratings

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', courseRoutes);
app.use('/api', classRoutes);
app.use('/api', reportRoutes);
app.use('/api', ratingRoutes);

// Default route for testing
app.get('/', (req, res) => {
    res.send('LUCT API running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
