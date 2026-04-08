const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

export async function askAI(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi",   // ✅ make sure it's phi
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt);
    }

    const data = await response.json();

    return data.response;

  } catch (err) {
    console.error("❌ AI Service Error:", err.message);
    throw err;
  }
}