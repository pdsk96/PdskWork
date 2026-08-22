#!/usr/bin/env python3
"""
Media strategy for blog posts.

Selects images, diagrams, and videos that are relevant to the post content
rather than random placeholders.
"""
from __future__ import annotations

import re
import hashlib
from urllib.parse import quote_plus

# Free, no-auth image service based on keywords.
IMG = "https://source.unsplash.com/featured/1200x600/?{keywords}"


def _keywords(title: str, tags: list[str]) -> str:
    text = f"{title} {' '.join(tags)}"
    words = re.findall(r"[A-Za-z0-9]+", text.lower())
    stop = {
        "the", "and", "for", "with", "that", "this", "from", "into",
        "how", "what", "why", "are", "not", "but", "you", "your",
    }
    unique = [w for w in words if w not in stop and len(w) > 2]
    priority = []
    for tag in tags:
        t = tag.lower()
        if t not in priority and t not in stop:
            priority.append(t)
    for w in unique:
        if w not in priority:
            priority.append(w)
    return ",".join(priority[:6]) if priority else "technology"


def content_image(title: str, tags: list[str]) -> str:
    keywords = _keywords(title, tags)
    return IMG.format(keywords=quote_plus(keywords))


def deterministic_seed(title: str, tags: list[str]) -> str:
    raw = f"{title}|{','.join(tags)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:10]


def get_media(title: str, tags: list[str], locale: str = "en") -> dict:
    keywords = _keywords(title, tags)
    image_url = IMG.format(keywords=quote_plus(keywords))
    seed = deterministic_seed(title, tags)
    return {
        "type": "image",
        "url": image_url,
        "alt": title,
        "caption": None,
        "keywords": keywords,
        "seed": seed,
    }
