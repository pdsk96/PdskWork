'use client'

import { forwardRef, type CSSProperties, type ReactNode } from 'react'

export interface GlassPanelProps {
  /** Panel label rendered as an optional small heading. */
  label?: string
  /** Main panel content. */
  children?: ReactNode
  /** Accent token drives the glow + sheen color. */
  accent?: 'cyan' | 'magenta' | 'violet'
  /** Extra className for layout/spacing. */
  className?: string
  /** Inline style overrides (e.g. grid span). */
  style?: CSSProperties
  /** Render as a heading tag for the label (defaults to h3). */
  labelAs?: 'h2' | 'h3' | 'h4'
}

const ACCENTS = {
  cyan: { glow: 'rgba(0, 240, 255, 0.45)', sheen: 'rgba(0, 240, 255, 0.10)' },
  magenta: { glow: 'rgba(255, 43, 214, 0.42)', sheen: 'rgba(255, 43, 214, 0.10)' },
  violet: { glow: 'rgba(122, 92, 255, 0.45)', sheen: 'rgba(122, 92, 255, 0.10)' },
} as const

/**
 * Liquid-glass panel — frosted backdrop-blur surface with an accent glow
 * and a refractive top sheen. Self-contained styles (styled-jsx) so it is
 * fully additive and does not touch globals.css.
 */
const GlassPanel = forwardRef<HTMLElement, GlassPanelProps>(function GlassPanel(
  { label, children, accent = 'cyan', className, style, labelAs = 'h3' },
  ref,
) {
  const Label = labelAs
  const a = ACCENTS[accent]

  return (
    <section
      ref={ref}
      className={`glass-panel${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        // CSS custom props consumed by the styled-jsx block below.
        ['--gp-glow' as string]: a.glow,
        ['--gp-sheen' as string]: a.sheen,
      }}
    >
      <span className="glass-panel__sheen" aria-hidden="true" />
      <div className="glass-panel__content">
        {label ? <Label className="glass-panel__label">{label}</Label> : null}
        {children}
      </div>
      <style jsx>{`
        .glass-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 12px;
          padding: 22px;
          border-radius: 18px;
          border: 1px solid rgba(120, 200, 255, 0.22);
          background: rgba(16, 22, 40, 0.55);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          backdrop-filter: blur(18px) saturate(150%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04),
            0 18px 50px -24px var(--gp-glow),
            0 8px 30px -18px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          isolation: isolate;
        }
        .glass-panel__sheen {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(
            180deg,
            var(--gp-sheen) 0%,
            transparent 32%,
            transparent 68%,
            rgba(255, 43, 214, 0.04) 100%
          );
          pointer-events: none;
        }
        .glass-panel__content {
          position: relative;
          z-index: 1;
        }
        .glass-panel__label {
          margin: 0 0 6px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gp-glow);
        }
      `}</style>
    </section>
  )
})

export default GlassPanel
