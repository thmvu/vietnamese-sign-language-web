import Lesson from '../models/Lesson.js';
import Video from '../models/Video.js';
import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';

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

    // Quiz Set Logic: Priority to assigned set
    let quizzes = [];
    if (lesson.quiz_set_id) {
      quizzes = await Quiz.findAll({ where: { quiz_set_id: lesson.quiz_set_id } });
    } else {
      quizzes = await Quiz.findAll({ where: { lesson_id: id } });
    }

    // --- NEW: Find Next & Previous Lesson ---
    // Previous: Same course, order < current, take largest order
    const [prevRows] = await Lesson.findAll({
      where: {
        course_id: lesson.course_id
        // We need custom operator logic here, but Lesson.findAll simple helper doesn't support complex ops easily
        // Let's use raw query or logic since our Model is simple
      },
      order: [['display_order', 'DESC']]
    });

    // Let's use specific queries for next/prev to be efficient
    const allLessonsInCourse = await Lesson.findAll({
      where: { course_id: lesson.course_id },
      order: [['display_order', 'ASC']]
    });

    // Check progress for sidebar
    let completedLessonIds = [];
    if (req.user) {
      const progressList = await Progress.findAll({
        where: { user_id: req.user.id }
      });
      completedLessonIds = progressList
        .filter(p => p.quiz_score > 0)
        .map(p => p.lesson_id);
    }

    const currentIndex = allLessonsInCourse.findIndex(l => l.id == id);
    const prevLesson = currentIndex > 0 ? allLessonsInCourse[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessonsInCourse.length - 1 ? allLessonsInCourse[currentIndex + 1] : null;

    lesson.videos = videos;
    lesson.quizzes = quizzes;
    lesson.prev_lesson_id = prevLesson ? prevLesson.id : null;
    lesson.next_lesson_id = nextLesson ? nextLesson.id : null;
    lesson.course_lessons = allLessonsInCourse.map(l => ({
      id: l.id,
      title: l.title,
      display_order: l.display_order,
      is_completed: completedLessonIds.includes(l.id)
    }));

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
    const { video_url, ...lessonUpdates } = req.body;

    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // 1. Update Lesson fields
    await lesson.update(lessonUpdates);

    // 2. Update Video if video_url is provided
    if (video_url !== undefined) {
      const existingVideos = await Video.findAll({ where: { lesson_id: id } });
      if (existingVideos.length > 0) {
        // Update first video
        await existingVideos[0].update({ video_url });
      } else if (video_url) {
        // Create new video if none existed
        await Video.create({
          lesson_id: id,
          title: `Video - ${lesson.title}`,
          video_url,
          display_order: 0,
          duration: 0
        });
      }
    }

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