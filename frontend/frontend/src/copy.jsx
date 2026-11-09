import { useEffect, useState } from "react";

const MODE_KEY = "sahaj-mode";

// All Gen Z slang Sahaj ever uses, with plain meanings.
// Safety rule: slang NEVER appears in safety warnings or instructions.
export const SLANG = {
  "no cap": "no lie — for real",
  "you ate that": "you did great",
  "lowkey": "quietly, in a small way",
  "let me cook": "let me handle it — give me a moment",
  "let's gooo": "yay, let's celebrate",
};

export function getMode() {
  try {
    return localStorage.getItem(MODE_KEY) === "genz" ? "genz" : "normal";
  } catch {
    return "normal";
  }
}

export function setMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode === "genz" ? "genz" : "normal");
  } catch {
    // private mode: mode just won't stick
  }
  window.dispatchEvent(new Event("sahaj-mode"));
}

export function useMode() {
  const [mode, setM] = useState(getMode());
  useEffect(() => {
    function refresh() {
      setM(getMode());
    }
    window.addEventListener("sahaj-mode", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sahaj-mode", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return mode;
}

// Tap-to-understand slang: tiny button, expands its plain meaning.
export function Slang({ term }) {
  const [open, setOpen] = useState(false);
  const key = term.toLowerCase();
  const meaning = SLANG[key] || "a playful compliment";
  return (
    <button
      type="button"
      className="slang"
      aria-expanded={open}
      title={meaning}
      onClick={() => setOpen((o) => !o)}
    >
      {term}
      {open && <span className="slang-meaning"> = {meaning}</span>}
    </button>
  );
}

// Wrap known slang terms inside a plain string with tap-to-understand.
export function withSlang(text) {
  if (!text) return text;
  const terms = Object.keys(SLANG).sort((a, b) => b.length - a.length);
  const lower = text.toLowerCase();
  let firstAt = -1;
  let firstTerm = null;
  for (const t of terms) {
    const at = lower.indexOf(t);
    if (at !== -1 && (firstAt === -1 || at < firstAt)) {
      firstAt = at;
      firstTerm = t;
    }
  }
  if (!firstTerm) return text;
  const actual = text.slice(firstAt, firstAt + firstTerm.length);
  return (
    <>
      {text.slice(0, firstAt)}
      <Slang term={actual} />
      {withSlang(text.slice(firstAt + firstTerm.length))}
    </>
  );
}

// Two full dictionaries: every UI string lives here, keyed the same.
// Normal is fully plain (no slang). Gen-Z is clearly playful; slang only
// in reactions/cheers, rendered with tap-to-reveal via say().
const normal = {
  loopStop2: "Stop 2 of 4 · Pause & Check",
  decoderTitle: "Group-chat decoder",
  decoderSub: "Paste a family group message. Sahaj explains the tricky words and suggests one short reply.",
  decoderPlaceholder: "Paste a family group message here…",
  decodeButton: "Decode it",
  decoderReading: "Reading the message…",
  decoderReply: "You can reply:",
  decoderSend: "Send reply on WhatsApp",
  paypassTitle: "Sahaj Pay Pass",
  paypassSub: "Learn, check, pay, prove — collect all 4 stops to earn your certificate.",
  stopLearn: "Learn",
  stopCheck: "Pause & Check",
  stopPay: "Practice Pay",
  stopProve: "Prove it",
  certTitle: "Certified Safe Payer",
  yourName: "Your first name",
  namePlaceholder: "e.g. Meena",
  downloadCert: "Download certificate",
  shareCert: "Share on WhatsApp",
  certLocked: "Finish all 4 stops to unlock your certificate.",
  certSub: "You did all 4 stops. This certificate is yours!",
  funPick: "Pick a fun task:",
  funTask: "Task",
  scamHelpTitle: "If this happens to you",
  scamHelpText: "Call 1930 (cyber fraud helpline) or visit cybercrime.gov.in. Also tell a family member right away.",
  flagRed: "Red = danger sign",
  flagGreen: "Green = safe sign",
  pretendCaption: "Pretend screen — answer with the buttons below.",
  showSahaj: "📷 Show Sahaj",
  photoLabel: "📷 Photo",
  notSure: "Not sure? Show Sahaj",
  photoSent: "I sent a photo of my screen.",
  photoTooBig: "That photo is too big. Please pick a smaller one.",
  photoError: "Sorry, I could not read that photo. Please try again.",
  photoReading: "Looking at your photo…",
  loopStop4: "Stop 4 of 4 · Prove it",
  receiptTitle: "Your receipt, in plain words",
  receiptAmount: "Amount:",
  receiptOrder: "Order id:",
  receiptStatus: "Status:",
  receiptTestMoney: "This was test money. No real money moved.",
  flowYou: "You",
  flowPayPal: "PayPal",
  flowSeller: "Seller",
  readingReceipt: "Reading your receipt…",
  holdUpTitle: "Hold up — check first!",
  holdUpSub: "Before any payment, tap each check. The Pay button wakes up only when all 5 are green.",
  scenarioQ: "Which practice payment?",
  requestTo: "To:",
  requestAmount: "Amount:",
  testMoneyWord: "Test money",
  check1: "Right person? I know who gets this money.",
  check2: "Right amount? It matches what I expected.",
  check3: "No rush? Nobody is hurrying or scaring me.",
  check4: "No OTP/PIN? Nobody asked for my OTP or PIN.",
  check5: "My plan? This is what I wanted to pay for.",
  payNow: "Pay now",
  walkAway: "🚶 Walk away",
  walkAwayWin: "Smart move! Walking away is also winning.",
  walkAwaySub: "That request had red flags: unknown sender, rushing, and an OTP ask. You kept your money safe.",
  payLocked: "Tick all 5 checks to wake up Pay.",
  cantTick: "Can't honestly tick them all? Walk away — that is the right answer.",
  backToScenarios: "← Back to payments",
  trapName: "Festival lottery win",
  trapTo: "Unknown lottery agent",
  trapStory: "Says you won $50! Wants your OTP to release it. Rushing you.",
  brandTagline: "THE GRANDKID YOU CAN ALWAYS ASK",
  heroTitle: "Technology, made simple.",
  heroSub: "A little help with your phone, whenever you need it. Learn new things, practise safely, and have fun along the way.",
  startLearning: "Start learning",
  tryPractice: "Try practice",
  helperTitle: "A patient helper",
  helper1: "Big letters, big buttons",
  helper2: "One step at a time, with pictures",
  helper3: "Practice with test money first",
  activitiesTitle: "What would you like to do today?",
  activitiesSub: "Four doors, pick one. No rush — Sahaj waits for you.",
  learnCardTitle: "Learn",
  learnCardDesc: "Get simple, step-by-step help with your phone.",
  learnCardLink: "Start learning →",
  practiceCardTitle: "Practice",
  practiceCardDesc: "Try a pretend payment with test money.",
  sandboxNote: "Practice Mode: uses PayPal Sandbox test money — no real money is used.",
  practiceButton: "Try a practice payment",
  openingPayPal: "Opening PayPal…",
  safeCardTitle: "Safe or Scam?",
  safeCardDesc: "Play detective. Spot scam messages before they spot you.",
  safeCardLink: "Play detective →",
  funCardTitle: "Fun",
  funCardDesc: "Explore words, emojis, and little activities.",
  funCardLink: "Play and learn →",
  footerNote: "Never feel left behind by your phone.",
  backLink: "← Back to Sahaj",
  backButton: "Back to Sahaj",
  learnTitle: "Learn",
  learnSub: "Pick your device, then pick what to learn.",
  deviceQ: "1. Phone or laptop?",
  brandQ: "2. Which one is yours?",
  guideQ: "3. What do you want to do?",
  phone: "Phone",
  laptop: "Laptop",
  stepWord: "Step",
  ofWord: "of",
  guideLabel: "GUIDE",
  readAloud: "🔊 Read this to me",
  stopReading: "⏹ Stop",
  tipLabel: "Tip:",
  explainSimply: "Explain this step simply",
  thinking: "Thinking…",
  checking: "Checking…",
  checkingPaymentTitle: "Checking your practice payment…",
  checkingPaymentSub: "Please wait a moment.",
  practiceDoneTitle: "Well done!",
  practiceDoneSub: "You finished a practice payment. No real money was used.",
  practiceErrorTitle: "That did not work",
  practiceErrorSub: "No real money was used. This was practice mode.",
  cancelTitle: "No problem, you stopped the payment.",
  cancelSub: "Nothing was charged. This was practice mode, so you can try again any time.",
  noPaymentFound: "No payment was found in this link.",
  startError: "Could not start the practice.",
  finished: "Guide finished — well done!",
  finishButton: "I finished this guide",
  youDidIt: "You did it!",
  nextGuidePrefix: "Next Guide:",
  whatsappHelp: "💬 Ask family on WhatsApp",
  backBtn: "← Back",
  nextBtn: "Next →",
  seeBadge: "See my badge →",
  nextMessage: "Next message →",
  playAgain: "Play again",
  gameOver: "Game over!",
  spotScam: "🎯 Spot the Scam",
  messageWord: "Message",
  scoreWord: "Score",
  correctFeedback: "Correct! Well spotted. ",
  goodTryFeedback: "Not quite — good try. ",
  whatToDo: "What to do:",
  scamPerfect: "🏆 Top Scam-spotter! Perfect score.",
  scamGood: "🥈 Silver Scam-spotter! Very careful.",
  scamLearning: "🥉 Learning fast — keep it up!",
  scamKeepGoing: "🌱 Keep practicing — scammers trick everyone at first.",
  emojiPerfect: "🏆 Emoji star!",
  emojiGood: "🥈 Very good!",
  emojiKeepGoing: "🌱 Nice trying — play again!",
  loadingGame: "Loading the game…",
  loadingEmoji: "Loading the emoji game…",
  checkerError: "Sorry, the checker is not working right now.",
  explainError: "Sorry, I couldn't explain this right now. Please follow the instructions shown on screen.",
  answerError: "Sorry, I couldn't answer just now. Please try again.",
  askHint: "Ask me anything about your phone. I answer in small, simple steps.",
  askPlaceholder: "e.g. How do I make text bigger?",
  askBubble: "Stuck? Ask me!",
  askButton: "Ask",
  askTitle: "Ask Sahaj",
  askLabel: "Your question",
  dismiss: "Dismiss",
  closeChat: "Close chat",
  openChat: "Open Ask Sahaj chat",
  closeAskChat: "Close Ask Sahaj chat",
  voiceAsk: "🎙 Speak",
  listeningLabel: "🎙 Listening…",
  myProgress: "⭐ My progress",
  collectAll: "Collect them all!",
  tipOfDay: "Tip of the day",
  missionComplete: "Mission complete!",
  todayMissionPrefix: "Today's mission:",
  startMission: "Start Mission →",
  playAgainMission: "Play again →",
  allMissions: "All missions →",
  missionsTitle: "Missions",
  missionsSub: "Small real-world tasks. Do one, earn the sticker.",
  funTitle: "Fun",
  funSub: "Small games, no rush. Wrong answers are fine here.",
  wordOfDayPrefix: "Word of the day:",
  genzWordTitle: "Gen-Z word:",
  desiPrefix: "Desi style:",
  sayItLikePrefix: "Say it like this:",
  usedSentence: "I used it in a sentence ✓",
  certifiedCool: "★ Certified Cool — collected!",
  emojiMeanings: "Emoji meanings",
  questionWord: "Question",
  emojiGameOver: "Emoji game over!",
  gotRightSuffix: "right.",
  tellFamily: "Tell your family",
  tellFamilyDesc: "Show them your stars. A little cheer goes a long way.",
  shareStars: "Share my stars on WhatsApp",
  safeOrScamTitle: "Safe or Scam?",
  safeOrScamSub: "A detective game. Read each phone message, tap your answer, and learn the red flags. No rush — wrong answers are fine here.",
  gotMessage: "Got a real message?",
  gotMessageDesc: "Paste it below and Sahaj will check it for you.",
  scamCheckerLabel: "Scam checker: paste a message you received.",
  pastePlaceholder: "Paste the message here…",
  checkMessage: "Check this message",
  scamLoadError: "The game could not load right now.",
  playDetective: "Play detective →",
  looksSafe: "✅ Looks safe",
  isScam: "🚨 Scam",
  openGuidePrefix: "Open guide:",
  sahajSays: "Sahaj says:",
  closeCelebration: "Close celebration",
  correctWord: "Correct! ",
  goodTryWord: "Good try — the answer is highlighted. ",
  modeNormal: "Normal",
  modeGenz: "Gen-Z",
  navHome: "Home",
  navLearn: "Learn",
  navStars: "Stars",
  navSafe: "Safe?",
  navFun: "Fun",
  navMissions: "Missions",
  navSafeLong: "Safe or Scam?",
  navPractice: "Practice",
  navConfidence: "My Confidence",
  confidenceLink: "See my Digital Confidence →",
  screenshotHelpLink: "📷 Show Sahaj a screenshot →",
  guidesWord: "guides",
  finishedWord: "finished",
  stickersWord: "stickers",
  dayStreak: "-day streak",
};

const genz = {
  loopStop2: "Stop 2 of 4 · Pause & Check 👀",
  decoderTitle: "Group-chat decoder 🔤",
  decoderSub: "Paste a group message — Sahaj decodes it and writes your reply ✨",
  decoderPlaceholder: "Paste a family group message here…",
  decodeButton: "Decode it",
  decoderReading: "Reading it, let me cook…",
  decoderReply: "You can reply:",
  decoderSend: "Send reply on WhatsApp",
  paypassTitle: "Sahaj Pay Pass ✨",
  paypassSub: "Learn, check, pay, prove — all 4 stops for your certificate.",
  stopLearn: "Learn",
  stopCheck: "Pause & Check",
  stopPay: "Practice Pay",
  stopProve: "Prove it",
  certTitle: "Certified Safe Payer 🎉",
  yourName: "Your first name",
  namePlaceholder: "e.g. Meena",
  downloadCert: "Download certificate",
  shareCert: "Share on WhatsApp",
  certLocked: "Finish all 4 stops to unlock your certificate ✨",
  certSub: "All 4 stops done — you ate that! This certificate is yours 🎉",
  funPick: "Pick a fun task ✨",
  funTask: "Task",
  scamHelpTitle: "If this happens to you",
  scamHelpText: "Call 1930 (cyber fraud helpline) or visit cybercrime.gov.in. Also tell a family member right away.",
  flagRed: "Red = danger sign",
  flagGreen: "Green = safe sign",
  pretendCaption: "Pretend screen — answer with the buttons below.",
  showSahaj: "📷 Show Sahaj",
  photoLabel: "📷 Photo",
  notSure: "Not sure? Show Sahaj 👀",
  photoSent: "I sent a photo of my screen.",
  photoTooBig: "That photo is too big — pick a smaller one.",
  photoError: "Hmm, let me cook — I could not read it. Try again.",
  photoReading: "Looking at it, let me cook…",
  loopStop4: "Stop 4 of 4 · Prove it ✨",
  receiptTitle: "Your receipt, in plain words ✨",
  receiptAmount: "Amount:",
  receiptOrder: "Order id:",
  receiptStatus: "Status:",
  receiptTestMoney: "Test money only — no real money moved 👀",
  flowYou: "You",
  flowPayPal: "PayPal",
  flowSeller: "Seller",
  readingReceipt: "Reading your receipt, let me cook…",
  holdUpTitle: "Hold up! Check first 👀",
  holdUpSub: "Before any payment, tap each check. Pay wakes up only when all 5 are green ✨",
  scenarioQ: "Which practice payment? You pick ✨",
  requestTo: "To:",
  requestAmount: "Amount:",
  testMoneyWord: "Test money",
  check1: "Right person? I know who gets this money.",
  check2: "Right amount? It matches what I expected.",
  check3: "No rush? Nobody is hurrying or scaring me.",
  check4: "No OTP/PIN? Nobody asked for my OTP or PIN.",
  check5: "My plan? This is what I wanted to pay for.",
  payNow: "Pay now",
  walkAway: "🚶 Walk away",
  walkAwayWin: "Smart move — you ate that! Walking away is winning 🎉",
  walkAwaySub: "Red flags everywhere: unknown sender, rushing, OTP ask. You kept your money safe 👀",
  payLocked: "Tick all 5 — Pay wakes up when all are green ✨",
  cantTick: "Can't honestly tick them all? Walk away — that is the right answer.",
  backToScenarios: "← Back to payments",
  trapName: "Festival lottery win",
  trapTo: "Unknown lottery agent",
  trapStory: "Says you won $50! Wants your OTP to release it. Rushing you.",
  brandTagline: "YOUR TECH GRANDKID, ON CALL",
  heroTitle: "Phones, but make it easy.",
  heroSub: "Your personal tech grandchild. We keep it simple and safe — no cap.",
  startLearning: "Start learning ✨",
  tryPractice: "Try practice 👀",
  helperTitle: "Your patient backup 💪",
  helper1: "Big letters, big buttons",
  helper2: "One step at a time, with pictures",
  helper3: "Practice with test money first",
  activitiesTitle: "What are we doing today? ✨",
  activitiesSub: "Four doors, pick one. Sahaj waits for you — no rush.",
  learnCardTitle: "Learn",
  learnCardDesc: "Phone help in tiny steps, with pictures.",
  learnCardLink: "Start learning →",
  practiceCardTitle: "Practice",
  practiceCardDesc: "Try a pretend payment with test money.",
  sandboxNote: "Practice Mode: PayPal Sandbox test money only — no real money.",
  practiceButton: "Try a practice payment",
  openingPayPal: "Opening PayPal…",
  safeCardTitle: "Safe or Scam?",
  safeCardDesc: "Play detective. Spot the tricky messages.",
  safeCardLink: "Play detective →",
  funCardTitle: "Fun",
  funCardDesc: "Words, emojis, little wins 🎉",
  funCardLink: "Play and learn →",
  footerNote: "Never feel left behind by your phone.",
  backLink: "← Back to Sahaj",
  backButton: "Back to Sahaj",
  learnTitle: "Learn",
  learnSub: "Pick your device, then pick your mission ✨",
  deviceQ: "1. Phone or laptop? You pick.",
  brandQ: "2. Which one is yours?",
  guideQ: "3. What do you want to do?",
  phone: "Phone",
  laptop: "Laptop",
  stepWord: "Step",
  ofWord: "of",
  guideLabel: "GUIDE",
  readAloud: "🔊 Read this to me",
  stopReading: "⏹ Stop",
  tipLabel: "Tip:",
  explainSimply: "Explain this simply ✨",
  thinking: "Let me cook…",
  checking: "Checking… one sec",
  checkingPaymentTitle: "Checking your practice payment…",
  checkingPaymentSub: "One sec — test money only.",
  practiceDoneTitle: "You ate that!",
  practiceDoneSub: "Practice payment done — no real money used. Let's gooo! 🎉",
  practiceErrorTitle: "That did not work",
  practiceErrorSub: "No stress — no real money was used. Try again.",
  cancelTitle: "All good, you walked away.",
  cancelSub: "Nothing was charged, test mode only. Try again whenever you like.",
  noPaymentFound: "No payment was found in this link.",
  startError: "Practice could not start. Please try again.",
  finished: "Guide finished — you ate that!",
  finishButton: "I finished this guide 🎉",
  youDidIt: "You ate that! 🎉",
  nextGuidePrefix: "Next up:",
  whatsappHelp: "💬 Ask family on WhatsApp",
  backBtn: "← Back",
  nextBtn: "Next →",
  seeBadge: "See my badge →",
  nextMessage: "Next message →",
  playAgain: "Play again",
  gameOver: "Game over — you ate that! 🎉",
  spotScam: "🎯 Spot the Scam",
  messageWord: "Message",
  scoreWord: "Score",
  correctFeedback: "You ate that! Well spotted. ",
  goodTryFeedback: "Not quite — good try. ",
  whatToDo: "What to do:",
  scamPerfect: "🏆 Top Scam-spotter! Perfect score, no cap.",
  scamGood: "🥈 Silver Scam-spotter! You ate that.",
  scamLearning: "🥉 Learning fast — let's gooo!",
  scamKeepGoing: "🌱 Keep practicing — scammers trick everyone at first.",
  emojiPerfect: "🏆 Emoji star — you ate that!",
  emojiGood: "🥈 Very good, let's gooo!",
  emojiKeepGoing: "🌱 Nice trying — play again!",
  loadingGame: "Loading the game, let me cook…",
  loadingEmoji: "Loading the emoji game… ✨",
  checkerError: "The checker is napping. Try again in a bit.",
  explainError: "That did not load. Please follow the steps on the screen.",
  answerError: "Hmm, let me cook — I blanked. Try again.",
  askHint: "Ask me anything about your phone. Small steps, no stress — just ask.",
  askPlaceholder: "e.g. How do I make text bigger?",
  askBubble: "Stuck? Ask me! 👀",
  askButton: "Ask",
  askTitle: "Ask Sahaj",
  askLabel: "Your question",
  dismiss: "Dismiss",
  closeChat: "Close chat",
  openChat: "Open Ask Sahaj chat",
  closeAskChat: "Close Ask Sahaj chat",
  voiceAsk: "🎙 Speak",
  listeningLabel: "🎙 Listening…",
  myProgress: "⭐ My progress",
  collectAll: "Collect them all!",
  tipOfDay: "Tip of the day 💡",
  missionComplete: "Mission complete — let's gooo! 🎉",
  todayMissionPrefix: "Today's mission ✨",
  startMission: "Start Mission →",
  playAgainMission: "Play again →",
  allMissions: "All missions →",
  missionsTitle: "Missions",
  missionsSub: "Tiny tasks, big wins. One sticker at a time.",
  funTitle: "Fun",
  funSub: "Small games, no rush. Wrong answers are fine here.",
  wordOfDayPrefix: "Word of the day:",
  genzWordTitle: "Gen-Z word 👀",
  desiPrefix: "Desi style:",
  sayItLikePrefix: "Say it like this:",
  usedSentence: "I used it in a sentence ✓",
  certifiedCool: "★ Certified Cool — collected!",
  emojiMeanings: "Emoji meanings ✨",
  questionWord: "Question",
  emojiGameOver: "Emoji game over! 🎉",
  gotRightSuffix: "right.",
  tellFamily: "Tell your family",
  tellFamilyDesc: "Show them your stars. A little cheer goes a long way.",
  shareStars: "Share my stars on WhatsApp",
  safeOrScamTitle: "Safe or Scam?",
  safeOrScamSub: "Detective mode — read each message, tap your answer. No rush.",
  gotMessage: "Got a real message?",
  gotMessageDesc: "Paste it below and Sahaj will check it for you.",
  scamCheckerLabel: "Scam checker: paste a message you received.",
  pastePlaceholder: "Paste the message here…",
  checkMessage: "Check this message",
  scamLoadError: "The game did not load. Please try again.",
  playDetective: "Play detective →",
  looksSafe: "✅ Looks safe",
  isScam: "🚨 Scam",
  openGuidePrefix: "Open guide:",
  sahajSays: "Sahaj says:",
  closeCelebration: "Close celebration",
  correctWord: "You ate that! ",
  goodTryWord: "Good try — answer highlighted. ",
  modeNormal: "Normal",
  modeGenz: "Gen-Z",
  navHome: "Home",
  navLearn: "Learn",
  navStars: "Stars",
  navSafe: "Safe?",
  navFun: "Fun",
  navMissions: "Missions",
  navSafeLong: "Safe or Scam?",
  navPractice: "Practice",
  navConfidence: "My Confidence",
  confidenceLink: "See my Digital Confidence →",
  screenshotHelpLink: "📷 Show Sahaj a screenshot →",
  guidesWord: "guides",
  finishedWord: "finished",
  stickersWord: "stickers",
  dayStreak: "-day streak",
};

// Every user-facing string lives in normal + genz above.
export const COPY = { normal, genz };

// Read one string for the current mode. Falls back to Normal.
export function tx(mode, key) {
  const m = mode === "genz" ? genz : normal;
  return m[key] ?? normal[key] ?? key;
}

// Render a dictionary string; in Gen-Z mode wrap slang with tap-to-reveal.
export function say(mode, key) {
  const s = tx(mode, key);
  return mode === "genz" ? withSlang(s) : s;
}

// Old helper: pick({normal, genz}, mode). Kept for server-driven text
// like mission rewards, where slang is highlighted only in Gen-Z mode.
export function pick(copy, mode) {
  if (!copy) return "";
  if (typeof copy === "string") return mode === "genz" ? withSlang(copy) : copy;
  return mode === "genz" ? withSlang(copy.genz ?? copy.normal) : (copy.normal ?? copy.genz);
}
