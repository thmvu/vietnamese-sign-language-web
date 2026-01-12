import React, { useState, useEffect } from 'react'
import { getUserProgress } from '../../services/api'

const Account = ({ user }) => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getUserProgress(user.id)
        setProgress(data)
      } catch (error) {
        console.error('Lỗi tải tiến độ:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user.id])

  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">👤 Tài khoản của bạn</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name)} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full"
              />
              <div>
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Vai trò</p>
              <p className="font-bold">{user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</p>
            </div>
          </div>
        </div>

        {/* Tiến độ học tập */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-xl font-bold mb-6">📊 Tiến độ học tập</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Bài đã hoàn thành</span>
                <span className="font-bold">{progress?.completedLessons || 0} / {progress?.totalLessons || 0}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all" 
                  style={{width: `${(progress?.completedLessons / progress?.totalLessons * 100) || 0}%`}}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Tổng điểm</p>
                <p className="text-2xl font-bold text-blue-600">{progress?.totalPoints || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Độ chính xác</p>
                <p className="text-2xl font-bold text-green-600">{progress?.accuracy || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white rounded-3xl p-8 shadow-lg mt-8">
        <h2 className="text-xl font-bold mb-6">🔒 Đổi mật khẩu</h2>
        <form className="space-y-4 max-w-md">
          <input
            type="password"
            placeholder="Mật khẩu hiện tại"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  )
}

export default Account;