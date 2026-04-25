




import express from "express";
import { detectBurnout } from "../controllers/burnoutController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check", authMiddleware, detectBurnout);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Burnout route working"
  });
});

export default router;
