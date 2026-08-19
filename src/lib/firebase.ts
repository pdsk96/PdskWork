import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDHGlLYHlsc_QhFV_0ia6q5Z79tBUpG9YE',
  authDomain: 'pdskwork.firebaseapp.com',
  projectId: 'pdskwork',
  storageBucket: 'pdskwork.firebasestorage.app',
  messagingSenderId: '998484585821',
  appId: '1:998484585821:web:f1d0d86733f00771c44cb4',
  measurementId: 'G-ZZW0HL7P0T',
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = isSupported().then((ok) => (ok ? getAnalytics(app) : null))

export function isFirebaseReady(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(app && db && auth)
  } catch {
    return false
  }
}
