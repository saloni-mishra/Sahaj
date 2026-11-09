import { Link, useLocation } from "react-router-dom";

// Sahaj has two separate experiences inside one app:
//   English  -> routes without /hindi
//   Hindi    -> routes under /hindi
// This hook keeps that check in one place so shared components can adapt
// without changing the English experience.
export function useLang() {
  const { pathname } = useLocation();
  return pathname === "/hindi" || pathname.startsWith("/hindi/") ? "hi" : "en";
}

// Shared Hindi UI text. Page-specific wording can stay inside its page.
export const HI = {
  navHome: "होम",
  navLearn: "सीखें",
  navMissions: "मिशन",
  navSafe: "सुरक्षा",
  navFun: "मनोरंजन",
  navSafeLong: "सुरक्षा जाँच",
  navPractice: "अभ्यास",

  switchToEnglish: "English में देखें",
  switchToHindi: "हिंदी में देखें",

  missionComplete: "मिशन पूरा हुआ!",
  todayMissionPrefix: "आज का मिशन:",
  todayMissionAria: "आज का मिशन",
  missionStickerAria: "आज के मिशन का सितारा",
  startMission: "मिशन शुरू कीजिए →",
  playAgainMission: "फिर से कीजिए →",
  allMissions: "सारे मिशन →",
  missionsTitle: "मिशन",
  missionsSub: "रोज़मर्रा के छोटे-छोटे काम। एक काम कीजिए, एक सितारा पाइए।",
  dayStreak: "-दिन की लय",
  stickersWord: "सितारे",
  guidesWord: "गाइड",
  finishedWord: "पूरी हुईं",
  ofWord: "में से",
  certifiedCool: "★ इकट्ठा हो गया!",
  closeCelebration: "बंद कीजिए",
  checkMissions: "मिशन पेज देखिए",
  backLink: "← सहज पर वापस",

  myProgress: "⭐ मेरी प्रगति",
  collectAll: "सभी सितारे इकट्ठा कीजिए!",

  funTitle: "मनोरंजन",
  funSub: "आराम से खेलिए। यहाँ गलत जवाब देने पर कोई डाँट नहीं।",
  playAgain: "फिर से खेलिए",
  seeBadge: "नतीजा देखिए →",
  nextMessage: "अगला सवाल →",
  questionWord: "सवाल",
  scoreWord: "स्कोर",
  emojiGameOver: "खेल पूरा हुआ!",
  emojiPerfect: "🏆 बहुत बढ़िया! सारे जवाब सही।",
  emojiGood: "🥈 बहुत अच्छा! लगभग सब सही।",
  emojiKeepGoing: "🌱 अच्छी कोशिश! फिर से खेलिए।",
  gotRightSuffix: "सही",
  loadingEmoji: "सवाल तैयार हो रहे हैं…",
  correctWord: "बहुत बढ़िया—सही जवाब! ",
  goodTryWord: "कोई बात नहीं—सही जवाब हरे निशान में दिख रहा है। ",

  safeOrScamTitle: "सुरक्षित या ठगी?",
  safeOrScamSub:
    "मैसेज पढ़िए, अपना जवाब चुनिए और ठगी के संकेत सीखिए। जल्दबाज़ी नहीं—गलत जवाब भी ठीक है।",
  gotMessage: "असली मैसेज मिला है?",
  gotMessageDesc: "नीचे चिपकाइए, सहज आपके लिए जाँच करेगा।",
  scamCheckerLabel: "मैसेज की जाँच: जो मैसेज आया है उसे यहाँ चिपकाइए।",
  pastePlaceholder: "मैसेज यहाँ चिपकाइए…",
  checkMessage: "इस मैसेज को जाँचिए",
  checking: "जाँच हो रही है…",
  scamLoadError: "खेल अभी नहीं खुल पाया।",
  playDetective: "जासूस बनिए →",
  looksSafe: "✅ सुरक्षित लगता है",
  isScam: "🚨 यह ठगी है",
  openGuidePrefix: "गाइड खोलिए:",
  scamHelpTitle: "अगर आपके साथ ऐसा हो",
  scamHelpText:
    "1930 पर कॉल कीजिए (साइबर ठगी हेल्पलाइन) या cybercrime.gov.in पर जाइए। घर के किसी भरोसेमंद सदस्य को भी तुरंत बताइए।",
  flagRed: "लाल = खतरे का संकेत",
  flagGreen: "हरा = सुरक्षित संकेत",
  pretendCaption: "यह नकली स्क्रीन है—नीचे दिए बटन से जवाब दीजिए।",
  spotScam: "🎯 ठगी पहचानिए",
  messageWord: "मैसेज",
  whatToDo: "अब क्या कीजिए:",
  correctFeedback: "सही पहचाना! ",
  goodTryFeedback: "कोई बात नहीं—सही जवाब निशान में है। ",
  gameOver: "खेल पूरा हुआ!",
  scamPerfect: "🏆 शाबाश! सारे जवाब सही।",
  scamGood: "🥈 बहुत सतर्क! लगभग सब सही।",
  scamLearning: "🥉 अच्छी कोशिश—आप सीख रहे हैं।",
  scamKeepGoing: "🌱 फिर से खेलिए—शुरू में सबको ठगी भ्रम में डालती है।",
  loadingGame: "खेल तैयार हो रहा है…",
  checkerError: "जाँच अभी काम नहीं कर रही। थोड़ी देर बाद कोशिश कीजिए।",
  lowRisk:
    "यह मैसेज अभी सुरक्षित लग रहा है। इसमें ठगी का कोई साफ़ संकेत नहीं मिला। फिर भी सावधान रहें और OTP, PIN या पासवर्ड किसी के साथ साझा न करें।",
  mediumRisk: "⚠️ सावधान—यह मैसेज शक वाला लगता है। ",
  highRisk: "🛑 खतरा—यह बहुत संभव है कि यह ठगी हो! ",
  dangerAction: "जवाब न दीजिए और पैसे न भेजिए।",
};

export function hi(key) {
  return HI[key] ?? key;
}

// Safe route pairs. If a page has no Hindi/English equivalent, we send the
// person to that language's home instead of an unrelated page.
const ROUTE_PAIRS = {
  "/learn": "/hindi/learn",
  "/hindi/learn": "/learn",
  "/missions": "/hindi/missions",
  "/hindi/missions": "/missions",
  "/safe-or-scam": "/hindi/safe-or-scam",
  "/hindi/safe-or-scam": "/safe-or-scam",
  "/fun": "/hindi/fun",
  "/hindi/fun": "/fun",
  "/scam-emergency": "/hindi/emergency",
  "/hindi/emergency": "/scam-emergency",
};

function switchTarget(pathname, search, hash) {
  if (pathname === "/hindi" || pathname === "/") {
    const home = pathname === "/hindi" ? "/" : "/hindi";
    return `${home}${search}${hash}`;
  }
  const target = ROUTE_PAIRS[pathname];
  if (target) return `${target}${search}${hash}`;
  return pathname.startsWith("/hindi") ? "/" : "/hindi";
}

export function LanguageSwitch({ className = "link-more" }) {
  const lang = useLang();
  const { pathname, search, hash } = useLocation();
  return (
    <Link className={className} to={switchTarget(pathname, search, hash)}>
      {lang === "hi" ? HI.switchToEnglish : HI.switchToHindi}
    </Link>
  );
}
