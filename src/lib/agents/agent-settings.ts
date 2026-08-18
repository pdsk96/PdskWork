'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { LLMConfig } from '@/lib/ai/llm-client'

export interface AgentSettings extends LLMConfig {
  autoScheduleEnabled: boolean
  autoScheduleTimes: number[]
  autoScheduleLocale: 'en' | 'id'
  autoSchedulePostsPerRun: number
}

const DEFAULT_SETTINGS: AgentSettings = {
  provider: 'groq',
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxTokens: 2048,
  autoScheduleEnabled: false,
  autoScheduleTimes: [7, 12, 19, 22],
  autoScheduleLocale: 'en',
  autoSchedulePostsPerRun: 1,
}

const CONFIG_DOC_ID = 'default'

export async function loadAgentSettings(): Promise<AgentSettings> {
  if (!db) return DEFAULT_SETTINGS
  try {
    const snap = await getDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID))
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<AgentSettings>) }
    }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

export async function saveAgentSettings(settings: AgentSettings): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID), settings, { merge: true })
}
