import { cookies } from 'next/headers'

/**
 * Minimal admin auth scaffolding.
 *
 * A signed httpOnly cookie holds an HMAC of the admin subject. Verification is
 * done with Web Crypto (SubtleCrypto) so it works in edge/proxy runtimes.
 *
 * The secret is read from ADMIN_AUTH_SECRET at runtime. In development a fixed
 * fallback is used so the flow works without configuration; production MUST set
 * ADMIN_AUTH_SECRET. ADMIN_PASSWORD gates the login endpoint.
 */

const COOKIE_NAME = 'pdsk_admin_session'
const SUBJECT = 'admin'
const FALLBACK_SECRET = 'dev-only-insecure-secret-do-not-use-in-prod'

function secret(): string {
  return process.env.ADMIN_AUTH_SECRET || FALLBACK_SECRET
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin'
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return toHex(sig)
}

export async function createSessionCookie(): Promise<string> {
  const value = `${SUBJECT}.${await hmac(SUBJECT)}`
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 8}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

export async function verifyCredentials(password: string): Promise<boolean> {
  // Constant-time-ish comparison to avoid trivial timing leaks.
  const a = new TextEncoder().encode(password)
  const b = new TextEncoder().encode(adminPassword())
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  if (!raw) return false
  const [subject, sig] = raw.split('.')
  if (!subject || !sig) return false
  return sig === (await hmac(subject))
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
