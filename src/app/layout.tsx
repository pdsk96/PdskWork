import type { Metadata, Viewport } from 'next'
import './globals.css'
import './view-transitions.css'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import LiquidGlassNav from '@/components/LiquidGlassNav'
import CursorSpotlight from '@/components/CursorSpotlight'
import CyberBackground from '@/components/CyberBackground'
import { WebVitals } from '@/components/WebVitals'
import { LazyMotion, domAnimation } from 'motion/react'

export const metadata: Metadata = {
  title: 'PdskWork — Cyberpunk Liquid Glass',
  description:
    'PdskWork portfolio. Cyberpunk creations built with Next.js, React Three Fiber and Framer Motion.',
  applicationName: 'PdskWork',
}

export const viewport: Viewport = {
  themeColor: '#05060a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LocaleProvider>
          {/* LazyMotion + domAnimation: ship the lazy animation feature bundle
              instead of the full framer/motion bundle (smaller client JS). */}
          <LazyMotion features={domAnimation} strict>
            <WebVitals />
            <CyberBackground />
            <CursorSpotlight />
            <LiquidGlassNav />
            {children}
          </LazyMotion>
        </LocaleProvider>
      </body>
    </html>
  )
}
