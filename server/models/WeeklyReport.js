import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  weekStart: {
    type: Date,
    default: null
  },

  weekEnd: {
    type: Date,
    default: null
  },

  plannedHours: {
    type: Number,
    default: 25
  },

  completedHours: {
    type: Number,
    default: 0
  },

  pendingHours: {
    type: Number,
    default: 0
  },

  averageFocus: {
    type: Number,
    default: 0
  },

  subjects: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  mcq: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  passProbability: {
    type: String,
    default: "0%"
  },

  suggestion: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

weeklyReportSchema.index({ userId: 1, createdAt: -1 });
weeklyReportSchema.index({ userId: 1, weekStart: -1 });

export default mongoose.model("WeeklyReport", weeklyReportSchema);
