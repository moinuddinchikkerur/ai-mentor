









import mongoose from "mongoose";

const attentionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sessionId: {
      type: String,
      default: ""
    },

    date: {
      type: Date,
      default: Date.now
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    endedAt: {
      type: Date,
      default: Date.now
    },

    lastSyncedAt: {
      type: Date,
      default: Date.now
    },

    totalSessionTime: {
      type: Number,
      default: 0,
      min: 0
    },

    absentTime: {
      type: Number,
      default: 0,
      min: 0
    },

    alertsTriggered: {
      type: Number,
      default: 0,
      min: 0
    },

    focusScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    subject: {
      type: String,
      default: "General",
      trim: true
    },

    subjectSource: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto"
    }
  },
  {
    timestamps: true
  }
);

attentionSchema.index({ userId: 1, date: -1 });
attentionSchema.index({ userId: 1, subject: 1, date: -1 });
attentionSchema.index(
  { userId: 1, sessionId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("AttentionLog", attentionSchema);







