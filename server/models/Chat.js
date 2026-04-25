











import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000
    }
  },
  {
    timestamps: true
  }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: 80
    },

    messages: {
      type: [messageSchema],
      default: []
    },

    lastMessageAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

chatSchema.index({ userId: 1, updatedAt: -1 });
chatSchema.index({ userId: 1, lastMessageAt: -1 });
chatSchema.index({ userId: 1, title: 1 });

export default mongoose.model("Chat", chatSchema);
