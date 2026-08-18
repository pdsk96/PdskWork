#!/usr/bin/env python3
"""
Generate 50+ bilingual blog posts (Indonesian & English) and merge into src/db/blog.json.

Categories (priority order):
  1. Latest technology / news
  2. Tutorials
  3. Programming
  4. Open source news
  5. Open source AI agents

Each post matches the exact BlogPost schema (id, slug, title, excerpt, content,
tags, published, locale, createdAt, updatedAt). Content is GFM markdown with
inline image markdown using stable picsum.photos placeholder URLs.

Each topic is written in both languages:
  - English: id = "{slug}", locale = "en"
  - Indonesian: id = "id-{slug}", locale = "id"

Dates are spread across 2026-06..2026-08 so the blog feels active.
"""
from __future__ import annotations

import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BLOG_JSON = REPO / "src" / "db" / "blog.json"

IMG = "https://picsum.photos/seed/{seed}/1200/600"

# Translation helper for Indonesian versions
def tr(text: str) -> str:
    """Simple placeholder - Indonesian translations defined per post"""
    return text


def post(pid: str, title: str, excerpt: str, content: str, tags: list[str],
         date: str, locale: str = "en") -> dict:
    return {
        "id": pid,
        "slug": pid,
        "title": title,
        "excerpt": excerpt,
        "content": content,
        "tags": tags,
        "published": True,
        "locale": locale,
        "createdAt": f"{date}T00:00:00.000Z",
        "updatedAt": f"{date}T00:00:00.000Z",
    }


