'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import CyberHero from '@/components/CyberHero'
import GlitchText from '@/components/GlitchText'
import BentoGrid from '@/components/BentoGrid'

export default function HomePage() {
  const { dict } = useLocale()
  const reduceMotion = useReducedMotion()

  return (
    <main className="page page--home">
      <CyberHero />

      <section className="hero" aria-labelledby="hero-title">
        <GlitchText as="h1" className="hero__title" id="hero-title">
          {dict.hero.title}
        </GlitchText>
        <motion.p
          className="hero__subtitle"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {dict.hero.subtitle}
        </motion.p>
        <div className="hero__actions">
          <Link href="/work" className="primary-btn">
            {dict.hero.cta}
          </Link>
        </div>
        <p className="hero__hint" aria-live="polite">
          {dict.spotlight.hint}
        </p>
      </section>

      <BentoGrid />
    </main>
  )
}
