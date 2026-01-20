const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

const saveProgress = async (req, res) => {
  try {
    const { lesson_id, completed_videos, quiz_score, practice_score } = req.body;
    const user_id = req.user.id;

    if (!lesson_id) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    const [progress, created] = await Progress.findOrCreate({
      where: { user_id, lesson_id },
      defaults: {
        completed_videos: completed_videos || [],
        quiz_score: quiz_score || 0,
        practice_score: practice_score || 0,
        last_access: new Date()
      }
    });

    if (!created) {
      const updateData = { last_access: new Date() };
      
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

const getMyProgress = async (req, res) => {
  try {
    const user_id = req.user.id;

    const progressList = await Progress.findAll({
      where: { user_id },
      include: [{
        model: Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'category', 'level', 'thumbnail']
      }],
      order: [['last_access', 'DESC']]
    });

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

const getAllProgress = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Progress.findAndCountAll({
      include: [
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'] },
        { model: require('../models/User'), as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_access', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        progress: rows,
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

const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progressList = await Progress.findAll({
      where: { user_id: userId },
      include: [{
        model: Lesson,
        as: 'lesson',
        attributes: ['id', 'title', 'category', 'level']
      }],
      order: [['last_access', 'DESC']]
    });

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

module.exports = {
  saveProgress,
  getMyProgress,
  getAllProgress,
  getUserProgress
};