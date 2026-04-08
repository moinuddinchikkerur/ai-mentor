// import { runAI } from "../utils/aiHelper.js";

// export const makePlan = async (req, res) => {
//   try {
//     console.log("📅 Planner Request:", req.body);

//     const { subjects, days } = req.body;

//     if (!subjects || !days) {
//       return res.status(400).json({
//         success: false,
//         message: "Subjects and days are required",
//       });
//     }

//     const totalDays = parseInt(days);

//     if (isNaN(totalDays) || totalDays <= 0 || totalDays > 60) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid number of days (1-60)",
//       });
//     }

//     // 🔥 AI (optional, fallback safe)
//     let reply = "";
//     try {
//       reply = await runAI(`Create a ${totalDays}-day study plan for: ${subjects}`);
//     } catch (err) {
//       console.error("⚠️ AI Failed:", err.message);
//     }

//     // 🔥 SUBJECT LIST
//     const subjectList = subjects
//       .split(",")
//       .map(s => s.trim())
//       .filter(Boolean);

//     // 🔥 SHUFFLE FUNCTION
//     const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

//     // 🔥 TIME SLOTS (FULL DAY)
//     const timeSlots = [
//       "9:00-10:00",
//       "10:00-11:00",
//       "11:00-12:00", // Break
//       "12:00-1:00",
//       "1:00-2:00",
//       "2:00-3:00",
//       "3:00-4:00", // Revision
//       "4:00-5:00"
//     ];

//     const finalPlan = {};

//     for (let i = 1; i <= totalDays; i++) {

//       let shuffled = shuffle([...subjectList]);
//       let index = 0;

//       finalPlan[`Day ${i}`] = {};

//       timeSlots.forEach((time) => {

//         if (time === "11:00-12:00") {
//           finalPlan[`Day ${i}`][time] = "Break";
//         } else if (time === "3:00-4:00") {
//           finalPlan[`Day ${i}`][time] = "Revision";
//         } else {
//           finalPlan[`Day ${i}`][time] =
//             shuffled[index % shuffled.length] || "Study";
//           index++;
//         }

//       });

//     }

//     console.log("✅ Infinite Random Plan Generated");

//     return res.status(200).json({
//       success: true,
//       aiResponse: reply || "AI skipped (fallback used)",
//       plan: finalPlan,
//     });

//   } catch (err) {
//     console.error("❌ Planner Error:", err.message);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate study plan",
//     });
//   }
// };





import { runAI } from "../utils/aiHelper.js";

export const makePlan = async (req, res) => {
  try {
    console.log("📅 Planner Request:", req.body);

    const { subjects } = req.body;

    if (!subjects) {
      return res.status(400).json({
        success: false,
        message: "Subjects are required",
      });
    }

    const totalDays = 7; // 🔥 FIXED TO 7 DAYS

    // 🔥 AI (optional)
    let reply = "";
    try {
      reply = await runAI(`Create a 7-day study plan for: ${subjects}`);
    } catch (err) {
      console.error("⚠️ AI Failed:", err.message);
    }

    // 🔥 SUBJECT LIST
    const subjectList = subjects
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    // 🔥 SHUFFLE
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

    // 🔥 TIME SLOTS
    const timeSlots = [
      "9:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-1:00",
      "1:00-2:00",
      "2:00-3:00",
      "3:00-4:00",
      "4:00-5:00"
    ];

    // 🔥 WEEK DAYS
    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];

    const finalPlan = {};

    for (let i = 0; i < 7; i++) {

      let shuffled = shuffle([...subjectList]);
      let index = 0;

      finalPlan[weekDays[i]] = {};

      timeSlots.forEach((time) => {

        if (time === "11:00-12:00") {
          finalPlan[weekDays[i]][time] = "Break";
        } else if (time === "3:00-4:00") {
          finalPlan[weekDays[i]][time] = "Revision";
        } else {
          finalPlan[weekDays[i]][time] =
            shuffled[index % shuffled.length] || "Study";
          index++;
        }

      });

    }

    console.log("✅ Weekly Plan Generated");

    return res.status(200).json({
      success: true,
      aiResponse: reply || "AI skipped",
      plan: finalPlan,
    });

  } catch (err) {
    console.error("❌ Planner Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate study plan",
    });
  }
};