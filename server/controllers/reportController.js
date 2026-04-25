














import StudyLog from "../models/StudyLog.js";
import AttentionLog from "../models/AttentionLog.js";
import MCQResult from "../models/MCQResult.js";

const PLANNED_WEEKLY_HOURS = 25;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round1 = (value) => {
  return Math.round(toNumber(value) * 10) / 10;
};

const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value));
};

const formatHours = (seconds) => {
  return round1(toNumber(seconds) / 3600);
};

const getStartOfLast7Days = () => {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getDateKey = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString().slice(0, 10);
};

const getDayLabel = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short"
  });
};

const getShortDateLabel = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

const getLast7Days = () => {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    days.push({
      key: getDateKey(date),
      day: getDayLabel(date),
      date: getShortDateLabel(date)
    });
  }

  return days;
};

const getLogDate = (log) => {
  return log.date || log.createdAt || new Date();
};

const getStudySeconds = (log) => {
  return toNumber(log.session) + toNumber(log.hours) * 3600;
};

const getSubjectStatus = (seconds) => {
  if (seconds >= 3 * 3600) {
    return {
      status: "Strong",
      statusTone: "strong",
      advice: "Keep this pace and add revision practice."
    };
  }

  if (seconds >= 1 * 3600) {
    return {
      status: "Medium",
      statusTone: "medium",
      advice: "Add one focused revision block this week."
    };
  }

  return {
    status: "Needs Work",
    statusTone: "weak",
    advice: "Give this subject a short daily practice slot."
  };
};

const getReadinessLabel = (score) => {
  if (score >= 75) return "Strong Week";
  if (score >= 45) return "Improving";
  return "Needs Focus";
};

const getMcqSummary = async (userId, startOfWeek) => {
  const mcqResults = await MCQResult.find({
    userId,
    $or: [
      { createdAt: { $gte: startOfWeek } },
      { date: { $gte: startOfWeek } }
    ]
  });

  const totalTests = mcqResults.length;

  const averageAccuracy = totalTests
    ? Math.round(
        mcqResults.reduce((sum, item) => sum + toNumber(item.accuracy), 0) / totalTests
      )
    : 0;

  const best = mcqResults
    .slice()
    .sort((a, b) => toNumber(b.accuracy) - toNumber(a.accuracy))[0];

  return {
    totalTests,
    averageAccuracy,
    bestTopic: best?.topic || "",
    bestAccuracy: toNumber(best?.accuracy)
  };
};

const getStudyStreak = (dailyStudy) => {
  let streak = 0;

  for (let i = dailyStudy.length - 1; i >= 0; i--) {
    if (toNumber(dailyStudy[i].minutes) <= 0) break;
    streak += 1;
  }

  return streak;
};

const buildRecommendations = ({
  weakestSubject,
  completedHours,
  plannedHours,
  averageFocus,
  mcq,
  activeStudyDays
}) => {
  const recommendations = [];

  if (weakestSubject) {
    recommendations.push(`Give ${weakestSubject} the first study slot tomorrow.`);
  }

  if (completedHours < plannedHours * 0.5) {
    recommendations.push("Increase total study time with two focused 45-minute sessions.");
  }

  if (averageFocus > 0 && averageFocus < 70) {
    recommendations.push("Keep attention above 70% by using shorter sessions and quick breaks.");
  }

  if (!mcq.totalTests) {
    recommendations.push("Take at least one MCQ test to measure exam accuracy.");
  } else if (mcq.averageAccuracy < 60) {
    recommendations.push("Review wrong MCQ answers before starting new topics.");
  }

  if (activeStudyDays < 4) {
    recommendations.push("Study on at least four days this week for better consistency.");
  }

  if (!recommendations.length) {
    recommendations.push("Good progress. Keep the same rhythm and add one revision test.");
  }

  return recommendations.slice(0, 4);
};

