#!/usr/bin/env node
/**
 * TEMPORARY one-off script — sets the admin user's email + password + emailVerified
 * via the Firebase Admin SDK. Run inside CI where FIREBASE_SERVICE_ACCOUNT (the
 * service account JSON) is available as a secret.
 *
 * Deletes itself from the repo after use (see commit history only).
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const uid = process.argv[2]
const email = process.argv[3]
const password = process.argv[4]

if (!uid || !email || !password) {
  console.error('usage: admin-set-creds.mjs <uid> <email> <password>')
  process.exit(2)
}

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(sa) })

const res = await getAuth(app).updateUser(uid, {
  email,
  password,
  emailVerified: true,
})
console.log('updated uid:', res.uid)
console.log('email     :', res.email)
console.log('verified  :', res.emailVerified)
