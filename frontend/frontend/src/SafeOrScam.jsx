import { Link } from "react-router-dom";
import ScamChecker from "./ScamChecker.jsx";
import ScamGame from "./ScamGame.jsx";
import { useMode, say, tx } from "./copy.jsx";

export default function SafeOrScam() {
  const mode = useMode();
  return (
    <div className="learn">
      <p><Link className="link-more" to="/">{tx(mode, "backLink")}</Link></p>
      <h1>{tx(mode, "safeOrScamTitle")}</h1>
      <p className="learn-sub">{say(mode, "safeOrScamSub")}</p>
      <div className="phone-mock" role="img" aria-label="Example phone screen">
        <div className="phone-bar"><span>9:41</span><span>📶 🔋</span></div>
        <ScamGame />
      </div>
      <div className="fun-block">
        <h2>{say(mode, "gotMessage")}</h2>
        <p>{say(mode, "gotMessageDesc")}</p>
        <ScamChecker />
      </div>
    </div>
  );
}
