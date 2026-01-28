import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../../services/api'

const CourseList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await getCourses()
        setCourses(data)
      } catch (error) {
        console.error('Lỗi tải khóa học:', error)
        setError(error.message || 'Không thể tải danh sách khóa học')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Danh sách khóa học</h1>

      {courses.length === 0 ? (
        <p className="text-center text-slate-500">Chưa có khóa học nào</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="overflow-hidden h-48">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/600x400?text=Course'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                      course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                    }`}>
                    {course.level === 'beginner' ? 'Cơ bản' :
                      course.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-slate-800">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>

                <Link to={`/course/${course.id}`}>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-md">
                    Bắt đầu ngay →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList;