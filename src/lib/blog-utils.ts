import type { Locale } from '@/i18n/dictionaries'

/**
 * Blog display helpers — locale-aware date formatting and a rough reading-time
 * estimate. Pure functions, safe for server components.
 */

const DATE_LOCALE: Record<Locale, string> = {
  en: 'en-US',
  id: 'id-ID',
}

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(DATE_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Rough reading time: ~200 words/minute, min 1. */
export function readingTime(content: string, unit: string): string {
  const words = (content.trim().match(/\S+/g) ?? []).length
  const mins = Math.max(1, Math.round(words / 200))
  const safeUnit = unit.trim() || 'min read'
  return `${mins} ${safeUnit}`
}
