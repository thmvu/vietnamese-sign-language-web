import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatMessage from '../models/ChatMessage.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const user_id = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in .env'
      });
    }

    // Save user message to DB
    await ChatMessage.create({ user_id, role: 'user', content: message });

    // Fetch conversation history from DB for Gemini context
    const fullHistory = await ChatMessage.findAllByUserId(user_id);

    // Using gemini-flash-latest which is verified to work with the current quota
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const instructions = `Bạn là trợ lý AI cho website học Ngôn ngữ Ký hiệu Việt Nam.
Trả lời ngắn gọn, dễ hiểu, thân thiện. 
Dùng tiếng Việt tự nhiên. 
Nếu câu hỏi liên quan đến bài học, hãy gợi ý người dùng vào mục "Khóa học".`;

    // Initialize chat history with system instructions
    let history = [
      { role: 'user', parts: [{ text: instructions }] },
      { role: 'model', parts: [{ text: 'Đã hiểu. Tôi là trợ lý học Thủ ngữ Việt Nam, tôi đã sẵn sàng hỗ trợ bạn!' }] }
    ];

    // Map history from DB to Gemini format
    // Full history includes the message just saved at the end
    // We take all but the last message for the 'history' part of startChat
    const previousMessages = fullHistory.slice(0, -1);
    previousMessages.forEach((msg) => {
      const role = msg.role === 'user' ? 'user' : 'model';
      if (history.length === 0 || history[history.length - 1].role !== role) {
        history.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      }
    });

    const chatSession = model.startChat({
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    // Save bot response to DB
    await ChatMessage.create({ user_id, role: 'bot', content: response });

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

export const getHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const history = await ChatMessage.findAllByUserId(user_id);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history: ' + error.message
    });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    await ChatMessage.deleteByUserId(user_id);

    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing chat history: ' + error.message
    });
  }
};
