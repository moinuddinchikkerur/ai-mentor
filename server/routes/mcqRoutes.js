


import express from "express";
import {
  addMCQ,
  getMCQs,
  submitMCQ
} from "../controllers/mcqController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addMCQ);

router.post("/submit", authMiddleware, submitMCQ);

router.get("/:subject/:topic", authMiddleware, getMCQs);

export default router;
