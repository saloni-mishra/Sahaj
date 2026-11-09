import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { completeMission, loadCompleted, loadMissions, Confetti } from "../Progress.jsx";
import { HI } from "../language.jsx";
import HindiMascot from "./HindiMascot.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function WordOfDay() {
  const [words, setWords] = useState([]);
  const [learned, setLearned] = useState(loadMissions().includes("m7"));
  const [today] = useState(() => Math.floor(Date.now() / 86400000));

  useEffect(() => {
    fetch(`${API}/api/hindi-words`)
      .then((r) => r.json())
      .then(setWords)
      .catch(() => {});
    function refresh() {
      setLearned(loadMissions().includes("m7"));
    }
    window.addEventListener("sahaj-missions", refresh);
    return () => window.removeEventListener("sahaj-missions", refresh);
  }, []);

  if (words.length === 0) return null;
  const item = words[today % words.length];

  function markLearned() {
    completeMission("m7");
    setLearned(true);
  }

  return (
    <article className="fun-block task-card task-a" id="word" aria-label="आज की नई बात">
      <span className="stamp">आज की नई बात</span>
      <h2>
        <span aria-hidden="true">📖 </span>
        {item.word}
      </h2>
      <p className="step-text">{item.meaning}</p>
      <p className="step-tip">
        <strong>ऐसे इस्तेमाल कीजिए:</strong> {item.example}
      </p>
      {learned ? (
        <div className="hindi-activity-success">
          <HindiMascot variant="tiny" alt="" />
          <p className="stamp">★ बहुत बढ़िया—आज का नया शब्द याद हो गया!</p>
        </div>
      ) : (
        <button className="big-btn" onClick={markLearned}>
          हाँ, मैंने समझ लिया ✓
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

  useEffect(() => {
    fetch(`${API}/api/emoji-quiz?lang=hi`)
      .then((r) => r.json())
      .then(setQuiz)
      .catch(() => {});
  }, []);

  if (quiz.length === 0) return <p>{HI.loadingEmoji}</p>;

  if (index >= quiz.length) {
    const great = score >= quiz.length - 2;
    const badge =
      score === quiz.length
        ? HI.emojiPerfect
        : great
          ? HI.emojiGood
          : HI.emojiKeepGoing;
    return (
      <article className="fun-block task-card task-c" id="emoji" aria-label={HI.emojiGameOver}>
        {great && <Confetti />}
        <div className="hindi-quiz-complete">
          <HindiMascot variant="celebrate" alt="सहज खुश होकर बधाई दे रहा है" />
        </div>
        <span className="stamp">छोटा खेल</span>
        <h2>{HI.emojiGameOver}</h2>
        <p className="step-count">
          {HI.scoreWord}: {score} {HI.ofWord} {quiz.length} {HI.gotRightSuffix}
        </p>
        <p className="stamp">{badge}</p>
        <div className="step-nav">
          <button
            className="big-btn"
            onClick={() => {
              setIndex(0);
              setScore(0);
              setPicked(null);
            }}
          >
            {HI.playAgain}
          </button>
        </div>
      </article>
    );
  }

  const item = quiz[index];
  const answered = picked !== null;
  return (
    <article className="fun-block task-card task-c" id="emoji" aria-label="इमोजी का मतलब">
      <span className="stamp">
        {HI.questionWord} {index + 1} {HI.ofWord} {quiz.length} · {HI.scoreWord}: {score}
      </span>
      <h2>इमोजी का मतलब</h2>
      <p className="emoji-big" aria-hidden="true">{item.emoji}</p>
      <p className="step-text">{item.question}</p>
      {!answered ? (
        <div className="learn-row hindi-quiz-options">
          {item.options.map((option, i) => (
            <button
              key={i}
              className="big-btn btn-ghost"
              onClick={() => {
                setPicked(i);
                if (i === item.answer) setScore((s) => s + 1);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p
            role="status"
            className={`${picked === item.answer ? "scam-safe" : "scam-danger"}${picked === item.answer ? " hindi-answer-feedback" : ""}`}
          >
            {picked === item.answer && (
              <HindiMascot variant="tiny" alt="" className="hindi-feedback-mascot" />
            )}
            <span>
              {picked === item.answer ? HI.correctWord : HI.goodTryWord}
              {item.why}
            </span>
          </p>
          <div className="step-nav">
            <button
              className="big-btn"
              onClick={() => {
                setIndex((x) => x + 1);
                setPicked(null);
              }}
            >
              {index + 1 === quiz.length ? HI.seeBadge : HI.nextMessage}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function ShareProgress() {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/guides?lang=hi`)
      .then((r) => r.json())
      .then(setGuides)
      .catch(() => {});
  }, []);

  const done = loadCompleted().length;
  const text = `नमस्ते! हम सहज के साथ फ़ोन चलाना सीख रहे हैं। हमने ${guides.length} में से ${done} गाइड पूरी की हैं और सितारे इकट्ठा कर रहे हैं। हमारी हौसला बढ़ाइए! (सहज की ओर से)`;

  return (
    <article className="fun-block task-card task-d" id="share" aria-label="परिवार को बताइए">
      <span className="stamp">अपनों से बाँटिए</span>
      <h2>💬 परिवार को अपनी प्रगति बताइए</h2>
      <p>
        घर वालों को दिखाइए कि आपने कितना कुछ सीख लिया है। उनकी एक छोटी-सी
        शाबाशी भी बहुत अच्छी लगती है।
      </p>
      <a
        className="big-btn btn-ghost"
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp पर प्रगति भेजिए
      </a>
    </article>
  );
}

function SafetyGameLink() {
  return (
    <article className="fun-block task-card task-b" id="safety-game" aria-label="सुरक्षित रहने का खेल">
      <span className="stamp">सीखते-खेलते</span>
      <h2>🛡 सुरक्षित रहने का खेल</h2>
      <p>
        फ़र्जी मैसेज पहचानने का छोटा-सा खेल खेलिए। इससे आप ठगी को पहले ही
        भाँप सकेंगे।
      </p>
      <Link className="big-btn btn-ghost" to="/hindi/safe-or-scam">
        खेल शुरू कीजिए →
      </Link>
    </article>
  );
}

export default function HindiFun() {
  return (
    <div className="learn hindi-fun">
      <p>
        <Link className="link-more" to="/hindi">
          ← मुख्य पेज पर वापस
        </Link>
      </p>
      <h1>{HI.funTitle}</h1>
      <p className="learn-sub">{HI.funSub}</p>

      <nav className="fun-pick" aria-label="मनोरंजन चुनिए">
        <span className="fun-pick-label">क्या करना चाहेंगे?</span>
        <a href="#word">📖 नई बात</a>
        <a href="#safety-game">🛡 सुरक्षा</a>
        <a href="#emoji">😀 क्विज़</a>
        <a href="#share">💬 साझा</a>
      </nav>

      <WordOfDay />
      <SafetyGameLink />
      <EmojiQuiz />
      <ShareProgress />
    </div>
  );
}
