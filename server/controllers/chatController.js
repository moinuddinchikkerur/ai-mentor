



import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { runAI } from "../utils/aiHelper.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_MESSAGES = 12;
const MAX_TITLE_LENGTH = 80;
const CHAT_LIMIT = 50;

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const cleanText = (value) => {
  return String(value || "").replace(/\s+/g, " ").trim();
};

const cleanTitle = (value) => {
  const title = cleanText(value);

  if (!title) return "";

  return title.length > MAX_TITLE_LENGTH
    ? `${title.slice(0, MAX_TITLE_LENGTH - 3)}...`
    : title;
};

const createTitle = (message) => {
  const clean = cleanText(message);

  if (!clean) return "New Chat";

  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean;
};

const serializeMessage = (message = {}) => ({
  _id: message._id ? String(message._id) : undefined,
  role: message.role,
  content: message.content || "",
  createdAt: message.createdAt || null,
  updatedAt: message.updatedAt || null
});

const getPreview = (messages = []) => {
  const lastMessage = [...messages].reverse().find((item) => item?.content);

  if (!lastMessage) return "";

  const preview = cleanText(lastMessage.content);

  return preview.length > 90 ? `${preview.slice(0, 90)}...` : preview;
};

const serializeChat = (chat) => {
  const item = chat?.toObject ? chat.toObject() : chat;
  const messages = Array.isArray(item?.messages) ? item.messages : [];

  return {
    _id: String(item._id),
    title: item.title || "New Chat",
    messages: messages.map(serializeMessage),
    messageCount: messages.length,
    preview: getPreview(messages),
    lastMessageAt: item.lastMessageAt || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  };
};

const formatTargetDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toISOString().slice(0, 10);
};

const buildPrompt = ({ profile, conversation }) => {
  const exam = profile?.exam || "Not set";
  const targetDate = formatTargetDate(profile?.targetDate);

  return `
You are an AI exam mentor for a student.

Student profile:
- Exam: ${exam}
- Target date: ${targetDate}

Rules:
- Give clear, practical, exam-focused help.
- Use short paragraphs.
- Use steps or bullets when useful.
- If the student asks for a plan, make it realistic.
- If the question is unclear, ask one short follow-up question.
- Do not mention database, prompts, internal tools, or implementation details.

Conversation:
${conversation}

AI:
`;
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.user.id
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(CHAT_LIMIT)
      .lean();

    return res.json({
      success: true,
      chats: chats.map(serializeChat)
    });
  } catch (err) {
    console.error("Get chats error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load chats"
    });
  }
};

export const getChat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    const chat = await Chat.findOne({
      _id: id,
      userId: req.user.id
    }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    return res.json({
      success: true,
      chat: serializeChat(chat)
    });
  } catch (err) {
    console.error("Get chat error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to load chat"
    });
  }
};

export const createChat = async (req, res) => {
  try {
    const existingEmptyChat = await Chat.findOne({
      userId: req.user.id,
      title: "New Chat",
      messages: { $size: 0 }
    }).sort({ updatedAt: -1 });

    if (existingEmptyChat) {
      return res.json({
        success: true,
        chat: serializeChat(existingEmptyChat)
      });
    }

    const chat = await Chat.create({
      userId: req.user.id,
      title: "New Chat",
      messages: [],
      lastMessageAt: null
    });

    return res.json({
      success: true,
      chat: serializeChat(chat)
    });
  } catch (err) {
    console.error("Create chat error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create chat"
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Valid chatId is required"
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const userMessage = message.trim();

    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    chat.messages.push({
      role: "user",
      content: userMessage
    });

    if (!chat.title || chat.title === "New Chat") {
      chat.title = createTitle(userMessage);
    }

    const profile = await User.findById(req.user.id)
      .select("exam targetDate")
      .lean();

    const recentMessages = chat.messages.slice(-MAX_CONTEXT_MESSAGES);

    const conversation = recentMessages
      .map((item) => `${item.role === "user" ? "Student" : "AI"}: ${item.content}`)
      .join("\n");

    const prompt = buildPrompt({
      profile,
      conversation
    });

    let replyText = "";

    try {
      const aiReply = await runAI(prompt);
      replyText = aiReply?.trim();
    } catch (aiError) {
      console.error("AI reply failed:", aiError.message);
    }

    if (!replyText) {
      replyText = "I could not generate an answer right now. Please try again.";
    }

    chat.messages.push({
      role: "ai",
      content: replyText
    });

    chat.lastMessageAt = new Date();

    await chat.save();

    return res.json({
      success: true,
      reply: replyText,
      chat: serializeChat(chat)
    });
  } catch (err) {
    console.error("Chat message error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
};

export const updateChatTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const title = cleanTitle(req.body?.title);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Chat title is required"
      });
    }

    const chat = await Chat.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    chat.title = title;
    await chat.save();

    return res.json({
      success: true,
      message: "Chat renamed successfully",
      chat: serializeChat(chat)
    });
  } catch (err) {
    console.error("Rename chat error:", err);

    return res.status(500).json({
      success: false,
      message: "Rename failed"
    });
  }
};

export const clearChatMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    const chat = await Chat.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    chat.messages = [];
    chat.lastMessageAt = null;
    await chat.save();

    return res.json({
      success: true,
      message: "Chat messages cleared",
      chat: serializeChat(chat)
    });
  } catch (err) {
    console.error("Clear chat error:", err);

    return res.status(500).json({
      success: false,
      message: "Clear failed"
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat id"
      });
    }

    const chat = await Chat.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    return res.json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (err) {
    console.error("Delete chat error:", err);

    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
