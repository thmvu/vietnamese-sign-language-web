import React, { useState, useEffect } from 'react'
import { getUserProgressStats } from '../../services/api'

const Account = ({ user }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getUserProgressStats()
        setStats(data)
      } catch (error) {
        console.error('Lỗi tải tiến độ:', error)
        setStats({ completedLessons: 0, totalLessons: 0, courseProgress: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

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
                <span className="text-slate-600">Tổng tiến độ</span>
                <span className="font-bold">{stats?.completedLessons || 0} / {stats?.totalLessons || 0} bài</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${stats?.totalLessons > 0 ? Math.round((stats?.completedLessons / stats?.totalLessons) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Course Progress */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Tiến độ từng khóa học</h3>
              <div className="space-y-4">
                {stats?.courseProgress?.map(course => (
                  <div key={course.courseId}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700 font-medium">{course.courseName}</span>
                      <span className="text-sm text-slate-600">
                        {course.completed}/{course.total} bài ({course.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${course.percentage >= 80 ? 'bg-green-500' :
                          course.percentage >= 50 ? 'bg-blue-500' :
                            course.percentage >= 20 ? 'bg-yellow-500' :
                              'bg-slate-400'
                          }`}
                        style={{ width: `${course.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
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
    </div >
  )
}

export default Account;