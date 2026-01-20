const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Lesson = require('./Lesson');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  completed_videos: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of completed video IDs'
  },
  quiz_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  practice_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  last_access: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'progress',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'lesson_id']
    }
  ]
});

Progress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Progress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
User.hasMany(Progress, { foreignKey: 'user_id', as: 'progress' });
Lesson.hasMany(Progress, { foreignKey: 'lesson_id', as: 'progress' });

module.exports = Progress;