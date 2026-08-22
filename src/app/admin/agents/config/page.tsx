'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'
import { loadAgentSettings, saveAgentSettings, type AgentSettings } from '@/lib/agents/agent-settings'
import { logger } from '@/lib/logger'

type ConfigState = AgentSettings & { apiKey: string }

export default function AgentConfigPage() {
  const { dict } = useLocale()
  const [settings, setSettings] = useState<ConfigState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    logger.debug('[agent-config] Loading agent settings...')
    loadAgentSettings()
      .then((s) => {
        logger.debug('[agent-config] Settings loaded:', s)
        setSettings(s)
      })
      .catch((err) => {
        logger.error('[agent-config] Failed to load settings:', err)
        setToast('Failed to load settings.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setToast(null)
    logger.debug('[agent-config] Saving settings:', settings)
    try {
      await saveAgentSettings(settings)
      setToast('Settings saved successfully.')
      logger.debug('[agent-config] Reloading settings to confirm save...')
      const reloaded = await loadAgentSettings()
      setSettings(reloaded)
      logger.debug('[agent-config] Reloaded settings:', reloaded)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('[agent-config] Save failed:', err)
      setToast(`Gagal menyimpan: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="blog-empty" aria-busy="true">Loading settings...</div>
  if (!settings) return <div className="blog-empty">Failed to load settings.</div>

  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <div className="blog-admin__head">
            <div>
              <h1 className="auth-title">{dict.admin.agentsConfigTitle}</h1>
              <p className="admin-welcome">Configure LLM provider, API keys, and auto-schedule behavior.</p>
            </div>
            <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : dict.admin.autopilotSave}
            </button>
          </div>

          <AdminNav />

          <div className="agent-config-page" style={{ marginTop: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 className="auth-title" style={{ marginTop: 0 }}>LLM Provider</h3>
              <div className="field">
                <span className="field-label">Provider</span>
                <select
                  className="field-input"
                  value={settings.provider}
                  onChange={(e) => setSettings({ ...settings, provider: e.target.value as 'groq' | 'huggingface' })}
                >
                  <option value="groq">Groq (free tier)</option>
                  <option value="huggingface">HuggingFace (free tier)</option>
                </select>
              </div>
              <div className="field">
                <span className="field-label">API Key</span>
                <input
                  className="field-input"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder={dict.ui.apiKeyPlaceholder}
                />
              </div>
              <div className="field">
                <span className="field-label">Model</span>
                <input
                  className="field-input"
                  value={settings.model || ''}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder={settings.provider === 'groq' ? dict.ui.modelPlaceholderGroq : dict.ui.modelPlaceholderHf}
                />
              </div>
              <div className="agent-config__row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field">
                  <span className="field-label">Temperature</span>
                  <input
                    className="field-input"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature ?? 0.7}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="field">
                  <span className="field-label">Max Tokens</span>
                  <input
                    className="field-input"
                    type="number"
                    min="256"
                    max="8192"
                    step="256"
                    value={settings.maxTokens ?? 2048}
                    onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 className="auth-title" style={{ marginTop: 0 }}>Auto-Schedule</h3>
              <div className="field">
                <span className="field-label">Enable Auto-Schedule</span>
                <select
                  className="field-input"
                  value={settings.autoScheduleEnabled ? 'yes' : 'no'}
                  onChange={(e) => setSettings({ ...settings, autoScheduleEnabled: e.target.value === 'yes' })}
                >
                  <option value="yes">Enabled</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
              <div className="field">
                <span className="field-label">Schedule Times (hours, comma-separated)</span>
                <input
                  className="field-input"
                  value={settings.autoScheduleTimes.join(', ')}
                  onChange={(e) => {
                    const times = e.target.value.split(',').map((t) => parseInt(t.trim(), 10)).filter((n) => !isNaN(n) && n >= 0 && n <= 23)
                    setSettings({ ...settings, autoScheduleTimes: times.length ? times : [7, 12, 19, 22] })
                  }}
                />
              </div>
              <div className="field">
                <span className="field-label">Posts Per Run</span>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.autoSchedulePostsPerRun}
                  onChange={(e) => setSettings({ ...settings, autoSchedulePostsPerRun: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="field">
                <span className="field-label">Default Locale</span>
                <select
                  className="field-input"
                  value={settings.autoScheduleLocale}
                  onChange={(e) => setSettings({ ...settings, autoScheduleLocale: e.target.value as 'en' | 'id' })}
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : dict.admin.autopilotSave}
              </button>
              <Link href="/admin/agents" className="ghost-btn">← Back to Agent Studio</Link>
            </div>
          </div>
        </section>

        {toast && <div className="toast">{toast}</div>}
      </main>
    </AdminGate>
  )
}
