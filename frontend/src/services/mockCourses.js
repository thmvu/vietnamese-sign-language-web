/**
 * src/services/mockCourses.js
 * Giả lập Backend chuyên nghiệp cho Khóa học & Bài tập
 */

// --- 1. DỮ LIỆU KHÓA HỌC (COURSES) ---
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Nhập môn Ngôn ngữ Ký hiệu',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1594136976569-450cb05c21f7?auto=format&fit=crop&q=80&w=600',
    description: 'Học bảng chữ cái, số đếm và các câu chào hỏi cơ bản dành cho người mới bắt đầu.',
    progress: 45, // Đã học 45%
    lessons: [
      { id: 1, title: 'Bài 1: Bảng chữ cái A-M' },
      { id: 2, title: 'Bài 2: Bảng chữ cái N-Z' },
      { id: 3, title: 'Bài 3: Số đếm 1-10' }
    ]
  },
  {
    id: 2,
    title: 'Giao tiếp Công sở',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&q=80&w=600',
    description: 'Các từ vựng và mẫu câu dùng trong môi trường làm việc chuyên nghiệp.',
    progress: 0, // Chưa học
    lessons: [
      { id: 4, title: 'Bài 1: Phỏng vấn xin việc' },
      { id: 5, title: 'Bài 2: Họp và thảo luận' }
    ]
  },
  {
    id: 3,
    title: 'Chủ đề Gia đình & Đời sống',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600',
    description: 'Cách xưng hô và giới thiệu các thành viên trong gia đình, đồ vật trong nhà.',
    progress: 10,
    lessons: [
      { id: 6, title: 'Bài 1: Các thành viên gia đình' }
    ]
  }
];

// --- 2. DỮ LIỆU CHI TIẾT BÀI HỌC (LESSON DETAIL) ---
// (Dùng chung mẫu này cho mọi bài học để test cho tiện)
const MOCK_LESSON_DETAIL = {
  id: 1,
  title: 'Bài học mẫu: Bảng chữ cái',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Link video demo
  vocab: [
    { word: 'A', meaning: 'Nắm tay lại, ngón cái áp vào cạnh ngón trỏ.' },
    { word: 'B', meaning: 'Mở bàn tay, khép các ngón lại, ngón cái gập vào lòng.' },
    { word: 'C', meaning: 'Cong các ngón tay tạo hình chữ C.' },
    { word: 'Xin chào', meaning: 'Chạm tay lên trán rồi đưa ra ngoài (kiểu chào nhà binh).' },
    { word: 'Cảm ơn', meaning: 'Đặt tay lên môi rồi đưa xuống ngực.' }
  ]
};

// --- 3. DỮ LIỆU CÂU HỎI TRẮC NGHIỆM (QUIZ) ---
const MOCK_QUIZZES = {
  // Quiz riêng cho bài có ID = 1
  1: [ 
    {
      id: 1,
      question: "Chữ 'A' trong thủ ngữ được ký hiệu như thế nào?",
      options: ["Nắm tay, ngón cái áp sát ngón trỏ", "Xòe cả bàn tay", "Chỉ ngón trỏ lên trời", "Nắm tay, ngón cái thò ra ngoài"],
      correctAnswer: "Nắm tay, ngón cái áp sát ngón trỏ"
    },
    {
      id: 2,
      question: "Khi chào hỏi người khiếm thính, bạn nên làm gì đầu tiên?",
      options: ["Hét lớn vào tai họ", "Vỗ vai nhẹ hoặc vẫy tay", "Ném đồ vật vào họ", "Quay mặt đi chỗ khác"],
      correctAnswer: "Vỗ vai nhẹ hoặc vẫy tay"
    },
    {
      id: 3,
      question: "Thủ ngữ có phải là ngôn ngữ quốc tế dùng chung cho cả thế giới không?",
      options: ["Có, cả thế giới dùng chung 1 loại", "Không, mỗi nước có thủ ngữ riêng", "Chỉ dùng ở Châu Á", "Chỉ dùng ở Châu Âu"],
      correctAnswer: "Không, mỗi nước có thủ ngữ riêng"
    }
  ],
  // Quiz mặc định cho các bài khác (Fallback)
  default: [
    {
      id: 1,
      question: "Đây là câu hỏi mẫu. Thủ ngữ dùng bộ phận nào nhiều nhất?",
      options: ["Chân", "Tay và biểu cảm khuôn mặt", "Mắt", "Tai"],
      correctAnswer: "Tay và biểu cảm khuôn mặt"
    },
    {
      id: 2,
      question: "Bạn có thích học thủ ngữ không?",
      options: ["Rất thích", "Bình thường", "Không thích", "Khó quá"],
      correctAnswer: "Rất thích"
    }
  ]
};

// Hàm tạo độ trễ giả (Giả lập mạng chậm)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// --- CÁC HÀM API ĐƯỢC EXPORT RA NGOÀI ---
// ==========================================

// 1. Lấy danh sách khóa học
export const getCoursesAPI = async () => {
  await delay(800); // Loading 0.8s
  return MOCK_COURSES;
};

// 2. Lấy chi tiết bài học theo ID
export const getLessonAPI = async (lessonId) => {
  await delay(800);
  
  // Tìm xem bài học có thuộc Course nào không để lấy Title thật (Optional)
  let foundTitle = null;
  MOCK_COURSES.forEach(course => {
    const lesson = course.lessons.find(l => l.id == lessonId);
    if (lesson) foundTitle = lesson.title;
  });

  // Trả về dữ liệu mock, nhưng override ID và Title cho khớp
  return { 
    ...MOCK_LESSON_DETAIL, 
    id: lessonId,
    title: foundTitle || MOCK_LESSON_DETAIL.title 
  };
};

// 3. Lấy đề thi trắc nghiệm theo ID bài học
export const getQuizAPI = async (lessonId) => {
  await delay(600);
  // Nếu bài đó có quiz riêng thì lấy, không thì lấy bài default
  return MOCK_QUIZZES[lessonId] || MOCK_QUIZZES['default'];
};

// 4. Nộp bài và chấm điểm
export const submitQuizAPI = async (userId, lessonId, answers) => {
  await delay(1000); // Giả lập server đang chấm bài
  
  const questions = MOCK_QUIZZES[lessonId] || MOCK_QUIZZES['default'];
  let score = 0;
  
  // Logic chấm điểm thật
  questions.forEach((q, index) => {
    // So sánh đáp án người dùng chọn với đáp án đúng
    if (answers[index] === q.correctAnswer) {
      score++;
    }
  });

  const passed = score >= (questions.length / 2); // Đúng >= 50% là qua môn
  
  return {
    success: true,
    score: score,
    total: questions.length,
    passed: passed
  };
};