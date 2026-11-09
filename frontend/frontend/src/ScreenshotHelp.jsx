import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMode } from "./copy.jsx";
import AskFamilyHelp from "./AskFamilyHelp.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function validateFile(file) {
  if (!file) return "Please choose a screenshot first.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please choose a PNG, JPG or WEBP image.";
  }
  if (file.size > MAX_BYTES) {
    return "That screenshot is too big. Please choose one under 4 MB.";
  }
  return "";
}

async function analyzeScreenshot(file, mode) {
  const form = new FormData();
  form.append("image", file);
  form.append("mode", mode === "genz" ? "genz" : "normal");

  let response;
  try {
    response = await fetch(`${API}/api/screenshot-help`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error("Could not reach Sahaj. Please check your internet and try again.");
  }
  const data = await response.json().catch(() => ({}));

  if (response.status === 413) {
    throw new Error("That screenshot is too big. Please choose one under 4 MB.");
  }
  if (response.status === 415) {
    throw new Error("That file could not be read. Please choose a PNG, JPG or WEBP image.");
  }
  if (response.status === 429) {
    throw new Error("You have tried a few times. Please wait a few minutes and try again.");
  }
  if (!response.ok) {
    throw new Error(
      data.detail || "Sahaj could not read that screenshot right now. Please try again."
    );
  }
  return data;
}

async function askFollowUp(question, summary, mode) {
  let response;
  try {
    response = await fetch(`${API}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: `About my phone screen: ${summary}\n\nMy question: ${question}`,
        mode,
      }),
    });
  } catch {
    throw new Error("Could not reach Sahaj. Please check your internet and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Sorry, I could not answer just now.");
  }
  return {
    answer: data.answer || "",
    warning: data.safety_warning || "",
  };
}

export default function ScreenshotHelp() {
  const mode = useMode();
  const inputRef = useRef(null);
  const previewUrlRef = useRef("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState(null);

  const [followup, setFollowup] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState("");

  const [simpler, setSimpler] = useState("");
  const [simplerLoading, setSimplerLoading] = useState(false);
  const [simplerError, setSimplerError] = useState("");
  const [answerWarning, setAnswerWarning] = useState("");

  const canCapture =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function resetAnswers() {
    setResult(null);
    setFollowup("");
    setFollowupAnswer("");
    setFollowupError("");
    setSimpler("");
    setSimplerError("");
    setAnswerWarning("");
  }

  function pickFile(nextFile) {
    const problem = validateFile(nextFile);
    if (problem) {
      setError(problem);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(nextFile);
    previewUrlRef.current = url;
    setPreview(url);
    setError("");
    setFile(nextFile);
    resetAnswers();
  }

  function removeFile() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setPreview("");
    setFile(null);
    setError("");
    resetAnswers();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function captureScreen() {
    if (!canCapture || capturing) return;
    setCapturing(true);
    setError("");
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Screen capture failed.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Screen capture failed.");

      const captured = new File([blob], "screen-capture.png", {
        type: "image/png",
      });
      pickFile(captured);
    } catch {
      setError(
        "Screen capture was cancelled or not available. You can upload an image instead."
      );
    } finally {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      setCapturing(false);
    }
  }

  async function askSahaj() {
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError("");
    resetAnswers();
    try {
      const data = await analyzeScreenshot(file, mode);
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    }
    setLoading(false);
  }

  async function explainSimpler() {
    if (!result || simplerLoading) return;
    setSimplerLoading(true);
    setSimplerError("");
    setSimpler("");
    setAnswerWarning("");
    try {
      const data = await askFollowUp(
        "Please explain this in even simpler words. Use 2 or 3 short sentences.",
        `${result.screen_summary} Next step: ${result.next_action}`,
        mode
      );
      setSimpler(data.answer);
      setAnswerWarning(data.warning);
    } catch (requestError) {
      setSimplerError(requestError.message);
    }
    setSimplerLoading(false);
  }

  async function sendFollowup() {
    const question = followup.trim();
    if (!result || !question || followupLoading) return;
    setFollowupLoading(true);
    setFollowupError("");
    setFollowupAnswer("");
    setAnswerWarning("");
    try {
      const data = await askFollowUp(
        question,
        `${result.screen_summary} Next step: ${result.next_action}`,
        mode
      );
      setFollowupAnswer(data.answer);
      setAnswerWarning(data.warning);
    } catch (requestError) {
      setFollowupError(requestError.message);
    }
    setFollowupLoading(false);
  }

  return (
    <div className="learn shot-page">
      <p>
        <Link className="link-more" to="/">
          ← Back to Sahaj
        </Link>
      </p>
      <h1>Show Sahaj your screen</h1>
      <p className="learn-sub">
        Upload a screenshot and Sahaj will help you read it. You stay in control:
        nothing is sent until you press Ask Sahaj.
      </p>

      <div className="shot-note" role="note">
        Your screenshot is sent for analysis and not saved. Hide OTPs, PINs and
        bank details first.
      </div>

      <div className="shot-upload">
        <input
          ref={inputRef}
          id="shot-file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="shot-file-input"
          onChange={(event) => {
            const nextFile = event.target.files && event.target.files[0];
            if (nextFile) pickFile(nextFile);
            event.target.value = "";
          }}
        />
        <label className="big-btn btn-ghost" htmlFor="shot-file">
          📷 Choose an image
        </label>
        {canCapture && (
          <button
            type="button"
            className="big-btn btn-ghost"
            onClick={captureScreen}
            disabled={capturing}
          >
            {capturing ? "Capturing…" : "🖥 Capture my screen"}
          </button>
        )}
      </div>
      <p className="shot-hint">PNG, JPG or WEBP. Maximum 4 MB.</p>

      {error && (
        <p role="alert" className="learn-error">
          {error}
        </p>
      )}

      {file && preview && (
        <div className="shot-preview">
          <img src={preview} alt="Screenshot preview" className="shot-preview-img" />
          <div className="shot-preview-actions">
            <p className="shot-file-name">{file.name}</p>
            <button type="button" className="big-btn btn-ghost" onClick={removeFile}>
              Remove image
            </button>
          </div>
        </div>
      )}

      <div className="step-nav">
        <button
          type="button"
          className="big-btn"
          onClick={askSahaj}
          disabled={!file || loading}
        >
          {loading ? "Looking at your screenshot…" : "Ask Sahaj"}
        </button>
      </div>

      {result && (
        <section className="shot-result" aria-live="polite">
          <p className="welcome-label">Sahaj looked at your screen</p>
          <h2>{result.screen_summary}</h2>

          <div className="shot-next">
            <p className="shot-label">Next step</p>
            <p className="shot-action">{result.next_action}</p>
          </div>

          {result.where_to_tap && (
            <p className="shot-where">
              <strong>Where to look:</strong> {result.where_to_tap}
            </p>
          )}

          {result.reason && (
            <p className="step-tip">
              <strong>Why:</strong> {result.reason}
            </p>
          )}

          {result.warning && (
            <p
              role="alert"
              className={result.is_sensitive ? "scam-danger" : "scam-warn"}
            >
              <strong>Warning:</strong> {result.warning}
            </p>
          )}

          {result.is_sensitive && !result.warning && (
            <p role="alert" className="scam-danger">
              <strong>Warning:</strong> This screen may show private or payment
              details. Do not share OTPs, PINs or card numbers. Check with a
              trusted family member before paying.
            </p>
          )}

          <p className="stamp">
            Confidence: {result.confidence === "high" ? "High" : result.confidence === "medium" ? "Medium" : "Low"}
          </p>

          {result.confidence === "low" && (
            <p className="step-tip">
              Sahaj is not sure yet. Please answer the question above, or try a
              clearer screenshot.
            </p>
          )}

          <div className="step-nav">
            <button
              type="button"
              className="big-btn btn-ghost"
              onClick={explainSimpler}
              disabled={simplerLoading}
            >
              {simplerLoading ? "Explaining…" : "Explain simpler"}
            </button>
            <button
              type="button"
              className="big-btn btn-ghost"
              onClick={removeFile}
            >
              Try another screenshot
            </button>
          </div>

          {simplerError && <p role="alert" className="learn-error">{simplerError}</p>}
          {simpler && <p className="step-tip">{simpler}</p>}

          <div className="shot-followup">
            <label className="ask-label" htmlFor="shot-followup">
              Ask a follow-up
            </label>
            <textarea
              id="shot-followup"
              className="family-message"
              rows={2}
              value={followup}
              onChange={(event) => setFollowup(event.target.value)}
              placeholder="e.g. What does this button do?"
            />
            <button
              type="button"
              className="big-btn"
              onClick={sendFollowup}
              disabled={followupLoading || !followup.trim()}
            >
              {followupLoading ? "Asking…" : "Ask a follow-up"}
            </button>
          </div>

          {followupError && (
            <p role="alert" className="learn-error">{followupError}</p>
          )}
          {followupAnswer && (
            <p className="step-tip" style={{ whiteSpace: "pre-line" }}>
              {followupAnswer}
            </p>
          )}

          {answerWarning && (
            <p role="alert" className="scam-danger">
              {answerWarning}
            </p>
          )}

          <AskFamilyHelp />
        </section>
      )}
    </div>
  );
}
