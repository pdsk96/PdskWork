'use client'

import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import type { BlogPost } from '@/lib/blog-types'

export interface TrendInput {
  locale?: 'en' | 'id'
  maxTopics?: number
  existingPosts?: BlogPost[]
}

export interface TrendTopic {
  title: string
  category: string
  engagement: 'high' | 'medium' | 'low'
  sources: string[]
  reason: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a trend analysis assistant for a cyberpunk tech blog.
Analyze current tech/AI trends and suggest high-engagement topics.
Return ONLY valid JSON array with objects: { title, category, engagement, sources[], reason }.
Do not include markdown or extra text.`,
  id: `Anda adalah asisten analisis tren untuk blog teknologi cyberpunk.
Analisis tren teknologi/AI terkini dan sarankan topik dengan engagement tinggi.
Kembalikan HANYA array JSON valid dengan object: { title, category, engagement, sources[], reason }.
Jangan sertakan markdown atau teks tambahan.`,
}

export async function runTrendResearcher(config: LLMConfig, input: TrendInput = {}): Promise<TrendTopic[]> {
  const locale = input.locale || 'en'
  const posts = input.existingPosts || []
  const existingTitles = posts.slice(0, 20).map((p) => `- ${p.title}`).join('\n')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en },
    {
      role: 'user',
      content: `Current tech/AI trends (late 2026): AI agents, open-source LLMs, WebAssembly, edge computing, cyberpunk UI, Next.js 16, React 19, Motion/R3F, Firebase App Hosting, static export, client-side AI.
Existing posts (avoid duplicates):\n${existingTitles || '(none yet)'}\n\nSuggest 5-8 trending topics with high engagement potential. Return JSON array only.`,
    },
  ]

  const raw = await callLLM(config, messages)
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, input.maxTopics || 8)
  } catch {
    return []
  }
}
