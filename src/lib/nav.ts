import type { Dictionary } from '@/i18n/dictionaries'

/**
 * Primary navigation links shared across the navbar and footer.
 *
 * `navKey` indexes into `dict.nav` so labels stay localized. `transitionType`
 * feeds the Next 16 View Transitions API (home = back, others = forward).
 */
export interface NavLink {
  href: string
  navKey: keyof Dictionary['nav']
  transitionType: 'nav-back' | 'nav-forward'
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', navKey: 'home', transitionType: 'nav-back' },
  { href: '/work', navKey: 'work', transitionType: 'nav-forward' },
  { href: '/blog', navKey: 'blog', transitionType: 'nav-forward' },
  { href: '/about', navKey: 'about', transitionType: 'nav-forward' },
  { href: '/contact', navKey: 'contact', transitionType: 'nav-forward' },
  { href: '/faq', navKey: 'faq', transitionType: 'nav-forward' },
] as const
