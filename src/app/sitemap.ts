import type { MetadataRoute } from 'next'

/**
 * sitemap.ts — programmatic sitemap for search engines.
 *
 * With Cache Components enabled this is a cached special Route Handler (it
 * uses no request-time APIs), so it is prerendered at build time.
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_NAME ??
  'https://pdsk-work.example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]
}