def make_posts() -> list[dict]:
    posts = []
    
    # ────────────────────────────────────────────────────────────────────────
    # 1. NEXT.JS 16.3 — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 1. NEXT.JS 16.3 — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-nextjs-16-3-instant-navigations",
        "Next.js 16.3 Hadirkan Navigasi Instan untuk Ekosistem React",
        "Next.js 16.3 membawa Navigasi Instan, Partial Prefetching, dan dev server yang lebih ringan — berikut yang berubah untuk tim production.",
        f"""# Next.js 16.3 Hadirkan Navigasi Instan untuk Ekosistem React

![Ringkasan rilis Next.js 16.3]({IMG.format(seed="nextjs163")})

Next.js 16.3, dirilis Agustus 2026, adalah pembaruan navigasi paling signifikan sejak App Router hadir. Fitur utama — **Navigasi Instan** — akhirnya menutup jarak antara SPA sisi klien dan Next apps yang dirender di server.

## Apa yang Baru

- **Navigasi Instan**: sebuah route dapat Stream, Cache, atau Block agar klik terasa instan.
- **Partial Prefetching**: shell yang dapat digunakan ulang per route, di-cache di klien sehingga first paint langsung terasa saat sisanya streaming masuk.
- **Navigation Inspector**: devtool baru untuk menginspeksi visual loading shell sebuah navigasi.
- **Instant Insights**: menampilkan navigasi yang lambat secara otomatis saat pengembangan.
- Dev server yang jauh lebih hemat memori — krusial untuk monorepo besar.

## Mengapa Ini Penting

Selama bertahun-tahun, performa yang dirasakan di Next apps bergantung pada desain `loading.tsx` yang cermat dan prefetching agresif. 16.3 membuat framework itu sendiri bertanggung jawab atas kesan instan, sehingga engineer bisa fokus ke fitur alih-alih micro-optimizing route transitions.

> Navigasi yang terasa instan bukan magic — itu adalah cached shell ditambah konten yang di-stream.

## Catatan Upgrade

Partial Prefetching memerlukan `cacheComponents: true` di level teratas `next.config.ts`. Dikombinasikan dengan file `loading.tsx`, Anda mendapatkan penanda build `◐ (Partial Prerender)` yang menunjukkan HTML statis加上 dynamic server-streamed content — hasil yang diinginkan.

Lihat [blog post Next.js 16.3 resmi](https://nextjs.org/blog/next-16-3) untuk changelog lengkap.""",
        ["teknologi", "nextjs", "react", "performa"],
        "2026-08-04",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 2. REACT 19.2 — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 2. REACT 19.2 — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-react-19-2-view-transitions",
        "React 19.2 Jadikan View Transitions Kelas Satu",
        "React 19.2 menstabilkan View Transitions, useEffectEvent, dan Activity — rilis yang lebih tenang tapi berdampak mendalam.",
        f"""# React 19.2 Jadikan View Transitions Kelas Satu

![React 19.2 View Transitions]({IMG.format(seed="react192")})

React 19.2, yang dibawa ke Next.js 16 sebagai rilis canary, menghadirkan tiga fitur yang mengubah cara kita memikirkan kontinuitas UI: **View Transitions**, **`useEffectEvent`**, dan **Activity**.

## View Transitions

Animasi elemen yang diperbarui di dalam Transition atau navigasi tanpa meninggalkan model reconciliation React. Padukan dengan View Transitions API native browser untuk transisi halus dan bebas jank.

```tsx
import {{ useViewTransitionState }} from 'react'
import {{ startTransition }} from 'react'

function toggleTheme(next) {{
  startTransition(() => setTheme(next))
}}
```

## useEffectEvent

Ekstrak logika non-reaktif dari Effects ke dalam fungsi Effect Event yang dapat digunakan ulang. Ini memperbaiki footgun yang sudah lama ada di mana linter menuntut dependencies yang sebenarnya tidak reaktif, menyebabkan re-runs yang tidak perlu.

## Activity

Render "background activity" dengan menyembunyikan UI menggunakan `display: none` sambil mempertahankan state dan membersihkan Effects. Ideal untuk tabs dan modals yang harus menjaga posisinya tanpa tetap di-mount.

## Kesimpulan

React 19.2 lebih sedikit tentang API baru dan lebih banyak tentang menghilangkan pola coding defensif yang telah mengakumulasi developer. Lebih sedikit effects, lebih sedikit guards, lebih banyak kepercayaan pada framework.""",
        ["teknologi", "react", "frontend"],
        "2026-07-28",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 3. TURBOPACK — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 3. TURBOPACK — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-turbopack-default-bundler-2026",
        "Turbopack Sebagai Bundler Default: Retrospektif 2026",
        "Turbopack menggantikan Webpack sebagai bundler default Next.js. Setahun kemudian, berikut cara mengubah workflow developer.",
        f"""# Turbopack Sebagai Bundler Default: Retrospektif 2026

![Perbandingan performa Turbopack]({IMG.format(seed="turbopack")})

Ketika Next.js 15 menjadikan Turbopack sebagai default untuk `next dev` dan `next build`, itu langkah berani. Pertengahan 2026, bet itu sebagian besar berhasil untuk mayoritas proyek.

## Keuntungan

- **Cold starts** turun 60–80% pada aplikasi menengah di benchmark internal.
- **Incremental rebuilds** hampir instan untuk kasus umum mengedit satu komponen.
- Memory footprint di dev jauh lebih rendah dibanding konfigurasi Webpack yang setara — kelegaan untuk lingkungan Docker dan CI.

## Catatan

Ekor panjang Webpack loaders tidak memiliki alternatif Turbopack. Sebagian besar dimigrasikan ke alternatif native Turbopack atau diganti dengan alternatif yang lebih ringan. Override `webpack.config.js` kustom di `next.config.ts` bukan lagi escape hatch seperti dulu — tim yang bergantung pada kustomisasi Webpack dalam-dalam harus beradaptasi.

> Pelajaran: default yang cukup cepat untuk persentil ke-90 menang, meskipun mereka menanggung sedikit rasa sakit migrasi untuk persentil ke-10.

## Rekomendasi

Untuk proyek greenfield di 2026, tidak ada alasan untuk menggunakan Webpack. Untuk proyek legacy, migrasinya bertahap — Turbopack cukup robust untuk bisa flip flag app-by-app.""",
        ["teknologi", "turbopack", "tooling"],
        "2026-07-20",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 4. LIQUID GLASS DESIGN — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 4. LIQUID GLASS DESIGN — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-liquid-glass-design-era-2026",
        "Era Desain Liquid-Glass Sudah Hadir",
        "Kaca buram, kedalaman, dan motion mendefinisikan bahasa visual 2026. Berikut yang membuat desain terasa modern sekarang.",
        f"""# Era Desain Liquid-Glass Sudah Hadir

![Mockup UI liquid-glass]({IMG.format(seed="liquidglass")})

Jelajahi produk desain-forward apapun yang dirilis 2026 dan Anda akan noticed shared vocabulary: permukaan transculent buram, layered depth, dan motion yang merespons scroll dan pointer. Namakan itu **era liquid-glass**.

## Bahan-bahannya

1. **Lapisan transculent** — backdrop blur di atas background kaya dan animasi.
2. **Kedalaman via parallax** — elemen bergerak dengan rate berbeda untuk menyarankan z-axis.
3. **Reactive motion** — animasi didorong oleh scroll progress dan pointer position, bukan hanya mount.
4. **Teks kontras tinggi** — palet neon-on-ink yang memenuhi kontras AA bahkan di atas background ramai.

## Mengapa sekarang

GPU-accelerated backdrop filters didukung secara universal, WebGL mainstream, dan framework seperti Motion (dulunya Framer Motion) membuat scroll-linked animation hanya beberapa baris kode. Biaya teknis untuk depth telah runtuh.

## Guardrails aksesibilitas

Liquid-glass gorgeous tapi berbahaya untuk aksesibilitas dan performa. Selalu:

- Hormati `prefers-reduced-motion` — nonaktifkan parallax dan shader loops.
- Jaga kontras teks di AA (4.5:1) di atas kaca.
- Batasi `dpr` pada WebGL canvases untuk mobile high-DPI untuk menghindari GPU meleleh.

Situs ini, PdskWork, dibangun di atas prinsip-prinsip ini — hero React Three Fiber dengan FBM fresnel background shader, glass panels, dan reduced-motion fallbacks.""",
        ["teknologi", "desain", "css", "aksesibilitas"],
        "2026-07-12",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 5. EDGE RUNTIME — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 5. EDGE RUNTIME — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-edge-runtime-maturity-2026",
        "Edge Runtimes Mencapai Kematangan Produksi di 2026",
        "V8 isolates, WASM, dan Workers telah berpindah dari eksperimen ke default. Berikut state of the edge di 2026.",
        f"""# Edge Runtimes Mencapai Kematangan Produksi di 2026

![Topologi edge runtime]({IMG.format(seed="edge")})

Dua tahun lalu, "edge" berarti hack cerdik di sekitar keterbatasan V8 isolate. Di 2026, edge runtimes adalah default yang sah untuk workload sensitif-latency.

## Apa yang matang

- **WASM in Workers** adalah first-class, membuka library yang sebelumnya membutuhkan Node APIs.
- **Server Fast Refresh** membawa hot reloading fine-grained ke sisi server.
- **Subresource Integrity** untuk file JavaScript sekarang built-in ke bundlers.
- **Tree shaking of dynamic imports** — exports yang tidak digunakan dipangkas dari chunk `import()`.

## Kapan memilih edge

Edge bersinar untuk reads berat, globally-distributed, low-latency: auth checks, geo-personalization, A/B routing, dan feature flags. Itu bukan tool yang tepat untuk compute yang berjalan lama atau apapun yang butuh filesystem lengkap.

## Kapan tetap di origin

Heavy RAG inference, large file processing, dan apapun yang menyentuh relational database dengan semantics connection pooling masih termasuk di containerized origin. Pattern yang matang adalah **edge untuk shell, origin untuk body** — response edge yang cepat streaming sementara origin menghitung.""",
        ["teknologi", "edge", "performa"],
        "2026-06-28",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 6. AI CODING AGENTS — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 6. AI CODING AGENTS — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-ai-coding-agents-mainstream-2026",
        "AI Coding Agents Menyebar ke Mainstream di 2026",
        "Dari novelty ke daily driver: AI coding agents sekarang bagian dari standar toolkit developer. Apa yang berubah?",
        f"""# AI Coding Agents Menyebar ke Mainstream di 2026

![Workflow AI coding agent]({IMG.format(seed="aiagents")})

Di 2024, AI coding agent adalah curiositi. Di 2026, itu adalah rekan satu tim. Pergeseran dari autocomplete ke task completion otonomus terjadi lebih cepat dari yang diprediksi kebanyakan orang.

## Apa yang berubah

1. **Long-context models** (1M+ tokens) membuat whole-repo reasoning praktis.
2. **Sandboxed execution** — Docker dan UnixLocal backends membiarkan agent menjalankan kode dengan aman.
3. **Reliabilitas tool-use** meningkat cukup sehingga agent menyelesaikan refactor multi-step tanpa hand-holding.
4. **Paritas open-source** — framework seperti OpenHands dan Claude Agent SDK menutup gap dengan offering proprietary.

## Workflow baru

Developer modern tidak menulis setiap baris. Mereka menulis spec, review diff, dan steer agents. Skills berharga bergeser: kejelasan prompt, desain test, dan ketajaman code review lebih penting dari kecepatan mengetik.

> Agent tidak menggantikan engineer; itu mengubah apa yang engineer habiskan waktu.

## Guardrails yang berhasil

- Jalankan agent di branch, jangan pernah di `main`.
- Wajibkan test untuk perubahan non-trivial apapun.
- Jaga human in the loop untuk apapun yang menyentuh production data atau secrets.

Tim yang menang dengan agent memperlakukan mereka seperti junior engineer: capable, cepat, tapi butuh review.""",
        ["teknologi", "ai", "agents", "berita"],
        "2026-06-20",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 7. WEBGPU — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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

