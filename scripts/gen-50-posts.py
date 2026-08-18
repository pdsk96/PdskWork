#!/usr/bin/env python3
"""
Generate 50 professional blog posts and merge into src/db/blog.json.

Categories (priority order):
  1. Latest technology / news
  2. Tutorials
  3. Programming
  4. Open source news
  5. Open source AI agents

Each post matches the exact BlogPost schema (id, slug, title, excerpt, content,
tags, published, locale, createdAt, updatedAt). Content is GFM markdown with
inline image markdown using stable picsum.photos placeholder URLs (the renderer
supports inline images; there is no separate coverImage field).

Dates are spread across 2026-06..2026-08 so the blog feels active. Existing seed
posts (welcome / selamat-datang) are preserved.
"""
from __future__ import annotations

import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BLOG_JSON = REPO / "src" / "db" / "blog.json"

# Stable, license-free placeholder image service. Each post gets a unique seed
# so the inline image is deterministic. These are illustrative cover images.
IMG = "https://picsum.photos/seed/{seed}/1200/600"


def post(pid: str, title: str, excerpt: str, content: str, tags: list[str],
         date: str) -> dict:
    return {
        "id": pid,
        "slug": pid,
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "tags": tags,
        "published": True,
        "locale": "en",
        "createdAt": f"{date}T00:00:00.000Z",
        "updatedAt": f"{date}T00:00:00.000Z",
    }


