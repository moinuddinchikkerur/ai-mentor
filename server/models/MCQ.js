import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({

  subject: {
    type: String,
    required: true
  },

  topic: {
    type: String,
    required: true
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
  }

});

export default mongoose.model("MCQ", mcqSchema);
