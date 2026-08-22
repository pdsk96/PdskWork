'use client'

import {
  collection,
  deleteDoc,
  doc,
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

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function snapToPost(id: string, data: Record<string, unknown>): BlogPost {
  return {
    id,
    slug: String(data.slug ?? ''),
    title: String(data.title ?? ''),
    excerpt: String(data.excerpt ?? ''),
    content: String(data.content ?? ''),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    published: Boolean(data.published),
    locale: data.locale === 'id' ? 'id' : 'en',
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
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
  return snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))
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

  if (page <= 1) {
    const q = query(baseQuery, limit(perPage))
    const snap = await getDocs(q)
    const posts = snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))
    const hasMore = posts.length === perPage
    return { posts, hasMore, totalCount: hasMore ? posts.length + 1 : posts.length }
  }

  const cursorQ = query(baseQuery, limit((page - 1) * perPage))
  const cursorSnap = await getDocs(cursorQ)
  const lastDoc = cursorSnap.docs[cursorSnap.docs.length - 1]

  const q = lastDoc
    ? query(baseQuery, startAfter(lastDoc), limit(perPage))
    : query(baseQuery, limit(perPage))
  const snap = await getDocs(q)
  const posts = snap.docs.map((d) => snapToPost(d.id, d.data() as Record<string, unknown>))

  return {
    posts,
    hasMore: posts.length === perPage,
    totalCount: cursorSnap.size + posts.length,
  }
}

/** Find a single published post by slug. */
export async function getPostBySlug(slug: string, locale?: string): Promise<BlogPost | null> {
  let q = query(collection(db, COLLECTION), where('slug', '==', slug), where('published', '==', true))
  
  // If locale is provided, try to find post in that locale first
  if (locale) {
    const localeQuery = query(q, where('locale', '==', locale))
    const localeSnap = await getDocs(localeQuery)
    if (!localeSnap.empty) {
      const d = localeSnap.docs[0]
      return snapToPost(d.id, d.data() as Record<string, unknown>)
    }
  }
  
  // Fallback: if no locale specified or no post found in specified locale,
  // return any post with matching slug (for backward compatibility)
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return snapToPost(d.id, d.data() as Record<string, unknown>)
}

/** Find a single post by id (any state — used by the admin editor). */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const d = await getDocById(id)
  if (!d) return null
  return snapToPost(id, d)
}

async function getDocById(id: string): Promise<Record<string, unknown> | null> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('__name__', '==', id)))
  if (snap.empty) return null
  return snap.docs[0].data() as Record<string, unknown>
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
  return updated
}

/** Delete a post by id. Returns true if deleted. */
export async function deletePost(id: string): Promise<boolean> {
  const current = await getPostById(id)
  if (!current) return false
  await deleteDoc(doc(db, COLLECTION, id))
  return true
}

/** Ensure a slug is unique across all posts (appends -2, -3, … if needed). */
async function uniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const base = slug || 'post'
  let candidate = base
  let n = 1
  while (true) {
    const q = query(collection(db, COLLECTION), where('slug', '==', candidate))
    const snap = await getDocs(q)
    const conflict = snap.docs.some((d) => d.id !== excludeId)
    if (!conflict) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}

/** Bulk update posts by id list. */
export async function bulkUpdatePosts(ids: string[], patch: Partial<Pick<BlogPost, 'published' | 'tags' | 'locale' | 'title' | 'excerpt'>>): Promise<number> {
  if (!ids.length) return 0
  const batch = writeBatch(db)
  let count = 0
  for (const id of ids) {
    const ref = doc(db, COLLECTION, id)
    batch.update(ref, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
    count++
  }
  await batch.commit()
  return count
}

/** Bulk delete posts by id list. */
export async function bulkDeletePosts(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  const batch = writeBatch(db)
  let count = 0
  for (const id of ids) {
    const ref = doc(db, COLLECTION, id)
    batch.delete(ref)
    count++
  }
  await batch.commit()
  return count
}

/** Increment view count for a post. */
export async function incrementViewCount(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { viewCount: increment(1) })
}

/** Get adjacent posts (previous and next) for a given slug, ordered by createdAt desc. */
export async function getAdjacentPosts(slug: string, locale?: 'en' | 'id'): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const posts = await getPublishedPosts(locale)
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  }
}

export type { BlogPost, BlogInput }
