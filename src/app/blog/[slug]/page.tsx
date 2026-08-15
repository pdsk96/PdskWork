import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getLocaleDict } from '@/i18n/locale-server'
import { getPostBySlug, getPublishedPosts } from '@/lib/blog-store'
import { renderMarkdown, stripMarkdown } from '@/lib/markdown'
import { formatDate, readingTime } from '@/lib/blog-utils'
import RouteTransition from '@/components/RouteTransition'
import ShareButtons from '@/components/ShareButtons'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Pre-render the published slugs at build (best-effort; falls back to dynamic).
export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not found — PdskWork' }
  return {
    title: `${post.title} — PdskWork Blog`,
    description: post.excerpt || stripMarkdown(post.content),
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const { locale, dict } = await getLocaleDict()
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
