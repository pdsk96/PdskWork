import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BlogPost } from './blog-types'

/**
 * Build-time blog seed reader.
 *
 * Static export (`output: 'export'`) has no server runtime, so anything that
 * must be known at BUILD time — `generateStaticParams`, `generateMetadata`,
 * `sitemap.ts`, the static RSS feed — reads the committed seed
 * `src/db/blog.json` synchronously here.
 *
 * Runtime (client-side) blog data comes from Firestore via `blog-firestore.ts`.
 * Seed posts are also imported into Firestore on first setup (see FIREBASE.md),
 * so the two stay in sync for the initial set.
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED_FILE = join(__dirname, '..', 'db', 'blog.json')
const COVER_MANIFEST = join(__dirname, '..', '..', 'public', 'blog-covers', 'manifest.json')

function readSeed(): BlogPost[] {
  try {
    const raw = readFileSync(SEED_FILE, 'utf8')
    return JSON.parse(raw) as BlogPost[]
  } catch {
    return []
  }
}

function readCoverManifest(): Record<string, { coverImage: string; coverImageAlt: string }> {
  try {
    const raw = readFileSync(COVER_MANIFEST, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function withCovers(posts: BlogPost[]): BlogPost[] {
  const manifest = readCoverManifest()
  if (!Object.keys(manifest).length) return posts
  return posts.map((p) => {
    const m = manifest[p.slug]
    if (!m) return p
    return {
      ...p,
      coverImage: m.coverImage,
      coverImageAlt: m.coverImageAlt,
    }
  })
}

/** All seed posts, newest first. Build-time only. */
export function getSeedPosts(): BlogPost[] {
  return withCovers(readSeed()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** Published seed posts, optionally filtered by locale. Build-time only. */
export function getSeedPublishedPosts(locale?: 'en' | 'id'): BlogPost[] {
  return getSeedPosts().filter((p) => p.published && (!locale || p.locale === locale))
}

/** Find a published seed post by slug. Build-time only. */
export function getSeedPostBySlug(slug: string): BlogPost | null {
  return getSeedPosts().find((p) => p.slug === slug && p.published) ?? null
}
