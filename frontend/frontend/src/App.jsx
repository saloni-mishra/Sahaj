
import './App.css'
import { useEffect, useRef, useState } from "react";
import { Routes, Route, useSearchParams, Link } from "react-router-dom";
import Learn from "./Learn.jsx";
import { ProgressStrip, TipOfDay } from "./Progress.jsx";
import Fun from "./Fun.jsx";
import Missions, { TodaysMission, MissionToast } from "./Missions.jsx";
import SafeOrScam from "./SafeOrScam.jsx";
import FloatingAsk from "./FloatingAsk.jsx";
import PauseCheck from "./PauseCheck.jsx";
import { PayPass } from "./PayPass.jsx";
import ScamEmergency from "./ScamEmergency.jsx";
import SecureBank from "./SecureBank.jsx";
import ReportCyberFraud from "./ReportCyberFraud.jsx";
import Confidence from "./Confidence.jsx";
import ScreenshotHelp from "./ScreenshotHelp.jsx";
import HindiHome from "./hindi/HindiHome.jsx";
import HindiLearn from "./hindi/HindiLearn.jsx";
import HindiSafeOrScam from "./hindi/HindiSafeOrScam.jsx";
import HindiEmergency from "./hindi/HindiEmergency.jsx";
import HindiFun from "./hindi/HindiFun.jsx";
import HindiBuddy from "./hindi/HindiBuddy.jsx";
import Mascot from "./Mascot.jsx";
import { useLang, HI, LanguageSwitch } from "./language.jsx";

