import db from '../config/database.js';

class QuizSet {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.lesson_id = data.lesson_id;
        this.created_at = data.createdAt || data.created_at;
        this.updated_at = data.updatedAt || data.updated_at;
    }

    static async findAll({ where = {} } = {}) {
        let query = 'SELECT * FROM quiz_sets WHERE deletedAt IS NULL';
        const values = [];

        const keys = Object.keys(where);
        if (keys.length > 0) {
            query += ' AND ' + keys.map(key => `${key} = ?`).join(' AND ');
            values.push(...keys.map(key => where[key]));
        }

        query += ' ORDER BY id DESC';

        const [rows] = await db.query(query, values);
        return rows.map(row => new QuizSet(row));
    }

    static async findOne({ where = {} } = {}) {
        const sets = await this.findAll({ where });
        return sets.length > 0 ? sets[0] : null;
    }

    static async findByPk(id) {
        const [rows] = await db.query('SELECT * FROM quiz_sets WHERE id = ? AND deletedAt IS NULL', [id]);
        if (rows.length === 0) return null;
        return new QuizSet(rows[0]);
    }

    static async create(data) {
        const { title, description, lesson_id } = data;
        const [result] = await db.query(
            'INSERT INTO quiz_sets (title, description, lesson_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [title, description, lesson_id]
        );
        return QuizSet.findByPk(result.insertId);
    }

    async update(data) {
        const keys = Object.keys(data);
        if (keys.length === 0) return this;

        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => data[key]);
        values.push(this.id);

        await db.query(`UPDATE quiz_sets SET ${updates}, updated_at = NOW() WHERE id = ?`, values);

        keys.forEach(key => this[key] = data[key]);
        return this;
    }

    async destroy() {
        await db.query('UPDATE quiz_sets SET deletedAt = NOW() WHERE id = ?', [this.id]);
    }

    toJSON() {
        return { ...this };
    }
}

export default QuizSet;
