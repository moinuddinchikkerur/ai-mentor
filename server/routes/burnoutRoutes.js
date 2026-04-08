import express from "express";
import { detectBurnout } from "../controllers/burnoutController.js";

const router = express.Router();

// Check Burnout
router.post("/check", detectBurnout);

export default router;