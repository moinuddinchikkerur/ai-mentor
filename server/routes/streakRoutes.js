


import express from "express";
import {
  updateStreak,
  getMyStreak,
  addReward
} from "../controllers/streakController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/update", authMiddleware, updateStreak);

router.get("/me", authMiddleware, getMyStreak);

router.post("/reward", authMiddleware, addReward);

export default router;
