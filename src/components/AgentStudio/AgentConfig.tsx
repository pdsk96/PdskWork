'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import type { LLMConfig, LLMProvider } from '@/lib/ai/llm-client'

export default function AgentConfig({ config, onChange }: {
  config: LLMConfig | null
  onChange: (cfg: LLMConfig) => void
}) {
  const { dict } = useLocale()
  if (!config) return null

  return (
    <div className="agent-config">
      <h3 className="auth-title">Agent Settings</h3>
      <div className="field">
        <span className="field-label">LLM Provider</span>
        <select
          className="field-input"
          value={config.provider}
          onChange={(e) => onChange({ ...config, provider: e.target.value as LLMProvider })}
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
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="Enter your API key"
        />
      </div>
      <div className="field">
        <span className="field-label">Model</span>
        <input
          className="field-input"
          value={config.model || ''}
          onChange={(e) => onChange({ ...config, model: e.target.value })}
          placeholder={config.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'mistralai/Mistral-7B-Instruct-v0.3'}
        />
      </div>
      <div className="agent-config__row">
        <div className="field">
          <span className="field-label">Temperature</span>
          <input
            className="field-input"
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature ?? 0.7}
            onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
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
            value={config.maxTokens ?? 2048}
            onChange={(e) => onChange({ ...config, maxTokens: parseInt(e.target.value, 10) })}
          />
        </div>
      </div>
    </div>
  )
}
