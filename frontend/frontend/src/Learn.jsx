import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Confetti, saveCompleted, loadCompleted, completeMission } from "./Progress.jsx";
import { useMode, COPY, withSlang } from "./copy.jsx";
import Mascot from "./Mascot.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function WhatsAppHelp({ step }) {
  const text = `Namaste! I need help with "${step.title}", step ${step.step_number} of ${step.total_steps}: ${step.text}. Can you help me? (sent from Sahaj)`;
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return (
    <div className="learn-row">
      <a className="big-btn btn-ghost" href={href} target="_blank" rel="noreferrer">
        💬 Ask family on WhatsApp
      </a>
    </div>
  );
}
function FinishGuide({ guideId, isLast }) {
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reward, setReward] = useState(null);
  const [nextGuide, setNextGuide] = useState(null);
  const mode = useMode();

  useEffect(() => {
    setFinished(loadCompleted().includes(guideId));
    setShowConfetti(false);
  }, [guideId]);

  // Look up this guide's mission reward + a suggested next guide.
  useEffect(() => {
    if (!isLast) return;
    Promise.all([
      fetch(`${API}/api/missions`).then((r) => r.json()).catch(() => null),
      fetch(`${API}/api/guides`).then((r) => r.json()).catch(() => []),
    ]).then(([mData, guides]) => {
      const missions = (mData && (mData.missions || mData)) || [];
      const match = missions.find((m) => m.guide_id === guideId);
      if (match) setReward(match.reward);
      const done = loadCompleted();
      const next =
        (guides || []).find((g) => g.id !== guideId && !done.includes(g.id)) ||
        (guides || []).find((g) => g.id !== guideId) ||
        null;
      setNextGuide(next);
    });
  }, [isLast, guideId]);

  if (!isLast) return null;
  if (finished) return (
    <div className="celebrate">
      {showConfetti && <Confetti />}
      <Mascot mood="celebrating" size={110} />
      <h2>You did it!</h2>
      <p className="stamp">★ {mode === "genz" && reward ? withSlang(COPY.finished.genz) : COPY.finished.normal}</p>
      {reward && <p className="stamp">🎁 Sticker earned: {mode === "genz" ? withSlang(reward) : reward}</p>}
      <div className="step-nav">
        <Link className="big-btn" to="/">Back to Home</Link>
        {nextGuide && <Link className="big-btn" to={`/learn?guide=${nextGuide.id}`}>Next Guide: {nextGuide.title} →</Link>}
      </div>
    </div>
  );

  function finish() {
    saveCompleted(guideId);
    window.dispatchEvent(new Event("sahaj-progress"));
    // Auto-complete the mission linked to this guide (m1-m5).
    fetch(`${API}/api/missions`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.missions || data || [];
        const match = list.find((m) => m.guide_id === guideId);
        if (match) completeMission(match.id);
      })
      .catch(() => {});
    setFinished(true);
    setShowConfetti(true);
  }

  return (
    <div className="learn-row">
      {showConfetti && <Confetti />}
      <button className="big-btn" onClick={finish}>🎉 {COPY.finishButton[mode]}</button>
    </div>
  );
}

