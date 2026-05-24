const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // In production, refine to client URL
  credentials: true
}));
app.use(express.json());

// Routes mapping
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/repos', require('./routes/repos'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/settings', require('./routes/settings'));

// Base route for diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeSage AI API Server is operational',
    timestamp: new Date()
  });
});

// Custom error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`CodeSage Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
