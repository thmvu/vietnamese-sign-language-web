import axios from 'axios';

const AI_SERVICE_BASE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Proxy landmarks từ frontend → Python AI Service → trả kết quả về.
 * Nếu Python service đang tắt → trả 503, KHÔNG crash backend Node.js.
 */
export const evaluatePractice = async (req, res) => {
  try {
    const { frames } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu frames. Cần mảng 100 frame, mỗi frame có 21 điểm tay.'
      });
    }

    const aiResponse = await axios.post(
      `${AI_SERVICE_BASE}/predict`,
      { frames },
      { timeout: 10000 }
    );

    const { predicted_sign, confidence } = aiResponse.data;

    return res.json({
      success: true,
      data: {
        predicted_sign,
        confidence,
        is_correct: confidence > 0.75,
        feedback: confidence > 0.75
          ? 'Xuất sắc! Ký hiệu của bạn rất chính xác.'
          : 'Thử lại nhé! Điều chỉnh tư thế tay cho đúng hơn.'
      }
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('[Practice] ⚠️ AI Service không phản hồi tại', AI_SERVICE_BASE);
      return res.status(503).json({
        success: false,
        message: 'AI Service đang tắt. Hãy chạy lệnh khởi động Python service.',
        hint: 'cd aiservice && uvicorn api:app --reload'
      });
    }

    console.error('[Practice] ❌ Lỗi:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi gọi AI Service: ' + error.message
    });
  }
};

/**
 * Kiểm tra trạng thái Python AI Service (không cần auth)
 */
export const checkAiHealth = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_BASE}/health`, { timeout: 3000 });
    return res.json({
      success: true,
      ai_service_url: AI_SERVICE_BASE,
      ai_service: response.data
    });
  } catch {
    return res.json({
      success: false,
      ai_service_url: AI_SERVICE_BASE,
      ai_service: { status: 'offline' },
      message: 'AI Service không phản hồi. Kiểm tra lại Python service.'
    });
  }
};