'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import AgentChat from '@/components/AgentStudio/AgentChat'
import AgentConfig from '@/components/AgentStudio/AgentConfig'
import ContentReview from '@/components/AgentStudio/ContentReview'
import ScheduleManager from '@/components/AgentStudio/ScheduleManager'
import ReportsView from '@/components/AgentStudio/ReportsView'
import { runAgentPipeline, type AgentJob, type AgentRunOptions } from '@/lib/agents/agent-orchestrator'
import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { createPost, getPublishedPosts } from '@/lib/blog-firestore'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ChatMessage } from '@/components/AgentStudio/AgentChat'
import type { BlogPost } from '@/lib/blog-types'

type Tab = 'agents' | 'schedule' | 'reports'

export default function AdminAgentsPage() {
  const { dict, locale } = useLocale()
  const [tab, setTab] = useState<Tab>('agents')
  const [config, setConfig] = useState<LLMConfig | null>(null)
  const [job, setJob] = useState<AgentJob | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [existingPosts, setExistingPosts] = useState<BlogPost[]>([])
  const configLoaded = useRef(false)
  const postsLoaded = useRef(false)

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
      if (lower.includes('research') || lower.includes('riset') || lower.includes('topic')) {
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

  const handleCreateScheduledJob = async (jobData: any) => {
    if (!db) return
    const docRef = await addDoc(collection(db, 'scheduledJobs'), {
      ...jobData,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    setScheduledJobs((prev) => [...prev, { ...jobData, id: docRef.id, status: 'pending', createdAt: Date.now() }])
  }

  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <div className="blog-admin__head">
            <div>
              <h1 className="auth-title">AI Agent Studio</h1>
              <p className="admin-welcome">Research, write, and auto-post with AI agents.</p>
            </div>
            <AgentConfig config={config} onChange={updateConfig} />
          </div>

          <div className="admin-tabs">
            <button className={`admin-tabs__btn ${tab === 'agents' ? 'is-active' : ''}`} onClick={() => setTab('agents')}>Agents</button>
            <button className={`admin-tabs__btn ${tab === 'schedule' ? 'is-active' : ''}`} onClick={() => setTab('schedule')}>Schedule</button>
            <button className={`admin-tabs__btn ${tab === 'reports' ? 'is-active' : ''}`} onClick={() => setTab('reports')}>Reports</button>
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
            </div>
          )}

          {tab === 'schedule' && (
            <ScheduleManager jobs={scheduledJobs} onCreateJob={handleCreateScheduledJob} />
          )}

          {tab === 'reports' && <ReportsView reports={reports} />}
        </section>
      </main>
    </AdminGate>
  )
}
