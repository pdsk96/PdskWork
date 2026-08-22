// Generates a static RSS feed (public/feed.xml) at build time from the
// committed seed blog.json. Static export has no server runtime, so the feed
// is a static file served by Firebase Hosting. Re-runs on every build; new
// Firestore posts appear after the next deploy.
//
// Invoked via `npm run prebuild` (runs automatically before `next build`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED = join(ROOT, 'src', 'db', 'blog.json')
const OUT = join(ROOT, 'public', 'feed.xml')
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdskwork.web.app'
const DEFAULT_LOCALE = 'en'

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripMd(md, max = 160) {
  const text = String(md ?? '')
    .replace(/[#>*_`~\-]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

const SECTIONS = [
  { path: '/', title: 'Beranda — PdskWork', desc: 'Karya cyberpunk untuk era liquid-glass. Hero 3D, glitch text, dan showcase interaktif.' },
  { path: '/work', title: 'Karya — PdskWork', desc: 'Galeri karya & proyek bertema cyberpunk.' },
  { path: '/blog', title: 'Blog — PdskWork', desc: 'Catatan proses, bedah mendalam, dan retrospektif iterasi.' },
  { path: '/about', title: 'Tentang — PdskWork', desc: 'Tentang PdskWork dan showcase bento grid.' },
  { path: '/contact', title: 'Kontak — PdskWork', desc: 'Hubungi pembuat PdskWork.' },
]

let posts = []
try {
  posts = JSON.parse(readFileSync(SEED, 'utf8'))
} catch {
  // no seed — emit feed with sections only
}

const updated = new Date().toUTCString()

const postItems = posts
  .filter((p) => p.published)
  .map(
    (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/blog/${esc(p.slug)}</link>
      <guid isPermaLink="true">${BASE}/blog/${esc(p.slug)}</guid>
      <description>${esc(p.excerpt || stripMd(p.content))}</description>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <category>${p.locale}</category>
    </item>`,
  )
  .join('')

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
    <language>${DEFAULT_LOCALE}</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    ${postItems}
    ${sectionItems}
  </channel>
</rss>`

mkdirSync(join(ROOT, 'public'), { recursive: true })
writeFileSync(OUT, xml, 'utf8')
console.log(`[feed] wrote ${OUT} (${posts.filter((p) => p.published).length} posts)`)
