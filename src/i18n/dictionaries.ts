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
    ui: {
      themeOnLight: 'Switch to light theme',
      themeOnDark: 'Switch to dark theme',
      ambientOn: 'Turn on ambient sound',
      ambientOff: 'Turn off ambient sound',
      backToTop: 'Back to top',
      share: 'Share this page',
      copyLink: 'Copy link',
      copied: 'Copied',
      shareX: 'Share on X (Twitter)',
      shareLinkedIn: 'Share on LinkedIn',
      shareWhatsApp: 'Share on WhatsApp',
      readingProgress: 'Reading progress',
      footerTagline: 'Cyberpunk creations for the liquid-glass era',
      footerNav: 'Navigation',
      footerConnect: 'Connect',
      footerRights: 'All rights reserved.',
      feed: 'RSS feed',
    },
    showcase: {
      realtime3d: 'Real-time 3D scenes',
      realtime3dBody: 'React Three Fiber meshes that react to cursor and scroll without per-frame allocations.',
      kineticType: 'Kinetic type',
      kineticTypeBody: 'Scramble + gradient glitch text guarded by prefers-reduced-motion.',
      liquidSurfaces: 'Liquid surfaces',
      liquidSurfacesBody: 'Frosted backdrop-blur panels with accent glow.',
      stackTitle: 'Next.js 16 + R3F',
      stackBody: 'App Router, Turbopack, React 19, Motion.',
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
    ui: {
      themeOnLight: 'Ganti ke tema terang',
      themeOnDark: 'Ganti ke tema gelap',
      ambientOn: 'Nyalakan suara ambient',
      ambientOff: 'Matikan suara ambient',
      backToTop: 'Kembali ke atas',
      share: 'Bagikan halaman ini',
      copyLink: 'Salin tautan',
      copied: 'Tersalin',
      shareX: 'Bagikan ke X (Twitter)',
      shareLinkedIn: 'Bagikan ke LinkedIn',
      shareWhatsApp: 'Bagikan ke WhatsApp',
      readingProgress: 'Progres baca',
      footerTagline: 'Karya cyberpunk untuk era liquid-glass',
      footerNav: 'Navigasi',
      footerConnect: 'Terhubung',
      footerRights: 'Hak cipta dilindungi.',
      feed: 'Feed RSS',
    },
    showcase: {
      realtime3d: 'Adegan 3D real-time',
      realtime3dBody: 'Mesh R3F yang merespons kursor & gulir tanpa alokasi per-frame.',
      kineticType: 'Tipografi kinetik',
      kineticTypeBody: 'Teks glitch scramble + gradien, dengan pengaman prefers-reduced-motion.',
      liquidSurfaces: 'Permukaan cair',
      liquidSurfacesBody: 'Panel kaca buram backdrop-blur dengan glow aksen.',
      stackTitle: 'Next.js 16 + R3F',
      stackBody: 'App Router, Turbopack, React 19, Motion.',
    },
  },
} as const

export type Dictionary = (typeof dictionaries)['en']

export function getDictionary(locale: string): Dictionary {
  const all = dictionaries as unknown as Record<string, Dictionary>
  return all[locale] ?? dictionaries.en
}
