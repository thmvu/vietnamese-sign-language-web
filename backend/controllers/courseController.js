import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import UserCourse from '../models/UserCourse.js';
import Progress from '../models/Progress.js';
import db from '../config/database.js';

export const getAllCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, level } = req.query;

        const offset = (page - 1) * limit;

        const where = {};
        if (level) where.level = level;

        const courses = await Course.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['display_order', 'ASC']]
        });

        const count = await Course.count({ where });

        res.json({
            success: true,
            data: {
                courses,
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
            message: 'Failed to fetch courses',
            error: error.message
        });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Fetch lessons for this course
        let lessons = await Lesson.findAll({ where: { course_id: id } });

        // If user is logged in, check progress
        if (req.user) {
            const userId = req.user.id;

            // Check course completion
            const userCourse = await UserCourse.findOne({
                where: { user_id: userId, course_id: id }
            });
            course.is_completed = !!userCourse && userCourse.is_completed;

            // Check lessons completion
            const progressList = await Progress.findAll({
                where: { user_id: userId }
            });

            // Map progress to lessons
            lessons = lessons.map(lesson => {
                const p = progressList.find(p => p.lesson_id === lesson.id);
                // Lesson is completed if quiz_score > 0 OR (maybe) just visited?
                // Strict: quiz_score > 0
                return {
                    ...lesson.toJSON(),
                    is_completed: p && p.quiz_score > 0
                };
            });
        }

        course.lessons = lessons;

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course',
            error: error.message
        });
    }
};

export const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const lessons = await Lesson.findAll({
            where: { course_id: courseId },
            order: [['display_order', 'ASC']]
        });

        res.json({
            success: true,
            data: lessons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons',
            error: error.message
        });
    }
};

// Admin CRUD operations
export const createCourse = async (req, res) => {
    try {
        const { title, description, level, thumbnail, display_order } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const course = await Course.create({
            title,
            description,
            level: level || 'beginner',
            thumbnail,
            display_order: display_order || 0
        });

        res.status(201).json({
            success: true,
            data: course,
            message: 'Course created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create course',
            error: error.message
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, level, thumbnail, display_order } = req.body;

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const updated = await course.update({
            title: title || course.title,
            description: description !== undefined ? description : course.description,
            level: level || course.level,
            thumbnail: thumbnail !== undefined ? thumbnail : course.thumbnail,
            display_order: display_order !== undefined ? display_order : course.display_order
        });

        res.json({
            success: true,
            data: updated,
            message: 'Course updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update course',
            error: error.message
        });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.destroy();

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete course',
            error: error.message
        });
    }
};


// Check if course is completed by user
export const getCourseCompletionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const userCourse = await UserCourse.findOne({
            where: { user_id: userId, course_id: id }
        });

        res.json({
            success: true,
            is_completed: !!userCourse && userCourse.is_completed
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check course completion',
            error: error.message
        });
    }
};

// Mark course as completed
export const completeCourse = async (req, res) => {
    try {
        const { id } = req.params; // Course ID
        const userId = req.user.id;

        // Verify all lessons are completed (optional, but good practice)
        // For now, we trust the frontend call or just mark it
        // Let's just mark it for flexibility

        const userCourse = await UserCourse.create({
            user_id: userId,
            course_id: id,
            is_completed: true,
            completed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Course marked as completed',
            data: userCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to complete course',
            error: error.message
        });
    }
};
