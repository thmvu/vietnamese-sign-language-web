import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QuizManagement = () => {
    const [quizSets, setQuizSets] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSet, setSelectedSet] = useState(null);
    const [showSetForm, setShowSetForm] = useState(false);
    const [editingSetMetadata, setEditingSetMetadata] = useState(null);
    const [viewMode, setViewMode] = useState('lessons'); // 'lessons' or 'sets'

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [setsRes, lessonsRes] = await Promise.all([
                axios.get(`${API_URL}/quizzes/sets/all`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/lessons?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setQuizSets(setsRes.data.data || []);
            setLessons(lessonsRes.data.data.lessons || []);
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSet = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bộ câu hỏi này? Toàn bộ câu hỏi trong bộ sẽ bị xóa.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/quizzes/sets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
        } catch (error) {
            alert('Lỗi khi xóa bộ câu hỏi');
        }
    };

    const handleSaveSetMetadata = async (metadata) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingSetMetadata) {
                await axios.put(`${API_URL}/quizzes/sets/${editingSetMetadata.id}`, metadata, config);
            } else {
                await axios.post(`${API_URL}/quizzes/sets`, metadata, config);
            }
            setShowSetForm(false);
            fetchInitialData();
        } catch (error) {
            alert('Lỗi khi lưu thông tin bộ câu hỏi');
        }
    };

    const handleAssignSet = async (lessonId, setId) => {
        try {
            const token = localStorage.getItem('token');
            // Logic: Update Lesson model to link setId
            await axios.put(`${API_URL}/lessons/${lessonId}`, { quiz_set_id: setId || null }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInitialData();
            alert('Đã cập nhật gán bộ câu hỏi!');
        } catch (error) {
            alert('Lỗi khi gán bộ câu hỏi');
        }
    }

    if (selectedSet) {
        return (
            <QuizBuilder
                quizSet={selectedSet}
                onBack={() => { setSelectedSet(null); fetchInitialData(); }}
            />
        );
    }

    if (loading) return <div className="p-12 text-center text-slate-500">Đang tải...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">🧪 Quản lý Quiz</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setViewMode('lessons')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'lessons' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Theo Bài học
                        </button>
                        <button
                            onClick={() => setViewMode('sets')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'sets' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Thư viện Bộ câu hỏi
                        </button>
                    </div>
                </div>
                {viewMode === 'sets' && (
                    <button
                        onClick={() => { setEditingSetMetadata(null); setShowSetForm(true); }}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg"
                    >
                        + Tạo Bộ Câu Hỏi Mới
                    </button>
                )}
            </div>

            {viewMode === 'lessons' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl shadow overflow-hidden border">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-700">Bài học</th>
                                    <th className="px-6 py-4 font-bold text-slate-700">Bộ câu hỏi đã gán</th>
                                    <th className="px-6 py-4 font-bold text-slate-700 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lessons.map(lesson => (
                                    <tr key={lesson.id} className="hover:bg-blue-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{lesson.title}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={lesson.quiz_set_id || ''}
                                                onChange={(e) => handleAssignSet(lesson.id, e.target.value)}
                                                className="px-3 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none min-w-[200px]"
                                            >
                                                <option value="">-- Không gán --</option>
                                                {quizSets.map(set => (
                                                    <option key={set.id} value={set.id}>{set.title}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {lesson.quiz_set_id ? (
                                                <button
                                                    onClick={() => setSelectedSet(quizSets.find(s => s.id == lesson.quiz_set_id))}
                                                    className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    Soạn thảo Câu hỏi
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Gán bộ câu hỏi để soạn thảo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    {quizSets.map(set => (
                        <div key={set.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingSetMetadata(set); setShowSetForm(true); }} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                                    <button onClick={() => handleDeleteSet(set.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-slate-900 mb-2">{set.title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{set.description || 'Không có mô tả cho bộ câu hỏi này.'}</p>
                            <button
                                onClick={() => setSelectedSet(set)}
                                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                Quản lý Câu hỏi
                            </button>
                        </div>
                    ))}
                    {quizSets.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-medium">Chưa có bộ câu hỏi nào được tạo.</div>}
                </div>
            )}

            {showSetForm && (
                <QuizSetModal
                    set={editingSetMetadata}
                    onClose={() => setShowSetForm(false)}
                    onSave={handleSaveSetMetadata}
                />
            )}
        </div>
    );
};

const QuizSetModal = ({ set, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: set?.title || '',
        description: set?.description || ''
    });

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b bg-slate-50">
                    <h2 className="text-2xl font-black text-slate-800">{set ? 'Sửa thông tin Bộ' : 'Tạo Bộ mới'}</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Tên bộ câu hỏi *</label>
                        <input
                            type="text"
                            autoFocus
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
                            placeholder="Ví dụ: Quiz Cơ bản 01"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Mô tả chi tiết</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all"
                            rows="3"
                            placeholder="Mô tả mục đích của bộ câu hỏi..."
                        />
                    </div>
                </div>
                <div className="p-8 flex gap-4 bg-slate-50">
                    <button onClick={onClose} className="flex-1 px-4 py-3 text-slate-500 font-bold hover:text-slate-800">Thoát</button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                    >
                        Lưu Lại
                    </button>
                </div>
            </div>
        </div>
    );
}

const QuizBuilder = ({ quizSet, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [quizSet.id]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/quizzes/set/${quizSet.id}/questions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.data && res.data.data.length > 0) {
                setQuestions(res.data.data.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || ['', '', '', ''],
                    correct_answer: String(q.correct_answer)
                })));
            } else {
                setQuestions([createEmptyQuestion()]);
            }
        } catch (error) {
            console.error(error);
            setQuestions([createEmptyQuestion()]);
        } finally {
            setLoading(false);
        }
    };

    const createEmptyQuestion = () => ({
        question: '',
        options: ['', '', '', ''],
        correct_answer: '0'
    });

    const addQuestion = () => setQuestions([...questions, createEmptyQuestion()]);
    const removeQuestion = (index) => {
        if (!confirm('Xóa câu hỏi này khỏi danh sách?')) return;
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQ = [...questions];
        const newOptions = [...newQ[qIndex].options];
        newOptions[oIndex] = value;
        newQ[qIndex].options = newOptions;
        setQuestions(newQ);
    };

    const handleSave = async () => {
        const validQuestions = questions.filter(q => q.question.trim().length > 0);
        if (validQuestions.length === 0) {
            alert('Vui lòng nhập ít nhất một câu hỏi.');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/quizzes/set/${quizSet.id}/questions`, {
                quizzes: validQuestions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Đã lưu thành công bộ câu hỏi!');
            onBack();
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu dữ liệu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Đang tải câu hỏi...</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 pb-40">
            <div className="flex items-center gap-6 mb-10">
                <button onClick={onBack} className="p-3 bg-white border shadow-sm hover:shadow-md rounded-2xl text-slate-600 transition-all font-bold">← Quay lại</button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{quizSet.title}</h1>
                    <p className="text-slate-500 font-medium">Đang chỉnh sửa {questions.length} câu hỏi trong bộ này</p>
                </div>
            </div>

            <div className="space-y-10">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border-2 border-slate-50 p-8 relative animate-in fade-in zoom-in duration-300">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                            {qIndex + 1}
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Nội dung câu hỏi</h3>
                            <button onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 font-bold text-sm px-3 py-1 bg-red-50 rounded-xl transition-colors">Xóa bỏ</button>
                        </div>
                        <div className="mb-8">
                            <textarea
                                value={q.question}
                                onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-lg text-slate-700 leading-relaxed border-2 border-transparent focus:border-blue-400"
                                rows="2"
                                placeholder="..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className={`group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${q.correct_answer === String(oIndex) ? 'border-green-500 bg-green-50/50 shadow-inner' : 'border-slate-100 hover:border-slate-300'}`} onClick={() => updateQuestion(qIndex, 'correct_answer', String(oIndex))}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-all ${q.correct_answer === String(oIndex) ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                        {String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <input
                                        type="text"
                                        value={opt}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700"
                                        placeholder={`Đáp án ${oIndex + 1}`}
                                    />
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${q.correct_answer === String(oIndex) ? 'border-green-500 bg-green-500' : 'border-slate-200 group-hover:border-slate-400'}`}>
                                        {q.correct_answer === String(oIndex) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
                <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/10 flex gap-4">
                    <button
                        onClick={addQuestion}
                        className="flex-1 py-4 border-2 border-dashed border-slate-600 text-slate-300 font-black rounded-2xl hover:bg-slate-800 hover:border-slate-500 transition-all uppercase tracking-widest text-xs"
                    >
                        + Thêm Câu Hỏi
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                    >
                        {saving ? 'Đang Xử Lý...' : 'Lưu Tất Cả Câu Hỏi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizManagement;
