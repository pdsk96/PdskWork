'use client'

import { useAutoPilot, type AutoPilotConfig } from '@/lib/agents/autopilot'
import { useLocale } from '@/i18n/LocaleProvider'

export default function AutoPilotDashboard() {
  const { dict, locale } = useLocale()
  const {
    config,
    runs,
    plans,
    status,
    error,
    startCycle,
    toggleEnabled,
    updateConfig,
    approvePlan,
    skipPlan,
  } = useAutoPilot()

  const t = (dict as any).admin?.autopilot || {
    title: 'AutoPilot',
    description: 'Autonomous blog management agent.',
    enable: 'Enable AutoPilot',
    disable: 'Disable AutoPilot',
    runNow: 'Run Now',
    interval: 'Interval (minutes)',
    maxPerRun: 'Max posts per run',
    maxPerDay: 'Max posts per day',
    autoApprove: 'Auto-approve & publish',
    rss: 'RSS distribution',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    status: 'Status',
    runs: 'Recent Runs',
    plans: 'Content Plans',
    noRuns: 'No runs yet.',
    noPlans: 'No plans yet.',
    approve: 'Approve & Publish',
    skip: 'Skip',
    running: 'Running...',
    idle: 'Idle',
    error: 'Error',
  }

  if (!config) return <div className="glass-card">Loading AutoPilot config...</div>

  const patchConfig = async (patch: Partial<AutoPilotConfig>) => {
    await updateConfig(patch)
  }

  return (
    <div className="glass-card">
      <h2 className="auth-title">{t.title}</h2>
      <p className="admin-welcome">{t.description}</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <button
          type="button"
          className={`primary-btn ${config.enabled ? 'ghost-btn' : ''}`}
          onClick={() => toggleEnabled(!config.enabled)}
        >
          {config.enabled ? t.disable : t.enable}
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={startCycle}
          disabled={status !== 'idle'}
        >
          {t.runNow} {status !== 'idle' ? `(${t.running})` : ''}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>{t.interval}</span>
          <input
            type="number"
            min={60}
            max={1440}
            value={config.intervalMinutes}
            onChange={(e) => patchConfig({ intervalMinutes: Number(e.target.value) })}
            className="auth-input"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>{t.maxPerRun}</span>
          <input
            type="number"
            min={1}
            max={10}
            value={config.maxPostsPerRun}
            onChange={(e) => patchConfig({ maxPostsPerRun: Number(e.target.value) })}
            className="auth-input"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>{t.maxPerDay}</span>
          <input
            type="number"
            min={1}
            max={20}
            value={config.maxPostsPerDay}
            onChange={(e) => patchConfig({ maxPostsPerDay: Number(e.target.value) })}
            className="auth-input"
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input
            type="checkbox"
            checked={config.autoApprove}
            onChange={(e) => patchConfig({ autoApprove: e.target.checked })}
          />
          {t.autoApprove}
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.rss}
            onChange={(e) => patchConfig({ distributionChannels: { ...config.distributionChannels, rss: e.target.checked } })}
          />
          {t.rss}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.twitter}
            onChange={(e) => patchConfig({ distributionChannels: { ...config.distributionChannels, twitter: e.target.checked } })}
          />
          {t.twitter}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.linkedin}
            onChange={(e) => patchConfig({ distributionChannels: { ...config.distributionChannels, linkedin: e.target.checked } })}
          />
          {t.linkedin}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.whatsapp}
            onChange={(e) => patchConfig({ distributionChannels: { ...config.distributionChannels, whatsapp: e.target.checked } })}
          />
          {t.whatsapp}
        </label>
      </div>

      {error && <p style={{ color: 'var(--neon-red, #ff4d4d)' }}>{error}</p>}

      <h3 className="auth-title" style={{ marginTop: '2rem' }}>{t.plans}</h3>
      {plans.length === 0 ? (
        <p>{t.noPlans}</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {plans.map((plan) => (
            <div key={plan.id} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{plan.title}</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                    {plan.angle} · {plan.locale} · {plan.status}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {plan.status === 'reviewing' && (
                    <>
                      <button type="button" className="primary-btn" onClick={() => approvePlan(plan.id)}>{t.approve}</button>
                      <button type="button" className="ghost-btn" onClick={() => skipPlan(plan.id)}>{t.skip}</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="auth-title" style={{ marginTop: '2rem' }}>{t.runs}</h3>
      {runs.length === 0 ? (
        <p>{t.noRuns}</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {runs.map((run) => (
            <div key={run.id} className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{run.type}</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                    {new Date(run.startedAt).toLocaleString()} · {run.status}
                  </p>
                  {run.error && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--neon-red, #ff4d4d)' }}>{run.error}</p>}
                </div>
                <span className={`blog-badge ${run.status === 'success' ? 'blog-badge--published' : run.status === 'error' ? 'blog-badge--draft' : 'blog-badge--pending'}`}>
                  {run.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
