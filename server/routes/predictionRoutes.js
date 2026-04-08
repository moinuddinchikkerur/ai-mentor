import express from "express";
import { askGemini } from "../controllers/geminiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ask", authMiddleware, askGemini);

export default router;
