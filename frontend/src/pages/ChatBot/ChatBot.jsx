import React, { useState } from 'react'

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn về thủ ngữ?' }
  ])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (!input.trim()) return

    setMessages([...messages, { role: 'user', text: input }])
    
    // Giả lập response từ AI
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Tôi đã nhận được câu hỏi của bạn. Tính năng AI đang được phát triển.'
      }])
    }, 1000)

    setInput('')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">🤖 ChatBot AI</h1>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Nhập câu hỏi..."
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBot;