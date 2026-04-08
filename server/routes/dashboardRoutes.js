// import express from "express";
// import StudyLog from "../models/StudyLog.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// /*
//  GET /api/dashboard
// */

// router.get("/", authMiddleware, async (req, res) => {
//   try {

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         msg: "User not authorized"
//       });
//     }

//     const userId = req.user.id;

//     // =========================
//     // 📊 LAST 7 DAYS STATS
//     // =========================
//     const logs = await StudyLog.find({
//       userId,
//       hours: { $exists: true }
//     });

//     let total = 0;

//     const subjects = {
//       Physics: 0,
//       Chemistry: 0,
//       Biology: 0,
//       General: 0
//     };

//     logs.forEach(log => {
//       total += Number(log.hours) || 0;

//       if (subjects[log.subject] !== undefined) {
//         subjects[log.subject] += Number(log.hours) || 0;
//       } else {
//         subjects.General += Number(log.hours) || 0;
//       }
//     });

//     // =========================
//     // 📅 GET ONLY VALID PLANS (FIXED)
//     // =========================
//     const plans = await StudyLog.find({
//       userId,
//       plan: { $ne: null }   // ✅ IMPORTANT FIX
//     }).sort({ _id: -1 });

//     console.log("🔥 ALL PLANS:", plans.length);

//     // =========================
//     // 🚀 RESPONSE (FINAL)
//     // =========================
//     res.status(200).json({
//       success: true,
//       totalHours: total,
//       subjects,

//       // ✅ for dropdown
//       plans: plans,

//       // ✅ fallback (latest plan)
//       plan: plans.length > 0 ? plans[0].plan : null
//     });

//   } catch (err) {

//     console.error("Dashboard Error:", err);

//     res.status(500).json({
//       success: false,
//       msg: "Dashboard fetch failed"
//     });
//   }
// });

// export default router;











import express from "express";
import StudyLog from "../models/StudyLog.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 GET /api/dashboard
*/

router.get("/", authMiddleware, async (req, res) => {
  try {

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        msg: "User not authorized"
      });
    }

    const userId = req.user.id;

    // 📊 STATS
    const logs = await StudyLog.find({
      userId,
      hours: { $exists: true }
    });

    let total = 0;

    const subjects = {
      Physics: 0,
      Chemistry: 0,
      Biology: 0,
      General: 0
    };

    logs.forEach(log => {
      total += Number(log.hours) || 0;

      if (subjects[log.subject] !== undefined) {
        subjects[log.subject] += Number(log.hours) || 0;
      } else {
        subjects.General += Number(log.hours) || 0;
      }
    });

    // 📅 ONLY VALID PLANS
    const plans = await StudyLog.find({
      userId,
      plan: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    console.log("🔥 ALL PLANS:", plans.length);

    res.status(200).json({
      success: true,
      totalHours: total,
      subjects,

      // 🔥 IMPORTANT
      plans,

      // fallback
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