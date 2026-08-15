# Firebase Hosting Deployment — PdskWork

PdskWork is a **Next.js 16 SSR** app (Cache Components, Partial Prefetching,
dynamic routes reading `cookies()`/`fs`). Static export (`next export`) is
**not** compatible. We deploy with **Firebase App Hosting**, the Firebase
service built for full-stack Next.js apps — it auto-detects the framework,
runs `npm run build`, serves SSR on Cloud Run, and caches static assets on the
global Cloud CDN.

## Prerequisites

- A Google account with a **Firebase project on the Blaze (pay-as-you-go) plan**
  (App Hosting requires Blaze — https://console.firebase.google.com → Billing).
- The GitHub repo `pdsk96/PdskWork` connected (App Hosting deploys from GitHub).
- Node 20.9+ locally for optional CLI deploys.

## Files added for Firebase

| File | Purpose |
|---|---|
| `next.config.ts` | `output: 'standalone'` — self-contained server bundle for Cloud Run |
| `firebase.json` | `apphosting` block — tells `firebase deploy` which backend to build |
| `apphosting.yaml` | Cloud Run runtime config (CPU, memory, scaling) + env/secrets |
| `.firebaserc` | Default project alias (`pdsk-work`) |
| `.env.example` | Documents all env vars (public + secret) |

## 1. Create the Firebase project & App Hosting backend

```bash
# Install the CLI (one time)
npm install -g firebase-tools
firebase login

# Create + link the project (or use an existing one in the console)
firebase projects:create pdsk-work
firebase use pdsk-work

# Create the App Hosting backend (us-central1 by default)
firebase apphosting:backends:create --project pdsk-work
```

Or do it in the console: **Firebase → App Hosting → Get started → connect
the `pdsk96/PdskWork` GitHub repo**. Choose the `master` branch. App Hosting
auto-detects Next.js and uses its framework adapter (no custom build/run
commands needed — see `apphosting.yaml`).

## 2. Set secrets (admin auth)

The admin login uses two secrets. Store them in Cloud Secret Manager so they
never touch the repo:

```bash
# Generate strong values first, e.g.:
#   openssl rand -hex 32   # for ADMIN_AUTH_SECRET
firebase apphosting:secrets:set ADMIN_AUTH_SECRET
firebase apphosting:secrets:set ADMIN_PASSWORD
```

`apphosting.yaml` already references these by name. After setting them, trigger
a new rollout (push to `master` or `firebase apphosting:rollouts:create`).

## 3. Set public env vars

`NEXT_PUBLIC_SITE_URL` is already set to `https://pdsk.qd.je` in
`apphosting.yaml`. Adjust in the Firebase console → App Hosting → backend →
Environment variables if needed. Public vars are inlined at build time, so
changing them requires a new rollout.

## 4. Deploy

**Automatic (recommended):** push to `master` on GitHub. App Hosting rebuilds
and rolls out automatically.

**Manual (CLI):**

```bash
firebase deploy --only apphosting
```

The first deploy gives you a URL like
`https://pdsk-work--<region>-<id>.a.run.app`. Verify the site loads before
adding the custom domain.

## 5. Connect custom domain `pdsk.qd.je`

You control DNS for `qd.je` at its registrar. In the Firebase console:

1. **Hosting → Add custom domain** → enter `pdsk.qd.je`.
2. Firebase provides a **TXT verification record** + **A/AAAA records** (or a
   CNAME if using a subdomain that Firebase supports). For an apex/root domain
   `qd.je` subdomain `pdsk`, you'll typically add:
   - `pdsk.qd.je  A  151.101.1.195` (and `151.101.65.195`, IPv6 `2a04:4e00::...`
     — use the exact IPs Firebase shows).
   - A TXT record on `_firebase.pdsk.qd.je` for ownership verification.
3. Wait for DNS propagation + SSL provisioning (Firebase auto-issues a managed
   SSL certificate). This can take minutes to a few hours.
4. Once "Connected", `https://pdsk.qd.je` serves the app.

> If `qd.je` is itself managed elsewhere and you only own `pdsk.qd.je`, the
> A-record approach still works — just add the records at whatever DNS provider
> serves `qd.je`.

## 6. Blog data persistence — IMPORTANT

The blog is a JSON-file store (`src/lib/blog-store.ts`).

- **Reads work on Firebase:** `src/db/blog.json` is bundled into the standalone
  output, so the public blog pages, RSS feed, and sitemap render correctly.
- **Writes do NOT persist by default:** Cloud Run's filesystem is read-only.
  Admin create/edit/delete will return **HTTP 503 ReadOnlyDataError** unless
  `BLOG_DATA_DIR` points at a writable volume.

Options for admin editing in production:

1. **Ephemeral (`/tmp`) — not recommended:** set `BLOG_DATA_DIR=/tmp/blog`.
   Writes succeed but are lost when the instance scales down (per-instance,
   not shared). Fine only for throwaway testing.
2. **Cloud Run mounted volume:** mount a Cloud Run volume and set
   `BLOG_DATA_DIR` to it. Still per-instance unless using a network filesystem.
3. **Migrate to Firestore (recommended for persistence):** re-implement
   `blog-store.ts` internals against Firestore. The module's interface
   (`getAllPosts`, `createPost`, …) stays the same, so callers don't change.
   Seed initial posts from `src/db/blog.json` on first deploy.

Until you pick one, the site runs as a **read-only blog from the committed
seed** — perfectly fine for a portfolio.

## 7. Verify after deploy

- `https://pdsk.qd.je/` loads, hero 3D renders.
- `https://pdsk.qd.je/sitemap.xml` lists the site + blog posts.
- `https://pdsk.qd.je/feed.xml` returns RSS.
- `https://pdsk.qd.je/robots.txt` disallows `/admin` and `/api/`.
- `/admin/login` works after setting `ADMIN_PASSWORD`.
- Admin blog POST/PUT/DELETE returns 503 with a clear message until
  `BLOG_DATA_DIR`/Firestore is configured.

## Notes on Next.js 16 + App Hosting

- App Hosting's Next.js adapter supports SSR + ISR + static. Cache Components
  (`◐ Partial Prerender` routes) render static HTML shells with dynamic
  server-streamed content — fully supported.
- `output: 'standalone'` produces `.next/standalone/server.js`. The adapter
  handles static-asset wiring; you do **not** need to manually copy
  `.next/static`.
- Turbopack is the bundler (Next 16 default) — no flag needed.
