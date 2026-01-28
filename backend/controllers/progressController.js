import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import db from '../config/database.js';

export const saveProgress = async (req, res) => {
  try {
    const { lesson_id, completed_videos, quiz_score, practice_score } = req.body;
    const user_id = req.user.id;

    if (!lesson_id) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    // Check if exists
    let progress = await Progress.findOne({ where: { user_id, lesson_id } });

    if (!progress) {
      progress = await Progress.create({
        user_id,
        lesson_id,
        completed_videos: completed_videos || [],
        quiz_score: quiz_score || 0,
        practice_score: practice_score || 0
      });
    } else {
      const updateData = {};
      if (completed_videos) updateData.completed_videos = completed_videos;
      if (quiz_score !== undefined) updateData.quiz_score = quiz_score;
      if (practice_score !== undefined) updateData.practice_score = practice_score;

      await progress.update(updateData);
    }

    res.json({
      success: true,
      message: 'Progress saved successfully',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save progress',
      error: error.message
    });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT p.*, 
             l.title as lesson_title, l.category as lesson_category, 
             l.level as lesson_level, l.thumbnail as lesson_thumbnail 
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = ?
      ORDER BY p.last_access DESC
    `;

    const [rows] = await db.query(query, [user_id]);

    // Format the response to match previous structure (nesting lesson)
    const progressList = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      lesson_id: row.lesson_id,
      completed_videos: typeof row.completed_videos === 'string' ? JSON.parse(row.completed_videos) : row.completed_videos,
      quiz_score: row.quiz_score,
      practice_score: row.practice_score,
      last_access: row.last_access,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lesson: {
        id: row.lesson_id,
        title: row.lesson_title,
        category: row.lesson_category,
        level: row.lesson_level,
        thumbnail: row.lesson_thumbnail
      }
    }));

    res.json({
      success: true,
      data: progressList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

export const getAllProgress = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT p.*, 
             l.title as lesson_title,
             u.name as user_name, u.email as user_email
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN users u ON p.user_id = u.id
      ORDER BY p.last_access DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM progress`;
    const [countResult] = await db.query(countQuery);
    const count = countResult[0].total;

    const [rows] = await db.query(query, [parseInt(limit), parseInt(offset)]);

    const progressList = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      lesson_id: row.lesson_id,
      completed_videos: typeof row.completed_videos === 'string' ? JSON.parse(row.completed_videos) : row.completed_videos,
      quiz_score: row.quiz_score,
      practice_score: row.practice_score,
      last_access: row.last_access,
      lesson: {
        id: row.lesson_id,
        title: row.lesson_title
      },
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      }
    }));

    res.json({
      success: true,
      data: {
        progress: progressList,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT p.*, 
             l.title as lesson_title, l.category as lesson_category, l.level as lesson_level
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = ?
      ORDER BY p.last_access DESC
    `;

    const [rows] = await db.query(query, [userId]);

    const progressList = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      lesson_id: row.lesson_id,
      completed_videos: typeof row.completed_videos === 'string' ? JSON.parse(row.completed_videos) : row.completed_videos,
      quiz_score: row.quiz_score,
      practice_score: row.practice_score,
      last_access: row.last_access,
      lesson: {
        id: row.lesson_id,
        title: row.lesson_title,
        category: row.lesson_category,
        level: row.lesson_level
      }
    }));

    res.json({
      success: true,
      data: progressList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
};