'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { locales, type Locale } from '@/i18n/dictionaries'

export default function LanguageToggle() {
  const { locale, setLocale, dict } = useLocale()

  return (
    <div className="lang-toggle" role="group" aria-label={dict.lang.label}>
      {locales.map((code) => {
        const active = code === locale
        return (
          <button
            key={code}
            type="button"
            className={`lang-toggle__btn${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => setLocale(code as Locale)}
          >
            {code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
