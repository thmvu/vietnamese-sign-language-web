import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
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
        const lessons = await Lesson.findAll({ where: { course_id: id } });
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
