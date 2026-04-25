




import { runAI } from "../utils/aiHelper.js";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const aiPrompt = `
You are an AI exam mentor.

Student Question:
${prompt}

Give a clear, simple, and helpful answer. Keep it student-friendly.
`;

    const reply = await runAI(aiPrompt);

    res.status(200).json({
      success: true,
      reply: reply || "I could not generate an AI answer right now. Please try again."
    });

  } catch (err) {
    console.error("❌ Chat AI Error:", err.message);

    res.status(500).json({
      success: false,
      message: "AI chat failed. Please try again."
    });
  }
};


