import { useState } from "react";
import { Link } from "react-router-dom";
import { useMode, say, tx } from "./copy.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AskSahaj() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const mode = useMode();

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
        body: JSON.stringify({ question: q, mode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || tx(mode, "answerError"));
      setResult(data);
    } catch (e) {
      setResult({ answer: tx(mode, "answerError"), guide_id: null, guide_title: null, safety_warning: null });
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
    <section className="ask-box" aria-label={tx(mode, "askTitle")}>
      <span className="card-num" aria-hidden="true">?</span>
      <h2>{tx(mode, "askTitle")}</h2>
      <p className="activities-sub">{say(mode, "askHint")}</p>
      <div className="ask-row">
        <label className="ask-label" htmlFor="ask-input">{tx(mode, "askLabel")}</label>
        <input
          id="ask-input"
          className="ask-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={tx(mode, "askPlaceholder")}
        />
        <div className="ask-buttons">
          {micSupported && (
            <button className="big-btn btn-ghost" onClick={listen} disabled={listening} aria-label={tx(mode, "voiceAsk")}>
              {listening ? tx(mode, "listeningLabel") : tx(mode, "voiceAsk")}
            </button>
          )}
          <button className="big-btn" onClick={ask} disabled={loading || !q.trim()}>
            {loading ? say(mode, "thinking") : say(mode, "askButton")}
          </button>
        </div>
      </div>
      {result?.safety_warning && <p role="alert" className="scam-danger">{result.safety_warning}</p>}
      {result?.answer && (
        <div className="ask-answer">
          <p style={{ whiteSpace: "pre-line" }}>{result.answer}</p>
          {result.guide_id && (
            <Link className="link-more" to={`/learn?guide=${result.guide_id}`}>{tx(mode, "openGuidePrefix")} {result.guide_title} →</Link>
          )}
        </div>
      )}
    </section>
  );
}
