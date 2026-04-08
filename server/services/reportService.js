import StudyLog from "../models/StudyLog.js";
import WeeklyReport from "../models/WeeklyReport.js";

export const generateWeeklyReport = async (userId) => {

  // Last 7 days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  // Get logs
  const logs = await StudyLog.find({
    userId,
    date: { $gte: start, $lte: end }
  });

  let total = 0;

  let subjects = {
    physics: 0,
    chemistry: 0,
    biology: 0,
    general: 0
  };

  // Calculate
  logs.forEach(log => {

    total += log.hours;

    if (log.subject === "Physics") subjects.physics += log.hours;
    else if (log.subject === "Chemistry") subjects.chemistry += log.hours;
    else if (log.subject === "Biology") subjects.biology += log.hours;
    else subjects.general += log.hours;
  });

  // Status logic
  const status = {
    physics: subjects.physics >= 5 ? "Strong 💪" : "Weak ❌",
    chemistry: subjects.chemistry >= 5 ? "Strong 💪" : "Weak ❌",
    biology: subjects.biology >= 5 ? "Strong 💪" : "Weak ❌"
  };

  // Save report
  const report = await WeeklyReport.create({

    userId,
    weekStart: start,
    weekEnd: end,

    totalHours: total,
    subjects,
    status
  });

  return report;
};
