"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste 🙏 Ask me anything about The Yogic Bowl menu — dishes, prices, vegan or gluten-free options!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: newMessages.slice(0, -1),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#faf7f2" }}>
      <header style={{ padding: "16px 20px", background: "#4a5d43", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>🌿 The Yogic Bowl</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Menu Assistant</p>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: 14,
                background: m.role === "user" ? "#4a5d43" : "white",
                color: m.role === "user" ? "white" : "#333",
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: 13, color: "#888", paddingLeft: 4 }}>Typing…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", padding: 12, borderTop: "1px solid #e0ddd6", background: "white" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about a dish, price, or diet option..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 20,
            border: "1px solid #ccc",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: 8,
            padding: "10px 18px",
            borderRadius: 20,
            border: "none",
            background: "#4a5d43",
            color: "white",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
          }
