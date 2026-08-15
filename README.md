<div align="center">

# ⚡ PdskWork

### Karya Cyberpunk untuk Era Liquid-Glass

Portofolio & showcase interaktif bertema cyberpunk — dibangun dengan **Next.js 16**, **React 19**, **React Three Fiber**, dan **Framer Motion**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/R3F-fiber-000?logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0066?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack-FF6B35)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-green)](#lisensi)

</div>

---

## 🌌 Tentang Proyek

**PdskWork** adalah aplikasi web portofolio bertema cyberpunk yang memadukan **3D real-time**, **shader kustom**, **animasi kinetik**, dan **transisi rute native** menjadi satu pengalaman yang hidup. Bukan sekadar halaman statis — setiap permukaan bereaksi terhadap kursor, scroll, dan navigasi.

> _"Karya cyberpunk untuk era liquid-glass."_

Proyek ini dikembangkan secara **iteratif** (`iterasi-1`, `iterasi-2`, …) di atas Next.js 16 dengan Turbopack sebagai bundler default.

### ✨ Sorotan Fitur

| Area | Yang Bikin Spesial |
|------|-------------------|
| 🎛️ **Hero 3D Interaktif** | Bentuk neon React Three Fiber yang bereaksi terhadap kursor via `useFrame` + mutasi ref, ter-link dengan scroll |
| 🌫️ **Background Shader** | Plane full-bleed R3F: **FBM noise** (fractal Brownian motion) + **fresnel rim glow** — material kustom via `shaderMaterial` (drei) + `extend` |
| 🪟 **Navbar Liquid-Glass** | `backdrop-blur` + refraksi **SVG `feDisplacementMap`** (feTurbulence) + glare mengikuti kursor via CSS var `--mx`/`--my` (throttled rAF) |
| ✨ **Glitch Text Kinetik** | Gradient bergerak + efek scramble teks, aman untuk reduced-motion |
| 🧊 **Glass Panel & Bento Grid** | Panel kaca semitransparan + grid bento showcase proyek |
| 🔄 **View Transitions Native** | Next 16 + React `<ViewTransition>` primitive — slide directional (forward/back), fallback langsung switch |
| 🌍 **i18n en / id** | Cookie + context based, kamus type-safe untuk Inggris & Indonesia |
| 🔐 **Admin Auth** | Cookie httpOnly HMAC-signed, dilindungi via Next 16 **Proxy** (pengganti Middleware) |
| 🎗️ **Aksesibilitas** | `prefers-reduced-motion` dihormati di semua lapisan (shader, glare, transisi) |

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
- [🛠️ Skrip](#-skrip)
- [🗺️ Roadmap Iterasi](#-roadmap-iterasi)
- [🤝 Kontribusi](#-kontribusi)
- [📜 Catatan Next.js 16](#-catatan-nextjs-16)
- [📄 Lisensi](#-lisensi)

---

## 🧱 Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Framework** | [Next.js 16.3](https://nextjs.org/) (App Router, Turbopack) |
| **UI** | [React 19](https://react.dev/) + TypeScript 5 |
| **3D / Shader** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://docs.pmnd.rs/drei) + [three.js](https://threejs.org/) |
| **Animasi** | [Framer Motion 11](https://www.framer.com/motion/) (physics/gesture) + View Transitions API |
| **Styling** | CSS Modules + styled-jsx + CSS custom properties |
| **i18n** | Cookie + React Context, kamus type-safe (`en` / `id`) |
| **Auth** | Web Crypto (SubtleCrypto) HMAC, cookie httpOnly |
| **DB** | SQLite (portable, siap di-lift ke Postgres) |
| **Runtime** | Node.js 20.9+ (wajib untuk Next 16) |

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
│   │   │   ├── admin/session/    # Endpoint sesi admin
│   │   │   └── health/           # Health check
│   │   ├── globals.css           # Style global
│   │   └── view-transitions.css  # Keyframes ::view-transition-*
│   ├── components/
│   │   ├── CyberBackground.tsx   # R3F full-bleed: FBM noise + fresnel shader
│   │   ├── CyberHero.tsx         # Hero 3D neon, cursor-reactive, scroll-linked
│   │   ├── LiquidGlassNav.tsx    # Navbar glass + SVG refraction + cursor glare
│   │   ├── GlitchText.tsx        # Teks glitch kinetik (gradient + scramble)
│   │   ├── GlassPanel.tsx        # Panel kaca semitransparan
│   │   ├── ProjectShowcase.tsx   # Bento grid showcase
│   │   ├── RouteTransition.tsx   # Wrapper React <ViewTransition>
│   │   ├── HeroScene.tsx         # Scene R3F hero
│   │   ├── CursorSpotlight.tsx   # Sorotan mengikuti kursor
│   │   ├── LanguageToggle.tsx    # Tombol EN/ID
│   │   └── Navbar.tsx            # Navbar lama (sebelum liquid-glass)
│   ├── i18n/
│   │   ├── LocaleProvider.tsx    # Context locale (cookie-based)
│   │   ├── dictionaries.ts       # Kamus en / id type-safe
│   │   └── locale-server.ts      # Util locale server-side
│   ├── lib/
│   │   ├── auth.ts               # HMAC cookie auth (Web Crypto)
│   │   └── db.ts                 # Koneksi DB helper
│   ├── db/
│   │   └── schema.sql            # Skema SQLite (admin_users, work_items, ...)
│   └── proxy.ts                  # Next 16 Proxy (proteksi /admin)
├── public/
├── .env.example                  # Konfigurasi publik
├── package.json
└── next.config.ts
```

---

## 🚀 Mulai Cepat

### Prasyarat

- **Node.js ≥ 20.9** (Next 16 butuh Node 20.9+; repo ini diuji pada Node 22)
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
```

> ⚠️ Di development, `ADMIN_AUTH_SECRET` punya fallback dev-only (tidak aman untuk produksi). **Production WAJIB men-set** `ADMIN_AUTH_SECRET` dan `ADMIN_PASSWORD`.

### 3. Jalankan Dev Server

```bash
npm run dev
```

Buka **http://localhost:3000** — Turbopack akan men-compile dengan cepat.

### 4. Build Produksi

```bash
npm run build
npm start
```

---

## 🎨 Komponen Utama

### `CyberBackground` — Shader Background
Plane full-bleed R3F yang menjalankan fragment shader kustom:
- **FBM (fractal Brownian motion)** — 5 oktaf value noise → medan plasma/nebula yang mengalir
- **Fresnel rim glow** — pendar ke arah tepi layar
- Layering warna cyberpunk: cyan `#00f0ff`, violet `#7a5cff`, magenta `#ff2bd6`
- Animasi `uTime` di `useFrame` **via mutasi ref** (bukan `setState`) — render loop bebas alokasi
- `prefers-reduced-motion` → clock dibekukan, canvas di-dim

### `CyberHero` — Hero 3D Interaktif
Bentuk neon React Three Fiber yang:
- Bereaksi terhadap posisi kursor (via `useFrame` + ref)
- Ter-link dengan scroll
- Aman untuk reduced-motion

### `LiquidGlassNav` — Navbar Liquid-Glass
- `backdrop-filter: blur()` + `saturate()` → permukaan frosted
- **SVG filter** `feTurbulence` + `feGaussianBlur` + `feDisplacementMap` → refraksi liquid-glass
- **Glare mengikuti kursor** menulis `--mx`/`--my` via rAF throttled (tidak re-render per gerakan)
- Fallback `@supports` → glassmorphism statis saat `backdrop-filter` tidak didukung
- Link pakai `transitionTypes` untuk View Transitions

### `GlitchText` — Teks Glitch Kinetik
Gradient bergerak + efek scramble; reduced-motion → tampil statis.

### `GlassPanel` & `ProjectShowcase`
Panel kaca semitransparan + grid bento untuk showcase proyek (terintegrasi di `/about`).

### `RouteTransition` — View Transitions Wrapper
Lihat bagian [View Transitions](#-view-transitions--aksesibilitas).

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
- Server membaca cookie via `cookies()` (async, sesuai Next 16)

```ts
// Contoh struktur kamus (dictionaries.ts)
export const dictionaries = {
  en: { nav: { home: 'Home', ... }, hero: { ... } },
  id: { nav: { home: 'Beranda', ... }, hero: { ... } },
} as const
```

---

## 🔐 Autentikasi Admin

Model **cookie httpOnly HMAC-signed** (minimal, edge-ready):

1. **Login** (`/admin/login`) → POST ke `/api/admin/session` dengan `ADMIN_PASSWORD`
2. Server verifikasi password, lalu men-signed cookie `pdsk_admin_session` (HMAC subject `admin`) via **Web Crypto SubtleCrypto**
3. Cookie httpOnly → tidak bisa diakses JavaScript klien
4. **Next 16 Proxy** (`src/proxy.ts`) mengecek cookie secara optimisik untuk UX routing; **verifikasi otoritatif** tetap server-side di route handler/page

> Proxy di Next 16 **bukan** lapisan auth penuh — hanya gate routing. Verifikasi nyata tetap di server.

### Lingkungan Admin

| Endpoint / Route | Fungsi |
|------------------|--------|
| `/admin/login` | Form login |
| `/admin` | Konsol admin (dilindungi) |
| `/api/admin/session` | Login (POST) / logout (DELETE) |
| `/api/health` | Health check |

**Env wajib (production):**
```dotenv
ADMIN_AUTH_SECRET=<random-string-panjang>
ADMIN_PASSWORD=<password-kuat>
```

---

## 🗄️ Basis Data

Skema SQLite di `src/db/schema.sql` — portable, dirancang agar bisa di-lift ke Postgres tanpa perubahan besar.

**Tabel utama:**
- `admin_users` — akun admin (untuk multi-user di iterasi mendatang)
- `work_items` — item portofolio/karya (slug, title, summary, cover, sort_order, published)
- + tabel konten ter-lokalisasi (en/id)

> File DB `pdskwork.db` **tidak** di-commit (gitignored). Dibuat saat runtime.

---

## 🎞️ View Transitions & Aksesibilitas

### View Transitions (Next.js 16 Native)
Menggunakan **React `<ViewTransition>` primitive** + View Transitions API browser:

- Navigasi App Router otomatis adalah **transisi** → animasi aktif tanpa konfigurasi
- `<Link transitionTypes={['nav-forward']}>` menandai arah navigasi
- `RouteTransition` memetakan `nav-forward`/`nav-back` → slide directional keyframes
- `default="none"` → transisi tak terkait tidak menganimasi seluruh halaman
- **Navbar di-anchor** (tidak ikut slide) via CSS `::view-transition-group`
- **Fallback:** browser tanpa View Transitions API → langsung switch (otomatis, tanpa error)

### Aksesibilitas
- `prefers-reduced-motion: reduce` dihormati di **setiap lapisan**:
  - Shader: `uTime` dibekukan, canvas di-dim
  - Glare navbar: tracking dimatikan, turbulence scale = 0
  - View transitions: `animation-duration: 0s !important`
  - Animasi Framer Motion: `useReducedMotion()` → `initial`/`animate` di-skip
- Kontras AA, alt text, focus-visible states

---

## 🛠️ Skrip

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan dev server (Turbopack, default) |
| `npm run build` | Build produksi (Turbopack) |
| `npm start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint CLI (Next 16 menghapus `next lint`) |

> Next 16: `next lint` dihapus → gunakan ESLint CLI langsung. `next build` tidak lagi menjalankan lint.

---

## 🗺️ Roadmap Iterasi

Pengembangan dilakukan secara iteratif pada branch `canvas/glm-iterasi-*`:

- ✅ **Iterasi 1** — R3F cyber hero, glitch text, glass panels, bento showcase
- ✅ **Iterasi 2** — FBM fresnel background, refractive glass nav, View Transitions
- 🔜 **Iterasi 3+** — _sesuai spec di `.hermes/pdsk_work_master_spec.md`_

---

## 🤝 Kontribusi

Repo ini dikembangkan iteratif. Untuk kontribusi:

1. Buat branch dari `master` dengan nama deskriptif (mis. `canvas/fitur-baru`)
2. Pastikan `npm run build` **hijau** sebelum commit
3. Hormati file yang dilindungi: `pdskwork.db`, `*.test.tsx`, `.github/*`, `scripts/*`, `AGENTS.md`, `PONYTAIL.md`, `HUMANIZER.md`, `cyberpunk/*`, `lib/*`, `messages/*.json`, i18n
4. Perubahan **additif** untuk komponen baru (tambah file, jangan hapus)
5. Commit mengikuti pola: `canvas: iterasi N <apa>` atau `docs: <apa>`

---

## 📜 Catatan Next.js 16

Beberapa perubahan breaking penting yang relevan untuk repo ini:

- **Turbopack** adalah bundler default untuk `next dev` & `next build` (tanpa flag `--turbopack`)
- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` **harus** di-`await`
- **Middleware → Proxy**: di-rename ke `proxy.ts` di root project / `src/`
- **`next lint` dihapus**: gunakan ESLint CLI; `next build` tidak lagi menjalankan lint
- **ESLint Flat Config** (`eslint.config.mjs`) sebagai default
- **Node.js 20.9+** wajib
- `serverRuntimeConfig`/`publicRuntimeConfig` dihapus → pakai env vars / `NEXT_PUBLIC_*`

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

Bebas digunakan, dimodifikasi, dan didistribusikan sesuai ketentuan lisensi.

---

<div align="center">

**⚡ Dibangun dengan Next.js 16 · React 19 · R3F · Framer Motion ⚡**

[🏠 Beranda](https://github.com/pdsk96/PdskWork) · [📂 Kode](https://github.com/pdsk96/PdskWork/tree/master) · [🐛 Issues](https://github.com/pdsk96/PdskWork/issues)

</div>
