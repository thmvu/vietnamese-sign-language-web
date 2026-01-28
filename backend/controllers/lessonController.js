import Lesson from '../models/Lesson.js';
import Video from '../models/Video.js';
import Quiz from '../models/Quiz.js';

export const getAllLessons = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, sort = 'display_order' } = req.query;

    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (level) where.level = level;

    const rows = await Lesson.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, 'ASC']]
    });

    const count = await Lesson.count({ where });

    res.json({
      success: true,
      data: {
        lessons: rows,
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
      message: 'Failed to fetch lessons',
      error: error.message
    });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Fetch related videos and quizzes
    const videos = await Video.findAll({ where: { lesson_id: id } });
    const quizzes = await Quiz.findAll({ where: { lesson_id: id } });

    lesson.videos = videos;
    lesson.quizzes = quizzes;

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

// Admin CRUD operations
export const createLesson = async (req, res) => {
  try {
    const { course_id, title, description, category, level, thumbnail, display_order, video_url } = req.body;

    console.log('Creating lesson:', req.body);

    if (!title || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Title and course_id are required'
      });
    }

    const lesson = await Lesson.create({
      course_id,
      title,
      description,
      category: category || 'alphabet',
      level: level || 'beginner',
      thumbnail,
      display_order: display_order || 0
    });

    // Auto-create video if URL provided
    if (video_url) {
      try {
        await Video.create({
          lesson_id: lesson.id,
          title: `Video - ${title}`,
          video_url: video_url,
          display_order: 0,
          duration: 0
        });
      } catch (videoError) {
        console.error('Failed to auto-create video:', videoError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Create Lesson Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error.message
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    await lesson.update(updates);

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
      error: error.message
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson',
      error: error.message
    });
  }
};