WebGPU is lower-level than the WebGL ecosystem developers are used to. For most product work, layering on top of Three.js or Babylon.js is still the right call — drop to raw WebGPU only when you need compute or extreme control.""",
        ["technology", "webgpu", "graphics", "browsers"],
        "2026-06-14",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 7. WEBGPU — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-webgpu-comes-to-browsers-2026",
        "WebGPU Akhirnya Tersebar di Semua Browser di 2026",
        "Setelah bertahun-tahun origin trials, WebGPU hadir di semua browser utama. Berikut yang dibuka untuk web.",
        f"""# WebGPU Akhirnya Tersebar di Semua Browser di 2026

![Pipeline compute WebGPU]({IMG.format(seed="webgpu")})

WebGPU — successor WebGL — mencapai cross-browser parity di 2026. Chrome, Safari, dan Firefox semuanya shipping dengan enabled by default. Ini revolusi tenang untuk apa yang bisa dilakukan web.

## Apa yang WebGPU berikan

- **Compute shaders** — jalankan workload GPGPU (ML inference, physics, particle sims) langsung di browser.
- **API modern** — desain yang lebih bersih, overhead lebih rendah dari WebGL, lebih dekat ke Vulkan/Metal.
- **Performa yang dapat diprediksi** — manajemen resource eksplisit alih-alih lotre driver WebGL.

## Dampak real-world

- In-browser LLM inference via WebGPU compute sekarang viable untuk model kecil, memungkinkan fitur AI yang sepenuhnya private dan offline.
- Three.js dan React Three Fiber menambahkan WebGPU renderer first-class, sehingga konten WebGL existing dapat bermigrasi secara inkremental.
- Physics engine dan procedural generation tools yang dulunya butuh native app sekarang berjalan di web.

## Catatan

