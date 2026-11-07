import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadMissions, loadStreak } from "./Progress.jsx";
import { withSlang } from "./copy.jsx";

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

export function TodaysMission() {
  const { missions, done } = useMissions();
  if (missions.length === 0) return null;
  const item = missions[Math.floor(Date.now() / 86400000) % missions.length];
  const has = done.includes(item.id);
  return (
    <div className="fun-block mission-today" aria-label="Today's mission">
      <span className="emoji-big" aria-hidden="true">{item.emoji}</span>
      <h2>Today's mission: {item.title}</h2>
      <p>{item.task}</p>
      <p>{has ? <span className="stamp">★ Collected: {withSlang(item.reward)}</span> : <span className="stamp">🎁 Reward: {withSlang(item.reward)}</span>}</p>
      <div className="learn-row">
        {item.guide_id && <Link className="big-btn" to="/learn">Do it in Learn →</Link>}
        {!item.guide_id && item.id === "m6" && <Link className="big-btn" to="/safe-or-scam">Play now →</Link>}
        {!item.guide_id && item.id === "m7" && <Link className="big-btn" to="/fun">Play now →</Link>}
        <Link className="big-btn btn-ghost" to="/missions">All missions →</Link>
      </div>
    </div>
  );
}

export default function Missions() {
  const { missions, done, streak } = useMissions();
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">← Back to Sahaj</Link></p>
      <h1>Missions</h1>
      <p className="learn-sub">Small real-world tasks. Do one, earn the sticker.</p>
      <p className="stamp" aria-live="polite">🔥 {streak.count}-day streak · {done.length} of {missions.length} stickers</p>
      {missions.map((m) => {
        const has = done.includes(m.id);
        return (
          <div key={m.id} className={has ? "fun-block mission-done" : "fun-block mission-locked"}>
            <span className="emoji-big" aria-hidden="true">{has ? m.emoji : "🔒"}</span>
            <h2>{m.title}</h2>
            <p>{m.task}</p>
            <p>{has ? <span className="stamp">★ {withSlang(m.reward)} — collected!</span> : <span className="stamp">🎁 {withSlang(m.reward)}</span>}</p>
            {!has && m.guide_id && <Link className="link-more" to="/learn">Open in Learn →</Link>}
            {!has && !m.guide_id && m.id === "m6" && <Link className="link-more" to="/safe-or-scam">Play in Safe or Scam? →</Link>}
            {!has && !m.guide_id && m.id === "m7" && <Link className="link-more" to="/fun">Play in Fun →</Link>}
          </div>
        );
      })}
    </div>
  );
}
