/**
 * Email notification service for AutoPilot.
 *
 * Supported providers:
 * - resend: Resend API (https://resend.com) — recommended, free tier available.
 * - sendgrid: SendGrid API (https://sendgrid.com) — free tier available.
 * - emailjs: EmailJS client-side SDK (https://www.emailjs.com) — free tier available.
 *
 * All providers require API keys stored in environment variables.
 * For static export, use NEXT_PUBLIC_* vars only for client-safe keys.
 * Server-side keys should be injected at build time or via Firebase App Hosting secrets.
 */

import { logger } from '@/lib/logger'

export type EmailProvider = 'resend' | 'sendgrid' | 'emailjs'

export interface EmailNotifierConfig {
  provider: EmailProvider
  /** Resend: API key (server-side). SendGrid: API key (server-side). EmailJS: public key (client-side). */
  apiKey?: string
  /** Resend/SendGrid: sender email address. */
  fromEmail?: string
  /** Resend/SendGrid: sender name. */
  fromName?: string
  /** EmailJS: service ID, template ID, public key. */
  emailJsServiceId?: string
  emailJsTemplateId?: string
  emailJsPublicKey?: string
  /** Recipients for notifications. */
  recipients: string[]
  /** Which events trigger email notifications. */
  events: {
    cycleDone: boolean
    cycleError: boolean
    postPublished: boolean
    postFailed: boolean
  }
}

export interface EmailMessage {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  tags?: Record<string, string>
}

const DEFAULT_CONFIG: EmailNotifierConfig = {
  provider: 'resend',
  fromEmail: 'noreply@pdskwork.web.app',
  fromName: 'PdskWork AutoPilot',
  recipients: [],
  events: {
    cycleDone: true,
    cycleError: true,
    postPublished: true,
    postFailed: true,
  },
}

export function getEmailNotifierConfig(): EmailNotifierConfig {
  if (typeof window === 'undefined') {
    // Server-side / build-time: read from env vars
    const provider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend'
    return {
      ...DEFAULT_CONFIG,
      provider,
      apiKey: provider === 'resend' ? process.env.RESEND_API_KEY : provider === 'sendgrid' ? process.env.SENDGRID_API_KEY : undefined,
      fromEmail: process.env.EMAIL_FROM || DEFAULT_CONFIG.fromEmail,
      fromName: process.env.EMAIL_FROM_NAME || DEFAULT_CONFIG.fromName,
      emailJsServiceId: process.env.EMAILJS_SERVICE_ID,
      emailJsTemplateId: process.env.EMAILJS_TEMPLATE_ID,
      emailJsPublicKey: process.env.EMAILJS_PUBLIC_KEY,
      recipients: (process.env.EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
    }
  }

  // Client-side: read from localStorage or env
  try {
    const stored = localStorage.getItem('pdsk-email-notifier-config')
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
  } catch {
    // ignore
  }

  return {
    ...DEFAULT_CONFIG,
    apiKey: process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.NEXT_PUBLIC_SENDGRID_API_KEY,
    fromEmail: process.env.NEXT_PUBLIC_EMAIL_FROM || DEFAULT_CONFIG.fromEmail,
    fromName: process.env.NEXT_PUBLIC_EMAIL_FROM_NAME || DEFAULT_CONFIG.fromName,
    emailJsPublicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    recipients: (process.env.NEXT_PUBLIC_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
  }
}

export function saveEmailNotifierConfig(config: EmailNotifierConfig): void {
  if (typeof window === 'undefined') return
  try {
    // Don't persist raw API keys in localStorage
    const toStore = { ...config, apiKey: undefined }
    localStorage.setItem('pdsk-email-notifier-config', JSON.stringify(toStore))
  } catch {
    // ignore
  }
}

/**
 * Send an email via the configured provider.
 *
 * Note: In a static export, client-side email sending is limited by CORS and
 * key exposure. For production, use a Firebase Cloud Function (Blaze) or a
 * lightweight proxy (e.g., Vercel Edge Function, Cloudflare Worker) that holds
 * the API key server-side and forwards the request.
 *
 * This function returns a Promise that resolves on success or rejects on failure.
 * Callers should handle errors gracefully — email is a best-effort notification.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const config = getEmailNotifierConfig()

  if (config.provider === 'resend') {
    return sendViaResend(config, message)
  } else if (config.provider === 'sendgrid') {
    return sendViaSendGrid(config, message)
  } else if (config.provider === 'emailjs') {
    return sendViaEmailJS(config, message)
  }

  logger.warn('[email-notifier] Unknown provider:', config.provider)
  return false
}

async function sendViaResend(config: EmailNotifierConfig, message: EmailMessage): Promise<boolean> {
  if (!config.apiKey) {
    logger.warn('[email-notifier] Resend API key not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html || message.text,
        text: message.text,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('[email-notifier] Resend error:', response.status, err)
      return false
    }

    logger.debug('[email-notifier] Email sent via Resend')
    return true
  } catch (err) {
    logger.error('[email-notifier] Resend failed:', err)
    return false
  }
}

async function sendViaSendGrid(config: EmailNotifierConfig, message: EmailMessage): Promise<boolean> {
  if (!config.apiKey) {
    logger.warn('[email-notifier] SendGrid API key not configured')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(message.to) ? message.to.map((e) => ({ email: e })) : [{ email: message.to }],
            subject: message.subject,
          },
        ],
        from: { email: config.fromEmail, name: config.fromName },
        content: [
          {
            type: 'text/html',
            value: message.html || message.text || '',
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('[email-notifier] SendGrid error:', response.status, err)
      return false
    }

    logger.debug('[email-notifier] Email sent via SendGrid')
    return true
  } catch (err) {
    logger.error('[email-notifier] SendGrid failed:', err)
    return false
  }
}

async function sendViaEmailJS(config: EmailNotifierConfig, message: EmailMessage): Promise<boolean> {
  if (!config.emailJsServiceId || !config.emailJsTemplateId || !config.emailJsPublicKey) {
    logger.warn('[email-notifier] EmailJS config incomplete')
    return false
  }

  try {
    // Dynamic import to avoid bundling if not used
    const emailjs = await import('@emailjs/browser')
    const templateParams = {
      to_email: Array.isArray(message.to) ? message.to.join(',') : message.to,
      subject: message.subject,
      html: message.html || message.text || '',
      text: message.text || message.html || '',
    }

    const result = await emailjs.send(
      config.emailJsServiceId,
      config.emailJsTemplateId,
      templateParams,
      config.emailJsPublicKey,
    )

    logger.debug('[email-notifier] Email sent via EmailJS:', result.status)
    return true
  } catch (err) {
    logger.error('[email-notifier] EmailJS failed:', err)
    return false
  }
}
