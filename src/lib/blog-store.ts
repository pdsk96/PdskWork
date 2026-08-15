import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

/**
 * Blog store — JSON-file-backed persistence for blog posts.
 *
 * Why JSON and not SQLite? The repo scaffolds a SQLite schema but ships no
 * driver (see `src/lib/db.ts` — getDbConfig() only returns DATABASE_URL). A
 * file-based store keeps the build green with zero native deps, works offline,
 * and persists across restarts. Swapping to a real DB later only requires
 * re-implementing this module's internals.
 *
 * All methods are async and read/write the file on each call — fine for a
 * single-admin portfolio CMS. Posts are kept in `src/db/blog.json`.
 */

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  published: boolean
  locale: 'en' | 'id'
  createdAt: string
  updatedAt: string
}

export interface BlogInput {
  slug?: string
  title: string
  excerpt: string
  content: string
  tags?: string[]
  published?: boolean
  locale?: 'en' | 'id'
}

const BLOG_FILE = join(process.cwd(), 'src', 'db', 'blog.json')

async function ensureFile(): Promise<void> {
  try {
    await readFile(BLOG_FILE, 'utf8')
  } catch {
    await mkdir(join(process.cwd(), 'src', 'db'), { recursive: true })
    await writeFile(BLOG_FILE, '[]', 'utf8')
  }
}

async function readAll(): Promise<BlogPost[]> {
  await ensureFile()
  const raw = await readFile(BLOG_FILE, 'utf8')
  try {
    return JSON.parse(raw) as BlogPost[]
  } catch {
    return []
  }
}

/** Atomic write: write to a temp file then rename, so a crash mid-write never
 *  leaves a half-written blog.json. */
async function writeAll(posts: BlogPost[]): Promise<void> {
  const tmp = `${BLOG_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(posts, null, 2), 'utf8')
  // rename over the target atomically on POSIX; on Windows it replaces.
  await import('node:fs/promises').then((f) => f.rename(tmp, BLOG_FILE))
}

/** Slugify a title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Ensure a slug is unique across all posts (appends -2, -3, … if needed). */
async function uniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const posts = await readAll()
  const base = slug || 'post'
  let candidate = base
  let n = 1
  while (posts.some((p) => p.slug === candidate && p.id !== excludeId)) {
    n += 1
    candidate = `${base}-${n}`
  }
  return candidate
}

/** Return all posts, newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await readAll()
  return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** Return published posts, optionally filtered by locale. */
export async function getPublishedPosts(locale?: 'en' | 'id'): Promise<BlogPost[]> {
  const posts = await getAllPosts()
  return posts.filter((p) => p.published && (!locale || p.locale === locale))
}

/** Find a single published post by slug. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await readAll()
  return posts.find((p) => p.slug === slug && p.published) ?? null
}

/** Find a single post by id (any state — used by the admin editor). */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const posts = await readAll()
  return posts.find((p) => p.id === id) ?? null
}

/** Create a new post. Returns the created post. */
export async function createPost(input: BlogInput): Promise<BlogPost> {
  const now = new Date().toISOString()
  const slug = await uniqueSlug(slugify(input.slug || input.title))
  const post: BlogPost = {
    id: randomUUID(),
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    published: input.published ?? false,
    locale: input.locale ?? 'en',
    createdAt: now,
    updatedAt: now,
  }
  const posts = await readAll()
  posts.push(post)
  await writeAll(posts)
  return post
}

/** Update an existing post by id. Returns the updated post or null. */
export async function updatePost(id: string, input: Partial<BlogInput>): Promise<BlogPost | null> {
  const posts = await readAll()
  const idx = posts.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const current = posts[idx]
  const slug =
    input.slug !== undefined && input.slug !== current.slug
      ? await uniqueSlug(slugify(input.slug), id)
      : current.slug
  const updated: BlogPost = {
    ...current,
    slug,
    title: input.title !== undefined ? input.title.trim() : current.title,
    excerpt: input.excerpt !== undefined ? input.excerpt.trim() : current.excerpt,
    content: input.content !== undefined ? input.content : current.content,
    tags: input.tags !== undefined ? input.tags.map((t) => t.trim()).filter(Boolean) : current.tags,
    published: input.published !== undefined ? input.published : current.published,
    locale: input.locale ?? current.locale,
    updatedAt: new Date().toISOString(),
  }
  posts[idx] = updated
  await writeAll(posts)
  return updated
}

/** Delete a post by id. Returns true if deleted. */
export async function deletePost(id: string): Promise<boolean> {
  const posts = await readAll()
  const next = posts.filter((p) => p.id !== id)
  if (next.length === posts.length) return false
  await writeAll(next)
  return true
}
