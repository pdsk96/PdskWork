import { defaultLocale, locales, type Locale } from './dictionaries'

export { defaultLocale, locales, type Locale }

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}
