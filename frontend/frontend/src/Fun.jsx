import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { completeMission, loadMissions, loadCompleted, Confetti } from "./Progress.jsx";
import { useMode, say, tx } from "./copy.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function TaskHead({ n, icon, title }) {
  const mode = useMode();
  return (
    <>
      <span className="stamp">{tx(mode, "funTask")} {n}</span>
      <h2><span aria-hidden="true">{icon} </span>{title}</h2>
    </>
  );
}

function WordOfDay() {
  const [words, setWords] = useState([]);
  const mode = useMode();
  useEffect(() => {
    fetch(`${API}/api/words`).then((r) => r.json()).then(setWords).catch(() => {});
  }, []);
  if (words.length === 0) return null;
  const item = words[Math.floor(Date.now() / 86400000) % words.length];
  return (
    <article className="fun-block task-card task-a" id="word" aria-label={`${tx(mode, "wordOfDayPrefix")} ${item.word}`}>
      <TaskHead n="1" icon="📖" title={`${tx(mode, "wordOfDayPrefix")} ${item.word}`} />
      <p className="step-text">{item.meaning}</p>
    </article>
  );
}

function GenZWord() {
  const [words, setWords] = useState([]);
  const [used, setUsed] = useState(loadMissions().includes("m7"));
  const mode = useMode();
  useEffect(() => {
    fetch(`${API}/api/genz`).then((r) => r.json()).then(setWords).catch(() => {});
    function refresh() {
      setUsed(loadMissions().includes("m7"));
    }
    window.addEventListener("sahaj-missions", refresh);
    return () => window.removeEventListener("sahaj-missions", refresh);
  }, []);
  if (words.length === 0) return null;
  const item = words[Math.floor(Date.now() / 86400000) % words.length];
  return (
    <article className="fun-block task-card task-b" id="genz-word" aria-label={`${tx(mode, "genzWordTitle")} ${item.word}`}>
      <TaskHead n="2" icon="🤙" title={`${tx(mode, "genzWordTitle")} ${item.word}`} />
      <p className="step-text">{item.meaning}</p>
      <p className="step-tip">{tx(mode, "desiPrefix")} {item.desi}</p>
      <p>{tx(mode, "sayItLikePrefix")} “{item.example}”</p>
      {used ? (
        <p className="stamp">{say(mode, "certifiedCool")}</p>
      ) : (
        <button className="big-btn" onClick={() => { completeMission("m7"); setUsed(true); }}>
          {say(mode, "usedSentence")}
        </button>
      )}
    </article>
  );
}

function EmojiQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const mode = useMode();

  useEffect(() => {
    fetch(`${API}/api/emoji-quiz`).then((r) => r.json()).then(setQuiz).catch(() => {});
  }, []);

  if (quiz.length === 0) return <p>{say(mode, "loadingEmoji")}</p>;
  if (index >= quiz.length) {
    const great = score >= quiz.length - 2;
    const badgeKey =
      score === quiz.length
        ? "emojiPerfect"
        : great
          ? "emojiGood"
          : "emojiKeepGoing";
    return (
      <article className="fun-block task-card task-c" id="emoji" aria-label={tx(mode, "emojiGameOver")}>
        {great && <Confetti />}
        <TaskHead n="3" icon="😀" title={tx(mode, "emojiGameOver")} />
        <p className="step-count">{tx(mode, "scoreWord")}: {score} {tx(mode, "ofWord")} {quiz.length} {tx(mode, "gotRightSuffix")}</p>
        <p className="stamp">{say(mode, badgeKey)}</p>
        <div className="step-nav">
          <button className="big-btn" onClick={() => { setIndex(0); setScore(0); setPicked(null); }}>{say(mode, "playAgain")}</button>
        </div>
      </article>
    );
  }

  const item = quiz[index];
  const answered = picked !== null;
  return (
    <article className="fun-block task-card task-c" id="emoji" aria-label={tx(mode, "emojiMeanings")}>
      <TaskHead n="3" icon="😀" title={tx(mode, "emojiMeanings")} />
      <p className="step-count">{tx(mode, "questionWord")} {index + 1} {tx(mode, "ofWord")} {quiz.length} · {tx(mode, "scoreWord")}: {score}</p>
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
            {picked === item.answer ? say(mode, "correctWord") : say(mode, "goodTryWord")}{item.why}
          </p>
          <div className="step-nav">
            <button className="big-btn" onClick={() => { setIndex((x) => x + 1); setPicked(null); }}>
              {index + 1 === quiz.length ? say(mode, "seeBadge") : say(mode, "nextBtn")}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function ChatDecoder() {
  const [msg, setMsg] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const mode = useMode();

  async function decode() {
    if (!msg.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/decode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, mode }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "decode failed");
      setResult(data);
    } catch {
      setResult({ explanation: tx(mode, "decoderReading"), reply: "" });
    }
    setLoading(false);
  }

  return (
    <article className="fun-block task-card task-e" id="decode" aria-label={tx(mode, "decoderTitle")}>
      <TaskHead n="4" icon="🔤" title={tx(mode, "decoderTitle")} />
      <div className="scam-box">
        <label htmlFor="decode-input">{say(mode, "decoderSub")}</label>
        <textarea
          id="decode-input"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={tx(mode, "decoderPlaceholder")}
          rows={3}
        />
        <button className="big-btn" onClick={decode} disabled={loading || !msg.trim()}>
          {loading ? say(mode, "decoderReading") : say(mode, "decodeButton")}
        </button>
        {result?.explanation && (
          <p className="step-tip" style={{ whiteSpace: "pre-line" }}>{result.explanation}</p>
        )}
        {result?.reply && (
          <div className="fun-block">
            <p><strong>{tx(mode, "decoderReply")}</strong> “{result.reply}”</p>
            <a className="big-btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(result.reply)}`} target="_blank" rel="noreferrer">
              {say(mode, "decoderSend")}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function ShareScore() {
  const [guides, setGuides] = useState([]);
  const mode = useMode();
  useEffect(() => {
    fetch(`${API}/api/guides`).then((r) => r.json()).then(setGuides).catch(() => {});
  }, []);
  const doneGuides = loadCompleted().length;
  const totalGuides = guides.length;
  const text = `Namaste! I am learning with Sahaj. I finished ${doneGuides} of ${totalGuides} phone guides and I am collecting stars. Cheer for me! (sent from Sahaj)`;
  return (
    <article className="fun-block task-card task-d" id="share" aria-label={tx(mode, "tellFamily")}>
      <TaskHead n="5" icon="💬" title={tx(mode, "tellFamily")} />
      <p>{say(mode, "tellFamilyDesc")}</p>
      <a className="big-btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
        {say(mode, "shareStars")}
      </a>
    </article>
  );
}

export default function Fun() {
  const mode = useMode();
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">{tx(mode, "backLink")}</Link></p>
      <h1>{tx(mode, "funTitle")}</h1>
      <p className="learn-sub">{say(mode, "funSub")}</p>
      <nav className="fun-pick" aria-label={tx(mode, "funPick")}>
        <span className="fun-pick-label">{say(mode, "funPick")}</span>
        <a href="#word">📖 1</a>
        <a href="#genz-word">🤙 2</a>
        <a href="#emoji">😀 3</a>
        <a href="#decode">🔤 4</a>
        <a href="#share">💬 5</a>
      </nav>
      <WordOfDay />
      <GenZWord />
      <EmojiQuiz />
      <ChatDecoder />
      <ShareScore />
    </div>
  );
}
