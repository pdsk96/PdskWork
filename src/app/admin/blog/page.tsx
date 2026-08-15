'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { getAllPosts, type BlogPost } from '@/lib/blog-firestore'
import { formatDate } from '@/lib/blog-utils'
import AdminGate from '@/components/AdminGate'

export default function AdminBlogPage() {
  return (
    <AdminGate>
      <AdminBlogList />
    </AdminGate>
  )
}

function AdminBlogList() {
  const { locale, dict } = useLocale()
  const [posts, setPosts] = useState<BlogPost[] | null>(null)

  useEffect(() => {
    let active = true
    void getAllPosts()
      .then((p) => {
        if (active) setPosts(p)
      })
      .catch(() => {
        if (active) setPosts([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <div className="blog-admin__head">
          <div>
            <h1 className="auth-title">{dict.blog.adminTitle}</h1>
            <p className="admin-welcome">{dict.blog.adminSubtitle}</p>
          </div>
          <Link href="/admin/blog/new" className="primary-btn">{dict.blog.newPost}</Link>
        </div>

        <Link href="/blog" className="ghost-btn" target="_blank">
          {dict.blog.viewPosts} ↗
        </Link>

        {posts === null ? (
          <p className="blog-empty" aria-busy="true">…</p>
        ) : posts.length === 0 ? (
          <p className="blog-empty">{dict.blog.noPosts}</p>
        ) : (
          <ul className="blog-admin__list">
            {posts.map((post) => (
              <li key={post.id} className="blog-admin__item">
                <div className="blog-admin__item-main">
                  <span
                    className={`blog-badge ${post.published ? 'blog-badge--published' : 'blog-badge--draft'}`}
                  >
                    {post.published ? dict.blog.publishedBadge : dict.blog.draftBadge}
                  </span>
                  <span className="blog-admin__item-locale">{post.locale.toUpperCase()}</span>
                  <span className="blog-admin__item-title">{post.title}</span>
                  <time className="blog-admin__item-date" dateTime={post.createdAt}>
                    {formatDate(post.createdAt, locale)}
                  </time>
                </div>
                <div className="blog-admin__item-actions">
                  <Link href={`/admin/blog/${post.id}/edit`} className="ghost-btn">
                    {dict.blog.edit}
                  </Link>
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} className="ghost-btn" target="_blank">
                      ↗
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link href="/admin" className="ghost-btn">← {dict.blog.backToAdmin}</Link>
      </section>
    </main>
  )
}

