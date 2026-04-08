import StudyLog from "../models/StudyLog.js";

// 🔐 SAVE PLAN (FIXED)
export const savePlan = async (req, res) => {
  try {
    const { subjects, days, plan } = req.body;

    console.log("🔥 RECEIVED PLAN:", plan);

    // ❌ BLOCK EMPTY PLAN
    if (!plan || typeof plan !== "object" || Object.keys(plan).length === 0) {
      console.log("❌ EMPTY PLAN DETECTED");

      return res.status(400).json({
        success: false,
        message: "Plan is empty ❌"
      });
    }

    const newPlan = new StudyLog({
      userId: req.user.id,
      subjects,
      days,
      plan
    });

    await newPlan.save();

    console.log("✅ PLAN SAVED SUCCESSFULLY");

    res.json({
      success: true,
      message: "Plan saved"
    });

  } catch (err) {
    console.error("❌ SAVE ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Save failed"
    });
  }
};


// 🔐 GET USER HISTORY
export const getHistory = async (req, res) => {
  try {
    const data = await StudyLog.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetch failed"
    });
  }
};


// 🗑 DELETE PLAN
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    await StudyLog.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};