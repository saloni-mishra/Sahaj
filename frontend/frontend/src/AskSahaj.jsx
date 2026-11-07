import { useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AskSahaj() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);

  const micSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  async function ask() {
    if (!q.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Could not answer.");
      setResult(data);
    } catch (e) {
      setResult({ answer: "Sorry, I couldn't answer just now. Please try again.", guide_id: null, guide_title: null, safety_warning: null });
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
    rec.onresult = (e) => setQ(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  return (
    <section className="ask-box" aria-label="Ask Sahaj">
      <span className="card-num" aria-hidden="true">?</span>
      <h2>Ask Sahaj</h2>
      <p className="activities-sub">Ask me anything about your phone. I answer in small, simple steps.</p>
      <div className="ask-row">
        <label className="ask-label" htmlFor="ask-input">Your question</label>
        <input
          id="ask-input"
          className="ask-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. How do I make text bigger?"
        />
        <div className="ask-buttons">
          {micSupported && (
            <button className="big-btn btn-ghost" onClick={listen} disabled={listening} aria-label="Ask by voice">
              {listening ? "🎙 Listening…" : "🎙 Speak"}
            </button>
          )}
          <button className="big-btn" onClick={ask} disabled={loading || !q.trim()}>
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>
      </div>
      {result?.safety_warning && <p role="alert" className="scam-danger">{result.safety_warning}</p>}
      {result?.answer && (
        <div className="ask-answer">
          <p style={{ whiteSpace: "pre-line" }}>{result.answer}</p>
          {result.guide_id && (
            <Link className="link-more" to="/learn">Open guide: {result.guide_title} →</Link>
          )}
        </div>
      )}
    </section>
  );
}
