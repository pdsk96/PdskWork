'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createPost } from '@/lib/blog-firestore'
import { runAgentPipeline, type AgentJob, type AgentRunOptions } from './agent-orchestrator'
import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import type { BlogPost } from '@/lib/blog-types'

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

export function useScheduler(intervalMs = 300000, existingPosts: BlogPost[] = []) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<number | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'scheduledJobs'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => {
      const items: ScheduledJob[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setJobs(items)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db || jobs.length === 0 || runningRef.current) return
    const now = Date.now()
    const due = jobs.filter((j) => j.scheduledAt <= now)
    if (due.length === 0) return

    runningRef.current = true
    setRunning(true)
    setLastRun(now)
    ;(async () => {
      for (const job of due) {
        try {
          if (job.type === 'auto-generate' && job.agentConfig) {
            await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'generating' })
            const options: AgentRunOptions = {
              config: job.agentConfig,
              locale: (job.locale as 'en' | 'id') || 'en',
              maxOpportunities: job.maxOpportunities || 1,
              existingPosts,
            }
            const result = await runAgentPipeline(options, () => {})
            if (result.draft) {
              await createPost({
                title: result.draft.title,
                slug: result.draft.slug,
                excerpt: result.draft.excerpt,
                content: result.draft.content,
                tags: result.draft.tags,
                published: true,
                locale: result.draft.locale,
              })
              await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'published', publishedAt: serverTimestamp() })
            } else {
              await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'failed' })
            }
          } else if (job.type === 'manual' && job.title && job.content) {
            await createPost({
              title: job.title,
              slug: job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
              excerpt: job.excerpt || '',
              content: job.content,
              tags: job.tags || [],
              published: true,
              locale: (job.locale as 'en' | 'id') || 'en',
            })
            await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'published', publishedAt: serverTimestamp() })
          }
        } catch {
          await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'failed' })
        }
      }
      runningRef.current = false
      setRunning(false)
    })()
  }, [jobs, existingPosts])

  useEffect(() => {
    if (intervalMs <= 0) return
    const id = setInterval(() => {
      setLastRun(Date.now())
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { jobs, running, lastRun }
}

export async function createAutoGenerateJob(scheduledAt: number, config: LLMConfig, locale: 'en' | 'id', maxOpportunities = 1): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')
    const docRef = await addDoc(collection(db, 'scheduledJobs'), {
      type: 'auto-generate',
      scheduledAt,
      status: 'pending',
      createdAt: Date.now(),
      agentConfig: config,
      locale,
      maxOpportunities,
    })
    return docRef.id
  }
