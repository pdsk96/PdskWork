'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'
import AgentChat from '@/components/AgentStudio/AgentChat'
import AgentConfig from '@/components/AgentStudio/AgentConfig'
import ContentReview from '@/components/AgentStudio/ContentReview'
import ScheduleManager from '@/components/AgentStudio/ScheduleManager'
import ReportsView from '@/components/AgentStudio/ReportsView'
import { runAgentPipeline, type AgentJob, type AgentRunOptions } from '@/lib/agents/agent-orchestrator'
import { runTrendResearcher, type TrendTopic } from '@/lib/agents/trend-researcher'
import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { createPost, getPublishedPosts } from '@/lib/blog-firestore'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ChatMessage } from '@/components/AgentStudio/AgentChat'
import type { BlogPost } from '@/lib/blog-types'
import { useScheduler, createAutoGenerateJob, type ScheduledJob } from '@/lib/agents/scheduler'
import { useReports, generateReport } from '@/lib/agents/report-generator'

type Tab = 'agents' | 'schedule' | 'reports'

export default function AdminAgentsPage() {
  const { dict, locale } = useLocale()
  const [tab, setTab] = useState<Tab>('agents')
  const [config, setConfig] = useState<LLMConfig | null>(null)
  const [job, setJob] = useState<AgentJob | null>(null)
  const [trends, setTrends] = useState<TrendTopic[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([])
  const [existingPosts, setExistingPosts] = useState<BlogPost[]>([])
  const configLoaded = useRef(false)
  const postsLoaded = useRef(false)

  const { jobs: schedulerJobs, running: schedulerRunning, lastRun } = useScheduler(300000, existingPosts)
  const { reports, loading: reportsLoading, refetch: refetchReports } = useReports()

  useEffect(() => {
    if (postsLoaded.current) return
    postsLoaded.current = true
    getPublishedPosts(locale as 'en' | 'id')
      .then(setExistingPosts)
      .catch(() => setExistingPosts([]))
  }, [locale])

  useEffect(() => {
    if (configLoaded.current) return
    configLoaded.current = true
    try {
      const saved = localStorage.getItem('agent-llm-config')
      if (saved) setConfig(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    setScheduledJobs(schedulerJobs)
  }, [schedulerJobs])

  const updateConfig = (next: LLMConfig) => {
    setConfig(next)
    try { localStorage.setItem('agent-llm-config', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const handleSend = async (text: string) => {
    if (!config) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const lower = text.toLowerCase()
      if (lower.includes('trend') || lower.includes('tren') || lower.includes('whats hot')) {
        const result = await runTrendResearcher(config, { locale: locale as 'en' | 'id', maxTopics: 8, existingPosts })
        setTrends(result)
        const reply = result.length
          ? `Found ${result.length} trending topics:\n${result.map((t, i) => `${i + 1}. ${t.title} (${t.engagement})`).join('\n')}`
          : 'No trending topics found.'
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: Date.now() }])
      } else if (lower.includes('research') || lower.includes('riset') || lower.includes('topic')) {
        const options: AgentRunOptions = { config, locale: locale as 'en' | 'id', maxOpportunities: 5, existingPosts }
        const pipeline = runAgentPipeline(options, (partial) => setJob((prev) => ({ ...prev, ...partial } as AgentJob)))
        const result = await pipeline
        const reply = result.opportunities?.length
          ? `Found ${result.opportunities.length} opportunities:\n${result.opportunities.map((o, i) => `${i + 1}. ${o.title} (${o.confidence})`).join('\n')}`
          : 'No opportunities found. Try adjusting your request.'
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: Date.now() }])
      } else if (lower.includes('write') || lower.includes('generate') || lower.includes('artikel')) {
        const options: AgentRunOptions = { config, locale: locale as 'en' | 'id', maxOpportunities: 5, existingPosts }
        const pipeline = runAgentPipeline(options, (partial) => setJob((prev) => ({ ...prev, ...partial } as AgentJob)))
        const result = await pipeline
        const draftTitle = result.draft?.title
        if (draftTitle) {
          setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Draft ready: "${draftTitle}". Review it in the panel below.`, timestamp: Date.now() }])
        } else {
          setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: 'Failed to generate draft. Check API key and try again.', timestamp: Date.now() }])
        }
      } else {
        const reply = await callLLM(config, [
          { role: 'system', content: 'You are a helpful assistant for a cyberpunk blog admin. Keep answers concise.' },
          { role: 'user', content: text },
        ])
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply || 'No response.', timestamp: Date.now() }])
      }
    } catch (err) {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Unknown'}`, timestamp: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!job?.draft) return
    try {
      await createPost({
        title: job.draft.title,
        slug: job.draft.slug,
        excerpt: job.draft.excerpt,
        content: job.draft.content,
        tags: job.draft.tags,
        published: true,
        locale: job.draft.locale,
      })
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Published: "${job.draft?.title}"`, timestamp: Date.now() }])
      setJob({ ...job, status: 'done', step: 'Published' })
    } catch (err) {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Publish failed: ${err instanceof Error ? err.message : 'Unknown'}`, timestamp: Date.now() }])
    }
  }

  const handleReject = () => {
    setJob(null)
  }

  const handleCreateScheduledJob = async (jobData: Omit<ScheduledJob, 'id' | 'createdAt' | 'status'>) => {
    if (!db) return
    const docRef = await addDoc(collection(db, 'scheduledJobs'), {
      ...jobData,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    setScheduledJobs((prev) => [...prev, { ...jobData, id: docRef.id, status: 'pending', createdAt: Date.now() }])
  }

  const handleAutoSchedule = async (times: number[]) => {
    if (!config) return
    for (const t of times) {
      await createAutoGenerateJob(t, config, locale as 'en' | 'id', 1)
    }
    setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Auto-schedule enabled: ${times.length} jobs created (07:00, 12:00, 19:00, 22:00).`, timestamp: Date.now() }])
  }

  const handleGenerateReport = async () => {
    if (!db) return
    try {
      await generateReport(db, locale as 'en' | 'id')
      await refetchReports()
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: 'Report generated.', timestamp: Date.now() }])
    } catch (err) {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Report failed: ${err instanceof Error ? err.message : 'Unknown'}`, timestamp: Date.now() }])
    }
  }

  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <div className="blog-admin__head">
            <div>
              <h1 className="auth-title">AI Agent Studio</h1>
              <p className="admin-welcome">Research, write, and auto-post with AI agents.</p>
              {schedulerRunning && <p className="admin-welcome">Scheduler: running...</p>}
              {lastRun && !schedulerRunning && (
                <p className="admin-welcome">Scheduler: last checked {new Date(lastRun).toLocaleTimeString()}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link href="/admin/agents/config" className="ghost-btn">⚙️ Agent Config</Link>
              <AgentConfig config={config} onChange={updateConfig} />
            </div>
          </div>

          <AdminNav />

          <div className="admin-tabs">
            <button className={`admin-tabs__btn ${tab === 'agents' ? 'is-active' : ''}`} onClick={() => setTab('agents')}>Agents</button>
            <button className={`admin-tabs__btn ${tab === 'schedule' ? 'is-active' : ''}`} onClick={() => setTab('schedule')}>Schedule</button>
            <button className={`admin-tabs__btn ${tab === 'reports' ? 'is-active' : ''}`} onClick={() => setTab('reports')}>Reports</button>
            <Link href="/admin/media" className="admin-tabs__btn">Media</Link>
          </div>

          {tab === 'agents' && (
            <div className="admin-agents">
              <AgentChat messages={messages} onSend={handleSend} loading={loading} />
              <ContentReview
                opportunities={job?.opportunities}
                selectedOpportunity={job?.selectedOpportunity}
                onSelectOpportunity={(o) => setJob((prev) => prev ? { ...prev, selectedOpportunity: o } : null)}
                draft={job?.draft || null}
                media={job?.media || null}
                onApprove={handleApprove}
                onReject={handleReject}
              />
              {trends.length > 0 && (
                <div className="content-review">
                  <h3 className="auth-title">Trending Topics</h3>
                  <div className="content-review__list">
                    {trends.map((t, i) => (
                      <div key={i} className="glass-card content-review__item">
                        <h4>{t.title}</h4>
                        <p className="content-review__angle">{t.category}</p>
                        <div className="content-review__meta">
                          <span className={`blog-badge ${t.engagement === 'high' ? 'blog-badge--published' : 'blog-badge--draft'}`}>
                            {t.engagement}
                          </span>
                          <span className="content-review__keywords">{t.sources.join(', ')}</span>
                        </div>
                        <p className="content-review__reason">{t.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'schedule' && (
            <ScheduleManager jobs={scheduledJobs} onCreateJob={handleCreateScheduledJob} onAutoSchedule={handleAutoSchedule} config={config} />
          )}

          {tab === 'reports' && (
            <div>
              <button type="button" className="primary-btn" onClick={handleGenerateReport} style={{ marginBottom: '1rem' }}>
                Generate Report
              </button>
              <ReportsView reports={reports} />
            </div>
          )}
        </section>
      </main>
    </AdminGate>
  )
}
