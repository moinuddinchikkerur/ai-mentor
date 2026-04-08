


// import express from "express";
// import Chat from "../models/Chat.js";
// import { runAI } from "../utils/aiHelper.js";

// const router = express.Router();


// /* =============================
//    GET ALL CHATS
// ============================= */

// router.get("/", async (req, res) => {

//   try {

//     const chats = await Chat.find().sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       chats
//     });

//   } catch (err) {

//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to load chats"
//     });

//   }

// });


// /* =============================
//    CREATE NEW CHAT
// ============================= */

// router.post("/new", async (req, res) => {

//   try {

//     const chat = await Chat.create({
//       title: "New Chat",
//       messages: []
//     });

//     res.json({
//       success: true,
//       chat
//     });

//   } catch (err) {

//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create chat"
//     });

//   }

// });


// /* =============================
//    SEND MESSAGE
// ============================= */

// router.post("/message", async (req, res) => {

//   try {

//     const { chatId, message } = req.body;

//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({
//         success:false,
//         message:"Chat not found"
//       });
//     }

//     chat.messages.push({
//       role: "user",
//       content: message
//     });

//     const aiReply = await runAI(message);

//     chat.messages.push({
//       role: "ai",
//       content: aiReply
//     });

//     await chat.save();

//     res.json({
//       success: true,
//       reply: aiReply
//     });

//   } catch (err) {

//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Chat error"
//     });

//   }

// });

// export default router;






import express from "express";
import Chat from "../models/Chat.js";
import { runAI } from "../utils/aiHelper.js";

const router = express.Router();

/* =============================
   GET ALL CHATS
============================= */

router.get("/", async (req, res) => {
  try {

    const chats = await Chat.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      chats
    });

  } catch (err) {

    console.error("Load chats error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load chats"
    });

  }
});


/* =============================
   CREATE NEW CHAT
============================= */

router.post("/new", async (req, res) => {
  try {

    const chat = await Chat.create({
      title: "New Chat",
      messages: []
    });

    res.json({
      success: true,
      chat
    });

  } catch (err) {

    console.error("Create chat error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create chat"
    });

  }
});


/* =============================
   SEND MESSAGE
============================= */

router.post("/message", async (req, res) => {

  try {

    const { chatId, message } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    /* Save user message */

    chat.messages.push({
      role: "user",
      content: message
    });

    /* Auto title from first message */

    if (chat.title === "New Chat") {
      chat.title = message.substring(0, 30);
    }

    /* Build conversation memory */

    const conversation = chat.messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
You are an AI study mentor.

Conversation:
${conversation}

AI:
`;

    /* Run AI */

    const aiReply = await runAI(prompt);

    const replyText = aiReply || "AI response failed.";

    /* Save AI reply */

    chat.messages.push({
      role: "ai",
      content: replyText
    });

    await chat.save();

    res.json({
      success: true,
      reply: replyText
    });

  } catch (err) {

    console.error("Chat error:", err);

    res.status(500).json({
      success: false,
      message: "Chat error"
    });

  }

});


/* =============================
   DELETE CHAT
============================= */

router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const chat = await Chat.findByIdAndDelete(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    res.json({
      success: true,
      message: "Chat deleted successfully"
    });

  } catch (err) {

    console.error("Delete chat error:", err);

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });

  }

});

export default router;