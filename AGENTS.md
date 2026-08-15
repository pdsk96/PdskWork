# PdskWork — Agent Memory

Cyberpunk-themed portfolio/work app. Stack: Next.js 16.3 (App Router, Turbopack), React 19,
React Three Fiber, **Motion** (formerly Framer Motion). Iteration-driven development from `.hermes/pdsk_work_master_spec.md`.

## Next.js 16 critical notes (read node_modules/next/dist/docs/ before coding)
- Turbopack is the default bundler for `next dev` and `next build`. No `--turbopack` flag needed.
- Async Request APIs are mandatory: `cookies()`, `headers()`, `params`, `searchParams` must be `await`ed.
- `next lint` is removed. Use ESLint CLI directly. `next build` no longer runs lint.
- Middleware is renamed to **Proxy** (`proxy.ts` at project root or `src/` root).
- ESLint Flat Config (`eslint.config.mjs`) is the default.
- Node.js 20.9+ required.
- `serverRuntimeConfig`/`publicRuntimeConfig` removed — use env vars / `NEXT_PUBLIC_*`.
- Concurrent dev/build: `next dev` outputs to `.next/dev`.
- `next/image` `priority` is **deprecated** in Next 16+ → use `preload`.
- `partialPrefetching` **requires** `cacheComponents: true` (both top-level config, not `experimental.*`).

## Iteration 3 — Cache Components + perf (applied, build green)
- `next.config.ts`: `cacheComponents: true` + `partialPrefetching: true` enabled.
- `export const dynamic = 'force-dynamic'` is **incompatible** with `cacheComponents` — removed from ALL pages + route handlers. Pages reading `cookies()` auto-become dynamic (per-session shell); GET route handlers that do async file I/O / `Math.random()` / `headers()` auto-stop prerendering. Use `connection()` from `next/server` to force request-time when no dynamic API is used.
- With cacheComponents, route build output shows: `◐ (Partial Prerender)` = static HTML + dynamic server-streamed content (desired). `○ (Static)`, `ƒ (Dynamic)`.
- `loading.tsx` files stream a fallback for fast LCP. **loading.tsx is a Server Component** — do NOT use `styled-jsx` there; put styles in `globals.css`.
- `WebVitals.tsx` (client, `'use client'`) uses `useReportWebVitals` from `next/web-vitals`; optional `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` for RUM.
- `LazyMotion` + `domAnimation` (strict) in root layout shrinks the Motion client bundle; components must use `m.div` (lazy) not `motion.div` (full) inside it.
- Animation lib migrated: `framer-motion` → `motion/react` (package `motion`, rebrand). `useReducedMotion`, `useScroll`, `useTransform`, `useMotionValue`, `useSpring`, `m`, `LazyMotion`, `domAnimation` all exported from `motion/react`.
- CyberBackground `dpr={[1, 1.75]}` (was `[1,2]`) — lighter on high-DPI mobile for the 5-octave FBM shader. CyberHero keeps `[1,2]` + `<AdaptiveDpr>` + `<PerformanceMonitor>`.

## Iteration 4 — engagement & comfort features (applied, build green)
- **Theme toggle** (dark/light cyberpunk): `ThemeProvider`+`ThemeToggle`, no-flash inline script in `<head>`, persists to `pdsk-theme` cookie + localStorage. Light = softer "neon-on-ink" palette (AA contrast).
- **Ambient sound**: `AmbientSound` — Web Audio API drone (2 detuned saw + slow LFO low-pass), default muted, lazy AudioContext on first enable, reduced-motion zeroes LFO. No audio files.
- **Reading progress**: `ReadingProgress` — neon bar top of viewport, scroll-driven.
- **Back-to-top**: `BackToTop` — floating button after 600px scroll, smooth (or instant when reduced-motion).
- **Share buttons**: `ShareButtons` — copy link (+toast) + X/LinkedIn/WhatsApp.
- **Site footer**: `SiteFooter` — bilingual, tagline + quick nav + share + RSS link + copyright.
- **SEO/RSS**: `sitemap.ts`, `robots.ts`, `feed.xml/route.ts` (RSS 2.0). `metadata.alternates` links the feed.
- **i18n expanded**: dictionaries gained a `ui` block (en+id) for all new feature labels. Existing keys untouched. Language toggle (EN/ID) already in nav.
- All new components are `'use client'` where they need browser APIs / context; CSS in `globals.css` (no styled-jsx in server components).
- Cache Components gotcha: `new Date()` in a Client Component aborts prerender (`/_not-found`) → defer to `useEffect`.

## Project conventions
- Source lives under `src/` (`src/app`, `src/components`, `src/i18n`, `src/lib`).
- i18n: cookie + context based, locales `en` and `id` (dictionaries in `src/i18n/dictionaries.ts`).
- Admin auth: HMAC-signed httpOnly cookie; protected via `src/proxy.ts`.
- DB schema: `src/db/schema.sql`; connection helper in `src/lib/db.ts`.
- Accessibility: honor `prefers-reduced-motion`, AA contrast, alt text, focus-visible states.
- Do NOT break existing API routes, DB schema, admin auth, i18n (en/id), or .gitignore.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
