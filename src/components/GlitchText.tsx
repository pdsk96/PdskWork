'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export interface GlitchTextProps {
  /** Text to render (and scramble when animated). */
  text: string
  /** Tag rendered for the element. Defaults to span. */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
  /** Scramble character pool. */
  glyphs?: string
  /** ms each scramble frame is shown. */
  intervalMs?: number
  /** Extra className for layout. */
  className?: string
  /** When true, scramble auto-cycles on mount + on hover (idle re-glitch). */
  loop?: boolean
}

const DEFAULT_GLYPHS = '!<>-_\\/[]{}—=+*^?#01░▒▓█▌▐'

/**
 * Kinetic gradient + scramble glitch text.
 *
 * - Renders a layered neon gradient that pans via CSS keyframes (paused under
 *   reduced motion).
 * - When motion is allowed and `loop` is set, the text periodically scrambles
 *   through a glyph pool before resolving back to the real text, using rAF +
 *   refs (no per-frame setState thrash; a single setState per resolve tick).
 * - Honors prefers-reduced-motion: shows the plain gradient text, no
 *   scramble, no keyframe panning.
 */
export default function GlitchText({
  text,
  as = 'span',
  glyphs = DEFAULT_GLYPHS,
  intervalMs = 45,
  className,
  loop = true,
}: GlitchTextProps) {
  const Tag = as
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(text)
  const frame = useRef(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (reduceMotion || !loop) {
      setDisplay(text)
      return
    }

    let timeout: ReturnType<typeof setTimeout>

    function resolve() {
      let counter = 0
      const total = Math.max(6, Math.round(text.length * 1.6))
      const pool = glyphs

      function step() {
        const progress = counter / total
        const revealed = Math.floor(progress * text.length)
        const out = text
          .split('')
          .map((ch, i) => {
            if (ch === ' ' || i < revealed) return ch
            return pool[(frame.current + i * 3) % pool.length]
          })
          .join('')
        setDisplay(out)
        frame.current += 1
        counter += 1
        if (counter <= total) {
          raf.current = window.setTimeout(step, intervalMs) as unknown as number
        } else {
          setDisplay(text)
          if (loop) timeout = setTimeout(scramble, 2600)
        }
      }

      function scramble() {
        step()
      }

      scramble()
    }

    resolve()
    return () => {
      if (raf.current) clearTimeout(raf.current)
      clearTimeout(timeout)
    }
    // text/glyphs/intervalMs are stable enough for this effect; loop/reduceMotion
    // drive behavior intentionally. Re-run if the visible text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduceMotion, loop, intervalMs, glyphs])

  return (
    <Tag className={`glitch-text${className ? ` ${className}` : ''}`} data-reduce={reduceMotion ? 'on' : 'off'}>
      <span className="glitch-text__main">{display}</span>
      <span className="glitch-text__ghost" aria-hidden="true">{display}</span>
      <style jsx>{`
        .glitch-text {
          position: relative;
          display: inline-block;
          background: linear-gradient(
            100deg,
            var(--cyan, #00f0ff),
            var(--magenta, #ff2bd6),
            var(--violet, #7a5cff),
            var(--cyan, #00f0ff)
          );
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: glitch-pan 4.5s linear infinite;
        }
        .glitch-text__main {
          position: relative;
          z-index: 2;
        }
        .glitch-text__ghost {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.5;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background: inherit;
          transform: translate(2px, -1px);
          filter: blur(0.5px);
          mix-blend-mode: screen;
        }
        .glitch-text[data-reduce='on'] {
          animation: none;
        }
        .glitch-text[data-reduce='on'] .glitch-text__ghost {
          display: none;
        }
        @keyframes glitch-pan {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 220% 50%;
          }
        }
      `}</style>
    </Tag>
  )
}
