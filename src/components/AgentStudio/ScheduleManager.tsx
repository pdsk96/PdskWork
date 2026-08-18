'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import { createPost, type BlogPost } from '@/lib/blog-firestore'
import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { runAgentPipeline, type AgentRunOptions } from '@/lib/agents/agent-orchestrator'
import { createAutoGenerateJob } from '@/lib/agents/scheduler'

export interface ScheduledJob {
  id: string
  type: 'manual' | 'auto-generate'
  title?: string
  content?: string
  excerpt?: string
  tags?: string[]
  locale?: 'en' | 'id'
  scheduledAt: number
  status: 'pending' | 'published' | 'failed' | 'generating'
  createdAt: number
  agentConfig?: LLMConfig
  maxOpportunities?: number
}

export default function ScheduleManager({ jobs, onCreateJob, onAutoSchedule, config }: {
  jobs: ScheduledJob[]
  onCreateJob: (job: Omit<ScheduledJob, 'id' | 'createdAt' | 'status'>) => void
  onAutoSchedule?: (times: number[]) => void
  config: LLMConfig | null
}) {
  const { dict } = useLocale()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [locale, setLocale] = useState<'en' | 'id'>('en')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoLocale, setAutoLocale] = useState<'en' | 'id'>('en')
  const [autoCount, setAutoCount] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) return
    const scheduledAt = new Date(`${date}T${time}`).getTime()
    onCreateJob({ type: 'manual', title, content, excerpt, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), locale, scheduledAt })
    setTitle('')
    setContent('')
    setExcerpt('')
    setTags('')
    setDate('')
    setTime('')
  }

  const handleAutoSchedule = async () => {
    if (!config || !onAutoSchedule) return
    const times = [7, 12, 19, 22].map((h) => {
      const d = new Date()
      d.setHours(h, 0, 0, 0)
      return d.getTime()
    })
    onAutoSchedule(times)
    setAutoEnabled(true)
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

      <div className="schedule-manager__auto" style={{ marginTop: '1.5rem' }}>
        <h4>Auto-Generate Schedule</h4>
        <p className="blog-empty" style={{ marginBottom: '0.75rem' }}>Agent will automatically research, write, generate images/video, and publish at scheduled times without human review.</p>
        <div className="blog-editor__row">
          <div className="field">
            <span className="field-label">Language</span>
            <select className="field-input" value={autoLocale} onChange={(e) => setAutoLocale(e.target.value as 'en' | 'id')}>
              <option value="en">English</option>
              <option value="id">Bahasa Indonesia</option>
            </select>
          </div>
          <div className="field">
            <span className="field-label">Posts per run</span>
            <input className="field-input" type="number" min="1" max="5" value={autoCount} onChange={(e) => setAutoCount(parseInt(e.target.value, 10))} />
          </div>
        </div>
        <button type="button" className="primary-btn" onClick={handleAutoSchedule} disabled={!config}>
          {autoEnabled ? 'Auto-Schedule Active (07:00, 12:00, 19:00, 22:00)' : 'Enable Auto-Schedule'}
        </button>
      </div>

      <div className="schedule-manager__list" style={{ marginTop: '1.5rem' }}>
        <h4>Upcoming Posts</h4>
        {jobs.length === 0 && <p className="blog-empty">No scheduled posts.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="glass-card schedule-manager__item">
            <div className="schedule-manager__item-main">
              <span className={`blog-badge ${job.status === 'pending' ? 'blog-badge--draft' : 'blog-badge--published'}`}>
                {job.status}
              </span>
              <span>{job.title || 'Auto-generate'}</span>
              <time>{new Date(job.scheduledAt).toLocaleString()}</time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
