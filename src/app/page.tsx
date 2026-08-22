'use client'

import { m, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import CyberHero from '@/components/CyberHero'
import GlitchText from '@/components/GlitchText'
import RouteTransition from '@/components/RouteTransition'

function HeroContent() {
  const { dict } = useLocale()
  const reduceMotion = useReducedMotion()

  return (
    <section className="hero" aria-labelledby="hero-title">
      <m.h1
        id="hero-title"
        className="hero__title"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: ['easeOut'] }}
      >
        <GlitchText text={dict.hero.title} as="span" />
      </m.h1>
      <p className="hero__subtitle">{dict.hero.subtitle}</p>
      <div className="hero__actions">
        <Link href="/work" className="primary-btn">
          {dict.hero.cta}
        </Link>
        <Link href="/welcome" className="ghost-btn">
          {dict.welcome.title}
        </Link>
      </div>
      <p className="hero__hint" aria-live="polite">
        {dict.spotlight.hint}
      </p>
    </section>
  )
}

export default function HomePage() {
  return (
    <RouteTransition>
      <main className="page page--home">
        <CyberHero />
        <HeroContent />
      </main>
    </RouteTransition>
  )
}