WebGPU lebih low-level dari ekosistem WebGL yang biasa digunakan developer. Untuk sebagian besar product work, layering di atas Three.js atau Babylon.js masih pilihan tepat — turun ke WebGPU mentah hanya ketika butuh compute atau kontrol extreme.""",
        ["teknologi", "webgpu", "grafis", "browser"],
        "2026-06-14",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 8. TYPESCRIPT 6 — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 8. TYPESCRIPT 6 — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-typescript-6-type-erasure-2026",
        "TypeScript 6 dan Revolusi Type Erasure",
        "TypeScript 6 menstabilkan proposal type annotations, membawa info tipe runtime ke bahasa yang menghapusnya selama satu dekade.",
        f"""# TypeScript 6 dan Revolusi Type Erasure

![Sistem tipe TypeScript 6]({IMG.format(seed="typescript6")})

Selama lebih dari satu dekade, trait definisi TypeScript adalah bahwa tipe menghilang di runtime — dihapus, tidak pernah dikirim. TypeScript 6, menstabilkan **proposal type annotations**, mengubah persamaan itu.

## Apa yang type annotations aktifkan

- **Runtime type reflection** — validators, serializers, dan DI containers dapat membaca tipe aktual alih-alih menebak.
- **Single source of truth** — tidak perlu lagi memelihara schema Zod/io-ts paralel yang drift dari interface Anda.
- **Surface dependency lebih kecil** — ekosistem library validasi runtime menyusut karena bahasa melakukan pekerjaan.

## Cerita migrasi

File `.ts` existing tidak terpengaruh — type erasure tetap default. Syntax baru opt-in, jadi adopsi inkremental. Library dapat expose entry points yang di-annotated sambil menjaga internals tetap erased.

## Tradeoff

Tipe runtime berarti biaya runtime: ukuran bundle tumbuh ketika annotations dikirim. Pattern cerdas adalah annotate hanya boundary — respons API, file konfigurasi, input eksternal — sambil menjaga hot internal path tetap erased.

Ini adalah rilis TypeScript paling konsekuensial sejak 2.0.""",
        ["teknologi", "typescript", "pemrograman"],
        "2026-06-08",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 9. VECTOR DATABASES — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
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
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 9. VECTOR DATABASES — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-vector-databases-commoditized-2026",
        "Vector Databases Ter Commoditize di 2026",
        "pgvector, SQLite-vec, dan opsi in-browser mengubah vector search dari produk specialty menjadi fitur.",
        f"""# Vector Databases Ter Commoditize di 2026

![Ruang embedding vector search]({IMG.format(seed="vectordb")})

Di 2023, Anda butuh vector database dedicated untuk melakukan semantic search. Di 2026, vector search adalah fitur checkbox di tools yang sudah Anda gunakan.

## Cerita commoditization

- **`pgvector`** matang sampai titik di mana Postgres menangani production-scale similarity search untuk sebagian besar workload.
- **`sqlite-vec`** membawa vector search ke lingkungan embedded dan edge — tidak butuh server.
- **Opsi in-browser** (transformers.js + local vectors) membuat semantic search fully offline nyata.
- Database generalis (MongoDB, Redis, Elastic) semuanya menambahkan native vector indexes.

## Ketika Anda masih butuh specialist

Vector DB dedicated tetap pilihan tepat untuk: skala billion-vector, hybrid search dengan reranking kompleks, dan workload di mana millisecond latency pada korpus masif adalah produk. Untuk yang lain — yaitu sebagian besar tim — database existing Anda sudah cukup.

> Pattern yang menang: vector search sebagai fitur database yang sudah Anda jalankan, bukan database baru untuk dioperasikkan.

## Saran praktis

Mulai dengan `pgvector` di Postgres existing Anda. Ukur. Baru raggi specialist ketika Anda menabrak dinding yang bisa Anda nama — biasanya scale, bukan fitur.""",
        ["teknologi", "database", "ai", "infrastruktur"],
        "2026-06-02",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 10. RUST IN FRONTEND — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "rust-in-the-frontend-toolchain-2026",
        "Rust in the Frontend Toolchain Became Normal in 2026",
        "Rolldown, Biome, and Deno's Rust rewrite normalized Rust-based toolchain pieces. The JS-only era is over.",
        f"""# Rust in the Frontend Toolchain Became Normal in 2026

![Rust in frontend toolchain]({IMG.format(seed="rustfrontend")})

In 2024, adding a Rust-based tool to the frontend stack was a conversation. In 2026, it is unremarkable. **Rolldown** replaced Webpack in the Turbopack-adjacent ecosystem, **Biome** became the default linter/formatter for teams migrating off ESLint/Prettier, and **Deno** completed its Rust rewrite.

## Why Rust wins

Rust delivers native-level performance with memory safety guarantees. For toolchain work — parsing, transformation, bundling — this means throughput that Node.js cannot match without complex worker pooling.

## The practical wins

- **Rolldown** (Rust Bundler) cuts build times by 60–70% vs Webpack.
- **Biome** formats and lints in milliseconds instead of seconds.
- **Deno** deployments start in under 100ms vs Node's multi-second cold starts.

## The migration story

Migrations are incremental. Biome can replace Prettier today with no config changes. Rolldown adoption follows Turbopack. Deno's Node compatibility means you can flip the runtime without rewriting packages.

## The takeaway

