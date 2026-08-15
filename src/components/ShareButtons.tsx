'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

interface ShareButtonsProps {
  /** Optional title/heading to prefill share text. */
  title?: string
}

/**
 * ShareButtons — copy-link + social share for the current page. Copying shows
 * a transient confirmation. Share targets open in a new tab. Labels localized.
 */
export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')
  const { dict } = useLocale()

  useEffect(() => {
    if (typeof window !== 'undefined') setUrl(window.location.href)
  }, [])

  const shareText =
    title ? `${title} — PdskWork` : dict.ui.footerTagline
  const enc = (s: string) => encodeURIComponent(s)

  const targets = [
    {
      label: dict.ui.shareX,
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: dict.ui.shareLinkedIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      ),
    },
    {
      label: dict.ui.shareWhatsApp,
      href: `https://wa.me/?text=${enc(shareText + ' ' + url)}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
  ]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="share-buttons" role="group" aria-label={dict.ui.share}>
      {targets.map((t) => (
        <a
          key={t.label}
          className="share-buttons__btn share-buttons__btn--social"
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          title={t.label}
        >
          {t.icon}
        </a>
      ))}
      <button
        type="button"
        className="share-buttons__btn share-buttons__btn--copy"
        onClick={copy}
        aria-label={dict.ui.copyLink}
        title={dict.ui.copyLink}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
      {copied && <span className="share-buttons__toast" role="status">{dict.ui.copied}</span>}
    </div>
  )
}
