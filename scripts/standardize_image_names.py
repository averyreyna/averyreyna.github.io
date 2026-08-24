#!/usr/bin/env python3
"""Renames files under assets/images/ to match the id of the microblog
<article> that references them, e.g. <article id="very-exciting-times">
referencing exciting-times-stains.png becomes very-exciting-times.png (or
very-exciting-times-2.png, -3.png, ... for a second/third image in the same
post). Rewrites the <img src="..."> in microblog/index.html to match, then
regenerates the tags/years archives.

Run after adding a new microblog image, or any time to (re-)standardize:

    python3 scripts/standardize_image_names.py [--dry-run]
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "microblog" / "index.html"
IMAGES_DIR = ROOT / "assets" / "images"

ARTICLE_RE = re.compile(
    r'<article id="(?P<id>[^"]+)"[^>]*>(?P<body>.*?)</article>',
    re.DOTALL,
)
IMG_RE = re.compile(r'<img src="/assets/images/(?P<name>[^"]+)"')


def is_tracked(path: Path) -> bool:
    result = subprocess.run(
        ["git", "ls-files", "--error-unmatch", str(path)],
        cwd=ROOT, capture_output=True,
    )
    return result.returncode == 0


def main():
    dry_run = "--dry-run" in sys.argv
    source = SOURCE.read_text()

    renames = []  # (old_name, new_name)
    for article in ARTICLE_RE.finditer(source):
        article_id = article.group("id")
        names = IMG_RE.findall(article.group("body"))
        for i, old_name in enumerate(names, start=1):
            ext = Path(old_name).suffix.lower()
            new_name = f"{article_id}{ext}" if i == 1 else f"{article_id}-{i}{ext}"
            if old_name != new_name:
                renames.append((old_name, new_name))

    if not renames:
        print("Nothing to rename; image names already standardized.")
        return

    seen_targets = {}
    for old_name, new_name in renames:
        if new_name in seen_targets and seen_targets[new_name] != old_name:
            raise SystemExit(
                f"Naming collision: both {old_name!r} and "
                f"{seen_targets[new_name]!r} would become {new_name!r}"
            )
        seen_targets[new_name] = old_name

    for old_name, new_name in renames:
        old_path = IMAGES_DIR / old_name
        new_path = IMAGES_DIR / new_name
        if not old_path.exists():
            print(f"skip (not found on disk): {old_name}")
            continue

        print(f"{old_name} -> {new_name}")
        if dry_run:
            continue

        if is_tracked(old_path):
            subprocess.run(["git", "mv", str(old_path), str(new_path)], cwd=ROOT, check=True)
        else:
            old_path.rename(new_path)

        source = source.replace(f"/assets/images/{old_name}", f"/assets/images/{new_name}")

    if dry_run:
        print("\n(dry run — no files or references changed)")
        return

    SOURCE.write_text(source)
    print(f"\nUpdated {SOURCE.relative_to(ROOT)}")

    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_microblog_archives.py")],
        cwd=ROOT, check=True,
    )


if __name__ == "__main__":
    main()
