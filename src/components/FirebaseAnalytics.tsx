'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/firebase'

/**
 * FirebaseAnalytics — initializes Google Analytics for Firebase on the client.
 *
 * `src/lib/firebase.ts` starts `getAnalytics()` lazily and only resolves when
 * `isSupported()` is true (i.e. a real browser). This component awaits that
 * promise on mount so analytics is ready before any events would fire, and it
 * no-ops during SSR or when cookies/consent block it.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    let active = true
    void analytics
      .then((a) => {
        if (active && a) {
          // analytics is initialized; page_view is auto-logged by the SDK.
        }
      })
      .catch(() => {
        // Swallow — analytics must never break the page.
      })
    return () => {
      active = false
    }
  }, [])

  return null
}
