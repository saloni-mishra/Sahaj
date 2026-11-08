import { useEffect, useState, useRef } from "react";
import { useMode, say, tx } from "./copy.jsx";
import { sendPhoto } from "./ShowSahaj.jsx";
import { markPayPass } from "./Progress.jsx";
import Mascot from "./Mascot.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const CHECK_KEYS = ["check1", "check2", "check3", "check4", "check5"];
const TRAP = "trap";

// Stop 2 of 4 in the Sahaj Pay Pass loop: Learn -> Pause & Check -> Practice Pay -> Prove it.
// Pay stays locked until all 5 checks are ticked. The trap scenario has no
// Pay button: red flags mean the right answer is to walk away.
export default function PauseCheck({ onClose }) {
  const mode = useMode();
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [scenario, setScenario] = useState(null);
  const [ticks, setTicks] = useState([false, false, false, false, false]);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [walkedAway, setWalkedAway] = useState(false);
  const [photoAnswer, setPhotoAnswer] = useState("");
  const [photoReading, setPhotoReading] = useState(false);
  const photoRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/paypal/items`)
      .then(async (r) => {
        if (!r.ok) throw new Error("items missing");
        setItems(await r.json());
      })
      .catch(() => setLoadError(tx(mode, "startError")));
  }, [mode]);

  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isTrap = scenario === TRAP;
  const item = items.find((i) => i.id === scenario);
  const allTicked = ticks.every(Boolean);

  function pick(id) {
    setScenario(id);
    setTicks([false, false, false, false, false]);
    setPayError("");
    setWalkedAway(false);
    setPhotoAnswer("");
  }

  function back() {
    setScenario(null);
    setTicks([false, false, false, false, false]);
    setPayError("");
    setWalkedAway(false);
    setPhotoAnswer("");
  }

  function toggle(i) {
    setTicks((t) => t.map((v, k) => (k === i ? !v : v)));
  }

  async function pay() {
    if (!allTicked || isTrap || paying) return;
    setPaying(true);
    setPayError("");
    markPayPass("pause-check");
    try {
      try {
        sessionStorage.setItem("sahaj-last-item", isTrap ? "" : (item?.label || scenario));
      } catch {
        // private mode: label just won't stick
      }
      const response = await fetch(
        `${API}/api/paypal/create-order?item_id=${encodeURIComponent(scenario)}`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || tx(mode, "startError"));
      window.location.href = data.approval_url;
    } catch (error) {
      setPayError(error.message);
      setPaying(false);
    }
  }

  function walkAway() {
    markPayPass("pause-check");
    setWalkedAway(true);
  }

  async function onPhoto(file) {
    if (!file || photoReading) return;
    setPhotoReading(true);
    setPhotoAnswer("");
    const result = await sendPhoto(file, mode);
    setPhotoAnswer(result.ok ? result.text : tx(mode, result.key));
    setPhotoReading(false);
    if (photoRef.current) photoRef.current.value = "";
  }

  return (
    <div className="holdup-overlay" onClick={onClose}>
      <section
        className="holdup-card"
        role="dialog"
        aria-modal="true"
        aria-label={tx(mode, "holdUpTitle")}
        ref={cardRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="loop-stop">{say(mode, "loopStop2")}</p>

        {walkedAway ? (
          <div className="celebrate">
            <Mascot mood="celebrating" size={110} />
            <h2>{say(mode, "walkAwayWin")}</h2>
            <p>{say(mode, "walkAwaySub")}</p>
            <div className="step-nav">
              <button className="big-btn btn-ghost" onClick={back}>{tx(mode, "backToScenarios")}</button>
              <button className="big-btn" onClick={onClose}>{tx(mode, "backButton")}</button>
            </div>
          </div>
        ) : scenario === null ? (
          <>
            <h2>{say(mode, "holdUpTitle")}</h2>
            <p className="activities-sub">{say(mode, "holdUpSub")}</p>
            <h3>{say(mode, "scenarioQ")}</h3>
            {loadError && <p role="alert" className="learn-error">{loadError}</p>}
            <div className="learn-row">
              {items.map((it) => (
                <button key={it.id} className="big-btn btn-ghost" onClick={() => pick(it.id)}>
                  {it.label} · ${it.amount} {tx(mode, "testMoneyWord")}
                </button>
              ))}
              <button className="big-btn btn-ghost" onClick={() => pick(TRAP)}>
                🎁 {tx(mode, "trapName")}
              </button>
            </div>
            <div className="step-nav">
              <button className="big-btn btn-ghost" onClick={onClose}>{tx(mode, "backButton")}</button>
            </div>
          </>
        ) : (
          <>
            <h2>{say(mode, "holdUpTitle")}</h2>
            <div className="request-card">
              <p><strong>{tx(mode, "requestTo")}</strong> {isTrap ? tx(mode, "trapTo") : item?.label}</p>
              <p><strong>{tx(mode, "requestAmount")}</strong> {isTrap ? "$50.00" : `$${item?.amount}`} · {tx(mode, "testMoneyWord")}</p>
              {isTrap && <p className="scam-warn">⚠️ {tx(mode, "trapStory")}</p>}
            </div>
            <div className="check-list">
              {CHECK_KEYS.map((key, i) => (
                <button
                  key={key}
                  type="button"
                  className={ticks[i] ? "check check-on" : "check"}
                  aria-pressed={ticks[i]}
                  onClick={() => toggle(i)}
                >
                  <span className="check-box" aria-hidden="true">{ticks[i] ? "✓" : ""}</span>
                  {tx(mode, key)}
                </button>
              ))}
            </div>
            {!allTicked && <p className="activities-sub">{say(mode, "payLocked")}</p>}
            {isTrap && allTicked && <p className="step-tip">{tx(mode, "cantTick")}</p>}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              capture="environment"
              aria-label={tx(mode, "showSahaj")}
              style={{ display: "none" }}
              onChange={(e) => onPhoto(e.target.files && e.target.files[0])}
            />
            <div className="learn-row">
              <button className="big-btn btn-ghost" onClick={() => photoRef.current && photoRef.current.click()} disabled={photoReading}>
                📷 {say(mode, "notSure")}
              </button>
            </div>
            {photoReading && <p className="chat-hint">{say(mode, "photoReading")}</p>}
            {photoAnswer && <p className="step-tip" style={{ whiteSpace: "pre-line" }}>{photoAnswer}</p>}
            <div className="step-nav">
              {!isTrap && (
                <button className="big-btn" onClick={pay} disabled={!allTicked || paying}>
                  {paying ? say(mode, "openingPayPal") : tx(mode, "payNow")}
                </button>
              )}
              {isTrap && (
                <button className="big-btn" onClick={walkAway}>
                  {tx(mode, "walkAway")}
                </button>
              )}
              <button className="big-btn btn-ghost" onClick={back}>{tx(mode, "backToScenarios")}</button>
            </div>
            {payError && <p role="alert" className="learn-error">{payError}</p>}
          </>
        )}
      </section>
    </div>
  );
}
