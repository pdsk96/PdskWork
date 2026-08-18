'use client'

export type LLMProvider = 'groq' | 'huggingface'

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const HF_API = 'https://api-inference.huggingface.co/models'

export async function callLLM(config: LLMConfig, messages: { role: string; content: string }[]): Promise<string> {
  const { provider, apiKey, model, temperature = 0.7, maxTokens = 2048 } = config

  if (!apiKey) {
    throw new Error('API key missing. Configure it in Agent Settings.')
  }

  if (provider === 'groq') {
    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq error: ${res.status} ${err}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  if (provider === 'huggingface') {
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n')
    const modelId = model || 'mistralai/Mistral-7B-Instruct-v0.3'
    const res = await fetch(`${HF_API}/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature,
          return_full_text: false,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HuggingFace error: ${res.status} ${err}`)
    }

    const data = await res.json()
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text
    }
    if (typeof data === 'string') return data
    return ''
  }

  throw new Error(`Unsupported provider: ${provider}`)
}
