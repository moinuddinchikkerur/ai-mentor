import { runAI } from "../utils/aiHelper.js";
import Evaluation from "../models/Evaluation.js";

export const evaluateAnswer = async (req, res) => {

  try {

    console.log("📝 Evaluate Request:", req.body);

    const { chatId, question, answer } = req.body;

    console.log("Chat ID:", chatId);

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and Answer are required"
      });
    }

    /* ============================
       WORD COUNT SCORING (20 MARKS)
    ============================ */

    const wordCount = answer.trim().split(/\s+/).length;

    let marks = 0;

    if (wordCount < 20) marks = 4;
    else if (wordCount < 40) marks = 8;
    else if (wordCount < 60) marks = 12;
    else if (wordCount < 80) marks = 16;
    else marks = 20;

    /* ============================
       AI FEEDBACK
    ============================ */

    const prompt = `
You are an exam evaluator.

Question:
${question}

Student Answer:
${answer}

Provide:
1. Short feedback
2. Suggestions for improvement
Keep the response concise.
`;

    const aiFeedback = await runAI(prompt);

    /* ============================
       FINAL RESULT FORMAT
    ============================ */

    const result = `
Marks out of 20: ${marks}

Word Count: ${wordCount}

${aiFeedback}
`;

    /* ============================
       SAVE TO DATABASE
    ============================ */

    const evaluation = new Evaluation({
      chatId,
      question,
      answer,
      result
    });

    await evaluation.save();

    console.log("✅ Evaluation Saved in DB");

    res.status(200).json({
      success: true,
      result
    });

  } catch (err) {

    console.error("❌ Evaluation Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Evaluation failed"
    });

  }

};