import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Mascot from "../Mascot.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BUBBLE_KEY = "sahaj-hindi-ask-seen";

function speakHindi(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((item) => /^hi[-_]IN$/i.test(item.lang)) ||
    voices.find((item) => /^hi/i.test(item.lang)) ||
    voices.find((item) => /en[-_]IN/i.test(item.lang)) ||
    voices.find((item) => /^en/i.test(item.lang));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export default function HindiBuddy() {
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "sahaj",
      text: "नमस्ते! फ़ोन के बारे में कुछ भी पूछिए। मैं आसान भाषा में समझाऊँगा।",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);

  const micOK =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    try {
      if (!localStorage.getItem(BUBBLE_KEY)) setBubble(true);
    } catch {
      setBubble(true);
    }
  }, []);

  function dismissBubble() {
    try {
      localStorage.setItem(BUBBLE_KEY, "1");
    } catch {
      // The bubble simply will not stick.
    }
    setBubble(false);
  }

  useEffect(() => {
    if (open) {
      dismissBubble();
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text) {
    const value = (text || question).trim();
    if (!value || loading) return;
    setQuestion("");
    setMessages((current) => [...current, { from: "you", text: value }]);
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value, mode: "hindi", lang: "hi" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "answer failed");
      setMessages((current) => [
        ...current,
        { from: "sahaj", ...data, text: data.answer },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          from: "sahaj",
          text: "माफ़ कीजिए, अभी जवाब नहीं मिल पाया। फिर से कोशिश कीजिए।",
        },
      ]);
    }
    setLoading(false);
  }

  function listen() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => send(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  return (
    <>
      {bubble && !open && (
        <div className="fab-bubble hindi-fab-bubble">
          <p>नमस्ते! कुछ पूछना है? मैं यहीं हूँ।</p>
          <button onClick={dismissBubble} aria-label="यह बात बंद कीजिए">✕</button>
        </div>
      )}
      <button
        className="fab"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "सहज की चैट बंद कीजिए" : "सहज से पूछिए"}
        aria-expanded={open}
      >
        <Mascot mood={open ? "thinking" : "happy"} size={60} />
      </button>
      {open && (
        <section className="chat-sheet" role="dialog" aria-label="सहज से पूछिए">
          <div className="chat-head">
            <h2>सहज से पूछिए</h2>
            <button
              className="chat-x"
              onClick={() => setOpen(false)}
              aria-label="चैट बंद कीजिए"
            >
              ✕
            </button>
          </div>
          <div className="chat-msgs" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.from === "you" ? "chat-you" : "chat-sahaj"}
              >
                {message.safety_warning && (
                  <p role="alert" className="scam-danger">
                    {message.safety_warning}
                  </p>
                )}
                <p style={{ whiteSpace: "pre-line" }}>{message.text}</p>
                {message.guide_id && (
                  <Link
                    className="link-more"
                    to={`/hindi/learn?guide=${message.guide_id}`}
                    onClick={() => setOpen(false)}
                  >
                    गाइड खोलिए: {message.guide_title} →
                  </Link>
                )}
                {message.from === "sahaj" && "speechSynthesis" in window && (
                  <button
                    className="chat-speak"
                    onClick={() => speakHindi(message.text)}
                    aria-label="सुनकर समझें"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}
            {loading && <p className="chat-hint">सोच रहे हैं…</p>}
          </div>
          <div className="chat-row">
            <label htmlFor="hindi-ask-input" className="chat-label">
              आपका सवाल
            </label>
            <textarea
              id="hindi-ask-input"
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" &&
                !event.shiftKey &&
                (event.preventDefault(), send())
              }
              placeholder="जैसे: फ़ोन के अक्षर बड़े कैसे करें?"
              rows={2}
            />
            <div className="chat-actions hindi-chat-actions">
              {micOK && (
                <button
                  className="chat-mic"
                  onClick={listen}
                  disabled={listening}
                  aria-label={listening ? "सुन रहे हैं" : "बोलकर पूछिए"}
                  title={listening ? "सुन रहे हैं" : "बोलकर पूछिए"}
                >
                  {listening ? "🎙 सुन रहे हैं…" : "🎙 बोलिए"}
                </button>
              )}
              <button
                className="big-btn chat-send"
                onClick={() => send()}
                disabled={loading || !question.trim()}
              >
                पूछिए
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
