import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getAdminStats,
  getAdminUsers,
  getAdminStudentDetails,
  updateUserRole,
  toggleUserBlock,
  deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    next();
  } catch (err) {
    console.error("Admin Middleware Error:", err);

    return res.status(500).json({
      success: false,
      message: "Admin check failed"
    });
  }
};

router.get("/stats", authMiddleware, requireAdmin, getAdminStats);
router.get("/users", authMiddleware, requireAdmin, getAdminUsers);
router.get("/users/:id/details", authMiddleware, requireAdmin, getAdminStudentDetails);
router.put("/users/:id/role", authMiddleware, requireAdmin, updateUserRole);
router.put("/users/:id/block", authMiddleware, requireAdmin, toggleUserBlock);
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUser);

export default router;