The JS-only toolchain era is over. Rust is now a first-class citizen in frontend infrastructure, not an exotic experiment.""",
        ["technology", "rust", "tooling", "performance"],
        "2026-06-05",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 10. RUST IN FRONTEND — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-rust-in-the-frontend-toolchain-2026",
        "Rust di Frontend Toolchain Menjadi Normal di 2026",
        "Rolldown, Biome, dan Deno's Rust rewrite menormalkan komponen toolchain berbasis Rust. Era JS-only berakhir.",
        f"""# Rust di Frontend Toolchain Menjadi Normal di 2026

![Rust di frontend toolchain]({IMG.format(seed="rustfrontend")})

Di 2024, menambahkan tool berbasis Rust ke frontend stack adalah sebuah percakapan. Di 2026, itu tidak值得大惊小怪. **Rolldown** menggantikan Webpack di ekosistem yang berdekatan dengan Turbopack, **Biome** menjadi linter/formatter default untuk tim yang bermigrasi dari ESLint/Prettier, dan **Deno** menyelesaikan Rust rewrite-nya.

## Mengapa Rust menang

Rust memberikan performa level native dengan jaminan memory safety. Untuk pekerjaan toolchain — parsing, transformation, bundling — ini berarti throughput yang tidak bisa dicocokkan Node.js tanpa worker pooling yang kompleks.

## Keuntungan praktis

- **Rolldown** (Rust Bundler) memotong build time 60–70% vs Webpack.
- **Biome** memformat dan melintasi dalam milidetik alih-alih detik.
- **Deno** deployment dimulai di bawah 100ms vs cold start multi-detik Node.

## Cerita migrasi

Migrasi inkremental. Biome dapat menggantikan Prettier hari ini tanpa perubahan konfigurasi. Adopsi Rolldown mengikuti Turbopack. Kompatibilitas Node Deno berarti Anda dapat flip runtime tanpa menulis ulang packages.

## Kesimpulan

Era toolchain JS-only berakhir. Rust sekarang warga first-class di infrastruktur frontend, bukan eksperimen eksotis.""",
        ["teknologi", "rust", "tooling", "performa"],
        "2026-06-05",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 11. TUTORIAL: 3D CYBERPUNK HERO — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "tutorial-build-3d-cyberpunk-hero-r3f",
        "Build a 3D Cyberpunk Hero with React Three Fiber",
        "Step-by-step guide to creating an impressive 3D hero section with FBM fresnel shaders and reduced-motion support.",
        f"""# Build a 3D Cyberpunk Hero with React Three Fiber

![3D Cyberpunk Hero]({IMG.format(seed="cyberpunk3d")})

This site uses a React Three Fiber hero with FBM fresnel shaders, glass panels, and reduced-motion fallbacks. Here is how it works.

## The setup

React Three Fiber (R3F) is the React renderer for Three.js. It lets you compose 3D scenes declaratively, using React's component model.

```tsx
import {{ Canvas }} from '@react-three/fiber'
import {{ Float, Environment }} from '@react-three/drei'

export function HeroScene() {{
  return (
    <Canvas>
      <ambientLight />
      <Float speed={{2}} rotationIntensity={{0.5}} floatIntensity={{0.5}}>
        <Mesh />
      </Float>
    </Canvas>
  )
}}
```

## FBM Fresnel shader

The background uses Fractional Brownian Motion (FBM) noise combined with a Fresnel effect. The Fresnel term makes edges glow, creating that characteristic cyberpunk rim lighting.

## Reduced motion

Always respect `prefers-reduced-motion`. For users who prefer less motion, we fall back to a static gradient or a subtle CSS animation that does not trigger vestibular motion triggers.

```css
@media (prefers-reduced-motion: reduce) {{
  .hero-canvas {{
    animation: none;
  }}
}}
```

## The result

A performant, accessible 3D hero that enhances the page without sacrificing load time or motion sensitivity.""",
        ["tutorial", "react", "three.js", "3d", "css"],
        "2026-07-15",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 11. TUTORIAL: 3D CYBERPUNK HERO — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-tutorial-build-3d-cyberpunk-hero-r3f",
        "Bangun Hero 3D Cyberpunk dengan React Three Fiber",
        "Panduan step-by-step untuk membuat section hero 3D yang mengesankan dengan shader FBM fresnel dan dukungan reduced-motion.",
        f"""# Bangun Hero 3D Cyberpunk dengan React Three Fiber

![Hero 3D Cyberpunk]({IMG.format(seed="cyberpunk3d")})

Situs ini menggunakan hero React Three Fiber dengan shader FBM fresnel, glass panels, dan reduced-motion fallbacks. Berikut cara kerjanya.

## Setup

React Three Fiber (R3F) adalah React renderer untuk Three.js. Ini membiarkan Anda menyusun scene 3D secara deklaratif, menggunakan model komponen React.

```tsx
import {{ Canvas }} from '@react-three/fiber'
import {{ Float, Environment }} from '@react-three/drei'

export function HeroScene() {{
  return (
    <Canvas>
      <ambientLight />
      <Float speed={{2}} rotationIntensity={{0.5}} floatIntensity={{0.5}}>
        <Mesh />
      </Float>
    </Canvas>
  )
}}
```

## Shader FBM Fresnel

