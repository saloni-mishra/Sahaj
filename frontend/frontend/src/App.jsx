
import './App.css'
import { useEffect, useRef, useState } from "react";
import { Routes, Route, useSearchParams, Link } from "react-router-dom";
import Learn from "./Learn.jsx";
import AskSahaj from "./AskSahaj.jsx";
import ScamGame from "./ScamGame.jsx";
import { ProgressStrip, TipOfDay } from "./Progress.jsx";
import Fun from "./Fun.jsx";

function ScamChecker() {
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

function Home() {
 const [paying, setPaying] = useState(false);
const [payError, setPayError] = useState("");

async function startPracticePayment() {
  setPaying(true);
  setPayError("");

  try {
    const response = await fetch(`${API}/api/paypal/create-order`, {
      method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Could not start the practice.");
    }

    // Send the browser to PayPal's approval page.
    window.location.href = data.approval_url;
  } catch (error) {
    setPayError(error.message);
    setPaying(false);
  }
}
  return (
    <div className="app">
      
<header className="navbar">
  <Link to="/" className="brand">
    <img
      src="/logo/sahaj-icon.png"
      alt="Sahaj logo"
      className="brand-icon"
    />
    <span>Sahaj</span>
  </Link>

  <nav aria-label="Main">
    <Link to="/">Home</Link>
    <Link to="/learn">Learn</Link>
    <a href="/#practice">Practice</a>
    <a href="/#fun">Fun</a>
  </nav>
</header>


      <main id="home">
        <section className="welcome">
          <div className="welcome-text">
            <p className="welcome-label">THE GRANDKID YOU CAN ALWAYS ASK</p>

            <h1>Technology, made simple.</h1>
            <svg className="squiggle" viewBox="0 0 220 14" aria-hidden="true">
              <path d="M3 10 C 40 3, 80 3, 110 8 S 180 12, 217 5" fill="none" stroke="#B94E24" strokeWidth="5" strokeLinecap="round" />
            </svg>

            <p>
              A little help with your phone, whenever you need it.
              Learn new things, practise safely, and have fun along the way.
            </p>

            <div className="hero-actions">
              <Link to="/learn" className="big-btn">Start learning</Link>
              <a href="#practice" className="big-btn btn-ghost">Try practice</a>
            </div>
          </div>

          <aside className="hero-note" aria-label="Why Sahaj helps">
            <img
              src="/logo/sahaj-icon.png"
              alt="Sahaj friendly technology companion"
              className="welcome-image"
            />
            <h2>A patient helper</h2>
            <ul>
              <li>Big letters, big buttons</li>
              <li>One step at a time, with pictures</li>
              <li>Practice with test money first</li>
            </ul>
            <span className="stamp">PayPal hackathon · Sandbox only</span>
          </aside>
        </section>

        <section className="activities">
          <h2>What would you like to do today?</h2>
          <p className="activities-sub">Three doors, pick one. No rush — Sahaj waits for you.</p>
          <ProgressStrip />

          <div className="activity-list">
            <article className="activity-card card-learn" id="learn">
              <span className="card-num" aria-hidden="true">1</span>
              <h3>Learn</h3>
              <p>Get simple, step-by-step help with your phone.</p>
              <Link className="link-more" to="/learn">Start learning →</Link>
            </article>

            <article className="activity-card card-practice" id="practice">
  <span className="card-num" aria-hidden="true">2</span>
  <h3>Practice</h3>
  <p>Learn to use digital services safely.</p>
  <p className="sandbox-note">Practice Mode: uses PayPal Sandbox test money — no real money is used.</p>

  <button onClick={startPracticePayment} disabled={paying}>
    {paying ? "Opening PayPal…" : "Try a practice payment"}
  </button>

  {payError && <p role="alert">{payError}</p>}

  <ScamChecker />
  <ScamGame />
</article>

            <article className="activity-card card-fun" id="fun">
              <span className="card-num" aria-hidden="true">3</span>
              <h3>Fun</h3>
              <p>Explore words, emojis, and little activities.</p>
              <Link className="link-more" to="/fun">Play and learn →</Link>
            </article>
          </div>
        </section>

        <AskSahaj />
        <TipOfDay />
      </main>
      <footer className="footer-note">Sahaj speaks plainly. Big text, no rush, no real money in Practice.</footer>
    </div>
  )
}
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("No payment was found in this link.");
      return;
    }

    // React StrictMode runs effects twice in development.
    // This makes sure we only capture once.
    if (started.current) return;
    started.current = true;

    fetch(`${API}/api/paypal/capture/${token}`, { method: "POST" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Something went wrong.");
        }
        setState("success");
      })
      .catch((error) => {
        setState("error");
        setMessage(error.message);
      });
  }, [token]);

  if (state === "loading") return <div className="pay-page"><div className="pay-card"><h1>Checking your practice payment…</h1><p>Please wait a moment.</p></div></div>;

  if (state === "error") {
    return (
      <div className="pay-page"><div className="pay-card">
        <h1>That did not work</h1>
        <p>{message}</p>
        <p>No real money was used. This was practice mode.</p>
        <Link className="big-btn" to="/">Back to Sahaj</Link>
      </div></div>
    );
  }

  return (
    <div className="pay-page"><div className="pay-card">
      <span className="stamp">Practice · Sandbox test money</span>
      <h1>Well done!</h1>
      <p>You finished a practice payment. No real money was used.</p>
      <Link className="big-btn" to="/">Back to Sahaj</Link>
    </div></div>
  );
}

function PaymentCancel() {
  return (
    <div className="pay-page"><div className="pay-card">
      <h1>No problem, you stopped the payment.</h1>
      <p>Nothing was charged. This was practice mode, so you can try again any time.</p>
      <Link className="big-btn" to="/">Back to Sahaj</Link>
    </div></div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/fun" element={<Fun />} />
      <Route path="/practice/payment/success" element={<PaymentSuccess />} />
      <Route path="/practice/payment/cancel" element={<PaymentCancel />} />
    </Routes>
  );
}

export default App
