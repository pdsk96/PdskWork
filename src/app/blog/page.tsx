'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale } from '@/i18n/LocaleProvider'
import { getPaginatedPosts, type BlogPost, POSTS_PER_PAGE } from '@/lib/blog-firestore'
import { formatDate, readingTime } from '@/lib/blog-utils'
import { getPostThumbnail } from '@/lib/thumbnail-generator'
import RouteTransition from '@/components/RouteTransition'

export default function BlogPage() {
  const { locale, dict } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [showingAll, setShowingAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get('page')
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1
  })
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  const updatePageInURL = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.replace(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  const fetchPosts = useCallback(async (page: number) => {
    setIsLoading(true)
    try {
      const result = await getPaginatedPosts(locale, page, POSTS_PER_PAGE)
      setPosts(result.posts)
      setHasMore(result.hasMore)
      setTotalCount(result.totalCount)
      setCurrentPage(page)
      if (result.posts.length > 0 && result.posts.every((p) => p.locale !== locale)) {
        setShowingAll(true)
      } else {
        setShowingAll(false)
      }
    } catch {
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [locale])

  useEffect(() => {
    let active = true
    const pageFromURL = searchParams.get('page')
    const initialPage = pageFromURL ? Math.max(1, parseInt(pageFromURL, 10) || 1) : 1
    void getPaginatedPosts(locale, initialPage, POSTS_PER_PAGE)
      .then((result) => {
        if (!active) return
        if (result.posts.length > 0) {
          setPosts(result.posts)
          setHasMore(result.hasMore)
          setTotalCount(result.totalCount)
          setCurrentPage(initialPage)
          if (result.posts.every((p) => p.locale !== locale)) {
            setShowingAll(true)
          } else {
            setShowingAll(false)
          }
        } else {
          setPosts([])
        }
      })
      .catch(() => {
        if (active) setPosts([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [locale, searchParams])

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    updatePageInURL(page)
    void fetchPosts(page)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.blog.title}</h1>
          <p className="page-lead">{dict.blog.subtitle}</p>
        </section>

        {posts === null || isLoading ? (
          <section className="blog-list" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card blog-card">
                <div className="skeleton skeleton--lead" />
                <div className="skeleton skeleton--title" />
                <div className="skeleton skeleton--lead" />
                <div className="skeleton skeleton--lead" />
              </div>
            ))}
          </section>
        ) : posts.length === 0 ? (
          <section className="page-card">
            <p className="blog-empty">{dict.blog.noPosts}</p>
          </section>
        ) : (
          <>
            <section className="blog-list" aria-label={dict.blog.title}>
              {showingAll && <p className="blog-list__fallback">{dict.blog.noPostsMatch}</p>}
              {posts.map((post) => (
                <article key={post.id} className="glass-card blog-card">
                  <div className="blog-card__thumbnail" style={{
                    backgroundImage: `url(${getPostThumbnail(post)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '180px',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    border: '1px solid var(--glass-border)'
                  }} role="img" aria-label={post.title}>
                  </div>
                  <div className="blog-card__meta">
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt, locale)}</time>
                    <span className="blog-card__dot" aria-hidden="true">·</span>
                    <span>{readingTime(post.content, dict.blog.minRead)}</span>
                  </div>
                  <h2 className="blog-card__title">
                    <Link href={`/blog/${post.slug}`} className="blog-card__link" style={{
                      background: 'linear-gradient(120deg, var(--cyan), var(--magenta), var(--violet))',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                      fontWeight: '600'
                    }}>
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
                  <Link href={`/blog/${post.slug}`} className="blog-card__readmore">
                    {dict.blog.readMore} →
                  </Link>
                </article>
              ))}
            </section>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Blog pagination">
                <button
                  className="pagination__btn pagination__btn--prev"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ← {dict.blog.prev || 'Previous'}
                </button>

                <div className="pagination__numbers">
                  {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                      <button
                        key={page}
                        className={`pagination__btn pagination__btn--number ${currentPage === page ? 'pagination__btn--active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
                    )
                  ))}
                </div>

                <button
                  className="pagination__btn pagination__btn--next"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore && currentPage === totalPages}
                  aria-label="Next page"
                >
                  {dict.blog.next || 'Next'} →
                </button>
              </nav>
            )}

            <p className="pagination__info">
              {dict.blog.showing || 'Showing'} {(currentPage - 1) * POSTS_PER_PAGE + 1}–{Math.min(currentPage * POSTS_PER_PAGE, totalCount)} {dict.blog.of || 'of'} {totalCount} {dict.blog.posts || 'posts'}
            </p>
          </>
        )}
      </main>
    </RouteTransition>
  )
}

