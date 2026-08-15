import { NextResponse } from 'next/server'

/**
 * RSS feed — `/feed.xml`. A simple RSS 2.0 feed describing the site's main
 * sections so feed readers can surface updates and drive return visits.
 *
 * Cached by default under Cache Components (no request-time APIs used).
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdsk-work.example.com'

const ITEMS = [
  {
    path: '/',
    title: 'Beranda — PdskWork',
    desc: 'Karya cyberpunk untuk era liquid-glass. Hero 3D, glitch text, dan showcase interaktif.',
  },
  {
    path: '/work',
    title: 'Karya — PdskWork',
    desc: 'Galeri karya & proyek bertema cyberpunk.',
  },
  {
    path: '/about',
    title: 'Tentang — PdskWork',
    desc: 'Tentang PdskWork dan showcase bento grid.',
  },
  {
    path: '/contact',
    title: 'Kontak — PdskWork',
    desc: 'Hubungi pembuat PdskWork.',
  },
]

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const updated = new Date().toUTCString()
  const items = ITEMS.map(
    (it) => `
    <item>
      <title>${esc(it.title)}</title>
      <link>${BASE}${it.path}</link>
      <guid isPermaLink="true">${BASE}${it.path}</guid>
      <description>${esc(it.desc)}</description>
      <pubDate>${updated}</pubDate>
    </item>`,
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PdskWork</title>
    <link>${BASE}</link>
    <description>Karya cyberpunk untuk era liquid-glass.</description>
    <language>id</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