POSTS: list[dict] = [
    # ────────────────────────────────────────────────────────────────────────
    # CATEGORY 1 — LATEST TECHNOLOGY / NEWS (10 posts)
    # ────────────────────────────────────────────────────────────────────────
    post(
        "nextjs-16-3-instant-navigations",
        "Next.js 16.3 Brings Instant Navigations to the React Ecosystem",
        "Next.js 16.3 ships Instant Navigations, Partial Prefetching, and a leaner dev server — here is what changes for production teams.",
        f"""# Next.js 16.3 Brings Instant Navigations

![Next.js 16.3 release overview]({IMG.format(seed="nextjs163")})

Next.js 16.3, released in August 2026, is the most significant navigation overhaul since the App Router landed. The headline feature — **Instant Navigations** — finally closes the gap between client-side SPAs and server-rendered Next apps.

## What is new

- **Instant Navigations**: a route can Stream, Cache, or Block to make a click feel instant.
- **Partial Prefetching**: a reusable shell per route, cached on the client so the first paint is immediate while the rest streams in.
- **Navigation Inspector**: a new devtool that visually inspects a navigation's loading shell.
- **Instant Insights**: surfaces slow navigations automatically during development.
- A far less memory-hungry dev server — critical for large monorepos.

## Why it matters

For years, perceived performance in Next apps depended on careful `loading.tsx` design and aggressive prefetching. 16.3 makes the framework itself responsible for the instant feel, so engineers can spend time on features instead of micro-optimizing route transitions.

> A navigation that feels instant is not magic — it is a cached shell plus streamed content.

## Upgrade notes

Partial Prefetching requires `cacheComponents: true` at the top level of `next.config.ts`. Combined with `loading.tsx` files, you get the `◐ (Partial Prerender)` build marker indicating static HTML plus dynamic server-streamed content — the desired outcome.

See the official [Next.js 16.3 blog post](https://nextjs.org/blog/next-16-3) for the full changelog.""",
        ["technology", "nextjs", "react", "performance"],
        "2026-08-04",
    ),
    post(
        "react-19-2-view-transitions",
        "React 19.2 Makes View Transitions First-Class",
        "React 19.2 stabilizes View Transitions, useEffectEvent, and Activity — a quieter but deeply impactful release.",
        f"""# React 19.2 Makes View Transitions First-Class

![React 19.2 View Transitions]({IMG.format(seed="react192")})

React 19.2, carried into Next.js 16 as a canary release, brings three features that change how we reason about UI continuity: **View Transitions**, **`useEffectEvent`**, and **Activity**.

## View Transitions

Animate elements that update inside a Transition or navigation without leaving React's reconciliation model. Pair it with the browser's native View Transitions API for smooth, jank-free morphs between states.

```tsx
import {{ useViewTransitionState }} from 'react'
import {{ startTransition }} from 'react'

function toggleTheme(next) {{
  startTransition(() => setTheme(next))
}}
```

## useEffectEvent

Extract non-reactive logic out of Effects into reusable Effect Event functions. This fixes the long-standing footgun where linters demanded dependencies that were not truly reactive, leading to unnecessary re-runs.

## Activity

Render "background activity" by hiding UI with `display: none` while preserving state and cleaning up Effects. Ideal for tabs and modals that should keep their position without staying mounted.

## Takeaway

React 19.2 is less about new APIs and more about removing the defensive coding patterns developers had accumulated. Fewer effects, fewer guards, more trust in the framework.""",
        ["technology", "react", "frontend"],
        "2026-07-28",
    ),
    post(
        "turbopack-default-bundler-2026",
        "Turbopack as Default Bundler: A 2026 Retrospective",
        "Turbopack replaced Webpack as Next.js's default bundler. A year on, here is how it changed the developer workflow.",
        f"""# Turbopack as Default Bundler: A 2026 Retrospective

![Turbopack performance comparison]({IMG.format(seed="turbopack")})

When Next.js 15 made Turbopack the default for `next dev` and `next build`, it was a bold move. By mid-2026, the bet has largely paid off for the majority of projects.

## The wins

- **Cold starts** dropped by 60–80% on medium apps in internal benchmarks.
- **Incremental rebuilds** are nearly instantaneous for the common case of editing a single component.
- Memory footprint in dev is significantly lower than the equivalent Webpack configuration — a relief for Docker and CI environments.

## The caveats

A long tail of Webpack loaders had no Turbopack equivalent. Most were either migrated to native Turbopack equivalents or replaced with lighter alternatives. Custom `webpack.config.js` overrides in `next.config.ts` are no longer the escape hatch they once were — teams that depended on deep Webpack customization had to adapt.

> The lesson: defaults that are fast enough for the 90th percentile win, even if they cost the 10th percentile some migration pain.

## Recommendation

For greenfield projects in 2026, there is no reason to reach for Webpack. For legacy projects, the migration is incremental — Turbopack is robust enough that you can flip the flag app-by-app.""",
        ["technology", "turbopack", "tooling"],
        "2026-07-20",
    ),
    post(
        "liquid-glass-design-era-2026",
        "The Liquid-Glass Design Era Is Here",
        "Frosted glass, depth, and motion define the 2026 visual language. Here is what makes a design feel modern right now.",
        f"""# The Liquid-Glass Design Era Is Here

![Liquid-glass UI mockup]({IMG.format(seed="liquidglass")})

Walk through any design-forward product shipped in 2026 and you will notice a shared vocabulary: frosted translucent surfaces, layered depth, and motion that responds to scroll and pointer. Call it the **liquid-glass era**.

## The ingredients

1. **Translucent layers** — backdrop blur over rich, animated backgrounds.
2. **Depth via parallax** — elements move at different rates to suggest a z-axis.
3. **Reactive motion** — animations driven by scroll progress and pointer position, not just mount.
4. **High contrast text** — neon-on-ink palettes that meet AA contrast even over busy backgrounds.

## Why now

GPU-accelerated backdrop filters are universally supported, WebGL is mainstream, and frameworks like Motion (formerly Framer Motion) make scroll-linked animation a few lines of code. The technical cost of depth has collapsed.

## Accessibility guardrails

Liquid-glass is gorgeous but dangerous for accessibility and performance. Always:

- Honor `prefers-reduced-motion` — disable parallax and shader loops.
- Keep text contrast at AA (4.5:1) over the glass.
- Cap `dpr` on WebGL canvases for high-DPI mobile to avoid melting the GPU.

This very site, PdskWork, is built on these principles — a React Three Fiber hero with an FBM fresnel background shader, glass panels, and reduced-motion fallbacks.""",
        ["technology", "design", "css", "accessibility"],
        "2026-07-12",
    ),
    post(
        "edge-runtime-maturity-2026",
        "Edge Runtimes Hit Production Maturity in 2026",
        "V8 isolates, WASM, and Workers have moved from experiment to default. Here is the state of the edge in 2026.",
        f"""# Edge Runtimes Hit Production Maturity in 2026

![Edge runtime topology]({IMG.format(seed="edge")})

Two years ago, "edge" meant clever hacks around V8 isolate limitations. In 2026, edge runtimes are a legitimate default for latency-sensitive workloads.

## What matured

- **WASM in Workers** is first-class, unlocking libraries that previously needed Node APIs.
- **Server Fast Refresh** brings fine-grained hot reloading to the server side.
- **Subresource Integrity** for JavaScript files is now built into bundlers.
- **Tree shaking of dynamic imports** — unused exports are pruned from `import()` chunks.

## When to choose the edge

The edge shines for read-heavy, globally-distributed, low-latency reads: auth checks, geo-personalization, A/B routing, and feature flags. It is the wrong tool for long-running compute or anything needing a full filesystem.

## When to stay on the origin

Heavy RAG inference, large file processing, and anything touching a relational database with connection pooling semantics still belongs on a containerized origin. The mature pattern is **edge for the shell, origin for the body** — a fast edge response streams while the origin computes.""",
        ["technology", "edge", "performance"],
        "2026-06-28",
    ),
    post(
        "ai-coding-agents-mainstream-2026",
        "AI Coding Agents Cross Into Mainstream in 2026",
        "From novelty to daily driver: AI coding agents are now part of the standard developer toolkit. What changed?",
        f"""# AI Coding Agents Cross Into Mainstream in 2026

![AI coding agent workflow]({IMG.format(seed="aiagents")})

In 2024, an AI coding agent was a curiosity. In 2026, it is a teammate. The shift from autocomplete to autonomous task completion happened faster than most predicted.

## What changed

1. **Long-context models** (1M+ tokens) made whole-repo reasoning practical.
2. **Sandboxed execution** — Docker and UnixLocal backends let agents run code safely.
3. **Tool-use reliability** improved enough that agents complete multi-step refactors without hand-holding.
4. **Open-source parity** — frameworks like OpenHands and Claude Agent SDK closed the gap with proprietary offerings.

## The new workflow

The modern developer does not write every line. They write specs, review diffs, and steer agents. The valuable skills shifted: prompt clarity, test design, and code review sharpness matter more than typing speed.

> The agent does not replace the engineer; it changes what the engineer spends time on.

## Guardrails that work

- Run agents on a branch, never on `main`.
- Require tests for any non-trivial change.
- Keep a human in the loop for anything touching production data or secrets.

The teams winning with agents treat them like junior engineers: capable, fast, but in need of review.""",
        ["technology", "ai", "agents", "news"],
        "2026-06-20",
    ),
    post(
        "webgpu-comes-to-browsers-2026",
        "WebGPU Is Finally Everywhere in 2026",
        "After years of origin trials, WebGPU shipped across all major browsers. Here is what it unlocks for the web.",
        f"""# WebGPU Is Finally Everywhere in 2026

![WebGPU compute pipeline]({IMG.format(seed="webgpu")})

WebGPU — the successor to WebGL — reached cross-browser parity in 2026. Chrome, Safari, and Firefox all ship it enabled by default. This is a quiet revolution for what the web can do.

## What WebGPU gives you

- **Compute shaders** — run GPGPU workloads (ML inference, physics, particle sims) directly in the browser.
- **Modern API** — a cleaner, lower-overhead design than WebGL, closer to Vulkan/Metal.
- **Predictable performance** — explicit resource management instead of the WebGL driver lottery.

## Real-world impact

- In-browser LLM inference via WebGPU compute is now viable for small models, enabling fully private, offline AI features.
- Three.js and React Three Fiber added first-class WebGPU renderers, so existing WebGL content can migrate incrementally.
- Physics engines and procedural generation tools that once needed a native app now run on the web.

## The caveat

WebGPU is lower-level than the WebGL ecosystem developers are used to. For most product work, layering on top of Three.js or Babylong.js is still the right call — drop to raw WebGPU only when you need compute or极致 control.""",
        ["technology", "webgpu", "graphics", "browsers"],
        "2026-06-14",
    ),
    post(
        "typescript-6-type-erasure-2026",
        "TypeScript 6 and the Type Erasure Revolution",
        "TypeScript 6 stabilizes the type annotations proposal, bringing runtime type info to a language that erased it for a decade.",
        f"""# TypeScript 6 and the Type Erasure Revolution

![TypeScript 6 type system]({IMG.format(seed="typescript6")})

For over a decade, TypeScript's defining trait was that types vanished at runtime — erased, never shipped. TypeScript 6, stabilizing the **type annotations proposal**, changes that equation.

## What type annotations enable

- **Runtime type reflection** — validators, serializers, and DI containers can read the actual types instead of guessing.
- **Single source of truth** — no more maintaining parallel Zod/io-ts schemas that drift from your interfaces.
- **Smaller dependency surface** — the runtime validation library ecosystem shrinks because the language does the work.

## The migration story

Existing `.ts` files are unaffected — type erasure remains the default. The new syntax is opt-in, so adoption is incremental. Libraries can expose annotated entry points while keeping erased internals.

## The tradeoff

Runtime types mean runtime cost: bundle size grows when annotations are shipped. The smart pattern is annotating only the boundary — API responses, config files, external input — while keeping hot internal paths erased.

This is the most consequential TypeScript release since 2.0.""",
        ["technology", "typescript", "programming"],
        "2026-06-08",
    ),
    post(
        "vector-databases-commoditized-2026",
        "Vector Databases Got Commoditized in 2026",
        "pgvector, SQLite-vec, and in-browser options turned vector search from a specialty product into a feature.",
        f"""# Vector Databases Got Commoditized in 2026

![Vector search embedding space]({IMG.format(seed="vectordb")})

In 2023, you needed a dedicated vector database to do semantic search. In 2026, vector search is a checkbox feature in the tools you already use.

## The commoditization story

- **`pgvector`** matured to the point where Postgres handles production-scale similarity search for most workloads.
- **`sqlite-vec`** brought vector search to embedded and edge environments — no server required.
- **In-browser options** (transformers.js + local vectors) make fully offline semantic search real.
- Generalist databases (MongoDB, Redis, Elastic) all added native vector indexes.

## When you still need a specialist

Dedicated vector DBs remain the right call for: billion-vector scale, hybrid search with complex reranking, and workloads where millisecond latency on massive corpora is the product. For everyone else — that is, most teams — your existing database is enough.

> The pattern that won: vector search as a feature of the database you already run, not a new database to operate.

## Practical advice

Start with `pgvector` on your existing Postgres. Measure. Only reach for a specialist when you hit a wall you can name — usually scale, not features.""",
        ["technology", "database", "ai", "infrastructure"],
        "2026-06-02",
    ),
    post(
        "rust-in-the-frontend-toolchain-2026",
        "Rust Quietly Took Over the Frontend Toolchain",
        "SWC, Turbopack, Rspack, Oxc, Biome — Rust now powers the tools JavaScript developers use every day.",
        f"""# Rust Quietly Took Over the Frontend Toolchain

![Rust-powered JS tooling]({IMG.format(seed="rusttooling")})

Open any modern frontend toolchain and you will find Rust underneath. SWC compiles your TypeScript. Turbopack bundles your app. Oxc lints your code. Biome formats it. The language did not change — the engine did.

## Why Rust won this layer

- **Speed** — 10–100x over the JS equivalents on hot paths.
- **Memory safety** — no GC pauses during compilation.
- **Parallelism** — fearless multi-threading for parse/transform passes.
- **WASM friendliness** — the same code runs in browsers and Node.

## What it means for JS developers

You do not need to write Rust. The tools expose JS/TS APIs and config. The win is that the slow parts of your build — the parts that scaled with project size — now scale with cores, not with V8 overhead.

## The open question

The Rust-ification of tooling concentrates maintainership in fewer hands (those who can write both Rust and a JS API surface). It is a net positive for users but a real consideration for project sustainability. Funding the people behind these tools matters more than ever.""",
        ["technology", "rust", "tooling", "open-source"],
        "2026-05-28",
    ),

    # ────────────────────────────────────────────────────────────────────────
    # CATEGORY 2 — TUTORIALS (10 posts)
    # ────────────────────────────────────────────────────────────────────────
    post(
        "tutorial-build-3d-cyberpunk-hero-r3f",
        "Tutorial: Build a Cyberpunk 3D Hero Scene With React Three Fiber",
        "A step-by-step guide to building a WebGL hero scene with shaders, scroll-linked motion, and reduced-motion fallbacks.",
        f"""# Tutorial: Build a Cyberpunk 3D Hero Scene

![Cyberpunk R3F hero scene]({IMG.format(seed="r3fhero")})

This tutorial walks through building a cyberpunk hero scene with React Three Fiber (R3F), a fragment-shader background, and scroll-linked camera motion — the same stack this site uses.

## Prerequisites

- Node 20.9+ and a Next.js 16 app.
- `@react-three/fiber`, `@react-three/drei`, and `motion` installed.
- A browser with WebGL support.

## Step 1: Gate the Canvas on WebGL

Never render `<Canvas>` unconditionally — it throws in WebGL-less environments.

```tsx
const supported = useDetectGL()
if (!supported) return <StaticFallback />
return <Canvas>...</Canvas>
```

## Step 2: The FBM fresnel background

A full-screen shader running 5-octave fractal Brownian motion gives the swirling neon void. Keep `dpr={{[1, 1.75]}}` on the background canvas — high-DPI mobile GPUs will thank you.

## Step 3: Scroll-linked camera

Use `useScroll` from Motion (not drei's) and drive `scrollYProgress` (0..1) into camera Z. Never use `scrollY` (pixels) — it breaks on resize.

## Step 4: Performance guards

```tsx
<PerformanceMonitor onIncline={{ onFps: (f) => setDpr([1, 2]) }} />
<AdaptiveDpr pixelated />
```

## Step 5: Reduced motion

```tsx
const reduce = useReducedMotion()
<Canvas dpr={{ reduce ? [1, 1] : [1, 2] }}>
```

Disable parallax and shader uniforms that animate when `reduce` is true.

## Result

A hero that feels alive on capable hardware and degrades gracefully everywhere else. The full source for this site's hero is in the repo — read it alongside this tutorial.""",
        ["tutorial", "react-three-fiber", "webgl", "shaders"],
        "2026-08-02",
    ),
    post(
        "tutorial-nextjs-16-cache-components",
        "Tutorial: Adopting Cache Components in Next.js 16",
        "Cache Components and Partial Prefetching are the biggest caching shift in Next's history. A practical migration guide.",
        f"""# Tutorial: Adopting Cache Components in Next.js 16

![Next.js cache components diagram]({IMG.format(seed="cachecomp")})

Cache Components replaced Next's implicit, often-confusing caching with an explicit `"use cache"` directive. This is a migration guide for existing apps.

## Step 1: Enable the flags

In `next.config.ts`:

```ts
const nextConfig = {{
  cacheComponents: true,
  partialPrefetching: true,
}}
```

Both are top-level — not under `experimental.*`.

## Step 2: Remove incompatible patterns

`export const dynamic = 'force-dynamic'` is **incompatible** with `cacheComponents`. Remove it from every page and route handler. Pages that read `cookies()` auto-become dynamic per-session — you do not need the flag.

## Step 3: Opt into request-time where needed

For a GET route handler doing async file I/O or `Math.random()` that should never prerender, use `connection()`:

```ts
import {{ connection }} from 'next/server'
export async function GET() {{
  await connection() // force request-time
  // ...
}}
```

## Step 4: Read the build output

- `◐ (Partial Prerender)` — static HTML + dynamic server-streamed content. This is the goal.
- `○ (Static)` — fully static.
- `ƒ (Dynamic)` — fully dynamic.

## Step 5: Add `loading.tsx`

`loading.tsx` streams a fallback for fast LCP. **It is a Server Component** — do not use styled-jsx there; put styles in `globals.css`.

## Result

You get instant navigations, partial prefetching, and explicit control over what caches where. Worth the migration.""",
        ["tutorial", "nextjs", "caching", "performance"],
        "2026-07-30",
    ),
    post(
        "tutorial-motion-lazy-bundle",
        "Tutorial: Shrinking Your Motion Bundle With LazyMotion",
        "Framer Motion rebranded to Motion. Here is how to ship a fraction of the client JS using LazyMotion and lazy components.",
        f"""# Tutorial: Shrinking Your Motion Bundle With LazyMotion

![Motion bundle size chart]({IMG.format(seed="motionbundle")})

The `framer-motion` package rebranded to `motion`. Beyond the import change (`motion/react`), the bigger win is `LazyMotion` — strict mode that ships a fraction of the client JS.

## Step 1: Install

```bash
npm install motion
```

Imports move from `framer-motion` to `motion/react`. `useReducedMotion`, `useScroll`, `useTransform`, `m`, `LazyMotion`, `domAnimation` all come from the new path.

## Step 2: Wrap once in the root layout

```tsx
import {{ LazyMotion, domAnimation }} from 'motion/react'

<LazyMotion strict features={{domAnimation}}>
  {{children}}
</LazyMotion>
```

## Step 3: Use `m.div`, not `motion.div`

Inside `LazyMotion`, components must use the lazy `m.*` variants. Using `motion.div` pulls in the full bundle and defeats the purpose.

```tsx
import {{ m }} from 'motion/react'
<m.div animate={{{{ opacity: 1 }}}} transition={{{{ duration: 0.3 }}}} />
```

## Step 4: Hooks still work

`useScroll`, `useTransform`, `useMotionValue`, `useSpring` — all fine inside LazyMotion. Only the component primitives are lazy.

## Result

A measurable drop in first-load JS. On this site, the Motion client bundle shrank enough to make the 3D hero's cost the dominant factor — exactly where you want the budget spent.""",
        ["tutorial", "motion", "performance", "frontend"],
        "2026-07-26",
    ),
    post(
        "tutorial-static-export-firebase-hosting",
        "Tutorial: Static Export a Next.js App to Firebase Hosting Free Tier",
        "How to deploy a Next.js 16 app as a fully static export to Firebase Hosting on the free Spark plan — no Blaze upgrade needed.",
        f"""# Tutorial: Static Export to Firebase Hosting Free Tier

![Firebase Hosting deployment]({IMG.format(seed="firebasehost")})

Firebase Hosting on the **Spark (free) plan** can serve a static Next.js export at the default `*.web.app` URL — no Cloud Functions, no Blaze upgrade. This is the playbook.

## Step 1: Configure for export

In `next.config.ts`:

```ts
const nextConfig = {{
  output: 'export',
  images: {{ unoptimized: true }},
  distDir: 'out',
  trailingSlash: false,
}}
```

Remove `cacheComponents` and `partialPrefetching` — they are incompatible with export.

## Step 2: No server runtime

Delete anything requiring a server: middleware (Proxy), `app/api/**` route handlers, `cookies()`-based locale logic, fs-based stores. The export is pure HTML/CSS/JS.

## Step 3: Handle dynamic routes

Unknown slugs created post-deploy have no static HTML. Use `firebase.json` rewrites:

```json
{{
  "hosting": {{
    "rewrites": [
      {{ "source": "/blog/{{slug}}", "destination": "/blog/_" }},
      {{ "source": "/admin/blog/{{id}}/edit", "destination": "/admin/blog/_/edit" }}
    ]
  }}
}}
```

The client reads the real slug/id from `window.location.pathname`.

## Step 4: `generateStaticParams` opt-in

For `/blog/[slug]`, return seed slugs plus a `_` placeholder. Metadata routes (`sitemap.ts`, `robots.ts`) need `export const dynamic = 'force-static'` under export.

## Step 5: Deploy

```bash
npm run build
firebase deploy --only hosting
```

## Result

A globally-cached, free-tier static site. For dynamic data, use Firestore client SDK + Firebase Auth — both free. This is exactly how PdskWork runs.""",
        ["tutorial", "firebase", "deployment", "nextjs"],
        "2026-07-22",
    ),
    post(
        "tutorial-web-audio-ambient-drone",
        "Tutorial: Synthesize an Ambient Drone With the Web Audio API",
        "No audio files, no dependencies — a from-scratch ambient drone using oscillators, detuning, and a slow LFO low-pass filter.",
        f"""# Tutorial: Synthesize an Ambient Drone With Web Audio

![Web Audio API graph]({IMG.format(seed="webaudio")})

You do not need audio files to add atmosphere. The Web Audio API can synthesize a slow, evolving drone in a few dozen lines. This is how PdskWork's ambient sound is built.

## Step 1: Lazy AudioContext

Never create an `AudioContext` until the user gestures (browsers block autoplay).

```ts
const ctx = new AudioContext()
if (ctx.state === 'suspended') await ctx.resume()
```

## Step 2: Two detuned sawtooth oscillators

```ts
const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55
const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 55.5
```

The 0.5Hz detune creates a slow, beating phasing — the foundation of the drone's movement.

## Step 3: A low-pass filter with an LFO

```ts
const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400
const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05
const lfoGain = ctx.createGain(); lfoGain.gain.value = 200
lfo.connect(lfoGain).connect(filter.frequency)
```

The 0.05Hz LFO sweeps the cutoff over ~20 seconds — a breathing timbre.

## Step 4: Respect reduced motion

```ts
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {{
  lfoGain.gain.value = 0 // freeze the sweep
}}
```

## Result

A generative ambient bed that costs zero bytes of audio, respects accessibility, and feels alive. Default to muted — let the user opt in.""",
        ["tutorial", "web-audio", "javascript", "accessibility"],
        "2026-07-18",
    ),
    post(
        "tutorial-i18n-client-side-nextjs",
        "Tutorial: Client-Side i18n in a Static Next.js Export",
        "When you cannot use server `cookies()` for locale, here is a cookie + context pattern that works in a static export.",
        f"""# Tutorial: Client-Side i18n in a Static Next.js Export

![i18n locale switcher]({IMG.format(seed="i18n")})

Static exports have no server, so `cookies()` for locale is out. This is the pattern PdskWork uses — a cookie for persistence, React context for reactivity, all client-side.

## Step 1: Dictionaries

```ts
// src/i18n/dictionaries.ts
export const dicts = {{
  en: {{ blog: {{ title: 'Blog', ... }} }},
  id: {{ blog: {{ title: 'Blog', ... }} }},
}}
```

## Step 2: A LocaleProvider

```tsx
'use client'
const LocaleContext = createContext()
export function LocaleProvider({{ children }}) {{
  const [locale, setLocale] = useState<'en'|'id'>('en')
  useEffect(() => {{
    const c = document.cookie.match(/pdsk-locale=(en|id)/)?.[1]
    if (c) setLocale(c)
  }}, [])
  // ... expose locale, dict, setLocale (sets cookie + state)
}}
export const useLocale = () => useContext(LocaleContext)
```

## Step 3: Consume in pages

```tsx
const {{ locale, dict }} = useLocale()
<h1>{{dict.blog.title}}</h1>
```

## Step 4: A no-flash inline script

To avoid a flash of the wrong locale, inject an inline script in `<head>` that reads the cookie and sets a class before hydration.

## Result

Fully client-side i18n that survives a static export, with no server round-trip and no flash. Pairs perfectly with a locale toggle in the nav.""",
        ["tutorial", "i18n", "nextjs", "frontend"],
        "2026-07-14",
    ),
    post(
        "tutorial-rss-feed-static-nextjs",
        "Tutorial: Generate an RSS Feed for a Static Next.js Site",
        "Next.js route handlers are gone in static export. Here is a prebuild script that generates `public/feed.xml` at build time.",
        f"""# Tutorial: Generate an RSS Feed for a Static Next.js Site

![RSS feed generation pipeline]({IMG.format(seed="rssfeed")})

In a server runtime, an RSS feed is a route handler. In a static export, that is impossible. The solution: a prebuild script that reads your seed data and writes `public/feed.xml`.

## Step 1: The script

```js
// scripts/gen-feed.mjs
import fs from 'node:fs'
import {{ read }} from './blog-seed-reader.mjs'

const posts = read() // synchronous read of blog.json
const items = posts.filter(p => p.published).map(p => '  <item>...').join('')

const feed = '<?xml version="1.0"?>\n<rss version="2.0"><channel>...</channel></rss>'
fs.writeFileSync('public/feed.xml', feed)
```

The full script maps each published post into an `<item>` with `<title>`, `<link>`, `<guid>`, `<pubDate>`, and `<description>`, escapes XML special characters, and writes the combined RSS 2.0 document to `public/feed.xml`.

## Step 2: Wire to prebuild

In `package.json`:

```json
{{
  "scripts": {{ "prebuild": "node scripts/gen-feed.mjs" }}
}}
```

## Step 3: Link it in metadata

```ts
export const metadata = {{
  alternates: {{ types: {{ 'application/rss+xml': '/feed.xml' }} }}
}}
```

## Step 4: Gitignore the generated file

`public/feed.xml` is regenerated each build — add it to `.gitignore` so you never commit a stale copy.

## Result

A valid RSS 2.0 feed for a fully static site, rebuilt every deploy, linked from your metadata. Subscribers stay in sync.""",
        ["tutorial", "rss", "nextjs", "automation"],
        "2026-07-10",
    ),
    post(
        "tutorial-firestore-client-sdk-static-site",
        "Tutorial: Adding Firestore to a Static Next.js Export",
        "Dynamic data without a server: the Firestore client SDK plus security rules give a static site a real backend, free.",
        f"""# Tutorial: Adding Firestore to a Static Next.js Export

![Firestore client SDK architecture]({IMG.format(seed="firestore")})

A static export has no server, but it can still have a real database. The Firestore client SDK runs in the browser, and security rules enforce access control. This is the pattern PdskWork uses for its blog CMS.

## Step 1: Install and initialize

```ts
import {{ initializeApp }} from 'firebase/app'
import {{ getFirestore }} from 'firebase/firestore'
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

## Step 2: Security rules define access

```
// firestore.rules
service cloud.firestore {{
  match /databases/{{database}}/documents {{
    match /posts/{{postId}} {{
      allow read: if resource.data.published == true
      allow write: if request.auth != null // admin only
    }}
  }}
}}
```

Public reads of published posts; writes require auth. Optionally restrict writes to a single admin UID.

## Step 3: Two data paths

- **Build-time seed** (`src/lib/blog-seed.ts`): a synchronous `readFileSync` of a bundled JSON file, used by `generateStaticParams`, `generateMetadata`, `sitemap.ts`, and the RSS feed.
- **Runtime Firestore** (`src/lib/blog-firestore.ts`): the client SDK, used by public pages and the admin CMS.

Both expose the same interface names so callers do not care which is which.

## Step 4: Auth for the admin

Firebase Auth (email/password, client SDK) plus a client-side `AdminGate` component that redirects to `/admin/login?next=` if unauthenticated. No httpOnly cookie, no server session — the rules enforce the boundary.

## Result

A free-tier static site with a real CMS backend: public reads are instant and cached, writes are secured by Firestore rules, and the build-time seed guarantees the static shell always exists.""",
        ["tutorial", "firebase", "firestore", "nextjs"],
        "2026-07-06",
    ),
    post(
        "tutorial-reduced-motion-accessibility",
        "Tutorial: Building for `prefers-reduced-motion`",
        "Motion-heavy sites must respect reduced motion. A practical guide to graceful degradation without sacrificing the experience.",
        f"""# Tutorial: Building for `prefers-reduced-motion`

![Accessibility motion preferences]({IMG.format(seed="reducedmotion")})

A cyberpunk, motion-rich site is a liability for users with vestibular disorders. `prefers-reduced-motion` is the contract. Here is how to honor it without throwing away your design.

## Step 1: Detect at the right layer

```ts
import {{ useReducedMotion }} from 'motion/react'
const reduce = useReducedMotion()
```

For CSS, use the media query directly:

```css
@media (prefers-reduced-motion: reduce) {{
  * {{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }}
}}
```

## Step 2: What to disable vs. diminish

- **Disable**: parallax, shader loops, infinite animations, scroll-linked camera movement.
- **Diminish, not remove**: essential transitions (opacity fades to 100ms), state changes.
- **Keep**: semantic motion that conveys information (a loading bar).

## Step 3: 3D and WebGL

```tsx
<Canvas dpr={{ reduce ? [1, 1] : [1, 2] }}>
```

Zero out LFO gains, freeze shader uniforms, and drop the `dpr` to the minimum. The scene still renders, just static.

## Step 4: Back-to-top and scroll features

```tsx
window.scrollTo({{ top: 0, behavior: reduce ? 'auto' : 'smooth' }})
```

Instant scroll when reduced; smooth otherwise.

## Result

A site that is breathtaking for those who want motion and **safe** for those who do not. Accessibility is not optional; it is part of shipping professional work.""",
        ["tutorial", "accessibility", "css", "motion"],
        "2026-06-30",
    ),
    post(
        "tutorial-seo-nextjs-16",
        "Tutorial: Production SEO in Next.js 16",
        "Metadata, sitemap, robots, OpenGraph, and RSS — a complete SEO setup for an App Router site.",
        f"""# Tutorial: Production SEO in Next.js 16

![SEO checklist for Next.js]({IMG.format(seed="seonextjs")})

Next.js 16's Metadata API is powerful but easy to misconfigure. This is a production-grade setup.

## Step 1: Root metadata

```ts
export const metadata: Metadata = {{
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {{ default: 'PdskWork', template: '%s · PdskWork' }},
  alternates: {{ types: {{ 'application/rss+xml': '/feed.xml' }} }},
}}
```

Always set `metadataBase` — without it, OG image URLs resolve to `localhost`.

## Step 2: `sitemap.ts`

```ts
export default async function sitemap() {{
  const posts = getSeedPosts()
  return [
    ...staticRoutes,
    ...posts.map(p => ({{ url: `/blog/${{p.slug}}`, lastModified: p.updatedAt }})),
  ]
}}
```

Under static export, add `export const dynamic = 'force-static'`.

## Step 3: `robots.ts`

```ts
export default function robots() {{
  return {{ rules: {{ userAgent: '*', allow: '/' }}, sitemap: `${{BASE}}/sitemap.xml` }}
}}
```

## Step 4: Per-page metadata via `generateMetadata`

```ts
export async function generateMetadata({{ params }}) {{
  const {{ slug }} = await params // Next 16: params is a promise
  const post = getPostBySlug(slug)
  return {{ title: post.title, description: post.excerpt, openGraph: {{ images: [ogImage] }} }}
}}
```

## Step 5: The async gotcha

In Next.js 16, `params` and `searchParams` are **async** — you must `await` them. Forgetting this is the #1 metadata bug.

## Result

A site that search engines and social platforms understand: canonical URLs, fresh sitemap, valid OG cards, and a discoverable RSS feed.""",
        ["tutorial", "seo", "nextjs", "metadata"],
        "2026-06-24",
    ),
    post(
        "tutorial-github-actions-deploy-firebase",
        "Tutorial: CI/CD for Firebase Hosting With GitHub Actions",
        "Automate your static site deploys from GitHub to Firebase Hosting with preview channels and production promotion.",
        f"""# Tutorial: CI/CD for Firebase Hosting With GitHub Actions

![GitHub Actions deploy pipeline]({IMG.format(seed="cicdfirebase")})

Manual deploys do not scale. This is a GitHub Actions workflow that builds, previews, and promotes a Next.js static export to Firebase Hosting.

## Step 1: Cache credentials

Store a Firebase service account JSON as a GitHub secret (`FIREBASE_SERVICE_ACCOUNT`). Use the `w9jds/firebase-action` or the official `firebase-tools` Docker image.

## Step 2: The build job

```yaml
- run: npm ci
- run: npm run build
- uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: <GITHUB_TOKEN_SECRET>
    firebaseServiceAccount: <FIREBASE_SERVICE_ACCOUNT_SECRET>
    channelId: preview-on-pr-live-on-main
    projectId: pdskwork
```

In practice the `channelId` is computed: `preview` for pull requests, `live` for pushes to `main`. The exact interpolation syntax depends on your CI; the principle is "preview on PRs, live on merge."

## Step 3: Preview channels on PRs

Firebase Hosting creates an ephemeral preview URL per PR. Post it as a comment so reviewers can click a live build.

## Step 4: Promote on merge

On push to `main`, the workflow deploys to the `live` channel — your production URL. The preview channel expires automatically.

## Step 5: Environment-aware env

Set `NEXT_PUBLIC_SITE_URL` per environment: the production URL (`https://pdskwork.web.app`) on `main`, a preview URL otherwise. This ensures `metadataBase` and OG URLs are correct per environment.

## Result

Every PR gets a live preview, every merge ships to production — no manual `firebase deploy`, no "works on my machine".
""",
        ["tutorial", "github-actions", "ci-cd", "firebase"],
        "2026-06-18",
    ),

    # ────────────────────────────────────────────────────────────────────────
    # CATEGORY 3 — PROGRAMMING (10 posts)
    # ────────────────────────────────────────────────────────────────────────
    post(
        "programming-async-params-nextjs-16",
        "Next.js 16 Makes Async Request APIs Mandatory — Here Is How to Adapt",
        "`cookies()`, `headers()`, `params`, and `searchParams` are now promises. A guide to the migration and why it matters.",
        f"""# Next.js 16 Makes Async Request APIs Mandatory

![Async request API flow]({IMG.format(seed="asyncparams")})

The single most impactful breaking change in Next.js 16 is that **async Request APIs are mandatory**. `cookies()`, `headers()`, `params`, and `searchParams` all return promises you must `await`.

## Why the change

Sync access to request-scoped data was a blocker for Partial Prerendering — the framework could not know at build time whether a component would need request data. Making them async lets the compiler distinguish static from dynamic without ambiguity.

## The migration

Before:

```ts
export default function Page({{ params }}) {{
  const {{ slug }} = params
  // ...
}}
```

After:

```ts
export default async function Page({{ params }}) {{
  const {{ slug }} = await params
  // ...
}}
```

## `cookies()` and `headers()`

```ts
import {{ cookies, headers }} from 'next/server'
const cookieStore = await cookies()
const h = await headers()
```

## The common bug

Calling `params.slug` without awaiting returns a promise object, not the string. TypeScript catches it if your types are right; JavaScript silently breaks. **Always `await`.**

## Forcing request-time

If a page or route has no dynamic API but must not prerender, use `connection()`:

```ts
import {{ connection }} from 'next/server'
await connection()
```

This is the explicit, documented opt-in — far cleaner than the old `dynamic = 'force-dynamic'`.""",
        ["programming", "nextjs", "async", "react"],
        "2026-08-01",
    ),
    post(
        "programming-middleware-to-proxy-nextjs-16",
        "Next.js 16 Renamed Middleware to Proxy — What It Means",
        "`middleware.ts` is now `proxy.ts`. The rename signals a narrower, clearer role for request-time interception.",
        f"""# Next.js 16 Renamed Middleware to Proxy

![Middleware to Proxy rename]({IMG.format(seed="proxyrename")})

Next.js 16 renamed **Middleware** to **Proxy**. The file moves from `middleware.ts` to `proxy.ts` (at the project root or `src/` root). This is not cosmetic — it reflects a scoped-down role.

## Why the rename

"Middleware" implied general-purpose request interception, which teams used for everything from auth to data fetching to redirects based on DB lookups. That scope creep caused performance problems (every request paid the cost) and confusion.

**Proxy** signals the actual intent: lightweight, request-time routing and header manipulation — the kind of work a CDN edge proxy does.

## What stays in scope

- Redirects and rewrites based on the request.
- Setting request headers.
- Locale routing (with caveats).

## What moved out

- Auth (use server-side sessions and `AdminGate`-style client gates).
- Data fetching (do it in Server Components or the client).
- Anything that needs a database.

## Practical impact

If you had a `middleware.ts` doing auth or DB work, that is a code smell the rename exposes. Move that logic to a Server Component or a client-side gate. PdskWork, as a static export, deleted its proxy entirely — there is no server to intercept.

## The takeaway

Names shape behavior. "Proxy" tells you exactly how much you should put in it: very little.""",
        ["programming", "nextjs", "middleware", "architecture"],
        "2026-07-29",
    ),
    post(
        "programming-next-image-priority-deprecated",
        "Next.js 16: `next/image` `priority` Is Deprecated — Use `preload`",
        "The image component's `priority` prop is gone in favor of `preload`. What changed and how to migrate.",
        f"""# Next.js 16: `next/image` `priority` Is Deprecated

![next/image preload migration]({IMG.format(seed="nextimage")})

In Next.js 16, the `priority` prop on `next/image` is **deprecated** in favor of `preload`. The behavior is similar, but the name aligns with the platform's loading primitives.

## Why the change

`priority` was overloaded — it meant "load this first" for the LCP image, but developers sprinkled it everywhere, defeating the purpose. `preload` is explicit: it tells the browser to fetch the resource early via the preload scanner.

## The migration

Before:

```tsx
import Image from 'next/image'
<Image src="/hero.jpg" priority width={1200} height={600} alt="Hero" />
```

After:

```tsx
<Image src="/hero.jpg" preload width={1200} height={600} alt="Hero" />
```

## When to actually use it

Only on the single LCP image per route. Adding `preload` to every image is worse than not using it — you flood the network with high-priority requests and slow the actual LCP.

## The broader image story

Under static export, `next/image` runs unoptimized (`images.unoptimized: true`) because there is no server to transform images. For dynamic deploys, the new image service is faster and supports modern formats automatically.

## Takeaway

Use `preload` on exactly one image per page — the one users see first. Leave the rest to lazy loading.""",
        ["programming", "nextjs", "performance", "images"],
        "2026-07-24",
    ),
    post(
        "programming-eslint-flat-config-nextjs-16",
        "Next.js 16: ESLint Flat Config and the End of `next lint`",
        "`next lint` is removed. ESLint Flat Config is the default. Here is how to lint a Next 16 project correctly.",
        f"""# Next.js 16: ESLint Flat Config and the End of `next lint`

![ESLint flat config setup]({IMG.format(seed="eslintflat")})

Next.js 16 removed `next lint`. Linting is now the ESLint CLI's job, run directly. The configuration format is the new **Flat Config** (`eslint.config.mjs`).

## Why `next lint` had to go

`next lint` was a wrapper that papered over ESLint version mismatches and config complexity. As ESLint moved to flat config and stricter plugin contracts, the wrapper became a liability — crashes on circular structures, opaque errors.

## The new setup

`eslint.config.mjs`:

```js
import next from 'eslint-config-next'

export default [
  ...next.flatConfig.coreWebVitals,
  {{
    rules: {{ 'react/no-unescaped-entities': 'off' }},
  }},
]
```

Run it directly:

```bash
npx eslint .
```

## `next build` no longer lints

This is intentional. The build does TypeScript checking only. Linting is a separate concern — wire it into your CI as a distinct step, or run it in your editor.

## The known caveat

The `eslint-config-next` vs ESLint 9 combination can crash with a circular-structure error on some setups. If you hit this, pin ESLint to a compatible version or rely on `next build`'s TS check as your gate (as PdskWork does).

## Takeaway

The framework got out of the linting business. That is healthier — ESLint owns linting, TypeScript owns types, and `next build` owns the build. Clean separation.""",
        ["programming", "eslint", "nextjs", "tooling"],
        "2026-07-19",
    ),
    post(
        "programming-server-components-boundaries",
        "Programming Server Components: Drawing the Right Boundaries",
        "The 'use client' directive is a boundary, not a label. A framework for deciding what goes where.",
        f"""# Programming Server Components: Drawing the Right Boundaries

![Server/Client component boundary]({IMG.format(seed="rscboundaries")})

React Server Components (RSC) are powerful, but the boundary between server and client is the hardest part of the model. Here is a decision framework.

## The rule of thumb

A component is a Client Component **only if** it:

1. Uses browser APIs (`window`, `document`, `localStorage`, `matchMedia`).
2. Uses React state, effects, or context (`useState`, `useEffect`, `createContext`).
3. Handles user events (`onClick`, `onChange`) without server actions.
4. Imports a library that does any of the above.

Everything else is a Server Component by default.

## Push the boundary down, not up

The instinct is to mark the whole page `'use client'`. That is usually wrong. Instead, push the directive to the **leaf** component that actually needs interactivity, and keep the page and layout server-side.

```tsx
// page.tsx (server) — fetches data, renders shell
import InteractiveWidget from './InteractiveWidget' // 'use client'
<InteractiveWidget data={{data}} />
```

## The serialization wall

Props passed from server to client components must be serializable — no functions, no class instances, no `Date` objects unless you convert them. This wall is real and forces clean data design.

## Static export nuance

Under `output: 'export'`, there is no server, so "Server Components" become static-at-build-time components. The boundary discipline still pays off: components without `'use client'` ship zero client JS.

## Takeaway

The `'use client'` directive is a public API for your component. Treat it with the same care you'd give any exported function's contract.""",
        ["programming", "react", "rsc", "architecture"],
        "2026-07-15",
    ),
    post(
        "programming-react-compiler-2026",
        "The React Compiler Is Real in 2026 — What It Changes",
        "Auto-memoization lands in React, making `useMemo` and `useCallback` opt-in rather than mandatory. A practical look.",
        f"""# The React Compiler Is Real in 2026

![React Compiler memoization]({IMG.format(seed="reactcompiler")})

The React Compiler, long promised, stabilized in 2026. It auto-memoizes component output based on input equality, making manual `useMemo` and `useCallback` largely unnecessary.

## What the compiler does

It analyzes your component and inserts memoization where it is sound — at the granularity of individual values, not whole components. You write plain code; the compiler emits the optimized version.

## What you can delete

- `useMemo` around expensive computations.
- `useCallback` around handlers passed to memoized children.
- `React.memo` wrappers around leaf components (in most cases).

## What you still need

- `useState` and `useReducer` — the compiler does not manage state.
- `useEffect` for side effects — though `useEffectEvent` handles non-reactive logic.
- Reference equality for context values where stability matters.

## The migration

Enable the compiler in your build config. It is opt-in per-app. Existing manual memoization is harmless (the compiler is idempotent), so you can migrate incrementally — delete manual memo as you gain confidence.

## The real win

It is not raw performance. It is **cognitive load**. Junior developers can write plain components and get the performance characteristics that previously required expert-level knowledge of React's rendering model. That is a leveling of the field.""",
        ["programming", "react", "compiler", "performance"],
        "2026-07-11",
    ),
    post(
        "programming-error-handling-typescript",
        "TypeScript Error Handling: Beyond `try/catch`",
        "Typed errors, Result types, and the `never` check — practical patterns for safe, predictable error handling.",
        f"""# TypeScript Error Handling: Beyond `try/catch`

![TypeScript error handling patterns]({IMG.format(seed="tscerrors")})

`try/catch` in TypeScript catches `unknown`. That is correct but ergonomically painful. Here are patterns that make errors predictable and typed.

## Pattern 1: Narrow the unknown

```ts
try {{
  await risky()
}} catch (e) {{
  if (e instanceof MyError) handleMyError(e)
  else throw e // rethrow what you cannot handle
}}
```

Always rethrow what you do not handle — swallowing errors is worse than crashing.

## Pattern 2: Result types for expected failures

For operations where failure is a normal outcome (parsing, validation, lookups), return a discriminated union instead of throwing:

```ts
type Result<T, E> = {{ ok: true; value: T }} | {{ ok: false; error: E }}
function parseUser(input: string): Result<User, ParseError> {{ ... }}
```

This forces callers to handle the error case — the compiler ensures exhaustiveness.

## Pattern 3: Custom error classes with `instanceof`

```ts
class ReadOnlyDataError extends Error {{
  constructor() {{ super('Blog data directory is read-only'); this.name = 'ReadOnlyDataError' }}
}}
```

API routes catch `ReadOnlyDataError` and return HTTP 503 specifically, letting other errors bubble to the generic 500 handler.

## Pattern 4: The `never` exhaustiveness check

```ts
function handle(e: KnownError) {{
  switch (e.kind) {{
    case 'A': return ...
    case 'B': return ...
    default:
      const _exhaustive: never = e
      throw new Error(`Unhandled: ${{JSON.stringify(e)}}`)
  }}
}}
```

If you add a new error kind, the compiler errors at the `never` assignment until you handle it.

## Takeaway

Predictable errors come from typing them. `try/catch` is a last resort, not the default.""",
        ["programming", "typescript", "error-handling", "patterns"],
        "2026-06-26",
    ),
    post(
        "programming-state-machines-react",
        "Modeling UI State With State Machines in React",
        "When `useState` sprawls into impossible states, a state machine brings clarity. XState or a hand-rolled reducer — your call.",
        f"""# Modeling UI State With State Machines in React

![UI state machine diagram]({IMG.format(seed="statemachine")})

Every UI has implicit state machines — loading, idle, error, success. Modeling them explicitly eliminates the "impossible states" that cause bugs.

## The problem

```ts
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<Data | null>(null)
```

This allows `loading=true && error !== null` — an impossible state that your UI has to defensively handle.

## The fix: a discriminated union

```ts
type State =
  | {{ status: 'idle' }}
  | {{ status: 'loading' }}
  | {{ status: 'error'; error: string }}
  | {{ status: 'success'; data: Data }}

const [state, dispatch] = useReducer(reducer, {{ status: 'idle' }})
```

Now each state has exactly the fields it needs. The compiler prevents accessing `data` when `status` is `'loading'`.

## When to reach for XState

A `useReducer` handles most UI state machines. Reach for XState when:

- You have nested or parallel states (e.g., "form is valid AND submission is in-flight").
- You need visual debugging of the state chart.
- The machine is shared across components or even apps.

## The mental shift

Stop asking "what booleans do I need?" and start asking "what states can this be in, and what events cause transitions?" The latter question surfaces the actual domain; the former surfaces incidental flags.

## Takeaway

Impossible states are not bugs to handle — they are bugs to make unrepresentable.""",
        ["programming", "react", "state", "patterns"],
        "2026-06-22",
    ),
    post(
        "programming-testing-react-server-components",
        "Testing React Server Components in 2026",
        "RSC breaks the old testing model. Here is how to test data fetching, streaming, and the server/client boundary.",
        f"""# Testing React Server Components in 2026

![Testing RSC components]({IMG.format(seed="rsctesting")})

React Server Components broke the assumption that a component is a pure function of props. `render(<Component />)` no longer works for server components — they may fetch, await, and stream. Here is the testing model that replaced it.

## Level 1: Test the leaves

Client Components (the `'use client'` leaves) are still pure functions of props. Test them with `@testing-library/react` as before. This is where most of your logic should live, and most of your tests.

## Level 2: Test the data layer

Server Components fetch data. Mock the data layer, not the fetch:

```ts
vi.mock('@/lib/blog-seed', () => ({{ getPostBySlug: () => mockPost }}))
```

Then render the page in a server context. Tools like `@testing-library/react`'s RSC support or framework-level test utilities render the component tree server-side.

## Level 3: Integration tests

For critical flows, write an integration test that hits a real (or in-memory) database and renders the full page. Slow but trustworthy.

## What to skip

Do not unit test that a Server Component calls `fetch`. Test that given certain data, it renders certain HTML. The "how" is the framework's job.

## The async gotcha

Server Components are async. Your tests must `await` the render:

```ts
const result = await renderToHtml(<Page params={{ slug: 'x' }} />)
expect(result).toContain('Expected text')
```

## Takeaway

The testing pyramid inverts slightly: more logic in testable leaves, fewer but more integration-focused tests for the server boundary. Trust the framework; test your code.""",
        ["programming", "react", "testing", "rsc"],
        "2026-06-16",
    ),
    post(
        "programming-css-container-queries-2026",
        "Container Queries Changed How I Write CSS in 2026",
        "Component-scoped responsive design is here. Container queries replaced most of my media queries — here is the new mental model.",
        f"""# Container Queries Changed How I Write CSS in 2026

![Container query layout]({IMG.format(seed="containerqueries")})

For a decade, responsive CSS meant media queries against the viewport. In 2026, **container queries** are the default mental model, and they change how components are written.

## The shift

A media query asks "how wide is the window?" A container query asks "how wide is my container?" The latter is what you actually want — a card component does not care about the viewport, it cares about its own space.

## The syntax

```css
.card {{ container-type: inline-size; }}

@container (min-width: 400px) {{
  .card__title {{ font-size: 1.5rem; }}
}}
```

The card now adapts to wherever it is placed — a sidebar, a grid, a modal — without the parent needing to know its breakpoints.

## What this enables

- **Truly reusable components** — a `<Card>` looks right in any container.
- **No prop drilling** of viewport flags.
- **Server-rendered components** can be responsive without knowing the client viewport at render time.

## What media queries are still for

- Top-level layout (`<main>` vs sidebar width).
- Anything that genuinely depends on the viewport (full-screen modals, mobile nav).

## The practical win

I deleted most of my `useMediaQuery` hooks and viewport-based `useEffect` logic. The CSS handles it. That is less JS, fewer re-renders, and a calmer component tree.

> The best responsive JS is the responsive CSS you did not have to write.""",
        ["programming", "css", "responsive", "frontend"],
        "2026-06-10",
    ),

    # ────────────────────────────────────────────────────────────────────────
    # CATEGORY 4 — OPEN SOURCE NEWS (10 posts)
    # ────────────────────────────────────────────────────────────────────────
    post(
        "open-source-langgraph-1-0-stable",
        "LangGraph 1.0 Is Stable — The Stateful Agent Standard",
        "LangGraph 1.0 shipped with native MCP support and is now the de facto standard for stateful production agent workflows.",
        f"""# LangGraph 1.0 Is Stable — The Stateful Agent Standard

![LangGraph agent graph]({IMG.format(seed="langgraph")})

LangGraph 1.0, released in early 2026 under the MIT license, reached general availability. It is the framework most production teams now reach for when they need **stateful, graph-based agent workflows**.

## What makes LangGraph the standard

- **Explicit graph model** — agents are nodes, transitions are edges, and state flows between them deterministically.
- **Checkpoints and pause/resume** — an agent can halt mid-run, persist state, and resume later (even across server restarts) without losing context.
- **Native MCP support** — first-class connection to the Model Context Protocol, so tools from any MCP server are available.
- **Loop and branch primitives** — model-led reasoning and strict deterministic flows coexist.

## When to pick it

LangGraph shines for workflows where state matters: long-running research, multi-step coding agents, and any pipeline where an LLM call should not be a black box. If you need observability into "what did the agent decide and when," LangGraph's graph structure makes that legible.

## The 1.0 signal

Stable 1.0 means the API is committed. Teams that held off because of breaking changes between 0.x versions can now build on a stable surface.

## The competition

CrewAI is faster to prototype a multi-agent "crew." Claude Agent SDK is tighter if you are Anthropic-native. But for enterprise state management and graph-shaped workflows, LangGraph 1.0 is the reference implementation.""",
        ["open-source", "ai", "agents", "langgraph"],
        "2026-08-05",
    ),
    post(
        "open-source-crewai-1-14-memory",
        "CrewAI 1.14 Ships Pluggable Memory and Knowledge Backends",
        "The fastest multi-agent prototyping framework added pluggable memory, RAG, and a Chat API in the 1.14 line.",
        f"""# CrewAI 1.14 Ships Pluggable Memory and Knowledge Backends

![CrewAI multi-agent crew]({IMG.format(seed="crewai")})

CrewAI 1.14.6 (stable) and the subsequent June 2026 releases brought the framework to enterprise readiness. Under the MIT license, it remains the fastest path to a role-based multi-agent prototype.

## What 1.14 added

- **Pluggable memory** — short-term, long-term, and entity memory backends are swappable.
- **Pluggable knowledge/RAG** — bring your own vector store and retrieval logic.
- **Pluggable flow backends** — the orchestration layer is no longer opinionated.
- **Chat API** — a unified interface for streaming agent output.
- **Snowflake Cortex integration** — for teams already on Snowflake.

## The role-based model

CrewAI's signature is modeling agents as team members with roles, goals, and tools. A "researcher" agent and a "writer" agent collaborate, handing off context. This maps cleanly onto how non-technical stakeholders think about workflows.

## When to pick it

- You want a multi-agent crew running in an afternoon.
- Your domain is naturally decomposable into roles.
- You value readability of the agent topology over raw control.

## When to look elsewhere

If you need strict deterministic flows with checkpoint/resume semantics, LangGraph is the better fit. CrewAI's strength is flexibility and speed, not rigorous state management.

## The 2026 take

CrewAI matured from a prototyping toy into a credible production framework. The pluggable backends are the key — they let you swap in your own infrastructure instead of being locked into the framework's defaults.""",
        ["open-source", "ai", "agents", "crewai"],
        "2026-07-31",
    ),
    post(
        "open-source-microsoft-agent-framework-1-0",
        "Microsoft Agent Framework 1.0: Semantic Kernel Meets AutoGen",
        "Microsoft merged Semantic Kernel and AutoGen into a single MIT-licensed Agent Framework with native MCP and A2A.",
        f"""# Microsoft Agent Framework 1.0: Semantic Kernel Meets AutoGen

![Microsoft Agent Framework architecture]({IMG.format(seed="msagentframework")})

In April 2026, Microsoft shipped **Agent Framework 1.0** (MIT license), the long-awaited merger of Semantic Kernel and AutoGen. The result is a unified framework for .NET, Python, and Java teams building enterprise agents.

## The merger logic

Semantic Kernel brought the "skills as AI prompts + code functions" model and the Planner that chains them into workflows. AutoGen brought multi-agent conversation and the message-passing loop. Agent Framework 1.0 combines both: a single runtime where a Planner can orchestrate multiple conversational agents.

## What shipped in 1.0

- **Native MCP support** — connect any Model Context Protocol server.
- **Native A2A (agent-to-agent) protocol** — agents talk to each other and to external agents.
- **Three-language parity** — C#, Python, and Java all first-class.
- **Deep Azure OpenAI integration** — for organizations already on Azure.

## Who it is for

Teams embedded in the Microsoft ecosystem — .NET shops, Azure-heavy enterprises, and organizations where Java is still the backbone. The framework meets them where they are instead of demanding a Python migration.

## The honest tradeoff

For greenfield Python-only projects, LangGraph or CrewAI often have a faster on-ramp and a larger community. Microsoft Agent Framework's value proposition is enterprise integration and multi-language parity, not being the lightest option.

## The signal

Microsoft consolidating its AI story into one MIT-licensed framework is significant. It removes the "which one do I use?" confusion that plagued the SK/AutoGen era.""",
        ["open-source", "ai", "agents", "microsoft"],
        "2026-07-27",
    ),
    post(
        "open-source-google-adk-2-0",
        "Google ADK 2.0: Four-Language Agent Parity",
        "Google's open-source Agent Development Kit hit 2.0 with Python, TypeScript, Java, and Go all at parity.",
        f"""# Google ADK 2.0: Four-Language Agent Parity

![Google ADK multi-language]({IMG.format(seed="googleadk")})

Google's open-source **Agent Development Kit (ADK)** reached 2.0 in 2026, and it is the only major agent framework with **four language SDKs at parity**: Python and TypeScript (both 2.0), Java 1.0 (March 2026), and Go 2.0 (June 2026).

## The unified Workflow Runtime

ADK 2.0's headline is a graph-based Workflow Runtime with a slider from **dynamic, model-led reasoning** to **strict, deterministic flows**. You choose how much autonomy the agent has per step — a genuinely useful dial that other frameworks force you to pick a side on.

## Native A2A

Agent-to-agent protocol support is baked in, not bolted on. Agents can delegate to and coordinate with other agents, including those built on different frameworks.

## Ecosystem connectors

The February 2026 Tools & Integrations release added GitHub, Jira, MongoDB, and five observability platforms as first-class connectors. The Agent Designer in the Google Cloud console gives a visual builder for those who want it.

## The Gemini angle

The best experience is inside the Gemini Enterprise Agent Platform, which raises the fair question of how "open" the open-source story is when the polish lives in the proprietary product. The ADK itself is genuinely open and works with any LLM, but the gravitational pull toward Gemini is real.

## Who it is for

Teams that want multi-language parity and a single framework across polyglot organizations. If you are Python-only, LangGraph is more battle-tested; if you are TS-only, Mastra is lighter. ADK's win is breadth.""",
        ["open-source", "ai", "agents", "google"],
        "2026-07-23",
    ),
    post(
        "open-source-mastra-1-0-typescript",
        "Mastra 1.0: The TypeScript-First Agent Framework",
        "Built by the Gatsby team, Mastra hit 1.0 in January 2026 and became the go-to for TS/JS teams building edge agents.",
        f"""# Mastra 1.0: The TypeScript-First Agent Framework

![Mastra TypeScript agents]({IMG.format(seed="mastra")})

Mastra, built by the team behind Gatsby and backed by Y Combinator and a $13M seed, hit version 1.0 in January 2026. It has since pulled over 1.77 million monthly NPM downloads. Its niche: **TypeScript-first agent development**.

## Why TypeScript-first matters

Most agent frameworks are Python-first, with TS as a port. Mastra inverts that. For JS/TS teams — which is most of the web — this means no context-switching, native ESM, and edge-deployment as a first-class target.

## The API surface

Mastra's fluent API reads like promises:

```ts
agent
  .then(stepA)
  .branch({{ cond: stepB }})
  .parallel([stepC, stepD])
  .network(otherAgent)
```

This composes naturally into existing TS codebases without the ceremony of graph definitions.

## Edge deployment

Because it is TS and lightweight, Mastra agents run on edge runtimes — Cloudflare Workers, Vercel Edge, Deno Deploy. That is a genuine differentiator for latency-sensitive, globally-distributed agent workloads.

## When to pick it

- Your stack is TypeScript end-to-end.
- You want to deploy agents to the edge.
- You prefer fluent, promise-like APIs over graph definitions.

## The honest caveat

Mastra is younger than LangGraph and has fewer production war stories. For the most demanding stateful workflows, LangGraph's maturity still wins. Mastra's bet is that TS-native DX and edge deployment matter more for a large class of agent apps — and the download numbers suggest the bet is paying off.""",
        ["open-source", "ai", "agents", "typescript", "mastra"],
        "2026-07-17",
    ),
    post(
        "open-source-openai-agents-sdk-sandbox",
        "OpenAI Agents SDK Adds Sandbox Execution and TypeScript Parity",
        "The official lightweight agent framework now runs code in Docker and UnixLocal sandboxes, with TS at parity.",
        f"""# OpenAI Agents SDK Adds Sandbox Execution

![OpenAI Agents SDK sandbox]({IMG.format(seed="openaiagents")})

In April 2026, OpenAI's **Agents SDK** — the small, official Python framework for multi-agent workflows — shipped sandboxed execution and TypeScript parity. It remains the quickest path for a single agent that calls a few tools.

## Sandboxed execution

The SDK can now run agent-generated code in three backends:

- **UnixLocal** — process-level isolation on the same machine.
- **Docker** — container isolation, the production default.
- **Hosted backends** — managed sandboxes for teams that do not want to operate infra.

This unlocks the "agent that writes and runs code" pattern safely — the core capability behind coding agents.

## Built-in tracing

The SDK ships observability: every tool call, handoff, and model invocation is traced. For teams building their first agent, this is the difference between a black box and a debuggable system.

## Input/output guardrails

Define validators that run on agent input and output. A guardrail can reject a response before it reaches the user — useful for content policy, format enforcement, and safety.

## TypeScript parity

The TS port reached feature parity, so JS teams get the same primitives without waiting for a Python port lag.

## When to pick it

- You want the official, minimal path.
- You have a single agent with a few tools (no complex graph).
- You value tracing and guardrails without a third-party observability stack.

## When to look elsewhere

For complex multi-agent orchestration, CrewAI or LangGraph offer more. For type-safe Python DX, Pydantic AI is sharper. The Agents SDK's virtue is smallness and officialness — it does the basics extremely well.""",
        ["open-source", "ai", "agents", "openai"],
        "2026-07-13",
    ),
    post(
        "open-source-claude-agent-sdk-subagents",
        "Claude Agent SDK Adds Hierarchical Subagents and Fallback Chains",
        "Anthropic's MIT-licensed SDK gained three-level subagents, fallback model chains, and an MCP marketplace.",
        f"""# Claude Agent Agent SDK Adds Hierarchical Subagents

![Claude Agent SDK hierarchy]({IMG.format(seed="claudeagents")})

In June 2026, Anthropic's **Claude Agent SDK** (MIT license) shipped hierarchical subagents up to three levels deep, fallback model chains, and an MCP marketplace. It is the best Anthropic-native primitives for agent builders.

## Hierarchical subagents

A root agent can delegate to subagents, which can delegate further — up to three levels. Each subagent has its own tools, context, and instructions. This models real organizational hierarchies: a "lead" agent breaks down work, delegates to specialists, and synthesizes results.

## Fallback model chains

Define an ordered list of models. If the primary fails (rate limit, timeout, content filter), the SDK automatically retries with the next. This is the production resilience pattern that was previously hand-rolled.

```ts
const agent = createAgent({{
  model: chain(['claude-opus', 'claude-sonnet', 'claude-haiku']),
  // ...
}})
```

## MCP marketplace

The MCP (Model Context Protocol) ecosystem got a marketplace: browse and install tool servers the way you would browser extensions. A coding agent can pick up a GitHub MCP server, a filesystem server, and a database server in minutes.

## When to pick it

- You are building on Anthropic models (the SDK is Anthropic-native).
- You want hierarchical delegation without building it yourself.
- Resilience via fallback chains matters for your SLA.

## The open-source angle

Anthropic releasing this under MIT, with a marketplace, is a meaningful bet on openness. The SDK works with other model providers, but the deepest integration is, naturally, with Claude.""",
        ["open-source", "ai", "agents", "anthropic", "claude"],
        "2026-07-09",
    ),
    post(
        "open-source-llamaindex-workflows-1-0",
        "LlamaIndex Workflows 1.0: Event-Driven, Async-First Agents",
        "The RAG-grounded agent framework hit 1.0 with an event-driven, async-first runtime in Python and TypeScript.",
        f"""# LlamaIndex Workflows 1.0: Event-Driven, Async-First Agents

![LlamaIndex Workflows event loop]({IMG.format(seed="llamaindex")})

LlamaIndex Workflows 1.0, released in June 2026, is the **RAG-grounded** agent framework. Where LangGraph is graph-shaped and CrewAI is role-shaped, LlamaIndex Workflows is **event-driven and async-first**.

## The event-driven model

Workflows are composed of event handlers. A handler receives an event, does work, and emits the next event. This maps naturally onto streaming, human-in-the-loop, and any system where work is triggered by external signals.

```python
@workflow.event_handler(QueryEvent)
async def on_query(ev: QueryEvent) -> ResponseEvent:
    docs = await retriever.retrieve(ev.query)
    answer = await llm.complete(ev.query, context=docs)
    return ResponseEvent(answer)
```

## RAG is the center

LlamaIndex's heritage is retrieval. Workflows 1.0 bakes retrieval, reranking, and citation into the agent loop. If your agent's job is to answer from your documents, this is the most batteries-included option.

## Python and TypeScript parity

Both SDKs shipped at 1.0 together — no port lag. The TS version is not a second-class citizen, which matters for full-stack teams.

## When to pick it

- Your agent is fundamentally a RAG agent (answer questions from your data).
- You need streaming and event-driven control flow.
- You want retrieval and citation handled, not hand-rolled.

## When to look elsewhere

For agents that are primarily tool-calling or coding (not retrieval), LangGraph or the OpenAI Agents SDK are leaner. LlamaIndex Workflows' strength is exactly its name: grounded, retrieval-first workflows.""",
        ["open-source", "ai", "agents", "llamaindex", "rag"],
        "2026-06-29",
    ),
    post(
        "open-source-pydantic-ai-v2",
        "Pydantic AI V2: Type-Safe Agent Development Done Right",
        "From the team behind Pydantic, V2 brings structured validated output, self-correction, and real testing tools.",
        f"""# Pydantic AI V2: Type-Safe Agent Development Done Right

![Pydantic AI type-safe agents]({IMG.format(seed="pydanticai")})

Pydantic AI V2 (MIT license), from the team behind Pydantic, is the standout for developers who care about **type safety and clean DX**. It leans on Python type hints for structured, validated output and self-correction.

## Structured, validated output

Define your expected output as a Pydantic model. The agent's response is validated against it; if validation fails, the SDK can self-correct by re-prompting. No more parsing JSON and praying.

```python
class ResearchSummary(BaseModel):
    summary: str
    sources: list[str]
    confidence: float

result = await agent.run("Summarize...", result_type=ResearchSummary)
# result.data is a typed ResearchSummary, validated
```

## TestModel: unit-test agents without burning LLM calls

Pydantic AI V2 ships `TestModel`, a mock that lets you unit-test agent logic without real API calls. This is the testing story agent frameworks have desperately needed — fast, deterministic, free tests.

## Self-correction

When the model's output fails validation, the SDK automatically feeds the validation error back and asks for a corrected response, up to a configurable retry limit. This dramatically improves reliability for structured tasks.

## When to pick it

- You are Python-first and value type safety.
- Structured, validated output is core to your use case.
- You want real unit tests for agent logic.

## When to look elsewhere

Pydantic AI is Python-only. For TS, Mastra or the OpenAI Agents SDK are the typed options. For complex multi-agent orchestration, CrewAI or LangGraph offer more topology primitives.

## The 2026 take

Pydantic AI V2 is the framework for engineers who treat agents like production software — typed, tested, validated. That discipline is what separates toy agents from reliable ones.""",
        ["open-source", "ai", "agents", "python", "pydantic"],
        "2026-06-19",
    ),
    post(
        "open-source-deer-flow-bytedance",
        "ByteDance Open-Sources Deer-Flow 2.0, Tops GitHub Trending",
        "ByteDance's Deer-Flow 2.0 hit #1 on GitHub Trending within 24 hours of release — a research agent framework at scale.",
        f"""# ByteDance Open-Sources Deer-Flow 2.0

![Deer-Flow research agent]({IMG.format(seed="deerflow")})

In mid-2026, ByteDance open-sourced **Deer-Flow 2.0**, a research-focused agent framework that topped GitHub Trending within 24 hours and crossed 77,000 stars by July. It is the most-starred new agent project of the year.

## What Deer-Flow is

Deer-Flow is built for **deep research workflows** — the kind where an agent must browse, read, synthesize, and cite across many sources over an extended run. Think "produce a literature review" or "compile a competitive landscape report," not "answer a quick question."

## Why it went viral

- It solved a real, felt problem: long-horizon research that single-shot LLMs handle poorly.
- The open-source release included the full stack — not a teaser — including the planning and citation components.
- ByteDance's credibility (TikTok's recommendation ML pedigree) signaled production-grade engineering.

## The architecture

Deer-Flow separates **planning** (decompose the research question into sub-queries), **execution** (run sub-agents that browse and read), and **synthesis** (merge and cite). Each stage is observable, which is critical for trust in research outputs.

## The citation angle

A research agent without citations is a fancy hallucination machine. Deer-Flow's synthesis stage produces source-linked output, which is the difference between a tool you can ship and one you cannot.

## The honest caveat

Virality is not the same as production maturity. As of mid-2026, Deer-Flow has fewer enterprise war stories than LangGraph. But for the research-workload niche, it is the most capable open-source option, and the community momentum is real.""",
        ["open-source", "ai", "agents", "bytedance", "research"],
        "2026-06-12",
    ),

    # ────────────────────────────────────────────────────────────────────────
    # CATEGORY 5 — OPEN SOURCE AI AGENTS (10 posts)
    # ────────────────────────────────────────────────────────────────────────
    post(
        "openhands-open-source-dev-agent",
        "OpenHands: The Open-Source Devin Heir",
        "OpenHands (72k+ stars) is the legitimate open-source heir to the autonomous coding agent concept. Here is what it offers.",
        f"""# OpenHands: The Open-Source Devin Heir

![OpenHands autonomous coding agent]({IMG.format(seed="openhands")})

OpenHands, from All-Hands-AI, sits at over 72,000 GitHub stars in 2026 and is widely regarded as the **legitimate open-source heir to the Devin concept** — autonomous software development that does not lock you into a proprietary service.

## Four deployment modes

OpenHands is uniquely flexible in how you run it:

1. **Python SDK** — define programmable agents for integration into your own systems.
2. **CLI** — terminal use, comparable to Claude Code or Codex, for the individual developer.
3. **Desktop GUI** — a React frontend for those who want a visual interface.
4. **Cloud platform** — with Slack, Jira, and Linear integrations for team workflows.

## The deployment flexibility story

A freelancer can start with the CLI and the free cloud tier. An agency can scale up to self-hosted Kubernetes with multi-user support. The same agent code scales from a laptop to a fleet — that is rare and valuable.

## What it excels at

Autonomous software development tasks: debugging, refactoring entire codebases, implementing features from specs, writing tests. The agent can read a repo, make a plan, execute it, and open a PR.

## The open-source moat

Being open-source means you can audit the agent's behavior, run it on your own infrastructure (critical for code that touches proprietary repos), and contribute back. The cloud tier is a convenience, not a lock-in.

## Honest limits

Like all coding agents, OpenHands is best on a branch with human review. It is a force multiplier for a skilled engineer, not a replacement for one. The teams winning with it treat it like a fast, capable junior who still needs review.

> The future of coding is not agents replacing engineers — it is engineers steering agents. OpenHands is the open way to do that.""",
        ["open-source", "ai", "agents", "openhands", "coding"],
        "2026-08-06",
    ),
    post(
        "autogpt-open-source-agent-2026",
        "AutoGPT: The Original Open-Source Agent, Still Evolving",
        "AutoGPT remains one of the most-starred open-source agent projects. A look at where it is in 2026.",
        f"""# AutoGPT: The Original Open-Source Agent, Still Evolving

![AutoGPT autonomous agent]({IMG.format(seed="autogpt")})

AutoGPT — the project that ignited the "give an LLM a goal and let it run" wave in 2023 — remains one of the most-starred open-source agent projects on GitHub in 2026. It has evolved considerably from the viral demo that made it famous.

## The original idea

AutoGPT's pitch was simple and electrifying: give a language model a goal in natural language, and let it plan, use tools, and iterate toward that goal autonomously. The early versions were rough — loops that spiraled, tools that failed silently — but the concept was undeniable.

## Where it is in 2026

The project matured:

- **Better planning** — the planning loop is more robust, with checkpoints and recovery.
- **Stable tool interfaces** — the footguns that caused early agents to fail are addressed.
- **Deployment options** — run locally or via managed infrastructure.
- **A community of patterns** — three years of "what works" distilled into documentation.

## The honest assessment

AutoGPT's influence outsized its reliability. Many teams that tried it in 2023 moved to LangGraph or CrewAI for production. But the project kept iterating, and for certain open-ended, goal-driven tasks, it remains a compelling choice — especially if you want the pure "autonomous agent" mental model.

## The legacy

Even teams that do not run AutoGPT owe it a debt: it popularized the agent loop, the tool-use pattern, and the idea that an LLM could drive its own execution. The entire 2026 agent ecosystem grew from the seed AutoGPT planted.""",
        ["open-source", "ai", "agents", "autogpt"],
        "2026-08-03",
    ),
    post(
        "metagpt-software-company-agent",
        "MetaGPT: An Open-Source Software Company in a Box",
        "MetaGPT models an entire software company — PM, architect, engineer — as collaborating agents. 67k stars and counting.",
        f"""# MetaGPT: An Open-Source Software Company in a Box

![MetaGPT multi-agent software company]({IMG.format(seed="metagpt")})

MetaGPT, at over 67,000 GitHub stars in 2026, takes the multi-agent metaphor to its logical extreme: it models an **entire software company** as collaborating agents — a product manager, an architect, engineers, even QA.

## The metaphor

Where CrewAI lets you define arbitrary roles, MetaGPT ships a pre-built org chart. You give it a requirement; the "PM" agent writes a PRD, the "architect" designs the system, "engineers" implement, and "QA" tests. Each agent has a defined responsibility and produces a standard artifact.

## Standardized outputs

The genius is in the standardization. The PM produces a PRD in a known format, which the architect consumes to produce a design doc in a known format, which engineers consume to produce code. The artifacts chain together because their shapes are agreed.

## When it works

- Greenfield projects where you want a full vertical slice from requirement to code.
- Prototyping — MetaGPT can produce a working scaffold fast.
- Teaching — the role decomposition is a great mental model for how software gets built.

## The honest limits

Real software development is messier than an org chart. Existing codebases, legacy constraints, and unspoken requirements do not fit the clean PM→architect→engineer flow. MetaGPT shines on greenfield and struggles on the messy middle of real engineering.

## The takeaway

MetaGPT's contribution is the demonstration that structured multi-agent collaboration, with standardized handoff artifacts, produces more coherent results than a single agent trying to do everything. That lesson applies even if you never run MetaGPT itself.""",
        ["open-source", "ai", "agents", "metagpt", "multi-agent"],
        "2026-07-25",
    ),
    post(
        "smolagents-minimal-code-first",
        "Smolagents: Minimal, Code-First Agents from Hugging Face",
        "Hugging Face's smolagents keeps the agent loop tiny and code-first — the anti-framework for single-agent simplicity.",
        f"""# Smolagents: Minimal, Code-First Agents

![Smolagents minimal agent loop]({IMG.format(seed="smolagents")})

Smolagents, from Hugging Face, is the **minimalist** of the open-source agent world. Where other frameworks add graphs, roles, and runtimes, smolagents keeps the agent loop tiny and code-first. It is the anti-framework for single-agent simplicity.

## The code-first philosophy

Instead of JSON tool schemas and configuration files, smolagents agents write and execute Python code as their action. The "tool" is the Python interpreter itself, plus whatever functions you expose. This is more flexible and less brittle than schema-driven tool use.

```python
from smolagents import CodeAgent, HfApiModel

agent = CodeAgent(tools=[search, calculator], model=HfApiModel())
agent.run("What is 23 * 47 plus the population of France?")
```

## Why minimalism wins

For a single agent that calls a few tools, the ceremony of a full framework is pure overhead. Smolagents gets you running in minutes, with a codebase small enough to actually read and understand.

## The Hugging Face angle

Being from Hugging Face means first-class integration with the HF model hub — you can run agents on open models without an API key to a proprietary provider. For privacy-sensitive or offline work, this is significant.

## When to pick it

- Single agent, a few tools, no complex topology.
- You value a small, auditable codebase.
- You want to run on open models via Hugging Face.

## When to look elsewhere

For multi-agent orchestration, stateful graphs, or enterprise integration, smolagents is the wrong tool — by design. It is the scalpel to LangGraph's Swiss army knife.

## The takeaway

Not every agent needs a framework. Sometimes the minimal loop — model, tools, iterate — is exactly right. Smolagents is the reminder that simplicity is a feature.""",
        ["open-source", "ai", "agents", "smolagents", "huggingface"],
        "2026-07-21",
    ),
    post(
        "agno-lightweight-python-agents",
        "Agno: Lightweight, High-Performance Python Agents",
        "Agno (formerly Phidata) runs agents in under 2 microseconds with built-in memory, storage, and multimodal tools.",
        f"""# Agno: Lightweight, High-Performance Python Agents

![Agno high-performance agent runtime]({IMG.format(seed="agno")})

Agno (formerly Phidata) is the **lightweight, high-performance** option for Python agent teams. Its headline: agents that run in under 2 microseconds, with built-in memory, storage, and multimodal tool support.

## The performance bet

Agno's pitch is that most agent overhead is framework, not model. By keeping the runtime minimal, it lets the model call dominate latency — meaning your agent's perceived speed is bounded by the LLM, not the glue code.

## Built-in primitives

- **Memory** — short-term conversation and long-term recall, no extra service.
- **Storage** — persist agent state across runs.
- **Multimodal tools** — image, audio, and structured data handling.

## The AgentOS runtime

Beyond the SDK, Agno ships **AgentOS**, a self-hostable runtime for teams that want memory, tracing, and APIs running entirely on their own infrastructure. No vendor lock-in, no data leaving your network.

## When to pick it

- Performance is a hard requirement (high-throughput agent serving).
- You need self-hosted everything (compliance, privacy).
- You want memory and storage without bolting on a vector DB and a session store.

## When to look elsewhere

Agno is Python-only and lightweight by design. For complex multi-agent orchestration, CrewAI or LangGraph have richer topology primitives. For TS, look to Mastra.

## The 2026 positioning

Agno (alongside OpenClaw) represents the "minimal but complete" end of the agent spectrum — fewer abstractions, more primitives, raw speed. For teams whose agent workload is "many fast calls" rather than "few complex graphs," it is the right fit.""",
        ["open-source", "ai", "agents", "agno", "python"],
        "2026-07-16",
    ),
    post(
        "openclaw-privacy-first-agent",
        "OpenClaw: The Privacy-First Agent That Connects 50+ Apps",
        "OpenClaw is a viral, privacy-first agent that connects 50+ apps without calling any external API.",
        f"""# OpenClaw: The Privacy-First Agent That Connects 50+ Apps

![OpenClaw privacy-first agent integrations]({IMG.format(seed="openclaw")})

OpenClaw went viral in 2026 as a **privacy-first agent** that connects over 50 apps — email, calendar, files, chat — **without calling any external API**. All processing happens locally; no data leaves your machine.

## The privacy proposition

Most "personal AI" agents route your data through a cloud LLM. OpenClaw inverts this: integrations run locally, and the LLM call (if any) is to a model you control. For users and organizations with data sovereignty requirements, this is the difference between "useful tool" and "non-starter."

## The 50+ integrations

OpenClaw's breadth is its strength. A single agent can read your email, check your calendar, search your files, and message your team — all from a local runtime. The integrations are open and community-contributed.

## Why it went viral

- Privacy anxiety is at an all-time high; "your data never leaves your machine" is a powerful pitch.
- The integration breadth rivals commercial personal-assistant products.
- Being open-source means the privacy claims are auditable, not marketing.

## When to pick it

- Data sovereignty is non-negotiable (regulated industries, personal privacy).
- You want a personal assistant that touches many local apps.
- You are willing to run a local LLM or accept the latency that implies.

## The honest tradeoff

Local-first means you shoulder the compute. A local model is slower and less capable than frontier cloud models. OpenClaw's value is privacy and integration breadth, not raw intelligence — and for a large class of personal-assistant tasks, that is exactly the right trade.""",
        ["open-source", "ai", "agents", "openclaw", "privacy"],
        "2026-07-08",
    ),
    post(
        "semantic-kernel-enterprise-dotnet",
        "Semantic Kernel: Enterprise AI for the .NET World",
        "Microsoft's Semantic Kernel remains the enterprise choice for embedding AI in .NET and Java stacks.",
        f"""# Semantic Kernel: Enterprise AI for the .NET World

![Semantic Kernel enterprise architecture]({IMG.format(seed="semantickernel")})

Semantic Kernel, Microsoft's enterprise-oriented agent framework at over 28,000 stars, remains the primary choice for organizations embedding AI into **existing enterprise infrastructure** — particularly .NET and Java shops.

## The "skills" model

Semantic Kernel organizes AI capabilities as **skills** — a mix of AI prompts and regular code functions. A **Planner** component chains these skills into multi-step workflows. This maps cleanly onto how enterprises already think about capabilities and composition.

## Three-language support

It is the only major agent framework with first-class support for **C#, Python, and Java**. For organizations where .NET is the backbone and Java still runs critical systems, this is not a nice-to-have — it is the requirement that rules out Python-only frameworks.

## Deep Azure integration

Semantic Kernel integrates deeply with Azure OpenAI Service. For organizations already on Azure — and there are many — this means identity, logging, and compliance flow through existing pipelines instead of new ones.

## The Agent Framework merger

In 2026, Semantic Kernel was folded into the broader **Microsoft Agent Framework 1.0**, which merged it with AutoGen. Semantic Kernel's skills model and AutoGen's multi-agent conversation now coexist under one runtime. Existing SK code paths forward-compatible.

## When to pick it

- You are a .NET or Java shop.
- Azure is your cloud.
- You need AI to fit into existing enterprise patterns, not the other way around.

## The honest caveat

For greenfield Python or TS projects, Semantic Kernel is heavier than the alternatives. Its value is enterprise integration and multi-language parity, not being the lightest or fastest to prototype.""",
        ["open-source", "ai", "agents", "semantic-kernel", "dotnet"],
        "2026-06-27",
    ),
    post(
        "autogen-legacy-multi-agent",
        "AutoGen / AG2: The Legacy Multi-Agent Option",
        "AutoGen (now AG2) pioneered message-passing multi-agent loops. Still relevant for existing v0.2 codebases in 2026.",
        f"""# AutoGen / AG2: The Legacy Multi-Agent Option

![AutoGen message-passing agents]({IMG.format(seed="autogen")})

AutoGen — now maintained as AG2 under Apache 2.0 — is the **legacy option** for teams with existing v0.2 multi-agent code. It pioneered the message-passing multi-agent loop and remains relevant in 2026, even as newer frameworks have surpassed it.

## The original contribution

AutoGen's breakthrough was modeling multiple agents that communicate by passing messages in a loop. Each agent can respond, reflect, or call tools based on its internal logic. This was the foundation of the "agents talking to agents" paradigm that defines the field.

## Async collaboration

AutoGen's asynchronous agent collaboration made it particularly useful for **research and prototyping** — scenarios where agent behavior requires experimentation or iterative refinement. You could let agents argue, reflect, and converge.

## Where it stands in 2026

- For **new projects**, most teams now choose CrewAI (role-based) or LangGraph (graph-based) over AutoGen.
- For **existing v0.2 codebases**, AutoGen/AG2 remains the migration-friendly path — rewriting working multi-agent code in a new framework is risky.
- **MCP integration** landed via an extension module, so AutoGen agents can connect to MCP servers.

## The Microsoft merger

Much of AutoGen's forward energy was absorbed into Microsoft Agent Framework 1.0, which merged it with Semantic Kernel. AG2 continues as the community-maintained line for those not on the Microsoft framework.

## When to pick it

- You have existing AutoGen v0.2 code and want incremental evolution, not a rewrite.
- You need the message-passing loop model specifically.

## The takeaway

AutoGen's influence is cemented even if its mindshare has waned. The patterns it pioneered — agents as message-passing peers, reflective loops — are now table stakes across every framework.""",
        ["open-source", "ai", "agents", "autogen", "multi-agent"],
        "2026-06-15",
    ),
    post(
        "vibe-trading-open-source-agents",
        "Vibe-Trading and the Rise of Open-Source Trading Agents",
        "Vibe-Trading topped GitHub Trending in July 2026 — open-source agents for autonomous trading crossed 23k stars.",
        f"""# Vibe-Trading and the Rise of Open-Source Trading Agents

![Open-source trading agent architecture]({IMG.format(seed="vibetrading")})

In July 2026, **Vibe-Trading** topped GitHub Trending, jumping from 3,200 to over 23,000 stars in days. AI-Trader sat at over 20,000. Open-source autonomous trading agents crossed from niche to mainstream in a matter of weeks.

## What these projects do

They are agent frameworks — built on the open-source agent stack (LangGraph, CrewAI, or custom loops) — that connect to exchanges, read market data, form hypotheses, and place trades autonomously. The "vibe" framing signals the casual, experimental spirit: let an agent trade based on its read of the market.

## Why the sudden spike

- The underlying agent frameworks matured enough that financial use cases became feasible.
- Open financial data (crypto exchanges, public market APIs) meant no expensive data licenses were required to prototype.
- The "vibe coding" movement generalized into "vibe X" — including trading.

## The serious caveats

Autonomous trading with real money is dangerous. Open-source trading agents are research projects, not financial products:

- **No backtesting guarantees** — past performance, future results, etc.
- **Execution risk** — bugs cost real money, immediately.
- **Market impact** — an agent's orders move the very market it is trading.

## The responsible take

These projects are fascinating for understanding how agents handle uncertain, adversarial, real-time environments. They are educational and research tools. Running one with real capital, without exhaustive backtesting and risk controls you understand, is a fast way to lose money.

> The market is the most ruthless eval an agent will ever face. Treat it accordingly.""",
        ["open-source", "ai", "agents", "trading", "news"],
        "2026-07-12",
    ),
    post(
        "mcp-model-context-protocol-2026",
        "MCP Won the Agent Tooling Standard in 2026",
        "The Model Context Protocol went from Anthropic proposal to universal agent-tool interface in under two years.",
        f"""# MCP Won the Agent Tooling Standard in 2026

![MCP ecosystem diagram]({IMG.format(seed="mcp")})

The **Model Context Protocol (MCP)**, originally an Anthropic proposal, became the de facto standard for connecting agents to tools and data sources in 2026. Every major agent framework now ships native or first-class MCP support.

## What MCP is

MCP is a protocol — not a framework — that standardizes how an agent discovers and calls external tools. An MCP server exposes a set of tools; any MCP-compatible agent can use them. This decouples tool authoring from agent authoring.

## Why it won

- **Anthropic open-sourced it** early, avoiding vendor lock-in stigma.
- **The problem was real** — every framework had its own tool-definition format, fragmenting the ecosystem.
- **Network effects** — once a few frameworks adopted it, tool authors wrote to MCP, which pulled in more frameworks.

## The 2026 state

- LangGraph, CrewAI, AutoGen, Claude Agent SDK, OpenAI Agents SDK, Microsoft Agent Framework, Google ADK — all ship native MCP.
- An **MCP marketplace** emerged (via the Claude Agent SDK) for browsing and installing tool servers.
- Common tools — GitHub, filesystem, databases, browsers — are available as drop-in MCP servers.

## What this means for builders

You write a tool once, as an MCP server, and any agent can use it. You no longer maintain N framework-specific integrations. This is the same consolidation that ODBC brought to databases, applied to agent tooling.

## The honest caveat

MCP standardizes the wire, not the semantics. A tool that returns malformed data will still confuse an agent. Protocol adoption does not absolve you of writing good tool descriptions and validating I/O.

> A standard is only as good as the tools that implement it. MCP's win is making those tools portable.""",
        ["open-source", "ai", "agents", "mcp", "standards"],
        "2026-06-05",
    ),
]


def main() -> None:
    existing = json.loads(BLOG_JSON.read_text())
    existing_slugs = {p["slug"] for p in existing}
    new = [p for p in POSTS if p["slug"] not in existing_slugs]
    merged = existing + new
    BLOG_JSON.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n")
    print(f"Existing: {len(existing)}  New added: {len(new)}  Total: {len(merged)}")


if __name__ == "__main__":
    main()
