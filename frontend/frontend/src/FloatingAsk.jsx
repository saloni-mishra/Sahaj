import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMode } from "./copy.jsx";
import Mascot from "./Mascot.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BUBBLE_KEY = "sahaj-ask-seen";

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const v =
    voices.find((x) => /en[-_]IN/i.test(x.lang)) ||
    voices.find((x) => /^hi/i.test(x.lang)) ||
    voices.find((x) => /^en/i.test(x.lang));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export default function FloatingAsk() {
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);
  const mode = useMode();

  const micOK =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  // First-visit bubble: "Stuck? Ask me!"
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
      // bubble just won't stick
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
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text) {
    const question = (text || q).trim();
    if (!question || loading) return;
    setQ("");
    setMsgs((m) => [...m, { from: "you", text: question }]);
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, mode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Could not answer.");
      setMsgs((m) => [...m, { from: "sahaj", ...data, text: data.answer }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { from: "sahaj", text: "Sorry, I couldn't answer just now. Please try again." },
      ]);
    }
    setLoading(false);
  }

  function listen() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = "en-IN";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  return (
    <>
      {bubble && !open && (
        <div className="fab-bubble">
          <p>Stuck? Ask me!</p>
          <button onClick={dismissBubble} aria-label="Dismiss">✕</button>
        </div>
      )}
      <button
        className="fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Ask Sahaj chat" : "Open Ask Sahaj chat"}
        aria-expanded={open}
      >
        <Mascot mood={open ? "thinking" : "happy"} size={60} />
      </button>
      {open && (
        <section className="chat-sheet" role="dialog" aria-label="Ask Sahaj chat">
          <div className="chat-head">
            <h2>Ask Sahaj</h2>
            <button className="chat-x" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>
          <div className="chat-msgs" role="log" aria-live="polite">
            {msgs.length === 0 && <p className="chat-hint">Ask me anything about your phone. I answer in small steps.</p>}
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "you" ? "chat-you" : "chat-sahaj"}>
                {m.warning || m.safety_warning ? (
                  <p role="alert" className="scam-danger">{m.warning || m.safety_warning}</p>
                ) : null}
                <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
                {m.guide_id && (
                  <Link className="link-more" to="/learn" onClick={() => setOpen(false)}>
                    Open guide: {m.guide_title} →
                  </Link>
                )}
                {m.from === "sahaj" && "speechSynthesis" in window && (
                  <button className="chat-speak" onClick={() => speak(m.text)} aria-label="Read this answer aloud">🔊</button>
                )}
              </div>
            ))}
            {loading && <p className="chat-hint">Thinking…</p>}
          </div>
          <div className="chat-row">
            <label htmlFor="fab-ask-input" className="chat-label">Your question</label>
            <input
              id="fab-ask-input"
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. How do I make text bigger?"
            />
            {micOK && (
              <button onClick={listen} disabled={listening} aria-label="Ask by voice">
                {listening ? "🎙…" : "🎙"}
              </button>
            )}
            <button className="big-btn chat-send" onClick={() => send()} disabled={loading || !q.trim()}>
              Ask
            </button>
          </div>
        </section>
      )}
    </>
  );
}
