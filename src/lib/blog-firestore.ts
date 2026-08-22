'use client'

import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { slugify, type BlogInput, type BlogPost } from './blog-types'

/**
 * Runtime blog store — Firestore (client SDK).
 *
 * Static export has no server runtime, so blog data lives in Firestore and is
 * read/written from the browser. Public pages read published posts; the admin
 * CMS (gated by Firebase Auth + Firestore security rules) creates/edits/deletes.
 *
 * The interface mirrors the former server-side `blog-store.ts` so callers
 * (BlogEditor, pages) change as little as possible. Methods are async and
 * operate over the `posts` collection.
 *
 * Security: Firestore rules (see firestore.rules) allow public reads of
 * published posts and require auth for all writes. Optionally restrict writes
 * to a single admin uid via the `ADMIN_UID` rule.
 */

const COLLECTION = 'posts'

/** Default posts per page */
export const POSTS_PER_PAGE = 6

/** Result of a paginated query */
export interface PaginatedPosts {
  posts: BlogPost[]
  hasMore: boolean
  totalCount: number
}

/** Simple in-memory cache for Firestore queries (client-side, per-tab). */
const queryCache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 60_000 // 1 minute

function cacheKey(...parts: (string | number | boolean | undefined)[]): string {
  return parts.filter((p) => p !== undefined).join('|')
}

function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    queryCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCached<T>(key: string, data: T): void {
  queryCache.set(key, { data, ts: Date.now() })
}

function invalidateCache(...parts: (string | number | boolean | undefined)[]): void {
  const key = cacheKey(...parts)
  queryCache.delete(key)
  // Also clear slug-related cache entries
  for (const k of queryCache.keys()) {
    if (k.startsWith('slug|')) queryCache.delete(k)
  }
  // Also clear published-related cache entries for the locale
  if (parts[0] === 'published' || parts[0] === 'slug') {
    for (const k of queryCache.keys()) {
      if (k.startsWith('published|')) queryCache.delete(k)
    }
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function snapToPost(id: string, data: Record<string, unknown>, fallbackCreatedAt?: string): BlogPost {
  return {
    id,
    slug: typeof data.slug === 'string' ? data.slug : '',
    title: typeof data.title === 'string' ? data.title : '',
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
    content: typeof data.content === 'string' ? data.content : '',
    tags: isStringArray(data.tags) ? data.tags : [],
    published: typeof data.published === 'boolean' ? data.published : false,
    locale: data.locale === 'id' ? 'id' : 'en',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : fallbackCreatedAt ?? new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
    coverImageAlt: typeof data.coverImageAlt === 'string' ? data.coverImageAlt : undefined,
  }
}

/** Return all posts, newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))
}

/** Return published posts, optionally filtered by locale. */
export async function getPublishedPosts(locale?: 'en' | 'id'): Promise<BlogPost[]> {
  const key = cacheKey('published', locale)
  const cached = getCached<BlogPost[]>(key)
  if (cached) return cached

  const q = locale
    ? query(
        collection(db, COLLECTION),
        where('published', '==', true),
        where('locale', '==', locale),
        orderBy('createdAt', 'desc'),
      )
    : query(
        collection(db, COLLECTION),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
      )
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))
  setCached(key, posts)
  return posts
}

/** Return paginated published posts, optionally filtered by locale. */
export async function getPaginatedPosts(
  locale?: 'en' | 'id',
  page: number = 1,
  perPage: number = POSTS_PER_PAGE,
): Promise<PaginatedPosts> {
  const baseQuery = locale
    ? query(
        collection(db, COLLECTION),
        where('published', '==', true),
        where('locale', '==', locale),
        orderBy('createdAt', 'desc'),
      )
    : query(
        collection(db, COLLECTION),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
      )

  // Accurate total count via Firestore count aggregation.
  let totalCount = 0
  try {
    const countSnap = await getCountFromServer(baseQuery)
    totalCount = countSnap.data().count
  } catch {
    // Count aggregation unavailable (missing index / permissions).
    // Set totalCount to Infinity so the UI shows pagination controls
    // without a broken "0 items" state.
    totalCount = Infinity
  }

  if (page <= 1) {
    const q = query(baseQuery, limit(perPage))
    const snap = await getDocs(q)
    const posts = snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))
    const hasMore = posts.length === perPage
    if (totalCount === Infinity) {
      totalCount = hasMore ? perPage + 1 : posts.length
    }
    return { posts, hasMore, totalCount }
  }

  // Cursor-based pagination: fetch the last document of the previous page.
  const cursorQ = query(baseQuery, limit((page - 1) * perPage))
  const cursorSnap = await getDocs(cursorQ)
  const lastDoc = cursorSnap.docs[cursorSnap.docs.length - 1]

  const q = lastDoc
    ? query(baseQuery, startAfter(lastDoc), limit(perPage))
    : query(baseQuery, limit(perPage))
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))

  if (totalCount === Infinity) {
    totalCount = cursorSnap.size + posts.length + (posts.length === perPage ? 1 : 0)
  }

  return {
    posts,
    hasMore: posts.length === perPage,
    totalCount,
  }
}

