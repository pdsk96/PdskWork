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
}

export default nextConfig
