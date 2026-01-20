const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are a helpful Vietnamese Sign Language learning assistant. 
You help users learn sign language by:
- Answering questions about sign language
- Providing tips and guidance
- Explaining signs and gestures
- Encouraging learners
Please respond in Vietnamese and be supportive and educational.`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Xin chào! Tôi là trợ lý học Thủ ngữ Việt Nam. Tôi sẵn sàng giúp bạn học và thực hành thủ ngữ.' }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Chatbot service error',
      error: error.message
    });
  }
};

module.exports = {
  chat
};