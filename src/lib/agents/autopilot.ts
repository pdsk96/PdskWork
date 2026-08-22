'use client'

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { runResearcher, type ContentOpportunity } from './researcher'
import { runWriter, type GeneratedPost } from './writer'
import { runVisualist, type GeneratedMedia } from './visualist'
import { runTrendResearcher, type TrendTopic } from './trend-researcher'
import { createPost, getPublishedPosts, type BlogPost } from '@/lib/blog-firestore'
import { loadAgentSettings } from './agent-settings'
import { useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AutoPilotStatus = 'idle' | 'scanning' | 'planning' | 'writing' | 'imaging' | 'publishing' | 'distributing' | 'error'

export interface AutoPilotConfig {
  enabled: boolean
  intervalMinutes: number
  maxPostsPerDay: number
  maxPostsPerRun: number
  autoApprove: boolean
  locales: ('en' | 'id')[]
  distributionChannels: {
    rss: boolean
    twitter: boolean
    linkedin: boolean
    whatsapp: boolean
  }
}

export interface AgentRun {
  id: string
  type: 'trend-scan' | 'content-plan' | 'content-create' | 'publish' | 'distribute' | 'full-cycle'
  status: 'running' | 'success' | 'error' | 'skipped'
  startedAt: number
  finishedAt?: number
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
}

export interface ContentPlan {
  id: string
  title: string
  angle: string
  keywords: string[]
  locale: 'en' | 'id'
  status: 'planned' | 'writing' | 'reviewing' | 'approved' | 'published' | 'failed' | 'skipped'
  trendSource?: string
  scheduledFor?: number
  createdAt: number
  updatedAt: number
  postId?: string
}

const DEFAULT_CONFIG: AutoPilotConfig = {
  enabled: false,
  intervalMinutes: 360, // every 6 hours
  maxPostsPerDay: 3,
  maxPostsPerRun: 1,
  autoApprove: false,
  locales: ['en', 'id'],
  distributionChannels: {
    rss: true,
    twitter: false,
    linkedin: false,
    whatsapp: false,
  },
}

const CONFIG_DOC_ID = 'default'
const RUNS_COLLECTION = 'agentRuns'
const PLANS_COLLECTION = 'contentPlans'

// ─── Config helpers ──────────────────────────────────────────────────────────

export async function getAutoPilotConfig(): Promise<AutoPilotConfig> {
  if (!db) return DEFAULT_CONFIG
  const snap = await getDoc(doc(db, 'autoPilotConfig', CONFIG_DOC_ID))
  if (!snap.exists()) return DEFAULT_CONFIG
  const data = snap.data() as Partial<AutoPilotConfig>
  return { ...DEFAULT_CONFIG, ...data }
}

export async function saveAutoPilotConfig(config: AutoPilotConfig): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await setDoc(doc(db, 'autoPilotConfig', CONFIG_DOC_ID), {
    ...config,
    updatedAt: Date.now(),
  })
}

// ─── Run logging ─────────────────────────────────────────────────────────────

export async function logRun(run: AgentRun): Promise<void> {
  if (!db) return
  await setDoc(doc(db, RUNS_COLLECTION, run.id), run)
}

export function subscribeRuns(onUpdate: (runs: AgentRun[]) => void) {
  if (!db) return () => {}
  const q = query(collection(db, RUNS_COLLECTION), orderBy('startedAt', 'desc'), limit(50))
  const unsub = onSnapshot(q, (snap) => {
    const runs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AgentRun, 'id'>) }))
    onUpdate(runs)
  })
  return unsub
}

// ─── Content plan helpers ─────────────────────────────────────────────────────

