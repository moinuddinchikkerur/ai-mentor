






import express from "express";
import {
  saveResult,
  getHistory,
  getSession,
  deleteResult
} from "../controllers/mcqResultController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", authMiddleware, saveResult);

router.get("/history", authMiddleware, getHistory);

router.get("/:id", authMiddleware, getSession);

router.delete("/:id", authMiddleware, deleteResult);

export default router;
