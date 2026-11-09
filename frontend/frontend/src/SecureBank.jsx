import { Link } from "react-router-dom";

export default function SecureBank() {
  return (
    <div className="learn">
      <p>
        <Link className="link-more" to="/scam-emergency">
          ← Back to Emergency Help
        </Link>
      </p>

      <h1>🏦 Secure Your Bank Account</h1>
      <p className="learn-sub">
        If money was taken or your card details were exposed, notify your bank immediately to stop further withdrawals.
      </p>

      {/* Step 1 */}
      <div className="fun-block">
        <h2>Step 1: Contact your bank directly</h2>
        <p>
          <strong>Warning:</strong> Do not search for customer care numbers on Google (fake numbers often appear first). Instead, use:
        </p>
        <ul>
          <li>The phone number printed on the back of your ATM/debit card.</li>
          <li>Your official mobile banking app.</li>
          <li>A visit to your local bank branch in person.</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>What to say to the bank:</strong><br />
          <em>"I suspect an unauthorized transaction on my account. Please immediately freeze my cards and block digital banking access."</em>
        </p>
      </div>

      {/* Step 2 */}
      <div className="fun-block">
        <h2>Step 2: Tell the bank what to lock</h2>
        <ul>
          <li><strong>Block cards & UPI:</strong> Ask them to freeze the compromised debit/credit card or UPI handle.</li>
          <li><strong>Lock digital access:</strong> Temporarily suspend internet and mobile banking access.</li>
          <li><strong>Register an unauthorized transaction:</strong> Ask them to record a formal complaint against the debit.</li>
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>Password safety rule:</strong><br />
          If you need to change your PIN or password, do it only inside your bank's official app or at a physical ATM — never over the phone.
        </p>
      </div>

      {/* Step 3 */}
      <div className="fun-block">
        <h2>Step 3: Save your complaint reference number</h2>
        <p>
          By RBI rules, your bank must provide a complaint ticket number:
        </p>
        <ul>
          <li>Write down the <strong>Complaint Reference Number</strong> given by the bank representative.</li>
          <li>Save the SMS or email confirmation sent by your bank.</li>
          <li>Keep your transaction SMS showing the date, amount, and 12-digit reference/UTR number.</li>
        </ul>
      </div>

      {/* Step 4 */}
      <div className="fun-block">
        <h2>Step 4: Report to the national helpline</h2>
        <p>
          Once your account is safe, report the incident to the government's financial cybercrime team:
        </p>
        <p style={{ margin: "1rem 0" }}>
          <a href="tel:1930" className="big-btn">
            📞 Tap to Call 1930
          </a>
        </p>
        <p>
          <Link to="/report-cyber-fraud" className="link-more">
            File the full report online on cybercrime.gov.in →
          </Link>
        </p>
      </div>
<br></br>
      <p className="learn-sub">
        Note: Reporting promptly protects your rights under RBI rules and helps stop scammers, but it does not automatically guarantee a refund.
      </p>
    </div>
  );
}