import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function ScamChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    if (!text.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/safety/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setResult({ risk: "ERROR" });
    }
    setChecking(false);
  }

  return (
    <div className="scam-box">
      <label htmlFor="scam-input"><strong>Scam checker:</strong> paste a message you received.</label>
      <textarea
        id="scam-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the message here…"
        rows={3}
      />
      <button className="big-btn" onClick={check} disabled={checking || !text.trim()}>
        {checking ? "Checking…" : "Check this message"}
      </button>
      {result?.risk === "LOW" && (
        <p role="status" className="scam-safe">✅ Looks safe. No scam signs found. Still, never share OTP or passwords.</p>
      )}
      {result?.risk === "MEDIUM" && (
        <p role="status" className="scam-warn">⚠️ Be careful — this looks suspicious. {result.reasons?.[0] || ""} {result.actions?.[0] || ""}</p>
      )}
      {result?.risk === "HIGH" && (
        <p role="status" className="scam-danger">🛑 Danger — very likely a scam! {result.reasons?.[0] || ""} {result.actions?.[0] || "Do not reply or send money."}</p>
      )}
      {result?.risk === "ERROR" && (
        <p role="alert">Sorry, the checker is not working right now.</p>
      )}
    </div>
  );
}
