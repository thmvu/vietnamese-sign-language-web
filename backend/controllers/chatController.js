import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const instructions = `Bạn là trợ lý AI cho website học Ngôn ngữ Ký hiệu Việt Nam.
Trả lời ngắn gọn, dễ hiểu, thân thiện. 
Dùng tiếng Việt tự nhiên. 
Nếu câu hỏi liên quan đến bài học, hãy gợi ý người dùng vào mục "Khóa học".`;

    // Map and filter history to ensure it's valid for Gemini
    // Rules: Must alternate user/model. Must start with user.
    let history = [];

    // Initial context
    history.push({ role: 'user', parts: [{ text: instructions }] });
    history.push({ role: 'model', parts: [{ text: 'Đã hiểu. Tôi là trợ lý học Thủ ngữ Việt Nam, tôi đã sẵn sàng!' }] });

    // Append history from frontend, ensuring we don't break alternating roles
    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'user' : 'model';
        // Only push if it alternates from the last one
        if (history.length === 0 || history[history.length - 1].role !== role) {
          history.push({
            role: role,
            parts: [{ text: msg.content }]
          });
        }
      });
    }

    const chatSession = model.startChat({
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('--- Gemini API Error Details ---');
    console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    console.error('---------------------------------');

    res.status(500).json({
      success: false,
      message: 'Chatbot service error: ' + error.message,
      error: error.message
    });
  }
};