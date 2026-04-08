import mongoose from "mongoose";

const attentionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  totalSessionTime: {
    type: Number,
    default: 0
  },

  absentTime: {
    type: Number,
    default: 0
  },

  alertsTriggered: {
    type: Number,
    default: 0
  },

  focusScore: {
    type: Number,
    default: 100
  }
});

export default mongoose.model("AttentionLog", attentionSchema);