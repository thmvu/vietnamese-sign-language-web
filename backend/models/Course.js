import db from '../config/database.js';

class Course {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.level = data.level || 'beginner';
        this.thumbnail = data.thumbnail;
        this.display_order = data.display_order || 0;
        this.created_at = data.createdAt || data.created_at;
        this.updated_at = data.updatedAt || data.updated_at;
    }

    static async findAll({ where = {}, order = [], limit, offset } = {}) {
        let query = 'SELECT * FROM courses WHERE deletedAt IS NULL';
        const values = [];

        const keys = Object.keys(where);
        if (keys.length > 0) {
            query += ' AND ' + keys.map(key => `${key} = ?`).join(' AND ');
            values.push(...keys.map(key => where[key]));
        }

        if (order.length > 0) {
            query += ' ORDER BY ' + order.map(pair => `${pair[0]} ${pair[1]}`).join(', ');
        } else {
            query += ' ORDER BY display_order ASC';
        }

        if (limit) {
            query += ' LIMIT ?';
            values.push(limit);
        }

        if (offset) {
            query += ' OFFSET ?';
            values.push(offset);
        }

        const [rows] = await db.query(query, values);
        return rows.map(row => new Course(row));
    }

    static async count({ where = {} } = {}) {
        let query = 'SELECT COUNT(*) as total FROM courses WHERE deletedAt IS NULL';
        const values = [];

        const keys = Object.keys(where);
        if (keys.length > 0) {
            query += ' AND ' + keys.map(key => `${key} = ?`).join(' AND ');
            values.push(...keys.map(key => where[key]));
        }

        const [rows] = await db.query(query, values);
        return rows[0].total;
    }

    static async findByPk(id) {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ? AND deletedAt IS NULL', [id]);
        if (rows.length === 0) return null;
        return new Course(rows[0]);
    }

    static async create(data) {
        const { title, description, level, thumbnail, display_order } = data;
        const [result] = await db.query(
            'INSERT INTO courses (title, description, level, thumbnail, display_order, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [title, description, level || 'beginner', thumbnail, display_order || 0]
        );
        return Course.findByPk(result.insertId);
    }

    async update(data) {
        const keys = Object.keys(data);
        if (keys.length === 0) return this;

        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => data[key]);
        values.push(this.id);

        await db.query(`UPDATE courses SET ${updates}, updatedAt = NOW() WHERE id = ?`, values);

        keys.forEach(key => this[key] = data[key]);
        return this;
    }

    async destroy() {
        await db.query('UPDATE courses SET deletedAt = NOW() WHERE id = ?', [this.id]);
    }

    toJSON() {
        return { ...this };
    }
}

export default Course;
