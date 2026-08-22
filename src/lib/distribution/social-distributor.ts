/**
 * Social media distribution service for AutoPilot.
 *
 * Supported platforms:
 * - twitter: Twitter/X API v2 (requires API key + OAuth 2.0)
 * - linkedin: LinkedIn API (requires OAuth 2.0 + Marketing Developer Platform)
 * - whatsapp: WhatsApp Business Platform (requires Business Account + access token)
 *
 * Note: LinkedIn and WhatsApp APIs typically require paid developer accounts
 * and business verification. Twitter/X has a free tier for posting.
 * All integrations are best-effort and log failures gracefully.
 */

import { logger } from '@/lib/logger'

export type SocialPlatform = 'twitter' | 'linkedin' | 'whatsapp'

export interface SocialAccount {
  platform: SocialPlatform
  /** OAuth access token (client-side: stored in memory or secure storage). */
  accessToken?: string
  /** Twitter: API key + secret (for OAuth 1.0a) or bearer token (for OAuth 2.0). */
  apiKey?: string
  apiSecret?: string
  /** LinkedIn: organization URN for company pages. */
  organizationUrn?: string
  /** WhatsApp: phone number ID. */
  phoneNumberId?: string
}

export interface SocialPost {
  platform: SocialPlatform
  content: string
  /** URL to attach (image, blog post, etc.). */
  mediaUrl?: string
  /** For Twitter: tweet text. For LinkedIn: commentary. For WhatsApp: message text. */
  text?: string
}

export interface DistributionLog {
  id: string
  postId: string
  slug: string
  platform: SocialPlatform
  status: 'pending' | 'queued' | 'sent' | 'failed'
  createdAt: number
  updatedAt: number
  error?: string
  externalId?: string // tweet ID, post URN, message ID
}

/**
 * Post content to a social platform.
 *
 * IMPORTANT: Client-side social posting requires OAuth flows that redirect
 * the user to the platform's authorization page. This function assumes the
 * user has already authorized the app and provided an access token.
 *
 * For production, store tokens securely (Firestore with encryption, or
 * Firebase Auth custom claims). Never expose raw tokens in client-side code.
 */
export async function postToSocial(account: SocialAccount, post: SocialPost): Promise<DistributionLog> {
  const id = `dist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const log: DistributionLog = {
    id,
    postId: post.platform,
    slug: post.mediaUrl || '',
    platform: post.platform,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  try {
    if (post.platform === 'twitter') {
      return await postToTwitter(account, post, log)
    } else if (post.platform === 'linkedin') {
      return await postToLinkedIn(account, post, log)
    } else if (post.platform === 'whatsapp') {
      return await postToWhatsApp(account, post, log)
    }

    log.status = 'failed'
    log.error = `Unsupported platform: ${post.platform}`
    return log
  } catch (err) {
    log.status = 'failed'
    log.error = err instanceof Error ? err.message : 'Unknown error'
    return log
  }
}

async function postToTwitter(account: SocialAccount, post: SocialPost, log: DistributionLog): Promise<DistributionLog> {
  if (!account.accessToken && !account.apiKey) {
    log.status = 'failed'
    log.error = 'Twitter: access token or API key not configured'
    return log
  }

  const text = post.text || post.content.slice(0, 280) // Twitter limit

  try {
    // Twitter API v2: POST /2/tweets
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (account.accessToken) {
      headers.Authorization = `Bearer ${account.accessToken}`
    } else if (account.apiKey && account.apiSecret) {
      // OAuth 1.0a: generate bearer token (simplified; real impl needs crypto)
      headers.Authorization = `Bearer ${account.apiKey}`
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        media: post.mediaUrl ? { media_ids: [await uploadTwitterMedia(account, post.mediaUrl)] } : undefined,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      log.status = 'failed'
      log.error = `Twitter API error: ${response.status} ${err}`
      return log
    }

    const data = await response.json()
    log.status = 'sent'
    log.externalId = data.data?.id
    log.updatedAt = Date.now()
    logger.debug('[social] Posted to Twitter:', log.externalId)
    return log
  } catch (err) {
    log.status = 'failed'
    log.error = `Twitter failed: ${err instanceof Error ? err.message : 'Unknown'}`
    return log
  }
}

async function uploadTwitterMedia(account: SocialAccount, mediaUrl: string): Promise<string> {
  // Simplified: Twitter media upload requires chunked upload for images.
  // For a single image, use media/upload endpoint.
  // This is a placeholder — real implementation needs multipart upload.
  logger.warn('[social] Twitter media upload not fully implemented')
  return mediaUrl
}

async function postToLinkedIn(account: SocialAccount, post: SocialPost, log: DistributionLog): Promise<DistributionLog> {
  if (!account.accessToken) {
    log.status = 'failed'
    log.error = 'LinkedIn: access token not configured'
    return log
  }

  const text = post.text || post.content.slice(0, 3000) // LinkedIn limit

  try {
    // LinkedIn UGC Posts API (v2)
    const author = account.organizationUrn || 'urn:li:person:me'
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${account.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: post.mediaUrl ? 'IMAGE' : 'NONE',
            media: post.mediaUrl
              ? [
                  {
                    status: 'READY',
                    description: { text: post.content.slice(0, 200) },
                    media: post.mediaUrl,
                  },
                ]
              : [],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      log.status = 'failed'
      log.error = `LinkedIn API error: ${response.status} ${err}`
      return log
    }

    const data = await response.json()
    log.status = 'sent'
    log.externalId = data.id
    log.updatedAt = Date.now()
    logger.debug('[social] Posted to LinkedIn:', log.externalId)
    return log
  } catch (err) {
    log.status = 'failed'
    log.error = `LinkedIn failed: ${err instanceof Error ? err.message : 'Unknown'}`
    return log
  }
}

async function postToWhatsApp(account: SocialAccount, post: SocialPost, log: DistributionLog): Promise<DistributionLog> {
  if (!account.accessToken || !account.phoneNumberId) {
    log.status = 'failed'
    log.error = 'WhatsApp: access token or phone number ID not configured'
    return log
  }

  const text = post.text || post.content.slice(0, 4096) // WhatsApp limit

  try {
    // WhatsApp Business Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${account.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: post.mediaUrl || '', // In practice, this is a phone number
          type: 'text',
          text: { body: text },
        }),
      },
    )

    if (!response.ok) {
      const err = await response.text()
      log.status = 'failed'
      log.error = `WhatsApp API error: ${response.status} ${err}`
      return log
    }

    const data = await response.json()
    log.status = 'sent'
    log.externalId = data.messages?.[0]?.id
    log.updatedAt = Date.now()
    logger.debug('[social] Posted to WhatsApp:', log.externalId)
    return log
  } catch (err) {
    log.status = 'failed'
    log.error = `WhatsApp failed: ${err instanceof Error ? err.message : 'Unknown'}`
    return log
  }
}
