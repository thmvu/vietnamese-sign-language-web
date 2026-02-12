import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext' // 1. Gọi ông chủ mới

// Import các trang
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home/Home'
import CourseList from './pages/Course/CourseList'
import CourseDetail from './pages/Course/CourseDetail'
import LessonDetail from './pages/Lesson/LessonDetail'
import Quiz from './pages/Quiz/Quiz'
import Practice from './pages/Practice/Practice'
import ChatBot from './pages/ChatBot/ChatBot'
import Account from './pages/Account/Account'
import AdminDashboard from './pages/Admin/AdminDashboard'

// Component bảo vệ (đã làm ở bước trước)
import ProtectedRoute from './components/ProtectedRoute'

// --- COMPONENT CON: Điều hướng & Giao diện ---
const AppRoutes = () => {
  const { user, logout } = useAuth(); // Lấy user từ Context

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header nhận dữ liệu từ Context để hiển thị Avatar/Tên */}
      {user && <Header user={user} onLogout={logout} />}

      <main className="flex-grow">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Nếu đã có user -> tự đá sang CourseList, ngược lại hiện Home */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />

          {/* --- PROTECTED ROUTES (Cần đăng nhập) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CourseList />} />

            {/* Truyền user vào các trang con (để code cũ của bạn không bị lỗi) */}
            <Route path="/courses/:id" element={<CourseDetail user={user} />} />
            <Route path="/lesson/:id" element={<LessonDetail user={user} />} />
            <Route path="/quiz/:lessonId" element={<Quiz user={user} />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/account" element={<Account user={user} />} />

            {/* Admin Route */}
            <Route path="/admin/*" element={
              user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

// --- APP CHÍNH ---
function App() {
  return (
    <BrowserRouter>
      {/* Bao bọc toàn bộ App bằng AuthProvider */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;