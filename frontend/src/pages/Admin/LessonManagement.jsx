import React, { useState, useEffect } from 'react';
import api, { getCourses } from '../../services/api';

const LessonManagement = () => {
    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [filterCourse, setFilterCourse] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesData, lessonsData] = await Promise.all([
                getCourses(),
                fetchAllLessons()
            ]);
            setCourses(coursesData);
            setLessons(lessonsData);
        } catch (error) {
            console.error('Error:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllLessons = async () => {
        // api instance handles base URL and token automatically
        const response = await api.get('/lessons', {
            params: { limit: 100 }
        });
        return response.data.lessons;
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa bài học này?')) return;
        try {
            await api.delete(`/lessons/${id}`);
            fetchData();
            alert('Đã xóa bài học');
        } catch (error) {
            alert('Lỗi khi xóa');
        }
    };

    const filteredLessons = lessons.filter(l =>
        filterCourse === 'all' || l.course_id == filterCourse
    );

    if (loading) return <div className="text-center py-12">Đang tải...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">📖 Quản lý Bài học</h1>
                <button
                    onClick={() => { setEditingLesson(null); setShowForm(true); }}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                    + Thêm bài học
                </button>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6">
                <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">Tất cả khóa học</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map(lesson => (
                    <div key={lesson.id} className="bg-white rounded-xl shadow-lg p-5">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {courses.find(c => c.id == lesson.course_id)?.title || 'N/A'}
                        </span>
                        <h3 className="text-lg font-bold mt-3 mb-2">{lesson.title}</h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{lesson.description}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingLesson(lesson); setShowForm(true); }}
                                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => handleDelete(lesson.id)}
                                className="flex-1 px-3 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && <LessonForm lesson={editingLesson} courses={courses} onClose={(success) => { setShowForm(false); if (success) fetchData(); }} />}
        </div>
    );
};

const LessonForm = ({ lesson, courses, onClose }) => {
    const [formData, setFormData] = useState({
        course_id: lesson?.course_id || '',
        title: lesson?.title || '',
        description: lesson?.description || '',
        category: lesson?.category || 'alphabet',
        level: lesson?.level || 'beginner',
        thumbnail: lesson?.thumbnail || '',
        display_order: lesson?.display_order || 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lesson) {
            fetchLessonVideo();
        }
    }, [lesson]);

    const fetchLessonVideo = async () => {
        try {
            const res = await api.get(`/videos/lesson/${lesson.id}`);
            // Check api response structure (usually just data, but check logic)
            // Assuming api interceptor returns response.data directly or response.
            // Based on api.js: response.data || response.data?.data
            // Let's assume standard response structure
            if (res && res.length > 0) {
                // The getLessonVideos API in api.js returns response.data directly which is an array of videos
                setFormData(prev => ({ ...prev, video_url: res[0].video_url }));
            }
        } catch (error) {
            console.error('Failed to fetch video:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (lesson) {
                await api.put(`/lessons/${lesson.id}`, formData);
            } else {
                await api.post('/lessons', formData);
            }
            onClose(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">{lesson ? 'Sửa bài học' : 'Thêm bài học'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Khóa học *</label>
                        <select
                            value={formData.course_id}
                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">Chọn khóa học</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Tên bài học *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Video URL (YouTube) - Tùy chọn</label>
                        <input
                            type="url"
                            value={formData.video_url || ''}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-2 border rounded-lg bg-blue-50"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Nhập link YouTube để tự động tạo Video cho bài học này.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-2 border rounded-lg"
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Danh mục</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="alphabet">Bảng chữ cái</option>
                                <option value="numbers">Số</option>
                                <option value="greetings">Chào hỏi</option>
                                <option value="common">Thông dụng</option>
                                <option value="emotion">Cảm xúc</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Cấp độ</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="beginner">Cơ bản</option>
                                <option value="intermediate">Trung cấp</option>
                                <option value="advanced">Nâng cao</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => onClose(false)} className="flex-1 px-4 py-3 border rounded-lg font-bold">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg">{loading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LessonManagement;
