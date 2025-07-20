"use client";
import { useState, useRef, useEffect } from "react";

function getApiKey() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("openai_api_key") || "";
}

function setApiKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("openai_api_key", key);
}

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getApiKey()) {
      setShowApiKeyPrompt(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleApiKeySave = () => {
    setApiKey(apiKey);
    setShowSettings(false);
    setShowApiKeyPrompt(false);
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
      {/* API Key Prompt Modal */}
      {showApiKeyPrompt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
            <h2>Enter your OpenAI API Key</h2>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKeyState(e.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
              placeholder="sk-..."
            />
            <button onClick={handleApiKeySave} disabled={!apiKey.trim()} style={{ width: "100%" }}>
              Save API Key
            </button>
          </div>
        </div>
      )}
      <div className="chat-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="title">Carty Chatbot</h1>
          <button className="settings-btn" onClick={handleSettings} title="Settings">
            ⚙️
          </button>
        </div>
        {showSettings && (
          <div className="settings-modal">
            <div className="settings-content">
              <label htmlFor="api-key-input">Enter OpenAI API Key:</label>
              <input
                id="api-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                className="chat-input"
                style={{ margin: "12px 0" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="send-btn" onClick={handleApiKeySave}>
                  Save
                </button>
                <button
                  className="send-btn"
                  style={{ background: "#333", color: "#fff" }}
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
