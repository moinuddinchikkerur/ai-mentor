









import mongoose from "mongoose";

const mcqQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [String],
      default: []
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },

    selectedAnswer: {
      type: String,
      default: "",
      trim: true
    },

    explanation: {
      type: String,
      default: "",
      trim: true
    }
  },
  { _id: false }
);

const mcqResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    subject: {
      type: String,
      default: "",
      trim: true
    },

    topic: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },

    correctAnswers: {
      type: Number,
      required: true,
      min: 0
    },

    wrongAnswers: {
      type: Number,
      required: true,
      min: 0
    },

    score: {
      type: Number,
      required: true,
      min: 0
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    questions: {
      type: [mcqQuestionSchema],
      default: []
    }
  },
  { timestamps: true }
);

mcqResultSchema.index({ userId: 1, createdAt: -1 });
mcqResultSchema.index({ userId: 1, topic: 1 });

export default mongoose.model("MCQResult", mcqResultSchema);
