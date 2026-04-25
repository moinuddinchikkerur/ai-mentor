


import { runAI } from "../utils/aiHelper.js";

const fallbackBurnout = (hours, days, stress) => {
  const risk =
    Number(hours) >= 8 || Number(days) >= 7 || String(stress).toLowerCase() === "high"
      ? "High"
      : Number(hours) >= 5 || Number(days) >= 4
        ? "Medium"
        : "Low";

  return `
Burnout Risk: ${risk}

Advice:
- Take short breaks after every 45-60 minutes.
- Sleep properly and avoid studying late every night.
- Mix hard subjects with lighter revision.
- If stress feels high, reduce today's workload and do only priority topics.

Plan:
Study with a balanced routine instead of pushing continuously.
`;
};

export const detectBurnout = async (req, res) => {
  try {
    console.log("🔥 Burnout Check:", req.body);

    const { hours, days, stress } = req.body;

    if (hours === undefined || days === undefined) {
      return res.status(400).json({
        success: false,
        message: "Hours and days are required"
      });
    }

    const prompt = `
Student study details:

Daily Hours: ${hours}
Continuous Days: ${days}
Stress Level: ${stress || "Not mentioned"}

Check burnout risk.
Give advice and solution.
Keep it simple and practical.
`;

    const reply = await runAI(prompt);

    console.log("✅ Burnout Analysis Done");

    res.json({
      success: true,
      result: reply || fallbackBurnout(hours, days, stress)
    });

  } catch (err) {
    console.error("❌ Burnout Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Burnout detection failed"
    });
  }
};

