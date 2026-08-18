'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import { uploadMedia, deleteMedia, listMedia, type MediaItem } from '@/lib/media-gallery'

export default function AdminMediaPage() {
  const { dict } = useLocale()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const list = await listMedia()
      setItems(list)
    } catch {
      setToast('Failed to load media.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const item = await uploadMedia(file)
      setItems((prev) => [item, ...prev])
      setToast('Upload successful.')
    } catch {
      setToast('Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (path: string) => {
    if (!confirm('Delete this media? This cannot be undone.')) return
    try {
      await deleteMedia(path)
      setItems((prev) => prev.filter((i) => i.fullPath !== path))
      setToast('Deleted.')
    } catch {
      setToast('Delete failed.')
    }
  }

  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <div className="blog-admin__head">
            <div>
              <h1 className="auth-title">Media Gallery</h1>
              <p className="admin-welcome">Manage uploaded images and videos.</p>
            </div>
            <label className="primary-btn" style={{ cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} hidden />
            </label>
          </div>

          {loading ? (
            <p className="blog-empty" aria-busy="true">Loading media...</p>
          ) : items.length === 0 ? (
            <p className="blog-empty">No media uploaded yet.</p>
          ) : (
            <div className="media-gallery">
              {items.map((item) => (
                <div key={item.fullPath} className="media-gallery__item">
                  {item.contentType?.startsWith('video/') ? (
                    <video controls src={item.url} className="media-gallery__preview" />
                  ) : (
                    <img src={item.url} alt={item.name} className="media-gallery__preview" loading="lazy" />
                  )}
                  <div className="media-gallery__meta">
                    <span className="media-gallery__name" title={item.name}>{item.name}</span>
                    <button type="button" className="ghost-btn ghost-btn--danger" onClick={() => handleDelete(item.fullPath)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {toast && <div className="toast">{toast}</div>}
      </main>
    </AdminGate>
  )
}
