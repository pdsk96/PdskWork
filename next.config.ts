import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cache Components: opt-in explicit "use cache" + prerendering model.
  // Required for partialPrefetching (Next.js 16.3). Routes that read
  // cookies()/headers() are auto-cached per-session or streamed behind
  // <Suspense> (see app/loading.tsx).
  cacheComponents: true,
  // Partial Prefetching: prefetch one reusable App Shell per route instead
  // of per-link, for faster SPA-like navigations. Requires cacheComponents.
  partialPrefetching: true,
  // Emit a self-contained `.next/standalone` server bundle so the app can
  // run on a Node.js container without the full node_modules tree. This is
  // the recommended output for self-hosting (Firebase App Hosting, Cloud
  // Run, Cloud Functions Gen 2). Traced files (src/db/blog.json) are copied
  // into the standalone output automatically.
  output: 'standalone',
}

export default nextConfig
