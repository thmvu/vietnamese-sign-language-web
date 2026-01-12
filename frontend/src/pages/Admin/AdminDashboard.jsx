import React, { useState } from 'react'
import { Link, Routes, Route } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">🛠️ Quản trị hệ thống</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/users" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="font-bold text-lg mb-1">Người dùng</h3>
          <p className="text-slate-600 text-sm">Quản lý tài khoản</p>
        </Link>

        <Link to="/admin/lessons" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="font-bold text-lg mb-1">Bài học</h3>
          <p className="text-slate-600 text-sm">Quản lý nội dung</p>
        </Link>

        <Link to="/admin/quizzes" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-2">🧪</div>
          <h3 className="font-bold text-lg mb-1">Quiz</h3>
          <p className="text-slate-600 text-sm">Quản lý câu hỏi</p>
        </Link>

        <Link to="/admin/stats" className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="font-bold text-lg mb-1">Thống kê</h3>
          <p className="text-slate-600 text-sm">Báo cáo chi tiết</p>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="stats" element={<AdminStats />} />
        </Routes>
      </div>
    </div>
  )
}

const AdminHome = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold mb-4">Chào mừng đến trang quản trị</h2>
    <p className="text-slate-600">Chọn một mục bên trên để bắt đầu</p>
  </div>
)

const AdminUsers = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Quản lý người dùng</h2>
    <p className="text-slate-600">Danh sách người dùng sẽ hiển thị ở đây...</p>
  </div>
)

const AdminLessons = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Quản lý bài học</h2>
    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl mb-6">
      + Thêm bài học mới
    </button>
    <p className="text-slate-600">Danh sách bài học sẽ hiển thị ở đây...</p>
  </div>
)

const AdminQuizzes = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Quản lý Quiz</h2>
    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl mb-6">
      + Thêm quiz mới
    </button>
    <p className="text-slate-600">Danh sách quiz sẽ hiển thị ở đây...</p>
  </div>
)

const AdminStats = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Thống kê</h2>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-xl">
        <p className="text-sm text-slate-600 mb-1">Tổng người dùng</p>
        <p className="text-3xl font-bold text-blue-600">1,234</p>
      </div>
      <div className="bg-green-50 p-6 rounded-xl">
        <p className="text-sm text-slate-600 mb-1">Tổng bài học</p>
        <p className="text-3xl font-bold text-green-600">48</p>
      </div>
      <div className="bg-purple-50 p-6 rounded-xl">
        <p className="text-sm text-slate-600 mb-1">Hoàn thành</p>
        <p className="text-3xl font-bold text-purple-600">89%</p>
      </div>
    </div>
  </div>
)

export default AdminDashboard;