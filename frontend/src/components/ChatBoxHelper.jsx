import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ CHÚ Ý: Đây là ví dụ gọi API thật. 
// Nếu chưa có key, bạn có thể dùng lại logic mock cũ hoặc đăng ký key free.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ChatBoxHelper = ({ contextData, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào bạn! Mình là trợ lý AI. Hãy bật Camera để mình hỗ trợ nhé!' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Tự động cuộn xuống
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Lắng nghe dữ liệu từ trang Practice (Context Data)
  useEffect(() => {
    if (contextData) {
      // Nếu độ chính xác thấp, AI tự động động viên
      if (contextData.confidence < 50 && contextData.confidence > 0) {
         handleAutoResponse(`Học viên đang làm động tác ${contextData.label} nhưng chưa chuẩn (chỉ ${contextData.confidence}%). Hãy đưa ra lời khuyên ngắn dưới 20 từ.`)
      }
      // Nếu làm tốt
      else if (contextData.confidence > 90) {
         handleAutoResponse(`Học viên làm động tác ${contextData.label} rất tốt (90%). Khen ngợi ngắn gọn dưới 10 từ.`)
      }
    }
  }, [contextData]) // Chạy lại khi data thay đổi

  const handleAutoResponse = async (systemPrompt) => {
     // Ở đây giả lập gọi Gemini (hoặc gọi thật nếu có key)
     setIsTyping(true);
     setTimeout(() => {
        // Logic giả: Tùy prompt mà trả về câu khác nhau
        let text = "Cố lên bạn ơi!";
        if(systemPrompt.includes("tốt")) text = "Tuyệt vời! Chuẩn không cần chỉnh 🎉";
        if(systemPrompt.includes("chưa chuẩn")) text = "Hình như ngón cái chưa đúng, bạn chỉnh lại xíu nhé! 🤔";
        
        setMessages(prev => [...prev, { role: 'bot', text: text }]);
        setIsTyping(false);
     }, 1000);
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Giả lập trả lời câu hỏi thường
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: "Mình đang quan sát tay bạn. Bạn cứ tập tiếp đi!" }])
      setIsTyping(false)
    }, 1000)
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-blue-600 p-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-sm">Trợ lý VSL</span>
        </div>
        <button onClick={onClose} className="hover:bg-blue-700 rounded-full p-1">✕</button>
      </div>

      {/* List tin nhắn */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-white border mr-auto max-w-[90%]'}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="text-xs text-slate-400 italic">AI đang nhập...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi trợ lý..."
          className="flex-1 text-sm border rounded-lg px-2 focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="text-blue-600 font-bold px-2">Gửi</button>
      </div>
    </div>
  )
}

export default ChatBoxHelper;