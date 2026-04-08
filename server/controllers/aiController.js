import Evaluation from "../models/Evaluation.js";

export const evaluateAnswer = async (req, res) => {

  const { chatId, question, answer } = req.body;

  try {

    // Replace with your real AI logic
    const aiResult =
      "Score: 8/10\n\nGood explanation but you should add examples.";

    const evaluation = new Evaluation({
      chatId,
      question,
      answer,
      result: aiResult
    });

    await evaluation.save();

    res.json({
      result: aiResult
    });

  } catch (error) {

    res.status(500).json({
      error: "Evaluation failed"
    });

  }

};