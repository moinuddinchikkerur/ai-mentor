










import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import mcqRoutes from "./routes/mcqRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import aiExtraRoutes from "./routes/aiExtraRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import burnoutRoutes from "./routes/burnoutRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import mcqResultRoutes from "./routes/mcqResultRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import attentionRoutes from "./routes/attentionRoutes.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.warn("⚠️ WARNING: MONGO_URI not found in .env");
}

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET not found in .env");
}

console.log("✅ Environment Loaded");

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    if (!req.url.startsWith("/api/dashboard")) {
      console.log(`➡️ ${req.method} ${req.url}`);
    }

    next();
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gemini", geminiRoutes);

app.use("/api/ai", aiExtraRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/burnout", burnoutRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/mcq-result", mcqResultRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/attention", attentionRoutes);

app.get("/", (req, res) => {
  res.status(200).send("✅ AI Exam Mentor Backend Running 🚀");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found: ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🤖 AI Ready (${process.env.OLLAMA_MODEL || "phi"})`);
});

