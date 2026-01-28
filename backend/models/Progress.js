import db from '../config/database.js';

class Progress {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.lesson_id = data.lesson_id;
    this.completed_videos = typeof data.completed_videos === 'string' ? JSON.parse(data.completed_videos) : (data.completed_videos || []);
    this.quiz_score = data.quiz_score || 0;
    this.practice_score = data.practice_score || 0;
    this.last_access = data.last_access || new Date();
    this.created_at = data.createdAt || data.created_at;
    this.updated_at = data.updatedAt || data.updated_at;
  }

  static async findOne({ where }) {
    if (!where) return null;

    // Simple helper for AND conditions
    const keys = Object.keys(where);
    const conditions = keys.map(key => `${key} = ?`).join(' AND ');
    const values = keys.map(key => where[key]);

    const [rows] = await db.query(`SELECT * FROM progress WHERE ${conditions} LIMIT 1`, values);
    if (rows.length === 0) return null;
    return new Progress(rows[0]);
  }

  static async findAll({ where = {} } = {}) {
    let query = 'SELECT * FROM progress';
    const values = [];

    const keys = Object.keys(where);
    if (keys.length > 0) {
      query += ' WHERE ' + keys.map(key => `${key} = ?`).join(' AND ');
      values.push(...keys.map(key => where[key]));
    }

    query += ' ORDER BY last_access DESC';

    const [rows] = await db.query(query, values);
    return rows.map(row => new Progress(row));
  }

  static async create(data) {
    const { user_id, lesson_id, completed_videos, quiz_score, practice_score } = data;
    const completedVideosJson = JSON.stringify(completed_videos || []);

    // Check existing
    const existing = await Progress.findOne({ where: { user_id, lesson_id } });
    if (existing) {
      throw new Error('Progress record already exists for this user and lesson');
    }

    const [result] = await db.query(
      'INSERT INTO progress (user_id, lesson_id, completed_videos, quiz_score, practice_score, last_access, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
      [user_id, lesson_id, completedVideosJson, quiz_score || 0, practice_score || 0]
    );
    return Progress.findOne({ where: { id: result.insertId } });
  }

  async update(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this;

    const updates = keys.map(key => `${key} = ?`);
    const values = keys.map(key => {
      if (key === 'completed_videos' && typeof data[key] !== 'string') {
        return JSON.stringify(data[key]);
      }
      return data[key];
    });

    // Always update last_access and updatedAt
    updates.push('last_access = NOW()');
    updates.push('updatedAt = NOW()');

    const setClause = updates.join(', ');

    values.push(this.id);

    await db.query(`UPDATE progress SET ${setClause} WHERE id = ?`, values);

    // Reload to get fresh data including timestamps
    const updated = await Progress.findOne({ where: { id: this.id } });
    Object.assign(this, updated);

    return this;
  }

  toJSON() {
    return { ...this };
  }
}

export default Progress;