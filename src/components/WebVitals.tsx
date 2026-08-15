'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * WebVitals — Core Web Vitals reporter.
 *
 * Uses Next.js `useReportWebVitals` to collect TTFB, FCP, LCP, FID, CLS, and
 * INP from real users. By default metrics are forwarded to the browser
 * console (dev) and an optional analytics endpoint when
 * `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` is configured.
 *
 * This is a separate client component so the client boundary is confined here
 * and the rest of the layout can stay server-rendered (per Next docs).
 */

const isDev = process.env.NODE_ENV !== 'production'
const ENDPOINT = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug(`[web-vitals] ${metric.name}`, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        rating: metric.rating,
        id: metric.id,
      })
    }

    // Forward to an analytics endpoint when configured (RUM).
    if (ENDPOINT && typeof navigator !== 'undefined') {
      const body = JSON.stringify(metric)
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(ENDPOINT, body)
        } else {
          void fetch(ENDPOINT, { body, method: 'POST', keepalive: true })
        }
      } catch {
        // Swallow — analytics must never break the page.
      }
    }
  })

  return null
}
