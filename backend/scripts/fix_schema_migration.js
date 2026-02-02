import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixSchema() {
    console.log('🚀 Starting Schema Migration via ALTER TABLE...\n');

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

        // 1. Create quiz_sets table if not exists
        console.log('📦 Step 1: Checking "quiz_sets" table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_sets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_id INT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        lesson_id INT NULL,
        deletedAt DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('   ✅ Table "quiz_sets" verified/created.');

        // 2. ALTER TABLE lessons
        console.log('\n📦 Step 2: Checking "lessons" table for "quiz_set_id"...');
        const [lessonColumns] = await connection.query("SHOW COLUMNS FROM lessons LIKE 'quiz_set_id'");
        if (lessonColumns.length === 0) {
            console.log('   ⚠️ Column missing. Running ALTER TABLE...');
            await connection.query(`
            ALTER TABLE lessons 
            ADD COLUMN quiz_set_id INT NULL AFTER course_id
        `);
            console.log('   ✅ Added column "quiz_set_id" to "lessons".');
        } else {
            console.log('   ℹ️ Column "quiz_set_id" already exists in "lessons".');
        }

        // 3. ALTER TABLE quizzes
        console.log('\n📦 Step 3: Checking "quizzes" table for "quiz_set_id"...');
        const [quizColumns] = await connection.query("SHOW COLUMNS FROM quizzes LIKE 'quiz_set_id'");
        if (quizColumns.length === 0) {
            console.log('   ⚠️ Column missing. Running ALTER TABLE...');
            await connection.query(`
            ALTER TABLE quizzes 
            ADD COLUMN quiz_set_id INT NULL AFTER lesson_id
        `);
            console.log('   ✅ Added column "quiz_set_id" to "quizzes".');
        } else {
            console.log('   ℹ️ Column "quiz_set_id" already exists in "quizzes".');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration Failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
