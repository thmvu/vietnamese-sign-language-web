const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const videoRoutes = require('./routes/videoRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;