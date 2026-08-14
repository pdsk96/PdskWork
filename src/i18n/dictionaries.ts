export const locales = ['en', 'id'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const dictionaries = {
  en: {
    nav: {
      home: 'Home',
      work: 'Work',
      about: 'About',
      contact: 'Contact',
      admin: 'Admin',
    },
    hero: {
      title: 'PdskWork',
      subtitle: 'Cyberpunk creations for the liquid-glass era',
      cta: 'Explore work',
    },
    spotlight: {
      hint: 'Move your cursor to wake the spotlight',
    },
    bento: {
      sectionLabel: 'Capabilities',
      title: 'Built for the liquid-glass era',
      lead: 'A cyberpunk motion foundation — reactive 3D, kinetic type, and glass surfaces that bend light.',
      r3dTitle: 'Reactive 3D',
      r3dBody:
        'A cursor-reactive icosahedron rendered with React Three Fiber. It parallaxes toward your pointer and drifts as you scroll.',
      kineticTitle: 'Kinetic type',
      kineticBody:
        'GlitchText tears cyan and magenta channels apart, then snaps them back — pure CSS animation, no per-frame cost.',
      glassTitle: 'Liquid glass',
      glassBody:
        'GlassPanel surfaces tilt toward the pointer with a springy refractive highlight, and rest flat on touch devices.',
      perfTitle: 'Adaptive perf',
      perfBody:
        'PerformanceMonitor watches framerate and drops pixel ratio under load; AdaptiveDpr regresses gracefully.',
      a11yTitle: 'Motion-aware',
      a11yBody:
        'prefers-reduced-motion freezes the scene to a single frame, kills the glitch, and keeps AA contrast.',
      cta: 'Explore work',
    },
    admin: {
      title: 'Admin Console',
      loginTitle: 'Admin sign in',
      passwordLabel: 'Password',
      submit: 'Sign in',
      logout: 'Sign out',
      welcome: 'Signed in as administrator',
      invalid: 'Invalid credentials',
    },
    lang: {
      label: 'Language',
      en: 'English',
      id: 'Bahasa Indonesia',
    },
  },
  id: {
    nav: {
      home: 'Beranda',
      work: 'Karya',
      about: 'Tentang',
      contact: 'Kontak',
      admin: 'Admin',
    },
    hero: {
      title: 'PdskWork',
      subtitle: 'Karya cyberpunk untuk era liquid-glass',
      cta: 'Jelajahi karya',
    },
    spotlight: {
      hint: 'Gerakkan kursor untuk menyalakan sorotan',
    },
    bento: {
      sectionLabel: 'Kemampuan',
      title: 'Dibuat untuk era liquid-glass',
      lead: 'Fondasi gerak cyberpunk — 3D reaktif, tipografi kinetik, dan permukaan kaca yang membelahkan cahaya.',
      r3dTitle: '3D reaktif',
      r3dBody:
        'Icosahedron reaktif terhadap kursor yang dirender dengan React Three Fiber. Berparalaks ke arah kursor dan melayang saat Anda menggulir.',
      kineticTitle: 'Tipografi kinetik',
      kineticBody:
        'GlitchText merobek saluran cyan dan magenta lalu menyatukannya kembali — animasi CSS murni, tanpa biaya per-frame.',
      glassTitle: 'Liquid glass',
      glassBody:
        'Permukaan GlassPanel miring ke arah kursor dengan kilau refraktif yang elastis, dan rata pada perangkat sentuh.',
      perfTitle: 'Performa adaptif',
      perfBody:
        'PerformanceMonitor memantau frame rate dan menurunkan rasio piksel saat beban berat; AdaptiveDpr menurunkan secara halus.',
      a11yTitle: 'Sadari gerak',
      a11yBody:
        'prefers-reduced-motion membekukan adegan menjadi satu frame, mematikan glitch, dan menjaga kontras AA.',
      cta: 'Jelajahi karya',
    },
    admin: {
      title: 'Konsol Admin',
      loginTitle: 'Masuk sebagai admin',
      passwordLabel: 'Kata sandi',
      submit: 'Masuk',
      logout: 'Keluar',
      welcome: 'Masuk sebagai administrator',
      invalid: 'Kredensial tidak valid',
    },
    lang: {
      label: 'Bahasa',
      en: 'English',
      id: 'Bahasa Indonesia',
    },
  },
} as const

export type Dictionary = (typeof dictionaries)['en']

export function getDictionary(locale: string): Dictionary {
  const all = dictionaries as unknown as Record<string, Dictionary>
  return all[locale] ?? dictionaries.en
}
