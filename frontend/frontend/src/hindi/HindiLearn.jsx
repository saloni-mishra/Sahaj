import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Confetti, saveCompleted, loadCompleted, completeMission, markPayPass } from "../Progress.jsx";
import HindiMascot from "./HindiMascot.jsx";
import AskFamilyHelp from "../AskFamilyHelp.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const HINDI_TEXT = {
  whatsappHelp: "WhatsApp पर मदद लें",
  sahajSays: "सहज का कहना है:",
  youDidIt: "बहुत बढ़िया, हो गया!",
  finished: "पूरा हुआ!",
  backButton: "शुरुआत पर जाएँ",
  nextGuidePrefix: "इसके बाद:",
  finishButton: "हाँ, मैंने कर लिया",
  readAloud: "सुनकर समझें",
  stopReading: "आवाज़ बंद करें",
  explainError: "माफ़ कीजिए, अभी समझाने में थोड़ी दिक्कत आ रही है।",
  backLink: "← मुख्य पेज पर वापस जाएँ",
  learnTitle: "फ़ोन चलाना सीखें, बिल्कुल आसानी से",
  learnSub: "चिंता न करें, हम साथ मिलकर एक-एक स्टेप पूरा करेंगे।",
  deviceQ: "आप किस चीज़ पर सीख रहे हैं?",
  phone: "फ़ोन",
  laptop: "लैपटॉप",
  brandQ: "फ़ोन किस कंपनी का है?",
  guideQ: "आज क्या सीखना चाहते हैं?",
  guideLabel: "विषय",
  stepWord: "स्टेप",
  ofWord: "में से",
  tipLabel: "काम की बात:",
  thinking: "सोच रहे हैं...",
  explainSimply: "इसे और आसान भाषा में समझाएँ",
  backBtn: "पिछला स्टेप",
  nextBtn: "अगला स्टेप"
};

function useMode() {
  return "hindi";
}

function tx(mode, key) {
  return HINDI_TEXT[key] || key;
}

function say(mode, key) {
  return HINDI_TEXT[key] || key;
}

function pick(value) {
  return value || "";
}


// Per-step "Sahaj says" reaction line (guides.json field "genz_note", optional).
// Shown only in Gen-Z mode. Slang is tap-to-reveal; instructions stay plain.
function SahajSays({ note, stepNumber }) {
  // Show the existing guide note when there is one. On the first step,
  // add one warm line so every guide starts with a friendly mascot moment.
  const message = note || (stepNumber === 1 ? "चलिए, आराम से शुरू करते हैं।" : null);
  if (!message) return null;

  return (
    <div className="sahaj-says" aria-live="polite">
      <HindiMascot variant="inline" alt="सहज मुस्कुरा रहा है" />
      <p><strong>{tx("hindi", "sahajSays")}</strong> {message}</p>
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
      fetch(`${API}/api/missions?lang=hi`).then((r) => r.json()).catch(() => null),
      fetch(`${API}/api/guides?lang=hi`).then((r) => r.json()).catch(() => []),
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
      <HindiMascot variant="celebrate" alt="सहज बधाई दे रहा है" />
      <h2>{tx(mode, "youDidIt")}</h2>
      <p className="stamp">★ {say(mode, "finished")}</p>
      {reward && <p className="stamp">🎁 {pick(reward, mode)}</p>}
      <div className="step-nav">
        <Link className="big-btn" to="/hindi">{tx(mode, "backButton")}</Link>
        {nextGuide && <Link className="big-btn" to={`/hindi/learn?guide=${nextGuide.id}`}>{tx(mode, "nextGuidePrefix")} {nextGuide.title} →</Link>}
      </div>
    </div>
  );

  function finish() {
    saveCompleted(guideId);
    markPayPass("guide"); // Sahaj Pay Pass stop
    window.dispatchEvent(new Event("sahaj-progress"));
    // Auto-complete the mission linked to this guide (m1-m5).
    fetch(`${API}/api/missions?lang=hi`)
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
      <button className="big-btn" onClick={finish}>🎉 {say(mode, "finishButton")}</button>
    </div>
  );
}

function pickVoice(voices) {
  if (!voices || voices.length === 0) return null;

  return (
    voices.find((v) => /^hi[-_]IN$/i.test(v.lang)) ||
    voices.find((v) => /^hi/i.test(v.lang)) ||
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

function ReadAloud({ text }) {
  const mode = useMode();
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
          {tx(mode, "readAloud")}
        </button>
      ) : (
        <button className="big-btn btn-ghost" onClick={stop} aria-live="polite">
          {tx(mode, "stopReading")}
        </button>
      )}
    </div>
  );
}

