/**
 * Shared blog types. Used by both the build-time seed reader (`blog-seed.ts`)
 * and the runtime Firestore client (`blog-firestore.ts`) so the two stay
 * shape-compatible.
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
  viewCount?: number
  coverImage?: string
  coverImageAlt?: string
}

export interface BlogInput {
  slug?: string
  title: string
  excerpt: string
  content: string
  tags?: string[]
  published?: boolean
  locale?: 'en' | 'id'
  coverImage?: string
  coverImageAlt?: string
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
