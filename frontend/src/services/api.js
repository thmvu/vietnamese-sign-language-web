import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// --- AUTHENTICATION ---

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // response structure: { success: true, data: { user, accessToken, refreshToken } }

  if (response.data?.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  if (response.data?.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
  }
  return response;
};

// --- COURSES ---

export const getCourses = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data?.courses || response.data || [];
};

export const getCourse = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const getCourseLessons = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/lessons`);
  return response.data;
};

// --- LESSONS ---

export const getLesson = async (id) => {
  const response = await api.get(`/lessons/${id}`);
  return response.data;
};

export const getLessonVideos = async (lessonId) => {
  const response = await api.get(`/videos/lesson/${lessonId}`);
  return response.data;
};

// --- QUIZZES ---

export const getQuiz = async (lessonId) => {
  const response = await api.get(`/quizzes/${lessonId}`);
  return response.data;
};

export const submitQuiz = async (lessonId, answers) => {
  const response = await api.post(`/quizzes/${lessonId}/submit`, { answers });
  return response.data;
};

// --- PROGRESS ---

export const getUserProgress = async () => {
  const response = await api.get('/progress/me');
  return response.data;
};

export const saveProgress = async (progressData) => {
  const response = await api.post('/progress/save', progressData);
  return response.data;
};

// --- PRACTICE (AI) ---

export const evaluatePractice = async (landmarks) => {
  const response = await api.post('/practice/evaluate', { landmarks });
  return response.data;
};

// --- CHAT ---

export const sendChatMessage = async (message, conversationHistory = []) => {
  const response = await api.post('/chat', { message, conversationHistory });
  return response.data;
};

export default api;
