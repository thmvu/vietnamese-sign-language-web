
import db from './config/database.js';

const createTable = async () => {
    try {
        console.log('Creating user_courses table...');
        await db.query(`
      CREATE TABLE IF NOT EXISTS user_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_course (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
        console.log('Table user_courses created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create table:', error);
        process.exit(1);
    }
};

createTable();
