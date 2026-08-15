import { cookies } from 'next/headers'
import { defaultLocale, getDictionary, locales, type Dictionary, type Locale } from './dictionaries'

export { defaultLocale, locales, type Locale, type Dictionary, getDictionary }

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

const LOCALE_COOKIE = 'pdsk_locale'

/**
 * Resolve the request locale from the `pdsk_locale` cookie, falling back to
 * the default locale. Safe to call in any Server Component / Route Handler
 * that runs inside a request (cookies() is awaited per Next 16 async APIs).
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  const raw = store.get(LOCALE_COOKIE)?.value
  return isSupportedLocale(raw) ? raw : defaultLocale
}

/**
 * Convenience: resolve the locale and return its dictionary in one call. Use
 * this in Server Components instead of repeating the cookies() + getDictionary
 * boilerplate on every page.
 */
export async function getLocaleDict(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
