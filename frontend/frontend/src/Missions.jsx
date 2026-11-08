import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadMissions, loadStreak } from "./Progress.jsx";
import { useMode, say, tx, pick } from "./copy.jsx";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function useMissions() {
  const [missions, setMissions] = useState([]);
  const [done, setDone] = useState(loadMissions());
  const [streak, setStreak] = useState(loadStreak());

  useEffect(() => {
    fetch(`${API}/api/missions`)
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
  }, []);

  return { missions, done, streak };
}

function startTarget(m) {
  if (m.guide_id) return `/learn?guide=${m.guide_id}`;
  if (m.id === "m6") return "/safe-or-scam";
  if (m.id === "m7") return "/fun";
  return "/learn";
}

// Small celebration shown on every page when a mission is completed.
export function MissionToast() {
  const [missions, setMissions] = useState([]);
  const [toast, setToast] = useState(null);
  const mode = useMode();

  useEffect(() => {
    fetch(`${API}/api/missions`)
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
  }, []);

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
        <p><strong>{say(mode, "missionComplete")}</strong></p>
        {m ? (
          <p>{m.title} — <span className="stamp">🎁 {pick(m.reward, mode)}</span></p>
        ) : (
          <p>Check your new sticker on the <Link to="/missions">Missions page</Link>.</p>
        )}
      </div>
      <button onClick={() => setToast(null)} aria-label={tx(mode, "closeCelebration")}>✕</button>
    </div>
  );
}

// Hand-drawn mission sticker: ink-bordered badge, no emoji.
// Colour is picked from the mission id so each day looks a little different.
export function MissionSticker({ id = "m1", size = 84 }) {
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
      aria-label="Today's mission sticker"
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
  if (missions.length === 0) return null;
  const item = missions[Math.floor(Date.now() / 86400000) % missions.length];
  const has = done.includes(item.id);
  return (
    <div className="fun-block mission-today" aria-label="Today's mission">
      <MissionSticker id={item.id} />
      <div className="mission-today-text">
        <h2>{tx(mode, "todayMissionPrefix")} {item.title}</h2>
        <p>{item.task}</p>
        <p>{has ? <span className="stamp">★ {tx(mode, "certifiedCool")}: {pick(item.reward, mode)}</span> : <span className="stamp">🎁 {pick(item.reward, mode)}</span>}</p>
        <div className="learn-row">
          <Link className="big-btn" to={startTarget(item)}>{has ? say(mode, "playAgainMission") : say(mode, "startMission")}</Link>
          <Link className="big-btn btn-ghost" to="/missions">{say(mode, "allMissions")}</Link>
        </div>
      </div>
    </div>
  );
}

export default function Missions() {
  const { missions, done, streak } = useMissions();
  const mode = useMode();
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">{tx(mode, "backLink")}</Link></p>
      <h1>{tx(mode, "missionsTitle")}</h1>
      <p className="learn-sub">{say(mode, "missionsSub")}</p>
      <p className="stamp" aria-live="polite">🔥 {streak.count}{tx(mode, "dayStreak")} · {done.length} {tx(mode, "ofWord")} {missions.length} {tx(mode, "stickersWord")}</p>
      {missions.map((m) => {
        const has = done.includes(m.id);
        return (
          <div key={m.id} className={has ? "fun-block mission-done" : "fun-block mission-locked"}>
            <span className="emoji-big" aria-hidden="true">{has ? m.emoji : "🔒"}</span>
            <h2>{m.title}</h2>
            <p>{m.task}</p>
            <p>{has ? <span className="stamp">★ {pick(m.reward, mode)}</span> : <span className="stamp">🎁 {pick(m.reward, mode)}</span>}</p>
            <Link className="link-more" to={startTarget(m)}>{has ? say(mode, "playAgainMission") : say(mode, "startMission")}</Link>
          </div>
        );
      })}
    </div>
  );
}
