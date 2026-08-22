'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

/**
 * AmbientSound — a lightweight cyberpunk ambient drone synthesized with the
 * Web Audio API (no external audio files). Two detuned oscillators + a slow
 * LFO on a low-pass filter create an evolving pad. Default is muted; the user
 * opts in. The AudioContext is created lazily on first enable (browsers block
 * autoplay), and resumed/suspended on toggle.
 *
 * Respects prefers-reduced-motion: when reduced, the LFO modulation depth is
 * zeroed so the drone is static (less sensory stimulation).
 */
export default function AmbientSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('pdsk-ambient') === '1'
  })
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ stop: () => void } | null>(null)
  const { dict } = useLocale()

  useEffect(() => {
    localStorage.setItem('pdsk-ambient', enabled ? '1' : '0')
  }, [enabled])

  useEffect(() => {
    return () => {
      nodesRef.current?.stop()
      void ctxRef.current?.close()
      ctxRef.current = null
      nodesRef.current = null
    }
  }, [])

  const build = (ctx: AudioContext) => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 700
    filter.Q.value = 4
    filter.connect(master)

    // Two detuned saw oscillators for a rich, evolving pad.
    const oscA = ctx.createOscillator()
    oscA.type = 'sawtooth'
    oscA.frequency.value = 55 // A1
    const oscB = ctx.createOscillator()
    oscB.type = 'sawtooth'
    oscB.frequency.value = 55
    oscB.detune.value = 7
    oscA.connect(filter)
    oscB.connect(filter)
    oscA.start()
    oscB.start()

    // Slow LFO on filter cutoff for movement (zeroed when reduced-motion).
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = reduce ? 0 : 350
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)
    lfo.start()

    // Fade in master gain.
    const now = ctx.currentTime
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(0.06, now + 1.5)

    return {
      stop: () => {
        const t = ctx.currentTime
        master.gain.cancelScheduledValues(t)
        master.gain.setValueAtTime(master.gain.value, t)
        master.gain.linearRampToValueAtTime(0, t + 0.4)
        try {
          oscA.stop(t + 0.5)
          oscB.stop(t + 0.5)
          lfo.stop(t + 0.5)
        } catch {
          // already stopped
        }
      },
    }
  }

  const toggle = async () => {
    if (!enabled) {
      let ctx = ctxRef.current
      if (!ctx) {
        ctx = new AudioContext()
        ctxRef.current = ctx
      }
      await ctx.resume()
      nodesRef.current = build(ctx)
      setEnabled(true)
    } else {
      nodesRef.current?.stop()
      nodesRef.current = null
      void ctxRef.current?.suspend()
      setEnabled(false)
    }
  }

  return (
    <button
      type="button"
      className="ambient-toggle"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? dict.ui.ambientOff : dict.ui.ambientOn}
      title={enabled ? dict.ui.ambientOff : dict.ui.ambientOn}
    >
      <span className="ambient-toggle__icon" aria-hidden="true">
        {enabled ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </span>
      {enabled && <span className="ambient-toggle__pulse" aria-hidden="true" />}
    </button>
  )
}
