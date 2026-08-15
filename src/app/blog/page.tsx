'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { getPublishedPosts, type BlogPost } from '@/lib/blog-firestore'
import { formatDate, readingTime } from '@/lib/blog-utils'
import RouteTransition from '@/components/RouteTransition'

export default function BlogPage() {
  const { locale, dict } = useLocale()
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [showingAll, setShowingAll] = useState(false)

  useEffect(() => {
    let active = true
    // Show posts in the current locale first; fall back to all if none match.
    void getPublishedPosts(locale)
      .then((localePosts) => {
        if (!active) return
        if (localePosts.length > 0) {
          setPosts(localePosts)
          setShowingAll(false)
        } else {
          void getPublishedPosts().then((all) => {
            if (!active) return
            setPosts(all)
            setShowingAll(all.length > 0)
          })
        }
      })
      .catch(() => {
        if (active) setPosts([])
      })
    return () => {
      active = false
    }
  }, [locale])

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.blog.title}</h1>
          <p className="page-lead">{dict.blog.subtitle}</p>
        </section>

        {posts === null ? (
          <section className="blog-list" aria-busy="true">
            <div className="glass-card blog-card">
              <div className="skeleton skeleton--lead" />
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--lead" />
              <div className="skeleton skeleton--lead" />
            </div>
          </section>
        ) : posts.length === 0 ? (
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

