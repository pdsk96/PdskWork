'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import HeroScene from '@/components/HeroScene'

export default function HomePage() {
  const { dict } = useLocale()
  const reduceMotion = useReducedMotion()

  return (
    <main className="page page--home">
      <HeroScene />

      <section className="hero" aria-labelledby="hero-title">
        <motion.h1
          id="hero-title"
          className="hero__title"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {dict.hero.title}
        </motion.h1>
        <p className="hero__subtitle">{dict.hero.subtitle}</p>
        <div className="hero__actions">
          <Link href="/work" className="primary-btn">
            {dict.hero.cta}
          </Link>
        </div>
        <p className="hero__hint" aria-live="polite">
          {dict.spotlight.hint}
        </p>
      </section>
    </main>
  )
}