export default function HindiLearn() {
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
  const [cheer, setCheer] = useState(false);
  const mode = useMode();
  const [searchParams] = useSearchParams();
  const lastAppliedGuide = useRef(null);

  // Load brands + guides once. A ?guide= link (e.g. Next Guide) preselects it,
  // plus ?brand= when the caller knows the brand.
  useEffect(() => {
    fetch(`${API}/api/brands`).then((r) => r.json()).then((brandsData) => {
      setBrands(brandsData);
      const b = searchParams.get("brand");
      if (b && brandsData.some((x) => x.id === b)) {
        const match = brandsData.find((x) => x.id === b);
        setDeviceType(match.device_type);
        setBrandId(b);
      }
    });
    fetch(`${API}/api/guides?lang=hi`).then((r) => r.json()).then((data) => {
      setGuides(data);
      const g = searchParams.get("guide");
      if (g && data.some((x) => x.id === g)) {
        lastAppliedGuide.current = g;
        setGuideId(g);
        setStepNum(1);
      }
    });
  }, []);

  // Follow ?guide= (&brand=) links while staying on the Learn page (Next Guide button).
  useEffect(() => {
    const g = searchParams.get("guide");
    if (g && g !== lastAppliedGuide.current && guides.some((x) => x.id === g)) {
      lastAppliedGuide.current = g;
      const b = searchParams.get("brand");
      const brandOk = b && brands.some((x) => x.id === b);
      if (brandOk) {
        const match = brands.find((x) => x.id === b);
        setDeviceType(match.device_type);
        setBrandId(b);
      } else {
        setBrandId("");
      }
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

  // Mascot reaction on Next: brief celebrate in Gen-Z mode.
  function goNext() {
    if (mode === "genz") {
      setCheer(true);
      setTimeout(() => setCheer(false), 1200);
    }
    setStepNum((n) => n + 1);
  }

  async function explainStep() {
    setExplaining(true);
    setExplanation("");
    try {
      const r = await fetch(`${API}/api/guide/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide_id: guideId,
          brand: brandId,
          step: stepNum,
          question: "कृपया इस स्टेप को और आसान हिंदी में समझाइए।",
          mode: "hindi",
          lang: "hi",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Could not explain.");
      setExplanation(data.explanation);
    } catch {
      setExplanation(tx(mode, "explainError"));
    }
    setExplaining(false);
  }

  // Load the current step whenever brand/guide/step changes.
  useEffect(() => {
    if (!brandId || !guideId) return;
    setError("");
    setExplanation(""); // clear old explanation when step changes
    fetch(`${API}/api/guide/${guideId}?brand=${brandId}&step=${stepNum}&lang=hi`)
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
      <p><Link className="link-more" to="/hindi">{tx(mode, "backLink")}</Link></p>
      <h1>{tx(mode, "learnTitle")}</h1>
      <p className="learn-sub">{say(mode, "learnSub")}</p>

      {/* Step 1: device type */}
      <h2>{say(mode, "deviceQ")}</h2>
      <div className="learn-row">
        <button
          className={deviceType === "phone" ? "big-btn active" : "big-btn"}
          onClick={() => chooseDevice("phone")}
        >
          {tx(mode, "phone")}
        </button>
        <button
          className={deviceType === "laptop" ? "big-btn active" : "big-btn"}
          onClick={() => chooseDevice("laptop")}
        >
          {tx(mode, "laptop")}
        </button>
      </div>

      {/* Step 2: brand */}
      <h2>{say(mode, "brandQ")}</h2>
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
          <h2>{say(mode, "guideQ")}</h2>
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
          <p className="welcome-label">{tx(mode, "guideLabel")} · {step.brand}</p>
          <h2>{step.title}</h2>
          <p className="step-count" aria-live="polite">
            {tx(mode, "stepWord")} {step.step_number} {tx(mode, "ofWord")} {step.total_steps}
          </p>
          <div className="progress" role="progressbar" aria-valuenow={step.step_number} aria-valuemin={1} aria-valuemax={step.total_steps} aria-label={`${tx(mode, "stepWord")} ${step.step_number} ${tx(mode, "ofWord")} ${step.total_steps}`}>
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
          <SahajSays note={step.genz_note} stepNumber={step.step_number} cheer={cheer} />
          <ReadAloud text={step.tips?.length > 0 ? `${step.text}. ${tx(mode, "tipLabel")} ${step.tips[0]}` : step.text} />
          {step.tips?.length > 0 && (
            <div className="hindi-tip-row">
              <HindiMascot variant="tiny" alt="" />
              <p className="step-tip">
                <strong>{tx(mode, "tipLabel")}</strong> {step.tips[0]}
              </p>
            </div>
          )}
          <div className="learn-row">
            <button className="big-btn" onClick={explainStep} disabled={explaining}>
              {explaining ? say(mode, "thinking") : say(mode, "explainSimply")}
            </button>
          </div>
          {explanation && <p className="step-tip">{explanation}</p>}
          <AskFamilyHelp
            guideTitle={step.title}
            stepNumber={step.step_number}
            lang="hi"
          />
          <div className="step-nav">
            <button
              className="big-btn"
              disabled={step.step_number <= 1}
              onClick={() => setStepNum((n) => n - 1)}
            >
              {tx(mode, "backBtn")}
            </button>
            <button
              className="big-btn"
              disabled={step.step_number >= step.total_steps}
              onClick={goNext}
            >
              {say(mode, "nextBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
