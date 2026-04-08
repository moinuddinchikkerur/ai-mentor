import express from "express";
import MCQResult from "../models/MCQResult.js";

const router = express.Router();



/* =============================
   SAVE RESULT
============================= */

router.post("/save", async (req, res) => {

  try {

    const { topic, totalQuestions, correctAnswers, questions } = req.body;

    if (!topic || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Missing required data"
      });
    }

    const wrongAnswers = totalQuestions - correctAnswers;

    const result = await MCQResult.create({
      topic,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: correctAnswers,
      questions
    });

    res.json({
      success: true,
      result
    });

  } catch (err) {

    console.error("Save MCQ error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to save MCQ result"
    });

  }

});



/* =============================
   GET HISTORY
============================= */

router.get("/history", async (req, res) => {

  try {

    const history = await MCQResult
      .find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      history
    });

  } catch (err) {

    console.error("History fetch error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load history"
    });

  }

});



/* =============================
   GET SINGLE SESSION
============================= */

router.get("/:id", async (req, res) => {

  try {

    const session = await MCQResult.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (err) {

    console.error("Session fetch error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch session"
    });

  }

});



/* =============================
   DELETE HISTORY
============================= */

router.delete("/:id", async (req, res) => {

  try {

    await MCQResult.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "History deleted"
    });

  } catch (err) {

    console.error("Delete history error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete history"
    });

  }

});

export default router;