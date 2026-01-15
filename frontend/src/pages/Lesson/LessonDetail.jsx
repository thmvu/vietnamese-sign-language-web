import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
// 1. Sửa đường dẫn import API
import { getLessonAPI } from '../../services/mockCourses'

const LessonDetail = () => {
  const { id } = useParams() // Lấy ID bài học từ URL
  const navigate = useNavigate()
  
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  // 2. Fetch dữ liệu bài học
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true)
      try {
        // Gọi hàm từ mockCourses
        const data = await getLessonAPI(id)
        setLesson(data)
      } catch (error) {
        console.error('Lỗi tải bài học:', error)
        // Nếu lỗi (ví dụ id không tồn tại) thì đá về dashboard
        alert("Không tìm thấy bài học này!")
        navigate('/courses')
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [id, navigate])

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (!lesson) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb / Nút quay lại */}
      <button 
        onClick={() => navigate('/courses')} 
        className="flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
      >
        ← Quay lại danh sách khóa học
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: Video Player & Nội dung chính */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Player Mockup */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative group">
            <iframe 
              src={lesson.videoUrl} 
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{lesson.title}</h1>
            <p className="text-slate-500">Hãy xem kỹ video và ghi nhớ các động tác tay nhé!</p>
          </div>

          {/* Điều hướng bài học (Mock logic) */}
          <div className="flex justify-between items-center py-6 border-t border-slate-200">
            <button 
              className="px-6 py-2 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              disabled // Tạm thời disable nút lùi
            >
              Bài trước
            </button>
            
            <Link 
              to={`/quiz/${lesson.id}`} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
            >
              Làm bài kiểm tra →
            </Link>
          </div>
        </div>

        {/* CỘT PHẢI: Danh sách từ vựng (Sidebar) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              📝 Từ vựng trong bài
            </h3>
            
            <div className="space-y-3">
              {lesson.vocab?.map((item, index) => (
                <div key={index} className="group p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-lg text-blue-600">{item.word}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-md text-slate-400 border border-slate-100">Click xem</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-sm text-yellow-800">
                💡 <strong>Mẹo:</strong> Bạn có thể dùng tính năng "Practice AI" để check xem mình làm đúng chưa nhé!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetail;