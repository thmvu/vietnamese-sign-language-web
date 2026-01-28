import dotenv from 'dotenv';
import app from './app.js';
import db from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Check database connection
    const connection = await db.getConnection();
    console.log('✅ Connection to MySQL established successfully.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server Running Successfully          ║
║   📡 Port: ${PORT}                           ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}     ║
║   📅 Started: ${new Date().toLocaleString()}  ║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle system errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();