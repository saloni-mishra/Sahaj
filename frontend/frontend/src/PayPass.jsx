import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCompleted, loadPayPass } from "./Progress.jsx";
import { useMode, say, tx } from "./copy.jsx";

const NAME_KEY = "sahaj-pay-pass-name";

function loadName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

// Stops for the certificate: 1 guide + Pause & Check + 1 practice
// payment + 1 Scam Lab round. Passport stop 4 ("Prove it") lights up
// with the Scam Lab round — you proved you are a safe payer.
function useStops() {
  const [guides, setGuides] = useState(loadCompleted());
  const [pass, setPass] = useState(loadPayPass());
  useEffect(() => {
    function refresh() {
      setGuides(loadCompleted());
      setPass(loadPayPass());
    }
    window.addEventListener("sahaj-progress", refresh);
    window.addEventListener("sahaj-paypass", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sahaj-progress", refresh);
      window.removeEventListener("sahaj-paypass", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return [
    { key: "guide", done: guides.length > 0, label: "stopLearn", to: "/learn" },
    { key: "pause-check", done: !!pass["pause-check"], label: "stopCheck", to: "/#practice" },
    { key: "practice-pay", done: !!pass["practice-pay"], label: "stopPay", to: "/#practice" },
    { key: "scam-round", done: !!pass["scam-round"], label: "stopProve", to: "/safe-or-scam" },
  ];
}

function CertSVG({ name, date }) {
  const stamps = ["Learn", "Check", "Pay", "Prove"];
  return (
    <svg
      id="paypass-cert"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      width="100%"
      role="img"
      aria-label="Certified Safe Payer certificate"
    >
      <rect x="4" y="4" width="792" height="592" rx="24" fill="#FFFDF6" stroke="#26211A" strokeWidth="8" />
      <rect x="28" y="28" width="744" height="544" rx="14" fill="none" stroke="#26211A" strokeWidth="3" strokeDasharray="12 8" />
      <rect x="28" y="28" width="744" height="120" rx="14" fill="#EBA937" stroke="#26211A" strokeWidth="0" />
      <text x="400" y="82" textAnchor="middle" fontFamily="Georgia, serif" fontSize="44" fontWeight="bold" fill="#26211A">Sahaj Pay Pass</text>
      <text x="400" y="120" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="20" fill="#26211A">Learn — Pause &amp; Check — Practice Pay — Prove it</text>
      <text x="400" y="220" textAnchor="middle" fontFamily="Georgia, serif" fontSize="52" fontWeight="bold" fill="#2E5D56">Certified Safe Payer</text>
      <text x="400" y="290" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="30" fill="#26211A">{name || "Your Name"}</text>
      <line x1="250" y1="310" x2="550" y2="310" stroke="#26211A" strokeWidth="2" />
      <text x="400" y="345" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="22" fill="#4A4237">{date}</text>
      {stamps.map((s, i) => (
        <g key={s}>
          <circle cx={250 + i * 100} cy={430} r="38" fill="#EBA937" stroke="#26211A" strokeWidth="4" />
          <text x={250 + i * 100} y={442} textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="34" fontWeight="bold" fill="#26211A">★</text>
          <text x={250 + i * 100} y={488} textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="18" fontWeight="bold" fill="#26211A">{s}</text>
        </g>
      ))}
      <text x="400" y="545" textAnchor="middle" fontFamily="Verdana, sans-serif" fontSize="18" fill="#B94E24">PayPal Sandbox · test money only</text>
    </svg>
  );
}

function downloadPNG() {
  const svg = document.getElementById("paypass-cert");
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFDF6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sahaj-pay-pass.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, "image/png");
    } catch {
      URL.revokeObjectURL(url);
    }
  };
  img.src = url;
}

export function PayPass() {
  const mode = useMode();
  const stops = useStops();
  const [name, setName] = useState(loadName());
  const doneCount = stops.filter((s) => s.done).length;
  const unlocked = doneCount >= 4;
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  function saveName(v) {
    setName(v);
    try {
      localStorage.setItem(NAME_KEY, v);
    } catch {
      // private mode: name just won't stick
    }
  }

  const shareText = `Namaste! I finished my Sahaj Pay Pass and I am a Certified Safe Payer (${doneCount} of 4 stops: Learn, Pause & Check, Practice Pay, Prove it). Ask me to show you how! (sent from Sahaj)`;

  return (
    <section className="paypass" aria-label={tx(mode, "paypassTitle")}>
      <h2>{say(mode, "paypassTitle")}</h2>
      <p className="activities-sub">{say(mode, "paypassSub")}</p>
      <ol className="passport">
        {stops.map((s, i) => (
          <li key={s.key} className={s.done ? "pass-done" : "pass-todo"}>
            <span className="pass-num" aria-hidden="true">{s.done ? "★" : i + 1}</span>
            <Link className="pass-link" to={s.to}>{tx(mode, s.label)}</Link>
          </li>
        ))}
      </ol>
      {unlocked ? (
        <>
          <p className="stamp" aria-live="polite">★ {say(mode, "certSub")}</p>
          <div className="learn-row">
            <label className="ask-label" htmlFor="paypass-name">{tx(mode, "yourName")}</label>
            <input
              id="paypass-name"
              className="ask-input"
              value={name}
              maxLength={20}
              onChange={(e) => saveName(e.target.value)}
              placeholder={tx(mode, "namePlaceholder")}
            />
          </div>
          <div className="cert-wrap">
            <CertSVG name={name.trim()} date={date} />
          </div>
          <div className="step-nav">
            <button className="big-btn" onClick={downloadPNG}>{say(mode, "downloadCert")}</button>
            <a className="big-btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
              {say(mode, "shareCert")}
            </a>
          </div>
        </>
      ) : (
        <p>{doneCount} {tx(mode, "ofWord")} 4 · {say(mode, "certLocked")}</p>
      )}
    </section>
  );
}
