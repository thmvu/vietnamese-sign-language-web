import React, { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatBot = () => {
  // ===============================
  // STATE
  // ===============================
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Xin chào! Tôi là trợ lý AI hỗ trợ học Ngôn ngữ Ký hiệu Việt Nam. Bạn cần giúp gì không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ===============================
  // REF
  // ===============================
  const messagesEndRef = useRef(null);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const mappedMessages = data.data.map(msg => ({
          id: msg.id,
          role: msg.role,
          text: msg.content
        }));
        // Prepend the default welcome message if it's the first time
        setMessages(prev => [prev[0], ...mappedMessages]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const clearChatHistory = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch sử chat?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/chat/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Reset to welcome message
      setMessages([
        {
          id: 1,
          role: "bot",
          text: "Xin chào! Tôi là trợ lý AI hỗ trợ học Ngôn ngữ Ký hiệu Việt Nam. Bạn cần giúp gì không?",
        },
      ]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // ===============================
  // SEND MESSAGE
  // ===============================
  const handleSend = async (text = input) => {
    if (!text.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');

      const responseRes = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text
        })
      });

      const data = await responseRes.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "bot",
            text: data.data.message,
          },
        ]);
      } else {
        throw new Error(data.message || 'Lỗi từ máy chủ chatbot');
      }
    } catch (error) {
      console.error("ChatBot Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật kết nối với AI. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ===============================
  // QUICK QUESTIONS
  // ===============================
  const quickQuestions = [
    "Ký hiệu chữ A như thế nào?",
    "Học thủ ngữ có khó không?",
    "Làm sao để bắt đầu học?",
    "Cảm ơn bạn",
  ];

  // ===============================
  // UI
  // ===============================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl shadow-lg text-white">
            🤖
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Trợ lý AI học Thủ ngữ Việt Nam
            </h1>
            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Đang hoạt động
            </p>
          </div>
        </div>
        <button
          onClick={clearChatHistory}
          className="text-xs font-bold text-red-500 hover:text-red-700 underline flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-red-50 shadow-sm"
        >
          🗑️ Xóa lịch sử
        </button>
      </div>

      {/* CHAT BOX */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-1 border">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white text-slate-700 border rounded-tl-none"
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* TYPING */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                🤖
              </div>
              <div className="bg-white p-4 rounded-2xl border flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white border-t">
          {/* QUICK QUESTIONS */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-full border"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
              placeholder="Hỏi tôi về thủ ngữ Việt Nam..."
              className="flex-1 px-5 py-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold disabled:opacity-50"
            >
              Gửi 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
