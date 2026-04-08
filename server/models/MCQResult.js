import mongoose from "mongoose";

const mcqResultSchema = new mongoose.Schema(
{
  topic: {
    type: String,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  correctAnswers: {
    type: Number,
    required: true
  },

  wrongAnswers: {
    type: Number,
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String
    }
  ]

},
{ timestamps: true }
);

export default mongoose.model("MCQResult", mcqResultSchema);