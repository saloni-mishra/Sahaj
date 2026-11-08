import { useEffect, useMemo, useState } from "react";
import { completeMission, markPayPass } from "./Progress.jsx";
import { useMode, say, tx } from "./copy.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function badgeKeyFor(score, total) {
  if (score === total) return "scamPerfect";
  if (score >= total - 2) return "scamGood";
  if (score >= Math.ceil(total / 2)) return "scamLearning";
  return "scamKeepGoing";
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// After answering: paint danger substrings red and safe substrings green,
// right on top of the message.
function FlagText({ text, red = [], green = [] }) {
  const marks = useMemo(() => {
    const all = [
      ...red.map((t) => ({ t, c: "flag-red" })),
      ...green.map((t) => ({ t, c: "flag-green" })),
    ]
      .filter((m) => m.t && text.includes(m.t))
      .sort((a, b) => b.t.length - a.t.length);
    if (all.length === 0) return null;
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return { re: new RegExp(`(${all.map((m) => esc(m.t)).join("|")})`, "g"), all };
  }, [text, red, green]);

  if (!marks) return <>{text}</>;
  const parts = text.split(marks.re);
  return (
    <>
      {parts.map((p, i) => {
        const hit = marks.all.find((m) => m.t === p);
        return hit ? <mark key={i} className={hit.c}>{p}</mark> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

function ScreenMock({ item, answered }) {
  const msg = answered ? (
    <FlagText text={item.message} red={item.red_flags} green={item.safe_signs} />
  ) : (
    item.message
  );
  const sender = item.sender || "Unknown";
  const initial = (sender || "U").trim().charAt(0).toUpperCase();

  if (item.channel === "whatsapp") {
    return (
      <div className="wa-screen" aria-label={`WhatsApp style message from ${sender}`}>
        <div className="screen-head">
          <span className="screen-avatar" aria-hidden="true">{initial}</span>
          <span className="screen-name">{sender}</span>
          <span className="screen-tag">WhatsApp</span>
        </div>
        <div className="bubble-in">“{msg}”<span className="bubble-time">10:02</span></div>
      </div>
    );
  }

  if (item.channel === "upi") {
    return (
      <div className="upi-screen" aria-label={`UPI style request from ${sender}`}>
        <div className="screen-head">
          <span className="screen-avatar" aria-hidden="true">₹</span>
          <span className="screen-name">{sender}</span>
          <span className="screen-tag">UPI</span>
        </div>
        <div className="upi-card">
          <p className="upi-note">“{msg}”</p>
          <div className="upi-btns" aria-hidden="true">
            <span className="upi-decline">Decline</span>
            <span className="upi-pay">Pay</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sms-screen" aria-label={`SMS style message from ${sender}`}>
      <div className="screen-head">
        <span className="screen-avatar" aria-hidden="true">{initial}</span>
        <span className="screen-name">{sender}</span>
        <span className="screen-tag">SMS</span>
      </div>
      <div className="bubble-sms">“{msg}”</div>
    </div>
  );
}

export default function ScamGame() {
  const mode = useMode();
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null); // true = said scam, false = said safe
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/scam-quiz`)
      .then(async (r) => {
        if (!r.ok) throw new Error("quiz missing");
        const data = await r.json();
        setQuiz(shuffle(data)); // fresh order every round
      })
      .catch(() => setLoadError(tx(mode, "scamLoadError")));
  }, [mode]);

  useEffect(() => {
    if (index >= quiz.length && quiz.length > 0) {
      completeMission("m6"); // Scam detective: finish one round
      markPayPass("scam-round"); // Sahaj Pay Pass stop
    }
  }, [index, quiz.length]);

  if (loadError) return <p role="alert">{loadError}</p>;
  if (quiz.length === 0) return <p>{say(mode, "loadingGame")}</p>;

  // Finished: score + badge + what-to-do-in-real-life card.
  if (index >= quiz.length) {
    return (
      <div className="quiz-box">
        <h3>{say(mode, "gameOver")}</h3>
        <p className="step-count">{score} {tx(mode, "ofWord")} {quiz.length} {tx(mode, "gotRightSuffix")}</p>
        <p className="stamp">{say(mode, badgeKeyFor(score, quiz.length))}</p>
        <div className="help-card">
          <h4>🛡 {tx(mode, "scamHelpTitle")}</h4>
          <p>{tx(mode, "scamHelpText")}</p>
        </div>
        <div className="step-nav">
          <button className="big-btn" onClick={() => { setQuiz(shuffle(quiz)); setIndex(0); setScore(0); setPicked(null); }}>
            {say(mode, "playAgain")}
          </button>
        </div>
      </div>
    );
  }

  const item = quiz[index];
  const answered = picked !== null;
  const correct = answered && picked === item.is_scam;
  const showLegend = answered && ((item.red_flags || []).length > 0 || (item.safe_signs || []).length > 0);

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
      <h3>{say(mode, "spotScam")}</h3>
      <p className="step-count">{tx(mode, "messageWord")} {index + 1} {tx(mode, "ofWord")} {quiz.length} · {tx(mode, "scoreWord")}: {score}</p>
      <div className="progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={quiz.length} aria-label={`${tx(mode, "messageWord")} ${index + 1} ${tx(mode, "ofWord")} ${quiz.length}`}>
        <div className="progress-fill" style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>
      <ScreenMock item={item} answered={answered} />
      <p className="pretend-note">{tx(mode, "pretendCaption")}</p>
      {!answered ? (
        <div className="step-nav">
          <button className="big-btn" onClick={() => choose(true)}>{tx(mode, "isScam")}</button>
          <button className="big-btn btn-ghost" onClick={() => choose(false)}>{tx(mode, "looksSafe")}</button>
        </div>
      ) : (
        <>
          <p role="status" className={correct ? "scam-safe" : "scam-danger"}>
            {correct ? say(mode, "correctFeedback") : tx(mode, "goodTryFeedback")}{item.why}
          </p>
          {showLegend && (
            <p className="legend">
              {(item.red_flags || []).length > 0 && <span className="legend-red">■ {tx(mode, "flagRed")}</span>}
              {(item.safe_signs || []).length > 0 && <span className="legend-green">■ {tx(mode, "flagGreen")}</span>}
            </p>
          )}
          <p className="step-tip">{tx(mode, "whatToDo")} {item.tip}</p>
          <div className="step-nav">
            <button className="big-btn" onClick={next}>
              {index + 1 === quiz.length ? say(mode, "seeBadge") : say(mode, "nextMessage")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
