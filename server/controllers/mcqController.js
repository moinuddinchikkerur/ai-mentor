import MCQ from "../models/MCQ.js";
import MCQResult from "../models/MCQResult.js";

export const addMCQ = async (req, res) => {
  try {
    const {
      subject,
      topic,
      difficulty,
      question,
      options,
      correctAnswer
    } = req.body;

    if (!subject || !topic || !question || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        msg: "Missing required MCQ data"
      });
    }

    const mcq = await MCQ.create({
      subject,
      topic,
      difficulty: difficulty || "medium",
      question,
      options,
      correctAnswer
    });

    res.json({
      success: true,
      mcq
    });

  } catch (err) {
    console.error("MCQ add failed:", err);

    res.status(500).json({
      success: false,
      msg: "MCQ add failed"
    });
  }
};

export const getMCQs = async (req, res) => {
  try {
    const { subject, topic } = req.params;

    const mcqs = await MCQ.find({
      subject,
      topic
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      mcqs
    });

  } catch (err) {
    console.error("MCQ fetch failed:", err);

    res.status(500).json({
      success: false,
      msg: "Failed to get MCQs"
    });
  }
};

export const submitMCQ = async (req, res) => {
  try {
    const {
      subject,
      topic,
      difficulty,
      answers
    } = req.body;

    const mcqs = await MCQ.find({ subject, topic });

    let correct = 0;

    const savedQuestions = mcqs.map((q, index) => {
      const selectedAnswer = answers?.[index] || "";

      if (q.correctAnswer === selectedAnswer) {
        correct++;
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer
      };
    });

    const totalQuestions = mcqs.length;
    const wrongAnswers = totalQuestions - correct;
    const accuracy = totalQuestions
      ? Math.round((correct / totalQuestions) * 100)
      : 0;

    const result = await MCQResult.create({
      userId: req.user.id,
      subject,
      topic,
      difficulty: difficulty || "medium",
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers,
      score: correct,
      accuracy,
      questions: savedQuestions
    });

    res.json({
      success: true,
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers,
      accuracy,
      result
    });

  } catch (err) {
    console.error("MCQ submit failed:", err);

    res.status(500).json({
      success: false,
      msg: "Submit failed"
    });
  }
};
