# PdskWork

Cyberpunk-themed portfolio/work application. Iteration-driven development.

## Stack
- Next.js 16 (App Router, Turbopack)
- React 19
- React Three Fiber + three
- Framer Motion

## Iteration 1 — Liquid-glass navbar + cursor-follow spotlight
- Liquid-glass navbar: frosted translucent surface, refractive gradient border,
  pointer-following sheen, animated active-link pill.
- Cursor-follow spotlight: radial glow tracking the pointer via framer-motion
  springs. Disabled / static under `prefers-reduced-motion` and on touch devices.
- Foundation: i18n (en/id), API routes, DB schema, admin auth (proxy-protected).

## Develop
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Next.js 16 (Turbopack)
```

## Admin
Sign in at `/admin/login`. Default dev password: `admin` (set `ADMIN_PASSWORD`
and `ADMIN_AUTH_SECRET` in production).

## Conventions
See `AGENTS.md` for Next.js 16 notes and project conventions.
