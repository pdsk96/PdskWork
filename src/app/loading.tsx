/**
 * Route loading UI — streamed as the static shell while the route's async
 * content (server components reading cookies, etc.) resolves. This keeps the
 * Largest Contentful Paint fast by shipping a fallback immediately and
 * streaming the real content into it (per Next.js 16 instant navigation /
 * streaming guidance). Styles live in globals.css (.skeleton*) so this stays
 * a plain Server Component (no styled-jsx).
 */
export default function Loading() {
  return (
    <main className="page" aria-busy="true" aria-live="polite">
      <section className="glass-card page-card">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--lead" />
        <div className="skeleton skeleton--lead" />
      </section>
    </main>
  )
}
