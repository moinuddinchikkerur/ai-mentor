import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🔥 PLAN DATA
  subjects: {
    type: [String],
    default: []
  },

  days: {
    type: Number,
    default: 0
  },

  // 🔥 FIXED (IMPORTANT)
  plan: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // 🔥 OPTIONAL (for stats)
  hours: {
    type: Number,
    default: 0
  },

  subject: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("StudyLog", studyLogSchema);