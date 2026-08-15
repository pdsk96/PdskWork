import type { MetadataRoute } from 'next'

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://pdsk-work.example.com'

/**
 * robots.ts — robots.txt generation. The admin console is disallowed for
 * crawlers; public pages are allowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
