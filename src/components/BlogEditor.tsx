'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import type { BlogPost } from '@/lib/blog-store'

interface BlogEditorProps {
  /** Existing post for edit mode; undefined for create mode. */
  post?: BlogPost
}

/**
 * BlogEditor — shared form for creating and editing posts. Submits to the
 * /api/blog CRUD endpoints. In edit mode it also offers a delete action.
 */
export default function BlogEditor({ post }: BlogEditorProps) {
  const { dict } = useLocale()
  const router = useRouter()
  const isEdit = !!post

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [locale, setLocale] = useState<'en' | 'id'>(post?.locale ?? 'en')
  const [published, setPublished] = useState(post?.published ?? false)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        title,
        slug: slug || undefined,
        excerpt,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        locale,
        published,
      }
      const url = isEdit ? `/api/blog/${post!.id}` : '/api/blog'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? dict.blog.saveError)
        return
      }
      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError(dict.blog.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!post) return
    if (!window.confirm(dict.blog.confirmDelete)) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/${post.id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError(dict.blog.deleteError)
        return
      }
      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError(dict.blog.deleteError)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form className="glass-card blog-editor" onSubmit={onSave}>
      <div className="blog-editor__head">
        <h1 className="auth-title">
          {isEdit ? dict.blog.editPost : dict.blog.newPost}
        </h1>
        <Link href="/admin/blog" className="ghost-btn" aria-label={dict.blog.backToAdmin}>
          ← {dict.blog.backToAdmin}
        </Link>
      </div>

      <label className="field">
        <span className="field-label">{dict.blog.titleField}</span>
        <input
          className="field-input"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">{dict.blog.slugField}</span>
        <input
          className="field-input"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto"
        />
        <span className="field-hint">{dict.blog.slugHint}</span>
      </label>

      <label className="field">
        <span className="field-label">{dict.blog.excerptField}</span>
        <textarea
          className="field-input field-input--area"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />
        <span className="field-hint">{dict.blog.excerptHint}</span>
      </label>

      <label className="field">
        <span className="field-label">{dict.blog.contentField}</span>
        <textarea
          className="field-input field-input--area field-input--code"
          rows={16}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <span className="field-hint">{dict.blog.contentHint}</span>
      </label>

      <div className="blog-editor__row">
        <label className="field">
          <span className="field-label">{dict.blog.tagsField}</span>
          <input
            className="field-input"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <span className="field-hint">{dict.blog.tagsHint}</span>
        </label>

        <label className="field">
          <span className="field-label">{dict.blog.localeField}</span>
          <select
            className="field-input"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en' | 'id')}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </label>
      </div>

      <label className="field field--check">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <span className="field-label">{dict.blog.publishedField}</span>
        <span className="field-hint">{dict.blog.publishedHint}</span>
      </label>

      {error && (
        <p role="alert" className="auth-error">{error}</p>
      )}

      <div className="blog-editor__actions">
        <button type="submit" className="primary-btn" disabled={saving || deleting}>
          {saving ? dict.blog.saving : dict.blog.save}
        </button>
        {isEdit && (
          <button type="button" className="ghost-btn ghost-btn--danger" onClick={onDelete} disabled={saving || deleting}>
            {deleting ? '…' : dict.blog.delete}
          </button>
        )}
        <Link href="/admin/blog" className="ghost-btn">{dict.blog.cancel}</Link>
      </div>
    </form>
  )
}
