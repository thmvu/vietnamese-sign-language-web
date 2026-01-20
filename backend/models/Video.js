const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Lesson = require('./Lesson');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
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
  tableName: 'videos',
  timestamps: true,
  paranoid: true
});

Video.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
Lesson.hasMany(Video, { foreignKey: 'lesson_id', as: 'videos' });

module.exports = Video;