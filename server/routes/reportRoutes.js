





import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getWeeklyReport,
  getAnalytics,
  saveAttention
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("✅ Report Routes Working");
});

router.get("/weekly", authMiddleware, getWeeklyReport);

router.get("/analytics", authMiddleware, getAnalytics);

// Old compatibility route.
// Your new AttentionMonitor should use /api/attention/save instead.
router.post("/attention/save", authMiddleware, saveAttention);

export default router;
