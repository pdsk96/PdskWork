import type { Dictionary } from '@/i18n/dictionaries'

/**
 * Primary navigation links shared across the navbar and footer.
 *
 * `navKey` indexes into `dict.nav` so labels stay localized.
 */
export interface NavLink {
  href: string
  navKey: keyof Dictionary['nav']
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', navKey: 'home' },
  { href: '/work', navKey: 'work' },
  { href: '/blog', navKey: 'blog' },
  { href: '/about', navKey: 'about' },
  { href: '/contact', navKey: 'contact' },
  { href: '/faq', navKey: 'faq' },
] as const
