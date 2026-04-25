




import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      default: "Reward"
    },

    points: {
      type: Number,
      default: 0
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  days: {
    type: Number,
    default: 0
  },

  points: {
    type: Number,
    default: 0
  },

  gamesPlayed: {
    type: Number,
    default: 0
  },

  rewards: {
    type: [rewardSchema],
    default: []
  },

  lastActive: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Streak", streakSchema);
