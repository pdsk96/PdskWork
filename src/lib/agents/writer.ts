'use client'

import { callLLM, type LLMConfig } from '@/lib/ai/llm-client'
import { slugify } from '@/lib/blog-types'

export interface WriterInput {
  title: string
  angle: string
  keywords: string[]
  locale?: 'en' | 'id'
  tone?: string
}

export interface GeneratedPost {
  title: string
  excerpt: string
  content: string
  tags: string[]
  locale: 'en' | 'id'
  slug: string
  suggestedImagePrompt?: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a professional tech blog writer for a cyberpunk-themed portfolio.
Write in a clear, engaging style with markdown formatting.
Include inline images using markdown: ![alt text](https://image.pollinations.ai/prompt/{visual description}?width=1200&height=600)
Do NOT include a coverImage field; use inline images only.
Return ONLY valid JSON object with keys: title, excerpt, content, tags, slug, suggestedImagePrompt.
Do not include markdown or extra text outside the JSON.`,
  id: `Anda adalah penulis blog teknologi profesional untuk portofolio bertema cyberpunk.
Tulis dengan gaya yang jelas dan menarik dengan format markdown.
Sertakan gambar inline menggunakan markdown: ![alt text](https://image.pollinations.ai/prompt/{deskripsi visual}?width=1200&height=600)
Jangan sertakan field coverImage; gunakan gambar inline saja.
Kembalikan HANYA object JSON valid dengan keys: title, excerpt, content, tags, slug, suggestedImagePrompt.
Jangan sertakan markdown atau teks tambahan di luar JSON.`,
}

export async function runWriter(config: LLMConfig, input: WriterInput): Promise<GeneratedPost | null> {
  const locale = input.locale || 'en'
  const tone = input.tone || (locale === 'id' ? 'informal tapi profesional' : 'professional yet conversational')

  const messages = [
    { role: 'system', content: SYSTEM_PROMPTS[locale] || SYSTEM_PROMPTS.en },
    {
      role: 'user',
      content: `Write a blog post with:\nTitle: ${input.title}\nAngle: ${input.angle}\nKeywords: ${input.keywords.join(', ')}\nTone: ${tone}\nLocale: ${locale}\n\nReturn JSON only.`,
    },
  ]

  const raw = await callLLM(config, messages)
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned) as GeneratedPost
    return {
      title: parsed.title || input.title,
      excerpt: parsed.excerpt || '',
      content: parsed.content || '',
      tags: Array.isArray(parsed.tags) ? parsed.tags : input.keywords,
      locale,
      slug: parsed.slug || slugify(parsed.title || input.title),
      suggestedImagePrompt: parsed.suggestedImagePrompt || input.title,
    }
  } catch {
    return null
  }
}
