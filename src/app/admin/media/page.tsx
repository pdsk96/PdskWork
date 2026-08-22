'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'
import { uploadMedia, deleteMedia, listMedia, type MediaItem } from '@/lib/media-gallery'

export default function AdminMediaPage() {
  const { dict } = useLocale()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

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

  const confirmDelete = async (path: string) => {
    try {
      await deleteMedia(path)
      setItems((prev) => prev.filter((i) => i.fullPath !== path))
      setToast('Deleted.')
    } catch {
      setToast('Delete failed.')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <div className="blog-admin__head">
            <div>
              <h1 className="auth-title">{dict.admin.mediaTitle}</h1>
              <p className="admin-welcome">{dict.admin.mediaSubtitle}</p>
            </div>
            <label className="primary-btn" style={{ cursor: 'pointer' }}>
              {uploading ? dict.admin.mediaUploading : dict.admin.mediaUpload}
              <input type="file" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} hidden />
            </label>
          </div>

          <AdminNav />

          {loading ? (
            <p className="blog-empty" aria-busy="true">Loading media...</p>
          ) : items.length === 0 ? (
            <p className="blog-empty">{dict.admin.mediaEmpty}</p>
          ) : (
            <div className="media-gallery">
              {items.map((item) => (
                <div key={item.fullPath} className="media-gallery__item">
                  {item.contentType?.startsWith('video/') ? (
                    <video controls src={item.url} className="media-gallery__preview" aria-label={item.name} />
                  ) : (
                    <img src={item.url} alt={item.name} className="media-gallery__preview" loading="lazy" />
                  )}
                  <div className="media-gallery__meta">
                    <span className="media-gallery__name" title={item.name}>{item.name}</span>
                    {pendingDelete === item.fullPath ? (
                      <span className="media-gallery__confirm">
                        <button type="button" className="ghost-btn ghost-btn--danger" onClick={() => confirmDelete(item.fullPath)}>Yes, delete</button>
                        <button type="button" className="ghost-btn" onClick={() => setPendingDelete(null)}>Cancel</button>
                      </span>
                    ) : (
                      <button type="button" className="ghost-btn ghost-btn--danger" onClick={() => setPendingDelete(item.fullPath)}>{dict.admin.mediaDelete}</button>
                    )}
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
