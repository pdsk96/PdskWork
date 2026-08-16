import type { MetadataRoute } from 'next'
import { getSeedPublishedPosts } from '@/lib/blog-seed'

// Static export: sitemap is generated at build time (no server runtime).
export const dynamic = 'force-static'

/**
 * sitemap.ts — programmatic sitemap for search engines.
 *
 * Static export (`output: 'export'`) generates `/sitemap.xml` at BUILD time
 * from the committed seed (`src/db/blog.json`). Posts created in Firestore
 * after deploy appear here after the next build/redeploy. No server runtime.
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdskwork.web.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const sections: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/welcome`, lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const posts = getSeedPublishedPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...sections, ...postEntries]
}

