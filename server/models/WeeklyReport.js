import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  weekStart: Date,
  weekEnd: Date,

  totalHours: Number,

  subjects: {
    physics: Number,
    chemistry: Number,
    biology: Number,
    general: Number
  },

  status: {
    physics: String,
    chemistry: String,
    biology: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("WeeklyReport", weeklyReportSchema);
