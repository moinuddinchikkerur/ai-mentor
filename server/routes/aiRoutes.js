








import express from "express";
import Evaluation from "../models/Evaluation.js";
import { evaluateAnswer } from "../controllers/aiController.js";
import { makePlan } from "../controllers/planerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/plan", authMiddleware, makePlan);

router.post("/evaluate", evaluateAnswer);

router.get("/chats", async (req, res) => {
  try {
    const chats = await Evaluation.aggregate([
      {
        $group: {
          _id: "$chatId",
          lastQuestion: { $last: "$question" },
          createdAt: { $last: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(chats);
  } catch {
    res.status(500).json({
      error: "Failed to load chats"
    });
  }
});

router.get("/chat/:chatId", async (req, res) => {
  try {
    const messages = await Evaluation
      .find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch {
    res.status(500).json({
      error: "Failed to load chat"
    });
  }
});

router.delete("/chat/:chatId", async (req, res) => {
  try {
    await Evaluation.deleteMany({
      chatId: req.params.chatId
    });

    res.json({
      message: "Chat deleted"
    });
  } catch {
    res.status(500).json({
      error: "Delete failed"
    });
  }
});

export default router;