function pickVoice(voices) {
  if (!voices || voices.length === 0) return null;
  return (
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ||
    voices.find((v) => /^hi/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

function ReadAloud({ text }) {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  // Stop speech when the step changes or the component unmounts.
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [text]);

  if (!supported) return null; // hide gracefully if unsupported

  function speak() {
    window.speechSynthesis.cancel();
    const voiceText = new SpeechSynthesisUtterance(text);
    voiceText.rate = 0.85; // slow and clear
    voiceText.pitch = 1;
    const voice = pickVoice(window.speechSynthesis.getVoices());
    if (voice) voiceText.voice = voice;
    voiceText.onend = () => setSpeaking(false);
    voiceText.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(voiceText);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="learn-row">
      {!speaking ? (
        <button className="big-btn btn-ghost" onClick={speak}>
          🔊 Read this to me
        </button>
      ) : (
        <button className="big-btn btn-ghost" onClick={stop} aria-live="polite">
          ⏹ Stop
        </button>
      )}
    </div>
  );
}

export default function Learn() {
  const [brands, setBrands] = useState([]);
  const [guides, setGuides] = useState([]);
  const [deviceType, setDeviceType] = useState("phone");
  const [brandId, setBrandId] = useState("");
  const [guideId, setGuideId] = useState("");
  const [stepNum, setStepNum] = useState(1);
  const [step, setStep] = useState(null);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const mode = useMode();
  const [searchParams] = useSearchParams();
  const lastAppliedGuide = useRef(null);

  // Load brands + guides once. A ?guide= link (e.g. Next Guide) preselects it.
  useEffect(() => {
    fetch(`${API}/api/brands`).then((r) => r.json()).then(setBrands);
    fetch(`${API}/api/guides`).then((r) => r.json()).then((data) => {
      setGuides(data);
      const g = searchParams.get("guide");
      if (g && data.some((x) => x.id === g)) {
        lastAppliedGuide.current = g;
        setGuideId(g);
        setStepNum(1);
      }
    });
  }, []);

  // Follow ?guide= links while staying on the Learn page (Next Guide button).
  useEffect(() => {
    const g = searchParams.get("guide");
    if (g && g !== lastAppliedGuide.current && guides.some((x) => x.id === g)) {
      lastAppliedGuide.current = g;
      setBrandId("");
      setGuideId(g);
      setStepNum(1);
      setStep(null);
    }
  }, [searchParams]);

  // Auto-pick a matching brand when a guide arrives without one (?guide= link).
  useEffect(() => {
    if (guideId && !brandId && guides.length > 0 && brands.length > 0) {
      const guide = guides.find((x) => x.id === guideId);
      if (guide) {
        const firstType = (guide.device_types || [])[0];
        const match = brands.find((b) => b.device_type === firstType);
        if (match) {
          setDeviceType(match.device_type);
          setBrandId(match.id);
        }
      }
    }
  }, [guideId, brandId, guides, brands]);

  const visibleBrands = brands.filter((b) => b.device_type === deviceType);
  const visibleGuides = guides.filter((g) => g.device_types.includes(deviceType));

  // When device changes, reset brand + guide choice.
  function chooseDevice(t) {
    setDeviceType(t);
    setBrandId("");
    setGuideId("");
    setStep(null);
    setStepNum(1);
  }

  function chooseGuide(gid) {
    setGuideId(gid);
    setStepNum(1);
    setExplanation("");
  }

  async function explainStep() {
    setExplaining(true);
    setExplanation("");
    try {
      const r = await fetch(`${API}/api/guide/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide_id: guideId, brand: brandId, step: stepNum, mode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Could not explain.");
      setExplanation(data.explanation);
    } catch (e) {
      setExplanation("Sorry, I couldn't explain this right now. Please follow the instructions shown on screen.");
    }
    setExplaining(false);
  }

  // Load the current step whenever brand/guide/step changes.
  useEffect(() => {
    if (!brandId || !guideId) return;
    setError("");
    setExplanation(""); // clear old explanation when step changes
    fetch(`${API}/api/guide/${guideId}?brand=${brandId}&step=${stepNum}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || "Step not found.");
        setStep(data);
      })
      .catch((e) => {
        setStep(null);
        setError(e.message);
      });
  }, [brandId, guideId, stepNum]);

  return (
    <div className="learn">
      <p><Link className="link-more" to="/">← Home</Link></p>
      <h1>Learn</h1>
      <p className="learn-sub">Pick your device, then pick what to learn.</p>

      {/* Step 1: device type */}
      <h2>1. Phone or laptop?</h2>
      <div className="learn-row">
        <button
          className={deviceType === "phone" ? "big-btn active" : "big-btn"}
          onClick={() => chooseDevice("phone")}
        >
          Phone
        </button>
        <button
          className={deviceType === "laptop" ? "big-btn active" : "big-btn"}
          onClick={() => chooseDevice("laptop")}
        >
          Laptop
        </button>
      </div>

      {/* Step 2: brand */}
      <h2>2. Which one is yours?</h2>
      <div className="learn-row">
        {visibleBrands.map((b) => (
          <button
            key={b.id}
            className={brandId === b.id ? "big-btn active" : "big-btn"}
            onClick={() => setBrandId(b.id)}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Step 3: guide */}
      {brandId && (
        <>
          <h2>3. What do you want to do?</h2>
          <div className="learn-row">
            {visibleGuides.map((g) => (
              <button
                key={g.id}
                className={guideId === g.id ? "big-btn active" : "big-btn"}
                onClick={() => chooseGuide(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
        </>
      )}

      {error && <p role="alert" className="learn-error">{error}</p>}

      {/* Step viewer */}
      {step && (
        <div className="step-card" key={`${guideId}-${brandId}-${step.step_number}`}>
          <p className="welcome-label">GUIDE · {step.brand}</p>
          <h2>{step.title}</h2>
          <p className="step-count" aria-live="polite">
            Step {step.step_number} of {step.total_steps}
          </p>
          <div className="progress" role="progressbar" aria-valuenow={step.step_number} aria-valuemin={1} aria-valuemax={step.total_steps} aria-label={`Step ${step.step_number} of ${step.total_steps}`}>
            <div className="progress-fill" style={{ width: `${(step.step_number / step.total_steps) * 100}%` }} />
          </div>
          {step.image && (
            <figure className="step-figure">
              <img src={step.image} alt={step.image_alt || step.text} className="step-image" />
              {step.image_alt && <figcaption>{step.image_alt}</figcaption>}
            </figure>
          )}
          <FinishGuide guideId={guideId} isLast={step.step_number >= step.total_steps} />
          <p className="step-text">{step.text}</p>
          <ReadAloud text={step.tips?.length > 0 ? `${step.text}. Tip: ${step.tips[0]}` : step.text} />
          {step.tips?.length > 0 && (
            <p className="step-tip">Tip: {step.tips[0]}</p>
          )}
          <div className="learn-row">
            <button className="big-btn" onClick={explainStep} disabled={explaining}>
              {explaining ? "Thinking…" : "Explain this step simply"}
            </button>
          </div>
          {explanation && <p className="step-tip">{explanation}</p>}
          <WhatsAppHelp step={step} />
          <div className="step-nav">
            <button
              className="big-btn"
              disabled={step.step_number <= 1}
              onClick={() => setStepNum((n) => n - 1)}
            >
              ← Back
            </button>
            <button
              className="big-btn"
              disabled={step.step_number >= step.total_steps}
              onClick={() => setStepNum((n) => n + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
