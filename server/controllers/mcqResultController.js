import MCQResult from "../models/MCQResult.js";


/* =========================
   SAVE RESULT
========================= */

export const saveResult = async (req, res) => {

  try {

    const { topic, totalQuestions, correctAnswers } = req.body;

    const wrongAnswers = totalQuestions - correctAnswers;

    const result = await MCQResult.create({
      topic,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: correctAnswers
    });

    res.json({
      success: true,
      result
    });

  } catch (err) {

    console.error("Save Result Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to save result"
    });

  }

};



/* =========================
   GET HISTORY
========================= */

export const getHistory = async (req, res) => {

  try {

    const history = await MCQResult
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      history
    });

  } catch (err) {

    console.error("History Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load history"
    });

  }

};



/* =========================
   DELETE RESULT
========================= */

export const deleteResult = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await MCQResult.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    res.json({
      success: true,
      message: "Result deleted"
    });

  } catch (err) {

    console.error("Delete Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete result"
    });

  }

};