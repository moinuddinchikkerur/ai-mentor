import fetch from "node-fetch";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

export async function runAI(prompt) {
  try {
    console.log("🤖 Running AI...");

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 200,   // 🔥 reduce more
          num_ctx: 1024       // 🔥 reduce memory
        }
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt);
    }

    const data = await res.json();

    console.log("✅ AI Done");

    return (data.response || "").trim();

  } catch (err) {
    console.error("AI Helper Error:", err.message);
    return "";
  }
}