'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseReady } from '@/lib/firebase'
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
  try {
    if (!db || !isFirebaseReady()) {
      console.warn('[agent-settings] Firebase not ready, returning default settings')
      return DEFAULT_SETTINGS
    }

    const snap = await getDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID))
    if (snap.exists()) {
      const data = snap.data()
      console.log('[agent-settings] Loaded settings from Firestore:', data)
      return { ...DEFAULT_SETTINGS, ...(data as Partial<AgentSettings>) }
    } else {
      console.log('[agent-settings] No saved settings found, returning defaults')
      return DEFAULT_SETTINGS
    }
  } catch (err) {
    console.error('[agent-settings] Failed to load settings:', err)
    return DEFAULT_SETTINGS
  }
}

export async function saveAgentSettings(settings: AgentSettings): Promise<void> {
  try {
    if (!db || !isFirebaseReady()) {
      throw new Error('Firebase not ready. Cannot save settings.')
    }

    console.log('[agent-settings] Saving settings to Firestore:', settings)
    await setDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID), settings, { merge: true })
    console.log('[agent-settings] Settings saved successfully')
  } catch (err) {
    console.error('[agent-settings] Failed to save settings:', err)
    throw err
  }
}
