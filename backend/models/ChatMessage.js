import db from '../config/database.js';

class ChatMessage {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.role = data.role;
        this.content = data.content;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static async create({ user_id, role, content }) {
        const [result] = await db.query(
            'INSERT INTO chat_messages (user_id, role, content, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
            [user_id, role, content]
        );
        return this.findByPk(result.insertId);
    }

    static async findByPk(id) {
        const [rows] = await db.query('SELECT * FROM chat_messages WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new ChatMessage(rows[0]);
    }

    static async findAllByUserId(user_id) {
        const [rows] = await db.query(
            'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY createdAt ASC',
            [user_id]
        );
        return rows.map(row => new ChatMessage(row));
    }

    static async deleteByUserId(user_id) {
        await db.query('DELETE FROM chat_messages WHERE user_id = ?', [user_id]);
    }
}

export default ChatMessage;
