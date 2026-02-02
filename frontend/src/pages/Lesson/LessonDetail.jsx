import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getLesson, getLessonVideos } from '../../services/api'

const LessonDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [videos, setVideos] = useState([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLessonData = async () => {
      setLoading(true)
      try {
        const [lessonData, videosData] = await Promise.all([
          getLesson(id),
          getLessonVideos(id)
        ])
        setLesson(lessonData)
        setVideos(videosData || [])
      } catch (error) {
        console.error('Lỗi tải bài học:', error)
        setError(error.message || 'Không tìm thấy bài học')
      } finally {
        setLoading(false)
      }
    }
    fetchLessonData()
  }, [id])

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (error || !lesson) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error || 'Không tìm thấy bài học'}</p>
        <button onClick={() => navigate('/courses')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Quay lại danh sách
        </button>
      </div>
    </div>
  )

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      // Fallback if regex fails but it's a simple link
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const currentVideo = videos[currentVideoIndex]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors"
      >
        ← Quay lại danh sách khóa học
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Video Player */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative">
            {currentVideo ? (
              <iframe
                src={getYoutubeEmbedUrl(currentVideo.video_url)}
                title={currentVideo.title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>Chưa có video cho bài học này</p>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{lesson.title}</h1>
            <p className="text-slate-500">{lesson.description}</p>
          </div>

          {/* Video Navigation */}
          {videos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-4">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${index === currentVideoIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {video.title}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center py-6 border-t border-slate-200">
            <button
              className="px-6 py-2 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
              disabled={currentVideoIndex === 0}
            >
              Video trước
            </button>

            <div className="flex gap-3">
              <Link
                to={`/quiz/${lesson.id}`}
                className="px-6 py-3 bg-white border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all"
              >
                Làm Quiz
              </Link>

              {lesson.next_lesson_id && (
                <Link
                  to={`/course/${lesson.next_lesson_id}`}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
                >
                  Bài tiếp theo →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Lesson List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              📚 Danh sách bài học ({lesson.course_lessons?.length || 0})
            </h3>

            {lesson.course_lessons && lesson.course_lessons.length > 0 ? (
              <div className="space-y-2">
                {lesson.course_lessons.map((courseLesson, index) => (
                  <Link
                    key={courseLesson.id}
                    to={`/course/${courseLesson.id}`}
                    className={`block p-3 rounded-lg transition-colors ${courseLesson.id === lesson.id
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-slate-50 border border-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${courseLesson.id === lesson.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                        }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${courseLesson.id === lesson.id ? 'text-blue-600' : 'text-slate-700'
                          }`}>
                          {courseLesson.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Chưa có bài học nào</p>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-sm text-yellow-800">
                💡 <strong>Mẹo:</strong> Xem hết video để hiểu rõ hơn trước khi làm quiz nhé!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetail;