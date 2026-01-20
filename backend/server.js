require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server Running Successfully          ║
║   📡 Port: ${PORT}                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║   📅 Started: ${new Date().toLocaleString()}  ║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();