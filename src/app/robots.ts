import type { MetadataRoute } from 'next'

// Static export: robots.txt is generated at build time (no server runtime).
export const dynamic = 'force-static'

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdskwork.web.app'

/**
 * robots.ts — robots.txt generation. The admin console is disallowed for
 * crawlers; public pages are allowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/blog/_'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
