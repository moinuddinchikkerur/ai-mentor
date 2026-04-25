









import mongoose from "mongoose";
import StudyLog from "../models/StudyLog.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeSubjects = (subjectsInput) => {
  const rawSubjects = Array.isArray(subjectsInput)
    ? subjectsInput
    : String(subjectsInput || "").split(",");

  const seen = new Set();

  return rawSubjects
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 12);
};

const cleanText = (value, fallback = "") => {
  const text = String(value || "").trim();
  return text || fallback;
};

const toBoundedNumber = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
};

const isValidPlanObject = (plan) => {
  return Boolean(
    plan &&
      typeof plan === "object" &&
      !Array.isArray(plan) &&
      Object.keys(plan).length > 0
  );
};

export const savePlan = async (req, res) => {
  try {
    const {
      title,
      name,
      subjects,
      days,
      plan,
      strategy,
      aiResponse,
      planId,
      id
    } = req.body;

    const requestedId = req.params.id || planId || id || null;

    if (!isValidPlanObject(plan)) {
      return res.status(400).json({
        success: false,
        message: "Plan is empty"
      });
    }

    const subjectList = normalizeSubjects(subjects);
    const planTitle = cleanText(
      title || name,
      subjectList.join(", ") || "Weekly Study Plan"
    );

    const payload = {
      title: planTitle,
      subjects: subjectList,
      days: toBoundedNumber(days, 7, 1, 31),
      plan,
      strategy: cleanText(strategy || aiResponse),
      aiResponse: cleanText(aiResponse || strategy),
      subject: subjectList[0] || planTitle,
      entryType: "plan",
      date: new Date()
    };

    if (requestedId) {
      if (!isValidObjectId(requestedId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan id"
        });
      }

      const updatedPlan = await StudyLog.findOneAndUpdate(
        {
          _id: requestedId,
          userId: req.user.id,
          $or: [
            { entryType: "plan" },
            { plan: { $exists: true, $ne: null } }
          ]
        },
        payload,
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedPlan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found"
        });
      }

      return res.json({
        success: true,
        message: "Plan updated",
        plan: updatedPlan
      });
    }

    const newPlan = await StudyLog.create({
      userId: req.user.id,
      ...payload
    });

    return res.status(201).json({
      success: true,
      message: "Plan saved",
      plan: newPlan
    });
  } catch (err) {
    console.error("SAVE PLAN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Save failed"
    });
  }
};

export const saveSession = async (req, res) => {
  try {
    const { session, duration, absent, alerts, score, subject } = req.body;

    const seconds = toBoundedNumber(
      session || duration,
      0,
      0,
      Number.MAX_SAFE_INTEGER
    );

    if (!seconds || seconds <= 0) {
      return res.status(400).json({
        success: false,
        message: "Session duration is required"
      });
    }

    const newLog = await StudyLog.create({
      userId: req.user.id,
      entryType: "session",
      session: seconds,
      hours: Number((seconds / 3600).toFixed(2)),
      absent: toBoundedNumber(absent, 0, 0, 100000),
      alerts: toBoundedNumber(alerts, 0, 0, 100000),
      score: toBoundedNumber(score, 100, 0, 100),
      subject: cleanText(subject, "General"),
      date: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Session saved",
      log: newLog
    });
  } catch (err) {
    console.error("SAVE SESSION ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Session save failed"
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const data = await StudyLog.find({
      userId: req.user.id,
      $or: [
        { entryType: "session" },
        { session: { $gt: 0 } },
        { hours: { $gt: 0 } }
      ]
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET HISTORY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Fetch failed"
    });
  }
};

export const getPlans = async (req, res) => {
  try {
    const data = await StudyLog.find({
      userId: req.user.id,
      $or: [
        { entryType: "plan" },
        { plan: { $exists: true, $ne: null } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("GET PLANS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Plans fetch failed"
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan id"
      });
    }

    const deleted = await StudyLog.findOneAndDelete({
      _id: id,
      userId: req.user.id,
      $or: [
        { entryType: "plan" },
        { plan: { $exists: true, $ne: null } }
      ]
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    return res.json({
      success: true,
      message: "Deleted"
    });
  } catch (err) {
    console.error("DELETE PLAN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
