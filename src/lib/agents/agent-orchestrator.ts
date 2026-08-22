'use client'

import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { runResearcher, type ContentOpportunity } from './researcher'
import { runWriter, type WriterInput, type GeneratedPost } from './writer'
import { runVisualist, type VisualistInput, type GeneratedMedia } from './visualist'
import type { BlogPost } from '@/lib/blog-types'

export type AgentJobStatus = 'idle' | 'researching' | 'writing' | 'imaging' | 'done' | 'error'

export interface AgentJob {
  id: string
  status: AgentJobStatus
  progress: number
  step: string
  opportunities?: ContentOpportunity[]
  selectedOpportunity?: ContentOpportunity | null
  draft?: GeneratedPost | null
  media?: GeneratedMedia | null
  error?: string | null
  startedAt: number
  finishedAt?: number
}

export interface AgentRunOptions {
  config: LLMConfig
  locale?: 'en' | 'id'
  maxOpportunities?: number
  selectedTopic?: ContentOpportunity
  existingPosts?: BlogPost[]
}

export async function runAgentPipeline(options: AgentRunOptions, onProgress: (job: Partial<AgentJob>) => void): Promise<AgentJob> {
  const { config, locale = 'en', maxOpportunities = 5, selectedTopic, existingPosts } = options
  const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const job: AgentJob = {
    id,
    status: 'idle',
    progress: 0,
    step: 'Initializing',
    startedAt: Date.now(),
  }

  onProgress(job)

  try {
    if (!selectedTopic) {
      job.status = 'researching'
      job.step = 'Researching content opportunities...'
      job.progress = 10
      onProgress(job)
      console.debug('[agent-pipeline] stage=researching')

      const opportunities = await runResearcher(config, { locale, maxTopics: maxOpportunities, existingPosts })
      job.opportunities = opportunities
      job.progress = 40
      onProgress(job)
      console.debug('[agent-pipeline] research complete', { count: opportunities.length })

      if (opportunities.length === 0) {
        job.status = 'error'
        job.error = 'No content opportunities found.'
        job.finishedAt = Date.now()
        onProgress(job)
        return job
      }
    }

    const topic = selectedTopic || job.opportunities![0]
    job.selectedOpportunity = topic
    job.status = 'writing'
    job.step = `Writing article: ${topic.title}`
    job.progress = 50
    onProgress(job)
    console.debug('[agent-pipeline] stage=writing', { title: topic.title })

    const writerInput: WriterInput = {
      title: topic.title,
      angle: topic.angle,
      keywords: topic.keywords,
      locale,
    }
    const draft = await runWriter(config, writerInput)
    job.draft = draft
    job.progress = 70
    onProgress(job)
    console.debug('[agent-pipeline] write complete', { draftTitle: draft?.title ?? null })

    if (!draft) {
      job.status = 'error'
      job.error = 'Writer failed to generate content.'
      job.finishedAt = Date.now()
      onProgress(job)
      return job
    }

    job.status = 'imaging'
    job.step = 'Generating images...'
    job.progress = 85
    onProgress(job)
    console.debug('[agent-pipeline] stage=imaging')

    const media = await runVisualist({ post: draft, locale })
    job.media = media
    job.progress = 100
    job.status = 'done'
    job.step = 'Complete'
    job.finishedAt = Date.now()
    onProgress(job)
    console.debug('[agent-pipeline] stage=done')
    return job
  } catch (err) {
    job.status = 'error'
    job.error = err instanceof Error ? err.message : 'Unknown error'
    job.finishedAt = Date.now()
    onProgress(job)
    console.error('[agent-pipeline] stage=error', { error: job.error })
    return job
  }
}
