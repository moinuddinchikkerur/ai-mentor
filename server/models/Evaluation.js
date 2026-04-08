import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({

  chatId: {
    type: String,
    required: true
  },

  question: {
    type: String,
    required: true
  },

  answer: {
    type: String,
    required: true
  },

  result: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Evaluation", evaluationSchema);