import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  days: {
    type: Number,
    default: 1
  },

  points: {
    type: Number,
    default: 10
  },

  lastActive: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Streak", streakSchema);