#!/usr/bin/env python3
"""Regenerates microblog/tags/*.html and microblog/years/*.html from the
<article id="..." data-date="..." data-tags="..."> entries in microblog/index.html.
Run this after adding, retagging, or redating a microblog post:

    python3 scripts/generate_microblog_archives.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "microblog" / "index.html"

HEAD = """<!doctype html>
<html lang="en">
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} — Avery Reyna</title>
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title}">
    <meta property="og:url" content="https://avryryn.io/microblog/{dir}/{slug}">
    <link rel="icon" href="/assets/favicon/favicon.ico" sizes="any">
    <style>body{{max-width:65ch;font-family:Arial}}a,a:visited{{color:#00e}}</style>
</head>
<body>
    <a href="/microblog/">Back</a>
"""

ARTICLE_RE = re.compile(
    r'<article id="(?P<id>[^"]+)" data-date="(?P<date>[^"]+)" data-tags="(?P<tags>[^"]+)">'
    r'(?P<body>.*?)'
    r'</article>',
    re.DOTALL,
)


def parse_posts():
    source = SOURCE.read_text()
    posts = []
    for m in ARTICLE_RE.finditer(source):
        posts.append({
            "id": m.group("id"),
            "date": m.group("date"),
            "tags": m.group("tags").split(),
            "body": m.group("body").strip(),
        })
    return posts


def render_listing_page(*, dir_name, key, label, posts, index_label):
    title = label
    parts = [HEAD.format(title=title, dir=dir_name, slug=f"{key}.html")]
    parts.append(f"    <h1>{title}</h1>\n")
    parts.append(f'    <p>{len(posts)} post{"s" if len(posts) != 1 else ""}. <a href="/microblog/{dir_name}/">{index_label}</a>.</p>\n')
    for post in posts:
        parts.append(f'    <p><a href="/microblog/#{post["id"]}">{post["date"]} — permalink</a></p>\n')
        parts.append(f'    <article>\n{post["body"]}\n    </article>\n')
    parts.append("</body>\n</html>\n")
    return "".join(parts)


def render_group_index(*, dir_name, title, groups, label_for):
    parts = [HEAD.format(title=title, dir=dir_name, slug="")]
    parts.append(f"    <h1>{title}</h1>\n    <ul>\n")
    for key in sorted(groups, reverse=True):
        count = len(groups[key])
        parts.append(f'        <li><a href="/microblog/{dir_name}/{key}.html">{label_for(key)}</a> ({count})</li>\n')
    parts.append("    </ul>\n</body>\n</html>\n")
    return "".join(parts)


def write_group(*, dir_name, groups, title, index_label, label_for):
    out_dir = ROOT / "microblog" / dir_name
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.html"):
        old.unlink()

    for key, group_posts in groups.items():
        group_posts.sort(key=lambda p: p["date"], reverse=True)
        page = render_listing_page(
            dir_name=dir_name, key=key, label=label_for(key),
            posts=group_posts, index_label=index_label,
        )
        (out_dir / f"{key}.html").write_text(page)

    index_page = render_group_index(dir_name=dir_name, title=title, groups=groups, label_for=label_for)
    (out_dir / "index.html").write_text(index_page)
    print(f"Wrote {len(groups)} {dir_name} pages + index.html to {out_dir}")


def main():
    posts = parse_posts()
    if not posts:
        raise SystemExit(f"No tagged <article> entries found in {SOURCE}")

    tags_to_posts = {}
    years_to_posts = {}
    for post in posts:
        for tag in post["tags"]:
            tags_to_posts.setdefault(tag, []).append(post)
        year = post["date"][:4]
        years_to_posts.setdefault(year, []).append(post)

    write_group(
        dir_name="tags", groups=tags_to_posts, title="Tags",
        index_label="All tags", label_for=lambda k: f"#{k}",
    )
    write_group(
        dir_name="years", groups=years_to_posts, title="Years",
        index_label="All years", label_for=lambda k: k,
    )


if __name__ == "__main__":
    main()
