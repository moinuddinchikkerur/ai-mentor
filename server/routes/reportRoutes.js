import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug Route
router.get("/test", (req, res) => {
  res.send("✅ Report Routes Working");
});

// Weekly Report
router.get("/weekly", authMiddleware, (req, res) => {

  res.json({
    success: true,

    report: {
      week: "This Week",

      plannedHours: 25,
      completedHours: 12,
      pendingHours: 13,

      subjects: {
        Physics: "Medium ⚠️",
        Chemistry: "Strong 💪",
        Biology: "Weak ❌"
      },

      passProbability: "75%",

      suggestion: "Revise Biology and take 2 mock tests"
    }
  });

});

export default router;
