"use client";
import { useState, useRef, useEffect } from "react";

function getTimeOfDay(): "day" | "night" | "sunrise" | "sunset" {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 6 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "sunset";
  return "night";
}

function Background() {
  const timeOfDay = getTimeOfDay();
  if (timeOfDay === "day") {
    return (
      <svg className="bg-svg" width="100vw" height="100vh" style={{position:'fixed',top:0,left:0,zIndex:-1,width:'100vw',height:'100vh'}}>
        <defs>
          <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87ceeb"/>
            <stop offset="100%" stopColor="#b3e0ff"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skyDay)"/>
        {/* Sun */}
        <circle cx="80%" cy="20%" r="60" fill="#fff700" filter="url(#sunGlow)"/>
        {/* Clouds */}
        <ellipse cx="20%" cy="25%" rx="60" ry="24" fill="#fff" opacity="0.7"/>
        <ellipse cx="30%" cy="30%" rx="40" ry="16" fill="#fff" opacity="0.5"/>
        <ellipse cx="25%" cy="22%" rx="30" ry="12" fill="#fff" opacity="0.6"/>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </svg>
    );
  }
  if (timeOfDay === "night") {
    // Night: dark sky, stars
    const stars = Array.from({length: 40}).map((_,i) => (
      <circle key={i} cx={Math.random()*100+"vw"} cy={Math.random()*100+"vh"} r={Math.random()*1.5+0.5} fill="#fff" opacity={Math.random()*0.7+0.3}/>
    ));
    return (
      <svg className="bg-svg" width="100vw" height="100vh" style={{position:'fixed',top:0,left:0,zIndex:-1,width:'100vw',height:'100vh'}}>
        <defs>
          <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1440"/>
            <stop offset="100%" stopColor="#1a2233"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skyNight)"/>
        {/* Stars */}
        {stars}
        {/* Moon */}
        <circle cx="80%" cy="18%" r="32" fill="#fffbe6" opacity="0.8"/>
        <circle cx="85%" cy="18%" r="28" fill="#0a1440" opacity="0.7"/>
      </svg>
    );
  }
  if (timeOfDay === "sunrise") {
    return (
      <svg className="bg-svg" width="100vw" height="100vh" style={{position:'fixed',top:0,left:0,zIndex:-1,width:'100vw',height:'100vh'}}>
        <defs>
          <linearGradient id="skySunrise" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb347"/>
            <stop offset="100%" stopColor="#87ceeb"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#skySunrise)"/>
        {/* Sun low on horizon */}
        <ellipse cx="80%" cy="80%" rx="60" ry="30" fill="#fff700" opacity="0.8"/>
        {/* Clouds */}
        <ellipse cx="30%" cy="70%" rx="40" ry="16" fill="#fff" opacity="0.5"/>
      </svg>
    );
  }
  // sunset
  return (
    <svg className="bg-svg" width="100vw" height="100vh" style={{position:'fixed',top:0,left:0,zIndex:-1,width:'100vw',height:'100vh'}}>
      <defs>
        <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5e62"/>
          <stop offset="100%" stopColor="#2b5876"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#skySunset)"/>
      {/* Sun low on horizon */}
      <ellipse cx="80%" cy="80%" rx="60" ry="30" fill="#fff700" opacity="0.7"/>
      {/* Clouds */}
      <ellipse cx="30%" cy="70%" rx="40" ry="16" fill="#fff" opacity="0.4"/>
    </svg>
  );
}

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
      <Background />
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
