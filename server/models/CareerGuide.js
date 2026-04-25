import mongoose from "mongoose";

const careerGuideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    interest: {
      type: String,
      required: true,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: String,
      default: "Not mentioned",
      trim: true
    },
    goal: {
      type: String,
      default: "Become career-ready",
      trim: true
    },
    workStyle: {
      type: String,
      default: "Flexible",
      trim: true
    },
    studyTime: {
      type: String,
      default: "5-7 hrs/week",
      trim: true
    },
    guide: {
      type: String,
      required: true
    },
    guideData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    aiUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

careerGuideSchema.index({ userId: 1, createdAt: -1 });

const CareerGuide = mongoose.model("CareerGuide", careerGuideSchema);

export default CareerGuide;
