import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase client config for the pdskwork project. Values are public by design
// (Firebase web config is safe to ship to the browser); secrets live server-side.
const firebaseConfig = {
  apiKey: 'AIzaSyDHGlLYHlsc_QhFV_0ia6q5Z79tBUpG9YE',
  authDomain: 'pdskwork.firebaseapp.com',
  projectId: 'pdskwork',
  storageBucket: 'pdskwork.firebasestorage.app',
  messagingSenderId: '998484585821',
  appId: '1:998484585821:web:f1d0d86733f00771c44cb4',
  measurementId: 'G-ZZW0HL7P0T',
}

// Guard against duplicate init during hot reloads / HMR.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Auth + Firestore (client SDK). Used by the admin CMS (email/password sign-in)
// and the runtime blog store. Both are browser-only; safe to instantiate here
// because this module is only imported by client components.
export const auth = getAuth(app)
export const db = getFirestore(app)

// Analytics requires a browser environment with `window`. `isSupported()`
// returns false in SSR / non-browser contexts, so we lazily enable it.
export const analytics = isSupported().then((ok) => (ok ? getAnalytics(app) : null))
