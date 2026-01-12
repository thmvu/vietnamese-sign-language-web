const API_URL = 'http://localhost:5000/api'

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  const data = await response.json()

  if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra')
  return data
}

export const register = (userData) => fetchAPI('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData)
})

export const login = (credentials) => fetchAPI('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
})

export const getCourses = () => fetchAPI('/courses')

export const getLesson = (lessonId) => fetchAPI(`/lessons/${lessonId}`)

export const getQuiz = (lessonId) => fetchAPI(`/quizzes/lesson/${lessonId}`)

export const submitQuiz = (data) => fetchAPI('/quizzes/submit', {
  method: 'POST',
  body: JSON.stringify(data)
})
export const getUserProgress = async () => {
  return {
    completedLessons: 4,
    totalLessons: 20,
    totalPoints: 120,
    accuracy: 85
  };
};