'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseReady, auth } from '@/lib/firebase'
import type { LLMConfig } from '@/lib/ai/llm-client'
import { logger } from '@/lib/logger'

export interface AgentSettings extends Omit<LLMConfig, 'apiKey'> {
  autoScheduleEnabled: boolean
  autoScheduleTimes: number[]
  autoScheduleLocale: 'en' | 'id'
  autoSchedulePostsPerRun: number
}

const DEFAULT_SETTINGS: AgentSettings = {
  provider: 'groq',
  model: '',
  temperature: 0.7,
  maxTokens: 2048,
  autoScheduleEnabled: false,
  autoScheduleTimes: [7, 12, 19, 22],
  autoScheduleLocale: 'en',
  autoSchedulePostsPerRun: 1,
}

const CONFIG_DOC_ID = 'default'
const API_KEY_STORAGE_KEY = 'pdsk-llm-api-key'

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

/** Read API key from browser localStorage (never stored in Firestore). */
export function getApiKeyFromStorage(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(API_KEY_STORAGE_KEY) || ''
}

/** Write API key to browser localStorage (never stored in Firestore). */
export function setApiKeyToStorage(key: string): void {
  if (typeof window === 'undefined') return
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  }
}

/** Clear API key from browser localStorage. */
export function clearApiKeyFromStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

export async function loadAgentSettings(): Promise<AgentSettings & { apiKey: string }> {
  try {
    if (!db || !isFirebaseReady()) {
      logger.warn('[agent-settings] Firebase not ready, returning default settings')
      return { ...DEFAULT_SETTINGS, apiKey: getApiKeyFromStorage() }
    }

    const snap = await getDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID))
    if (snap.exists()) {
      const data = snap.data()
      logger.debug('[agent-settings] Loaded settings from Firestore')
      // Merge Firestore config with localStorage API key.
      return { ...sanitizeSettings(data as Partial<AgentSettings>), apiKey: getApiKeyFromStorage() }
    } else {
      logger.debug('[agent-settings] No saved settings found, returning defaults')
      return { ...DEFAULT_SETTINGS, apiKey: getApiKeyFromStorage() }
    }
  } catch (err) {
    logger.error('[agent-settings] Failed to load settings:', err)
    return { ...DEFAULT_SETTINGS, apiKey: getApiKeyFromStorage() }
  }
}

export async function saveAgentSettings(settings: AgentSettings & { apiKey?: string }): Promise<void> {
  try {
    if (!db || !isFirebaseReady()) {
      throw new Error('Firebase belum siap. Refresh halaman dan coba lagi.')
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('Anda belum login sebagai admin. Silakan login terlebih dahulu.')
    }

    // Store API key in localStorage, NOT in Firestore.
    if (settings.apiKey !== undefined) {
      setApiKeyToStorage(settings.apiKey)
    }

    const { apiKey: _apiKey, ...firestoreSettings } = settings
    logger.debug('[agent-settings] Saving settings to Firestore')
    await setDoc(doc(db, 'agentConfigs', CONFIG_DOC_ID), firestoreSettings, { merge: true })
    logger.debug('[agent-settings] Settings saved successfully')
  } catch (err) {
    logger.error('[agent-settings] Failed to save settings:', err)
    throw new Error(getAuthErrorMessage(err))
  }
}
