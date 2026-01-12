import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="material-symbols-outlined text-blue-600 text-2xl">sign_language</span>
            <span className="font-bold text-lg text-slate-800">VSL Learning</span>
          </div>
          <p className="text-slate-500 text-sm max-w-sm">
            Nền tảng học tập ngôn ngữ ký hiệu Việt Nam thân thiện, dễ hiểu và hoàn toàn miễn phí.
          </p>
        </div>
        <div className="flex gap-8 text-sm font-bold text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Về chúng tôi</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Hỗ trợ</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Điều khoản</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-slate-50 text-center text-xs text-slate-400 font-medium">
        © 2024 VSL Learning. Đồ án môn học - Học thủ ngữ dễ dàng.
      </div>
    </footer>
  )
}

export default Footer;