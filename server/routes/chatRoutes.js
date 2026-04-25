








import express from "express";
import {
  getChats,
  getChat,
  createChat,
  sendMessage,
  updateChatTitle,
  clearChatMessages,
  deleteChat
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getChats);

router.post("/new", authMiddleware, createChat);

router.post("/message", authMiddleware, sendMessage);

router.patch("/:id/title", authMiddleware, updateChatTitle);

router.delete("/:id/messages", authMiddleware, clearChatMessages);

router.get("/:id", authMiddleware, getChat);

router.delete("/:id", authMiddleware, deleteChat);

export default router;
