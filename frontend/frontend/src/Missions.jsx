import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadMissions, loadStreak } from "./Progress.jsx";
import { useMode, say, tx, pick } from "./copy.jsx";
import { useLang, HI } from "./language.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function missionsUrl(lang) {
  return lang === "hi" ? `${API}/api/missions?lang=hi` : `${API}/api/missions`;
}

function useMissions() {
  const lang = useLang();
  const [missions, setMissions] = useState([]);
  const [done, setDone] = useState(loadMissions());
  const [streak, setStreak] = useState(loadStreak());

  useEffect(() => {
    fetch(missionsUrl(lang))
      .then(async (r) => {
        if (!r.ok) throw new Error("missions missing");
        const data = await r.json();
        setMissions(data.missions || data || []);
      })
      .catch(() => {});
    function refresh() {
      setDone(loadMissions());
      setStreak(loadStreak());
    }
    window.addEventListener("sahaj-missions", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sahaj-missions", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [lang]);

  return { missions, done, streak };
}

function startTarget(m, lang = "en") {
  const base = lang === "hi" ? "/hindi" : "";
  if (m.guide_id) return `${base}/learn?guide=${m.guide_id}`;
  if (m.id === "m6") return `${base}/safe-or-scam`;
  if (m.id === "m7") return `${base}/fun`;
  return `${base}/learn`;
}

// Small celebration shown on every page when a mission is completed.
export function MissionToast() {
  const [missions, setMissions] = useState([]);
  const [toast, setToast] = useState(null);
  const mode = useMode();
  const lang = useLang();

  useEffect(() => {
    fetch(missionsUrl(lang))
      .then(async (r) => {
        if (!r.ok) throw new Error("missions missing");
        const data = await r.json();
        setMissions(data.missions || data || []);
      })
      .catch(() => {});
    function onMission(e) {
      const id = e.detail && e.detail.missionId;
      if (id) setToast({ id });
    }
    window.addEventListener("sahaj-missions", onMission);
    return () => window.removeEventListener("sahaj-missions", onMission);
  }, [lang]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const m = missions.find((x) => x.id === toast.id);
  return (
    <div className="mission-toast" role="status">
      <span className="emoji-big" aria-hidden="true">{m ? m.emoji : "★"}</span>
      <div>
        <p><strong>{lang === "hi" ? HI.missionComplete : say(mode, "missionComplete")}</strong></p>
        {m ? (
          <p>{m.title} — <span className="stamp">🎁 {lang === "hi" ? m.reward : pick(m.reward, mode)}</span></p>
        ) : lang === "hi" ? (
          <p>अपना नया सितारा <Link to="/hindi/missions">मिशन पेज</Link> पर देखिए।</p>
        ) : (
          <p>Check your new sticker on the <Link to="/missions">Missions page</Link>.</p>
        )}
      </div>
      <button onClick={() => setToast(null)} aria-label={lang === "hi" ? HI.closeCelebration : tx(mode, "closeCelebration")}>✕</button>
    </div>
  );
}

// Hand-drawn mission sticker: ink-bordered badge, no emoji.
// Colour is picked from the mission id so each day looks a little different.
export function MissionSticker({ id = "m1", size = 84 }) {
  const lang = useLang();
  const palette = ["#EBA937", "#2E5D56", "#B94E24", "#FFFDF6"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  const bg = palette[hash % palette.length];
  const light = bg === "#FFFDF6" || bg === "#EBA937";
  return (
    <svg
      className="mission-sticker"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={lang === "hi" ? HI.missionStickerAria : "Today's mission sticker"}
    >
      <circle cx="48" cy="42" r="32" fill={bg} stroke="#26211A" strokeWidth="3" />
      <circle cx="48" cy="42" r="25" fill="none" stroke="#26211A" strokeWidth="2" strokeDasharray="5 4" />
      <path
        d="M48 24 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5 z"
        fill={light ? "#26211A" : "#FFFDF6"}
        stroke="#26211A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g transform="rotate(-3 48 78)">
        <rect x="22" y="68" width="52" height="18" rx="4" fill="#FFFDF6" stroke="#26211A" strokeWidth="2.5" />
        <text x="48" y="81.5" textAnchor="middle" fontSize="11" fontWeight="800" fill="#26211A" fontFamily="Verdana, sans-serif" letterSpacing="1.5">TODAY</text>
      </g>
    </svg>
  );
}

export function TodaysMission() {
  const { missions, done } = useMissions();
  const mode = useMode();
  const lang = useLang();
  if (missions.length === 0) return null;
  const item = missions[Math.floor(Date.now() / 86400000) % missions.length];
  const has = done.includes(item.id);
  const reward = lang === "hi" ? item.reward : pick(item.reward, mode);
  return (
    <div className="fun-block mission-today" aria-label={lang === "hi" ? HI.todayMissionAria : "Today's mission"}>
      <MissionSticker id={item.id} />
      <div className="mission-today-text">
        <h2>{lang === "hi" ? HI.todayMissionPrefix : tx(mode, "todayMissionPrefix")} {item.title}</h2>
        <p>{item.task}</p>
        <p>{has ? <span className="stamp">★ {lang === "hi" ? HI.certifiedCool : tx(mode, "certifiedCool")}: {reward}</span> : <span className="stamp">🎁 {reward}</span>}</p>
        <div className="learn-row">
          <Link className="big-btn" to={startTarget(item, lang)}>{has ? (lang === "hi" ? HI.playAgainMission : say(mode, "playAgainMission")) : (lang === "hi" ? HI.startMission : say(mode, "startMission"))}</Link>
          <Link className="big-btn btn-ghost" to={lang === "hi" ? "/hindi/missions" : "/missions"}>{lang === "hi" ? HI.allMissions : say(mode, "allMissions")}</Link>
        </div>
      </div>
    </div>
  );
}

export default function Missions() {
  const { missions, done, streak } = useMissions();
  const mode = useMode();
  const lang = useLang();
  return (
    <div className="learn">
      <p><Link className="link-more" to={lang === "hi" ? "/hindi" : "/"}>{lang === "hi" ? HI.backLink : tx(mode, "backLink")}</Link></p>
      <h1>{lang === "hi" ? HI.missionsTitle : tx(mode, "missionsTitle")}</h1>
      <p className="learn-sub">{lang === "hi" ? HI.missionsSub : say(mode, "missionsSub")}</p>
      <p className="stamp" aria-live="polite">🔥 {streak.count}{lang === "hi" ? HI.dayStreak : tx(mode, "dayStreak")} · {done.length} {lang === "hi" ? HI.ofWord : tx(mode, "ofWord")} {missions.length} {lang === "hi" ? HI.stickersWord : tx(mode, "stickersWord")}</p>
      {missions.map((m) => {
        const has = done.includes(m.id);
        const reward = lang === "hi" ? m.reward : pick(m.reward, mode);
        return (
          <div key={m.id} className={has ? "fun-block mission-done" : "fun-block mission-locked"}>
            <span className="emoji-big" aria-hidden="true">{has ? m.emoji : "🔒"}</span>
            <h2>{m.title}</h2>
            <p>{m.task}</p>
            <p>{has ? <span className="stamp">★ {reward}</span> : <span className="stamp">🎁 {reward}</span>}</p>
            <Link className="link-more" to={startTarget(m, lang)}>{has ? (lang === "hi" ? HI.playAgainMission : say(mode, "playAgainMission")) : (lang === "hi" ? HI.startMission : say(mode, "startMission"))}</Link>
          </div>
        );
      })}
    </div>
  );
}
