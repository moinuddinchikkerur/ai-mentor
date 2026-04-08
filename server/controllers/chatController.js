import Chat from "../models/Chat.js";
import { runAI } from "../utils/aiHelper.js";

/* Get all chats */
export const getChats = async (req, res) => {
  try {

    const chats = await Chat.find().sort({ createdAt: -1 });

    res.json(chats);

  } catch (err) {
    console.error("Get chats error:", err);
    res.status(500).json({ error: "Failed to load chats" });
  }
};


/* Create new chat */
export const createChat = async (req, res) => {

  try {

    const chat = new Chat({
      title: "New Chat",
      messages: []
    });

    await chat.save();

    res.json(chat);

  } catch (err) {

    console.error("Create chat error:", err);
    res.status(500).json({ error: "Failed to create chat" });

  }

};


/* Send message */
export const sendMessage = async (req, res) => {

  try {

    const { chatId, message } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    /* Save user message */
    chat.messages.push({
      role: "user",
      content: message
    });

    /* Ask AI */
    const aiReply = await runAI(message);

    /* Save AI response */
    chat.messages.push({
      role: "ai",
      content: aiReply || "AI error"
    });

    await chat.save();

    res.json({ reply: aiReply });

  } catch (err) {

    console.error("Chat message error:", err);
    res.status(500).json({ error: "Failed to send message" });

  }

};