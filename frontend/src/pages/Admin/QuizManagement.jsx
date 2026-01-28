import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const lessonsRes = await axios.get(`${API_URL}/lessons?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLessons(lessonsRes.data.data.lessons);

            // Fetch quizzes for all lessons
            const allQuizzes = [];
            for (const lesson of lessonsRes.data.data.lessons) {
                try {
                    const quizRes = await axios.get(`${API_URL}/quizzes/${lesson.id}`);
                    if (quizRes.data.data) {
                        allQuizzes.push(...quizRes.data.data.map(q => ({ ...q, lesson_id: lesson.id })));
                    }
                } catch (err) {
                    // Lesson might not have quizzes
                }
            }
            setQuizzes(allQuizzes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (lessonId, quizId) => {
        if (!confirm('Xóa câu hỏi này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/quizzes/${lessonId}/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            alert('Lỗi khi xóa');
        }
    };

    if (loading) return <div className="text-center py-12">Đang tải...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">🧪 Quản lý Quiz</h1>
                <button
                    onClick={() => { setEditingQuiz(null); setShowForm(true); }}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                    + Thêm câu hỏi
                </button>
            </div>

            <div className="space-y-4">
                {quizzes.map((quiz, idx) => (
                    <div key={quiz.id || idx} className="bg-white rounded-xl shadow p-5">
                        <div className="text-xs text-slate-500 mb-2">
                            {lessons.find(l => l.id == quiz.lesson_id)?.title || 'N/A'}
                        </div>
                        <h3 className="font-bold mb-3">{quiz.question}</h3>
                        <div className="space-y-2 mb-4">
                            {quiz.options?.map((opt, i) => (
                                <div key={i} className={`px-3 py-2 rounded-lg ${quiz.correct_answer == i ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50'}`}>
                                    {i + 1}. {opt}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingQuiz(quiz); setShowForm(true); }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => handleDelete(quiz.lesson_id, quiz.id)}
                                className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && <QuizForm quiz={editingQuiz} lessons={lessons} onClose={(success) => { setShowForm(false); if (success) fetchData(); }} />}
        </div>
    );
};

const QuizForm = ({ quiz, lessons, onClose }) => {
    const [formData, setFormData] = useState({
        lesson_id: quiz?.lesson_id || '',
        question: quiz?.question || '',
        options: quiz?.options || ['', '', '', ''],
        correct_answer: quiz?.correct_answer || '0'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...formData,
                correct_answer: String(formData.correct_answer)
            };

            if (quiz) {
                await axios.put(`${API_URL}/quizzes/${quiz.lesson_id}/${quiz.id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/quizzes/${formData.lesson_id}`, payload, config);
            }
            onClose(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi');
            setLoading(false);
        }
    };

    const updateOption = (index, value) => {
        const newOpts = [...formData.options];
        newOpts[index] = value;
        setFormData({ ...formData, options: newOpts });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">{quiz ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Bài học *</label>
                        <select
                            value={formData.lesson_id}
                            onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">Chọn bài học</option>
                            {lessons.map(l => (
                                <option key={l.id} value={l.id}>{l.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Câu hỏi *</label>
                        <textarea
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                            rows="2"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Đáp án</label>
                        {formData.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2 mb-2">
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={formData.correct_answer == i}
                                    onChange={() => setFormData({ ...formData, correct_answer: String(i) })}
                                />
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(i, e.target.value)}
                                    placeholder={`Đáp án ${i + 1}`}
                                    className="flex-1 px-4 py-2 border rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => onClose(false)} className="flex-1 border px-4 py-3 rounded-lg font-bold">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold">{loading ? 'Lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizManagement;
