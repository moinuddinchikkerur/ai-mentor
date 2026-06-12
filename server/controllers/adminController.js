import mongoose from "mongoose";
import User from "../models/User.js";
import MCQ from "../models/MCQ.js";
import MCQResult from "../models/MCQResult.js";
import StudyLog from "../models/StudyLog.js";
import AttentionLog from "../models/AttentionLog.js";
import WeeklyReport from "../models/WeeklyReport.js";

const cleanUser = (user) => {
  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    role: user.role || "student",
    isBlocked: Boolean(user.isBlocked),
    exam: user.exam || "",
    targetDate: user.targetDate || null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null
  };
};

const safeCount = async (Model, filter = {}) => {
  try {
    return await Model.countDocuments(filter);
  } catch {
    return 0;
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const studentFilter = {
      $or: [
        { role: "student" },
        { role: { $exists: false } }
      ]
    };

    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalBlocked,
      totalMcqs,
      totalMcqAttempts,
      totalStudyLogs,
      totalAttentionLogs,
      totalWeeklyReports
    ] = await Promise.all([
      safeCount(User),
      safeCount(User, studentFilter),
      safeCount(User, { role: "admin" }),
      safeCount(User, { isBlocked: true }),
      safeCount(MCQ),
      safeCount(MCQResult),
      safeCount(StudyLog),
      safeCount(AttentionLog),
      safeCount(WeeklyReport)
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalBlocked,
        totalMcqs,
        totalMcqAttempts,
        totalStudyLogs,
        totalAttentionLogs,
        totalWeeklyReports
      }
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin stats"
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { exam: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const users = await User.collection
      .find(filter, {
        projection: {
          password: 0
        }
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      users: users.map(cleanUser)
    });
  } catch (err) {
    console.error("Admin Users Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load users"
    });
  }
};

export const getAdminStudentDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const user = await User.collection.findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [
      mcqResults,
      studyLogs,
      attentionLogs,
      weeklyReports,
      mcqCount,
      studyLogCount,
      attentionLogCount,
      weeklyReportCount
    ] = await Promise.all([
      MCQResult.find({ userId }).sort({ createdAt: -1 }).limit(10),
      StudyLog.find({ userId }).sort({ createdAt: -1 }).limit(10),
      AttentionLog.find({ userId }).sort({ date: -1 }).limit(10),
      WeeklyReport.find({ userId }).sort({ createdAt: -1 }).limit(10),
      MCQResult.countDocuments({ userId }),
      StudyLog.countDocuments({ userId }),
      AttentionLog.countDocuments({ userId }),
      WeeklyReport.countDocuments({ userId })
    ]);

    const averageMcqAccuracy = mcqResults.length
      ? Math.round(
          mcqResults.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) /
            mcqResults.length
        )
      : 0;

    const totalStudyHours = studyLogs.reduce(
      (sum, item) => sum + Number(item.hours || 0),
      0
    );

    const averageFocus = attentionLogs.length
      ? Math.round(
          attentionLogs.reduce((sum, item) => sum + Number(item.focusScore || 0), 0) /
            attentionLogs.length
        )
      : 0;

    return res.json({
      success: true,
      user: cleanUser(user),
      summary: {
        mcqCount,
        studyLogCount,
        attentionLogCount,
        weeklyReportCount,
        averageMcqAccuracy,
        totalStudyHours,
        averageFocus
      },
      mcqResults,
      studyLogs,
      attentionLogs,
      weeklyReports
    });
  } catch (err) {
    console.error("Admin Student Details Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load student details"
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one admin is required"
        });
      }
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "User role updated",
      user: cleanUser(user)
    });
  } catch (err) {
    console.error("Update Role Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update role"
    });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const currentUserId = String(req.user.id);

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid block status"
      });
    }

    if (String(req.params.id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin" && isBlocked) {
      return res.status(400).json({
        success: false,
        message: "Admin accounts cannot be blocked"
      });
    }

    await User.collection.updateOne(
      { _id: objectId },
      { $set: { isBlocked } }
    );

    const updatedUser = await User.collection.findOne({ _id: objectId });

    console.log("Block updated:", {
      id: req.params.id,
      requestedValue: isBlocked,
      savedValue: updatedUser?.isBlocked,
      email: updatedUser?.email
    });

    return res.json({
      success: true,
      message: isBlocked ? "User blocked" : "User unblocked",
      user: cleanUser(updatedUser)
    });
  } catch (err) {
    console.error("Toggle Block Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update block status"
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);

    if (String(req.params.id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "At least one admin is required"
        });
      }
    }

    await user.deleteOne();

    return res.json({
      success: true,
      message: "User deleted"
    });
  } catch (err) {
    console.error("Delete User Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
};
