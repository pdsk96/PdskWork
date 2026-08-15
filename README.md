<div align="center">

# ⚡ PdskWork

### Karya Cyberpunk untuk Era Liquid-Glass

Portofolio & showcase interaktif bertema cyberpunk — dibangun dengan **Next.js 16.3**, **React 19**, **React Three Fiber**, dan **Motion**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![R3F](https://img.shields.io/badge/React_Three_Fiber-9.7-000?logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Three.js](https://img.shields.io/badge/three.js-0.171-000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Motion](https://img.shields.io/badge/Motion-13.1-FF0066?logo=framer&logoColor=white)](https://motion.dev/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-FF6B35)](https://turbo.build/)
[![Cache Components](https://img.shields.io/badge/Cache_Components-enabled-00C896)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](#lisensi)

</div>

---

## 🌌 Tentang Proyek

**PdskWork** adalah aplikasi web portofolio bertema cyberpunk yang memadukan **3D real-time**, **shader kustom**, **animasi kinetik**, dan **transisi rute native** menjadi satu pengalaman yang hidup. Bukan sekadar halaman statis — setiap permukaan bereaksi terhadap kursor, scroll, dan navigasi.

> _"Karya cyberpunk untuk era liquid-glass."_

Proyek ini dikembangkan secara **iteratif** (`iterasi-1`, `iterasi-2`, `iterasi-3`, …) di atas Next.js 16 dengan Turbopack sebagai bundler default.

### ✨ Sorotan Fitur

| Area | Yang Bikin Spesial |
|------|-------------------|
| 🎛️ **Hero 3D Interaktif** | Bentuk neon React Three Fiber, cursor-reactive (`useFrame`+ref), scroll-linked, `PerformanceMonitor` + `AdaptiveDpr` |
| 🌫️ **Background Shader** | Plane full-bleed R3F: **FBM noise** (5 oktaf) + **fresnel rim glow** — material kustom via `shaderMaterial` (drei) + `extend`, `dpr=[1,1.75]` untuk mobile |
| 🪟 **Navbar Liquid-Glass** | `backdrop-blur` + refraksi **SVG `feDisplacementMap`** + glare mengikuti kursor via CSS var `--mx`/`--my` (rAF throttled) |
| 🔄 **View Transitions + Instant Nav** | Next 16.3 `cacheComponents`+`partialPrefetching` + React `<ViewTransition>` — navigasi instan + slide directional |
| 📊 **Core Web Vitals** | `useReportWebVitals` (LCP/INP/CLS/TTFB/FCP) + `loading.tsx` streaming fallback |
| 🌍 **i18n en / id** | Cookie + context based, kamus type-safe; toggle EN/ID di navbar |
| 🔐 **Admin Auth** | Cookie httpOnly HMAC-signed (Web Crypto), dilindungi via Next 16 **Proxy** |
| 🎗️ **Aksesibilitas** | `prefers-reduced-motion` di semua lapisan (shader, glare, transisi, Motion, ambient) |
| 🪶 **Bundle Ringan** | `LazyMotion`+`domAnimation` (Motion lazy bundle), migrasi `framer-motion`→`motion/react` |
| 🌗 **Theme Toggle** | Dark/light cyberpunk, no-flash (inline script), persist cookie+localStorage, AA contrast |
| 🎵 **Ambient Sound** | Drone Web Audio API (tanpa file audio), default muted, opt-in, reduced-motion aware |
| 📖 **Reading Progress** | Bar neon scroll-driven di atas viewport |
| ⬆️ **Back-to-Top** | Tombol melayang setelah scroll, smooth/instant (reduced-motion) |
| 🔗 **Share Buttons** | Copy link (+toast) + X/LinkedIn/WhatsApp, bilingual |
| 🦶 **Site Footer** | Bilingual: tagline + quick nav + share + RSS + copyright |
| 📡 **SEO & RSS** | `sitemap.ts`, `robots.ts`, RSS feed `/feed.xml` |

---

## 📑 Daftar Isi

- [🌌 Tentang Proyek](#-tentang-proyek)
- [🧱 Tech Stack](#-tech-stack)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🚀 Mulai Cepat](#-mulai-cepat)
- [🎨 Komponen Utama](#-komponen-utama)
- [⚙️ Cache Components & Partial Prefetching](#-cache-components--partial-prefetching)
- [📊 Core Web Vitals & Performa](#-core-web-vitals--performa)
- [🌍 Internasionalisasi (i18n)](#-internasionalisasi-i18n)
- [🔐 Autentikasi Admin](#-autentikasi-admin)
- [🗄️ Basis Data](#-basis-data)
- [🎞️ View Transitions & Aksesibilitas](#-view-transitions--aksesibilitas)
- [🛠️ Skrip](#-skrip)
- [🗺️ Roadmap Iterasi](#-roadmap-iterasi)
- [🤝 Kontribusi](#-kontribusi)
- [📜 Catatan Next.js 16](#-catatan-nextjs-16)
- [📄 Lisensi](#-lisensi)

---

## 🧱 Tech Stack

| Lapisan | Teknologi | Versi |
|---------|-----------|------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack, Cache Components) | 16.3.1 |
| **UI** | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | 19.1 / 5.7 |
| **3D / Shader** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://docs.pmnd.rs/drei) + [three.js](https://threejs.org/) | 9.7 / 10.7 / 0.171 |
| **Animasi** | [Motion](https://motion.dev/) (`motion/react`, LazyMotion+domAnimation) + View Transitions API | 13.1 |
| **Styling** | CSS Modules + styled-jsx + CSS custom properties | — |
| **i18n** | Cookie + React Context, kamus type-safe (`en` / `id`) | — |
| **Auth** | Web Crypto (SubtleCrypto) HMAC, cookie httpOnly | — |
| **DB** | SQLite (portable, siap di-lift ke Postgres) | scaffolding |
| **Lint** | ESLint 9 (Flat Config) | 9.18 |
| **Runtime** | Node.js 20.9+ (diuji pada Node 22) | 22.x |

---

## 📁 Struktur Proyek

```
PdskWork/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root: CyberBackground + LiquidGlassNav + LazyMotion + WebVitals
│   │   ├── page.tsx              # Beranda (hero 3D + glitch text + CTA)
│   │   ├── loading.tsx           # Fallback streaming (skeleton) untuk LCP cepat
│   │   ├── about/{page,loading}.tsx  # Tentang + ProjectShowcase + skeleton
│   │   ├── work/{page,loading}.tsx   # Karya + skeleton
│   │   ├── contact/{page,loading}.tsx# Kontak + skeleton
│   │   ├── admin/                # Konsol admin + login
│   │   ├── api/
│   │   │   ├── admin/session/    # Sesi admin (POST login / DELETE logout)
│   │   │   └── health/           # Health check
│   │   ├── globals.css           # Style global + skeleton styles
│   │   └── view-transitions.css  # ::view-transition-* keyframes + reduced-motion
│   ├── components/
│   │   ├── CyberBackground.tsx   # R3F full-bleed: FBM noise + fresnel shader (dpr [1,1.75])
│   │   ├── CyberHero.tsx          # Hero 3D neon (PerformanceMonitor + AdaptiveDpr)
│   │   ├── LiquidGlassNav.tsx    # Navbar glass + SVG refraction + cursor glare
│   │   ├── GlitchText.tsx        # Teks glitch kinetik
│   │   ├── GlassPanel.tsx        # Panel kaca semitransparan
│   │   ├── ProjectShowcase.tsx   # Bento grid showcase
│   │   ├── RouteTransition.tsx   # Wrapper React <ViewTransition>
│   │   ├── HeroScene.tsx         # Scene R3F hero
│   │   ├── CursorSpotlight.tsx   # Sorotan mengikuti kursor
│   │   ├── WebVitals.tsx         # useReportWebVitals (CWV monitoring)
│   │   ├── LanguageToggle.tsx    # Tombol EN/ID
│   │   └── Navbar.tsx            # Navbar lama (tetap ada)
│   ├── i18n/                     # LocaleProvider, dictionaries, locale-server
│   ├── lib/                      # auth.ts (HMAC), db.ts (lazy config)
│   ├── db/schema.sql             # Skema SQLite
│   └── proxy.ts                  # Next 16 Proxy (proteksi /admin)
├── .env.example
├── eslint.config.mjs             # ESLint 9 Flat Config
├── next.config.ts                # cacheComponents + partialPrefetching + reactStrictMode
├── tsconfig.json                 # TS 5.7, jsx react-jsx, paths @/* -> ./src/*
└── package.json
```

---

## 🚀 Mulai Cepat

### Prasyarat
- **Node.js ≥ 20.9** (Next 16 wajib; diuji pada Node 22)
- **npm**

### 1. Klon & Install
```bash
git clone https://github.com/pdsk96/PdskWork.git
cd PdskWork
npm install
```

### 2. Konfigurasi Environment
```bash
cp .env.example .env.local
```
```dotenv
NEXT_PUBLIC_APP_NAME=PdskWork
ADMIN_AUTH_SECRET=        # WAJIB production — HMAC secret cookie sesi admin
ADMIN_PASSWORD=           # WAJIB production — gate login admin
DATABASE_URL=             # opsional
NEXT_PUBLIC_WEB_VITALS_ENDPOINT=  # opsional — endpoint RUM untuk CWV
```
> ⚠️ `ADMIN_AUTH_SECRET` punya fallback dev-only — **Production WAJIB** set `ADMIN_AUTH_SECRET` & `ADMIN_PASSWORD`.

### 3. Jalankan & Build
```bash
npm run dev      # Turbopack dev server → http://localhost:3000
npm run build    # produksi (Turbopack)
npm start        # jalankan build produksi
```

---

## 🎨 Komponen Utama

### `CyberBackground` — Shader Background
Plane full-bleed R3F: FBM (5 oktaf) + fresnel rim glow, warna cyberpunk (cyan/violet/magenta). Animasi `uTime` via mutasi ref di `useFrame` (bebas re-render). `dpr=[1,1.75]` untuk mobile. Reduced-motion → clock dibekulkan + canvas di-dim.

### `CyberHero` — Hero 3D Interaktif
Bentuk neon R3F: cursor-reactive (`useFrame`+ref), scroll-linked, `dpr=[1,2]` + `<PerformanceMonitor>` + `<AdaptiveDpr>`. Reduced-motion aman.

### `LiquidGlassNav` — Navbar Liquid-Glass
`backdrop-blur(18px) saturate(150%)` + SVG `feTurbulence`+`feDisplacementMap` refraksi + glare mengikuti kursor via rAF throttled (`--mx`/`--my`). Fallback `@supports`. `transitionTypes` untuk View Transitions.

### `WebVitals` — Core Web Vitals Reporter
`useReportWebVitals` (`next/web-vitals`) collect TTFB/FCP/LCP/FID/CLS/INP. Dev → console; production → `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` via `sendBeacon`/`fetch(keepalive)`.

### `GlitchText`, `GlassPanel`, `ProjectShowcase`, `RouteTransition`
Teks glitch kinetik, panel kaca, bento grid showcase, wrapper View Transitions.

---

## ⚙️ Cache Components & Partial Prefetching

Aktif di `next.config.ts` (iterasi 3):
```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,      // model prerendering eksplisit + "use cache"
  partialPrefetching: true,   // prefetch 1 App Shell per route (bukan per-link)
}
```

**Hasil build** (route output):
| Simbol | Arti | Route |
|--------|------|-------|
| `◐` | Partial Prerender — static HTML + dynamic server-streamed | `/about`, `/admin`, `/contact`, `/work` |
| `○` | Static (prerendered) | `/`, `/_not-found`, `/admin/login` |
| `ƒ` | Dynamic (server-rendered on demand) | `/api/admin/session`, `/api/health` |

**Catatan migrasi cacheComponents:**
- `export const dynamic = 'force-dynamic'` **tidak kompatibel** dengan `cacheComponents` → dihapus dari semua page & route handler.
- Page baca `cookies()` → otomatis dinamik (shell per-session). GET route handler dengan async file I/O / `Math.random()` / `headers()` → prerendering berhenti otomatis.
- Gunakan `connection()` dari `next/server` untuk paksa request-time saat tidak ada dynamic API.
- `partialPrefetching` **butuh** `cacheComponents: true`.

---

## 📊 Core Web Vitals & Performa

| Metrik | Target | Implementasi |
|--------|--------|--------------|
| **LCP** (≤2.5s) | Loading | `loading.tsx` streaming skeleton + `aria-hidden` background + `pointer-events:none` |
| **INP** (≤200ms) | Responsiveness | rAF throttled (glare), mutasi ref di `useFrame` (bukan setState), LazyMotion lazy bundle |
| **CLS** (≤0.1) | Visual stability | `position:fixed` background + sticky nav → tidak layout shift |

**Optimasi diterapkan (iterasi 2 + 3):**
- `useFrame` + mutasi ref (bukan setState) di render loop R3F
- rAF throttled untuk glare navbar (tidak blok main thread)
- `prefers-reduced-motion` di semua lapisan
- `LazyMotion`+`domAnimation` (strict) → Motion lazy bundle (lebih kecil)
- `motion/react` (Motion, rebrand framer-motion) — pohon import lebih bersih
- `dpr=[1,1.75]` CyberBackground untuk mobile
- `loading.tsx` + Suspense untuk streaming LCP
- `useReportWebVitals` untuk monitoring RUM
- Cache Components + Partial Prefetching → navigasi instan (App Shell per route)

---

## 🌍 Internasionalisasi (i18n)

| Locale | Bahasa |
|--------|--------|
| `en` | English |
| `id` | Bahasa Indonesia |

Cookie `pdsk_locale` + React Context (`LocaleProvider`), kamus type-safe di `dictionaries.ts`. Server baca via `await cookies()`.

---

## 🔐 Autentikasi Admin

Cookie httpOnly HMAC-signed (Web Crypto SubtleCrypto):
1. Login (`/admin/login`) → POST `/api/admin/session` dengan `ADMIN_PASSWORD`
2. Server signed cookie `pdsk_admin_session` (HMAC subject `admin`)
3. Next 16 **Proxy** (`src/proxy.ts`) gate routing optimisik; verifikasi otoritatif server-side

| Endpoint / Route | Fungsi |
|------------------|--------|
| `/admin/login` | Form login |
| `/admin` | Konsol admin (dilindungi) |
| `/api/admin/session` | Login (POST) / logout (DELETE) |
| `/api/health` | Health check |

---

## 🗄️ Basis Data

Skema SQLite di `src/db/schema.sql` — portable ke Postgres.

| Tabel | Fungsi |
|-------|--------|
| `admin_users` | Akun admin (multi-user iterasi mendatang) |
| `work_items` | Item portofolio (slug, title, summary, cover, sort_order, published) |
| `work_item_translations` | Konten en/id, FK + `UNIQUE(work_item_id, locale)` |

DB helper (`src/lib/db.ts`) lazy scaffolding — `getDbConfig()`/`loadSchema()`. File `pdskwork.db` gitignored.

---

## 🎞️ View Transitions & Aksesibilitas

### View Transitions (Next 16.3 Native)
React `<ViewTransition>` primitive + View Transitions API browser:
- `transitionTypes` (`nav-forward`/`nav-back`) → slide directional keyframes
- `default="none"` → transisi tak terkait tidak menganimasi seluruh halaman
- Navbar di-anchor (tidak ikut slide)
- **Kompatibel dengan Instant Navigations** (cacheComponents + partialPrefetching)
- Fallback: browser tanpa API → langsung switch

### Aksesibilitas — `prefers-reduced-motion` per lapisan

| Lapisan | Perilaku reduced-motion |
|---------|-------------------------|
| Shader `CyberBackground` | `uTime` dibekukan, canvas di-dim & di-saturate |
| Navbar `LiquidGlassNav` | glare tracking dimatikan, turbulence `scale=0` |
| View transitions | `animation-duration: 0s !important` |
| Motion | `useReducedMotion()` → initial/animate di-skip, konten tetap tampil (opacity:1) |
| `GlitchText` | tampil statis |
| Skeleton loading | animasi shimmer dimatikan |

Plus: kontras AA, alt text, `aria-hidden` dekoratif, `aria-label`/`aria-current` di nav, focus-visible states.

---

## 🛠️ Skrip

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build produksi (Turbopack) |
| `npm start` | Jalankan server produksi |
| `npm run lint` | ESLint CLI (Next 16 menghapus `next lint`) |

---

## 🗺️ Roadmap Iterasi

- ✅ **Iterasi 1** — R3F cyber hero, glitch text, glass panels, bento showcase
- ✅ **Iterasi 2** — FBM fresnel background, refractive glass nav, View Transitions
- ✅ **Iterasi 3** — Cache Components + Partial Prefetching, WebVitals monitoring, loading.tsx streaming, LazyMotion lazy bundle, migrasi `motion/react`, dpr mobile
- ✅ **Iterasi 4** — Theme toggle (dark/light), ambient sound, reading progress, back-to-top, share buttons, site footer, sitemap/robots/RSS, i18n diperluas (ui block en+id)
- 🔜 **Iterasi 5+** — `next/image`+`preload` untuk gambar proyek, WebGPU, wire DB driver nyata, blog/artikel, newsletter

---

## 🤝 Kontribusi

1. Branch dari `master` dengan nama deskriptif (mis. `canvas/fitur-baru`)
2. Pastikan `npm run build` **hijau** sebelum commit
3. Hormati file dilindungi: `pdskwork.db`, `*.test.tsx`, `.github/*`, `scripts/*`, `AGENTS.md`, `PONYTAIL.md`, `HUMANIZER.md`, `cyberpunk/*`, `lib/*`, `messages/*.json`, i18n
4. Perubahan **additif** untuk komponen baru
5. Commit: `canvas: iterasi N <apa>` atau `docs: <apa>`
6. Baca `node_modules/next/dist/docs/` sebelum coding Next 16

---

## 📜 Catatan Next.js 16

- **Turbopack** default untuk `next dev` & `next build` (tanpa flag)
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` **harus** `await`
- **Middleware → Proxy**: `proxy.ts` (Node.js runtime)
- **`next lint` dihapus** → ESLint CLI; `next build` tidak jalankan lint
- **ESLint Flat Config** (`eslint.config.mjs`) default
- **Node.js 20.9+** wajib (Node 18 didukung)
- `serverRuntimeConfig`/`publicRuntimeConfig` dihapus → env vars / `NEXT_PUBLIC_*`
- **`next/image` `priority` deprecated** → `preload` (Next 16+)
- **AMP support dihapus**
- `partialPrefetching` **butuh** `cacheComponents: true` (config top-level, bukan `experimental.*`)
- `export const dynamic = 'force-dynamic'` **tidak kompatibel** dengan `cacheComponents`

---

## 📄 Lisensi

**MIT License** — bebas digunakan, dimodifikasi, didistribusikan sesuai ketentuan lisensi.

---

<div align="center">

**⚡ Next.js 16.3 · React 19 · R3F 9.7 · Motion 13.1 · three.js 0.171 · Cache Components ⚡**

[🏠 Beranda](https://github.com/pdsk96/PdskWork) · [📂 Kode](https://github.com/pdsk96/PdskWork/tree/master) · [🐛 Issues](https://github.com/pdsk96/PdskWork/issues)

</div>
