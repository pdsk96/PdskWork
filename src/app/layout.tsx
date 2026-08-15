import type { Metadata, Viewport } from 'next'
import './globals.css'
import './view-transitions.css'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import LiquidGlassNav from '@/components/LiquidGlassNav'
import CursorSpotlight from '@/components/CursorSpotlight'
import CyberBackground from '@/components/CyberBackground'

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
          <CyberBackground />
          <CursorSpotlight />
          <LiquidGlassNav />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
