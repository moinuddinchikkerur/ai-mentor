import express from "express";
import { askGemini } from "../controllers/geminiController.js";

const router = express.Router();

/* =========================
   AI Route (No Auth)
========================= */
router.post("/ask", askGemini);

/* =========================
   Test Route
========================= */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Gemini route working",
  });
});

export default router;