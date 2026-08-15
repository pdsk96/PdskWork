#!/usr/bin/env node
/**
 * Seed Firestore `posts` collection from src/db/blog.json.
 *
 * Run once after enabling Firestore in the Firebase console. Uses the Firebase
 * Admin SDK authenticated via a service account key, which works in production
 * mode (unlike the public web config). The Admin SDK bypasses security rules.
 *
 * Prerequisites:
 *   1. Generate a service account key: Firebase console → Project settings →
 *      Service accounts → Generate new private key → save as
 *      `serviceAccountKey.json` in the repo root (gitignored).
 *   2. `npm install` (firebase-admin is a devDependency).
 *
 * Usage:
 *   npm run seed:firestore
 *
 * Env override:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npm run seed:firestore
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED = join(ROOT, 'src', 'db', 'blog.json')
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? join(ROOT, 'serviceAccountKey.json')

// --- init admin app via service account ---
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'))
} catch {
  console.error(
    `[seed] service account key not found at ${KEY_PATH}.\n` +
      `Generate one in the Firebase console (Project settings → Service accounts\n` +
      `→ Generate new private key) and save it as serviceAccountKey.json in the\n` +
      `repo root, or set GOOGLE_APPLICATION_CREDENTIALS to its path.`,
  )
  process.exit(1)
}

const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)

// --- read seed posts ---
let posts = []
try {
  posts = JSON.parse(readFileSync(SEED, 'utf8'))
} catch (err) {
  console.error(`[seed] could not read ${SEED}:`, err.message)
  process.exit(1)
}

console.log(`[seed] importing ${posts.length} posts into Firestore (project: ${serviceAccount.project_id})…`)

for (const post of posts) {
  // doc id === post.id so the client store can edit/delete by the same id.
  await db.collection('posts').doc(post.id).set({ ...post })
  console.log(`  ✓ ${post.slug} (${post.id})`)
}

console.log('[seed] done. Verify in the Firebase console → Firestore → posts.')

