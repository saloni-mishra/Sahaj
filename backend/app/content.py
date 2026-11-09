
import json
from pathlib import Path
CONTENT_FILE = Path(__file__).resolve().parent.parent / "content" / "guides.json"
HINDI_CONTENT_FILE = Path(__file__).resolve().parent.parent / "content" / "hindi_guides.json"
SCAM_QUIZ_FILE = Path(__file__).resolve().parent.parent / "content" / "scam_quiz.json"
HINDI_SCAM_QUIZ_FILE = Path(__file__).resolve().parent.parent / "content" / "scam_quiz_hi.json"
TIPS_FILE = Path(__file__).resolve().parent.parent / "content" / "tips.json"
WORDS_FILE = Path(__file__).resolve().parent.parent / "content" / "slang.json"
HINDI_WORDS_FILE = Path(__file__).resolve().parent.parent / "content" / "hindi_words.json"
EMOJI_FILE = Path(__file__).resolve().parent.parent / "content" / "emoji.json"
HINDI_EMOJI_FILE = Path(__file__).resolve().parent.parent / "content" / "emoji_hi.json"
MISSIONS_FILE = Path(__file__).resolve().parent.parent / "content" / "missions.json"
GENZ_FILE = Path(__file__).resolve().parent.parent / "content" / "genz.json"
def load_content():
    with open(CONTENT_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def load_hindi_content():
    with open(HINDI_CONTENT_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_scam_quiz(lang="en"):
    path = HINDI_SCAM_QUIZ_FILE if lang == "hi" else SCAM_QUIZ_FILE
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)
def get_tips():
    with open(TIPS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_words():
    with open(WORDS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_hindi_words():
    with open(HINDI_WORDS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_emoji_quiz(lang="en"):
    path = HINDI_EMOJI_FILE if lang == "hi" else EMOJI_FILE
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)
def get_missions(lang="en"):
    with open(MISSIONS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    if lang != "hi":
        # Keep the English response exactly as it was before Hindi fields
        # were added to missions.json.
        clean = []
        for mission in data.get("missions", []):
            clean.append({
                key: value
                for key, value in mission.items()
                if not key.endswith("_hi")
            })
        return {"missions": clean}

    # Same IDs and shape as English. Only display text changes, so the
    # existing completion tracking keeps working without any migration.
    missions = []
    for mission in data.get("missions", []):
        item = {
            key: value
            for key, value in mission.items()
            if not key.endswith("_hi")
        }
        item["title"] = mission.get("title_hi", mission.get("title", ""))
        item["task"] = mission.get("task_hi", mission.get("task", ""))
        item["reward"] = mission.get("reward_hi", mission.get("reward", ""))
        missions.append(item)
    return {"missions": missions}
def get_genz_words():
    with open(GENZ_FILE, "r", encoding="utf-8") as file:
        return json.load(file)
def get_brands():
    data = load_content()
    return data["brands"]
def get_all_guides(lang="en"):
    if lang == "hi":
        data = load_hindi_content()
    else:
        data = load_content()

    return data["guides"]


def get_guide(guide_id, lang="en"):
    guides = get_all_guides(lang)

    for guide in guides:
        if guide["id"] == guide_id:
            return guide

    return None

def get_guide_step(guide_id, brand_id, step_number, lang="en"):
    data = load_content()

    guide = get_guide(guide_id, lang)

    if guide is None:
        return None

    brand = next(
        (item for item in data["brands"] if item["id"] == brand_id),
        None
    )

    if brand is None:
        return None

    platform = brand["platform"]

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
        "genz_note": selected_step.get("genz_note"),
    }


def find_guides_for_question(question, limit=1, min_score=2, lang="en"):
    """Match a free-text question to guides by keyword + title words.

    Only matches scoring at least min_score are returned, so weak
    single-word overlaps don't produce a misleading guide link.
    """
    guides = get_all_guides(lang)
    q = (question or "").lower()
    scored = []
    for guide in guides:
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
    return [guide for score, guide in scored[:limit] if score >= min_score]


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
