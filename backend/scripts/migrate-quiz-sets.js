
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

async function migrate() {
    try {
        console.log('Starting Quiz Sets migration...');

        // 1. Create quiz_sets table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_sets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        lesson_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt DATETIME NULL
      )
    `);
        console.log('Created quiz_sets table');

        // 2. Add quiz_set_id column to quizzes table if not exists
        try {
            await pool.query(`ALTER TABLE quizzes ADD COLUMN quiz_set_id INT NULL AFTER lesson_id`);
            console.log('Added quiz_set_id column to quizzes table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('quiz_set_id column already exists');
            } else {
                throw e;
            }
        }

        // 3. Migrate existing data (Create a Quiz Set for each Lesson that has Quizzes)
        // Find unique lesson_ids in quizzes
        const [lessons] = await pool.query(`SELECT DISTINCT lesson_id FROM quizzes WHERE deletedAt IS NULL AND quiz_set_id IS NULL AND lesson_id IS NOT NULL`);

        for (const l of lessons) {
            // Create Quiz Set
            const [res] = await pool.query('INSERT INTO quiz_sets (title, lesson_id) VALUES (?, ?)', [`Bộ câu hỏi cho bài học ${l.lesson_id}`, l.lesson_id]);
            const quizSetId = res.insertId;

            // Update quizzes
            await pool.query('UPDATE quizzes SET quiz_set_id = ? WHERE lesson_id = ?', [quizSetId, l.lesson_id]);
            console.log(`Migrated quizzes for lesson ${l.lesson_id} to Quiz Set ${quizSetId}`);
        }

        // 4. Make lesson_id nullable in quizzes? (Actually we keep it for now as redundancy or remove later)
        // It's safer to keep it nullable but ignore it.
        await pool.query(`ALTER TABLE quizzes MODIFY COLUMN lesson_id INT NULL`);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
