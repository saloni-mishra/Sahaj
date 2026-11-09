const SCAM_ROUNDS_KEY = "sahaj-scam-rounds";

// A completed Safe or Scam round is a real activity. We keep a count so the
// Digital Confidence page can show "2 rounds finished" without inventing data.
export function loadScamRounds() {
  try {
    const raw = localStorage.getItem(SCAM_ROUNDS_KEY);
    const count = Number(raw);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch {
    return 0;
  }
}

export function recordScamRound(priorRounds = 0) {
  try {
    // priorRounds lets an older saved "scam-round" flag count as at least one.
    const next = Math.max(loadScamRounds(), priorRounds) + 1;
    localStorage.setItem(SCAM_ROUNDS_KEY, String(next));
    window.dispatchEvent(new Event("sahaj-scam-rounds"));
    return true;
  } catch {
    return false;
  }
}
