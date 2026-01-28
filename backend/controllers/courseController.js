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

