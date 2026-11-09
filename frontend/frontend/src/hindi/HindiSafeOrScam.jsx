import { Link } from "react-router-dom";
import ScamGame from "../ScamGame.jsx";
import ScamChecker from "../ScamChecker.jsx";
import HindiMascot from "./HindiMascot.jsx";

export default function HindiSafeOrScam() {
  return (
    <div className="learn hindi-scam-page">
      <p>
        <Link className="link-more" to="/hindi">
          ← मुख्य पेज पर वापस
        </Link>
      </p>

      <h1>सुरक्षित या ठगी?</h1>
      <p className="learn-sub">
        एक-एक मैसेज पढ़िए और सोचिए—यह असली है या ठगी? गलत जवाब देने पर भी
        कोई डाँट नहीं।
      </p>

      <section className="hindi-quiz-section" aria-label="ठगी पहचानने का अभ्यास">
        <div className="phone-mock" role="img" aria-label="नमूना फ़ोन स्क्रीन">
          <div className="phone-bar">
            <span>9:41</span>
            <span>📶 🔋</span>
          </div>
          <ScamGame />
        </div>
      </section>

      <section className="fun-block hindi-checker-card">
        <h2>असली मैसेज मिला है?</h2>
        <p>
          कोई मैसेज शक वाला लगे, तो उसे नीचे चिपकाइए। सहज उसे आसान भाषा
          में जाँचकर बताएगा कि क्या सावधान रहना चाहिए।
        </p>
        <ScamChecker />
      </section>

      <section className="fun-block hindi-reminder-card">
        <div className="hindi-card-heading">
          <HindiMascot variant="tiny" alt="" />
          <h2>तीन बातें हमेशा याद रखिए</h2>
        </div>
        <ul>
          <li>OTP, ATM PIN या पासवर्ड किसी को न बताइए—चाहे वह खुद को बैंक कहकर फ़ोन करे।</li>
          <li>जल्दी करने, डराने या इनाम का लालच देने वाले मैसेज पर भरोसा न कीजिए।</li>
          <li>पैसे भेजने से पहले किसी भरोसेमंद परिवार वाले से एक बार बात कीजिए।</li>
        </ul>
      </section>
    </div>
  );
}
