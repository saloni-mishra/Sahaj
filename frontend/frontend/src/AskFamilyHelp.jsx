import { useEffect, useId, useState } from "react";

// A small, editable WhatsApp message for a trusted family member.
// The phone number stays in this component's state only. Nothing is stored,
// and nothing is sent until the person taps the WhatsApp link themselves.
export default function AskFamilyHelp({
  guideTitle = "",
  stepNumber = null,
  lang = "en",
  compact = false,
  overlay = false,
}) {
  const isHi = lang === "hi";
  const uid = useId();
  const messageId = `family-message-${uid}`;
  const phoneId = `family-phone-${uid}`;
  const phoneHintId = `family-phone-hint-${uid}`;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [phone, setPhone] = useState("");

  const text = isHi
    ? {
        button: "🤝 परिवार से मदद लें",
        title: "परिवार से मदद लें",
        editHint: "आप संदेश बदल सकते हैं।",
        previewLabel: "संदेश की झलक",
        phoneLabel: "फ़ोन नंबर (ज़रूरी नहीं)",
        phoneHint: "देश कोड के साथ लिखिए, जैसे भारत के लिए 91।",
        phoneError: "कृपया देश कोड के साथ 10 से 15 अंक लिखिए।",
        open: "WhatsApp खोलें",
        cancel: "बंद कीजिए",
        close: "बंद कीजिए",
        note: "WhatsApp खुलेगा। संदेश आप भेजिए।",
        privacy: "कृपया OTP, PIN, पासवर्ड या भुगतान की जानकारी न लिखिए।",
      }
    : {
        button: "🤝 Ask Family for Help",
        title: "Ask Family for Help",
        editHint: "You can edit this message before sending.",
        previewLabel: "Message preview",
        phoneLabel: "Phone number (optional)",
        phoneHint: "Include the country code, for example 91 for India.",
        phoneError: "Please enter 10 to 15 digits with the country code.",
        open: "Open WhatsApp",
        cancel: "Cancel",
        close: "Close",
        note: "WhatsApp will open. You press send.",
        privacy: "Please do not add OTPs, PINs, passwords or payment details.",
      };

  function defaultMessage() {
    if (guideTitle && stepNumber) {
      if (isHi) {
        return `नमस्ते! मैं सहज का इस्तेमाल कर रहा हूँ और "${guideTitle}" के स्टेप ${stepNumber} पर थोड़ी दिक्कत आ रही है। जब आपको समय हो, क्या आप मदद कर सकते हैं?`;
      }
      return `Hi! I'm using Sahaj and got stuck on ${guideTitle}, step ${stepNumber}. Could you help me when you're free?`;
    }
    if (isHi) {
      return "नमस्ते! मैं सहज का इस्तेमाल कर रहा हूँ और थोड़ी दिक्कत आ रही है। जब आपको समय हो, क्या आप मदद कर सकते हैं?";
    }
    return "Hi! I'm using Sahaj and got stuck. Could you help me when you're free?";
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleOpen() {
    if (!open) setMessage(defaultMessage());
    setOpen((value) => !value);
  }

  const phoneOk = phone === "" || (phone.length >= 10 && phone.length <= 15);
  const href = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  const card = (
    <div
      className="family-card"
      role="dialog"
      aria-modal={overlay ? "true" : undefined}
      aria-label={text.title}
    >
      <div className="family-head">
        <h2>{text.title}</h2>
        <button
          type="button"
          className="chat-x"
          onClick={() => setOpen(false)}
          aria-label={text.close}
        >
          ✕
        </button>
      </div>

      <p className="activities-sub">{text.editHint}</p>

      <label className="ask-label" htmlFor={messageId}>
        {text.previewLabel}
      </label>
      <textarea
        id={messageId}
        className="family-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
      />

      <label className="ask-label" htmlFor={phoneId}>
        {text.phoneLabel}
      </label>
      <input
        id={phoneId}
        className="ask-input"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        maxLength={15}
        placeholder="e.g. 919876543210"
        value={phone}
        onChange={(event) =>
          setPhone(event.target.value.replace(/\D/g, "").slice(0, 15))
        }
        aria-describedby={phoneHintId}
      />
      <p id={phoneHintId} className="family-hint">
        {text.phoneHint}
      </p>
      {!phoneOk && (
        <p role="alert" className="learn-error">
          {text.phoneError}
        </p>
      )}

      <p className="family-note">📱 {text.note}</p>
      <p className="family-privacy">🔒 {text.privacy}</p>

      <div className="step-nav">
        {phoneOk ? (
          <a
            className="big-btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text.open}
          </a>
        ) : null}
        <button
          type="button"
          className="big-btn btn-ghost"
          onClick={() => setOpen(false)}
        >
          {text.cancel}
        </button>
      </div>
    </div>
  );

  return (
    <div className={overlay ? "family-wrap family-wrap-overlay" : "family-wrap"}>
      <button
        type="button"
        className={compact ? "big-btn btn-ghost family-btn compact" : "big-btn btn-ghost family-btn"}
        onClick={toggleOpen}
        aria-expanded={open}
      >
        {text.button}
      </button>

      {open &&
        (overlay ? (
          <div className="family-backdrop" onClick={() => setOpen(false)}>
            <div onClick={(event) => event.stopPropagation()}>{card}</div>
          </div>
        ) : (
          card
        ))}
    </div>
  );
}
