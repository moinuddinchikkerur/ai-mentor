



import express from "express";
import {
  saveAttention,
  getMyAttentionReport,
  clearMyAttentionReport
} from "../controllers/attentionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Attention route working"
  });
});

router.post("/save", authMiddleware, saveAttention);
router.get("/report", authMiddleware, getMyAttentionReport);
router.delete("/report", authMiddleware, clearMyAttentionReport);

export default router;
