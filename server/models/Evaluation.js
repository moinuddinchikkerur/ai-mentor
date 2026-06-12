import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    chatId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    subject: {
      type: String,
      default: "General",
      trim: true
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000
    },

    result: {
      type: String,
      default: ""
    },

    marks: {
      type: Number,
      default: 0,
      min: 0
    },

    maxMarks: {
      type: Number,
      enum: [2, 5, 10, 15, 20, 25, 30],
      default: 20
    },

    wordCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

evaluationSchema.index({ userId: 1, chatId: 1, createdAt: 1 });
evaluationSchema.index({ userId: 1, subject: 1, createdAt: -1 });

export default mongoose.model("Evaluation", evaluationSchema);