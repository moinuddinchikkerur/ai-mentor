





import express from "express";
import {
  careerGuide,
  getCareerHistory,
  clearCareerHistory,
  deleteCareerHistoryItem
} from "../controllers/careerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/guide", authMiddleware, careerGuide);
router.get("/history", authMiddleware, getCareerHistory);
router.delete("/history", authMiddleware, clearCareerHistory);
router.delete("/history/:id", authMiddleware, deleteCareerHistoryItem);

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Career route working"
  });
});

export default router;
