"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AstrometryChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your Astrometry AI Assistant. Feel free to ask me anything about exoplanets, stars, the Goldilocks zone, or any other space topics!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to state
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please check your API key or try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "600px", maxWidth: "800px", margin: "0 auto", padding: "0" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "2rem" }}>🛰️</div>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, fontFamily: "Outfit" }}>Astrometry Assistant</h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: msg.role === "user" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
            border: msg.role === "user" ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1.25rem",
            borderRadius: "12px",
            color: "var(--text-main)",
            lineHeight: "1.6",
            fontSize: "0.95rem"
          }}>
            {msg.role === "user" ? (
              <p style={{ margin: 0 }}>{msg.content}</p>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 style={{ fontSize: "1.5rem", color: "var(--accent-cyan)", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{ fontSize: "1.3rem", color: "var(--accent-purple)", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                    p: ({node, ...props}) => <p style={{ marginBottom: "1rem" }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }} {...props} />,
                    li: ({node, ...props}) => <li {...props} />,
                    strong: ({node, ...props}) => <strong style={{ color: "white", fontWeight: 600 }} {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", color: "var(--accent-cyan)", fontSize: "0.9rem", fontStyle: "italic", padding: "0 1.25rem" }}>
            Analyzing telemetry...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "1rem" }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about exoplanets, astrometry, or the Goldilocks zone..."
          style={{
            flex: 1,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            padding: "0.8rem 1.2rem",
            color: "white",
            outline: "none"
          }}
          disabled={isLoading}
        />
        <button type="submit" className="glowing-btn" disabled={isLoading} style={{ padding: "0.8rem 1.5rem" }}>
          Send
        </button>
      </form>
    </div>
  );
}
