<div align="center">

# ⚡ PdskWork

### Karya Cyberpunk untuk Era Liquid-Glass

Portofolio & showcase interaktif bertema cyberpunk — dibangun dengan **Next.js 16.3**, **React 19**, **React Three Fiber**, dan **Framer Motion**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![R3F](https://img.shields.io/badge/React_Three_Fiber-9.7-000?logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Three.js](https://img.shields.io/badge/three.js-0.171-000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.18-FF0066?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-FF6B35)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-green)](#lisensi)

</div>

---

## 🌌 Tentang Proyek

**PdskWork** adalah aplikasi web portofolio bertema cyberpunk yang memadukan **3D real-time**, **shader kustom**, **animasi kinetik**, dan **transisi rute native** menjadi satu pengalaman yang hidup. Bukan sekadar halaman statis — setiap permukaan bereaksi terhadap kursor, scroll, dan navigasi.

> _"Karya cyberpunk untuk era liquid-glass."_

Proyek ini dikembangkan secara **iteratif** (`iterasi-1`, `iterasi-2`, …) di atas Next.js 16 dengan Turbopack sebagai bundler default. README ini disusun ulang setelah **audit menyeluruh + riset teknologi terkini (4 putaran)** — lihat bagian [🔬 Audit & Riset Teknologi](#-audit--riset-teknologi).

### ✨ Sorotan Fitur

| Area | Yang Bikin Spesial |
|------|-------------------|
| 🎛️ **Hero 3D Interaktif** | Bentuk neon React Three Fiber yang bereaksi terhadap kursor via `useFrame` + mutasi ref, ter-link dengan scroll |
| 🌫️ **Background Shader** | Plane full-bleed R3F: **FBM noise** (fractal Brownian motion, 5 oktaf) + **fresnel rim glow** — material kustom via `shaderMaterial` (drei) + `extend` |
| 🪟 **Navbar Liquid-Glass** | `backdrop-blur` + refraksi **SVG `feDisplacementMap`** (feTurbulence) + glare mengikuti kursor via CSS var `--mx`/`--my` (throttled rAF) |
| ✨ **Glitch Text Kinetik** | Gradient bergerak + efek scramble teks, aman untuk reduced-motion |
| 🧊 **Glass Panel & Bento Grid** | Panel kaca semitransparan + grid bento showcase proyek |
| 🔄 **View Transitions Native** | Next 16.3 + React `<ViewTransition>` primitive — slide directional (forward/back), fallback langsung switch |
| 🌍 **i18n en / id** | Cookie + context based, kamus type-safe untuk Inggris & Indonesia |
| 🔐 **Admin Auth** | Cookie httpOnly HMAC-signed (Web Crypto), dilindungi via Next 16 **Proxy** (pengganti Middleware) |
| 🎗️ **Aksesibilitas** | `prefers-reduced-motion` dihormati di **semua lapisan** (shader, glare, transisi, Framer Motion) |

---

## 📑 Daftar Isi

- [🌌 Tentang Proyek](#-tentang-proyek)
- [🧱 Tech Stack](#-tech-stack)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🚀 Mulai Cepat](#-mulai-cepat)
- [🎨 Komponen Utama](#-komponen-utama)
- [🌍 Internasionalisasi (i18n)](#-internasionalisasi-i18n)
- [🔐 Autentikasi Admin](#-autentikasi-admin)
- [🗄️ Basis Data](#-basis-data)
- [🎞️ View Transitions & Aksesibilitas](#-view-transitions--aksesibilitas)
- [📊 Core Web Vitals & Performa](#-core-web-vitals--performa)
- [🛠️ Skrip](#-skrip)
- [🗺️ Roadmap Iterasi](#-roadmap-iterasi)
- [🔬 Audit & Riset Teknologi](#-audit--riset-teknologi)
- [🤝 Kontribusi](#-kontribusi)
- [📜 Catatan Next.js 16](#-catatan-nextjs-16)
- [📄 Lisensi](#-lisensi)

---

## 🧱 Tech Stack

| Lapisan | Teknologi | Versi |
|---------|-----------|------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) | 16.3.1 |
| **UI** | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | 19.1 / 5.7 |
| **3D / Shader** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://docs.pmnd.rs/drei) + [three.js](https://threejs.org/) | 9.7 / 10.7 / 0.171 |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) (physics/gesture) + View Transitions API | 11.18.2 |
| **Styling** | CSS Modules + styled-jsx + CSS custom properties | — |
| **i18n** | Cookie + React Context, kamus type-safe (`en` / `id`) | — |
| **Auth** | Web Crypto (SubtleCrypto) HMAC, cookie httpOnly | — |
| **DB** | SQLite (portable, siap di-lift ke Postgres) | scaffolding |
| **Lint** | ESLint 9 (Flat Config) | 9.18 |
| **Runtime** | Node.js 20.9+ (wajib untuk Next 16; diuji pada Node 22) | 22.x |

---

## 📁 Struktur Proyek

```
PdskWork/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: CyberBackground + LiquidGlassNav + providers
│   │   ├── page.tsx              # Beranda (hero 3D + glitch text + CTA)
│   │   ├── about/page.tsx        # Tentang + ProjectShowcase (bento grid)
│   │   ├── work/page.tsx         # Halaman karya
│   │   ├── contact/page.tsx      # Halaman kontak
│   │   ├── admin/                # Konsol admin + login
│   │   ├── api/
│   │   │   ├── admin/session/    # Endpoint sesi admin (POST login / DELETE logout)
│   │   │   └── health/           # Health check (verifikasi skema DB)
│   │   ├── globals.css           # Style global
│   │   └── view-transitions.css  # Keyframes ::view-transition-* + reduced-motion
│   ├── components/
│   │   ├── CyberBackground.tsx   # R3F full-bleed: FBM noise + fresnel shader
│   │   ├── CyberHero.tsx          # Hero 3D neon, cursor-reactive, scroll-linked
│   │   ├── LiquidGlassNav.tsx    # Navbar glass + SVG refraction + cursor glare
│   │   ├── GlitchText.tsx        # Teks glitch kinetik (gradient + scramble)
│   │   ├── GlassPanel.tsx        # Panel kaca semitransparan
│   │   ├── ProjectShowcase.tsx   # Bento grid showcase
│   │   ├── RouteTransition.tsx   # Wrapper React <ViewTransition>
│   │   ├── HeroScene.tsx         # Scene R3F hero
│   │   ├── CursorSpotlight.tsx   # Sorotan mengikuti kursor
│   │   ├── LanguageToggle.tsx    # Tombol EN/ID
│   │   └── Navbar.tsx            # Navbar lama (sebelum liquid-glass, tetap ada)
│   ├── i18n/
│   │   ├── LocaleProvider.tsx    # Context locale (cookie-based)
│   │   ├── dictionaries.ts       # Kamus en / id type-safe
│   │   └── locale-server.ts      # Util locale server-side
│   ├── lib/
│   │   ├── auth.ts               # HMAC cookie auth (Web Crypto SubtleCrypto)
│   │   └── db.ts                 # Lazy DB config helper
│   ├── db/
│   │   └── schema.sql            # Skema SQLite (admin_users, work_items, translations)
│   └── proxy.ts                  # Next 16 Proxy (proteksi /admin, optimisik gate)
├── .env.example                  # Konfigurasi publik (secrets di .env.local)
├── eslint.config.mjs             # ESLint 9 Flat Config
├── next.config.ts                # reactStrictMode: true
├── tsconfig.json                 # TS 5.7, jsx react-jsx, paths @/* -> ./src/*
└── package.json
```

---

## 🚀 Mulai Cepat

### Prasyarat

- **Node.js ≥ 20.9** (Next 16 wajib; repo diuji pada Node 22)
- **npm** (atau pnpm/yarn — sesuaikan perintah)

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

Lalu edit `.env.local`:

```dotenv
# Nilai publik, aman di sisi klien
NEXT_PUBLIC_APP_NAME=PdskWork

# RAHASIA — WAJIB di production
ADMIN_AUTH_SECRET=        # secret HMAC untuk signing cookie sesi admin
ADMIN_PASSWORD=           # password gate untuk endpoint login admin
DATABASE_URL=              # (opsional) URL koneksi DB
```

> ⚠️ Di development, `ADMIN_AUTH_SECRET` punya fallback dev-only (`dev-only-insecure-secret-do-not-use-in-prod`) — **tidak aman untuk produksi**. **Production WAJIB men-set** `ADMIN_AUTH_SECRET` dan `ADMIN_PASSWORD`.

### 3. Jalankan Dev Server

```bash
npm run dev
```

Buka **http://localhost:3000** — Turbopack compile cepat (~400% faster startup di 16.2+, per riset 2026).

### 4. Build Produksi

```bash
npm run build
npm start
```

---

## 🎨 Komponen Utama

### `CyberBackground` — Shader Background
Plane full-bleed R3F yang menjalankan fragment shader kustom:
- **FBM (fractal Brownian motion)** — 5 oktaf value noise → medan plasma/nebula mengalir
- **Fresnel rim glow** — pendar ke arah tepi layar
- Layering warna cyberpunk: cyan `#00f0ff`, violet `#7a5cff`, magenta `#ff2bd6`
- Animasi `uTime` di `useFrame` **via mutasi ref** (bukan `setState`) — render loop bebas alokasi (sesuai best practice R3F 2026)
- `prefers-reduced-motion` → clock dibekukan, canvas di-dim & di-saturate

### `CyberHero` — Hero 3D Interaktif
Bentuk neon React Three Fiber: bereaksi kursor (`useFrame` + ref), ter-link scroll, aman reduced-motion.

### `LiquidGlassNav` — Navbar Liquid-Glass
- `backdrop-filter: blur(18px) saturate(150%)` → permukaan frosted
- **SVG filter** `feTurbulence` + `feGaussianBlur` + `feDisplacementMap` → refraksi liquid-glass
- **Glare mengikuti kursor** menulis `--mx`/`--my` via **rAF throttled** (tidak re-render per gerakan)
- Fallback `@supports` → glassmorphism statis saat `backdrop-filter` tidak didukung
- Reduced-motion → glare tracking dimatikan, turbulence `scale=0`
- Link pakai `transitionTypes` untuk View Transitions (home=`nav-back`, lainnya=`nav-forward`)

### `GlitchText` — Teks Glitch Kinetik
Gradient bergerak + efek scramble; reduced-motion → tampil statis.

### `GlassPanel` & `ProjectShowcase`
Panel kaca semitransparan + grid bento showcase proyek (terintegrasi di `/about`).

### `RouteTransition` — View Transitions Wrapper
Lihat [View Transitions](#-view-transitions--aksesibilitas).

---

## 🌍 Internasionalisasi (i18n)

Pendekatan **cookie + React Context** (bukan i18n routing terpisah):

| Locale | Bahasa |
|--------|--------|
| `en` | English |
| `id` | Bahasa Indonesia |

- Locale disimpan di cookie `pdsk_locale`
- Kamus type-safe di `src/i18n/dictionaries.ts`
- Tombol toggle EN/ID di navbar (`LanguageToggle`)
- Server membaca cookie via `cookies()` (async, wajib `await` di Next 16)

```ts
export const dictionaries = {
  en: { nav: { home: 'Home', work: 'Work', about: 'About', ... } },
  id: { nav: { home: 'Beranda', work: 'Karya', about: 'Tentang', ... } },
} as const
```

---

## 🔐 Autentikasi Admin

Model **cookie httpOnly HMAC-signed** (minimal, edge-ready):

1. **Login** (`/admin/login`) → POST ke `/api/admin/session` dengan `ADMIN_PASSWORD`
2. Server verifikasi password (`verifyCredentials`), lalu men-signed cookie `pdsk_admin_session` (HMAC subject `admin`) via **Web Crypto SubtleCrypto**
3. Cookie httpOnly → tidak bisa diakses JavaScript klien
4. **Next 16 Proxy** (`src/proxy.ts`) mengecek cookie secara **optimisik** untuk UX routing; **verifikasi otoritatif** tetap server-side di route handler/page

> Proxy di Next 16 **bukan** lapisan auth penuh — hanya gate routing. Verifikasi nyata tetap di server (sesuai docs Next 16).

### Lingkungan Admin

| Endpoint / Route | Fungsi |
|------------------|--------|
| `/admin/login` | Form login |
| `/admin` | Konsol admin (dilindungi) |
| `/api/admin/session` | Login (POST) / logout (DELETE) |
| `/api/health` | Health check (verifikasi skema DB termuat) |

---

## 🗄️ Basis Data

Skema SQLite di `src/db/schema.sql` — portable, dirancang agar bisa di-lift ke Postgres tanpa perubahan besar.

**Tabel utama:**

| Tabel | Fungsi |
|-------|--------|
| `admin_users` | Akun admin (untuk multi-user di iterasi mendatang) |
| `work_items` | Item portofolio (slug, title, summary, cover, sort_order, published) |
| `work_item_translations` | Konten ter-lokalisasi (en/id), FK ke `work_items` + `UNIQUE(work_item_id, locale)` |

Index: `idx_work_items_published` (published, sort_order), `idx_translations_locale` (work_item_id, locale).

> DB helper (`src/lib/db.ts`) bersifat **lazy scaffolding** — `getDbConfig()` mengembalikan `DATABASE_URL`; `loadSchema()` membaca file skema. Driver DB nyata bisa di-wire di iterasi mendatang tanpa mengubah signature.
> File `pdskwork.db` **tidak** di-commit (gitignored).

---

## 🎞️ View Transitions & Aksesibilitas

### View Transitions (Next.js 16.3 Native)
Menggunakan **React `<ViewTransition>` primitive** + View Transitions API browser:

- Navigasi App Router otomatis adalah **transisi** → animasi aktif tanpa konfigurasi
- `<Link transitionTypes={['nav-forward']}>` menandai arah navigasi
- `RouteTransition` memetakan `nav-forward`/`nav-back` → slide directional keyframes
- `default="none"` → transisi tak terkait tidak menganimasi seluruh halaman
- **Navbar di-anchor** (tidak ikut slide) via CSS `::view-transition-group`
- **Fallback:** browser tanpa View Transitions API → langsung switch (otomatis, tanpa error)
- **Kompatibel dengan Instant Navigations** Next 16.3 (navigasi instan + animasi morph/slide tetap berjalan)

### Aksesibilitas
`prefers-reduced-motion: reduce` dihormati di **setiap lapisan** (audit memverifikasi):

| Lapisan | Perilaku reduced-motion |
|---------|-------------------------|
| Shader `CyberBackground` | `uTime` dibekukan, canvas di-dim & di-saturate |
| Navbar `LiquidGlassNav` | glare tracking dimatikan, turbulence `scale=0` |
| View transitions | `animation-duration: 0s !important` |
| Framer Motion | `useReducedMotion()` → `initial`/`animate` di-skip, konten tetap tampil (opacity:1) |
| `GlitchText` | tampil statis |

Selain itu: kontras AA, alt text, `aria-hidden` pada dekoratif (background, SVG, glare), `aria-label`/`aria-current` di nav, focus-visible states.

---

## 📊 Core Web Vitals & Performa

Berdasarkan riset terkini (2026) + audit kode:

| Metrik | Target | Status di PdskWork |
|--------|--------|--------------------|
| **LCP** (≤2.5s) | Loading | CyberBackground `aria-hidden` + `pointer-events:none`; hero text jadi LCP. Potensi: `loading.tsx`/Suspense streaming |
| **INP** (≤200ms) | Responsiveness | LiquidGlassNav glare pakai rAF throttled; CyberBackground mutasi ref (bukan setState). ✅ Aman |
| **CLS** (≤0.1) | Visual stability | `position:fixed` background + sticky nav → tidak layout shift. ✅ Aman |

**Optimasi yang sudah diterapkan:**
- `useFrame` + mutasi ref (bukan setState) di render loop R3F — bebas re-render
- `useMemo`/cache geometri material
- rAF throttled untuk glare (tidak blok main thread)
- `prefers-reduced-motion` di semua lapisan

**Optimasi opsional (roadmap iterasi 3+):**
- `useReportWebVitals` (Next 16) untuk monitoring LCP/INP/CLS → analytics
- `loading.tsx` + Suspense untuk streaming LCP
- `dpr` lebih agresif di mobile (`[1, 1.5]`) untuk shader FBM 5-oktaf
- `LazyMotion`/`domAnimation` untuk kurangi bundle framer-motion
- `frameloop="demand"` untuk scene interaktif (bukan terus-menerus)

---

## 🛠️ Skrip

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan dev server (Turbopack, default) |
| `npm run build` | Build produksi (Turbopack) |
| `npm start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint CLI (Next 16 menghapus `next lint`) |

> Next 16: `next lint` dihapus → gunakan ESLint CLI langsung. `next build` tidak lagi menjalankan lint (TypeScript check tetap jalan).

---

## 🗺️ Roadmap Iterasi

Pengembangan dilakukan secara iteratif pada branch `canvas/glm-iterasi-*`:

- ✅ **Iterasi 1** — R3F cyber hero, glitch text, glass panels, bento showcase
- ✅ **Iterasi 2** — FBM fresnel background, refractive glass nav, View Transitions
- 🔜 **Iterasi 3+** — lihat rekomendasi riset di bawah

### Kandidat Iterasi 3 (dari riset teknologi terkini)
1. **Cache Components** (`"use cache"`) — opt-in, non-breaking — caching eksplisit untuk route statis
2. **partialPrefetching** — opt-in — prefetch sebagian route → navigasi lebih cepat
3. **`useReportWebVitals`** — monitoring Core Web Vitals (LCP/INP/CLS) → analytics
4. **`loading.tsx` + Suspense** — streaming LCP untuk hero
5. **`next/image`** dengan `preload` (bukan `priority` yang deprecated di Next 16+) saat menambah gambar proyek
6. **`LazyMotion`/`domAnimation`** — kurangi bundle framer-motion
7. **Migrasi `framer-motion` → `motion/react`** (rebrand Motion, non-breaking) — opsional

### Diperiksa tapi ditunda
- **WebGPU** (`WebGPURenderer` three r171+) — tidak sepadan untuk portfolio sekarang (scene terlalu sederhana, overhead migrasi TSL + fallback). Pertimbangkan saat ada particle system/compute shader.

---

## 🔬 Audit & Riset Teknologi

README ini disusun ulang setelah **audit menyeluruh kode** + **4 putaran riset teknologi terkini (2026)**:

### Temuan Riset (4 putaran)

**Putaran 1 — Next.js 16.3:**
- 16.3 (Agustus 2026) stable: Instant Navigations (SPA-like), `partialPrefetching` opt-in, MCP dev endpoint (`/_next/mcp`), `compile_route` tool.
- Repo sudah di **16.3.1** → sudah terkini, di atas security patch 16.2.6 (Mei 2026).
- Cache Components (`"use cache"`) & partialPrefetching **opt-in**, non-breaking.
- View Transitions yang dipakai **kompatibel** dengan Instant Navigations.

**Putaran 2 — R3F / three.js / WebGPU:**
- three r171+ mendukung `WebGPURenderer` + fallback WebGL2 otomatis; TSL untuk shader cross-platform.
- WebGPU cocok untuk scene draw-call/compute-heavy — **tidak sepadan** untuk portfolio sekarang (1 plane shader sederhana). Tunda.
- CyberBackground **sudah** ikut best practice R3F 2026: `useFrame` + mutasi ref (bukan setState), disposal otomatis via drei `extend`.
- Optimasi opsional: `dpr` mobile lebih agresif.

**Putaran 3 — Framer Motion / Motion:**
- Framer Motion → rebrand **"Motion"** (`motion/react`); package `framer-motion` tetap aktif. Migrasi opsional non-breaking.
- Implementasi `useReducedMotion` di PdskWork **sudah benar** di semua lapisan (konten tetap tampil, duration:0, skip transform) — audit memverifikasi.
- Optimasi opsional: `LazyMotion`/`domAnimation` untuk kurangi bundle.

**Putaran 4 — Core Web Vitals / a11y / SEO:**
- Target: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, WCAG 2.2 AA.
- Tidak ada pelanggaran kritis: `aria-hidden` dekoratif, `aria-label`/`aria-current`, reduced-motion dihormati, rAF throttled, fixed/sticky positioning.
- `next/image` `priority` **deprecated** di Next 16+ → ganti `preload` (repo belum pakai image, jadi tidak terdampak).
- Optimasi opsional: `useReportWebVitals` monitoring, `loading.tsx`/Suspense streaming.

### Hasil Audit Kode
- **28 file sumber** (`src/`): 5 routes, 11 komponen, 3 i18n, 2 lib, 1 db, 1 proxy.
- **Build hijau** (`next build` exit 0, TypeScript check OK).
- Depedensi: next 16.3.1, react 19.1.0, fiber 9.7, drei 10.7.8, three 0.171, framer-motion 11.18.2, ESLint 9.18, TS 5.7.
- Config: `reactStrictMode: true`, tsconfig `@/*`→`./src/*`, ESLint Flat Config.
- Tidak ada file dilindungi yang terkena perubahan.

---

## 🤝 Kontribusi

Repo ini dikembangkan iteratif. Untuk kontribusi:

1. Buat branch dari `master` dengan nama deskriptif (mis. `canvas/fitur-baru`)
2. Pastikan `npm run build` **hijau** sebelum commit
3. Hormati file yang dilindungi: `pdskwork.db`, `*.test.tsx`, `.github/*`, `scripts/*`, `AGENTS.md`, `PONYTAIL.md`, `HUMANIZER.md`, `cyberpunk/*`, `lib/*`, `messages/*.json`, i18n
4. Perubahan **additif** untuk komponen baru (tambah file, jangan hapus)
5. Commit mengikuti pola: `canvas: iterasi N <apa>` atau `docs: <apa>`
6. Baca `node_modules/next/dist/docs/` sebelum menulis kode Next 16 (API bisa beda dari yang Anda kenal)

---

## 📜 Catatan Next.js 16

Beberapa perubahan breaking penting yang relevan untuk repo ini:

- **Turbopack** adalah bundler default untuk `next dev` & `next build` (tanpa flag `--turbopack`)
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` **harus** di-`await`
- **Middleware → Proxy**: di-rename ke `proxy.ts` di root project / `src/` (Node.js runtime)
- **`next lint` dihapus**: gunakan ESLint CLI; `next build` tidak lagi menjalankan lint
- **ESLint Flat Config** (`eslint.config.mjs`) sebagai default
- **Node.js 20.9+** wajib (Node 18 didukung)
- `serverRuntimeConfig`/`publicRuntimeConfig` dihapus → pakai env vars / `NEXT_PUBLIC_*`
- **`next/image` `priority` deprecated** → ganti `preload` (Next 16+)
- **AMP support dihapus**

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

Bebas digunakan, dimodifikasi, dan didistribusikan sesuai ketentuan lisensi.

---

<div align="center">

**⚡ Dibangun dengan Next.js 16.3 · React 19 · R3F 9.7 · Framer Motion 11.18 · three.js 0.171 ⚡**

[🏠 Beranda](https://github.com/pdsk96/PdskWork) · [📂 Kode](https://github.com/pdsk96/PdskWork/tree/master) · [🐛 Issues](https://github.com/pdsk96/PdskWork/issues)

</div>
