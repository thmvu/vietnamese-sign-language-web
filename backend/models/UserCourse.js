import db from '../config/database.js';

class UserCourse {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.course_id = data.course_id;
        this.is_completed = data.is_completed || false;
        this.completed_at = data.completed_at || null;
        this.created_at = data.created_at || new Date();
        this.updated_at = data.updated_at || new Date();
    }

    static async findOne({ where }) {
        if (!where) return null;

        const keys = Object.keys(where);
        const conditions = keys.map(key => `${key} = ?`).join(' AND ');
        const values = keys.map(key => where[key]);

        const [rows] = await db.query(`SELECT * FROM user_courses WHERE ${conditions} LIMIT 1`, values);
        if (rows.length === 0) return null;
        return new UserCourse(rows[0]);
    }

    static async create(data) {
        const { user_id, course_id, is_completed, completed_at } = data;

        // Check existing
        const existing = await UserCourse.findOne({ where: { user_id, course_id } });
        if (existing) {
            if (!existing.is_completed && is_completed) {
                // Update existing to completed
                await db.query(
                    'UPDATE user_courses SET is_completed = ?, completed_at = ?, updatedAt = NOW() WHERE id = ?',
                    [true, completed_at || new Date(), existing.id]
                );
                return UserCourse.findOne({ where: { id: existing.id } });
            }
            return existing;
        }

        const [result] = await db.query(
            'INSERT INTO user_courses (user_id, course_id, is_completed, completed_at, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [user_id, course_id, is_completed || false, completed_at || null]
        );
        return UserCourse.findOne({ where: { id: result.insertId } });
    }
}

export default UserCourse;
