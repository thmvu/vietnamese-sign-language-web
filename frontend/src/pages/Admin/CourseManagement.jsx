import React, { useState, useEffect } from 'react';
import { getCourses, deleteCourse } from '../../services/api';
import CourseForm from '../../components/Admin/CourseForm';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getCourses();
            setCourses(data);
        } catch (error) {
            console.error('Lỗi tải khóa học:', error);
            alert('Không thể tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;

        try {
            await deleteCourse(id);
            alert('Xóa khóa học thành công!');
            fetchCourses(); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi xóa khóa học:', error);
            alert('Lỗi khi xóa khóa học: ' + (error.userMessage || error.message));
        }
    };

    const handleFormClose = (success) => {
        setShowForm(false);
        setEditingCourse(null);
        if (success) fetchCourses();
    };

    const filteredCourses = courses.filter(course => {
        const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchLevel = filterLevel === 'all' || course.level === filterLevel;
        return matchSearch && matchLevel;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-64">Đang tải...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">📚 Quản lý Khóa học</h1>
                <button
                    onClick={handleAdd}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                    + Thêm khóa học mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khóa học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả cấp độ</option>
                        <option value="beginner">Cơ bản</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                    </select>
                </div>
            </div>

            {/* Course List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                            {course.thumbnail && (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                {course.level === 'beginner' ? 'Cơ bản' :
                                    course.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                            </span>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(course)}
                                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Không tìm thấy khóa học nào
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <CourseForm
                    course={editingCourse}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
};

export default CourseManagement;
