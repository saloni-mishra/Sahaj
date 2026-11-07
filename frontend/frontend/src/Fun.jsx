import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function WordOfDay() {
  const [words, setWords] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/words`).then((r) => r.json()).then(setWords).catch(() => {});
  }, []);
  if (words.length === 0) return null;
  const item = words[Math.floor(Date.now() / 86400000) % words.length];
  return (
    <div className="fun-block">
      <span className="card-num" aria-hidden="true">📖</span>
      <h2>Word of the day: {item.word}</h2>
      <p className="step-text">{item.meaning}</p>
    </div>
  );
}

function EmojiQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/emoji-quiz`).then((r) => r.json()).then(setQuiz).catch(() => {});
  }, []);

  if (quiz.length === 0) return <p>Loading the emoji game…</p>;
  if (index >= quiz.length) {
    return (
      <div className="fun-block">
        <h2>Emoji game over!</h2>
        <p className="step-count">You got {score} out of {quiz.length} right.</p>
        <p className="stamp">{score === quiz.length ? "🏆 Emoji star!" : score >= quiz.length - 2 ? "🥈 Very good!" : "🌱 Nice trying — play again!"}</p>
        <div className="step-nav">
          <button className="big-btn" onClick={() => { setIndex(0); setScore(0); setPicked(null); }}>Play again</button>
        </div>
      </div>
    );
  }

  const item = quiz[index];
  const answered = picked !== null;
  return (
    <div className="fun-block">
      <h2>Emoji meanings</h2>
      <p className="step-count">Question {index + 1} of {quiz.length} · Score: {score}</p>
      <p className="emoji-big" aria-hidden="true">{item.emoji}</p>
      <p className="step-text">{item.question}</p>
      {!answered ? (
        <div className="learn-row">
          {item.options.map((opt, i) => (
            <button key={i} className="big-btn btn-ghost" onClick={() => { setPicked(i); if (i === item.answer) setScore((s) => s + 1); }}>{opt}</button>
          ))}
        </div>
      ) : (
        <>
          <p role="status" className={picked === item.answer ? "scam-safe" : "scam-danger"}>
            {picked === item.answer ? "Correct! " : "Good try — the answer is highlighted. "}{item.why}
          </p>
          <div className="step-nav">
            <button className="big-btn" onClick={() => { setIndex((x) => x + 1); setPicked(null); }}>
              {index + 1 === quiz.length ? "See my score →" : "Next →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Fun() {
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">← Back to Sahaj</Link></p>
      <h1>Fun</h1>
      <p className="learn-sub">Small games, no rush. Wrong answers are fine here.</p>
      <WordOfDay />
      <EmojiQuiz />
    </div>
  );
}