/** Find a single published post by slug. */
export async function getPostBySlug(slug: string, locale?: string): Promise<BlogPost | null> {
  const key = cacheKey('slug', slug, locale)
  const cached = getCached<BlogPost | null>(key)
  if (cached !== null && cached !== undefined) return cached

  let q = query(collection(db, COLLECTION), where('slug', '==', slug), where('published', '==', true))

  // If locale is provided, try to find post in that locale first
  if (locale) {
    const localeQuery = query(q, where('locale', '==', locale))
    const localeSnap = await getDocs(localeQuery)
    if (!localeSnap.empty) {
      const d = localeSnap.docs[0]
      const post = snapToPost(d.id, d.data() as Record<string, unknown>)
      setCached(key, post)
      return post
    }
  }

  // Fallback: if no locale specified or no post found in specified locale,
  // return any post with matching slug (for backward compatibility)
  const snap = await getDocs(q)
  if (snap.empty) {
    setCached(key, null)
    return null
  }
  const d = snap.docs[0]
  const post = snapToPost(d.id, d.data() as Record<string, unknown>)
  setCached(key, post)
  return post
}

/** Find a single post by id (any state — used by the admin editor). */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const d = await getDocById(id)
  if (!d) return null
  return snapToPost(id, d)
}

async function getDocById(id: string): Promise<Record<string, unknown> | null> {
  // Use direct doc lookup instead of where('__name__', '==', id) for efficiency.
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as Record<string, unknown>
}

/** Create a new post. Returns the created post. */
export async function createPost(input: BlogInput): Promise<BlogPost> {
  const now = new Date().toISOString()
  const slug = await uniqueSlug(slugify(input.slug || input.title))
  const id = newId()
  const post: BlogPost = {
    id,
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
  // setDoc with the chosen id so doc id === post.id (stable for edits/deletes).
  await setDoc(doc(db, COLLECTION, id), { ...post })
  invalidateCache('published', input.locale)
  invalidateCache('slug', post.slug, input.locale)
  return post
}

/** Update an existing post by id. Returns the updated post or null. */
export async function updatePost(id: string, input: Partial<BlogInput>): Promise<BlogPost | null> {
  const current = await getPostById(id)
  if (!current) return null
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
  await updateDoc(doc(db, COLLECTION, id), { ...updated })
  invalidateCache('published', current.locale)
  invalidateCache('slug', current.slug, current.locale)
  invalidateCache('slug', slug, current.locale)
  return updated
}

/** Delete a post by id. Returns true if deleted. */
export async function deletePost(id: string): Promise<boolean> {
  const current = await getPostById(id)
  if (!current) return false
  await deleteDoc(doc(db, COLLECTION, id))
  invalidateCache('published', current.locale)
  invalidateCache('slug', current.slug, current.locale)
  return true
}

/** Ensure a slug is unique across all posts (appends -2, -3, … if needed). */
async function uniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const base = slug || 'post'
  let candidate = base
  for (let n = 1; n <= 1000; n++) {
    const q = query(collection(db, COLLECTION), where('slug', '==', candidate))
    const snap = await getDocs(q)
    const conflict = snap.docs.some((d) => d.id !== excludeId)
    if (!conflict) return candidate
    candidate = `${base}-${n}`
  }
  throw new Error('Unable to generate unique slug after 1000 attempts')
}

/** Bulk update posts by id list. */
export async function bulkUpdatePosts(ids: string[], patch: Partial<Pick<BlogPost, 'published' | 'tags' | 'locale' | 'title' | 'excerpt'>>): Promise<number> {
  if (!ids.length) return 0
  const BATCH_LIMIT = 500
  let count = 0
  for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    const chunk = ids.slice(i, i + BATCH_LIMIT)
    for (const id of chunk) {
      const ref = doc(db, COLLECTION, id)
      batch.update(ref, {
        ...patch,
        updatedAt: new Date().toISOString(),
      })
      count++
    }
    await batch.commit()
  }
  // Invalidate cache for all affected locales
  invalidateCache('published')
  invalidateCache('slug')
  return count
}

/** Bulk delete posts by id list. */
export async function bulkDeletePosts(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  const BATCH_LIMIT = 500
  let count = 0
  for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    const chunk = ids.slice(i, i + BATCH_LIMIT)
    for (const id of chunk) {
      const ref = doc(db, COLLECTION, id)
      batch.delete(ref)
      count++
    }
    await batch.commit()
  }
  // Invalidate cache for all affected locales
  invalidateCache('published')
  invalidateCache('slug')
  return count
}

/** Increment view count for a post. */
export async function incrementViewCount(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { viewCount: increment(1) })
}

/** Get adjacent posts (previous and next) for a given slug, ordered by createdAt desc. */
export async function getAdjacentPosts(slug: string, locale?: 'en' | 'id'): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const allPosts = await getPublishedPosts(locale)
  const idx = allPosts.findIndex((p) => p.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? allPosts[idx - 1] : null,
    next: idx < allPosts.length - 1 ? allPosts[idx + 1] : null,
  }
}

export type { BlogPost, BlogInput }
