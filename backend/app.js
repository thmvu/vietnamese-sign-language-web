import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin (dev mode) or specific allowed origins
    if (/^http:\/\/localhost:\d+$/.test(origin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/courses', courseRoutes);
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

export default app;