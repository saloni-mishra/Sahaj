
import json
from pathlib import Path
CONTENT_FILE = Path(__file__).resolve().parent.parent / "content" / "guides.json"
def load_content():
    with open(CONTENT_FILE, "r", encoding="utf-8") as file:
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
    }
