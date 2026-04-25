





import StudyLog from "../models/StudyLog.js";
import WeeklyReport from "../models/WeeklyReport.js";
import AttentionLog from "../models/AttentionLog.js";
import MCQResult from "../models/MCQResult.js";

const formatHours = (seconds) => {
  return Math.round((seconds / 3600) * 10) / 10;
};

export const generateWeeklyReport = async (userId) => {
  const end = new Date();

  const start = new Date();
  start.setDate(end.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const logs = await StudyLog.find({
    userId,
    date: { $gte: start, $lte: end },
    $or: [
      { plan: null },
      { plan: { $exists: false } }
    ]
  });

  const attentionLogs = await AttentionLog.find({
    userId,
    date: { $gte: start, $lte: end }
  });

  const mcqResults = await MCQResult.find({
    userId,
    createdAt: { $gte: start, $lte: end }
  });

  let totalSeconds = 0;
  const subjects = {};

  logs.forEach(log => {
    const seconds = Number(log.session || 0) + Number(log.hours || 0) * 3600;

    if (!seconds || seconds <= 0) return;

    const subject = log.subject || "General";

    totalSeconds += seconds;
    subjects[subject] = (subjects[subject] || 0) + seconds;
  });

  const subjectReport = {};

  Object.entries(subjects).forEach(([subject, seconds]) => {
    subjectReport[subject] = {
      hours: formatHours(seconds),
      status: seconds >= 3 * 3600 ? "Strong 💪" : seconds >= 1 * 3600 ? "Medium ⚠️" : "Weak ❌"
    };
  });

  const averageFocus = attentionLogs.length
    ? Math.round(
        attentionLogs.reduce((sum, log) => sum + Number(log.focusScore || 0), 0) / attentionLogs.length
      )
    : 0;

  const averageAccuracy = mcqResults.length
    ? Math.round(
        mcqResults.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / mcqResults.length
      )
    : 0;

  const completedHours = formatHours(totalSeconds);
  const plannedHours = 25;
  const pendingHours = Math.max(0, plannedHours - completedHours);

  const report = await WeeklyReport.create({
    userId,
    weekStart: start,
    weekEnd: end,
    plannedHours,
    completedHours,
    pendingHours,
    averageFocus,
    subjects: subjectReport,
    passProbability: `${Math.min(95, Math.round((completedHours / plannedHours) * 65 + averageFocus * 0.2 + averageAccuracy * 0.15))}%`,
    suggestion: "Review weak subjects, keep focus above 70%, and practice MCQs."
  });

  return report;
};
