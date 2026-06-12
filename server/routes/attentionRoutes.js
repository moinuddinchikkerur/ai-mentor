







import express from "express";
import {
  saveAttention,
  getMyAttentionReport,
  clearMyAttentionReport
} from "../controllers/attentionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Attention route working"
  });
});

//  Save attention
router.post("/save", authMiddleware, saveAttention);

//  GET report (correct route)
router.get("/report", authMiddleware, getMyAttentionReport);

//  ALSO support old frontend route (FIX)
router.get("/my-report", authMiddleware, getMyAttentionReport);

//  Delete report
router.delete("/report", authMiddleware, clearMyAttentionReport);

export default router;