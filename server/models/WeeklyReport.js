




import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  weekStart: Date,
  weekEnd: Date,

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

export default mongoose.model("WeeklyReport", weeklyReportSchema);
