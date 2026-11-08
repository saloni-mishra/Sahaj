
import json
from pathlib import Path
CONTENT_FILE = Path(__file__).resolve().parent.parent / "content" / "guides.json"
SCAM_QUIZ_FILE = Path(__file__).resolve().parent.parent / "content" / "scam_quiz.json"
TIPS_FILE = Path(__file__).resolve().parent.parent / "content" / "tips.json"
WORDS_FILE = Path(__file__).resolve().parent.parent / "content" / "slang.json"
EMOJI_FILE = Path(__file__).resolve().parent.parent / "content" / "emoji.json"
MISSIONS_FILE = Path(__file__).resolve().parent.parent / "content" / "missions.json"
GENZ_FILE = Path(__file__).resolve().parent.parent / "content" / "genz.json"
def load_content():
    with open(CONTENT_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_scam_quiz():
    with open(SCAM_QUIZ_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_tips():
    with open(TIPS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_words():
    with open(WORDS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_emoji_quiz():
    with open(EMOJI_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_missions():
    with open(MISSIONS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_genz_words():
    with open(GENZ_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_brands():
    data = load_content()
    return data["brands"]
def get_all_guides():
    data = load_content()
    return data["guides"]
def get_guide(guide_id):
    guides = get_all_guides()
    for guide in guides:
        if guide["id"] == guide_id:
            return guide
    return None

def get_guide_step(guide_id, brand_id, step_number):
    data = load_content()
    guide = get_guide(guide_id)
    if guide is None:
        return None
    brand = None
    for item in data["brands"]:
        if item["id"] == brand_id:
            brand = item
            break
    if brand is None:
        return None
    platform = brand["platform"]
    # Brand-specific steps win. Fall back to the platform steps.
    brand_guides = guide.get("brand_guides", {}) or {}
    platform_guides = guide.get("platform_guides", {}) or {}
    selected_guide = brand_guides.get(brand_id)
    if selected_guide is None:
        selected_guide = platform_guides.get(platform)
    if selected_guide is None:
        return None
    steps = selected_guide.get("steps", [])
    if step_number < 1 or step_number > len(steps):
        return None
    selected_step = steps[step_number - 1]
    return {
        "guide_id": guide_id,
        "title": guide["title"],
        "brand": brand_id,
        "step_number": step_number,
        "total_steps": len(steps),
        "text": selected_step["text"],
        "image": selected_step.get("image"),
        "image_alt": selected_step.get("image_alt"),
        "tips": selected_guide.get("tips", []),
        # Optional per-step Gen-Z reaction line. May be absent.
        "genz_note": selected_step.get("genz_note"),
    }


def find_guides_for_question(question, limit=1):
    """Match a free-text question to guides by keyword + title words."""
    data = load_content()
    q = (question or "").lower()
    scored = []
    for guide in data.get("guides", []):
        hay = " ".join([
            guide.get("title", ""),
            guide.get("description", ""),
            " ".join(guide.get("keywords", []) or []),
        ]).lower()
        keywords = guide.get("keywords", []) or []
        score = sum(1 for kw in keywords if kw and kw.lower() in q)
        # Small bonus when title words appear in the question.
        for word in guide.get("title", "").lower().split():
            if len(word) > 3 and word in q:
                score += 1
        if score > 0 or any(w in hay for w in q.split() if len(w) > 4):
            word_hits = sum(1 for w in q.split() if len(w) > 4 and w in hay)
            scored.append((score + word_hits, guide))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [guide for _, guide in scored[:limit]]


def get_guide_context(guide):
    """Flatten one guide's steps into plain text for the AI prompt."""
    if guide is None:
        return "No matching guide found."
    lines = []
    for platform, block in (guide.get("platform_guides", {}) or {}).items():
        for step in block.get("steps", []) or []:
            lines.append(f"{platform}: step {step.get('step_number')}: {step.get('text')}")
    for brand, block in (guide.get("brand_guides", {}) or {}).items():
        for step in block.get("steps", []) or []:
            lines.append(f"{brand}: step {step.get('step_number')}: {step.get('text')}")
    text = "\n".join(lines[:20])
    return text if text else guide.get("description", "")
