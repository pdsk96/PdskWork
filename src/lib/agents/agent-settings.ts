'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseReady, auth } from '@/lib/firebase'
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

function getAuthErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('permission-denied') || msg.includes('missing or insufficient permissions')) {
      return 'Firestore permission denied. Pastikan Firestore rules sudah di-deploy dan akun admin sudah login.'
    }
    if (msg.includes('unavailable') || msg.includes('network')) {
      return 'Firestore tidak tersedia. Periksa koneksi internet.'
    }
    if (msg.includes('resource-exhausted')) {
      return 'Quota Firestore habis.'
    }
    return err.message
  }
  return 'Unknown error'
}

function sanitizeSettings(data: Partial<AgentSettings>): AgentSettings {
  const temperature = typeof data.temperature === 'number' && Number.isFinite(data.temperature) ? data.temperature : DEFAULT_SETTINGS.temperature
  const maxTokens = typeof data.maxTokens === 'number' && Number.isFinite(data.maxTokens) ? data.maxTokens : DEFAULT_SETTINGS.maxTokens
  return { ...DEFAULT_SETTINGS, ...data, temperature, maxTokens }
}

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
      return sanitizeSettings(data as Partial<AgentSettings>)
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
      throw new Error('Firebase belum siap. Refresh halaman dan coba lagi.')
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Anda belum login sebagai admin. Silakan login terlebih dahulu.')
    }

    console.log('[agent-settings] Saving settings to Firestore:', settings, 'authUid:', currentUser.uid)
    await setDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID), settings, { merge: true })
    console.log('[agent-settings] Settings saved successfully')
  } catch (err) {
    console.error('[agent-settings] Failed to save settings:', err)
    throw new Error(getAuthErrorMessage(err))
  }
}
