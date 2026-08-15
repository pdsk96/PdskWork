import { getLocaleDict } from '@/i18n/locale-server'
import { getPublishedPosts } from '@/lib/blog-store'
import RouteTransition from '@/components/RouteTransition'
import Link from 'next/link'
import { formatDate, readingTime } from '@/lib/blog-utils'

export const metadata = {
  title: 'Blog — PdskWork',
  description: 'Process notes, deep dives, and iteration retrospectives.',
}

export default async function BlogPage() {
  const { locale, dict } = await getLocaleDict()
  // Show posts in the current locale first; fall back to all if none match.
  const localePosts = await getPublishedPosts(locale)
  const posts = localePosts.length > 0 ? localePosts : await getPublishedPosts()
  const showingAll = localePosts.length === 0 && posts.length > 0

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.blog.title}</h1>
          <p className="page-lead">{dict.blog.subtitle}</p>
        </section>

        {posts.length === 0 ? (
          <section className="page-card">
            <p className="blog-empty">{dict.blog.noPosts}</p>
          </section>
        ) : (
          <section className="blog-list" aria-label={dict.blog.title}>
            {showingAll && <p className="blog-list__fallback">{dict.blog.noPostsMatch}</p>}
            {posts.map((post) => (
              <article key={post.id} className="glass-card blog-card">
                <div className="blog-card__meta">
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt, locale)}</time>
                  <span className="blog-card__dot" aria-hidden="true">·</span>
                  <span>{readingTime(post.content, dict.blog.minRead)}</span>
                </div>
                <h2 className="blog-card__title">
                  <Link href={`/blog/${post.slug}`} className="blog-card__link" transitionTypes={['nav-forward']}>
                    {post.title}
                  </Link>
                </h2>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                {post.tags.length > 0 && (
                  <ul className="blog-card__tags" aria-label={dict.blog.tags}>
                    {post.tags.map((tag) => (
                      <li key={tag} className="blog-tag">#{tag}</li>
                    ))}
                  </ul>
                )}
                <Link href={`/blog/${post.slug}`} className="blog-card__readmore" transitionTypes={['nav-forward']}>
                  {dict.blog.readMore} →
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </RouteTransition>
  )
}
