'use client'

import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import type { BlogPost } from '@/lib/blog-types'

export interface ResearchInput {
  locale?: 'en' | 'id'
  maxTopics?: number
  existingPosts?: BlogPost[]
}

export interface ContentOpportunity {
  title: string
  angle: string
  keywords: string[]
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a content research assistant for a cyberpunk tech blog.
Analyze the existing blog posts and suggest 3-5 new content opportunities.
Return ONLY valid JSON array with objects: { title, angle, keywords[], confidence, reason }.
Do not include markdown or extra text.`,
  id: `Anda adalah asisten riset konten untuk blog teknologi cyberpunk.
Analisis postingan blog yang ada dan sarankan 3-5 peluang konten baru.
Kembalikan HANYA array JSON valid dengan object: { title, angle, keywords[], confidence, reason }.
Jangan sertakan markdown atau teks tambahan.`,
}

export async function runResearcher(config: LLMConfig, input: ResearchInput = {}): Promise<ContentOpportunity[]> {
  const locale = input.locale || 'en'
  const posts = input.existingPosts || []
  const sample = posts.slice(0, 20).map((p) => `- ${p.title} | tags: ${p.tags.join(', ')}`).join('\n')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en },
    {
      role: 'user',
      content: `Existing posts:\n${sample || '(no posts yet)'}\n\nSuggest content opportunities for the ${locale} audience. Return JSON array only.`,
    },
  ]

  const raw = await callLLM(config, messages)
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, input.maxTopics || 5)
  } catch {
    return []
  }
}
