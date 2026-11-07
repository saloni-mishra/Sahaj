import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function badgeFor(score, total) {
  if (score === total) return "🏆 Top Scam-spotter! Perfect score.";
  if (score >= total - 2) return "🥈 Silver Scam-spotter! Very careful.";
  if (score >= Math.ceil(total / 2)) return "🥉 Learning fast — keep it up!";
  return "🌱 Keep practicing — scammers trick everyone at first.";
}

export default function ScamGame() {
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null); // true = said scam, false = said safe
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/scam-quiz`)
      .then(async (r) => {
        if (!r.ok) throw new Error("quiz missing");
        setQuiz(await r.json());
      })
      .catch(() => setLoadError("The game could not load right now."));
  }, []);

  if (loadError) return <p role="alert">{loadError}</p>;
  if (quiz.length === 0) return <p>Loading the game…</p>;

  // Finished: show score + badge.
  if (index >= quiz.length) {
    return (
      <div className="quiz-box">
        <h3>Game over!</h3>
        <p className="step-count">You got {score} out of {quiz.length} right.</p>
        <p className="stamp">{badgeFor(score, quiz.length)}</p>
        <div className="step-nav">
          <button className="big-btn" onClick={() => { setIndex(0); setScore(0); setPicked(null); }}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  const item = quiz[index];
  const answered = picked !== null;
  const correct = answered && picked === item.is_scam;

  function choose(saidScam) {
    if (answered) return;
    setPicked(saidScam);
    if (saidScam === item.is_scam) setScore((s) => s + 1);
  }

  function next() {
    setIndex((i) => i + 1);
    setPicked(null);
  }

  return (
    <div className="quiz-box">
      <h3>🎯 Spot the Scam</h3>
      <p className="step-count">Message {index + 1} of {quiz.length} · Score: {score}</p>
      <div className="progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={quiz.length} aria-label={`Message ${index + 1} of ${quiz.length}`}>
        <div className="progress-fill" style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>
      <blockquote className="quiz-msg">“{item.message}”</blockquote>
      {!answered ? (
        <div className="step-nav">
          <button className="big-btn" onClick={() => choose(true)}>🚨 Scam</button>
          <button className="big-btn btn-ghost" onClick={() => choose(false)}>✅ Looks safe</button>
        </div>
      ) : (
        <>
          <p role="status" className={correct ? "scam-safe" : "scam-danger"}>
            {correct ? "Correct! Well spotted. " : "Not quite — good try. "}{item.why}
          </p>
          <p className="step-tip">What to do: {item.tip}</p>
          <div className="step-nav">
            <button className="big-btn" onClick={next}>
              {index + 1 === quiz.length ? "See my badge →" : "Next message →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
