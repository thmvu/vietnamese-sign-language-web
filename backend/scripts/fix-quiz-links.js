// Script gắn quiz có sẵn vào lessons
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixQuizLinks() {
    let connection;
    try {
        console.log('🔧 Đang kết nối database...\n');

        const config = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };

        if (process.env.DB_SSL === 'true') {
            config.ssl = { rejectUnauthorized: false };
        }

        connection = await mysql.createConnection(config);

        // 1. Cập nhật QuizSet #4 (có 5 câu hỏi) cho Lesson#1
        console.log('📝 Gắn QuizSet#4 vào Lesson#1 (Bảng chữ cái A-Z)...');
        await connection.query('UPDATE quiz_sets SET lesson_id = 1 WHERE id = 4');
        console.log('   ✅ Hoàn thành!');

        // 2. Cập nhật QuizSet #6 (có 5 câu hỏi) cho Lesson#2  
        console.log('📝 Gắn QuizSet#6 vào Lesson#2 (Số đếm 0-10)...');
        await connection.query('UPDATE quiz_sets SET lesson_id = 2 WHERE id = 6');
        console.log('   ✅ Hoàn thành!');

        // 3. Cập nhật QuizSet #7 cho Lesson#3
        console.log('📝 Gắn QuizSet#7 vào Lesson#3 (Thời gian)...');
        await connection.query('UPDATE quiz_sets SET lesson_id = 3 WHERE id = 7');
        console.log('   ✅ Hoàn thành!');

        // 4. Cập nhật QuizSet #8 cho Lesson#4
        console.log('📝 Gắn QuizSet#8 vào Lesson#4...');
        await connection.query('UPDATE quiz_sets SET lesson_id = 4 WHERE id = 8');
        console.log('   ✅ Hoàn thành!');

        // 5. Cập nhật QuizSet #9 cho Lesson#5
        console.log('📝 Gắn QuizSet#9 vào Lesson#5...');
        await connection.query('UPDATE quiz_sets SET lesson_id = 5 WHERE id = 9');
        console.log('   ✅ Hoàn thành!');

        // Xóa QuizSet #1, #2 không dùng (không có câu hỏi)
        console.log('\n🗑️  Xóa QuizSet#1 và #2 (rỗng, không dùng)...');
        await connection.query('DELETE FROM quiz_sets WHERE id IN (1, 2)');
        console.log('   ✅ Đã xóa!');

        // Kiểm tra lại
        console.log('\n📊 Kiểm tra lại kết quả:');
        const [result] = await connection.query(`
      SELECT qs.id as quiz_set_id, qs.lesson_id, l.title as lesson_title, 
             COUNT(q.id) as quiz_count
      FROM quiz_sets qs
      LEFT JOIN lessons l ON qs.lesson_id = l.id
      LEFT JOIN quizzes q ON q.quiz_set_id = qs.id AND q.deletedAt IS NULL
      WHERE qs.lesson_id IS NOT NULL
      GROUP BY qs.id
      ORDER BY qs.lesson_id
      LIMIT 10
    `);

        console.log('Lessons có quiz:');
        result.forEach((row, i) => {
            console.log(`   ${i + 1}. Lesson#${row.lesson_id} "${row.lesson_title}" → ${row.quiz_count} câu hỏi (QuizSet#${row.quiz_set_id})`);
        });

        console.log('\n✅ HOÀN THÀNH! Quiz đã được gắn vào lessons.');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixQuizLinks();
