import Quiz from '../models/Quiz.js';

export const getQuizzesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quizzes = await Quiz.findAll({
      where: { lesson_id: lessonId }
    });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { lesson_id, question, options, correct_answer } = req.body;

    if (!lesson_id || !question || !options || !correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Options must be an array with at least 2 items'
      });
    }

    const quiz = await Quiz.create({
      lesson_id,
      question,
      options,
      correct_answer
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await quiz.update(updates);

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    await quiz.destroy();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body; // Array of { quizId, answer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Fetch all quizzes for this lesson
    const quizzes = await Quiz.findAll({ where: { lesson_id: lessonId } });

    if (quizzes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quizzes found for this lesson'
      });
    }

    // Check answers
    let correctCount = 0;
    const results = answers.map(submitted => {
      const quiz = quizzes.find(q => q.id === submitted.quizId);
      if (!quiz) {
        return { quizId: submitted.quizId, correct: false, message: 'Quiz not found' };
      }

      const isCorrect = quiz.correct_answer === String(submitted.answer);
      if (isCorrect) correctCount++;

      return {
        quizId: submitted.quizId,
        correct: isCorrect,
        correctAnswer: quiz.correct_answer,
        submitted: String(submitted.answer)
      };
    });

    const score = Math.round((correctCount / quizzes.length) * 100);

    res.json({
      success: true,
      data: {
        score,
        totalQuestions: quizzes.length,
        correctAnswers: correctCount,
        results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};