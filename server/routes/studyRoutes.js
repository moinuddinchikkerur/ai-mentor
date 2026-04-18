// import express from "express";
// import {
//   savePlan,
//   getHistory,
//   deletePlan
// } from "../controllers/studyController.js";

// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // 🔐 protect routes
// router.use(authMiddleware);

// router.post("/save", savePlan);
// router.get("/history", getHistory);
// router.delete("/:id", deletePlan);

// export default router;



import express from "express";
import {
  savePlan,
  getHistory,
  deletePlan,
  saveSession // 🔥 NEW
} from "../controllers/studyController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/save", savePlan);

// 🔥 NEW ROUTE
router.post("/session", saveSession);

router.get("/history", getHistory);
router.delete("/:id", deletePlan);

export default router;