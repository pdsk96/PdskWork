'use client'

import { generateImage, buildImageUrl } from '@/lib/ai/image-client'
import type { BlogPost } from '@/lib/blog-types'

export interface VisualistInput {
  post: {
    title: string
    excerpt: string
    tags: string[]
    content?: string
  }
  locale?: 'en' | 'id'
}

export interface GeneratedMedia {
  thumbnailUrl: string
  inlineImages: string[]
  altTexts: string[]
  videoUrl?: string
}

function buildVideoUrl(prompt: string, seed: string): string {
  const encoded = encodeURIComponent(prompt)
  return `https://video.pollinations.ai/prompt/${encoded}?seed=${encodeURIComponent(seed)}&nologo=true`
}

export async function runVisualist(input: VisualistInput): Promise<GeneratedMedia> {
  const title = input.post.title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const locale = input.locale || 'en'

  const thumbnailPrompt = `${title} — cyberpunk neon tech aesthetic, dark background, glowing accents, high quality`
  const thumbnailUrl = buildImageUrl({
    prompt: thumbnailPrompt,
    width: 800,
    height: 400,
    seed: `${slug}-cover`,
  })

  const inlineCount = Math.min(3, Math.max(1, Math.floor((input.post.content?.length || 0) / 800)))
  const inlineImages: string[] = []
  const altTexts: string[] = []

  for (let i = 0; i < inlineCount; i++) {
    const seed = `${slug}-img-${i + 1}`
    const prompt = `${title} — illustration ${i + 1}, cyberpunk style, neon glow, futuristic`
    inlineImages.push(buildImageUrl({ prompt, width: 1200, height: 600, seed }))
    altTexts.push(`${title} — illustration ${i + 1}`)
  }

  await generateImage({ prompt: thumbnailPrompt, width: 800, height: 400, seed: `${slug}-cover` })

  const videoUrl = buildVideoUrl(thumbnailPrompt, `${slug}-video`)

  return { thumbnailUrl, inlineImages, altTexts, videoUrl }
}

export function getThumbnailForPost(post: BlogPost): string {
  const slug = post.slug
  return buildImageUrl({
    prompt: `${post.title} — cyberpunk neon tech aesthetic`,
    width: 800,
    height: 400,
    seed: `${slug}-cover`,
  })
}

export function getVideoUrlForPost(post: BlogPost): string {
  const slug = post.slug
  return buildVideoUrl(`${post.title} — cyberpunk neon tech aesthetic`, `${slug}-video`)
}
