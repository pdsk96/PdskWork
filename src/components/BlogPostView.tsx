'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { getPostBySlug, getPaginatedPosts, type BlogPost } from '@/lib/blog-firestore'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate, readingTime } from '@/lib/blog-utils'
import { getPostThumbnail } from '@/lib/thumbnail-generator'
import RouteTransition from '@/components/RouteTransition'
import ShareButtons from '@/components/ShareButtons'

function readSlugFromPath(): string {
  if (typeof window === 'undefined') return ''
  const m = window.location.pathname.match(/\/blog\/([^/]+)(?:\/)?$/)
  return m ? decodeURIComponent(m[1]) : ''
}

export default function BlogPostView() {
  const { locale, dict } = useLocale()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [prevPost, setPrevPost] = useState<BlogPost | null>(null)
  const [nextPost, setNextPost] = useState<BlogPost | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let active = true
    const slug = readSlugFromPath()
    setPost(undefined)
    setPrevPost(null)
    setNextPost(null)
    void getPostBySlug(slug, locale)
      .then(async (p) => {
        if (!active) return
        setPost(p)
        if (p) {
          try {
            const result = await getPaginatedPosts(locale, 1, 100)
            const idx = result.posts.findIndex((x) => x.id === p.id)
            if (idx > 0) setPrevPost(result.posts[idx - 1])
            if (idx < result.posts.length - 1) setNextPost(result.posts[idx + 1])
            setCurrentPage(Math.floor(idx / 6) + 1)
          } catch { /* ignore */ }
        }
      })
      .catch(() => {
        if (active) setPost(null)
      })
    return () => {
      active = false
    }
  }, [locale])

  if (post === undefined) {
    return (
      <RouteTransition>
        <main className="page" aria-busy="true">
          <section className="glass-card page-card blog-post">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--lead" />
            <div className="skeleton skeleton--lead" />
          </section>
        </main>
      </RouteTransition>
    )
  }

  if (post === null) {
    return (
      <RouteTransition>
        <main className="page">
          <section className="glass-card page-card">
            <h1 className="page-title">404</h1>
            <p className="page-lead">{dict.blog.notFound}</p>
            <Link href="/blog" className="ghost-btn">← {dict.blog.backToBlog}</Link>
          </section>
        </main>
      </RouteTransition>
    )
  }

  const html = renderMarkdown(post.content)

  return (
    <RouteTransition>
      <main className="page">
        <article className="glass-card page-card blog-post">
          <Link href={`/blog?page=${currentPage}`} className="blog-post__back">
             ← {dict.blog.backToBlog}
          </Link>

          <header className="blog-post__header">
            <div className="blog-card__meta">
              <time dateTime={post.createdAt}>{formatDate(post.createdAt, locale)}</time>
              <span className="blog-card__dot" aria-hidden="true">·</span>
              <span>{readingTime(post.content, dict.blog.minRead)}</span>
            </div>
            <h1 className="blog-post__title" style={{
              background: 'linear-gradient(120deg, var(--cyan), var(--magenta), var(--violet))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              {post.title}
            </h1>
            {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}
            {post.tags.length > 0 && (
              <ul className="blog-card__tags" aria-label={dict.blog.tags}>
                {post.tags.map((tag) => (
                  <li key={tag} className="blog-tag">#{tag}</li>
                ))}
              </ul>
            )}
          </header>

          <div
            className="blog-post__content markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <nav className="blog-post__nav" aria-label="Post navigation">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="blog-post__nav-link blog-post__nav-link--prev">
                ← {prevPost.title}
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="blog-post__nav-link blog-post__nav-link--next">
                {nextPost.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <footer className="blog-post__footer">
            <p className="blog-post__updated">
              {dict.blog.updatedOn} {formatDate(post.updatedAt, locale)}
            </p>
            <ShareButtons />
          </footer>
        </article>
      </main>
    </RouteTransition>
  )
}
