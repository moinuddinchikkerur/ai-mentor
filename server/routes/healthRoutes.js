import express from "express";

const router = express.Router();

router.get("/ai", async (req, res) => {
  try {
    const test = await fetch("http://127.0.0.1:11434");

    if (!test.ok) throw new Error();

    res.json({ status: "AI Running ✅" });

  } catch {
    res.status(500).json({ status: "AI Down ❌" });
  }
});

export default router;