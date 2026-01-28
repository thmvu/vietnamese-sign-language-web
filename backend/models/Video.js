import db from '../config/database.js';

class Video {
  constructor(data) {
    this.id = data.id;
    this.lesson_id = data.lesson_id;
    this.title = data.title;
    this.video_url = data.video_url;
    this.duration = data.duration;
    this.display_order = data.display_order || 0;
    this.created_at = data.createdAt || data.created_at;
    this.updated_at = data.updatedAt || data.updated_at;
  }

  static async findAll({ where = {} } = {}) {
    let query = 'SELECT * FROM videos WHERE deletedAt IS NULL';
    const values = [];

    const keys = Object.keys(where);
    if (keys.length > 0) {
      query += ' AND ' + keys.map(key => `${key} = ?`).join(' AND ');
      values.push(...keys.map(key => where[key]));
    }

    // Default order
    query += ' ORDER BY display_order ASC';

    const [rows] = await db.query(query, values);
    return rows.map(row => new Video(row));
  }

  static async findByPk(id) {
    const [rows] = await db.query('SELECT * FROM videos WHERE id = ? AND deletedAt IS NULL', [id]);
    if (rows.length === 0) return null;
    return new Video(rows[0]);
  }

  static async create(data) {
    const { lesson_id, title, video_url, duration, display_order } = data;
    const [result] = await db.query(
      'INSERT INTO videos (lesson_id, title, video_url, duration, display_order, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [lesson_id, title, video_url, duration, display_order || 0]
    );
    return Video.findByPk(result.insertId);
  }

  async update(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this;

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => data[key]);
    values.push(this.id);

    await db.query(`UPDATE videos SET ${updates}, updatedAt = NOW() WHERE id = ?`, values);

    keys.forEach(key => this[key] = data[key]);
    return this;
  }

  async destroy() {
    await db.query('UPDATE videos SET deletedAt = NOW() WHERE id = ?', [this.id]);
  }

  toJSON() {
    return { ...this };
  }
}

export default Video;