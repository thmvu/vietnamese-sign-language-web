import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const isDev = import.meta.env.DEV;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple retry logic for network errors
let retryCount = 0;
const MAX_RETRIES = 3;

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (isDev) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    if (isDev) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Handle response errors globally with retry logic
api.interceptors.response.use(
  (response) => {
    // Reset retry count on success
    retryCount = 0;

    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }

    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log errors in development
    if (isDev) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for network errors
    if (!error.response && retryCount < MAX_RETRIES && !originalRequest._retry) {
      retryCount++;
      originalRequest._retry = true;

      if (isDev) {
        console.log(`[API Retry] Attempt ${retryCount}/${MAX_RETRIES} for ${originalRequest.url}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));

      return api(originalRequest);
    }

    // Create user-friendly error message
    const errorMessage = error.response?.data?.message
      || error.message
      || 'Đã xảy ra lỗi không xác định';

    // Enhance error object with Vietnamese message
    const enhancedError = {
      ...error,
      userMessage: !error.response
        ? `Không thể kết nối với server. Vui lòng kiểm tra:\n1. Backend có đang chạy không? (port 5000)\n2. Kết nối mạng của bạn\n3. Firewall/Antivirus có chặn không?`
        : error.response.status >= 500
          ? `Lỗi server (${error.response.status}): ${errorMessage}`
          : errorMessage
    };

    return Promise.reject(enhancedError);
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

// Admin course management
export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const updateCourse = async (id, courseData) => {
  const response = await api.put(`/courses/${id}`, courseData);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response;
};

export const completeCourse = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/complete`);
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

export const getUserProgressStats = async () => {
  const response = await api.get('/progress/stats');
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
