'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import { createPost, getPostById, updatePost, deletePost, type BlogPost } from '@/lib/blog-firestore'

interface BlogEditorProps {
  /** Existing post for edit mode; undefined for create mode. */
  post?: BlogPost
}

/**
 * BlogEditor — shared form for creating and editing posts.
 *
 * In create mode (no `post` prop and not on an `/edit` route) it starts blank.
 * In edit mode it either receives a `post` prop OR, when rendered behind the
 * Firebase rewrite for `/admin/blog/{id}/edit`, derives the id from the URL
 * pathname and loads the post from Firestore. Submits via the Firestore client
 * store; in edit mode it also offers a delete action.
 */
export default function BlogEditor({ post }: BlogEditorProps) {
  const { dict } = useLocale()
  const router = useRouter()

  // Detect edit id from /admin/blog/<id>/edit when no post is provided.
  const editIdFromPath =
    typeof window !== 'undefined'
      ? (() => {
          try {
            const path = new URL(window.location.href).pathname
            const m = path.match(/\/admin\/blog\/([^/]+)\/edit/)
            return m ? m[1] : undefined
          } catch {
            return undefined
          }
        })()
      : undefined
  const isEdit = !!post || !!editIdFromPath

  const [loadedPost, setLoadedPost] = useState<BlogPost | null>(post ?? null)
  const [loadingPost, setLoadingPost] = useState(!post && !!editIdFromPath)

  useEffect(() => {
    if (post || !editIdFromPath) return
    let active = true
    setLoadingPost(true)
    void getPostById(editIdFromPath)
      .then((p) => {
        if (active) setLoadedPost(p)
      })
      .catch(() => {
        if (active) setLoadedPost(null)
      })
      .finally(() => {
        if (active) setLoadingPost(false)
      })
    return () => {
      active = false
    }
  }, [editIdFromPath, post])

  const editing = post ?? loadedPost ?? undefined

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [locale, setLocale] = useState<'en' | 'id'>('en')
  const [published, setPublished] = useState(false)
  const [fieldsReady, setFieldsReady] = useState(!loadingPost)

  // Populate form fields once the post to edit is known (prop or loaded).
  useEffect(() => {
    if (!editing) return
    setTitle(editing.title)
    setSlug(editing.slug)
    setExcerpt(editing.excerpt)
    setContent(editing.content)
    setTags(editing.tags.join(', '))
    setLocale(editing.locale)
    setPublished(editing.published)
    setFieldsReady(true)
  }, [editing])

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
      if (isEdit && editing) {
        await updatePost(editing.id, body)
      } else {
        await createPost(body)
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
    if (!editing) return
    if (!window.confirm(dict.blog.confirmDelete)) return
    setDeleting(true)
    setError(null)
    try {
      const ok = await deletePost(editing.id)
      if (!ok) {
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

  if (loadingPost || (isEdit && !fieldsReady)) {
    return (
      <form className="glass-card blog-editor" aria-busy="true">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--lead" />
        <div className="skeleton skeleton--lead" />
      </form>
    )
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

