'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import { createPost, type BlogPost } from '@/lib/blog-firestore'

export interface ScheduledJob {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  locale: 'en' | 'id'
  scheduledAt: number
  status: 'pending' | 'published' | 'failed'
  createdAt: number
}

export default function ScheduleManager({ jobs, onCreateJob }: {
  jobs: ScheduledJob[]
  onCreateJob: (job: Omit<ScheduledJob, 'id' | 'createdAt' | 'status'>) => void
}) {
  const { dict } = useLocale()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [locale, setLocale] = useState<'en' | 'id'>('en')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) return
    const scheduledAt = new Date(`${date}T${time}`).getTime()
    onCreateJob({ title, content, excerpt, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), locale, scheduledAt })
    setTitle('')
    setContent('')
    setExcerpt('')
    setTags('')
    setDate('')
    setTime('')
  }

  return (
    <div className="schedule-manager">
      <h3 className="auth-title">Schedule Auto-Post</h3>
      <form className="glass-card blog-editor" onSubmit={handleSubmit}>
        <div className="field">
          <span className="field-label">Title</span>
          <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <span className="field-label">Excerpt</span>
          <textarea className="field-input field-input--area" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
        </div>
        <div className="field">
          <span className="field-label">Content (Markdown)</span>
          <textarea className="field-input field-input--area field-input--code" rows={8} value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div className="blog-editor__row">
          <div className="field">
            <span className="field-label">Tags (comma-separated)</span>
            <input className="field-input" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="field">
            <span className="field-label">Language</span>
            <select className="field-input" value={locale} onChange={(e) => setLocale(e.target.value as 'en' | 'id')}>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
        </div>
        <div className="blog-editor__row">
          <div className="field">
            <span className="field-label">Date</span>
            <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="field">
            <span className="field-label">Time</span>
            <input className="field-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="primary-btn">Schedule Post</button>
      </form>

      <div className="schedule-manager__list">
        <h4>Upcoming Posts</h4>
        {jobs.length === 0 && <p className="blog-empty">No scheduled posts.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="glass-card schedule-manager__item">
            <div className="schedule-manager__item-main">
              <span className={`blog-badge ${job.status === 'pending' ? 'blog-badge--draft' : 'blog-badge--published'}`}>
                {job.status}
              </span>
              <span>{job.title}</span>
              <time>{new Date(job.scheduledAt).toLocaleString()}</time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