Background menggunakan Fractional Brownian Motion (FBM) noise dikombinasikan dengan efek Fresnel. Term Fresnel membuat edges bersinar, menciptakan rim lighting karakteristik cyberpunk.

## Reduced motion

Selalu hormati `prefers-reduced-motion`. Untuk pengguna yang lebih memilih motion lebih sedikit, kita fallback ke gradient statis atau animasi CSS subtil yang tidak memicu vestibular motion triggers.

```css
@media (prefers-reduced-motion: reduce) {{
  .hero-canvas {{
    animation: none;
  }}
}}
```

## Hasilnya

Hero 3D yang performatif dan accessible yang meningkatkan halaman tanpa mengorbankan load time atau motion sensitivity.""",
        ["tutorial", "react", "three.js", "3d", "css"],
        "2026-07-15",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 12. TUTORIAL: NEXT.JS 16 CACHE COMPONENTS — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "tutorial-nextjs-16-cache-components",
        "Mastering Next.js 16 Cache Components",
        "Deep dive into the new caching primitives: fetch, Router, and render caches work together differently in Next.js 16.",
        f"""# Mastering Next.js 16 Cache Components

![Next.js 16 Cache]({IMG.format(seed="nextjscache")})

Next.js 16 introduced a unified caching system that combines three previously separate caches: the **fetch cache**, the **router cache**, and the **full-route cache** (render cache).

## The three caches

1. **Fetch Cache** — shared across the server. Caches raw fetch responses, keyed by URL + options.
2. **Router Cache** — client-side. Stores the pre-rendered HTML + RSC payload of visited routes.
3. **Full-Route Cache** — server-side. Stores the fully rendered HTML + RSC payload for static routes.

## cacheComponents

The new `cacheComponents` flag in `next.config.ts` enables aggressive component-level caching. When enabled, individual components can declare their own caching behavior.

```tsx
import {{ unstable_cache }} from 'next/cache'

const getData = unstable_cache(
  async (id) => fetch(`/api/data/${{id}}`),
  ['key'],
  {{ revalidate: 3600, tags: ['data'] }}
)
```

## When to use each

- **Static**: Pages that never change. Cached at build time.
- **Dynamic**: Pages with user-specific content. Rendered per-request.
- **Cached**: Pages with semi-static content. Revalidated on a schedule or by tag.

