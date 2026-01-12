// const API_URL = 'http://localhost:5000/api'

// /**
//  * Hàm hỗ trợ gọi API chung (kèm Token nếu có)
//  */
// async function fetchAPI(endpoint, options = {}) {
//   const token = localStorage.getItem('token')
  
//   const headers = {
//     'Content-Type': 'application/json',
//     // Nếu có token thì thêm vào header Authorization
//     ...(token && { Authorization: `Bearer ${token}` }),
//     ...options.headers
//   }

//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, { 
//       ...options, 
//       headers 
//     })

//     const data = await response.json()

//     if (!response.ok) {
//       // Ném lỗi để component (try/catch) bắt được
//       throw new Error(data.message || 'Có lỗi xảy ra từ máy chủ')
//     }

//     return data
//   } catch (error) {
//     console.error('API Error:', error)
//     throw error // Ném lỗi tiếp ra ngoài
//   }
// }

// // --- AUTHENTICATION ---

// export const register = (userData) => {
//   return fetchAPI('/auth/register', {
//     method: 'POST',
//     body: JSON.stringify(userData)
//   })
// }

// export const login = (credentials) => {
//   // Backend cần trả về object dạng: { token: "...", user: { id: 1, name: "...", role: "..." } }
//   return fetchAPI('/auth/login', {
//     method: 'POST',
//     body: JSON.stringify(credentials)
//   })
// }

// // --- COURSES & LESSONS ---

// export const getCourses = () => {
//   // Backend cần trả về mảng khóa học []
//   return fetchAPI('/courses')
// }

// export const getLesson = (id) => {
//   // Backend cần trả về object bài học chi tiết (videoUrl, vocab...)
//   return fetchAPI(`/lessons/${id}`)
// }

// // --- QUIZZES ---

// export const getQuiz = (lessonId) => {
//   // Lấy quiz theo lessonId
//   return fetchAPI(`/quizzes/lesson/${lessonId}`)
// }

// export const submitQuiz = ({ userId, lessonId, answers }) => {
//   // Gửi kết quả làm bài lên server
//   return fetchAPI('/quizzes/submit', {
//     method: 'POST',
//     body: JSON.stringify({ userId, lessonId, answers })
//   })
// }

// // --- USER PROGRESS ---

// export const getUserProgress = (userId) => {
//   /* * Lưu ý: Nếu backend bạn chưa làm endpoint này, hãy bỏ comment phần mock bên dưới 
//    * và comment dòng return fetchAPI... lại để tránh lỗi.
//    */
  
//   // Cách 1: Gọi API thật (nếu backend đã có)
//   // return fetchAPI(`/users/${userId}/progress`) 

//   // Cách 2: Tạm thời Mock dữ liệu (nếu backend chưa xong phần này)
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         completedLessons: 5,
//         totalPoints: 150,
//         accuracy: 90
//       })
//     }, 500)
//   })
// }
/**
 * ĐÂY LÀ FILE GIẢ LẬP BACKEND (MOCK DATA)
 * Giúp chạy Frontend mà không cần bật Server thật.
 */

// 1. Dữ liệu giả (Database giả)
const MOCK_USERS = [
  {
    id: 1,
    name: 'Học viên Mẫu',
    email: 'user@example.com',
    password: '123', // Mật khẩu để đăng nhập
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

const MOCK_COURSES = [
  {
    id: 1,
    title: 'Nhập môn Ngôn ngữ Ký hiệu',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1594136976569-450cb05c21f7?auto=format&fit=crop&q=80&w=600',
    description: 'Học bảng chữ cái, số đếm và các câu chào hỏi cơ bản.',
    progress: 45,
    lessons: [
      { id: 1, title: 'Bài 1: Bảng chữ cái A-M' },
      { id: 2, title: 'Bài 2: Bảng chữ cái N-Z' }
    ]
  },
  {
    id: 2,
    title: 'Giao tiếp Công sở',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=600',
    description: 'Các từ vựng và mẫu câu dùng trong môi trường làm việc.',
    progress: 0,
    lessons: [
      { id: 3, title: 'Bài 1: Phỏng vấn' }
    ]
  },
  {
    id: 3,
    title: 'Chủ đề Gia đình',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600',
    description: 'Cách xưng hô và giới thiệu các thành viên trong gia đình.',
    progress: 0,
    lessons: []
  }
];

// Chi tiết bài học (Giả sử bài nào cũng trả về nội dung này để test)
const MOCK_LESSON_DETAIL = {
  id: 1,
  title: 'Bài 1: Bảng chữ cái A-M',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Link video YouTube mẫu
  vocab: [
    { word: 'A', meaning: 'Nắm tay lại, ngón cái áp vào cạnh ngón trỏ.' },
    { word: 'B', meaning: 'Mở bàn tay, khép các ngón lại, ngón cái gập vào lòng.' },
    { word: 'C', meaning: 'Cong các ngón tay tạo hình chữ C.' },
    { word: 'Xin chào', meaning: 'Chạm tay lên trán rồi đưa ra ngoài (kiểu chào nhà binh).' }
  ]
};

const MOCK_QUIZ = {
  id: 1,
  questions: [
    {
      question: "Ký hiệu nào dùng để biểu thị chữ 'A'?",
      options: ["Nắm tay", "Chữ C", "Ngón trỏ", "Bàn tay mở"],
      correctAnswer: "Nắm tay"
    },
    {
      question: "Hình ảnh này nghĩa là gì?",
      options: ["Xin chào", "Cảm ơn", "Tạm biệt", "Xin lỗi"],
      correctAnswer: "Xin chào"
    }
  ]
};

// Hàm tạo độ trễ giả (để thấy hiệu ứng Loading xoay xoay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CÁC HÀM API GIẢ (Export ra cho các trang dùng) ---

export const login = async ({ email, password }) => {
  await delay(1000); // Giả vờ mạng chậm 1 giây
  
  // Tìm user trong danh sách giả
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    return { 
      token: 'fake-jwt-token-vip-pro', // Token giả
      user: user 
    };
  }
  
  throw new Error('Sai email hoặc mật khẩu rồi bạn ơi! (Thử: user@example.com / 123)');
};

export const register = async (userData) => {
  await delay(1000);
  return { success: true, message: 'Đăng ký ảo thành công!' };
};

export const getCourses = async () => {
  await delay(500);
  return MOCK_COURSES;
};

export const getLesson = async (lessonId) => {
  await delay(800);
  // Luôn trả về bài học mẫu, nhưng gán ID theo cái người dùng bấm
  return { ...MOCK_LESSON_DETAIL, id: lessonId };
};

export const getQuiz = async (lessonId) => {
  await delay(600);
  return MOCK_QUIZ;
};

export const submitQuiz = async (data) => {
  await delay(1000);
  // Logic chấm điểm giả
  let score = 0;
  const total = MOCK_QUIZ.questions.length;
  
  // Hack nhẹ: Cứ chọn đáp án A là đúng để test cho nhanh :)) 
  // Hoặc logic thật:
  const answers = data.answers; 
  // (Ở đây mình random kết quả cho vui để test UI)
  const passed = Object.keys(answers).length >= 1; // Cứ làm bài là đậu

  return {
    passed: true,
    score: total, // 10 điểm
    total: total
  };
};

export const getUserProgress = async (userId) => {
  await delay(500);
  // Tìm user hoặc lấy mặc định
  const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
  return user.progress || { accuracy: 0, completedLessons: 0 };
};