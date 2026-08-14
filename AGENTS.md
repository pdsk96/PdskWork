# PdskWork — Agent Memory

Cyberpunk-themed portfolio/work app. Stack: Next.js 16 (App Router, Turbopack), React 19,
React Three Fiber, Framer Motion. Iteration-driven development from `.hermes/pdsk_work_master_spec.md`.

## Next.js 16 critical notes (read node_modules/next/dist/docs/ before coding)
- Turbopack is the default bundler for `next dev` and `next build`. No `--turbopack` flag needed.
- Async Request APIs are mandatory: `cookies()`, `headers()`, `params`, `searchParams` must be `await`ed.
- `next lint` is removed. Use ESLint CLI directly. `next build` no longer runs lint.
- Middleware is renamed to **Proxy** (`proxy.ts` at project root or `src/` root).
- ESLint Flat Config (`eslint.config.mjs`) is the default.
- Node.js 20.9+ required.
- `serverRuntimeConfig`/`publicRuntimeConfig` removed — use env vars / `NEXT_PUBLIC_*`.
- Concurrent dev/build: `next dev` outputs to `.next/dev`.

## Project conventions
- Source lives under `src/` (`src/app`, `src/components`, `src/i18n`, `src/lib`).
- i18n: cookie + context based, locales `en` and `id` (dictionaries in `src/i18n/dictionaries.ts`).
- Admin auth: HMAC-signed httpOnly cookie; protected via `src/proxy.ts`.
- DB schema: `src/db/schema.sql`; connection helper in `src/lib/db.ts`.
- Accessibility: honor `prefers-reduced-motion`, AA contrast, alt text, focus-visible states.
- Do NOT break existing API routes, DB schema, admin auth, i18n (en/id), or .gitignore.

## Iteration 1 notes (cyberpunk motion foundation)
- Motion components: `CyberHero` (R3F), `GlitchText`, `GlassPanel`, `BentoGrid`.
- `HeroScene.tsx` was removed (superseded by `CyberHero`).
- R3F `useScroll`-linking: use `scrollYProgress` (0..1), NOT `scrollY` (pixels).
- Gate R3F `<Canvas>` on a WebGL-support probe to avoid unhandled rejection in
  WebGL-less environments (headless browsers, some devices).
- drei v10 exports: `PerformanceMonitor`, `AdaptiveDpr`, `Float`, `Sparkles`,
  `Environment`. `ScrollControls`/`useScroll` are NOT in drei — use framer-motion.
- `motion[as]` (framer-motion) does not accept arbitrary DOM props (e.g. `id`);
  forward them explicitly in the component's prop type.
- GitHub push: `GITHUB_TOKEN` here has NO oauth scopes (403 on push). Use
  `GITHUB_PAT_KEY` (has `repo` scope) for pushes/PR API via
  `git remote set-url origin https://${GITHUB_PAT_KEY}@github.com/...`.
- ESLint CLI crashes with a circular-structure error (eslint-config-next vs
  ESLint 9) — pre-existing on master; `next build` TS check is the gate.
- PR #1 tracks branch `canvas/iterasi-1` -> `master`; update it, don't recreate.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
