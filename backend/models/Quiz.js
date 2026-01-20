const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Lesson = require('./Lesson');

const Quiz = sequelize.define('Quiz', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of options: ["A", "B", "C", "D"]'
  },
  correct_answer: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Index or letter of correct option'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  paranoid: true
});

Quiz.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });
Lesson.hasMany(Quiz, { foreignKey: 'lesson_id', as: 'quizzes' });

module.exports = Quiz;