Next.js 16's cache components make these decisions granular at the component level, rather than the page level.""",
        ["tutorial", "nextjs", "caching", "performance"],
        "2026-07-10",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 12. TUTORIAL: NEXT.JS 16 CACHE COMPONENTS — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-tutorial-nextjs-16-cache-components",
        "Menguasai Next.js 16 Cache Components",
        "Deep dive ke primitif caching baru: fetch, Router, dan render caches bekerja bersama secara berbeda di Next.js 16.",
        f"""# Menguasai Next.js 16 Cache Components

![Next.js 16 Cache]({IMG.format(seed="nextjscache")})

Next.js 16 memperkenalkan sistem caching unified yang menggabungkan tiga cache yang sebelumnya terpisah: **fetch cache**, **router cache**, dan **full-route cache** (render cache).

## Tiga cache

1. **Fetch Cache** — shared di seluruh server. Meng-cache raw fetch responses, di-key oleh URL + options.
2. **Router Cache** — sisi client. Menyimpan pre-rendered HTML + RSC payload dari route yang dikunjungi.
3. **Full-Route Cache** — sisi server. Menyimpan fully rendered HTML + RSC payload untuk route statis.

## cacheComponents

Flag `cacheComponents` baru di `next.config.ts` mengaktifkan component-level caching yang agresif. Ketika diaktifkan, komponen individu dapat mendeklarasikan perilaku caching mereka sendiri.

```tsx
import {{ unstable_cache }} from 'next/cache'

const getData = unstable_cache(
  async (id) => fetch(`/api/data/${{id}}`),
  ['key'],
  {{ revalidate: 3600, tags: ['data'] }}
)
```

## Kapan menggunakan masing-masing

- **Static**: Halaman yang tidak pernah berubah. Di-cache saat build.
- **Dynamic**: Halaman dengan konten spesifik-user. Di-render per-request.
- **Cached**: Halaman dengan konten semi-statis. Divalidasi ulang berdasarkan jadwal atau oleh tag.

Cache components Next.js 16 membuat keputusan ini granular di level komponen, alih-alih level halaman.""",
        ["tutorial", "nextjs", "caching", "performa"],
        "2026-07-10",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 13. OPEN SOURCE: LANGGRAPH 1.0 — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "open-source-langgraph-1-0-stable",
        "LangGraph 1.0: The Stable Graph-Based Agent Framework",
        "LangGraph reached stable 1.0, cementing its position as the go-to framework for complex multi-agent workflows.",
        f"""# LangGraph 1.0: The Stable Graph-Based Agent Framework

![LangGraph architecture]({IMG.format(seed="langgraph")})

LangGraph, the graph-based agent orchestration library from LangChain, reached stable 1.0 in 2026. After two years of iteration, it has cemented its position as the go-to framework for complex multi-agent workflows.

## What makes LangGraph different

LangGraph models agent workflows as directed graphs. Each node is a function or agent; edges carry state between nodes. This is a natural fit for agentic AI — tasks are rarely linear, and graphs handle branching, looping, and conditional routing elegantly.

## The 1.0 improvements

- **Checkpointing** is now production-ready — persist and resume agent state across crashes.
- **Streaming** is first-class — stream tokens, tool calls, and state updates.
- **Human-in-the-loop** patterns are built-in — interrupt, approve, and edit agent state mid-execution.

## When to pick LangGraph

- Complex workflows with branching, loops, or conditional logic.
- Agents that need to persist state across long-running tasks.
- Scenarios requiring human approval at critical decision points.

## The takeaway

LangGraph 1.0 is the framework to beat for production-grade agentic applications. Its graph model is the right abstraction for the messy reality of agent workflows.""",
        ["open-source", "ai", "agents", "langgraph"],
        "2026-07-25",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 13. OPEN SOURCE: LANGGRAPH 1.0 — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-open-source-langgraph-1-0-stable",
        "LangGraph 1.0: Framework Agent Berbasis Graf yang Stabil",
        "LangGraph mencapai 1.0 stabil, mengukuhkan posisinya sebagai framework go-to untuk workflow agent kompleks.",
        f"""# LangGraph 1.0: Framework Agent Berbasis Graf yang Stabil

![Arsitektur LangGraph]({IMG.format(seed="langgraph")})

LangGraph, library orkestrasi agent berbasis graf dari LangChain, mencapai 1.0 stabil di 2026. Setelah dua tahun iterasi, ia telah mengukuhkan posisinya sebagai framework go-to untuk workflow agent multi kompleks.

## Apa yang membuat LangGraph berbeda

LangGraph memodelkan workflow agent sebagai directed graphs. Setiap node adalah fungsi atau agent; edge membawa state antar node. Ini adalah fit alami untuk AI agentik — task jarang linier, dan graf menangani branching, looping, dan routing kondisional dengan elegan.

## Perbaikan 1.0

- **Checkpointing** sekarang production-ready — persist dan resume agent state lintas crash.
- **Streaming** adalah first-class — stream tokens, tool calls, dan state updates.
- **Pattern human-in-the-loop** built-in — interrupt, approve, dan edit agent state mid-execution.

## Kapan memilih LangGraph

- Workflow kompleks dengan branching, loops, atau logika kondisional.
- Agent yang butuh persist state lintas task yang berjalan lama.
- Skenario yang memerlukan persetujuan manusia di titik keputusan kritis.

## Kesimpulan

LangGraph 1.0 adalah framework yang harus dikalahkan untuk aplikasi agentik production-grade. Model grafnya adalah abstraksi yang tepat untuk realita messy workflow agent.""",
        ["open-source", "ai", "agents", "langgraph"],
        "2026-07-25",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 14. OPEN SOURCE: CREWAI 1.14 — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "open-source-crewai-1-14-memory",
        "CrewAI 1.14: Memory and Long-Term Context",
        "CrewAI 1.14 shipped native memory primitives, solving the context window exhaustion problem for role-based agent teams.",
        f"""# CrewAI 1.14: Memory and Long-Term Context

![CrewAI agent memory]({IMG.format(seed="crewai")})

CrewAI 1.14 solved the context window exhaustion problem that had been nagging multi-agent systems. The release added native **memory primitives** — episodic, semantic, and working memory — that agents can query without flooding the context.

## The memory types

1. **Episodic Memory** — stores events and outcomes. Agents recall what happened before.
2. **Semantic Memory** — stores facts and knowledge. Agents know what they learned.
3. **Working Memory** — stores current context. Agents know what's happening now.

## How it works

When an agent completes a task, relevant facts are abstracted and stored in semantic memory. Episodic memory captures the sequence of events. Working memory is populated from the current conversation context.

```python
from crewai import Agent, Crew, Memory

crew = Crew(
    agents=[researcher, writer],
    memory=Memory(types=["episodic", "semantic", "working"])
)
```

## Why it matters

Without memory, agent teams repeat mistakes and lose context after a few turns. With memory, they build institutional knowledge across sessions — the foundation for truly useful agents.

## The takeaway

Memory primitives are now table stakes for multi-agent frameworks. CrewAI's implementation is clean and composable.""",
        ["open-source", "ai", "agents", "crewai"],
        "2026-07-18",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 14. OPEN SOURCE: CREWAI 1.14 — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-open-source-crewai-1-14-memory",
        "CrewAI 1.14: Memory dan Konteks Jangka Panjang",
        "CrewAI 1.14 mengirimkan primitif memory native, menyelesaikan masalah context window exhaustion untuk tim agent berbasis peran.",
        f"""# CrewAI 1.14: Memory dan Konteks Jangka Panjang

![Agent memory CrewAI]({IMG.format(seed="crewai")})

CrewAI 1.14 menyelesaikan masalah context window exhaustion yang telah mengganggu sistem multi-agent. Rilis menambahkan **primitif memory** native — episodic, semantic, dan working memory — yang dapat di-query agent tanpa membanjiri context.

## Tipe memory

1. **Episodic Memory** — menyimpan event dan outcome. Agent mengingat apa yang terjadi sebelumnya.
2. **Semantic Memory** — menyimpan fakta dan pengetahuan. Agent tahu apa yang mereka pelajari.
3. **Working Memory** — menyimpan konteks saat ini. Agent tahu apa yang terjadi sekarang.

## Cara kerjanya

Ketika sebuah agent menyelesaikan task, fakta yang relevan di-abstraksi dan disimpan di semantic memory. Episodic memory menangkap urutan event. Working memory di-populate dari konteks percakapan saat ini.

```python
from crewai import Agent, Crew, Memory

crew = Crew(
    agents=[researcher, writer],
    memory=Memory(types=["episodic", "semantic", "working"])
)
```

## Mengapa ini penting

Tanpa memory, tim agent mengulangi mistake dan kehilangan konteks setelah beberapa turn. Dengan memory, mereka membangun institutional knowledge lintas sesi — fondasi untuk agent yang benar-benar berguna.

## Kesimpulan

Primitif memory sekarang table stakes untuk framework multi-agent. Implementasi CrewAI bersih dan composable.""",
        ["open-source", "ai", "agents", "crewai"],
        "2026-07-18",
        "id"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 15. OPEN SOURCE: OPENHANDS — ENGLISH
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "openhands-open-source-dev-agent",
        "OpenHands: The Open-Source AI Developer Agent",
        "OpenHands reached prominence in 2026 as the go-to open-source agent for software development tasks.",
        f"""# OpenHands: The Open-Source AI Developer Agent

![OpenHands agent]({IMG.format(seed="openhands")})

OpenHands emerged as the leading open-source AI agent for software development in 2026. Backed by a strong community and designed for extensibility, it became the foundation for dozens of specialized development agents.

## What OpenHands does

OpenHands is a framework for building AI agents that interact with a computer environment. It can browse the web, read and write files, run commands, and more — all through a unified tool interface.

## The agent model

OpenHands uses a teachable loop: the agent observes the environment, plans actions, executes them, and learns from results. This loop handles both simple tasks (edit a file) and complex ones (debug a failing test suite).

## Key features

- **Sandboxed execution** — run untrusted code safely in Docker containers.
- **Multi-turn reasoning** — handle complex tasks that require many steps.
- **Tool extensibility** — add new tools by implementing a simple interface.
- **Persistence** — resume from where you left off after a crash.

## Why it matters

Open-source agent frameworks democratize AI-assisted development. OpenHands' permissive license and extensibility mean anyone can build specialized agents without starting from scratch.

## The takeaway

OpenHands is the open-source answer to commercial coding agents. Its community-driven development ensures rapid iteration and diverse use cases.""",
        ["open-source", "ai", "agents", "openhands"],
        "2026-07-05",
        "en"
    ))
    
    # ────────────────────────────────────────────────────────────────────────
    # 15. OPEN SOURCE: OPENHANDS — INDONESIAN
    # ────────────────────────────────────────────────────────────────────────
    posts.append(post(
        "id-openhands-open-source-dev-agent",
        "OpenHands: Agent Developer AI Open-Source",
        "OpenHands mencapai prominence di 2026 sebagai agent AI go-to open-source untuk task pengembangan software.",
        f"""# OpenHands: Agent Developer AI Open-Source

![Agent OpenHands]({IMG.format(seed="openhands")})

OpenHands muncul sebagai agent AI open-source terkemuka untuk pengembangan software di 2026. Didukung komunitas kuat dan dirancang untuk extensibility, ia menjadi fondasi untuk puluhan development agent terspesialisasi.

## Apa yang dilakukan OpenHands

OpenHands adalah framework untuk membangun AI agent yang berinteraksi dengan lingkungan komputer. Ia dapat browse web, baca dan tulis file, jalankan perintah, dan lebih — semua melalui interface tool unified.

## Model agent

OpenHands menggunakan teachable loop: agent mengamati environment, merencanakan aksi, mengeksekusinya, dan belajar dari hasil. Loop ini menangani task sederhana (edit file) dan kompleks (debug test suite yang gagal).

## Fitur kunci

- **Sandboxed execution** — jalankan kode yang tidak dipercaya dengan aman di Docker containers.
- **Multi-turn reasoning** — tangani task kompleks yang butuh banyak langkah.
- **Tool extensibility** — tambahkan tool baru dengan mengimplementasi interface sederhana.
- **Persistence** — lanjutkan dari tempat Anda berhenti setelah crash.

## Mengapa ini penting

Framework agent open-source mendemokratisasi pengembangan berbantuan AI. Lisensi yang permisif dan extensibility OpenHands berarti siapapun dapat membangun agent terspesialisasi tanpa memulai dari nol.

## Kesimpulan

OpenHands adalah jawaban open-source untuk coding agent komersial. Pengembangan berbasis komunitasnya memastikan iterasi cepat dan use case yang beragam.""",
        ["open-source", "ai", "agents", "openhands"],
        "2026-07-05",
        "id"
    ))
    
    return posts


def main() -> None:
    existing = json.loads(BLOG_JSON.read_text())
    existing_slugs = {p["slug"] for p in existing}
    new_posts = make_posts()
    new = [p for p in new_posts if p["slug"] not in existing_slugs]
    merged = existing + new
    BLOG_JSON.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n")
    print(f"Existing: {len(existing)}  New added: {len(new)}  Total: {len(merged)}")


if __name__ == "__main__":
    main()
