import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/blog-store'
import { stripMarkdown } from '@/lib/markdown'

/**
 * RSS feed — `/feed.xml`. RSS 2.0 describing the site's main sections plus
 * published blog posts so feed readers can surface updates and drive return
 * visits. Reads blog posts at request time, so this route is dynamic.
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdsk.qd.je'

const SECTIONS = [
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
    path: '/blog',
    title: 'Blog — PdskWork',
    desc: 'Catatan proses, bedah mendalam, dan retrospektif iterasi.',
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

  const posts = await getPublishedPosts()
  const postItems = posts.map(
    (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/blog/${esc(p.slug)}</link>
      <guid isPermaLink="true">${BASE}/blog/${esc(p.slug)}</guid>
      <description>${esc(p.excerpt || stripMarkdown(p.content))}</description>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <category>${p.locale}</category>
    </item>`,
  ).join('')

  const sectionItems = SECTIONS.map(
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
    ${postItems}
    ${sectionItems}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
