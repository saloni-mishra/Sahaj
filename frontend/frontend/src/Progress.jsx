import { useEffect, useState } from "react";
import { useMode, say, tx } from "./copy.jsx";
import { useLang, HI } from "./language.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const KEY = "sahaj-completed-guides";

export function loadCompleted() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveCompleted(guideId) {
  try {
    const list = loadCompleted();
    if (!list.includes(guideId)) {
      localStorage.setItem(KEY, JSON.stringify([...list, guideId]));
    }
    return true;
  } catch {
    return false; // private mode etc: progress just won't be saved
  }
}

const MISSION_KEY = "sahaj-missions";
const STREAK_KEY = "sahaj-streak";
const PAYPASS_KEY = "sahaj-pay-pass";

// Sahaj Pay Pass progress (Task 6 builds the certificate on this).
// Tracks loop stops: guide, pause-check, practice-pay, scam-round.
export function loadPayPass() {
  try {
    const raw = localStorage.getItem(PAYPASS_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function markPayPass(stop) {
  try {
    const data = loadPayPass();
    data[stop] = true;
    localStorage.setItem(PAYPASS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("sahaj-paypass"));
    return true;
  } catch {
    return false;
  }
}

export function loadMissions() {
  try {
    const raw = localStorage.getItem(MISSION_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function completeMission(missionId) {
  try {
    const list = loadMissions();
    if (!list.includes(missionId)) {
      localStorage.setItem(MISSION_KEY, JSON.stringify([...list, missionId]));
      touchStreak();
      window.dispatchEvent(
        new CustomEvent("sahaj-missions", { detail: { missionId } })
      );
    }
    return true;
  } catch {
    return false;
  }
}

// Streak: counts consecutive days with at least one mission done.
export function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data.count !== "number") return { count: 0, lastDay: null };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDay === today || data.lastDay === yesterday) return data;
    return { count: 0, lastDay: null }; // streak broken
  } catch {
    return { count: 0, lastDay: null };
  }
}

function touchStreak() {
  try {
    const today = new Date().toDateString();
    const prev = loadStreak();
    if (prev.lastDay === today) return prev;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const count = prev.lastDay === yesterday ? prev.count + 1 : 1;
    const next = { count, lastDay: today };
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return next;
  } catch {
    return { count: 0, lastDay: null };
  }
}

export function Confetti() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    left: (i * 41) % 100,
    delay: (i % 8) * 0.12,
    color: ["#EBA937", "#2E5D56", "#B94E24", "#21423D"][i % 4],
  }));
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, background: p.color }} />
      ))}
    </div>
  );
}

export function ProgressStrip() {
  const [guides, setGuides] = useState([]);
  const [done, setDone] = useState(loadCompleted());
  const mode = useMode();
  const lang = useLang();

  useEffect(() => {
    const url = lang === "hi" ? `${API}/api/guides?lang=hi` : `${API}/api/guides`;
    fetch(url).then((r) => r.json()).then(setGuides).catch(() => {});
    function refresh() {
      setDone(loadCompleted());
    }
    window.addEventListener("sahaj-progress", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sahaj-progress", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [lang]);

  if (guides.length === 0) return null;
  return (
    <div className="progress-strip" aria-label={lang === "hi" ? "मेरी प्रगति" : "My progress"}>
      <h2>{lang === "hi" ? HI.myProgress : say(mode, "myProgress")}</h2>
      <p className="activities-sub">
        {lang === "hi" ? (
          <>{done.length} {HI.ofWord} {guides.length} {HI.guidesWord} {HI.finishedWord}। {HI.collectAll}</>
        ) : (
          <>{done.length} {tx(mode, "ofWord")} {guides.length} {tx(mode, "guidesWord")} {tx(mode, "finishedWord")}. {say(mode, "collectAll")}</>
        )}
      </p>
      <ul className="stamp-row">
        {guides.map((g) => {
          const has = done.includes(g.id);
          return (
            <li key={g.id} className={has ? "stamp-done" : "stamp-todo"} title={g.title}>
              <span aria-hidden="true">{has ? "★" : "☆"}</span> {g.title}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TipOfDay() {
  const [tips, setTips] = useState([]);
  const mode = useMode();
  useEffect(() => {
    fetch(`${API}/api/tips`).then((r) => r.json()).then(setTips).catch(() => {});
  }, []);
  if (tips.length === 0) return null;
  const day = Math.floor(Date.now() / 86400000);
  const tip = tips[day % tips.length];
  return (
    <aside className="tip-card" aria-label="Tip of the day">
      <span className="card-num" aria-hidden="true">💡</span>
      <h2>{say(mode, "tipOfDay")}</h2>
      <p>{tip.text}</p>
    </aside>
  );
}
