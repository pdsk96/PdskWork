# PdskWork — Agent Memory
Selalu gunakan bahasa indonesia
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

## Iteration 5 — static export for Firebase free (Spark) plan (applied, build green)
- Target: deploy on Firebase Hosting **free Spark plan** on the default Firebase Hosting URL `https://pdskwork.web.app`. App Hosting/Cloud Functions need Blaze → not used. No custom domain. Refactor = full static export + Firestore client SDK + Firebase Auth (both free-tier).
- `next.config.ts`: `output: 'export'`, `images.unoptimized: true`, `distDir: 'out'`, `trailingSlash: false`. Removed `cacheComponents` + `partialPrefetching` (incompatible with export). Removed `output: 'standalone'`.
- **No server runtime.** Deleted: `src/proxy.ts` (Proxy/middleware), all `src/app/api/**` route handlers (blog CRUD, admin session, health), `src/lib/auth.ts` (cookie session), `src/i18n/locale-server.ts` (`cookies()`), `src/lib/blog-store.ts` (fs JSON), `src/lib/db.ts`, `apphosting.yaml`.
- **Two blog data paths**: `src/lib/blog-seed.ts` = build-time sync read of `src/db/blog.json` (used by `generateStaticParams`, `generateMetadata`, `sitemap.ts`, RSS). `src/lib/blog-firestore.ts` = runtime Firestore client SDK (same interface names: getAllPosts/getPublishedPosts/getPostBySlug/getPostById/createPost/updatePost/deletePost/slugify). Shared types in `src/lib/blog-types.ts`.
- **Admin auth = Firebase Auth** (email/password, client SDK) via `src/lib/use-admin-auth.ts` (`useAdminAuth` hook). Route protection is client-side `src/components/AdminGate.tsx` (redirects to `/admin/login?next=` if unauthed). No httpOnly cookie. Firestore rules (`firestore.rules`) require auth for writes; public read of published posts.
- **Public blog pages are client components** fetching Firestore on mount (`src/app/blog/page.tsx`, `src/components/BlogPostView.tsx`). `/blog/[slug]` page is a server component exporting `generateStaticParams` (seed slugs + a `_` placeholder) + `generateMetadata`, rendering the client `<BlogPostView>` which reads the slug from `window.location.pathname`.
- **Dynamic routes + static export**: unknown blog slugs (created post-deploy) have no static HTML → `firebase.json` rewrites `/blog/{slug}` → `/blog/_`; admin edit `/admin/blog/{id}/edit` → `/admin/blog/_/edit`. The client reads the real id/slug from the URL path. `generateStaticParams` for the edit route returns `[{ id: '_' }]`.
- `sitemap.ts` + `robots.ts`: added `export const dynamic = 'force-static'` (Next 16 requires explicit static opt-in for metadata routes under `output: 'export'`). Both read seed at build.
- **RSS**: route handler deleted (unsupported in export). `scripts/gen-feed.mjs` generates static `public/feed.xml` via `npm run prebuild`. Gitignored (regenerated each build). One-time Firestore seed via `scripts/seed-firestore.mjs` (`npm run seed:firestore`).
- i18n: locale-server deleted; all locale consumers (about/contact/work/blog/admin pages) migrated to `useLocale()` from `LocaleProvider` (already client-side). Added `blog.notFound` + `admin.emailLabel` keys (en+id).
- `firebase.json`: Hosting config (`public: out`, `cleanUrls`, cache headers for `/_next/static`, feed, sitemap) + the two rewrites above. `firestore.rules` + `firestore.indexes.json` added. `.firebaserc` → `pdskwork`.
- `src/lib/firebase.ts` now exports `auth` + `db` (Firestore) alongside `analytics`. Build green: all routes `○ (Static)` / `● (SSG)`.

## Project conventions
- Source lives under `src/` (`src/app`, `src/components`, `src/i18n`, `src/lib`).
- i18n: cookie + context based, locales `en` and `id` (dictionaries in `src/i18n/dictionaries.ts`). Fully client-side (`LocaleProvider`).
- Admin auth: Firebase Auth (email/password) client-side; gated by `AdminGate`. Firestore rules require auth for writes.
- Blog data: Firestore `posts` collection at runtime (`blog-firestore.ts`); build-time seed from `src/db/blog.json` (`blog-seed.ts`) for static params/metadata/sitemap/feed.
- Accessibility: honor `prefers-reduced-motion`, AA contrast, alt text, focus-visible states.
- Deploy: `npm run build` → `out/` → `firebase deploy --only hosting`. See `FIREBASE.md`.
- Do NOT break i18n (en/id), Firestore rules, the static-export build, or .gitignore.

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

## Iteration 5 — Firebase App Hosting + custom domain (applied, build green)
- Deploy target: **Firebase App Hosting** (Next.js 16 SSR; static export NOT compatible due to cookies()/fs).
- Firebase project: **pdskwork** (projectId `pdskwork`, measurementId `G-XH5XF12NSD`). Web config in `src/lib/firebase.ts`.
- `next.config.ts`: added `output: 'standalone'` — self-contained server bundle for Cloud Run. Compatible with `cacheComponents` + `partialPrefetching`.
- Config files added: `firebase.json` (`apphosting` block only — App Hosting handles CDN static + SSR routing; NO legacy `hosting.rewrites`), `apphosting.yaml` (Cloud Run runConfig + env/secrets), `.firebaserc` (project alias `pdskwork`).
- App Hosting auto-detects Next.js → runs `npm run build` + framework adapter start. No buildCommand/runCommand overrides in apphosting.yaml.
- **Google Analytics for Firebase:** `src/lib/firebase.ts` initializes the app + lazily `getAnalytics()` (guarded by `isSupported()` so SSR no-ops). `src/components/FirebaseAnalytics.tsx` (client) awaits the analytics promise on mount; mounted in root layout inside `<LazyMotion>`. `firebase` npm package added.
- No custom domain: site served at default Firebase Hosting URL `https://pdskwork.web.app` (set as `NEXT_PUBLIC_SITE_URL` in `.env.example` + CI workflow, used as `metadataBase` in layout.tsx and fallback BASE in sitemap.ts/robots.ts/feed.xml). Fixed sitemap.ts bug that fell back to `NEXT_PUBLIC_APP_NAME` ("PdskWork") as a URL.
- Secrets: `ADMIN_AUTH_SECRET`, `ADMIN_PASSWORD` → Cloud Secret Manager (`firebase apphosting:secrets:set`), referenced in apphosting.yaml. Never in repo.
- **Blog persistence caveat:** `src/lib/blog-store.ts` uses fs writes. Cloud Run filesystem is read-only → reads work (bundled seed), writes throw new `ReadOnlyDataError` (HTTP 503) unless `BLOG_DATA_DIR` env points at a writable volume. API routes (POST/PUT/DELETE) catch it and return 503. For persistent admin edits in prod → migrate blog-store internals to Firestore (interface unchanged). See FIREBASE.md.
- `.gitignore`: added firebase debug logs + `.firebase/` + `firebaseConfig.json`.
- Build verified green with standalone output; `.next/standalone/server.js` + traced `src/db/blog.json` present.
