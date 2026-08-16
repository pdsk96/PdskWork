'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

/**
 * FullscreenToggle — enter/exit the browser fullscreen mode.
 *
 * Browsers block `requestFullscreen()` outside a user gesture, so "automatic"
 * fullscreen is impossible on load. This component offers two paths:
 *   1. A manual button (always available) that toggles fullscreen.
 *   2. When `autoOnFirstGesture` is true, it listens for the FIRST user
 *      pointerdown/keydown and requests fullscreen then — the earliest moment
 *      the browser allows it. This gives an "auto" feel while respecting the
 *      security rule. It only runs once.
 *
 * The icon reflects the current fullscreen state via the `fullscreenchange`
 * event. Refs hold the enter/exit handles so the gesture listener and the
 * button stay in sync without re-binding on every state change.
 */
export default function FullscreenToggle({
  autoOnFirstGesture = false,
}: {
  autoOnFirstGesture?: boolean
}) {
  const { dict } = useLocale()
  const [isFs, setIsFs] = useState(false)
  const [supported, setSupported] = useState(true)
  const enterRef = useRef<() => void>(() => {})
  const exitRef = useRef<() => void>(() => {})

  useEffect(() => {
    const el = document.documentElement
    const req =
      el.requestFullscreen?.bind(el) ??
      (el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.bind(el)
    const exitFn =
      document.exitFullscreen?.bind(document) ??
      (document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen?.bind(document)
    if (!req || !exitFn) {
      setSupported(false)
      return
    }

    enterRef.current = () => {
      void req().catch(() => {})
    }
    exitRef.current = () => {
      void exitFn().catch(() => {})
    }

    const onChange = () => {
      setIsFs(
        Boolean(
          document.fullscreenElement ??
            (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement,
        ),
      )
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    setIsFs(Boolean(document.fullscreenElement))

    let done = false
    const onFirstGesture = () => {
      if (done) return
      done = true
      enterRef.current()
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
    if (autoOnFirstGesture) {
      window.addEventListener('pointerdown', onFirstGesture)
      window.addEventListener('keydown', onFirstGesture)
    }

    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
      if (autoOnFirstGesture) {
        window.removeEventListener('pointerdown', onFirstGesture)
        window.removeEventListener('keydown', onFirstGesture)
      }
    }
  }, [autoOnFirstGesture])

  const toggle = useCallback(() => {
    if (isFs) exitRef.current()
    else enterRef.current()
  }, [isFs])

  if (!supported) return null

  return (
    <button
      type="button"
      className="nav-icon-btn"
      onClick={toggle}
      aria-label={isFs ? dict.ui.fullscreenExit : dict.ui.fullscreenEnter}
      title={isFs ? dict.ui.fullscreenExit : dict.ui.fullscreenEnter}
    >
      {isFs ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
        </svg>
      )}
    </button>
  )
}

