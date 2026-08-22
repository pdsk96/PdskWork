'use client'

import { useEffect, useState } from 'react'

/**
 * ReadingProgress — a thin neon progress bar fixed to the top of the viewport
 * that reflects how far the user has scrolled through the page. Encourages
 * engagement on long content. Respects prefers-reduced-motion (the bar still
 * updates, but transitions are disabled globally in globals.css).
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const height = el.scrollHeight - el.clientHeight
      setProgress(height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="reading-progress" aria-hidden="true">
      <div
        className="reading-progress__bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}
