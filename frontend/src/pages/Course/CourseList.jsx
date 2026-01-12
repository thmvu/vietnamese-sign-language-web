import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../../services/api'

const CourseList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (error) {
        console.error('Lỗi tải khóa học:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Danh sách khóa học</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
            <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{course.level}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{course.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiến độ</span>
                  <span className="font-bold">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: `${course.progress}%`}}></div>
                </div>
              </div>

              <Link to={`/lesson/${course.lessons[0]?.id || '1'}`}>
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                  {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseList;