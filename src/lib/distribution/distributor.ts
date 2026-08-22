'use client'

import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sendEmail, type EmailMessage } from '@/lib/notifications/email-notifier'
import { postToSocial, type SocialAccount, type SocialPost, type DistributionLog } from '@/lib/distribution/social-distributor'
import { createPost, type BlogPost } from '@/lib/blog-firestore'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DistributionJob {
  id: string
  postId: string
  slug: string
  title: string
  excerpt: string
  locale: 'en' | 'id'
  channels: {
    rss: boolean
    twitter: boolean
    linkedin: boolean
    whatsapp: boolean
  }
  status: 'pending' | 'queued' | 'sent' | 'failed'
  createdAt: number
  updatedAt: number
  error?: string
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    provider: 'resend' | 'sendgrid' | 'emailjs'
    recipients: string[]
    events: {
      cycleDone: boolean
      cycleError: boolean
      postPublished: boolean
      postFailed: boolean
    }
  }
  social: {
    twitter: SocialAccount & { enabled: boolean }
    linkedin: SocialAccount & { enabled: boolean }
    whatsapp: SocialAccount & { enabled: boolean }
  }
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email: {
    enabled: false,
    provider: 'resend',
    recipients: [],
    events: {
      cycleDone: true,
      cycleError: true,
      postPublished: true,
      postFailed: true,
    },
  },
  social: {
    twitter: { platform: 'twitter', enabled: false },
    linkedin: { platform: 'linkedin', enabled: false },
    whatsapp: { platform: 'whatsapp', enabled: false },
  },
}

const COLLECTION = 'distributionJobs'
const SETTINGS_DOC_ID = 'default'

// ─── Settings helpers ────────────────────────────────────────────────────────

export async function getNotificationSettings(): Promise<NotificationSettings> {
  if (!db) return DEFAULT_SETTINGS
  const snap = await getDoc(doc(db, 'notificationSettings', SETTINGS_DOC_ID))
  if (!snap.exists()) return DEFAULT_SETTINGS
  const data = snap.data() as Partial<NotificationSettings>
  return { ...DEFAULT_SETTINGS, ...data }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await setDoc(doc(db, 'notificationSettings', SETTINGS_DOC_ID), {
    ...settings,
    updatedAt: Date.now(),
  })
}

// ─── Distribution job helpers ────────────────────────────────────────────────

export async function createDistributionJob(
  postId: string,
  slug: string,
  title: string,
  excerpt: string,
  locale: 'en' | 'id',
  channels: DistributionJob['channels'],
): Promise<DistributionJob> {
  if (!db) throw new Error('Firestore not initialized')
  const id = `dist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()
  const job: DistributionJob = {
    id,
    postId,
    slug,
    title,
    excerpt,
    locale,
    channels,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(doc(db, COLLECTION, id), job)
  return job
}

export async function updateDistributionJob(id: string, patch: Partial<DistributionJob>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: Date.now() }, { merge: true })
}

export async function getDistributionJob(id: string): Promise<DistributionJob | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<DistributionJob, 'id'>) }
}

export async function getRecentDistributionJobs(limitCount = 20): Promise<DistributionJob[]> {
  if (!db) return []
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DistributionJob, 'id'>) }))
}

// ─── Notification sending ────────────────────────────────────────────────────

export async function sendCycleNotification(event: 'cycle-done' | 'cycle-error', data: { message?: string; trendsFound?: number; plansCreated?: number; error?: string }): Promise<void> {
  const settings = await getNotificationSettings()
  if (!settings.email.enabled) return

  const shouldSend =
    (event === 'cycle-done' && settings.email.events.cycleDone) ||
    (event === 'cycle-error' && settings.email.events.cycleError)

  if (!shouldSend) return

  const subject = event === 'cycle-done'
    ? `[PdskWork AutoPilot] Cycle complete: ${data.plansCreated || 0} plans created`
    : `[PdskWork AutoPilot] Cycle failed: ${data.error || 'Unknown error'}`

  const html = `
    <h2>AutoPilot ${event === 'cycle-done' ? 'Cycle Complete' : 'Cycle Failed'}</h2>
    <p><strong>Message:</strong> ${data.message || ''}</p>
    ${data.trendsFound !== undefined ? `<p><strong>Trends found:</strong> ${data.trendsFound}</p>` : ''}
    ${data.plansCreated !== undefined ? `<p><strong>Plans created:</strong> ${data.plansCreated}</p>` : ''}
    ${data.error ? `<p style="color: red;"><strong>Error:</strong> ${data.error}</p>` : ''}
    <p><em>Sent automatically by PdskWork AutoPilot</em></p>
  `

  await sendEmail({
    to: settings.email.recipients,
    subject,
    html,
    text: subject,
  })
}

export async function sendPostPublishedNotification(post: BlogPost): Promise<void> {
  const settings = await getNotificationSettings()
  if (!settings.email.enabled || !settings.email.events.postPublished) return

  const subject = `[PdskWork] New post published: ${post.title}`
  const html = `
    <h2>New Post Published</h2>
    <p><strong>Title:</strong> ${post.title}</p>
    <p><strong>Slug:</strong> ${post.slug}</p>
    <p><strong>Locale:</strong> ${post.locale}</p>
    <p><a href="https://pdskwork.web.app/blog/${post.slug}">View post</a></p>
    <p><em>Sent automatically by PdskWork AutoPilot</em></p>
  `

  await sendEmail({
    to: settings.email.recipients,
    subject,
    html,
    text: subject,
  })
}

export async function sendPostFailedNotification(postTitle: string, error: string): Promise<void> {
  const settings = await getNotificationSettings()
  if (!settings.email.enabled || !settings.email.events.postFailed) return

  const subject = `[PdskWork] Post failed: ${postTitle}`
  const html = `
    <h2>Post Publication Failed</h2>
    <p><strong>Title:</strong> ${postTitle}</p>
    <p style="color: red;"><strong>Error:</strong> ${error}</p>
    <p><em>Sent automatically by PdskWork AutoPilot</em></p>
  `

  await sendEmail({
    to: settings.email.recipients,
    subject,
    html,
    text: subject,
  })
}

// ─── Social distribution ─────────────────────────────────────────────────────

export async function distributeToSocial(
  post: BlogPost,
  channels: { twitter: boolean; linkedin: boolean; whatsapp: boolean },
  accounts: { twitter?: SocialAccount; linkedin?: SocialAccount; whatsapp?: SocialAccount },
): Promise<DistributionLog[]> {
  const logs: DistributionLog[] = []
  const text = `${post.title}\n\n${post.excerpt}\n\nhttps://pdskwork.web.app/blog/${post.slug}`

  if (channels.twitter && accounts.twitter) {
    const log = await postToSocial(accounts.twitter, {
      platform: 'twitter',
      content: text,
      text: `${post.title}\n\n${post.excerpt.slice(0, 100)}...`,
      mediaUrl: post.coverImage,
    })
    logs.push(log)
  }

  if (channels.linkedin && accounts.linkedin) {
    const log = await postToSocial(accounts.linkedin, {
      platform: 'linkedin',
      content: post.content.slice(0, 200),
      text: `${post.title}\n\n${post.excerpt}`,
      mediaUrl: post.coverImage,
    })
    logs.push(log)
  }

  if (channels.whatsapp && accounts.whatsapp) {
    const log = await postToSocial(accounts.whatsapp, {
      platform: 'whatsapp',
      content: text,
      text,
    })
    logs.push(log)
  }

  return logs
}