const buildWeeklySummary = async (userId) => {
  const startOfWeek = getStartOfLast7Days();
  const days = getLast7Days();

  const [studyLogs, attentionLogs, mcq] = await Promise.all([
    StudyLog.find({
      userId,
      $and: [
        {
          $or: [
            { date: { $gte: startOfWeek } },
            { createdAt: { $gte: startOfWeek } }
          ]
        },
        {
          $or: [
            { plan: null },
            { plan: { $exists: false } }
          ]
        }
      ]
    }),

    AttentionLog.find({
      userId,
      $or: [
        { date: { $gte: startOfWeek } },
        { createdAt: { $gte: startOfWeek } }
      ]
    }),

    getMcqSummary(userId, startOfWeek)
  ]);

  const dailyStudyMap = {};
  const dailyFocusMap = {};
  const subjectSeconds = {};

  days.forEach((day) => {
    dailyStudyMap[day.key] = {
      ...day,
      seconds: 0,
      sessions: 0
    };

    dailyFocusMap[day.key] = {
      ...day,
      total: 0,
      count: 0
    };
  });

  let totalSeconds = 0;

  studyLogs.forEach((log) => {
    const seconds = getStudySeconds(log);

    if (!seconds || seconds <= 0) return;

    const key = getDateKey(getLogDate(log));
    const subject = String(log.subject || "General").trim() || "General";

    totalSeconds += seconds;
    subjectSeconds[subject] = (subjectSeconds[subject] || 0) + seconds;

    if (dailyStudyMap[key]) {
      dailyStudyMap[key].seconds += seconds;
      dailyStudyMap[key].sessions += 1;
    }
  });

  attentionLogs.forEach((log) => {
    const key = getDateKey(getLogDate(log));

    if (!dailyFocusMap[key]) return;

    dailyFocusMap[key].total += toNumber(log.focusScore);
    dailyFocusMap[key].count += 1;
  });

  const dailyStudy = days.map((day) => {
    const item = dailyStudyMap[day.key];

    return {
      day: item.day,
      date: item.date,
      minutes: Math.round(item.seconds / 60),
      hours: formatHours(item.seconds),
      sessions: item.sessions
    };
  });

  const dailyFocus = days.map((day) => {
    const item = dailyFocusMap[day.key];

    return {
      day: item.day,
      date: item.date,
      focus: item.count ? Math.round(item.total / item.count) : 0,
      records: item.count
    };
  });

  const subjectList = Object.entries(subjectSeconds)
    .sort((a, b) => b[1] - a[1])
    .map(([name, seconds]) => {
      const status = getSubjectStatus(seconds);

      return {
        name,
        hours: formatHours(seconds),
        minutes: Math.round(seconds / 60),
        percentage: totalSeconds ? Math.round((seconds / totalSeconds) * 100) : 0,
        ...status
      };
    });

  const subjects = {};

  subjectList.forEach((subject) => {
    subjects[subject.name] = {
      hours: subject.hours,
      status: subject.status,
      percentage: subject.percentage
    };
  });

  const completedHours = formatHours(totalSeconds);
  const plannedHours = PLANNED_WEEKLY_HOURS;
  const pendingHours = round1(Math.max(0, plannedHours - completedHours));
  const completionRate = plannedHours
    ? clamp(Math.round((completedHours / plannedHours) * 100), 0, 100)
    : 0;

  const averageFocus = attentionLogs.length
    ? Math.round(
        attentionLogs.reduce((sum, log) => sum + toNumber(log.focusScore), 0) / attentionLogs.length
      )
    : 0;

  const activeStudyDays = dailyStudy.filter((day) => day.minutes > 0).length;
  const consistencyScore = Math.round((activeStudyDays / 7) * 100);

  const readinessScore = clamp(
    Math.round(
      completionRate * 0.4 +
        averageFocus * 0.25 +
        mcq.averageAccuracy * 0.25 +
        consistencyScore * 0.1
    ),
    0,
    95
  );

  const weakestSubject = subjectList.length
    ? subjectList.slice().sort((a, b) => a.minutes - b.minutes)[0].name
    : "";

  const recommendations = buildRecommendations({
    weakestSubject,
    completedHours,
    plannedHours,
    averageFocus,
    mcq,
    activeStudyDays
  });

  return {
    week: "Last 7 Days",
    range: `${days[0].date} - ${days[days.length - 1].date}`,
    generatedAt: new Date(),

    plannedHours,
    completedHours,
    pendingHours,
    completionRate,

    totalFocusLogs: attentionLogs.length,
    averageFocus,

    activeStudyDays,
    studyStreak: getStudyStreak(dailyStudy),

    subjects,
    subjectList,

    dailyStudy,
    dailyFocus,

    mcq,

    readinessScore,
    readinessLabel: getReadinessLabel(readinessScore),
    passProbability: `${readinessScore}%`,

    weakestSubject,
    topSubject: subjectList[0]?.name || "",

    recommendations,
    suggestion: recommendations[0]
  };
};

export const getWeeklyReport = async (req, res) => {
  try {
    const report = await buildWeeklySummary(req.user.id);

    res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error("WEEKLY REPORT ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Report generation failed",
      msg: "Report generation failed"
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const report = await buildWeeklySummary(req.user.id);

    res.json({
      success: true,
      analytics: {
        dailyStudy: report.dailyStudy,
        dailyFocus: report.dailyFocus,
        mcq: report.mcq,
        completionRate: report.completionRate,
        readinessScore: report.readinessScore
      }
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Analytics generation failed"
    });
  }
};

export const saveAttention = async (req, res) => {
  try {
    const {
      focusLevel,
      focusScore,
      subject,
      totalSessionTime,
      absentTime,
      alertsTriggered
    } = req.body;

    const newLog = new AttentionLog({
      userId: req.user.id,
      focusScore: toNumber(focusLevel ?? focusScore),
      subject: subject || "General",
      totalSessionTime: toNumber(totalSessionTime),
      absentTime: toNumber(absentTime),
      alertsTriggered: toNumber(alertsTriggered),
      date: new Date()
    });

    await newLog.save();

    res.status(200).json({
      success: true,
      message: "Attention saved",
      log: newLog
    });
  } catch (err) {
    console.error("SAVE ATTENTION ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Error saving attention"
    });
  }
};
