import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson } from '../../services/api'

const LessonDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await getLesson(id)
        setLesson(data)
      } catch (error) {
        console.error('Lỗi tải bài học:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải bài học...</div>
  if (!lesson) return <div className="text-center py-20">Không tìm thấy bài học</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button onClick={() => navigate('/courses')} className="mb-6 text-blue-600 font-bold">
        ← Quay lại danh sách
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

        {/* Video Player */}
        <div className="mb-8">
          <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden">
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        </div>

        {/* Từ vựng */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📝 Từ vựng trong bài</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {lesson.vocab?.map((word, i) => (
              <div key={i} className="bg-blue-50 p-4 rounded-xl">
                <p className="font-bold text-lg">{word.word}</p>
                <p className="text-slate-600">{word.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nút làm Quiz */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/quiz/${lesson.id}`)}
            className="px-10 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
          >
            Làm bài kiểm tra →
          </button>
        </div>
      </div>
    </div>
  )
}

export default LessonDetail;