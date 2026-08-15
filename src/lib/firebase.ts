import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase client config for the pdskwork project. Values are public by design
// (Firebase web config is safe to ship to the browser); secrets live server-side.
const firebaseConfig = {
  apiKey: 'AIzaSyDHGlLYHlsc_QhFV_0ia6q5Z79tBUpG9YE',
  authDomain: 'pdskwork.firebaseapp.com',
  projectId: 'pdskwork',
  storageBucket: 'pdskwork.firebasestorage.app',
  messagingSenderId: '998484585821',
  appId: '1:998484585821:web:0dbd74be4cf76db1c44cb4',
  measurementId: 'G-XH5XF12NSD',
}

// Guard against duplicate init during hot reloads / HMR.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Analytics requires a browser environment with `window`. `isSupported()`
// returns false in SSR / non-browser contexts, so we lazily enable it.
export const analytics = isSupported().then((ok) => (ok ? getAnalytics(app) : null))
