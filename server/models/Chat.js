import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
});

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "New Chat"
  },
  messages: [messageSchema]
},{
  timestamps:true
});

export default mongoose.model("Chat", chatSchema);