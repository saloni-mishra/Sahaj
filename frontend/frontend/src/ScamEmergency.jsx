import { Link } from "react-router-dom";

export default function ScamEmergency() {
  return (
    <div className="learn">
      <p>
        <Link className="link-more" to="/safe-or-scam">
          ← Back to Scam Shield
        </Link>
      </p>

      <h1>🛑 Think you've been scammed?</h1>
      <p className="learn-sub">
        Stay calm. You are not alone, and help is available. Take these steps
        one at a time.
      </p>

      {/* Step 1 */}
      <div className="fun-block">
        <h2>1. Stop and protect yourself right now</h2>
        <ul>
          <li><strong>Do not send any more money</strong>, no matter what the caller says.</li>
          <li><strong>Do not share any OTP</strong>, UPI PIN, or bank passwords.</li>
          <li><strong>Stop talking to the caller</strong> — hang up and block their number.</li>
          <li><strong>Do not tap any links</strong> or install any apps sent to you (e.g., AnyDesk, TeamViewer).</li>
        </ul>
      </div>

      {/* Step 2 */}
      <div className="fun-block">
        <h2>2. Lock your bank account or card</h2>
        <p>
          If money was deducted or you shared bank/card details, act immediately to stop further loss.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          <Link to="/secure-bank" className="big-btn">
            Follow steps to secure your bank account →
          </Link>
        </p>
      </div>

      {/* Step 3 */}
      <div className="fun-block">
        <h2>3. Report the fraud to the police helpline</h2>
        <p>
          In India, financial cyber fraud should be reported immediately so authorities can freeze the scammer's account:
        </p>
        <p style={{ margin: "1rem 0" }}>
          <a href="tel:1930" className="big-btn">
            📞 Tap to Call Helpline 1930
          </a>
        </p>
        <p>
          You also need to file an official written complaint online:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <Link to="/report-cyber-fraud" className="link-more">
            Step-by-step guide to report on cybercrime.gov.in →
          </Link>
        </p>
      </div>

      {/* Step 4 */}
      <div className="fun-block">
        <h2>4. Talk to someone you trust</h2>
        <p>
          Tell a trusted family member, neighbour, or friend right away. Fraudsters rely on isolation and hurry; having someone sit with you makes taking these calls and steps much easier.
        </p>
      </div>
<br></br>
      <p className="learn-sub">
        Important: Genuine bank staff and police officers will <strong>never</strong> ask for your PIN, passwords, or OTP to reverse transactions.
      </p>
    </div>
  );
}