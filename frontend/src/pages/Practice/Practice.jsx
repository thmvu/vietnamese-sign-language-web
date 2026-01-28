import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// 1. Import Chatbot Component
import ChatBoxHelper from '../../components/ChatBoxHelper'

const Practice = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [prediction, setPrediction] = useState("Đang chờ camera...")
  const [confidence, setConfidence] = useState(0)
  const [feedback, setFeedback] = useState("Hãy đưa tay vào khung hình")
  
  // 2. State mới để điều khiển Chatbot
  const [showChat, setShowChat] = useState(false)
  const [aiContext, setAiContext] = useState({ label: '', confidence: 0 })

  const MOCK_RESPONSES = [
    { text: "Tuyệt vời! Động tác rất chuẩn.", score: 95, label: "Chính xác" },
    { text: "Hơi thấp, bạn hãy nâng tay cao lên chút.", score: 65, label: "Cần chỉnh sửa" },
    { text: "Đúng rồi! Giữ nguyên tư thế.", score: 88, label: "Tốt" },
    { text: "Chưa rõ hình dạng tay, thử lại nhé.", score: 40, label: "Thử lại" },
    { text: "Xuất sắc! Giống hệt video mẫu.", score: 98, label: "Hoàn hảo" }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      alert("Không thể mở camera. Vui lòng cấp quyền truy cập!");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setPrediction("Đã tắt camera");
    setConfidence(0);
    setFeedback("Bấm 'Bắt đầu' để luyện tập");
  };

  // Giả lập AI chạy
  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(() => {
        const randomRes = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
        
        // Cập nhật giao diện Practice
        setPrediction(randomRes.label);
        setConfidence(randomRes.score);
        setFeedback(randomRes.text);

        // 3. Cập nhật dữ liệu cho Chatbot biết để nó nhận xét
        // Chỉ gửi khi độ chính xác < 50 (cần sửa) hoặc > 90 (khen) để tránh spam
        setAiContext({ label: "động tác tay", confidence: randomRes.score });

      }, 3000); // Tăng lên 3s để đỡ giật và Chatbot kịp phản hồi
    }
    return () => clearInterval(interval);
  }, [isCameraOn]);

  useEffect(() => {
    return () => {
      stopCamera();
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">📷 Luyện tập với AI</h1>
        <button 
          onClick={() => navigate('/courses')} 
          className="text-slate-500 hover:text-blue-600 font-bold"
        >
          Thoát
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* KHUNG CAMERA */}
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-slate-200">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className={`w-full h-full object-cover transform scale-x-[-1] ${!isCameraOn && 'hidden'}`} 
            />
            
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <div className="text-6xl mb-4">🎥</div>
                <p>Camera đang tắt</p>
              </div>
            )}

            {isCameraOn && (
               <div className="absolute inset-0 border-4 border-dashed border-white/30 m-12 rounded-2xl pointer-events-none flex items-center justify-center">
                  <span className="text-white/50 text-sm bg-black/50 px-3 py-1 rounded-full">Khu vực nhận diện tay</span>
               </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            {!isCameraOn ? (
              <button 
                onClick={startCamera}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center gap-2"
              >
                ▶ Bắt đầu Camera
              </button>
            ) : (
              <button 
                onClick={stopCamera}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg shadow-red-200 transition-transform active:scale-95 flex items-center gap-2"
              >
                ⏹ Dừng lại
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR KẾT QUẢ */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
            isCameraOn 
              ? (confidence > 80 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200') 
              : 'bg-white border-slate-100'
          }`}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kết quả nhận diện</h3>
            <div className="text-4xl font-extrabold text-slate-800 mb-2">{prediction}</div>
            
            <div className="w-full bg-white/50 rounded-full h-4 mb-2 overflow-hidden border border-black/5">
               <div 
                 className={`h-full transition-all duration-500 ${confidence > 80 ? 'bg-green-500' : 'bg-orange-500'}`} 
                 style={{ width: `${confidence}%` }}
               ></div>
            </div>
            <div className="text-right text-sm font-bold text-slate-500">{confidence}% Chính xác</div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">AI Nhận xét</h3>
            <div className="flex gap-4">
              <div className="text-3xl">🤖</div>
              <p className="text-slate-700 font-medium leading-relaxed">"{feedback}"</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-3">💡 Hướng dẫn:</h3>
             <ul className="space-y-2 text-sm text-slate-500 list-disc pl-4">
                <li>Đảm bảo đủ ánh sáng.</li>
                <li>Đưa tay vào giữa khung hình.</li>
                <li>Giữ yên tay khoảng 1-2 giây.</li>
             </ul>
          </div>
        </div>
      </div>

      {/* 4. CHATBOT WIDGET */}
      {/* Nút bật Chat */}
      {!showChat && (
        <button 
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform z-40 animate-bounce"
        >
            <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Component ChatBoxHelper */}
      <ChatBoxHelper 
        contextData={aiContext} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
      
    </div>
  )
}

export default Practice;