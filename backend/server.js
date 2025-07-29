import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import testRoutes from './routes/testRoutes.js';
import labAssistant from './routes/labAssistant.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Increase request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request Timeout');
  });
  next();
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/assistant', labAssistant);


// Default route
app.get('/', (req, res) => {
  res.send('Student Registration API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});