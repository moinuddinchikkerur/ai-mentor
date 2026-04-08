import { runAI } from "../utils/aiHelper.js";

export const detectBurnout = async (req, res) => {
  try {
    console.log("🔥 Burnout Check:", req.body);

    const { hours, days, stress } = req.body;

    // Validation
    if (!hours || !days) {
      return res.status(400).json({
        success: false,
        message: "Hours and days are required",
      });
    }

    // AI Prompt
    const prompt = `
Student study details:

Daily Hours: ${hours}
Continuous Days: ${days}
Stress Level: ${stress || "Not mentioned"}

Check burnout risk.
Give advice and solution.
`;

    const reply = await runAI(prompt);

    console.log("✅ Burnout Analysis Done");

    res.json({
      success: true,
      result: reply,
    });

  } catch (err) {

    console.error("❌ Burnout Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Burnout detection failed",
    });
  }
};