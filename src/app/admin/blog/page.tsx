'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { getAllPosts, bulkUpdatePosts, bulkDeletePosts, type BlogPost } from '@/lib/blog-firestore'
import { formatDate } from '@/lib/blog-utils'
import AdminGate from '@/components/AdminGate'

type BulkAction = 'publish' | 'unpublish' | 'delete' | 'tag'

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkTag, setBulkTag] = useState('')
  const [toast, setToast] = useState<string | null>(null)

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (!posts) return
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)))
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    setBulkLoading(true)
    try {
      if (action === 'delete') {
        if (!confirm(`Delete ${ids.length} posts? This cannot be undone.`)) {
          setBulkLoading(false)
          return
        }
        const deleted = await bulkDeletePosts(ids)
        showToast(`Deleted ${deleted} posts.`)
      } else if (action === 'publish') {
        const updated = await bulkUpdatePosts(ids, { published: true })
        showToast(`Published ${updated} posts.`)
      } else if (action === 'unpublish') {
        const updated = await bulkUpdatePosts(ids, { published: false })
        showToast(`Unpublished ${updated} posts.`)
      } else if (action === 'tag') {
        if (!bulkTag.trim()) return
        const tags = bulkTag.split(',').map((t) => t.trim()).filter(Boolean)
        const updated = await bulkUpdatePosts(ids, { tags })
        showToast(`Updated tags for ${updated} posts.`)
        setBulkTag('')
      }
      setSelectedIds(new Set())
      setPosts((prev) => (prev ? prev.filter((p) => !ids.includes(p.id)) : prev))
    } catch {
      showToast('Bulk action failed.')
    } finally {
      setBulkLoading(false)
    }
  }

  const selectedCount = selectedIds.size
  const allSelected = !!posts && posts.length > 0 && selectedIds.size === posts.length

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <div className="blog-admin__head">
          <div>
            <h1 className="auth-title">{dict.blog.adminTitle}</h1>
            <p className="admin-welcome">{dict.blog.adminSubtitle}</p>
          </div>
          <div className="blog-admin__actions">
            <Link href="/admin/blog/new" className="primary-btn">{dict.blog.newPost}</Link>
            <Link href="/admin/agents" className="ghost-btn">AI Agent Studio</Link>
          </div>
        </div>

        <Link href="/blog" className="ghost-btn" target="_blank">
          {dict.blog.viewPosts} ↗
        </Link>

        {selectedCount > 0 && (
          <div className="bulk-actions">
            <span className="bulk-actions__count">{selectedCount} selected</span>
            <div className="bulk-actions__btns">
              <button className="primary-btn" onClick={() => handleBulkAction('publish')} disabled={bulkLoading}>
                Publish
              </button>
              <button className="ghost-btn" onClick={() => handleBulkAction('unpublish')} disabled={bulkLoading}>
                Unpublish
              </button>
              <div className="bulk-actions__row">
                <input
                  className="field-input"
                  value={bulkTag}
                  onChange={(e) => setBulkTag(e.target.value)}
                  placeholder="Add tags (comma-separated)"
                />
                <button className="ghost-btn" onClick={() => handleBulkAction('tag')} disabled={bulkLoading || !bulkTag.trim()}>
                  Update Tags
                </button>
              </div>
              <button className="ghost-btn ghost-btn--danger" onClick={() => handleBulkAction('delete')} disabled={bulkLoading}>
                Delete
              </button>
            </div>
          </div>
        )}

        {posts === null ? (
          <p className="blog-empty" aria-busy="true">…</p>
        ) : posts.length === 0 ? (
          <p className="blog-empty">{dict.blog.noPosts}</p>
        ) : (
          <ul className="blog-admin__list">
            <li className="blog-admin__item blog-admin__item--head">
              <label className="blog-admin__check">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
              </label>
              <span className="blog-admin__item-title">Title</span>
              <span className="blog-admin__item-locale">Locale</span>
              <span className="blog-admin__item-date">Date</span>
              <span className="blog-admin__item-actions">Actions</span>
            </li>
            {posts.map((post) => (
              <li key={post.id} className={`blog-admin__item ${selectedIds.has(post.id) ? 'is-selected' : ''}`}>
                <label className="blog-admin__check">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(post.id)}
                    onChange={() => toggleSelect(post.id)}
                  />
                </label>
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

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
