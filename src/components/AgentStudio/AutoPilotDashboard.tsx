'use client'

import { useEffect, useState } from 'react'
import { useAutoPilot, type AutoPilotConfig } from '@/lib/agents/autopilot'
import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from '@/lib/distribution/distributor'
import { getEmailNotifierConfig, saveEmailNotifierConfig, type EmailNotifierConfig } from '@/lib/notifications/email-notifier'
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

  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null)
  const [emailConfig, setEmailConfig] = useState<EmailNotifierConfig | null>(null)
  const [loadingNotif, setLoadingNotif] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingNotif(true)
    Promise.all([getNotificationSettings(), getEmailNotifierConfig()])
      .then(([ns, ec]) => {
        if (!cancelled) {
          setNotifSettings(ns)
          setEmailConfig(ec)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingNotif(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    enableEmail: 'Enable email notifications',
    emailProvider: 'Email provider',
    recipients: 'Recipients (comma-separated)',
    cycleDone: 'Cycle done',
    cycleError: 'Cycle error',
    postPublished: 'Post published',
    postFailed: 'Post failed',
    socialAccounts: 'Social Accounts',
    twitterEnabled: 'Enable Twitter/X posting',
    linkedinEnabled: 'Enable LinkedIn posting',
    whatsappEnabled: 'Enable WhatsApp posting',
    save: 'Save',
    saved: 'Settings saved',
  }

  if (!config || !notifSettings || !emailConfig) return <div className="glass-card">Loading...</div>

  const patchNotif = async (patch: Partial<NotificationSettings>) => {
    const next = { ...notifSettings, ...patch }
    await saveNotificationSettings(next)
    setNotifSettings(next)
  }

  const patchEmail = async (patch: Partial<EmailNotifierConfig>) => {
    const next = { ...emailConfig, ...patch }
    saveEmailNotifierConfig(next)
    setEmailConfig(next)
  }

  return (
    <div className="glass-card">
      <h2 className="auth-title">{t.title}</h2>
      <p className="admin-welcome">{t.description}</p>

      {/* AutoPilot Config */}
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
            onChange={(e) => updateConfig({ intervalMinutes: Number(e.target.value) })}
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
            onChange={(e) => updateConfig({ maxPostsPerRun: Number(e.target.value) })}
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
            onChange={(e) => updateConfig({ maxPostsPerDay: Number(e.target.value) })}
            className="auth-input"
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input
            type="checkbox"
            checked={config.autoApprove}
            onChange={(e) => updateConfig({ autoApprove: e.target.checked })}
          />
          {t.autoApprove}
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.rss}
            onChange={(e) => updateConfig({ distributionChannels: { ...config.distributionChannels, rss: e.target.checked } })}
          />
          {t.rss}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.twitter}
            onChange={(e) => updateConfig({ distributionChannels: { ...config.distributionChannels, twitter: e.target.checked } })}
          />
          {t.twitter}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.linkedin}
            onChange={(e) => updateConfig({ distributionChannels: { ...config.distributionChannels, linkedin: e.target.checked } })}
          />
          {t.linkedin}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={config.distributionChannels.whatsapp}
            onChange={(e) => updateConfig({ distributionChannels: { ...config.distributionChannels, whatsapp: e.target.checked } })}
          />
          {t.whatsapp}
        </label>
      </div>

      {error && <p style={{ color: 'var(--neon-red, #ff4d4d)' }}>{error}</p>}

      {/* Email Notifications */}
      <h3 className="auth-title" style={{ marginTop: '2rem' }}>{t.emailNotifications}</h3>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={notifSettings.email.enabled}
          onChange={(e) => patchNotif({ email: { ...notifSettings.email, enabled: e.target.checked } })}
        />
        {t.enableEmail}
      </label>

      {notifSettings.email.enabled && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>{t.emailProvider}</span>
            <select
              value={emailConfig.provider}
              onChange={(e) => patchEmail({ provider: e.target.value as EmailNotifierConfig['provider'] })}
              className="auth-input"
            >
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
              <option value="emailjs">EmailJS</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>{t.recipients}</span>
            <input
              type="text"
              value={emailConfig.recipients.join(', ')}
              onChange={(e) => patchEmail({ recipients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              className="auth-input"
              placeholder="admin@example.com, team@example.com"
            />
          </label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={notifSettings.email.events.cycleDone}
                onChange={(e) => patchNotif({ email: { ...notifSettings.email, events: { ...notifSettings.email.events, cycleDone: e.target.checked } } })}
              />
              {t.cycleDone}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={notifSettings.email.events.cycleError}
                onChange={(e) => patchNotif({ email: { ...notifSettings.email, events: { ...notifSettings.email.events, cycleError: e.target.checked } } })}
              />
              {t.cycleError}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={notifSettings.email.events.postPublished}
                onChange={(e) => patchNotif({ email: { ...notifSettings.email, events: { ...notifSettings.email.events, postPublished: e.target.checked } } })}
              />
              {t.postPublished}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={notifSettings.email.events.postFailed}
                onChange={(e) => patchNotif({ email: { ...notifSettings.email, events: { ...notifSettings.email.events, postFailed: e.target.checked } } })}
              />
              {t.postFailed}
            </label>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
            API keys are configured via environment variables. For client-side EmailJS, use NEXT_PUBLIC_EMAILJS_* vars.
          </p>
        </div>
      )}

      {/* Social Accounts */}
      <h3 className="auth-title" style={{ marginTop: '2rem' }}>{t.socialAccounts}</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={notifSettings.social.twitter.enabled}
              onChange={(e) => patchNotif({ social: { ...notifSettings.social, twitter: { ...notifSettings.social.twitter, enabled: e.target.checked } } })}
            />
            {t.twitterEnabled}
          </label>
          {notifSettings.social.twitter.enabled && (
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Configure Twitter API credentials via env vars (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN).
              OAuth flow required for first-time authorization.
            </p>
          )}
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={notifSettings.social.linkedin.enabled}
              onChange={(e) => patchNotif({ social: { ...notifSettings.social, linkedin: { ...notifSettings.social.linkedin, enabled: e.target.checked } } })}
            />
            {t.linkedinEnabled}
          </label>
          {notifSettings.social.linkedin.enabled && (
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Configure LinkedIn API credentials via env vars (LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORGANIZATION_URN).
              Requires Marketing Developer Platform access (paid).
            </p>
          )}
        </div>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={notifSettings.social.whatsapp.enabled}
              onChange={(e) => patchNotif({ social: { ...notifSettings.social, whatsapp: { ...notifSettings.social.whatsapp, enabled: e.target.checked } } })}
            />
            {t.whatsappEnabled}
          </label>
          {notifSettings.social.whatsapp.enabled && (
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Configure WhatsApp Business API credentials via env vars (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID).
              Requires WhatsApp Business Account (paid).
            </p>
          )}
        </div>
      </div>

      {/* Plans */}
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

      {/* Runs */}
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
