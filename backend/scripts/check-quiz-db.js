// Script kiểm tra database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkDatabase() {
    let connection;
    try {
        console.log('🔍 Đang kết nối database...');

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
        console.log('✅ Kết nối thành công!\n');

        // 1. Kiểm tra bảng quiz_sets
        console.log('📋 Kiểm tra bảng QUIZ_SETS:');
        const [quizSets] = await connection.query('SELECT COUNT(*) as count FROM quiz_sets');
        console.log(`   Tổng số quiz sets: ${quizSets[0].count}`);

        const [quizSetSample] = await connection.query('SELECT * FROM quiz_sets LIMIT 5');
        if (quizSetSample.length > 0) {
            console.log('   Mẫu dữ liệu:');
            quizSetSample.forEach((set, i) => {
                console.log(`   ${i + 1}. ID=${set.id}, Lesson=${set.lesson_id}, Title="${set.title}"`);
            });
        } else {
            console.log('   ⚠️  CHƯA CÓ DỮ LIỆU!');
        }

        // 2. Kiểm tra bảng quizzes
        console.log('\n📋 Kiểm tra bảng QUIZZES:');
        const [quizzes] = await connection.query('SELECT COUNT(*) as count FROM quizzes WHERE deletedAt IS NULL');
        console.log(`   Tổng số quizzes: ${quizzes[0].count}`);

        const [quizSample] = await connection.query('SELECT * FROM quizzes WHERE deletedAt IS NULL LIMIT 5');
        if (quizSample.length > 0) {
            console.log('   Mẫu dữ liệu:');
            quizSample.forEach((quiz, i) => {
                console.log(`   ${i + 1}. ID=${quiz.id}, QuizSet=${quiz.quiz_set_id}, Q="${quiz.question.substring(0, 50)}..."`);
            });
        } else {
            console.log('   ⚠️  CHƯA CÓ DỮ LIỆU!');
        }

        // 3. Kiểm tra quan hệ quiz_sets -> lessons
        console.log('\n📋 Kiểm tra liên kết QUIZ_SETS với LESSONS:');
        const [linked] = await connection.query(`
      SELECT qs.id as quiz_set_id, qs.lesson_id, l.title as lesson_title, 
             COUNT(q.id) as quiz_count
      FROM quiz_sets qs
      LEFT JOIN lessons l ON qs.lesson_id = l.id
      LEFT JOIN quizzes q ON q.quiz_set_id = qs.id AND q.deletedAt IS NULL
      GROUP BY qs.id
      LIMIT 10
    `);

        if (linked.length > 0) {
            console.log('   QuizSets và số câu hỏi:');
            linked.forEach((row, i) => {
                console.log(`   ${i + 1}. QuizSet#${row.quiz_set_id} → Lesson#${row.lesson_id} (${row.lesson_title}) → ${row.quiz_count} câu hỏi`);
            });
        } else {
            console.log('   ⚠️  KHÔNG TÌM THẤY LIÊN KẾT!');
        }

        // 4. Kiểm tra lessons
        console.log('\n📋 Kiểm tra LESSONS:');
        const [lessons] = await connection.query('SELECT id, title, course_id FROM lessons LIMIT 10');
        console.log(`   Tổng số lessons (mẫu): ${lessons.length}`);
        lessons.forEach((lesson, i) => {
            console.log(`   ${i + 1}. Lesson#${lesson.id} - "${lesson.title}" (Course ${lesson.course_id})`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Đã đóng kết nối database');
        }
    }
}

checkDatabase();
