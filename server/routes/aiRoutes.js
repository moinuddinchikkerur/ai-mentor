import express from "express";
import Evaluation from "../models/Evaluation.js";
import { evaluateAnswer } from "../controllers/aiController.js";

const router = express.Router();


// Evaluate Answer
router.post("/evaluate", evaluateAnswer);


// Get chat list (sidebar)
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


// Get messages of one chat
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


// Delete a chat
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












