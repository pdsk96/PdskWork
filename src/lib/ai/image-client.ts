'use client'

export interface ImageGenConfig {
  prompt: string
  width?: number
  height?: number
  seed?: string
  model?: string
}

export function buildImageUrl(config: ImageGenConfig): string {
  const { prompt, width = 800, height = 400, seed, model = 'flux' } = config
  const encoded = encodeURIComponent(prompt)
  const seedPart = seed ? `&seed=${encodeURIComponent(seed)}` : ''
  const modelPart = model ? `&model=${encodeURIComponent(model)}` : ''
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}${seedPart}${modelPart}&nologo=true`
}

export async function generateImage(config: ImageGenConfig): Promise<{ url: string; prompt: string }> {
  const url = buildImageUrl(config)
  return { url, prompt: config.prompt }
}
