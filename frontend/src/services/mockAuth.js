// src/services/mockAuth.js

// 1. Dữ liệu User (Lấy từ code cũ của bạn)
const MOCK_USERS = [
  {
    id: 1,
    name: 'Học viên Mẫu',
    email: 'user@example.com',
    password: '123',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    points: 120,
    progress: { accuracy: 85, completedLessons: 12 }
  },
  {
    id: 2,
    name: 'Quản trị viên',
    email: 'admin@example.com',
    password: '123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 2. API Login
export const loginAPI = async (email, password) => {
  await delay(1000); 
  
  // Logic tìm user xịn của bạn
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    return { 
      token: 'fake-jwt-token-vip-pro', 
      user: user 
    };
  }
  
  throw new Error('Sai email hoặc mật khẩu! (Thử: user@example.com / 123)');
};

// 3. API Lấy thông tin (dùng cho F5)
export const getUserProfileAPI = async (token) => {
  await delay(500);
  // Mặc định trả về user đầu tiên để test nếu token đúng
  if (token === 'fake-jwt-token-vip-pro') {
    return MOCK_USERS[0];
  }
  throw new Error("Token hết hạn");
};