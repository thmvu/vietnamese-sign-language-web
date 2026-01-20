const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('alphabet', 'numbers', 'common', 'advanced'),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  paranoid: true
});

module.exports = Lesson;