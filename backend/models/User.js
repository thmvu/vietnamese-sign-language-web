import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.avatar = data.avatar || 'default-avatar.png';
    this.refreshToken = data.refreshToken;
    this.created_at = data.createdAt || data.created_at;
    this.updated_at = data.updatedAt || data.updated_at;
  }

  static async findOne({ where }) {
    const keys = Object.keys(where);
    if (keys.length === 0) return null;

    const conditions = keys.map(key => `${key} = ?`).join(' AND ');
    const values = keys.map(key => where[key]);

    // Soft delete check
    const query = `SELECT * FROM users WHERE ${conditions} AND deletedAt IS NULL LIMIT 1`;

    const [rows] = await db.query(query, values);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  static async findByPk(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND deletedAt IS NULL', [id]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  static async findAll({ attributes } = {}) {
    let select = '*';
    // Simple attribute selection support
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      // Security check to avoid SQL injection via attributes
      const allowedAttributes = ['id', 'name', 'email', 'role', 'avatar', 'createdAt', 'updatedAt'];
      const validAttributes = attributes.filter(attr => allowedAttributes.includes(attr));
      if (validAttributes.length > 0) {
        select = validAttributes.join(', ');
      }
    }

    const [rows] = await db.query(`SELECT ${select} FROM users WHERE deletedAt IS NULL`);

    // Nếu select * thì return User instances, ngược lại return POJO
    return rows.map(row => {
      if (select === '*') return new User(row);
      return row;
    });
  }

  static async create(userData) {
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const { name, email, password, role } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, email, password, role || 'user']
    );

    return User.findByPk(result.insertId);
  }

  // Static update for cases like logging out
  static async update(data, { where }) {
    const keys = Object.keys(data);
    if (keys.length === 0) return;

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => data[key]);

    let whereClause = '';
    const whereKeys = Object.keys(where);
    if (whereKeys.length > 0) {
      whereClause = 'WHERE ' + whereKeys.map(key => `${key} = ?`).join(' AND ');
      values.push(...whereKeys.map(key => where[key]));
    }

    await db.query(`UPDATE users SET ${updates}, updatedAt = NOW() ${whereClause}`, values);
  }

  // Instance method for updating current user
  async update(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this;

    const updates = [];
    const values = [];

    for (const key of keys) {
      if (key === 'password') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data[key], salt);
        updates.push(`${key} = ?`);
        values.push(hashedPassword);
        this.password = hashedPassword;
      } else if (key !== 'id') {
        updates.push(`${key} = ?`);
        values.push(data[key]);
        this[key] = data[key]; // Update local instance
      }
    }

    if (updates.length > 0) {
      values.push(this.id);
      await db.query(`UPDATE users SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`, values);
    }

    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = { ...this };
    delete values.password;
    delete values.refreshToken;
    return values;
  }
}

export default User;