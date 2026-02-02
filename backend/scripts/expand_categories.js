import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function expandLessonCategories() {
    console.log('🚀 Mở rộng danh mục bài học...\n');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        console.log('📦 Thêm "greetings" và "emotion" vào ENUM category của bảng lessons...');

        await connection.query(`
      ALTER TABLE lessons 
      MODIFY COLUMN category ENUM('alphabet', 'numbers', 'greetings', 'common', 'emotion', 'advanced') NOT NULL
    `);

        console.log('   ✅ Đã thêm category: greetings, emotion');
        console.log('\n🎉 Hoàn tất! Giờ bạn có thể thêm bài học với danh mục "Chào hỏi" và "Cảm xúc".');

    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

expandLessonCategories();
