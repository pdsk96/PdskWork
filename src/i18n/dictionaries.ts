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
  },
} as const

export type Dictionary = (typeof dictionaries)['en']

export function getDictionary(locale: string): Dictionary {
  const all = dictionaries as unknown as Record<string, Dictionary>
  return all[locale] ?? dictionaries.en
}
