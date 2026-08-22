import fs from 'node:fs'
import path from 'node:path'

const BLOG_JSON = path.join(process.cwd(), 'src/db/blog.json')
const OUT_DIR = path.join(process.cwd(), 'public/blog-covers')
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json')
const WIDTH = 1200
const HEIGHT = 630

const CYAN = '#00f0ff'
const VIOLET = '#7a5cff'
const MAGENTA = '#ff2bd6'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSvg(title, excerpt) {
  const truncatedTitle = title.length > 80 ? title.slice(0, 77) + '...' : title
  const truncatedExcerpt = excerpt.length > 140 ? excerpt.slice(0, 137) + '...' : excerpt

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${CYAN}"/>
      <stop offset="0.5" stop-color="${VIOLET}"/>
      <stop offset="1" stop-color="${MAGENTA}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="rgba(5,6,10,0.55)"/>
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" rx="24" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <text x="60" y="140" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif" font-size="52" font-weight="800" fill="#ffffff" filter="url(#glow)">${escapeXml(truncatedTitle)}</text>
  <text x="60" y="210" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif" font-size="26" fill="rgba(235,246,255,0.85)">${escapeXml(truncatedExcerpt)}</text>
  <text x="60" y="${HEIGHT - 60}" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif" font-size="20" fill="${CYAN}">PdskWork</text>
</svg>`
}

async function generateCoverImage(post) {
  const outPath = path.join(OUT_DIR, `${post.slug}.jpg`)
  if (fs.existsSync(outPath)) return outPath

  const svg = buildSvg(post.title, post.excerpt)
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 85, progressive: true })
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toFile(outPath)

  return outPath
}

async function main() {
  ensureDir(OUT_DIR)
  const raw = fs.readFileSync(BLOG_JSON, 'utf8')
  const posts = JSON.parse(raw)

  let updated = 0
  const manifest = {}

  for (const post of posts) {
    if (post.published !== true) continue
    if (post.coverImage) continue

    const slug = String(post.slug || post.id)
    const title = String(post.title || slug)
    const excerpt = String(post.excerpt || title)

    await generateCoverImage({ slug, title, excerpt })
    manifest[slug] = {
      coverImage: `/blog-covers/${slug}.jpg`,
      coverImageAlt: title,
    }
    updated++
  }

  if (updated > 0) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
    console.log(`[gen-cover-images] generated ${updated} cover image(s)`)
  } else {
    console.log('[gen-cover-images] nothing to generate')
  }
}

main().catch((err) => {
  console.error('[gen-cover-images] failed:', err)
  process.exit(1)
})
