









import express from "express";
import StudyLog from "../models/StudyLog.js";
import AttentionLog from "../models/AttentionLog.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const getStudySeconds = (log) => {
  if (log.session) return Number(log.session);
  if (log.hours) return Number(log.hours) * 3600;
  return 0;
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        msg: "User not authorized"
      });
    }

    const userId = req.user.id;

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const logs = await StudyLog.find({
      userId,
      $or: [
        { plan: null },
        { plan: { $exists: false } }
      ]
    });

    let total = 0;
    let todayTotal = 0;
    const subjects = {};
    const todaySubjects = {};
    const weeklyLogs = [];

    logs.forEach(log => {
      const seconds = getStudySeconds(log);

      if (!seconds || seconds <= 0) return;

      const logDate = new Date(log.date || log.createdAt);
      const subject = log.subject || "General";

      if (logDate >= startOfWeek) {
        total += seconds;
        subjects[subject] = (subjects[subject] || 0) + seconds;

        weeklyLogs.push({
          subject,
          seconds,
          date: logDate
        });
      }

      if (logDate >= startOfToday) {
        todayTotal += seconds;
        todaySubjects[subject] = (todaySubjects[subject] || 0) + seconds;
      }
    });

    const plans = await StudyLog.find({
      userId,
      plan: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    const recentAttention = await AttentionLog.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      totalHours: total,
      todayHours: todayTotal,
      subjects,
      todaySubjects,
      weeklyLogs,
      recentAttention,
      plans,
      plan: plans.length ? plans[0].plan : null
    });

  } catch (err) {
    console.error("Dashboard Error:", err);

    res.status(500).json({
      success: false,
      msg: "Dashboard fetch failed"
    });
  }
});

export default router;

