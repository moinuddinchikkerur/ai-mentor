// import { runAI } from "../utils/aiHelper.js";

// export const generateMCQ = async (req, res) => {

//   try {

//     console.log("🔥 MCQ AI CONTROLLER ACTIVE");

//     const { topic } = req.body;

//     if (!topic) {
//       return res.status(400).json({
//         success: false,
//         message: "Topic is required",
//         mcqs: []
//       });
//     }

//     const mcqs = [];

//     // 🔥 Generate 5 MCQs one by one (more stable)
//     for (let i = 0; i < 5; i++) {

//       const prompt = `
// Generate ONE multiple choice question about "${topic}".

// Return ONLY JSON.

// Format:

// {
//  "question": "Question text",
//  "options": [
//   "Option A",
//   "Option B",
//   "Option C",
//   "Option D"
//  ],
//  "correctAnswer": "Option A"
// }

// Rules:
// - Exactly 4 options
// - Only one correct answer
// - No explanation
// - Only JSON
// `;

//       const reply = await runAI(prompt);

//       console.log("RAW AI RESPONSE:\n", reply);

//       if (!reply) continue;

//       try {

//         let cleaned = reply
//           .replace(/```json/g, "")
//           .replace(/```/g, "")
//           .trim();

//         const start = cleaned.indexOf("{");
//         const end = cleaned.lastIndexOf("}");

//         if (start === -1 || end === -1) continue;

//         const jsonString = cleaned.slice(start, end + 1);

//         const parsed = JSON.parse(jsonString);

//         mcqs.push(parsed);

//       } catch (err) {

//         console.log("⚠️ Failed to parse MCQ:", err.message);

//       }

//     }

//     console.log("✅ Generated MCQs:", mcqs.length);

//     return res.status(200).json({
//       success: true,
//       mcqs
//     });

//   } catch (error) {

//     console.error("❌ MCQ Controller Error:", error.message);

//     return res.status(500).json({
//       success: false,
//       mcqs: []
//     });

//   }

// };



import { runAI } from "../utils/aiHelper.js";

export const generateMCQ = async (req, res) => {

  try {

    console.log("🔥 MCQ AI CONTROLLER ACTIVE");

    const { topic, difficulty = "medium" } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
        mcqs: []
      });
    }

    const mcqs = [];

    // 🔥 Generate 5 MCQs one by one (more stable)
    for (let i = 0; i < 5; i++) {

      const prompt = `
Generate ONE ${difficulty} difficulty multiple choice question about "${topic}".

Return ONLY JSON.

Format:

{
 "question": "Question text",
 "options": [
  "Option A",
  "Option B",
  "Option C",
  "Option D"
 ],
 "correctAnswer": "Option A"
}

Rules:
- Exactly 4 options
- Only one correct answer
- No explanation
- Only JSON
`;

      const reply = await runAI(prompt);

      console.log("RAW AI RESPONSE:\n", reply);

      if (!reply) continue;

      try {

        let cleaned = reply
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start === -1 || end === -1) continue;

        const jsonString = cleaned.slice(start, end + 1);

        const parsed = JSON.parse(jsonString);

        mcqs.push(parsed);

      } catch (err) {

        console.log("⚠️ Failed to parse MCQ:", err.message);

      }

    }

    console.log("✅ Generated MCQs:", mcqs.length);

    return res.status(200).json({
      success: true,
      mcqs
    });

  } catch (error) {

    console.error("❌ MCQ Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      mcqs: []
    });

  }

};