import express from "express";
import { updateStreak } from "../controllers/streakController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Update daily streak
router.post("/update", authMiddleware, updateStreak);

export default router;