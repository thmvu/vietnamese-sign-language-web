import React, { useState } from "react"
import { useAuth } from "../../context/AuthContext" // ✅ 1. Gọi Context
// Import ảnh (giữ nguyên của bạn)
import heroImg from '../../assets/hero-img.png' 

const Home = () => { // ❌ Không nhận prop onLogin nữa
  const { login } = useAuth(); // ✅ 2. Lấy hàm login từ Context
  
  const [showAuth, setShowAuth] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        // Tạm thời giả lập đăng ký thành công (vì chưa có backend thật)
        await new Promise(r => setTimeout(r, 1000));
        alert('✅ Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.')
        setIsRegister(false)
      } else {
        // ✅ 3. Gọi Login của Context (nó tự lưu token và chuyển trang)
        const result = await login(formData.email, formData.password)
        
        if (!result.success) {
           setError(result.message) // Hiện lỗi nếu sai pass
        } 
        // Nếu thành công, Context tự chuyển trang (trong App.jsx đã có logic Navigate)
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  // --- Phần giao diện giữ nguyên (chỉ thay đổi logic bên trên) ---
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-16 lg:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 blur-3xl rounded-full -translate-x-1/3 -translate-y-1/3 -z-10"></div>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex flex-col gap-8 lg:w-1/2">
             {/* Logo & Text Giới thiệu (Giữ nguyên) */}
            <div className="inline-flex self-start items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100">
               <span className="text-lg">👋</span> Chào mừng bạn!
            </div>
            <h1 className="text-slate-800 text-5xl lg:text-6xl font-bold leading-tight">
              Chào mừng đến với <br />
              <span className="text-blue-600">Thế giới Thủ ngữ!</span>
            </h1>
            <p className="text-slate-600 text-xl">
              Nơi học tập vui vẻ, kết nối trái tim qua từng ngón tay.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="self-start px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-full shadow-lg transition-all"
            >
              Bắt đầu học ngay →
            </button>
          </div>
          
          <div className="lg:w-1/2">
            <img 
                src={heroImg} 
                alt="Hero Illustration" 
                className="w-full rounded-3xl shadow-xl object-cover" 
            />
          </div>
        </div>
      </section>

      {/* Phần Lợi ích (Giữ nguyên code của bạn) */}
      <section className="w-full bg-white py-20">
         {/* ...Copy lại đoạn map lợi ích của bạn... */}
          <div className="max-w-7xl mx-auto px-6">
           <h2 className="text-4xl font-bold text-center mb-12">Tại sao học thủ ngữ?</h2>
           <div className="grid md:grid-cols-3 gap-8">
             {[
               { icon: 'forum', title: 'Giao tiếp dễ dàng', desc: 'Kết nối cộng đồng' },
               { icon: 'psychology', title: 'Phát triển tư duy', desc: 'Kích thích não bộ' },
               { icon: 'diversity_1', title: 'Yêu thương lan tỏa', desc: 'Tham gia cộng đồng' }
             ].map((item, i) => (
               <div key={i} className="bg-slate-50 p-8 rounded-2xl text-center">
                 {/* Icon dùng Google Font Material Icons hoặc Lucide */}
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-xl">★</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                 <p className="text-slate-600">{item.desc}</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* Modal Auth (Giữ nguyên logic hiển thị form) */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-6">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <input
                  type="text" placeholder="Họ tên" required
                  className="w-full px-4 py-3 border rounded-xl"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              )}
              <input
                type="email" placeholder="Email" required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input
                type="password" placeholder="Mật khẩu" required
                className="w-full px-4 py-3 border rounded-xl"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng ký' : 'Đăng nhập')}
              </button>
            </form>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full mt-4 text-blue-600 font-bold"
            >
              {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home;