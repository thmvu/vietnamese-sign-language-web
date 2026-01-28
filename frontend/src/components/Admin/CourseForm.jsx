import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CourseForm = ({ course, onClose }) => {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        level: course?.level || 'beginner',
        thumbnail: course?.thumbnail || '',
        display_order: course?.display_order || 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (course) {
                // Update
                await axios.put(`${API_URL}/courses/${course.id}`, formData, config);
            } else {
                // Create
                await axios.post(`${API_URL}/courses`, formData, config);
            }

            onClose(true); // Success
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold">
                        {course ? 'Sửa khóa học' : 'Thêm khóa học mới'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2">Tên khóa học *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ví dụ: Cơ bản - Khởi đầu với Thủ ngữ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mô tả ngắn về khóa học..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Cấp độ *</label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="beginner">Cơ bản</option>
                            <option value="intermediate">Trung cấp</option>
                            <option value="advanced">Nâng cao</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Thumbnail URL</label>
                        <input
                            type="url"
                            name="thumbnail"
                            value={formData.thumbnail}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                        {formData.thumbnail && (
                            <img src={formData.thumbnail} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Thứ tự hiển thị</label>
                        <input
                            type="number"
                            name="display_order"
                            value={formData.display_order}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold hover:bg-slate-50"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Đang lưu...' : (course ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
