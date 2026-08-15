import type { Metadata, Viewport } from 'next'
import './globals.css'
import './view-transitions.css'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import LiquidGlassNav from '@/components/LiquidGlassNav'
import CursorSpotlight from '@/components/CursorSpotlight'
import CyberBackground from '@/components/CyberBackground'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import SiteFooter from '@/components/SiteFooter'
import { WebVitals } from '@/components/WebVitals'
import { FirebaseAnalytics } from '@/components/FirebaseAnalytics'
import { LazyMotion, domAnimation } from 'motion/react'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdsk.qd.je',
  ),
  title: 'PdskWork — Cyberpunk Liquid Glass',
  description:
    'PdskWork portfolio. Cyberpunk creations built with Next.js, React Three Fiber and Motion.',
  applicationName: 'PdskWork',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'PdskWork RSS' }],
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#05060a',
  colorScheme: 'dark light',
}

// No-flash theme script: sets data-theme on <html> before hydration so the
// correct palette renders immediately (reads the pdsk-theme cookie).
const themeInitScript = `
(function(){try{var c=document.cookie.match(/(?:^|; )pdsk-theme=([^;]*)/);var t=(c&&c[1])||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <LocaleProvider>
          <ThemeProvider>
            {/* LazyMotion + domAnimation: ship the lazy animation feature bundle
                instead of the full Motion bundle (smaller client JS). */}
            <LazyMotion features={domAnimation} strict>
              <FirebaseAnalytics />
              <WebVitals />
              <ReadingProgress />
              <CyberBackground />
              <CursorSpotlight />
              <LiquidGlassNav />
              {children}
              <SiteFooter />
              <BackToTop />
            </LazyMotion>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
