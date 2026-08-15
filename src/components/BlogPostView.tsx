'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { getPostBySlug, type BlogPost } from '@/lib/blog-firestore'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate, readingTime } from '@/lib/blog-utils'
import RouteTransition from '@/components/RouteTransition'
import ShareButtons from '@/components/ShareButtons'

/**
 * BlogPostView — client-side blog post renderer.
 *
 * Reads the slug from the URL pathname and fetches the post from Firestore on
 * mount. Seed slugs are pre-rendered to static HTML at build (see
 * generateStaticParams in the page) so the initial HTML + metadata exist for
 * SEO; this component hydrates and (re)loads live content from Firestore so
 * admin edits appear.
 *
 * For slugs created post-deploy that have no static HTML, Firebase Hosting
 * rewrites `/blog/{slug}` → `/blog/_` (placeholder page), which renders this
 * component; it then reads the real slug from `window.location.pathname`.
 */
function readSlugFromPath(): string {
  if (typeof window === 'undefined') return ''
  const m = window.location.pathname.match(/\/blog\/([^/]+)(?:\/)?$/)
  return m ? decodeURIComponent(m[1]) : ''
}

export default function BlogPostView() {
  const { locale, dict } = useLocale()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const slug = readSlugFromPath()
    setPost(undefined)
    void getPostBySlug(slug)
      .then((p) => {
        if (active) setPost(p)
      })
      .catch(() => {
        if (active) setPost(null)
      })
    return () => {
      active = false
    }
  }, [])

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
          <Link href="/blog" className="blog-post__back" transitionTypes={['nav-back']}>
            ← {dict.blog.backToBlog}
          </Link>

          <header className="blog-post__header">
            <div className="blog-card__meta">
              <time dateTime={post.createdAt}>{formatDate(post.createdAt, locale)}</time>
              <span className="blog-card__dot" aria-hidden="true">·</span>
              <span>{readingTime(post.content, dict.blog.minRead)}</span>
            </div>
            <h1 className="blog-post__title">{post.title}</h1>
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
