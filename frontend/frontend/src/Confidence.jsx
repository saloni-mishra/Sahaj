import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCompleted, loadMissions, loadPayPass } from "./Progress.jsx";
import { loadScamRounds } from "./scamRounds.js";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const ROUNDS_GOAL = 3;

function readSaved() {
  return {
    guides: loadCompleted(),
    missions: loadMissions(),
    paypass: loadPayPass(),
    rounds: loadScamRounds(),
  };
}

function ProgressCard({ title, count, total, note, countText }) {
  const percent = total > 0 ? Math.min(100, (count / total) * 100) : 0;
  const shownCount = Math.min(count, total);
  return (
    <article className="confidence-card">
      <h2>{title}</h2>
      <p className="confidence-count">
        {countText || `${count} of ${total}`}
      </p>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={shownCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${title}: ${countText || `${count} of ${total}`}`}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="confidence-note">{note}</p>
    </article>
  );
}

export default function Confidence() {
  const [guides, setGuides] = useState([]);
  const [missions, setMissions] = useState([]);
  const [saved, setSaved] = useState(readSaved);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadContent() {
      const [guideResult, missionResult] = await Promise.allSettled([
        fetch(`${API}/api/guides`),
        fetch(`${API}/api/missions`),
      ]);

      if (!alive) return;
      const problems = [];

      if (guideResult.status === "fulfilled" && guideResult.value.ok) {
        const data = await guideResult.value.json().catch(() => null);
        if (Array.isArray(data)) setGuides(data);
        else problems.push("guides");
      } else {
        problems.push("guides");
      }

      if (missionResult.status === "fulfilled" && missionResult.value.ok) {
        const data = await missionResult.value.json().catch(() => null);
        const list = data && (data.missions || data);
        if (Array.isArray(list)) setMissions(list);
        else problems.push("missions");
      } else {
        problems.push("missions");
      }

      setError(
        problems.length > 0
          ? "Some progress details could not load right now. Your saved progress on this device is still safe."
          : ""
      );
      setLoading(false);
    }

    loadContent();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function refresh() {
      setSaved(readSaved());
    }
    const events = [
      "sahaj-progress",
      "sahaj-missions",
      "sahaj-paypass",
      "sahaj-scam-rounds",
      "storage",
    ];
    events.forEach((name) => window.addEventListener(name, refresh));
    return () =>
      events.forEach((name) => window.removeEventListener(name, refresh));
  }, []);

  const doneGuides = new Set(saved.guides);
  const doneMissions = new Set(saved.missions);
  const guideDone = guides.filter((guide) => doneGuides.has(guide.id)).length;
  const missionDone = missions.filter((mission) =>
    doneMissions.has(mission.id)
  ).length;
  const rounds = Math.max(
    saved.rounds,
    saved.paypass["scam-round"] ? 1 : 0
  );
  const practiceDone = saved.paypass["practice-pay"] ? 1 : 0;
  const pauseCheckDone = !!saved.paypass["pause-check"];

  const isNew =
    saved.guides.length === 0 &&
    saved.missions.length === 0 &&
    rounds === 0 &&
    practiceDone === 0 &&
    !pauseCheckDone;

  const nextGuide = guides.find((guide) => !doneGuides.has(guide.id));
  const recommendations = [];

  if (nextGuide) {
    recommendations.push({
      key: "guide",
      title: `Try ${nextGuide.title}`,
      body: "A short, step-by-step guide you have not finished yet.",
      cta: "Open guide",
      to: `/learn?guide=${encodeURIComponent(nextGuide.id)}`,
    });
  }
  if (rounds === 0) {
    recommendations.push({
      key: "safe",
      title: "Practise spotting a scam",
      body: "Finish one Safe or Scam round. Wrong answers are fine here.",
      cta: "Play Safe or Scam",
      to: "/safe-or-scam",
    });
  }
  if (practiceDone === 0) {
    recommendations.push({
      key: "practice",
      title: "Try a practice payment",
      body: "Use PayPal Sandbox test money. No real money moves.",
      cta: "Try practice",
      href: "/#practice",
    });
  }
  if (missions.length > 0 && missionDone === 0) {
    recommendations.push({
      key: "missions",
      title: "Pick one small mission",
      body: "A real-world task you can finish today.",
      cta: "See missions",
      to: "/missions",
    });
  }

  const shownRecommendations = recommendations.slice(0, 3);
  const allDone =
    guides.length > 0 &&
    guideDone >= guides.length &&
    (missions.length === 0 || missionDone >= missions.length) &&
    rounds > 0 &&
    practiceDone > 0;

  return (
    <div className="learn confidence-page">
      <p>
        <Link className="link-more" to="/">
          ← Back to Sahaj
        </Link>
      </p>
      <h1>My Digital Confidence</h1>
      <p className="learn-sub">
        This page only shows things you really finished on this device. Nothing
        is guessed, and opening a page does not count.
      </p>

      {loading && <p className="chat-hint">Checking your saved progress…</p>}
      {error && (
        <p role="alert" className="learn-error">
          {error}
        </p>
      )}

      {isNew && !loading && (
        <div className="confidence-start">
          <span className="card-num" aria-hidden="true">🌱</span>
          <h2>You are just starting — that is perfect.</h2>
          <p>
            There is nothing to catch up on. Pick one small guide, finish one
            step, and your confidence will grow from real progress.
          </p>
        </div>
      )}

      <section className="confidence-grid" aria-label="Your recorded progress">
        {guides.length > 0 && (
          <ProgressCard
            title="Using my device"
            count={guideDone}
            total={guides.length}
            note={`${guideDone === 1 ? "1 guide" : `${guideDone} guides`} completed.`}
          />
        )}

        <ProgressCard
          title="Staying safe"
          count={rounds}
          total={ROUNDS_GOAL}
          countText={`${rounds} ${rounds === 1 ? "round" : "rounds"} finished`}
          note={
            rounds === 0
              ? `No Safe or Scam rounds finished yet. Goal: ${ROUNDS_GOAL} rounds.`
              : `Goal: ${ROUNDS_GOAL} rounds. You can always play another round.`
          }
        />

        {missions.length > 0 && (
          <ProgressCard
            title="Everyday tasks"
            count={missionDone}
            total={missions.length}
            note={`${missionDone === 1 ? "1 mission" : `${missionDone} missions`} completed.`}
          />
        )}

        <ProgressCard
          title="Practice payments"
          count={practiceDone}
          total={1}
          note={
            practiceDone
              ? "You finished a PayPal Sandbox practice payment. No real money moved."
              : pauseCheckDone
                ? "You finished Pause & Check. Next, try a practice payment with test money."
                : "Not tried yet. Practice uses test money only."
          }
        />
      </section>

      <h2>Try this next</h2>
      {loading ? (
        <p className="chat-hint">Finding your next step…</p>
      ) : shownRecommendations.length > 0 ? (
        <div className="confidence-next">
          {shownRecommendations.map((item) => (
            <article className="confidence-rec" key={item.key}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.href ? (
                <a className="big-btn" href={item.href}>
                  {item.cta}
                </a>
              ) : (
                <Link className="big-btn" to={item.to}>
                  {item.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      ) : allDone ? (
        <div className="confidence-rec">
          <h3>You have finished everything we can see here.</h3>
          <p>
            That is real progress. You can revisit a guide or help someone else
            learn a step.
          </p>
          <Link className="big-btn" to="/learn">
            Revisit a guide
          </Link>
        </div>
      ) : (
        <p className="activities-sub">
          Nothing new to suggest right now. You can still open a guide or play a
          round.
        </p>
      )}
    </div>
  );
}
