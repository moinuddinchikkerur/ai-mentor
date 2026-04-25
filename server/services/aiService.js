




const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

export async function askAI(prompt) {
  try {
    const model = process.env.OLLAMA_MODEL || "phi";

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 900,
          num_ctx: 2048
        }
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt);
    }

    const data = await response.json();

    return (data.response || "").trim();

  } catch (err) {
    console.error("❌ AI Service Error:", err.message);
    return "";
  }
}
