



import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },

    topic: {
      type: String,
      required: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    question: {
      type: String,
      required: true
    },

    options: {
      type: [String],
      required: true
    },

    correctAnswer: {
      type: String,
      required: true
    },

    explanation: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("MCQ", mcqSchema);
