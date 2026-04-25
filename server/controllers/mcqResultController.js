























import mongoose from "mongoose";
import MCQResult from "../models/MCQResult.js";

const allowedDifficulty = ["easy", "medium", "hard"];

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeQuestionKey = (question) => {
  return String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const normalizeQuestion = (item) => {
  if (!item || !item.question) return null;

  let options = Array.isArray(item.options)
    ? item.options.map((opt) => String(opt).trim()).filter(Boolean).slice(0, 4)
    : [];

  const correctAnswer = String(item.correctAnswer || "").trim();
  const selectedAnswer = String(item.selectedAnswer || "").trim();

  if (correctAnswer && !options.includes(correctAnswer)) {
    options = [correctAnswer, ...options].slice(0, 4);
  }

  return {
    question: String(item.question).trim(),
    options,
    correctAnswer,
    selectedAnswer,
    explanation: String(item.explanation || "").trim()
  };
};

const uniqueQuestions = (questions) => {
  const seen = new Set();
  const result = [];

  questions.forEach((question) => {
    const key = normalizeQuestionKey(question.question);

    if (!key || seen.has(key)) return;

    seen.add(key);
    result.push(question);
  });

  return result;
};

const buildResultStats = ({ totalQuestions, correctAnswers, questions }) => {
  const finalTotalQuestions = questions.length || Number(totalQuestions || 0);

  const calculatedCorrect = questions.length
    ? questions.filter(
        (question) =>
          question.selectedAnswer &&
          question.selectedAnswer === question.correctAnswer
      ).length
    : Number(correctAnswers || 0);

  const finalCorrectAnswers = Math.max(0, calculatedCorrect);
  const wrongAnswers = Math.max(0, finalTotalQuestions - finalCorrectAnswers);

  const accuracy = finalTotalQuestions
    ? Math.round((finalCorrectAnswers / finalTotalQuestions) * 100)
    : 0;

  return {
    totalQuestions: finalTotalQuestions,
    correctAnswers: finalCorrectAnswers,
    wrongAnswers,
    score: finalCorrectAnswers,
    accuracy
  };
};

export const saveResult = async (req, res) => {
  try {
    const {
      resultId,
      subject,
      topic,
      difficulty = "medium",
      totalQuestions,
      correctAnswers,
      questions
    } = req.body;

    const cleanTopic = String(topic || "").trim();
    const cleanSubject = String(subject || "").trim();

    if (!cleanTopic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    const cleanQuestions = Array.isArray(questions)
      ? uniqueQuestions(
          questions
            .map(normalizeQuestion)
            .filter(Boolean)
            .slice(0, 100)
        )
      : [];

    const stats = buildResultStats({
      totalQuestions,
      correctAnswers,
      questions: cleanQuestions
    });

    if (!stats.totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Questions are required"
      });
    }

    const safeDifficulty = allowedDifficulty.includes(difficulty)
      ? difficulty
      : "medium";

    if (resultId) {
      if (!isValidObjectId(resultId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid result id"
        });
      }

      const existingResult = await MCQResult.findOne({
        _id: resultId,
        userId: req.user.id
      });

      if (!existingResult) {
        return res.status(404).json({
          success: false,
          message: "Result not found"
        });
      }

      existingResult.subject = cleanSubject;
      existingResult.topic = cleanTopic;
      existingResult.difficulty = safeDifficulty;
      existingResult.totalQuestions = stats.totalQuestions;
      existingResult.correctAnswers = stats.correctAnswers;
      existingResult.wrongAnswers = stats.wrongAnswers;
      existingResult.score = stats.score;
      existingResult.accuracy = stats.accuracy;
      existingResult.questions = cleanQuestions;

      await existingResult.save();

      return res.json({
        success: true,
        message: "Result updated",
        result: existingResult
      });
    }

    const result = await MCQResult.create({
      userId: req.user.id,
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: safeDifficulty,
      totalQuestions: stats.totalQuestions,
      correctAnswers: stats.correctAnswers,
      wrongAnswers: stats.wrongAnswers,
      score: stats.score,
      accuracy: stats.accuracy,
      questions: cleanQuestions
    });

    return res.status(201).json({
      success: true,
      message: "Result saved",
      result
    });
  } catch (err) {
    console.error("Save Result Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to save result"
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await MCQResult
      .find({ userId: req.user.id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error("History Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load history"
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    const session = await MCQResult.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    return res.json({
      success: true,
      session
    });
  } catch (err) {
    console.error("Session fetch error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch session"
    });
  }
};

export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result id"
      });
    }

    const result = await MCQResult.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    return res.json({
      success: true,
      message: "Result deleted"
    });
  } catch (err) {
    console.error("Delete Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete result"
    });
  }
};
