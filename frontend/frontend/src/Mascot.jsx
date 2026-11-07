// Original Sahaj mascot: a warm round face with three moods.
// Hand-drawn style: ink outlines, marigold face, terracotta cheeks.
export default function Mascot({ mood = "happy", size = 96, label }) {
  const s = { width: size, height: size };
  const face = (
    <>
      <circle cx="60" cy="66" r="44" fill="#EBA937" stroke="#26211A" strokeWidth="4" />
      <circle cx="42" cy="76" r="7" fill="#B94E24" opacity="0.45" />
      <circle cx="78" cy="76" r="7" fill="#B94E24" opacity="0.45" />
      <line x1="60" y1="22" x2="60" y2="12" stroke="#26211A" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 2 l3.5 7 7.5 1 -5.5 5 1.5 7.5 -7 -3.5 -7 3.5 1.5 -7.5 -5.5 -5 7.5 -1 z" fill="#B94E24" stroke="#26211A" strokeWidth="2" />
    </>
  );

  if (mood === "thinking") {
    return (
      <svg viewBox="0 0 120 120" style={s} role="img" aria-label={label || "Sahaj thinking"}>
        <circle cx="96" cy="24" r="10" fill="#FFFDF6" stroke="#26211A" strokeWidth="3" />
        <text x="96" y="31" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#26211A">?</text>
        <circle cx="82" cy="38" r="4" fill="#FFFDF6" stroke="#26211A" strokeWidth="2" />
        {face}
        <circle cx="50" cy="60" r="5" fill="#26211A" />
        <circle cx="70" cy="60" r="5" fill="#26211A" />
        <path d="M48 80 L72 76" stroke="#26211A" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (mood === "celebrating") {
    return (
      <svg viewBox="0 0 120 120" style={s} role="img" aria-label={label || "Sahaj celebrating"}>
        <rect x="12" y="20" width="8" height="8" fill="#2E5D56" transform="rotate(20 16 24)" />
        <rect x="100" y="34" width="8" height="8" fill="#B94E24" transform="rotate(-15 104 38)" />
        <circle cx="16" cy="60" r="4" fill="#2E5D56" />
        <circle cx="104" cy="66" r="4" fill="#B94E24" />
        <path d="M60 26 L44 2 L76 2 Z" fill="#B94E24" stroke="#26211A" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="60" cy="6" r="4" fill="#FFFDF6" stroke="#26211A" strokeWidth="2" />
        {face}
        <circle cx="50" cy="60" r="5" fill="#26211A" />
        <circle cx="70" cy="60" r="5" fill="#26211A" />
        <ellipse cx="60" cy="78" rx="10" ry="8" fill="#26211A" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" style={s} role="img" aria-label={label || "Sahaj smiling"}>
      {face}
      <circle cx="50" cy="60" r="5" fill="#26211A" />
      <circle cx="70" cy="60" r="5" fill="#26211A" />
      <path d="M44 72 Q60 88 76 72" fill="none" stroke="#26211A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
