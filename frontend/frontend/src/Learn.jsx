import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

  // Load brands + guides once.
  useEffect(() => {
    fetch(`${API}/api/brands`).then((r) => r.json()).then(setBrands);
    fetch(`${API}/api/guides`).then((r) => r.json()).then(setGuides);
  }, []);

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
        body: JSON.stringify({ guide_id: guideId, brand: brandId, step: stepNum }),
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
        <div className="step-card">
          <h2>{step.title}</h2>
          <p className="step-count">
            Step {step.step_number} of {step.total_steps}
          </p>
          {step.image && (
            <img src={step.image} alt={step.image_alt || step.text} className="step-image" />
          )}
          <p className="step-text">{step.text}</p>
          {step.tips?.length > 0 && (
            <p className="step-tip">Tip: {step.tips[0]}</p>
          )}
          <div className="learn-row">
            <button className="big-btn" onClick={explainStep} disabled={explaining}>
              {explaining ? "Thinking…" : "Explain this step simply"}
            </button>
          </div>
          {explanation && <p className="step-tip">{explanation}</p>}
          <div className="learn-row">
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
