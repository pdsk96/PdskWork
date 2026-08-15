import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog-store'

/**
 * sitemap.ts — programmatic sitemap for search engines.
 *
 * Reads published blog posts at request time, so this route is dynamic
 * (rendered on demand rather than prerendered at build).
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_NAME ??
  'https://pdsk-work.example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const sections: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]

  const posts = await getPublishedPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...sections, ...postEntries]
}
