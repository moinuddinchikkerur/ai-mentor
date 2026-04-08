const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

export async function runAI(prompt) {
  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi",
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error("AI server error");
    }

    const data = await res.json();

    return data.response;

  } catch (err) {
    console.error("AI Helper Error:", err.message);
    throw err;
  }
}