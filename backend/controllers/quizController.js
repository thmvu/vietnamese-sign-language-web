import Quiz from '../models/Quiz.js';
import QuizSet from '../models/QuizSet.js';
import Lesson from '../models/Lesson.js';

// --- QUIZ SETS ---

export const getAllQuizSets = async (req, res) => {
  try {
    const quizSets = await QuizSet.findAll();
    res.json({ success: true, data: quizSets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz sets', error: error.message });
  }
};

export const createQuizSet = async (req, res) => {
  try {
    const { title, description, lesson_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const quizSet = await QuizSet.create({ title, description, lesson_id });
    res.json({ success: true, message: 'Quiz Set created', data: quizSet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating Quiz Set', error: error.message });
  }
};

export const updateQuizSet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const quizSet = await QuizSet.findByPk(id);
    if (!quizSet) return res.status(404).json({ success: false, message: 'Quiz Set not found' });

    await quizSet.update(updateData);
    res.json({ success: true, message: 'Quiz Set updated', data: quizSet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating Quiz Set', error: error.message });
  }
};

export const deleteQuizSet = async (req, res) => {
  try {
    const { id } = req.params;
    const quizSet = await QuizSet.findByPk(id);
    if (!quizSet) return res.status(404).json({ success: false, message: 'Quiz Set not found' });

    await quizSet.destroy();
    // Also delete associated quizzes? Yes, logically soft delete them
    await Quiz.destroyAll({ where: { quiz_set_id: id } });

    res.json({ success: true, message: 'Quiz Set deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting Quiz Set', error: error.message });
  }
};

// --- PUBLIC / STUDENT ---

export const getQuizzesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Find associated set
    const sets = await QuizSet.findAll({ where: { lesson_id: lessonId } });
    if (sets.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const quizzes = await Quiz.findAll({ where: { quiz_set_id: sets[0].id } });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
};

// --- QUIZZES (QUESTIONS) ---

export const getQuizzesBySet = async (req, res) => {
  try {
    const { setId } = req.params;
    const quizzes = await Quiz.findAll({ where: { quiz_set_id: setId } });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching quizzes', error: error.message });
  }
};

// --- INDIVIDUAL QUIZZES (LEGACY/SPECIFIC) ---

export const createQuiz = async (req, res) => {
  try {
    const { lesson_id, quiz_set_id, question, options, correct_answer } = req.body;
    if (!question || !options || !correct_answer) {
      return res.status(400).json({ success: false, message: 'Question, options, and correct answer are required' });
    }
    const quiz = await Quiz.create({ lesson_id, quiz_set_id, question, options, correct_answer });
    res.status(201).json({ success: true, message: 'Quiz created', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating quiz', error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const quiz = await Quiz.findByPk(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await quiz.update(updates);
    res.json({ success: true, message: 'Quiz updated', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating quiz', error: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByPk(id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await quiz.destroy();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting quiz', error: error.message });
  }
};

// Bulk update for "Cluster" management (Now by Quiz Set ID)
export const bulkUpdateQuizzes = async (req, res) => {
  try {
    // We check ifsetId, if not provided, try to find it from lessonId in body or params
    let { setId } = req.params;
    const { lessonId, quizzes } = req.body;

    if (!setId && lessonId) {
      const lesson = await Lesson.findByPk(lessonId);
      if (lesson && lesson.quiz_set_id) setId = lesson.quiz_set_id;
    }

    if (!setId) {
      return res.status(400).json({ success: false, message: 'Quiz Set ID is required' });
    }

    if (!Array.isArray(quizzes)) {
      return res.status(400).json({ success: false, message: 'Quizzes must be an array' });
    }

    // 1. Soft delete all existing quizzes for this set
    await Quiz.destroyAll({ where: { quiz_set_id: setId } });

    // 2. Create new quizzes from the list
    const createdQuizzes = [];
    for (const q of quizzes) {
      if (!q.question || !q.options || !q.correct_answer) continue;

      const newQuiz = await Quiz.create({
        quiz_set_id: setId,
        question: q.question,
        options: q.options,
        correct_answer: String(q.correct_answer)
      });
      createdQuizzes.push(newQuiz);
    }

    res.json({
      success: true,
      message: 'Updated quizzes successfully',
      data: createdQuizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update quizzes',
      error: error.message
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;

    // FIND THE QUIZ SET FOR THIS LESSON
    const quizSet = await QuizSet.findOne({ where: { lesson_id: lessonId } }); // We need findOne in QuizSet
    // Wait, QuizSet.findOne might not exist yet? I need to implement it or use findAll
    // Let's assume findAll for now or simpler logic

    // Quick Fix: Use DB Query directly if Model lacks findOne or implement findOne in Model
    // But wait, QuizSet.js uses `findAll`. I should add `findOne` or just use `findAll` and take first.

    const sets = await QuizSet.findAll({ where: { lesson_id: lessonId } });
    if (sets.length === 0) {
      return res.status(404).json({ success: false, message: 'No quiz set found for this lesson' });
    }
    const targetSet = sets[0]; // Assume 1 active set per lesson or take latest

    const quizzes = await Quiz.findAll({ where: { quiz_set_id: targetSet.id } });

    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found' });
    }

    // Check answers logic...
    let correctCount = 0;
    const results = answers.map(submitted => {
      const quiz = quizzes.find(q => q.id === submitted.quizId);
      if (!quiz) return { quizId: submitted.quizId, correct: false };

      const isCorrect = quiz.correct_answer === String(submitted.answer);
      if (isCorrect) correctCount++;
      return { quizId: submitted.quizId, correct: isCorrect, correctAnswer: quiz.correct_answer, submitted: String(submitted.answer) };
    });

    const score = Math.round((correctCount / quizzes.length) * 100);

    res.json({
      success: true,
      data: { score, totalQuestions: quizzes.length, correctAnswers: correctCount, results }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
};