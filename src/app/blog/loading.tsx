export default function Loading() {
  return (
    <main className="page" aria-busy="true" aria-live="polite">
      <section className="glass-card page-card">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--lead" />
      </section>
      <section className="blog-list">
        <div className="glass-card blog-card">
          <div className="skeleton skeleton--lead" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--lead" />
          <div className="skeleton skeleton--lead" />
        </div>
      </section>
    </main>
  )
}
