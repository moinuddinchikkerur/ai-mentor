import { runAI } from "../utils/aiHelper.js"; // ✅ Central AI helper

export const askGemini = async (req, res) => {
  try {
    console.log("📩 Chat Request:", req.body);

    const { prompt } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // Improve prompt quality
    const aiPrompt = `
You are an AI exam mentor.

Student Question:
${prompt}

Give a clear, simple, and helpful answer.
`;

    // Call AI using helper
    const reply = await runAI(aiPrompt);

    console.log("✅ Chat Response Generated");

    res.status(200).json({
      success: true,
      reply,
    });

  } catch (err) {

    console.error("❌ Chat AI Error:", err.message);

    res.status(500).json({
      success: false,
      message: "AI chat failed. Please try again.",
    });
  }
};