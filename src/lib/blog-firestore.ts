'use client'

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
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

/** Find a single published post by slug. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug), where('published', '==', true))
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
  const posts = await getAllPosts()
  const base = slug || 'post'
  let candidate = base
  let n = 1
  while (posts.some((p) => p.slug === candidate && p.id !== excludeId)) {
    n += 1
    candidate = `${base}-${n}`
  }
  return candidate
}

export { slugify }
export type { BlogPost, BlogInput }
