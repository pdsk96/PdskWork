/**
 * PdskLogo — typographic wordmark for PdskWork.
 *
 * A neon cyberpunk wordmark: "Pdsk" in cyan with a glow, "Work" in magenta,
 * separated by a small animated pulse dot. Pure SVG so it scales crisply at
 * any size (navbar, footer, favicon). Inherits currentColor for the base and
 * uses the theme's --cyan/--magenta for the accent split.
 *
 * Pass `size` to scale; the viewBox keeps proportions (240×56).
 */
export interface PdskLogoProps {
  /** Pixel height. Width scales with the viewBox aspect. */
  size?: number
  className?: string
  /** Show the pulse dot + subtle animation. */
  animated?: boolean
}

export default function PdskLogo({ size = 28, className, animated = true }: PdskLogoProps) {
  const w = size * (240 / 56)
  return (
    <svg
      className={className ? `pdsksvg ${className}` : 'pdsksvg'}
      width={w}
      height={size}
      viewBox="0 0 240 56"
      role="img"
      aria-label="PdskWork"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pdsk-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#7a5cff" />
        </linearGradient>
        <linearGradient id="work-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2bd6" />
          <stop offset="100%" stopColor="#7a5cff" />
        </linearGradient>
        <filter id="pdsk-glow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* "Pdsk" — cyan/violet, glowing */}
      <text
        x="2"
        y="42"
        fontFamily="'Segoe UI', 'SF Pro Display', system-ui, sans-serif"
        fontSize="38"
        fontWeight="800"
        letterSpacing="-1.5"
        fill="url(#pdsk-grad)"
        filter="url(#pdsk-glow)"
      >
        Pdsk
      </text>

      {/* pulse dot */}
      <circle cx="116" cy="28" r="4" fill="#00f0ff" filter="url(#pdsk-glow)">
        {animated ? (
          <animate
            attributeName="opacity"
            values="1;0.35;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        ) : null}
        {animated ? (
          <animate
            attributeName="r"
            values="4;2.6;4"
            dur="2.4s"
            repeatCount="indefinite"
          />
        ) : null}
      </circle>

      {/* "Work" — magenta/violet */}
      <text
        x="130"
        y="42"
        fontFamily="'Segoe UI', 'SF Pro Display', system-ui, sans-serif"
        fontSize="38"
        fontWeight="800"
        letterSpacing="-1.5"
        fill="url(#work-grad)"
        filter="url(#pdsk-glow)"
      >
        Work
      </text>
    </svg>
  )
}
