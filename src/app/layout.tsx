import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import Navbar from '@/components/Navbar'
import CursorSpotlight from '@/components/CursorSpotlight'

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
          <CursorSpotlight />
          <Navbar />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
