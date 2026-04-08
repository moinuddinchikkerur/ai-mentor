// import express from "express";

// import { generateMCQ } from "../controllers/mcqAIController.js";
// import { evaluateAnswer } from "../controllers/evalController.js";
// import { makePlan } from "../controllers/plannerController.js";

// import { runAI } from "../utils/aiHelper.js";
// import Evaluation from "../models/Evaluation.js";

// const router = express.Router();

// /* =============================
//    AI MCQ GENERATOR
// ============================= */

// router.post("/mcq", generateMCQ);


// /* =============================
//    AI ANSWER EVALUATION
// ============================= */

// router.post("/evaluate", evaluateAnswer);


// /* =============================
//    AI STUDY PLAN
// ============================= */

// router.post("/plan", makePlan);



// /* =============================
//    AI EXPLAIN MCQ ANSWER
// ============================= */

// router.post("/explain", async (req, res) => {

//   try {

//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({
//         success: false,
//         explanation: "Question missing"
//       });
//     }

//     const prompt = `
// Explain the correct answer for this MCQ in simple student-friendly language.

// Question:
// ${question}

// Give a short explanation.
// `;

//     const reply = await runAI(prompt);

//     res.json({
//       success: true,
//       explanation: reply
//     });

//   } catch (error) {

//     console.error("Explain AI error:", error);

//     res.status(500).json({
//       success: false,
//       explanation: "AI explanation failed"
//     });

//   }

// });



// /* =============================
//    CHAT HISTORY LIST
// ============================= */

// router.get("/chats", async (req, res) => {

//   try {

//     const chats = await Evaluation.aggregate([
//       {
//         $group: {
//           _id: "$chatId",
//           lastQuestion: { $last: "$question" },
//           createdAt: { $last: "$createdAt" }
//         }
//       },
//       { $sort: { createdAt: -1 } }
//     ]);

//     res.json(chats);

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: "Failed to load chats"
//     });

//   }

// });


// /* =============================
//    GET SINGLE CHAT
// ============================= */

// router.get("/chat/:chatId", async (req, res) => {

//   try {

//     const chat = await Evaluation
//       .find({ chatId: req.params.chatId })
//       .sort({ createdAt: 1 });

//     res.json(chat);

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: "Failed to load chat"
//     });

//   }

// });


// /* =============================
//    DELETE CHAT
// ============================= */

// router.delete("/chat/:chatId", async (req, res) => {

//   try {

//     await Evaluation.deleteMany({
//       chatId: req.params.chatId
//     });

//     res.json({
//       success: true,
//       message: "Chat deleted"
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: "Delete failed"
//     });

//   }

// });

// export default router;













import express from "express";

import { generateMCQ } from "../controllers/mcqAIController.js";
import { evaluateAnswer } from "../controllers/evalController.js";
import { makePlan } from "../controllers/plannerController.js";

import { runAI } from "../utils/aiHelper.js";
import Evaluation from "../models/Evaluation.js";

const router = express.Router();

/* ==============================
   DEBUG ROUTE (TEST)
============================== */

console.log("🔥 aiExtraRoutes loaded");

router.get("/debug", (req, res) => {
  res.send("✅ AI Extra Routes Working");
});

/* ==============================
   AI MCQ GENERATOR
============================== */

router.post("/mcq", generateMCQ);

/* ==============================
   AI ANSWER EVALUATION
============================== */

router.post("/evaluate", evaluateAnswer);

/* ==============================
   AI STUDY PLAN
============================== */

router.post("/plan", makePlan);

/* ==============================
   AI EXPLAIN MCQ ANSWER
============================== */

router.post("/explain", async (req, res) => {

  try {

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        explanation: "Question missing"
      });
    }

    const prompt = `
Explain the correct answer for this MCQ in simple student-friendly language.

Question:
${question}

Give a short explanation.
`;

    const reply = await runAI(prompt);

    res.json({
      success: true,
      explanation: reply
    });

  } catch (error) {

    console.error("Explain AI error:", error);

    res.status(500).json({
      success: false,
      explanation: "AI explanation failed"
    });

  }

});

/* ==============================
   GET CHAT HISTORY
============================== */

router.get("/chats", async (req, res) => {

  try {

    const chats = await Evaluation.aggregate([
      {
        $group: {
          _id: "$chatId",
          lastQuestion: { $last: "$question" },
          createdAt: { $last: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(chats);

  } catch (error) {

    console.error("❌ Failed to load chats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load chats"
    });

  }

});

/* ==============================
   GET SINGLE CHAT
============================== */

router.get("/chat/:chatId", async (req, res) => {

  try {

    const chat = await Evaluation
      .find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 });

    res.json(chat);

  } catch (error) {

    console.error("❌ Failed to load chat:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load chat"
    });

  }

});

/* ==============================
   DELETE CHAT
============================== */

router.delete("/chat/:chatId", async (req, res) => {

  try {

    await Evaluation.deleteMany({
      chatId: req.params.chatId
    });

    res.json({
      success: true,
      message: "Chat deleted"
    });

  } catch (error) {

    console.error("❌ Delete failed:", error);

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });

  }

});

export default router;