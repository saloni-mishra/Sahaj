import { useState } from "react";
import { useMode, tx } from "./copy.jsx";
import { useLang, HI } from "./language.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function HindiWarningDetails({ result }) {
  return (
    <>
      <p className="hindi-result-label">चेतावनी के संकेत:</p>
      <ul className="hindi-warning-list">
        {(result.reasons || []).map((reason, index) => (
          <li key={`reason-${index}`}>{reason}</li>
        ))}
      </ul>
      <p className="hindi-result-label">अब क्या कीजिए:</p>
      <ul className="hindi-action-list">
        {(result.actions || []).map((action, index) => (
          <li key={`action-${index}`}>{action}</li>
        ))}
      </ul>
    </>
  );
}

export default function ScamChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const mode = useMode();
  const lang = useLang();
  const t = (key) => (lang === "hi" ? (HI[key] ?? key) : tx(mode, key));

  async function check() {
    if (!text.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/safety/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang }),
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
      <label htmlFor="scam-input"><strong>{t("scamCheckerLabel")}</strong></label>
      <textarea
        id="scam-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("pastePlaceholder")}
        rows={3}
      />
      <button className="big-btn" onClick={check} disabled={checking || !text.trim()}>
        {checking ? t("checking") : t("checkMessage")}
      </button>
      {result?.risk === "LOW" && (
        <p role="status" className="scam-safe">
          {lang === "hi" ? HI.lowRisk : "✅ Looks safe. No scam signs found. Still, never share OTP or passwords."}
        </p>
      )}
      {result?.risk === "MEDIUM" && (
        <div role="status" className="scam-warn hindi-scam-result">
          <p>{lang === "hi" ? HI.mediumRisk : "⚠️ Be careful — this looks suspicious. "}</p>
          {lang === "hi" ? (
            <HindiWarningDetails result={result} />
          ) : (
            <p>{result.reasons?.[0] || ""} {result.actions?.[0] || ""}</p>
          )}
        </div>
      )}
      {result?.risk === "HIGH" && (
        <div role="status" className="scam-danger hindi-scam-result">
          <p>{lang === "hi" ? HI.highRisk : "🛑 Danger — very likely a scam! "}</p>
          {lang === "hi" ? (
            <HindiWarningDetails result={result} />
          ) : (
            <p>{result.reasons?.[0] || ""} {result.actions?.[0] || "Do not reply or send money."}</p>
          )}
        </div>
      )}
      {result?.risk === "ERROR" && (
        <p role="alert">{t("checkerError")}</p>
      )}
    </div>
  );
}
