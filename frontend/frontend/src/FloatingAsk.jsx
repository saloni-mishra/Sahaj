import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMode, say, tx } from "./copy.jsx";
import { useLang } from "./language.jsx";
import { sendPhoto } from "./ShowSahaj.jsx";
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
  const [photoReading, setPhotoReading] = useState(false);
  const inputRef = useRef(null);
  const photoRef = useRef(null);
  const mode = useMode();
  const lang = useLang();

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
      if (!r.ok) throw new Error(data.detail || tx(mode, "answerError"));
      setMsgs((m) => [...m, { from: "sahaj", ...data, text: data.answer }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { from: "sahaj", text: tx(mode, "answerError") },
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

  async function onPhoto(file) {
    if (!file || photoReading) return;
    setPhotoReading(true);
    setMsgs((m) => [...m, { from: "you", text: `📷 ${tx(mode, "photoSent")}` }]);
    const result = await sendPhoto(file, mode);
    setMsgs((m) => [
      ...m,
      { from: "sahaj", text: result.ok ? result.text : tx(mode, result.key) },
    ]);
    setPhotoReading(false);
    if (photoRef.current) photoRef.current.value = "";
  }

  // The English Ask Sahaj chat is intentionally not shown inside the Hindi
  // experience. Hindi help lives on the dedicated Hindi pages instead of
  // displaying English answers on a Hindi screen.
  if (lang === "hi") return null;

  return (
    <>
      {bubble && !open && (
        <div className="fab-bubble">
          <p>{say(mode, "askBubble")}</p>
          <button onClick={dismissBubble} aria-label={tx(mode, "dismiss")}>✕</button>
        </div>
      )}
      <button
        className="fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? tx(mode, "closeAskChat") : tx(mode, "openChat")}
        aria-expanded={open}
      >
        <Mascot mood={open ? "thinking" : "happy"} size={60} />
      </button>
      {open && (
        <section className="chat-sheet" role="dialog" aria-label={tx(mode, "askTitle")}>
          <div className="chat-head">
            <h2>{tx(mode, "askTitle")}</h2>
            <button className="chat-x" onClick={() => setOpen(false)} aria-label={tx(mode, "closeChat")}>✕</button>
          </div>
          <div className="chat-msgs" role="log" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "you" ? "chat-you" : "chat-sahaj"}>
                {m.warning || m.safety_warning ? (
                  <p role="alert" className="scam-danger">{m.warning || m.safety_warning}</p>
                ) : null}
                <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
                {m.guide_id && (
                  <Link className="link-more" to={`/learn?guide=${m.guide_id}`} onClick={() => setOpen(false)}>
                    {tx(mode, "openGuidePrefix")} {m.guide_title} →
                  </Link>
                )}
                {m.from === "sahaj" && "speechSynthesis" in window && (
                  <button className="chat-speak" onClick={() => speak(m.text)} aria-label={tx(mode, "readAloud")}>🔊</button>
                )}
              </div>
            ))}
            {loading && <p className="chat-hint">{say(mode, "thinking")}</p>}
            {photoReading && <p className="chat-hint">{say(mode, "photoReading")}</p>}
          </div>
          <div className="chat-row">
            <label htmlFor="fab-ask-input" className="chat-label">{tx(mode, "askLabel")}</label>
            <textarea
              id="fab-ask-input"
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={tx(mode, "askHint")}
              rows={2}
            />
            <div className="chat-actions">
              <button className="chat-tool" onClick={() => photoRef.current && photoRef.current.click()} disabled={photoReading} aria-label={tx(mode, "showSahaj")} title={tx(mode, "showSahaj")}>
                {tx(mode, "photoLabel")}
              </button>
              {micOK && (
                <button className="chat-mic" onClick={listen} disabled={listening} aria-label={listening ? tx(mode, "listeningLabel") : tx(mode, "voiceAsk")} title={listening ? tx(mode, "listeningLabel") : tx(mode, "voiceAsk")}>
                  {listening ? "🎙…" : "🎙 Speak"}
                </button>
              )}
              <button className="big-btn chat-send" onClick={() => send()} disabled={loading || !q.trim()}>
                {say(mode, "askButton")}
              </button>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              capture="environment"
              aria-label={tx(mode, "showSahaj")}
              style={{ display: "none" }}
              onChange={(e) => onPhoto(e.target.files && e.target.files[0])}
            />
          </div>
        </section>
      )}
    </>
  );
}
