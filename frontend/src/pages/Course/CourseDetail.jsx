import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCourse, completeCourse } from '../../services/api'

const CourseDetail = () => {
    const { id } = useParams() // course ID
    const navigate = useNavigate()

    const [course, setCourse] = useState(null)
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true)
            try {
                // getCourse already returns lessons with is_completed flags
                const courseData = await getCourse(id)
                setCourse(courseData)
                // Use lessons from courseData which includes progress info
                setLessons(courseData.lessons || [])
            } catch (error) {
                console.error('Lỗi tải khóa học:', error)
                setError(error.userMessage || error.message || 'Không tìm thấy khóa học')
            } finally {
                setLoading(false)
            }
        }
        fetchCourseData()
    }, [id])

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (error || !course) return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy khóa học'}</p>
                <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                    Quay lại danh sách
                </button>
            </div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
            >
                ← Quay lại danh sách khóa học
            </button>

            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                    {course.thumbnail && (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                                course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                {course.level === 'beginner' ? 'Cơ bản' :
                                    course.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                            </span>
                            {course.is_completed && (
                                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-green-500 text-white flex items-center gap-1">
                                    ✅ Đã hoàn thành
                                </span>
                            )}
                        </div>

                        {!course.is_completed && lessons.length > 0 && lessons.every(l => l.is_completed) && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('Bạn có chắc chắn muốn đánh dấu hoàn thành khóa học này?')) {
                                        try {
                                            await completeCourse(course.id);
                                            setCourse(prev => ({ ...prev, is_completed: true }));
                                            alert('Chúc mừng! Bạn đã hoàn thành khóa học này! 🎉');
                                        } catch (err) {
                                            alert('Lỗi: ' + err.message);
                                        }
                                    }
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all animate-bounce"
                            >
                                🏆 Hoàn thành khóa học
                            </button>
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">{course.title}</h1>
                    <p className="text-slate-600 text-lg">{course.description}</p>
                </div>
            </div>

            {/* Lessons List */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                    📚 Bài học ({lessons.length})
                </h2>

                {lessons.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-slate-500">Chưa có bài học nào trong khóa học này</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson, index) => (
                            <Link
                                key={lesson.id}
                                to={`/lesson/${lesson.id}`}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-100 group relative"
                            >
                                {lesson.is_completed && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
                                        Đã học ✅
                                    </div>
                                )}
                                <div className="h-40 bg-gradient-to-br from-blue-300 to-purple-400 relative">

                                    {lesson.thumbnail && (
                                        <img
                                            src={lesson.thumbnail}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold mb-2 text-slate-800 line-clamp-2">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                        {lesson.description || 'Chưa có mô tả'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="px-2 py-1 bg-slate-100 rounded-full">
                                            {lesson.category || 'common'}
                                        </span>
                                        <span className="font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                                            Học ngay →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseDetail
