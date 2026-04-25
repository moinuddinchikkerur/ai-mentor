













import express from "express";
import { generateMCQ } from "../controllers/mcqAIController.js";
import {
  evaluateAnswer,
  getEvaluationChats,
  getEvaluationChat,
  deleteEvaluationChat
} from "../controllers/evalController.js";
import { makePlan } from "../controllers/plannerController.js";
import { runAI } from "../utils/aiHelper.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/debug", (req, res) => {
  res.send("AI Extra Routes Working");
});

router.post("/mcq", authMiddleware, generateMCQ);
router.post("/evaluate", authMiddleware, evaluateAnswer);
router.post("/plan", authMiddleware, makePlan);

router.get("/chats", authMiddleware, getEvaluationChats);
router.get("/chat/:chatId", authMiddleware, getEvaluationChat);
router.delete("/chat/:chatId", authMiddleware, deleteEvaluationChat);

router.post("/explain", authMiddleware, async (req, res) => {
  try {
    const {
      subject = "",
      topic = "",
      question,
      selectedAnswer,
      correctAnswer
    } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        explanation: "Question missing"
      });
    }

    const prompt = `
Explain this MCQ answer in simple student-friendly language.

Subject:
${subject || "General"}

Topic:
${topic || "Not provided"}

Question:
${question}

Student selected:
${selectedAnswer || "Not provided"}

Correct answer:
${correctAnswer || "Not provided"}

Give a short explanation in 4-6 lines.
`;

    const reply = await runAI(prompt);

    return res.json({
      success: true,
      explanation:
        reply ||
        "The correct answer matches the main concept asked in the question. Review the topic once more and focus on why the other options are less suitable."
    });
  } catch (error) {
    console.error("Explain AI error:", error);

    return res.status(500).json({
      success: false,
      explanation: "AI explanation failed"
    });
  }
});

export default router;



