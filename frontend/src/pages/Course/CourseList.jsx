import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// 1️⃣ SỬA IMPORT: Lấy từ file mới mockCourses
import { getCoursesAPI } from '../../services/mockCourses'

const CourseList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 2️⃣ SỬA TÊN HÀM: Gọi hàm getCoursesAPI
        const data = await getCoursesAPI()
        setCourses(data)
      } catch (error) {
        console.error('Lỗi tải khóa học:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // 3️⃣ UI LOADING XỊN HƠN (Thay vì chỉ hiện chữ)
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Danh sách khóa học</h1>
      
      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <div key={course.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
            {/* Hình ảnh có hiệu ứng zoom nhẹ khi hover */}
            <div className="overflow-hidden h-48">
                <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    course.level === 'Cơ bản' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {course.level}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-slate-800">{course.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Tiến độ</span>
                  <span className="font-bold">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: `${course.progress}%`}}></div>
                </div>
              </div>

              {/* 4️⃣ SỬA LINK: Trỏ về trang /course/:id để khớp với App.jsx */}
              <Link to={`/course/${course.id}`}>
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-md">
                  {course.progress > 0 ? 'Tiếp tục học →' : 'Bắt đầu ngay →'}
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