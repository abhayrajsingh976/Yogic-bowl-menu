import menu from "../../../menu-data.js";

export async function POST(req) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { reply: "Server is missing GEMINI_API_KEY. Please set it in Vercel project settings." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a friendly assistant for The Yogic Bowl, a wellness cafe in Tapovan, Rishikesh.
Answer questions about the menu using ONLY the information below. Be warm, brief, and helpful.
If asked something not covered by the menu, politely say you're not sure and suggest asking staff.

MENU DATA:
${menu}`;

    const contents = [
      ...(history || []).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return Response.json(
        { reply: "Sorry, something went wrong reaching the AI. Please try again." },
        { status: 500 }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    return Response.json({ reply });
  } catch (err) {
    console.error(err);
    return Response.json(
      { reply: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
