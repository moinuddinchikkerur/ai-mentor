









import express from "express";
import {
  savePlan,
  saveSession,
  getHistory,
  getPlans,
  deletePlan
} from "../controllers/studyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save-plan", authMiddleware, savePlan);
router.post("/plan", authMiddleware, savePlan);
router.put("/plan/:id", authMiddleware, savePlan);

router.post("/save", authMiddleware, saveSession);
router.post("/save-session", authMiddleware, saveSession);
router.post("/session", authMiddleware, saveSession);

router.get("/history", authMiddleware, getHistory);
router.get("/plans", authMiddleware, getPlans);

router.delete("/plan/:id", authMiddleware, deletePlan);
router.delete("/:id", authMiddleware, deletePlan);

export default router;
