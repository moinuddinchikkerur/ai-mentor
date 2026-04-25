





import { runAI } from "../utils/aiHelper.js";
import {
  createWeeklyTimetable,
  normalizeSubjects,
  WEEK_DAYS
} from "../services/timetableService.js";

const cleanAiText = (text) => {
  return String(text || "")
    .replace(/```/g, "")
    .trim();
};

const buildFallbackStrategy = (subjects) => {
  const firstSubject = subjects[0] || "your main subject";
  const secondarySubjects = subjects.slice(1, 4).join(", ");

  return [
    `1. Start each day with ${firstSubject} while focus is fresh.`,
    `2. Use the revision slot daily to review mistakes, notes, and short formulas.`,
    `3. Rotate ${secondarySubjects || "your remaining subjects"} through afternoon sessions for balance.`,
    "4. Keep Sunday lighter and use it to review weak areas from the whole week."
  ].join("\n");
};

export const makePlan = async (req, res) => {
  try {
    const { title = "Weekly Study Plan", subjects } = req.body;

    const subjectList = normalizeSubjects(subjects);

    if (subjectList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid subjects"
      });
    }

    const finalPlan = createWeeklyTimetable(subjectList);

    let strategy = buildFallbackStrategy(subjectList);

    try {
      const reply = await runAI(`
You are a study mentor.

Create a short weekly study strategy for these subjects:
${subjectList.join(", ")}

Rules:
- Return only 4 short bullet points
- Keep the advice simple and student-friendly
- Mention consistency, revision, and weak-topic review
- No headings
- No markdown code block
`);

      const cleanedReply = cleanAiText(reply);

      if (cleanedReply) {
        strategy = cleanedReply;
      }
    } catch (err) {
      console.error("Planner AI failed:", err.message);
    }

    return res.status(200).json({
      success: true,
      title: String(title || "").trim() || "Weekly Study Plan",
      subjects: subjectList,
      days: WEEK_DAYS.length,
      strategy,
      aiResponse: strategy,
      plan: finalPlan
    });
  } catch (err) {
    console.error("Planner Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate study plan"
    });
  }
};
