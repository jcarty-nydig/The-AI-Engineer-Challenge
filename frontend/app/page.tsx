"use client";
import { useState, useRef, useEffect } from "react";

function getApiKey() {
  // Read from environment variable (client-side, must be NEXT_PUBLIC_ prefix)
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
}

function setApiKey(key: string) {
  // No-op: API key is now set via environment variable
}

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // No need to prompt for API key, it's set via env variable
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSettings = () => {
    setShowSettings(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");

    try {
      console.log("Sending request to /api/chat", {
        developer_message: "",
        user_message: input,
        api_key: getApiKey(),
      });
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          developer_message: "",
          user_message: input,
          api_key: getApiKey(),
        }),
      });
      console.log("Response status:", res.status);
      const contentType = res.headers.get("content-type");
      console.log("Response content-type:", contentType);
      let botResponse;
      if (contentType && contentType.includes("application/json")) {
        try {
          const text = await res.text();
          console.log("Raw response text (json branch):", text);
          const data = JSON.parse(text);
          console.log("API response data (json):", data);
          botResponse = data.response || JSON.stringify(data);
        } catch (jsonErr) {
          console.error("Failed to parse JSON:", jsonErr);
          const text = await res.text();
          console.log("Raw response text after JSON parse fail:", text);
          botResponse = text;
        }
      } else {
        botResponse = await res.text();
        console.log("API response data (text):", botResponse);
      }
      setMessages((msgs) => [...msgs, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error connecting to the bot:", err);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, there was an error connecting to the bot." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div>
      <div className="chat-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="title">Carty Chatbot</h1>
          <button className="settings-btn" onClick={handleSettings} title="Settings">
            ⚙️
          </button>
        </div>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
