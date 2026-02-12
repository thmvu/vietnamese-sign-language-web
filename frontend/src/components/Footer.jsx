import React from 'react'
import { Link } from 'react-router-dom' // Đã thêm import Link
import { Facebook, Youtube, Mail, Phone, MapPin, HandMetal } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-4">

        {/* Cột 1: Về VSL Learn - ĐÃ SỬA NỘI DUNG */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HandMetal size={20} />
            </div>
            <span className="text-xl font-extrabold">VSL Learn</span>
          </div>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Nền tảng học Ngôn ngữ Ký hiệu Việt Nam (VSL) trực tuyến hàng đầu. Sứ mệnh của chúng tôi là xóa bỏ rào cản giao tiếp và kết nối cộng đồng thông qua giáo dục dễ tiếp cận.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white transition">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Cột 2: Liên kết nhanh - ĐÃ SỬA LINK */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Khám phá</h3>
          <ul className="space-y-3">
            <li><Link to="/courses" className="hover:text-blue-400 transition">Danh sách khóa học</Link></li>
            <li><Link to="/practice" className="hover:text-blue-400 transition">Luyện tập với AI</Link></li>
            <li><a href="https://github.com/thmvu/vietnamese-sign-language-web" className="hover:text-blue-400 transition">Về dự án</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Câu hỏi thường gặp (FAQ)</a></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ trợ - ĐÃ SỬA LINK */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Điều khoản</h3>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-blue-400 transition">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Hướng dẫn thanh toán</a></li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ - ĐÃ SỬA CHO ĐẸP HƠN */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-blue-500" />
              <a href="mailto:support@vsl-learn.vn" className="hover:text-white">[EMAIL_ADDRESS]</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-blue-500" />
              <span>0868419498</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 mt-1" />
              <span>Đại học Phenikaa , Trường Công Nghệ Thông Tin ,<br />Hà Nội, Việt Nam</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        <p>© 2026 VSL Learn. Dự án phi lợi nhuận vì cộng đồng.</p>
      </div>
    </footer>
  )
}

export default Footer;