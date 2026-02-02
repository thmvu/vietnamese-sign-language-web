import db from '../config/database.js';

class Quiz {
  constructor(data) {
    this.id = data.id;
    this.lesson_id = data.lesson_id;
    this.question = data.question;
    this.options = typeof data.options === 'string' ? JSON.parse(data.options) : data.options;
    this.correct_answer = data.correct_answer;
    this.created_at = data.createdAt || data.created_at;
    this.updated_at = data.updatedAt || data.updated_at;
  }

  static async findAll({ where = {} } = {}) {
    let query = 'SELECT * FROM quizzes WHERE deletedAt IS NULL';
    const values = [];

    const keys = Object.keys(where);
    if (keys.length > 0) {
      query += ' AND ' + keys.map(key => `${key} = ?`).join(' AND ');
      values.push(...keys.map(key => where[key]));
    }

    const [rows] = await db.query(query, values);
    return rows.map(row => new Quiz(row));
  }

  static async findByPk(id) {
    const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ? AND deletedAt IS NULL', [id]);
    if (rows.length === 0) return null;
    return new Quiz(rows[0]);
  }

  static async create(data) {
    const { lesson_id, quiz_set_id, question, options, correct_answer } = data;
    const optionsJson = JSON.stringify(options);

    const [result] = await db.query(
      'INSERT INTO quizzes (lesson_id, quiz_set_id, question, options, correct_answer, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [lesson_id, quiz_set_id, question, optionsJson, correct_answer]
    );
    return Quiz.findByPk(result.insertId);
  }

  async update(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this;

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => {
      if (key === 'options' && typeof data[key] !== 'string') {
        return JSON.stringify(data[key]);
      }
      return data[key];
    });
    values.push(this.id);

    await db.query(`UPDATE quizzes SET ${updates}, updatedAt = NOW() WHERE id = ?`, values);

    keys.forEach(key => this[key] = data[key]);
    return this;
  }

  async destroy() {
    await db.query('UPDATE quizzes SET deletedAt = NOW() WHERE id = ?', [this.id]);
  }

  static async destroyAll({ where = {} }) {
    const keys = Object.keys(where);
    if (keys.length === 0) return; // Safety: don't delete everything without condition

    const conditions = keys.map(key => `${key} = ?`).join(' AND ');
    const values = keys.map(key => where[key]);

    await db.query(`UPDATE quizzes SET deletedAt = NOW() WHERE ${conditions}`, values);
  }

  toJSON() {
    return { ...this };
  }
}

export default Quiz;