import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export for Firebase Hosting (Spark/free plan — no App Hosting).
  // Emits a fully static `out/` directory served by Firebase Hosting CDN.
  // All dynamic behavior (admin CMS, blog CRUD, locale) runs client-side via
  // Firestore + Firebase Auth. See FIREBASE.md.
  output: 'export',
  // No server runtime → next/image optimization unavailable. Serve images as-is.
  images: {
    unoptimized: true,
  },
  // Firebase Hosting serves the `out/` directory as the site root.
  distDir: 'out',
  // Clean URLs: /about/ → /about. Firebase Hosting also has cleanUrls:true.
  trailingSlash: false,
}

export default nextConfig
