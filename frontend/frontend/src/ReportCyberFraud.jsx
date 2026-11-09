import { Link } from "react-router-dom";

export default function ReportCyberFraud() {
  return (
    <div className="learn">
      <p>
        <Link className="link-more" to="/scam-emergency">
          ← Back to Emergency Help
        </Link>
      </p>

      <h1>📝 Report Cyber Fraud Online</h1>
      <p className="learn-sub">
        Step-by-step instructions for lodging a complaint on the official
        National Cyber Crime Reporting Portal.
      </p>

      {/* Checklist */}
      <div className="fun-block">
        <h2>Before you start: Keep these ready</h2>
        <ul>
          <li><strong>Date and approximate time</strong> when the incident happened.</li>
          <li><strong>Bank or payment app name</strong> (e.g., SBI, HDFC, Google Pay, PhonePe).</li>
          <li><strong>12-digit Transaction ID or UTR number</strong> (found in your SMS or bank passbook/statement).</li>
          <li><strong>Exact amount</strong> debited in Rupees.</li>
          <li><strong>Photo ID</strong> (Aadhaar, Voter ID, or PAN) in JPG or PNG format (under 5 MB).</li>
          <li><strong>Evidence files</strong> (Screenshots of scam messages, receipts, or statement PDFs, under 10 MB each).</li>
        </ul>
        <p style={{ marginTop: "1rem" }}>
          <strong>Special instructions for writing your description:</strong><br />
          You will need to write at least <strong>200 characters</strong> explaining what happened. 
          Use simple words and <strong>avoid special characters</strong> like <code>#</code>, <code>$</code>, <code>@</code>, <code>^</code>, <code>*</code>, or <code>!</code>.
        </p>
      </div>

      {/* Step 1 */}
      <div className="fun-block">
        <h2>Step 1: Open the official government website</h2>
        <p>
          Only use the verified government portal. Click the button below:
        </p>
        <a
          href="https://www.cybercrime.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="big-btn"
        >
          Open cybercrime.gov.in ↗
        </a>
      </div>

      {/* Step 2 */}
      <div className="fun-block">
        <h2>Step 2: Choose the complaint option</h2>
        <p>
          1. Click on <strong>File a Complaint</strong> and click <strong>I Accept</strong> on the terms page.<br />
          2. Choose <strong>Financial Fraud</strong> (or <strong>Report Other Cybercrime</strong>).
        </p>
      </div>

      {/* Step 3 */}
      <div className="fun-block">
        <h2>Step 3: Register or log in</h2>
        <p>
          1. Select your State/UT, enter your name, and type your Indian mobile number.<br />
          2. Enter the One-Time Password (OTP) sent to your phone.<br />
          <em>Safety Tip: Never share this OTP with anyone over the phone.</em>
        </p>
      </div>

      {/* Step 4 */}
      <div className="fun-block">
        <h2>Step 4: Enter incident & payment details</h2>
        <p>
          1. Select the relevant category and enter when it happened.<br />
          2. Write your description (minimum 200 characters, no special symbols).<br />
          3. Enter your bank/wallet details and the 12-digit transaction ID.<br />
          4. Upload your ID proof and screenshots.
        </p>
      </div>

      {/* Step 5 */}
      <div className="fun-block">
        <h2>Step 5: Review and submit</h2>
        <p>
          Check the details carefully before submitting. Once submitted, you will receive an official <strong>Acknowledgement Number</strong> via SMS and email. Write this number down.
        </p>
      </div>

      {/* Step 6 */}
      <div className="fun-block">
        <h2>Step 6: Track your complaint status</h2>
        <p>
          Your complaint is forwarded to your State/UT police cyber cell. You can check the progress at any time:
        </p>
        <a
          href="https://www.cybercrime.gov.in/webform/chkackstatus.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="link-more"
        >
          Track Complaint Status ↗
        </a>
      </div>
 <br></br>
      <p className="learn-sub">
        Tip: Official government portal requirements can change over time. Always read the instructions shown directly on the official portal when filing.
      </p>
    </div>
  );
}