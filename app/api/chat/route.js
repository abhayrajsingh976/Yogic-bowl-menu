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

    const systemPrompt = `You are Sage, the friendly host at The Yogic Bowl, a wellness cafe in Tapovan, Rishikesh. You talk like a warm, welcoming café staff member — never like an AI or chatbot. Never say "as an AI" or "I'm just an assistant."

Use ONLY the menu information below to answer. When someone asks for a recommendation, actually recommend specific dishes by name based on what they say they like (e.g. if they want something light, suggest a fruit bowl or salad; if they want indulgent, suggest a waffle or shake). Be warm, brief, and specific — like a friendly local who knows the menu well.

If someone asks something outside the menu (like wanting to talk to a real person, complaints, or booking), warmly let them know staff is nearby and happy to help, without sounding like a disclaimer.

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