export async function createContentPlan(plan: Omit<ContentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentPlan> {
  if (!db) throw new Error('Firestore not initialized')
  const id = `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()
  const fullPlan: ContentPlan = { ...plan, id, createdAt: now, updatedAt: now }
  await setDoc(doc(db, PLANS_COLLECTION, id), fullPlan)
  return fullPlan
}

export async function updateContentPlan(id: string, patch: Partial<ContentPlan>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, PLANS_COLLECTION, id), { ...patch, updatedAt: Date.now() }, { merge: true })
}

export function subscribePlans(onUpdate: (plans: ContentPlan[]) => void) {
  if (!db) return () => {}
  const q = query(collection(db, PLANS_COLLECTION), orderBy('createdAt', 'desc'), limit(50))
  const unsub = onSnapshot(q, (snap) => {
    const plans = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContentPlan, 'id'>) }))
    onUpdate(plans)
  })
  return unsub
}

// ─── Core pipeline steps ──────────────────────────────────────────────────────

type TrendItem = TrendTopic & { locale: 'en' | 'id' }

function trendToOpportunity(t: TrendTopic): ContentOpportunity {
  return {
    title: t.title,
    angle: `Trending in ${t.category}`,
    keywords: [t.category, ...t.sources].filter(Boolean),
    confidence: t.engagement,
    reason: t.reason,
  }
}

async function scanTrends(config: AutoPilotConfig, llm: LLMConfig): Promise<Array<{ opportunity: ContentOpportunity; locale: 'en' | 'id' }>> {
  const results: Array<{ opportunity: ContentOpportunity; locale: 'en' | 'id' }> = []
  for (const locale of config.locales) {
    const existing = await getPublishedPosts(locale).catch(() => [])
    const trends = await runTrendResearcher(llm, { locale, maxTopics: 5, existingPosts: existing })
    for (const t of trends) {
      results.push({ opportunity: trendToOpportunity(t), locale })
    }
  }
  return results
}

async function createContentFromOpportunity(
  opportunity: ContentOpportunity,
  locale: 'en' | 'id',
  llm: LLMConfig,
): Promise<{ draft: GeneratedPost; media: GeneratedMedia } | null> {
  try {
    const draft = await runWriter(llm, {
      title: opportunity.title,
      angle: opportunity.angle,
      keywords: opportunity.keywords,
      locale,
    })
    if (!draft) return null
    const media = await runVisualist({ post: draft, locale })
    return { draft, media }
  } catch {
    return null
  }
}

// ─── Main AutoPilot cycle ─────────────────────────────────────────────────────

export type AutoPilotEventType =
  | 'cycle-start'
  | 'trend-scan-start'
  | 'trend-scan-done'
  | 'plan-created'
  | 'writing-start'
  | 'writing-done'
  | 'imaging-done'
  | 'publish-start'
  | 'publish-done'
  | 'distribute-start'
  | 'distribute-done'
  | 'cycle-done'
  | 'cycle-error'

export interface AutoPilotEvent {
  type: AutoPilotEventType
  timestamp: number
  message: string
  data?: Record<string, unknown>
}

export async function runAutoPilotCycle(onEvent?: (e: AutoPilotEvent) => void): Promise<void> {
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const run: AgentRun = {
    id: runId,
    type: 'full-cycle',
    status: 'running',
    startedAt: Date.now(),
    input: {},
  }
  await logRun(run)

  try {
    const config = await getAutoPilotConfig()
    if (!config.enabled) {
      run.status = 'skipped'
      run.finishedAt = Date.now()
      run.output = { reason: 'AutoPilot disabled' }
      await logRun(run)
      return
    }

    const llm = await loadAgentSettings()

    // Step 1: Trend scan
    onEvent?.({ type: 'cycle-start', timestamp: Date.now(), message: 'AutoPilot cycle started' })
    onEvent?.({ type: 'trend-scan-start', timestamp: Date.now(), message: 'Scanning trends...' })
    const trends = await scanTrends(config, llm)
    onEvent?.({ type: 'trend-scan-done', timestamp: Date.now(), message: `Found ${trends.length} trends`, data: { count: trends.length } })
    run.input = { ...run.input, trendsFound: trends.length }

    if (trends.length === 0) {
      run.status = 'success'
      run.finishedAt = Date.now()
      run.output = { message: 'No new trends found' }
      await logRun(run)
      onEvent?.({ type: 'cycle-done', timestamp: Date.now(), message: 'Cycle complete: no new trends' })
      return
    }

    // Step 2: Plan content (pick top trend per locale, up to maxPostsPerRun)
    const selected = trends.slice(0, config.maxPostsPerRun)
    const plans: ContentPlan[] = []

    for (const item of selected) {
      const plan = await createContentPlan({
        title: item.opportunity.title,
        angle: item.opportunity.angle,
        keywords: item.opportunity.keywords,
        locale: item.locale,
        status: 'planned',
        trendSource: item.opportunity.reason,
        scheduledFor: Date.now() + 3600000, // 1 hour from now
      })
      plans.push(plan)
      onEvent?.({ type: 'plan-created', timestamp: Date.now(), message: `Planned: ${item.opportunity.title}`, data: { planId: plan.id } })
    }
    run.input = { ...run.input, plansCreated: plans.length }

    // Step 3: Write + image for each plan
    for (const plan of plans) {
      await updateContentPlan(plan.id, { status: 'writing' })
      onEvent?.({ type: 'writing-start', timestamp: Date.now(), message: `Writing: ${plan.title}`, data: { planId: plan.id } })

      const result = await createContentFromOpportunity(
        {
          title: plan.title,
          angle: plan.angle,
          keywords: plan.keywords,
          confidence: 'high',
          reason: `AutoPilot trend: ${plan.trendSource}`,
        },
        plan.locale,
        llm,
      )

      if (!result) {
        await updateContentPlan(plan.id, { status: 'failed' })
        continue
      }

      onEvent?.({ type: 'writing-done', timestamp: Date.now(), message: `Draft ready: ${result.draft.title}`, data: { planId: plan.id } })
      onEvent?.({ type: 'imaging-done', timestamp: Date.now(), message: 'Media generated', data: { planId: plan.id } })

      await updateContentPlan(plan.id, {
        status: config.autoApprove ? 'approved' : 'reviewing',
        postId: result.draft.slug,
      })

      // Step 4: Publish (if auto-approve) or wait for manual approval
      if (config.autoApprove) {
        onEvent?.({ type: 'publish-start', timestamp: Date.now(), message: `Publishing: ${result.draft.title}`, data: { planId: plan.id } })
        try {
          await createPost({
            title: result.draft.title,
            slug: result.draft.slug,
            excerpt: result.draft.excerpt,
            content: result.draft.content,
            tags: result.draft.tags,
            published: true,
            locale: result.draft.locale,
          })
          await updateContentPlan(plan.id, { status: 'published' })
          onEvent?.({ type: 'publish-done', timestamp: Date.now(), message: `Published: ${result.draft.title}`, data: { planId: plan.id, slug: result.draft.slug } })
        } catch (err) {
          await updateContentPlan(plan.id, { status: 'failed' })
          onEvent?.({ type: 'cycle-error', timestamp: Date.now(), message: `Publish failed: ${err instanceof Error ? err.message : 'Unknown'}`, data: { planId: plan.id } })
        }
      }
    }

    // Step 5: Distribute (RSS is auto-regenerated by prebuild; social is placeholder)
    if (config.distributionChannels.rss) {
      onEvent?.({ type: 'distribute-start', timestamp: Date.now(), message: 'Distributing to RSS...' })
      // RSS is handled by prebuild script; we just log it here.
      // In the future, trigger gen-feed.mjs via a webhook or re-run prebuild.
      onEvent?.({ type: 'distribute-done', timestamp: Date.now(), message: 'RSS update queued (prebuild)' })
    }

    run.status = 'success'
    run.finishedAt = Date.now()
    run.output = { plansCreated: plans.length, trendsFound: trends.length }
    await logRun(run)
    onEvent?.({ type: 'cycle-done', timestamp: Date.now(), message: 'AutoPilot cycle complete' })
  } catch (err) {
    run.status = 'error'
    run.finishedAt = Date.now()
    run.error = err instanceof Error ? err.message : 'Unknown error'
    await logRun(run)
    onEvent?.({ type: 'cycle-error', timestamp: Date.now(), message: `Cycle error: ${run.error}` })
    throw err
  }
}

// ─── Hook for React ───────────────────────────────────────────────────────────

export interface UseAutoPilotResult {
  config: AutoPilotConfig | null
  runs: AgentRun[]
  plans: ContentPlan[]
  status: AutoPilotStatus
  error: string | null
  startCycle: () => Promise<void>
  toggleEnabled: (enabled: boolean) => Promise<void>
  updateConfig: (patch: Partial<AutoPilotConfig>) => Promise<void>
  approvePlan: (planId: string) => Promise<void>
  skipPlan: (planId: string) => Promise<void>
}

export function useAutoPilot(): UseAutoPilotResult {
  const [config, setConfig] = useState<AutoPilotConfig | null>(null)
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [plans, setPlans] = useState<ContentPlan[]>([])
  const [status, setStatus] = useState<AutoPilotStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  // Subscribe to Firestore
  useEffect(() => {
    const unsubRuns = subscribeRuns(setRuns)
    const unsubPlans = subscribePlans(setPlans)
    return () => {
      unsubRuns()
      unsubPlans()
    }
  }, [])

  // Load config
  useEffect(() => {
    getAutoPilotConfig().then(setConfig).catch((err) => setError(err.message))
  }, [])

  // Schedule auto-run
  useEffect(() => {
    if (!config?.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const ms = config.intervalMinutes * 60 * 1000
    intervalRef.current = window.setInterval(() => {
      setStatus('scanning')
      runAutoPilotCycle().finally(() => setStatus('idle'))
    }, ms)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [config?.enabled, config?.intervalMinutes])

  const startCycle = async () => {
    setStatus('scanning')
    setError(null)
    try {
      await runAutoPilotCycle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cycle failed')
    } finally {
      setStatus('idle')
    }
  }

  const toggleEnabled = async (enabled: boolean) => {
    const next = await getAutoPilotConfig()
    await saveAutoPilotConfig({ ...next, enabled })
    setConfig({ ...next, enabled })
  }

  const updateConfig = async (patch: Partial<AutoPilotConfig>) => {
    const next = await getAutoPilotConfig()
    const updated = { ...next, ...patch }
    await saveAutoPilotConfig(updated)
    setConfig(updated)
  }

  const approvePlan = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan?.postId) return
    await updateContentPlan(planId, { status: 'approved' })
    // Publish
    setStatus('publishing')
    try {
      await createPost({
        title: plan.title,
        slug: plan.postId,
        excerpt: plan.angle,
        content: '', // will be filled by the writer in a future iteration
        tags: plan.keywords,
        published: true,
        locale: plan.locale,
      })
      await updateContentPlan(planId, { status: 'published' })
    } catch (err) {
      await updateContentPlan(planId, { status: 'failed' })
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setStatus('idle')
    }
  }

  const skipPlan = async (planId: string) => {
    await updateContentPlan(planId, { status: 'skipped' })
  }

  return {
    config,
    runs,
    plans,
    status,
    error,
    startCycle,
    toggleEnabled,
    updateConfig,
    approvePlan,
    skipPlan,
  }
}
