import { useEffect, useState } from "react";

const MODE_KEY = "sahaj-mode";

// All Gen Z slang Sahaj ever uses, with plain meanings.
// Safety rule: slang NEVER appears in safety warnings or instructions.
export const SLANG = {
  "no cap": "no lie — for real",
  "you ate that": "you did great",
  "lowkey": "quietly, in a small way",
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

export const COPY = {
  heroSub: {
    normal: "A little help with your phone, whenever you need it. Learn new things, practise safely, and have fun along the way.",
    genz: "Your personal tech grandkid. We keep it simple and safe — no cap.",
  },
  finished: {
    normal: "Guide finished — well done!",
    genz: "Guide finished — you ate that!",
  },
  finishButton: {
    normal: "I finished this guide",
    genz: "I finished this guide",
  },
};
