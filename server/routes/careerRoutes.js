import express from "express";
import { careerGuide } from "../controllers/careerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/guide", authMiddleware, careerGuide);

export default router;