#!/usr/bin/env node
/**
 * Seed Firestore `posts` collection from src/db/blog.json.
 *
 * Run once after enabling Firestore in the Firebase console. Requires the
 * Firebase CLI to be installed and authenticated (`firebase login`), because
 * it uses the Admin-SDK-equivalent `firebase firestore` REST path via the
 * CLI's authenticated session.
 *
 * Usage:
 *   npm run seed:firestore
 *
 * Prerequisite: create the admin Auth user first (see FIREBASE.md), and make
 * sure Firestore is in production mode (or test mode) for the pdskwork project.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SEED = join(ROOT, 'src', 'db', 'blog.json')
const PROJECT = 'pdskwork'

const posts = JSON.parse(readFileSync(SEED, 'utf8'))

console.log(`[seed] importing ${posts.length} posts into Firestore (${PROJECT})…`)

for (const post of posts) {
  // Use the CLI's authenticated REST helper to write each doc by its id.
  const doc = { ...post }
  const payload = JSON.stringify({ fields: objectToFields(doc) })
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/posts/${post.id}`
  try {
    execSync(
      `curl -sS -X PATCH -H "Content-Type: application/json" -d '${payload.replace(/'/g, "'\\''")}' '${url}' > /dev/null`,
      { stdio: 'inherit' },
    )
    console.log(`  ✓ ${post.slug} (${post.id})`)
  } catch (err) {
    console.error(`  ✗ ${post.slug} — make sure you ran \`firebase login\` and Firestore is enabled`)
    process.exit(1)
  }
}

console.log('[seed] done. Verify in the Firebase console → Firestore → posts.')

// Minimal Firestore "fields" encoder for the REST API (strings, booleans, arrays).
function objectToFields(obj) {
  const fields = {}
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = encodeValue(v)
  }
  return fields
}
function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return { integerValue: String(v) }
  if (typeof v === 'string') return { stringValue: v }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(encodeValue) } }
  }
  if (typeof v === 'object') {
    return { mapValue: { fields: objectToFields(v) } }
  }
  return { stringValue: String(v) }
}
