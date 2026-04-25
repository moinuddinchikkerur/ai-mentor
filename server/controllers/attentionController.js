



import AttentionLog from "../models/AttentionLog.js";

const clampScore = (value) => {
  const score = Number(value || 0);

  if (score < 0) return 0;
  if (score > 100) return 100;

  return Math.round(score);
};

const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const cleanSubject = (value) => {
  const subject = String(value || "").trim();
  return subject || "General";
};

const safeDate = (value, fallback = new Date()) => {
  if (!value) return fallback;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const calculateFocusScore = (totalSessionTime, absentTime) => {
  const total = safeNumber(totalSessionTime, 0);
  const absent = Math.min(safeNumber(absentTime, 0), total);

  if (total <= 0) return 100;

  return clampScore(((total - absent) / total) * 100);
};

const buildSubjectBreakdown = (logs) => {
  const map = {};

  logs.forEach((log) => {
    const subject = cleanSubject(log.subject);

    if (!map[subject]) {
      map[subject] = {
        subject,
        totalFocus: 0,
        totalSessionTime: 0,
        totalAbsentTime: 0,
        totalAlerts: 0,
        count: 0
      };
    }

    map[subject].totalFocus += safeNumber(log.focusScore, 0);
    map[subject].totalSessionTime += safeNumber(log.totalSessionTime, 0);
    map[subject].totalAbsentTime += safeNumber(log.absentTime, 0);
    map[subject].totalAlerts += safeNumber(log.alertsTriggered, 0);
    map[subject].count += 1;
  });

  return Object.values(map)
    .map((item) => ({
      subject: item.subject,
      averageFocus: item.count
        ? Math.round(item.totalFocus / item.count)
        : 0,
      totalSessionTime: item.totalSessionTime,
      totalAbsentTime: item.totalAbsentTime,
      totalAlerts: item.totalAlerts,
      totalLogs: item.count
    }))
    .sort((a, b) => {
      if (b.averageFocus !== a.averageFocus) {
        return b.averageFocus - a.averageFocus;
      }

      return b.totalSessionTime - a.totalSessionTime;
    });
};

export const saveAttention = async (req, res) => {
  try {
    const {
      sessionId,
      focusLevel,
      focusScore,
      subject,
      subjectSource,
      totalSessionTime,
      absentTime,
      alertsTriggered,
      startedAt,
      endedAt
    } = req.body;

    const userId = req.user.id;
    const total = safeNumber(totalSessionTime, 0);
    const absent = Math.min(safeNumber(absentTime, 0), total);
    const alerts = safeNumber(alertsTriggered, 0);

    const computedScore = calculateFocusScore(total, absent);
    const finalScore = clampScore(
      focusLevel ?? focusScore ?? computedScore
    );

    const payload = {
      focusScore: finalScore,
      subject: cleanSubject(subject),
      subjectSource: subjectSource === "manual" ? "manual" : "auto",
      totalSessionTime: total,
      absentTime: absent,
      alertsTriggered: alerts,
      date: safeDate(endedAt, new Date()),
      startedAt: safeDate(startedAt, new Date()),
      endedAt: safeDate(endedAt, new Date()),
      lastSyncedAt: new Date()
    };

    let log;

    if (sessionId) {
      log = await AttentionLog.findOneAndUpdate(
        {
          userId,
          sessionId
        },
        {
          $set: payload,
          $setOnInsert: {
            userId,
            sessionId
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );
    } else {
      log = await AttentionLog.create({
        userId,
        ...payload
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attention saved",
      log
    });
  } catch (err) {
    console.error("SAVE ATTENTION ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Error saving attention"
    });
  }
};

export const getMyAttentionReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const startOfWindow = new Date();
    startOfWindow.setDate(startOfWindow.getDate() - 6);
    startOfWindow.setHours(0, 0, 0, 0);

    const logs = await AttentionLog.find({
      userId,
      date: { $gte: startOfWindow }
    })
      .sort({ date: -1 })
      .limit(200)
      .lean();

    const totalLogs = logs.length;
    const totalSessionTime = logs.reduce(
      (sum, log) => sum + safeNumber(log.totalSessionTime, 0),
      0
    );
    const totalAbsentTime = logs.reduce(
      (sum, log) => sum + safeNumber(log.absentTime, 0),
      0
    );
    const totalAlerts = logs.reduce(
      (sum, log) => sum + safeNumber(log.alertsTriggered, 0),
      0
    );

    const averageFocus = totalLogs
      ? Math.round(
          logs.reduce((sum, log) => sum + safeNumber(log.focusScore, 0), 0) /
            totalLogs
        )
      : 0;

    const subjectBreakdown = buildSubjectBreakdown(logs);
    const bestSubject = subjectBreakdown[0]?.subject || "";
    const needsAttentionSubject =
      subjectBreakdown.length > 0
        ? subjectBreakdown[subjectBreakdown.length - 1]?.subject || ""
        : "";

    return res.json({
      success: true,
      logs,
      summary: {
        totalLogs,
        averageFocus,
        bestSubject,
        needsAttentionSubject,
        totalSessionTime,
        totalAbsentTime,
        totalAlerts,
        subjectBreakdown
      }
    });
  } catch (err) {
    console.error("ATTENTION REPORT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load attention report"
    });
  }
};

export const clearMyAttentionReport = async (req, res) => {
  try {
    await AttentionLog.deleteMany({
      userId: req.user.id
    });

    return res.json({
      success: true,
      message: "Attention report cleared"
    });
  } catch (err) {
    console.error("CLEAR ATTENTION REPORT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to clear attention report"
    });
  }
};
