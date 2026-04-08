import { runAI } from "../utils/aiHelper.js";

export const careerGuide = async (req, res) => {
  try {
    console.log("🎯 Career Request:", req.body);

    const { interest, skills, education } = req.body;

    if (!interest) {
      return res.status(400).json({
        success: false,
        message: "Interest is required",
      });
    }

    const prompt = `
You are a career counselor.

Student Details:

Education: ${education || "Not mentioned"}
Interest: ${interest}
Skills: ${skills || "Beginner"}

Suggest:
- Best career options
- Required skills
- Learning roadmap
- Future scope

Be simple and clear.
`;

    const reply = await runAI(prompt);

    console.log("✅ Career Guidance Generated");

    res.json({
      success: true,
      guide: reply,
    });

  } catch (err) {

    console.error("❌ Career Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Career guidance failed",
    });
  }
};