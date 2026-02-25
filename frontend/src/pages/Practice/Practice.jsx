import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHandTracking } from '../../hooks/useHandTracking'
import { evaluatePractice } from '../../services/api'
import ChatBoxHelper from '../../components/ChatBoxHelper'

const Practice = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [prediction, setPrediction] = useState('Đang chờ...')
  const [confidence, setConfidence] = useState(0)
  const [feedback, setFeedback] = useState('Hãy đưa tay vào khung hình')
  const [aiStatus, setAiStatus] = useState('idle') // idle | loading | ok | error
  const [showChat, setShowChat] = useState(false)
  const [aiContext, setAiContext] = useState({ label: '', confidence: 0 })
  const [history, setHistory] = useState([]) // [ {id, label, confidence, time} ]

  // Hook MediaPipe - chỉ bật khi camera on
  const { landmarks, isDetected, isReady, frameSequence, sequenceProgress } = useHandTracking(videoRef, canvasRef, isCameraOn)

  // In-flight lock: không gọi trùng request, cooldown 500ms sau khi nhận kết quả
  const isCallingRef = useRef(false)
  const lastCallRef = useRef(0)
  const callAiService = useCallback(async (frames) => {
    const now = Date.now()
    if (isCallingRef.current) return           // đang chờ kết quả → bỏ qua
    if (now - lastCallRef.current < 3000) return // cooldown 3s để đủ thời gian thao tác

    isCallingRef.current = true
    lastCallRef.current = now
    setAiStatus('loading')
    try {
      const result = await evaluatePractice(frames)
      if (result?.success && result?.data) {
        const { predicted_sign, confidence: conf, feedback: fb } = result.data
        setPrediction(predicted_sign || 'Không nhận ra')
        setConfidence(Math.round((conf || 0) * 100))
        setFeedback(fb || '')
        setAiContext({ label: predicted_sign, confidence: Math.round((conf || 0) * 100) })
        setAiStatus('ok')

        // Thêm vào lịch sử (chỉ thêm if confidence > 20% để tránh rác)
        if (predicted_sign && conf > 0.2) {
          setHistory(prev => [
            {
              id: Date.now(),
              label: predicted_sign,
              confidence: Math.round(conf * 100),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            },
            ...prev
          ].slice(0, 20)) // Giữ tối đa 20 mục
        }
      }
    } catch (err) {
      console.warn('[Practice] AI call failed:', err)
      setAiStatus('error')
      setFeedback('AI Service chưa sẵn sàng. Kiểm tra Python service.')
    } finally {
      isCallingRef.current = false
    }
  }, [])

  // Khi frameSequence đủ 100 frame → gọi AI
  useEffect(() => {
    if (frameSequence && isDetected && isCameraOn) {
      callAiService(frameSequence)
    }
    if (!isDetected && isCameraOn) {
      setPrediction('Không thấy tay')
      setConfidence(0)
      setFeedback('Đưa tay vào giữa khung hình')
      setAiStatus('idle')
    }
  }, [frameSequence, isDetected, isCameraOn, callAiService])

  // Bật camera (MediaPipe tự quản lý stream)
  const startCamera = async () => {
    try {
      // Yêu cầu quyền camera trước
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOn(true)
      setPrediction('Đang tải MediaPipe...')
      setFeedback('Vui lòng chờ model load xong')
    } catch {
      alert('Không thể mở camera. Vui lòng cấp quyền truy cập!')
    }
  }

  // Tắt camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
    setPrediction('Đã tắt camera')
    setConfidence(0)
    setFeedback("Bấm 'Bắt đầu' để luyện tập")
    setAiStatus('idle')
  }

  // Cleanup khi unmount
  useEffect(() => () => stopCamera(), [])

  // Đổi feedback khi MediaPipe ready
  useEffect(() => {
    if (isReady && isCameraOn) {
      setFeedback('MediaPipe đã sẵn sàng! Đưa tay vào khung hình.')
    }
  }, [isReady, isCameraOn])

  // Helper: màu confidence bar
  const barColor = confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-yellow-500' : 'bg-orange-500'
  const cardBg = isCameraOn
    ? (confidence > 80 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200')
    : 'bg-white border-slate-100'

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">📷 Luyện tập với AI</h1>
        <div className="flex items-center gap-4">
          {/* AI Status badge */}
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${aiStatus === 'ok' ? 'bg-green-100 text-green-700' :
            aiStatus === 'error' ? 'bg-red-100 text-red-700' :
              aiStatus === 'loading' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-500'
            }`}>
            {aiStatus === 'ok' ? '🟢 AI Online' :
              aiStatus === 'error' ? '🔴 AI Offline' :
                aiStatus === 'loading' ? '🔵 Đang nhận diện...' : '⚪ Chờ'}
          </span>
          <button onClick={() => navigate('/courses')} className="text-slate-500 hover:text-blue-600 font-bold">
            Thoát
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* KHUNG CAMERA + CANVAS OVERLAY */}
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-slate-200">

            {/* Video mirrored */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${!isCameraOn && 'hidden'}`}
            />

            {/* Canvas skeleton overlay (cũng mirror theo video) */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full transform scale-x-[-1] pointer-events-none ${!isCameraOn && 'hidden'}`}
              style={{ mixBlendMode: 'normal' }}
            />

            {/* Placeholder khi tắt camera */}
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <div className="text-6xl mb-4">🎥</div>
                <p>Camera đang tắt</p>
              </div>
            )}

            {/* Khu vực guide */}
            {isCameraOn && (
              <div className="absolute inset-0 border-4 border-dashed border-white/30 m-12 rounded-2xl pointer-events-none flex items-end justify-center pb-3">
                <span className={`text-xs px-3 py-1 rounded-full ${isDetected ? 'bg-green-500/80 text-white' : 'bg-black/50 text-white/70'}`}>
                  {isDetected ? '✋ Phát hiện bàn tay' : 'Đưa tay vào đây'}
                </span>
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
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg shadow-red-200 transition-transform active:scale-95"
              >
                ⏹ Dừng lại
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR KẾT QUẢ */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${cardBg}`}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kết quả nhận diện</h3>
            <div className="text-4xl font-extrabold text-slate-800 mb-3 min-h-[3rem] flex items-center">
              {prediction}
            </div>
            <div className="w-full bg-white/50 rounded-full h-4 mb-2 overflow-hidden border border-black/5">
              <div
                className={`h-full transition-all duration-700 ${barColor}`}
                style={{ width: `${confidence}%` }}
              />
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

          {/* LỊCH SỬ NHẬN DIỆN */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">📜 Lịch sử nhận dạng</h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                  <span className="text-2xl mb-2">🎈</span>
                  Chưa có dữ liệu
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                    <div>
                      <div className="font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{item.time}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${item.confidence > 80 ? 'bg-green-100 text-green-700' :
                      item.confidence > 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                      {item.confidence}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3">💡 Hướng dẫn:</h3>
            <ul className="space-y-2 text-sm text-slate-500 list-disc pl-4">
              <li>Đảm bảo đủ ánh sáng.</li>
              <li>Đưa tay vào giữa khung hình.</li>
              <li>Thực hiện ký hiệu trong <strong>~3-4 giây</strong> để bar đầy.</li>
              <li>Khi bar đầy 100% → AI nhận diện và reset tự động.</li>
              <li>Bạn có thể thực hiện ký hiệu tiếp theo ngay sau đó.</li>
            </ul>

            {/* Buffer progress bar */}
            {isCameraOn && isDetected && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Đang thu thập (~3-4 giây)</span>
                  <span>{sequenceProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${sequenceProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${sequenceProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {sequenceProgress < 100
                    ? `Thực hiện ký hiệu... ${sequenceProgress}%`
                    : '✅ Đang nhận diện, giữ nguyên tay!'}
                </p>
              </div>
            )}
          </div>

          {/* Hướng dẫn chạy AI Service */}
          {aiStatus === 'error' && (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-sm">
              <p className="font-bold text-red-700 mb-1">⚠️ AI Service chưa chạy</p>
              <p className="text-slate-600 mb-2">Mở terminal và chạy lệnh:</p>
              <code className="bg-slate-100 px-2 py-1 rounded text-xs block text-slate-700">
                cd aiservice<br />
                uvicorn api:app --reload
              </code>
            </div>
          )}
        </div>
      </div>

      {/* CHATBOT WIDGET */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform z-40 animate-bounce"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      <ChatBoxHelper
        contextData={aiContext}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  )
}

export default Practice