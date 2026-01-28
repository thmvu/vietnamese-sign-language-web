import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VideoManagement = () => {
    const [videos, setVideos] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [lessonsRes, videosRes] = await Promise.all([
                axios.get(`${API_URL}/lessons?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/videos`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setLessons(lessonsRes.data.data.lessons);
            setVideos(videosRes.data.data || []);
        } catch (error) {
            console.error(error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa video này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/videos/${id}`, {
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
                <h1 className="text-3xl font-bold">🎥 Quản lý Video</h1>
                <button
                    onClick={() => { setEditingVideo(null); setShowForm(true); }}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                    + Thêm video
                </button>
            </div>

            <div className="space-y-4">
                {videos.map(video => (
                    <div key={video.id} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <div className="flex-shrink-0 w-32 h-20 bg-slate-200 rounded-lg overflow-hidden">
                            <img
                                src={`https://img.youtube.com/vi/${extractYouTubeId(video.video_url)}/mqdefault.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-grow">
                            <div className="text-xs text-slate-500 mb-1">
                                {lessons.find(l => l.id == video.lesson_id)?.title || 'N/A'}
                            </div>
                            <h3 className="font-bold mb-1">{video.title}</h3>
                            <p className="text-sm text-slate-600">{video.duration}s</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingVideo(video); setShowForm(true); }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => handleDelete(video.id)}
                                className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && <VideoForm video={editingVideo} lessons={lessons} onClose={(success) => { setShowForm(false); if (success) fetchData(); }} />}
        </div>
    );
};

const VideoForm = ({ video, lessons, onClose }) => {
    const [formData, setFormData] = useState({
        lesson_id: video?.lesson_id || '',
        title: video?.title || '',
        video_url: video?.video_url || '',
        duration: video?.duration || 60,
        display_order: video?.display_order || 0
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (video) {
                await axios.put(`${API_URL}/videos/${video.id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/videos`, formData, config);
            }
            onClose(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">{video ? 'Sửa video' : 'Thêm video'}</h2>
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
                        <label className="block text-sm font-bold mb-2">Tiêu đề video *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">YouTube URL *</label>
                        <input
                            type="url"
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            required
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Độ dài (giây)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Thứ tự</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
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

const extractYouTubeId = (url) => {
    const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : 'dQw4w9WgXcQ';
};

export default VideoManagement;
