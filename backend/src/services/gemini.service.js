import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro"
});

let chatHistory = [];

export const chatWithGemini = async (userMessage) => {
  const systemPrompt = `
Bạn là trợ lý AI cho website học Ngôn ngữ Ký hiệu Việt Nam.
Hãy trả lời ngắn gọn, thân thiện, dễ hiểu.
`;

  const prompt = [
    systemPrompt,
    ...chatHistory.map(m => `${m.role}: ${m.text}`),
    `user: ${userMessage}`
  ].join("\n");

  const result = await model.generateContent(prompt);
  const reply = result.response.text();

  chatHistory.push({ role: "user", text: userMessage });
  chatHistory.push({ role: "assistant", text: reply });

  if (chatHistory.length > 20) {
    chatHistory = chatHistory.slice(-20);
  }

  return reply;
};
