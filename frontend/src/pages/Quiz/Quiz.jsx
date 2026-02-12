import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuiz, submitQuiz } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Quiz = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({}) // Lưu đáp án: { 0: "A", 1: "B" }
  const [result, setResult] = useState(null) // Kết quả trả về từ API
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Tải câu hỏi
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true)
      try {
        console.log('[Quiz] Fetching quiz for lesson:', lessonId)
        const response = await getQuiz(lessonId)
        console.log('[Quiz] API Response:', response)
        // Backend returns { success: true, data: [...quizzes] }
        const quizData = response.data || response || []
        console.log('[Quiz] Parsed quiz data:', quizData)
        console.log('[Quiz] Number of questions:', quizData.length)
        setQuestions(quizData)
      } catch (error) {
        console.error('[Quiz] Lỗi tải quiz:', error)
        console.error('[Quiz] Error details:', error.response?.data)
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [lessonId])

  // Xử lý khi chọn đáp án
  const handleSelectOption = (questionIndex, option) => {
    if (result) return; // Nếu đã nộp bài thì không cho chọn lại
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    })
  }

  // Nộp bài
  const handleSubmit = async () => {
    // Kiểm tra xem đã làm hết chưa
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert("Bạn hãy trả lời hết các câu hỏi trước khi nộp nhé!")
      return
    }

    setSubmitting(true)
    try {
      // Format answers for backend: [{ quizId, answer }]
      const formattedAnswers = questions.map((q, index) => ({
        quizId: q.id,
        answer: selectedAnswers[index] || ''
      }))

      // Gọi API chấm điểm
      const response = await submitQuiz(lessonId, formattedAnswers)
      // Backend returns: { success: true, data: { score, totalQuestions, correctAnswers, results } }
      const { correctAnswers, totalQuestions } = response.data
      setResult({
        score: correctAnswers,
        total: totalQuestions,
        passed: correctAnswers >= totalQuestions / 2
      })
    } catch (error) {
      console.error('Submit error:', error)
      alert(error.userMessage || 'Có lỗi khi nộp bài')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600 font-bold">
          ← Quay lại bài học
        </button>
        <h1 className="text-2xl font-bold text-slate-800">📝 Bài kiểm tra kiến thức</h1>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Câu {index + 1}: {q.question}
            </h3>

            <div className="grid gap-3">
              {q.options.map((option, i) => {
                const isSelected = selectedAnswers[index] === option
                // Logic màu sắc khi hiện kết quả
                let optionClass = "border-slate-200 hover:bg-blue-50 cursor-pointer"

                if (result) {
                  // Đã nộp bài: Hiện đúng/sai
                  if (option === q.correct_answer) optionClass = "bg-green-100 border-green-500 text-green-800 font-bold" // Đáp án đúng
                  else if (isSelected && option !== q.correct_answer) optionClass = "bg-red-100 border-red-500 text-red-800" // Chọn sai
                  else optionClass = "opacity-50" // Các câu khác làm mờ đi
                } else {
                  // Chưa nộp: Chỉ hiện màu xanh khi chọn
                  if (isSelected) optionClass = "border-blue-500 bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-500"
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleSelectOption(index, option)}
                    className={`p-4 border-2 rounded-xl transition-all ${optionClass}`}
                  >
                    {option}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Phần kết quả & Nút bấm */}
      <div className="mt-10 sticky bottom-6 z-10">
        {!result ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-70"
          >
            {submitting ? 'Đang chấm điểm...' : 'Nộp bài hoàn tất'}
          </button>
        ) : (
          <div className={`p-6 rounded-2xl shadow-lg border-2 animate-bounce-in ${result.passed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="text-center">
              <h2 className={`text-3xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-orange-600'}`}>
                {result.passed ? '🎉 Chúc mừng!' : '😅 Cố gắng thêm nhé!'}
              </h2>
              <p className="text-slate-600 text-lg mb-6">
                Bạn đã trả lời đúng <span className="font-bold text-slate-900">{result.score}/{result.total}</span> câu hỏi.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setResult(null); setSelectedAnswers({}); window.scrollTo(0, 0); }}
                  className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Làm lại
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className={`px-6 py-3 text-white rounded-xl font-bold shadow-md ${result.passed ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {result.passed ? 'Tiếp tục học bài mới →' : 'Về danh sách bài học'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz;