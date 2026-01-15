import { chatWithGemini } from "../services/gemini.service.js";

export const chatController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await chatWithGemini(message);

    res.json({ reply });

  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({ error: "AI processing error" });
  }
};
