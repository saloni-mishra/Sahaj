"""
link_guide_images.py

Fills in the "image" field of every step in guides.json by looking for
screenshot files in your frontend's public folder.

Folder layout it expects (one folder per brand, then per guide id):

    frontend/public/guides/samsung/increase_text_size/step1.png
    frontend/public/guides/samsung/increase_text_size/step2.png
    frontend/public/guides/iphone/take_screenshot/step2.jpg

File names must be step<number> with .png, .jpg, .jpeg or .webp.
The brand folder name must match the brand "id" in guides.json
(iphone, samsung, xiaomi, oppo, windows, macbook).

Run it from the backend folder:

    python link_guide_images.py              # update guides.json
    python link_guide_images.py --dry-run    # only show what would change

Rules:
- A step with a matching file gets its "image" set to "/guides/<brand>/<guide>/<file>".
- A step with no matching file gets "image" set back to null.
- If a brand has pictures for a guide but no brand_guides entry yet, the generic
  platform steps are copied into brand_guides for that brand, so each brand can
  have its own pictures even when the steps are the same.
- A backup (guides.json.bak) is saved before anything is changed.
"""

import argparse
import copy
import json
import re
import shutil
import sys
from pathlib import Path

EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")
STEP_FILE = re.compile(r"^step(\d+)\.(png|jpg|jpeg|webp)$", re.IGNORECASE)

HERE = Path(__file__).resolve().parent
DEFAULT_CONTENT = HERE / "content" / "guides.json"
DEFAULT_IMAGES = HERE.parent / "frontend" / "public" / "guides"


def find_image(folder, step_number):
    """Return the file name for this step's picture, or None."""
    for ext in EXTENSIONS:
        candidate = folder / f"step{step_number}{ext}"
        if candidate.is_file():
            return candidate.name
    return None


def stray_files(folder, step_count):
    """Files in the folder that no step will use (typos, extra steps)."""
    strays = []
    for path in sorted(folder.iterdir()):
        if not path.is_file():
            continue
        match = STEP_FILE.match(path.name)
        if not match or not (1 <= int(match.group(1)) <= step_count):
            strays.append(path.name)
    return strays


def main():
    parser = argparse.ArgumentParser(description="Link screenshots to guide steps.")
    parser.add_argument("--content", type=Path, default=DEFAULT_CONTENT,
                        help="path to guides.json")
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGES,
                        help="path to frontend/public/guides")
    parser.add_argument("--url-prefix", default="/guides",
                        help="URL the images are served from (default /guides)")
    parser.add_argument("--dry-run", action="store_true",
                        help="show changes without writing anything")
    args = parser.parse_args()

    if not args.content.is_file():
        sys.exit(f"Cannot find guides.json at {args.content}")
    if not args.images.is_dir():
        sys.exit(f"Cannot find the images folder at {args.images}")

    with open(args.content, "r", encoding="utf-8") as file:
        data = json.load(file)

    linked = 0
    cleared = 0
    notes = []

    for guide in data["guides"]:
        guide.setdefault("brand_guides", {})

        for brand in data["brands"]:
            if brand["device_type"] not in guide["device_types"]:
                continue

            folder = args.images / brand["id"] / guide["id"]
            if not folder.is_dir():
                continue

            block = guide["brand_guides"].get(brand["id"])
            is_new_block = False
            if block is None:
                platform_block = guide["platform_guides"].get(brand["platform"])
                if platform_block is None:
                    notes.append(f"{brand['id']}/{guide['id']}: folder exists but this guide has no steps for {brand['platform']}")
                    continue
                block = copy.deepcopy(platform_block)
                is_new_block = True

            found_here = 0
            missing = []
            for step in block["steps"]:
                name = find_image(folder, step["step_number"])
                if name:
                    new_path = f"{args.url_prefix}/{brand['id']}/{guide['id']}/{name}"
                    if step.get("image") != new_path:
                        step["image"] = new_path
                        linked += 1
                    found_here += 1
                else:
                    if step.get("image") is not None:
                        step["image"] = None
                        cleared += 1
                    missing.append(step["step_number"])

            for name in stray_files(folder, len(block["steps"])):
                notes.append(f"{brand['id']}/{guide['id']}: '{name}' does not match any step (check the name)")

            if found_here and is_new_block:
                guide["brand_guides"][brand["id"]] = block
                notes.append(f"{brand['id']}/{guide['id']}: copied generic steps into brand_guides so this brand can have its own pictures")
            if found_here and missing:
                notes.append(f"{brand['id']}/{guide['id']}: no picture yet for step(s) {missing}")

    print(f"Linked {linked} image(s), cleared {cleared}.")
    for note in notes:
        print(" -", note)

    if args.dry_run:
        print("Dry run: nothing was written.")
        return

    backup = args.content.with_name(args.content.name + ".bak")
    shutil.copyfile(args.content, backup)
    with open(args.content, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
        file.write("\n")
    print(f"Saved. Backup: {backup}")


if __name__ == "__main__":
    main()
