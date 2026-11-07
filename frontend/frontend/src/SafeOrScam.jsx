import { Link } from "react-router-dom";
import ScamChecker from "./ScamChecker.jsx";
import ScamGame from "./ScamGame.jsx";

export default function SafeOrScam() {
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">← Back to Sahaj</Link></p>
      <h1>Safe or Scam?</h1>
      <p className="learn-sub">A detective game. Read each phone message, tap your answer, and learn the red flags. No rush — wrong answers are fine here.</p>
      <div className="phone-mock" role="img" aria-label="Example phone screen">
        <div className="phone-bar"><span>9:41</span><span>📶 🔋</span></div>
        <ScamGame />
      </div>
      <div className="fun-block">
        <h2>Got a real message?</h2>
        <p>Paste it below and Sahaj will check it for you.</p>
        <ScamChecker />
      </div>
    </div>
  );
}
