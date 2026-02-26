import React from 'react';
import { useNavigate } from 'react-router-dom';

const LessonCompleteModal = ({ isOpen, lessonId, nextLessonId }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-zoom-in">
                <div className="relative p-8 text-center">
                    {/* Confetti / Celebration Background Effect */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent -z-10"></div>

                    <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-blue-100 text-blue-600 rounded-full text-5xl">
                        🏆
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Tuyệt vời!</h2>
                    <p className="text-slate-600 mb-8 px-4">
                        Bạn đã hoàn thành bài học này một cách xuất sắc. Hãy tiếp tục duy trì phong độ này nhé!
                    </p>

                    <div className="space-y-3">
                        {nextLessonId ? (
                            <button
                                onClick={() => {
                                    navigate(`/lesson/${nextLessonId}`);
                                    window.location.reload(); // Refresh to load new lesson data
                                }}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Học bài tiếp theo →
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/courses')}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all"
                            >
                                Hoàn thành khóa học
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/courses')}
                            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            Về danh sách bài học
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonCompleteModal;
