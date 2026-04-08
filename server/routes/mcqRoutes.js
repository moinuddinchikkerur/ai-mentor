import express from "express";
import MCQ from "../models/MCQ.js";
import MCQResult from "../models/MCQResult.js";

const router = express.Router();

/*
  POST /api/mcq/add  (Admin / Demo)
*/
router.post("/add", async (req, res) => {
  try {

    const {
      subject,
      topic,
      question,
      options,
      correctAnswer
    } = req.body;

    const mcq = await MCQ.create({
      subject,
      topic,
      question,
      options,
      correctAnswer
    });

    res.json({
      success: true,
      mcq
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      msg: "MCQ add failed"
    });
  }
});


/*
  GET /api/mcq/:subject/:topic
*/
router.get("/:subject/:topic", async (req, res) => {
  try {

    const { subject, topic } = req.params;

    const mcqs = await MCQ.find({ subject, topic });

    res.json({
      success: true,
      mcqs
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      msg: "Failed to get MCQs"
    });
  }
});


/*
  POST /api/mcq/submit
*/
router.post("/submit", async (req, res) => {
  try {

    const {
      userId,
      subject,
      topic,
      answers
    } = req.body;

    const mcqs = await MCQ.find({ subject, topic });

    let correct = 0;

    mcqs.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) {
        correct++;
      }
    });

    const total = mcqs.length;
    const accuracy = (correct / total) * 100;

    await MCQResult.create({
      userId,
      subject,
      topic,
      total,
      correct,
      accuracy
    });

    res.json({
      success: true,
      total,
      correct,
      accuracy
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      msg: "Submit failed"
    });
  }
});

export default router;
