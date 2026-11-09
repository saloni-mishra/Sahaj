import { useEffect, useMemo, useRef, useState } from "react";
import { completeMission, loadPayPass, markPayPass } from "./Progress.jsx";
import { recordScamRound } from "./scamRounds.js";
import { useMode, say, tx } from "./copy.jsx";
import { useLang, HI } from "./language.jsx";
import HindiMascot from "./hindi/HindiMascot.jsx";

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
  const lang = useLang();
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null); // true = said scam, false = said safe
  const [loadError, setLoadError] = useState("");
  const roundRecorded = useRef(false);

  const t = (key) => (lang === "hi" ? (HI[key] ?? key) : tx(mode, key));
  const praise = (key) => (lang === "hi" ? (HI[key] ?? key) : say(mode, key));

  useEffect(() => {
    const url = lang === "hi" ? `${API}/api/scam-quiz?lang=hi` : `${API}/api/scam-quiz`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error("quiz missing");
        const data = await r.json();
        setQuiz(shuffle(data)); // fresh order every round
      })
      .catch(() => setLoadError(lang === "hi" ? HI.scamLoadError : tx(mode, "scamLoadError")));
  }, [mode, lang]);

  useEffect(() => {
    if (index >= quiz.length && quiz.length > 0) {
      // Read the old flag before marking this round, so older saved progress
      // counts as at least one prior round.
      const hadPriorRound = !!loadPayPass()["scam-round"];
      completeMission("m6"); // Scam detective: finish one round
      markPayPass("scam-round"); // Sahaj Pay Pass stop
      // Count each finished round once, even if the effect runs again.
      if (!roundRecorded.current) {
        roundRecorded.current = true;
        recordScamRound(hadPriorRound ? 1 : 0);
      }
    } else {
      roundRecorded.current = false;
    }
  }, [index, quiz.length]);

  if (loadError) return <p role="alert">{loadError}</p>;
  if (quiz.length === 0) return <p>{praise("loadingGame")}</p>;

  // Finished: score + badge + what-to-do-in-real-life card.
  if (index >= quiz.length) {
    return (
      <div className="quiz-box">
        {lang === "hi" && (
          <HindiMascot
            variant="celebrate"
            className="hindi-quiz-mascot"
            alt="सहज बधाई दे रहा है"
          />
        )}
        <h3>{praise("gameOver")}</h3>
        <p className="step-count">{score} {t("ofWord")} {quiz.length} {t("gotRightSuffix")}</p>
        <p className="stamp">{praise(badgeKeyFor(score, quiz.length))}</p>
        <div className="help-card">
          <h4>🛡 {t("scamHelpTitle")}</h4>
          <p>{t("scamHelpText")}</p>
        </div>
        <div className="step-nav">
          <button className="big-btn" onClick={() => { setQuiz(shuffle(quiz)); setIndex(0); setScore(0); setPicked(null); }}>
            {praise("playAgain")}
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
      <h3>{praise("spotScam")}</h3>
      <p className="step-count">{t("messageWord")} {index + 1} {t("ofWord")} {quiz.length} · {t("scoreWord")}: {score}</p>
      <div className="progress" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={quiz.length} aria-label={`${t("messageWord")} ${index + 1} ${t("ofWord")} ${quiz.length}`}>
        <div className="progress-fill" style={{ width: `${((index + 1) / quiz.length) * 100}%` }} />
      </div>
      <ScreenMock item={item} answered={answered} />
      <p className="pretend-note">{t("pretendCaption")}</p>
      {!answered ? (
        <div className="step-nav">
          <button className="big-btn" onClick={() => choose(true)}>{t("isScam")}</button>
          <button className="big-btn btn-ghost" onClick={() => choose(false)}>{t("looksSafe")}</button>
        </div>
      ) : (
        <>
          <p
            role="status"
            className={`${correct ? "scam-safe" : "scam-danger"}${lang === "hi" ? " hindi-answer-feedback" : ""}`}
          >
            {lang === "hi" && correct && (
              <HindiMascot variant="tiny" alt="" className="hindi-feedback-mascot" />
            )}
            <span>
              {correct ? praise("correctFeedback") : t("goodTryFeedback")}
              {item.why}
            </span>
          </p>
          {showLegend && (
            <p className="legend">
              {(item.red_flags || []).length > 0 && <span className="legend-red">■ {t("flagRed")}</span>}
              {(item.safe_signs || []).length > 0 && <span className="legend-green">■ {t("flagGreen")}</span>}
            </p>
          )}
          <p className="step-tip">{t("whatToDo")} {item.tip}</p>
          <div className="step-nav">
            <button className="big-btn" onClick={next}>
              {index + 1 === quiz.length ? praise("seeBadge") : praise("nextMessage")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
