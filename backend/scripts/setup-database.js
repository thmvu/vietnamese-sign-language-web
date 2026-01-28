import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Video from '../models/Video.js';
import Quiz from '../models/Quiz.js';
import db from '../config/database.js';

dotenv.config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Step 1: Create database if not exists
    console.log('📦 Step 1: Creating database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    await connection.query(`
      CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log(`✅ Database "${process.env.DB_NAME}" created/verified\n`);
    await connection.end();

    // Step 2: Create Tables
    console.log('📦 Step 2: Creating tables...');

    // Users Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT 'default-avatar.png',
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        refreshToken TEXT,
        deletedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Courses Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        thumbnail VARCHAR(255),
        display_order INT DEFAULT 0,
        deletedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Lessons Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category ENUM('alphabet', 'numbers', 'common', 'advanced') NOT NULL,
        level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        thumbnail VARCHAR(255),
        display_order INT DEFAULT 0,
        deletedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Videos Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        duration INT COMMENT 'Duration in seconds',
        display_order INT DEFAULT 0,
        deletedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `);

    // Quizzes Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        question TEXT NOT NULL,
        options JSON NOT NULL COMMENT 'Array of options',
        correct_answer VARCHAR(10) NOT NULL COMMENT 'Index or letter',
        deletedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `);

    // Progress Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        completed_videos JSON,
        quiz_score INT DEFAULT 0,
        practice_score INT DEFAULT 0,
        last_access DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_lesson (user_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tables created successfully\n');

    // Step 3: Create admin user
    console.log('📦 Step 3: Creating admin user...\n');

    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: '123',
        role: 'admin'
      });

      console.log('✅ Admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: 123\n');
    } else {
      console.log('ℹ️  Admin user already exists\n');
    }

    // Create a regular test user too
    const userExists = await User.findOne({ where: { email: 'user@example.com' } });

    if (!userExists) {
      await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: '123',
        role: 'user'
      });

      console.log('✅ Test user created');
      console.log('   Email: user@example.com');
      console.log('   Password: 123\n');
    }

    // Step 4: Seed sample data
    console.log('📦 Step 4: Seeding sample data...');

    const courseCount = await Course.count();

    if (courseCount === 0) {
      // Create courses
      const course1 = await Course.create({
        title: 'Cơ bản - Khởi đầu với Thủ ngữ',
        description: 'Học những kiến thức nền tảng về thủ ngữ Việt Nam, bao gồm bảng chữ cái và số đếm',
        level: 'beginner',
        thumbnail: 'course-beginner.jpg',
        display_order: 1
      });

      const course2 = await Course.create({
        title: 'Trung cấp - Giao tiếp hằng ngày',
        description: 'Học các cụm từ và câu thông dụng để giao tiếp trong cuộc sống hằng ngày',
        level: 'intermediate',
        thumbnail: 'course-intermediate.jpg',
        display_order: 2
      });

      console.log('✅ Created sample courses');

      // Create lessons for course 1
      const l1 = await Lesson.create({
        course_id: course1.id,
        title: 'Bảng chữ cái A-Z',
        description: 'Học 26 chữ cái trong thủ ngữ Việt Nam',
        category: 'alphabet',
        level: 'beginner',
        thumbnail: 'alphabet.jpg',
        display_order: 1
      });

      const l2 = await Lesson.create({
        course_id: course1.id,
        title: 'Số đếm 0-10',
        description: 'Học cách biểu diễn số từ 0 đến 10',
        category: 'numbers',
        level: 'beginner',
        thumbnail: 'numbers.jpg',
        display_order: 2
      });

      const l3 = await Lesson.create({
        course_id: course2.id,
        title: 'Chào hỏi cơ bản',
        description: 'Các cụm từ chào hỏi thông dụng',
        category: 'common',
        level: 'intermediate',
        thumbnail: 'greetings.jpg',
        display_order: 1
      });

      console.log('✅ Created sample lessons');

      // Create videos
      await Video.create({
        lesson_id: l1.id,
        title: 'Chữ A',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 60,
        display_order: 1
      });

      await Video.create({
        lesson_id: l1.id,
        title: 'Chữ B',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 65,
        display_order: 2
      });

      await Video.create({
        lesson_id: l2.id,
        title: 'Số 0',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 45,
        display_order: 1
      });

      console.log('✅ Created sample videos');

      // Create quizzes
      await Quiz.create({
        lesson_id: l1.id,
        question: 'Thủ ngữ nào biểu thị chữ "A"?',
        options: [
          'Nắm tay, ngón cái thẳng ra bên cạnh',
          'Tất cả ngón tay duỗi thẳng',
          'Nắm tay hoàn toàn',
          'Chỉ ngón trỏ thẳng lên'
        ],
        correct_answer: '0'
      });

      await Quiz.create({
        lesson_id: l2.id,
        question: 'Thủ ngữ biểu thị số "0" là gì?',
        options: [
          'Nắm tay',
          'Tạo hình chữ O bằng ngón cái và ngón trỏ',
          'Duỗi thẳng tất cả các ngón',
          'Chỉ ngón trỏ thẳng lên'
        ],
        correct_answer: '1'
      });

      console.log('✅ Created sample quizzes\n');
    } else {
      console.log('ℹ️  Sample data already exists\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Database setup completed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 Login Credentials:');
    console.log('   🔑 Admin:');
    console.log('      Email: admin@example.com');
    console.log('      Password: 123\n');
    console.log('   👤 User:');
    console.log('      Email: user@example.com');
    console.log('      Password: 123\n');

    console.log('🚀 You can now start the server with: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

setupDatabase();