import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// 1. Khởi tạo Gemini
// =======================
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

// =======================
// 2. Lưu chat history (RAM - demo)
// =======================
let chatHistory = [];

// =======================
// 3. API Chat
// =======================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = `
Bạn là trợ lý AI cho website học Ngôn ngữ Ký hiệu Việt Nam (VSL).
Hãy trả lời NGẮN GỌN, DỄ HIỂU, THÂN THIỆN.
Không trả lời lan man.
`;

    // Gộp prompt + lịch sử
    const prompt = [
      systemPrompt,
      ...chatHistory.map(m => `${m.role}: ${m.text}`),
      `user: ${message}`
    ].join("\n");

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    // Cập nhật history
    chatHistory.push({ role: "user", text: message });
    chatHistory.push({ role: "assistant", text: reply });

    // Giới hạn lịch sử
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    return res.json({ reply });

  } catch (error) {
    console.error("❌ Gemini error:", error);
    return res.status(500).json({
      error: "AI server error"
    });
  }
});

// =======================
// 4. Start server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
