












export const TIME_SLOTS = [
  "9-10",
  "10-11",
  "11-12",
  "12-1",
  "1-2",
  "2-3",
  "3-4",
  "4-5"
];

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const BREAK_SLOT = "11-12";
const REVISION_SLOT = "3-4";

export const normalizeSubjects = (subjectsInput) => {
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

const getNextDifferentSubject = (subjects, startIndex, blockedSubject) => {
  if (subjects.length === 0) {
    return "Study";
  }

  for (let index = 0; index < subjects.length; index++) {
    const candidate = subjects[(startIndex + index) % subjects.length];

    if (candidate !== blockedSubject) {
      return candidate;
    }
  }

  return subjects[0];
};

export const createWeeklyTimetable = (subjectsInput) => {
  const subjects = normalizeSubjects(subjectsInput);

  if (subjects.length === 0) {
    return {};
  }

  const studySlots = TIME_SLOTS.filter(
    (time) => time !== BREAK_SLOT && time !== REVISION_SLOT
  );

  const plan = {};

  WEEK_DAYS.forEach((day, dayIndex) => {
    const focusSubject = subjects[dayIndex % subjects.length];
    let lastSubject = null;
    const dayPlan = {};

    studySlots.forEach((time, studyIndex) => {
      let selectedSubject = focusSubject;

      if (subjects.length > 1) {
        if (studyIndex === 0 || studyIndex === studySlots.length - 1) {
          selectedSubject = focusSubject;
        } else {
          const preferredIndex = dayIndex + studyIndex + 1;
          selectedSubject = getNextDifferentSubject(
            subjects,
            preferredIndex,
            lastSubject
          );

          if (subjects.length > 2 && selectedSubject === focusSubject) {
            selectedSubject = getNextDifferentSubject(
              subjects,
              preferredIndex + 1,
              lastSubject
            );
          }
        }
      }

      dayPlan[time] = selectedSubject || "Study";
      lastSubject = dayPlan[time];
    });

    dayPlan[BREAK_SLOT] = "Break";
    dayPlan[REVISION_SLOT] = "Revision";

    plan[day] = {};

    TIME_SLOTS.forEach((time) => {
      plan[day][time] = dayPlan[time];
    });
  });

  return plan;
};