function BottomNav() {
  const mode = useMode();
  const lang = useLang();

  if (lang === "hi") {
    return (
      <nav className="bottom-nav" aria-label="जल्दी पहुँच">
        <Link to="/hindi">🏠<span>{HI.navHome}</span></Link>
        <Link to="/hindi/learn">📖<span>{HI.navLearn}</span></Link>
        <Link to="/hindi/missions">⭐<span>{HI.navMissions}</span></Link>
        <Link to="/hindi/safe-or-scam">🛡<span>{HI.navSafe}</span></Link>
        <Link to="/hindi/fun">🎮<span>{HI.navFun}</span></Link>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav" aria-label="Quick">
      <Link to="/">🏠<span>{tx(mode, "navHome")}</span></Link>
      <Link to="/learn">📖<span>{tx(mode, "navLearn")}</span></Link>
      <Link to="/missions">⭐<span>{tx(mode, "navStars")}</span></Link>
      <Link to="/safe-or-scam">🛡<span>{tx(mode, "navSafe")}</span></Link>
      <Link to="/fun">🎮<span>{tx(mode, "navFun")}</span></Link>
    </nav>
  );
}
import { useMode, setMode, say, tx } from "./copy.jsx";
import { markPayPass } from "./Progress.jsx";

function ModeToggle() {
  const mode = useMode();
  return (
    <div className="mode-toggle" role="group" aria-label="Sahaj style">
      <button
        className={mode === "normal" ? "mode-on" : ""}
        aria-pressed={mode === "normal"}
        onClick={() => setMode("normal")}
      >
        {tx(mode, "modeNormal")}
      </button>
      <button
        className={mode === "genz" ? "mode-on" : ""}
        aria-pressed={mode === "genz"}
        onClick={() => setMode("genz")}
      >
        {tx(mode, "modeGenz")}
      </button>
    </div>
  );
}

function Home() {
 const [holdUp, setHoldUp] = useState(false);
 const mode = useMode();

  return (
    <div className="app">
      <a className="skip-link" href="#home">Skip to content</a>
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
    <Link to="/">{tx(mode, "navHome")}</Link>
    <Link to="/learn">{tx(mode, "navLearn")}</Link>
    <Link to="/missions">{tx(mode, "navMissions")}</Link>
    <Link to="/safe-or-scam">{tx(mode, "navSafeLong")}</Link>
    <a href="/#practice">{tx(mode, "navPractice")}</a>
    <a href="#fun">{tx(mode, "navFun")}</a>
    <Link to="/confidence">{tx(mode, "navConfidence")}</Link>
    <LanguageSwitch className="" />
  </nav>
  <ModeToggle />
</header>


      <main id="home">
        <section className="welcome">
          <div className="welcome-text">
            <p className="welcome-label">{say(mode, "brandTagline")}</p>

            <h1>{say(mode, "heroTitle")}</h1>
            <svg className="squiggle" viewBox="0 0 220 14" aria-hidden="true">
              <path d="M3 10 C 40 3, 80 3, 110 8 S 180 12, 217 5" fill="none" stroke="#B94E24" strokeWidth="5" strokeLinecap="round" />
            </svg>

            <p>
              {say(mode, "heroSub")}
            </p>

            <div className="hero-actions">
              <Link to="/learn" className="big-btn">{say(mode, "startLearning")}</Link>
              <a href="#practice" className="big-btn btn-ghost">{say(mode, "tryPractice")}</a>
            </div>
          </div>

          <aside className="hero-note" aria-label="Why Sahaj helps">
            <img
              src="/logo/sahaj-icon.png"
              alt="Sahaj friendly technology companion"
              className="welcome-image"
            />
            <h2>{say(mode, "helperTitle")}</h2>
            <ul>
              <li>{say(mode, "helper1")}</li>
              <li>{say(mode, "helper2")}</li>
              <li>{say(mode, "helper3")}</li>
            </ul>
          </aside>
        </section>

        <section className="activities">
          <h2>{say(mode, "activitiesTitle")}</h2>
          <p className="activities-sub">{say(mode, "activitiesSub")}</p>
          <ProgressStrip />
          <PayPass />
          <TodaysMission />

          <div className="activity-list">
            <article className="activity-card card-learn" id="learn">
              <span className="card-num" aria-hidden="true">1</span>
              <h3>{say(mode, "learnCardTitle")}</h3>
              <p>{say(mode, "learnCardDesc")}</p>
              <Link className="link-more" to="/learn">{say(mode, "learnCardLink")}</Link>
            </article>

            <article className="activity-card card-practice" id="practice">
  <span className="card-num" aria-hidden="true">2</span>
  <h3>{say(mode, "practiceCardTitle")}</h3>
  <p>{say(mode, "practiceCardDesc")}</p>
  <p className="sandbox-note">{say(mode, "sandboxNote")}</p>

  <button onClick={() => setHoldUp(true)}>
    {say(mode, "practiceButton")}
  </button>
</article>

            <article className="activity-card card-safe" id="safe-or-scam">
              <span className="card-num" aria-hidden="true">3</span>
              <h3>{say(mode, "safeCardTitle")}</h3>
              <p>{say(mode, "safeCardDesc")}</p>
              <Link className="link-more" to="/safe-or-scam">{say(mode, "safeCardLink")}</Link>
            </article>

            <article className="activity-card card-fun" id="fun">
              <span className="card-num" aria-hidden="true">4</span>
              <h3>{say(mode, "funCardTitle")}</h3>
              <p>{say(mode, "funCardDesc")}</p>
              <Link className="link-more" to="/fun">{say(mode, "funCardLink")}</Link>
            </article>
          </div>
        </section>

        <TipOfDay />
      </main>
      <footer className="footer-note">{say(mode, "footerNote")}</footer>
      {holdUp && <PauseCheck onClose={() => setHoldUp(false)} />}
    </div>
  )
}
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const payMode = useMode();

  const [state, setState] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [capture, setCapture] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [reading, setReading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage(tx(payMode, "noPaymentFound"));
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
          throw new Error(data.detail || tx(payMode, "startError"));
        }
        setCapture(data);
        setState("success");
        markPayPass("practice-pay");
        // Plain-words receipt from Gemini (fallback is static text).
        setReading(true);
        let itemLabel = "";
        try {
          itemLabel = sessionStorage.getItem("sahaj-last-item") || "";
        } catch {
          itemLabel = "";
        }
        try {
          const r = await fetch(`${API}/api/explain-receipt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: data.order_id || token,
              status: data.status || "",
              amount: data.amount ? `${data.amount} ${data.currency || "USD"}` : "",
              item: itemLabel || data.description || "",
              mode: payMode,
            }),
          });
          const edata = await r.json();
          setExplanation(edata.explanation || "");
        } catch {
          setExplanation("");
        }
        setReading(false);
      })
      .catch((error) => {
        setState("error");
        setMessage(error.message);
      });
  }, [token]);

  if (state === "loading") return <div className="pay-page"><div className="pay-card"><h1>{say(payMode, "checkingPaymentTitle")}</h1><p>{say(payMode, "checkingPaymentSub")}</p></div></div>;

  if (state === "error") {
    return (
      <div className="pay-page"><div className="pay-card">
        <h1>{say(payMode, "practiceErrorTitle")}</h1>
        <p>{message}</p>
        <p>{say(payMode, "practiceErrorSub")}</p>
        <Link className="big-btn" to="/">{tx(payMode, "backButton")}</Link>
      </div></div>
    );
  }

  return (
    <div className="pay-page"><div className="pay-card">
      <p className="loop-stop">{say(payMode, "loopStop4")}</p>
      <span className="stamp">Practice · Sandbox test money</span>
      <h1>{say(payMode, "practiceDoneTitle")}</h1>
      <p>{say(payMode, "practiceDoneSub")}</p>
      <div className="flow-diagram" aria-label="Money path: you, through PayPal, to the seller">
        <span className="flow-node">🧑 {tx(payMode, "flowYou")}</span>
        <span className="flow-line" aria-hidden="true"><span className="flow-coin">$</span></span>
        <span className="flow-node">🅿 {tx(payMode, "flowPayPal")}</span>
        <span className="flow-line" aria-hidden="true"><span className="flow-coin">$</span></span>
        <span className="flow-node">🏪 {tx(payMode, "flowSeller")}</span>
      </div>
      <div className="request-card">
        <h2>{say(payMode, "receiptTitle")}</h2>
        {capture?.amount && <p><strong>{tx(payMode, "receiptAmount")}</strong> ${capture.amount} {capture.currency || "USD"}</p>}
        {capture?.order_id && <p><strong>{tx(payMode, "receiptOrder")}</strong> {capture.order_id}</p>}
        {capture?.status && <p><strong>{tx(payMode, "receiptStatus")}</strong> {capture.status}</p>}
        <p className="stamp">{say(payMode, "receiptTestMoney")}</p>
      </div>
      {reading && <p className="chat-hint">{say(payMode, "readingReceipt")}</p>}
      {explanation && <p className="step-tip">{explanation}</p>}
      <div className="step-nav">
        <Link className="big-btn" to="/">{tx(payMode, "backButton")}</Link>
      </div>
    </div></div>
  );
}

function PaymentCancel() {
  const cancelMode = useMode();
  return (
    <div className="pay-page"><div className="pay-card">
      <h1>{say(cancelMode, "cancelTitle")}</h1>
      <p>{say(cancelMode, "cancelSub")}</p>
      <Link className="big-btn" to="/">{tx(cancelMode, "backButton")}</Link>
    </div></div>
  );
}

function App() {
  const lang = useLang();
  return (
    <>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hindi" element={<HindiHome />} />
      <Route path="/hindi/learn" element={<HindiLearn />} />
      <Route path="/hindi/missions" element={<Missions />} />
      <Route path="/hindi/safe-or-scam" element={<HindiSafeOrScam />} />
      <Route path="/hindi/emergency" element={<HindiEmergency />} />
      <Route path="/hindi/fun" element={<HindiFun />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/safe-or-scam" element={<SafeOrScam />} />
      <Route path="/confidence" element={<Confidence />} />
      <Route path="/screenshot-help" element={<ScreenshotHelp />} />
      <Route path="/scam-emergency" element={<ScamEmergency />} />
      <Route path="/secure-bank" element={<SecureBank />} />
      <Route path="/report-cyber-fraud" element={<ReportCyberFraud />} />
      <Route path="/fun" element={<Fun />} />
      <Route path="/practice/payment/success" element={<PaymentSuccess />} />
      <Route path="/practice/payment/cancel" element={<PaymentCancel />} />
      </Routes>
      {lang === "hi" ? <HindiBuddy /> : <FloatingAsk />}
      <MissionToast />
      <BottomNav />
    </>
  );
}

export default App
