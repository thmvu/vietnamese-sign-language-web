import React from "react"
import { Link, useLocation } from "react-router-dom"

const Header = ({ user, onLogout }) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-600 bg-sky-50 font-bold" // Đã đổi text-primary thành text-blue-600 để chắc chắn hiện màu xanh
      : "text-slate-500 hover:text-blue-600 hover:bg-slate-50 font-medium"
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          
          {/* --- PHẦN LOGO ĐƯỢC SỬA --- */}
          <Link to="/courses" className="flex items-center gap-3 group">
            
            {/* Thay thế div gradient cũ bằng thẻ img */}
            <img 
              src="logo.png" 
              alt="Logo" 
              className="h-11 w-11 object-contain rounded-xl shadow-lg transition-transform group-hover:scale-105 bg-white"
            />

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-800 leading-none">
                VSL Learning
              </span>
              <span className="text-xs font-bold text-slate-400 mt-1">Học ký hiệu vui vẻ</span>
            </div>
          </Link>
          {/* --- HẾT PHẦN LOGO --- */}

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/courses" className={`px-5 py-2.5 rounded-full text-sm transition-all ${isActive("/courses")}`}>
              Khóa học
            </Link>
            <Link to="/practice" className={`px-5 py-2.5 rounded-full text-sm transition-all ${isActive("/practice")}`}>
              Luyện tập
            </Link>
            <Link to="/chatbot" className={`px-5 py-2.5 rounded-full text-sm transition-all ${isActive("/chatbot")}`}>
              ChatBot AI
            </Link>
            <Link to="/account" className={`px-5 py-2.5 rounded-full text-sm transition-all ${isActive("/account")}`}>
              Tài khoản
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={`px-5 py-2.5 rounded-full text-sm transition-all ${isActive("/admin")}`}>
                Quản trị
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/account" className="flex items-center gap-3 group">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
              <img 
                src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User')} 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'Người dùng'}</p>
              <p className="text-xs text-slate-500 font-semibold">{user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</p>
            </div>
          </Link>

          <button
            onClick={onLogout}
            className="ml-2 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-all"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;