import mongoose from "mongoose";

const studyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    entryType: {
      type: String,
      enum: ["plan", "session"],
      default: "session"
    },

    title: {
      type: String,
      default: "",
      trim: true
    },

    subjects: {
      type: [String],
      default: []
    },

    days: {
      type: Number,
      default: 0,
      min: 0,
      max: 31
    },

    plan: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    strategy: {
      type: String,
      default: ""
    },

    aiResponse: {
      type: String,
      default: ""
    },

    hours: {
      type: Number,
      default: 0,
      min: 0
    },

    subject: {
      type: String,
      default: "",
      trim: true
    },

    session: {
      type: Number,
      default: 0,
      min: 0
    },

    absent: {
      type: Number,
      default: 0,
      min: 0
    },

    alerts: {
      type: Number,
      default: 0,
      min: 0
    },

    score: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

studyLogSchema.index({ userId: 1, entryType: 1, createdAt: -1 });
studyLogSchema.index({ userId: 1, subject: 1, date: -1 });

export default mongoose.model("StudyLog", studyLogSchema);
