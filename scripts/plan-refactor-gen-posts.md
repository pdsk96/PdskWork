# Plan: Refactor `gen-50-posts.py` for Richer, Personal Content with Relevant Media

## Current State Audit
- **50 posts** hardcoded as f-strings in a single Python file
- Content reads like **tech Wikipedia** — no personal voice, no real anecdotes
- All images use `picsum.photos/seed/{slug}/1200/600` — **random photos, not content-relevant**
- No video embeds, no diagrams, no real project screenshots
- Repetitive structure: intro → bullets → quote → conclusion
- All posts are English-only
- No author attribution or personal perspective

## Target State
- Posts feel like they were written by a **practitioner** sharing real experience
- Media (images, videos, diagrams) **directly illustrate** the content
- Content includes **specific metrics, war stories, and honest caveats**
- Templates are **modular and maintainable**, not monolithic f-strings
- Support for **video embeds** and **SVG diagrams** inline
- Optional **Indonesian translations** for key posts

---

## Content Strategy: Make It Personal

### 1. Add "From the Trenches" sections
Every post gets a personal anecdote block:
```markdown
## From the Trenches

When we migrated PdskWork to static export, **cacheComponents** bit us twice.
The first time, `dynamic = 'force-dynamic'` silently aborted prerendering —
every page became `ƒ (Dynamic)` instead of `◐ (Partial Prerender)`.
We only caught it because the build marker changed color.

**The fix took 12 minutes. The debugging took 3 hours.**
```

### 2. Add specific metrics and numbers
Replace vague claims with real numbers:
- "Cold starts dropped by **60–80%**" → "Our medium app's cold start dropped from **4.2s to 0.9s**"
- "Better performance" → "LCP improved from **2.1s to 1.3s** on mid-range mobile"

### 3. Add honest tradeoffs and failures
Every post includes a "What broke" or "Honest limits" section:
```markdown
## What Broke

The migration wasn't clean. We lost:
- **Server Components** that depended on `cookies()` — had to refactor to client
- **Dynamic routes** with fallback — static export doesn't support them
- **API routes** — deleted 14 files in one afternoon

The lesson: static export is a **platform choice**, not just a build flag.
```

### 4. Add "PdskWork Perspective" callouts
```markdown
> **PdskWork note:** This site runs on exactly this stack.
> The FBM fresnel shader you see in the hero? That's the `dpr={[1, 1.75]}`
> trick mentioned above. Tested on a Pixel 7 — GPU temperature stayed sane.
```

### 5. Restructure tutorials as narratives
Old: Step 1, Step 2, Step 3...
New: Problem → Failed attempts → Solution → Verification

```markdown
## The Problem

We wanted a cyberpunk hero scene. Our first attempt used pure CSS animations.
It looked flat. The background didn't respond to scroll. It felt static.

## What Didn't Work

- **CSS `background-attachment: fixed`** — janky on mobile, no depth
- **SVG animations** — couldn't link to scroll position
- **Canvas 2D** — slow for per-pixel shader effects

## The Solution

React Three Fiber + a custom FBM fresnel shader. Here's what that means...
```

---

## Media Strategy: Relevant, Not Random

### 1. Replace picsum with content-aware images

**Option A: Keyword-based Unsplash** (free, no auth)
```python
def content_image(title, tags, seed):
    keywords = extract_keywords(title, tags)
    return f"https://source.unsplash.com/featured/1200x600/?{','.join(keywords)}"
```

**Option B: SVG diagrams** (100% offline, deterministic)
- Architecture diagrams for "how it works" sections
- Flow charts for tutorials
- Network topologies for infrastructure posts

**Option C: Embedded videos** (YouTube embeds)
- Tutorial posts get embedded demo videos
- Conference talks for major releases

### 2. Add media field to schema
```typescript
interface BlogPost {
  // ... existing fields
  media?: Array<{
    type: 'image' | 'video' | 'diagram'
    url: string
    alt?: string
    caption?: string
  }>
}
```

### 3. Inline SVG diagrams
For technical posts, embed SVG directly in content:
```markdown
![Architecture diagram](diagram:static-export-arch)
```
→ Rendered as inline SVG showing the build pipeline

---

## Implementation Plan

### Phase 1: Content Templates (Week 1)
- [ ] Create `content-templates.py` with reusable narrative structures
- [ ] Add `personal_voice()` helper that injects "we", "our experience", etc.
- [ ] Add `add_metrics()` helper that inserts specific numbers
- [ ] Add `add_honest_caveats()` helper for tradeoff sections
- [ ] Refactor `gen-50-posts.py` to use templates instead of hardcoded strings

### Phase 2: Media System (Week 1-2)
- [ ] Add `media` field to `BlogPost` and `BlogInput` types
- [ ] Create `media-strategy.py`:
  - `get_content_image(title, tags)` → keyword-based Unsplash URL
  - `get_video_embed(topic)` → YouTube embed HTML
  - `generate_svg_diagram(topic)` → inline SVG for architecture/flow
- [ ] Update markdown renderer to handle `![alt](diagram:slug)` syntax
- [ ] Update markdown renderer to handle `![alt](video:youtube-id)` syntax

### Phase 3: Content Generation (Week 2)
- [ ] Rewrite all 50 posts using new templates
- [ ] Add personal voice to each post
- [ ] Add specific PdskWork anecdotes where relevant
- [ ] Add honest caveats and "what broke" sections
- [ ] Ensure media URLs are content-relevant (not random picsum)

### Phase 4: Validation (Week 2)
- [ ] Run `node scripts/gen-cover-images.mjs` to regenerate covers
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Spot-check 5 posts for content quality
- [ ] Verify media URLs are accessible and relevant

### Phase 5: Indonesian Translations (Optional)
- [ ] Create `translations/` directory
- [ ] Add Indonesian versions for top 10 posts
- [ ] Update generator to support `locale: 'id'`

---

## File Changes Summary

| File | Change |
|------|--------|
| `scripts/gen-50-posts.py` | Complete rewrite using templates |
| `scripts/content-templates.py` | New: reusable narrative structures |
| `scripts/media-strategy.py` | New: relevant media selection logic |
| `src/lib/blog-types.ts` | Add `media` field to `BlogPost` |
| `src/lib/markdown.ts` | Add diagram/video embed support |
| `src/app/globals.css` | Add styles for embedded media |
| `translations/` | New: Indonesian translations |

---

## Constraints Check
- ✅ Static export compatible (no server-side media generation)
- ✅ Firebase Spark compatible (no server needed)
- ✅ Zero ongoing cost (Unsplash is free, SVG is offline)
- ✅ Build-time only (no runtime overhead)
- ✅ Backward compatible (media field optional)

---

## Success Criteria
1. Every post has at least one **content-relevant** media element (not random)
2. Every post includes **personal voice** ("we", "our experience", "PdskWork")
3. Every post has **specific metrics** or honest caveats
4. No post reads like a Wikipedia article
5. Build passes with zero TypeScript errors
6. Media loads correctly in static export

---

## Next Steps
1. Approve plan
2. Create `content-templates.py`
3. Create `media-strategy.py`
4. Begin Phase 1 rewrite
