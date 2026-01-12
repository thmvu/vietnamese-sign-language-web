import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuiz, submitQuiz } from '../../services/api'

const Quiz = ({ user }) => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuiz(lessonId)
        setQuiz(data)
      } catch (error) {
        console.error('Lỗi tải quiz:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [lessonId])

  const handleSubmit = async () => {
    try {
      const response = await submitQuiz({
        userId: user.id,
        lessonId,
        answers: selectedAnswers
      })
      setResult(response)
    } catch (error) {
      console.error('Lỗi nộp bài:', error)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải quiz...</div>

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">🧪 Bài kiểm tra</h1>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        {quiz?.questions.map((q, i) => (
          <div key={i} className="mb-8">
            <p className="text-lg font-bold mb-4">{i + 1}. {q.question}</p>
            <div className="space-y-3">
              {q.options.map((option, j) => (
                <label key={j} className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name={`question-${i}`}
                    value={option}
                    onChange={() => setSelectedAnswers({...selectedAnswers, [i]: option})}
                    className="w-5 h-5"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {!result ? (
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700"
          >
            Nộp bài
          </button>
        ) : (
          <div className={`p-6 rounded-xl ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="text-2xl font-bold mb-2">
              {result.passed ? '✅ Chúc mừng!' : '❌ Chưa đạt'}
            </h2>
            <p className="text-lg">Điểm: {result.score}/{result.total}</p>
            {result.passed && (
              <button
                onClick={() => navigate('/courses')}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                Tiếp tục học →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz;