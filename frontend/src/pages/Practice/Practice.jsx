import React, { useState, useRef } from 'react'

const Practice = () => {
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsRecording(true)
    } catch (error) {
      alert('Không thể truy cập camera')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">📷 Luyện tập thủ ngữ</h1>

      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6">
          <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
        </div>

        <div className="flex gap-4 justify-center">
          {!isRecording ? (
            <button
              onClick={startCamera}
              className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700"
            >
              Bắt đầu luyện tập
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
            >
              Dừng lại
            </button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-slate-600">
            💡 <strong>Hướng dẫn:</strong> Bật camera và thực hiện các động tác thủ ngữ. 
            Tính năng nhận diện AI sẽ được bổ sung trong phiên bản tiếp theo.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Practice;