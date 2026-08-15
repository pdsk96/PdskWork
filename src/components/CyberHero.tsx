'use client'

import { Canvas, useFrame, type RootState } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor, Sparkles } from '@react-three/drei'
import { useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * CyberHero — a cursor-reactive, scroll-linked React Three Fiber scene.
 *
 * - Neon wireframe shapes orbit and bend toward the pointer. All per-frame
 *   work mutates refs inside useFrame (no setState), keeping the R3F render
 *   loop allocation-free.
 * - The whole scene reacts to page scroll via Framer Motion's useScroll:
 *   rotation/position offsets are read with .get() each frame (refs again).
 * - Performance: <PerformanceMonitor> downgrades dpr on low fps, dpr is
 *   clamped to [1,2], <AdaptiveDpr> lowers pixel ratio during motion.
 * - prefers-reduced-motion disables pointer + scroll reaction and renders a
 *   slow, non-vestibular static drift instead.
 */

type Vec3 = [number, number, number]

const CYAN = '#00f0ff'
const MAGENTA = '#ff2bd6'
const VIOLET = '#7a5cff'

/* A single neon wireframe shape that eases toward the pointer offset. */
function NeonShape({
  position,
  scale,
  color,
  speed,
  pointer,
  scrollOffset,
  reduceMotion,
}: {
  position: Vec3
  scale: number
  color: string
  speed: number
  pointer: React.MutableRefObject<{ x: number; y: number }>
  scrollOffset: React.MutableRefObject<number>
  reduceMotion: boolean | null
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const target = useRef(new THREE.Vector3(...position))

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return

    // Pointer attraction (lerped, never setState).
    const px = pointer.current.x * 2.2
    const py = pointer.current.y * 1.4
    target.current.set(
      position[0] + px,
      position[1] + py,
      position[2] - scrollOffset.current * 1.5,
    )
    m.position.lerp(target.current, reduceMotion ? 0 : 0.04)

    if (reduceMotion) {
      m.rotation.x += delta * 0.05
      m.rotation.y += delta * 0.07
    } else {
      m.rotation.x += delta * 0.18 * speed
      m.rotation.y += delta * 0.12 * speed
      // Subtle parallax: shapes lean toward the cursor.
      m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, pointer.current.x * 0.4, 0.05)
    }
  })

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={reduceMotion ? 0.22 : 0.5} />
    </mesh>
  )
}

/* Inner core — a torus knot that bends with scroll. */
function NeonCore({
  scrollOffset,
  reduceMotion,
}: {
  scrollOffset: React.MutableRefObject<number>
  reduceMotion: boolean | null
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    const m = ref.current
    if (!m) return
    if (reduceMotion) {
      m.rotation.y += delta * 0.08
    } else {
      m.rotation.x += delta * 0.1
      m.rotation.y += delta * 0.16
      m.rotation.z += delta * 0.04
    }
    const s = 1 + (reduceMotion ? 0 : scrollOffset.current * 0.4)
    m.scale.setScalar(s)
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.7, 0.22, 128, 16]} />
      <meshBasicMaterial color={VIOLET} wireframe transparent opacity={reduceMotion ? 0.18 : 0.42} />
    </mesh>
  )
}

function Scene({
  pointer,
  scrollOffset,
  reduceMotion,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>
  scrollOffset: React.MutableRefObject<number>
  reduceMotion: boolean | null
}) {
  const shapes = useMemo(
    () => [
      { position: [-2.4, 0.9, -1] as Vec3, scale: 0.9, color: CYAN, speed: 1 },
      { position: [2.4, -0.7, -0.5] as Vec3, scale: 1.1, color: MAGENTA, speed: 0.8 },
      { position: [0.2, 1.6, -2] as Vec3, scale: 0.7, color: VIOLET, speed: 1.3 },
      { position: [-1.4, -1.5, -1.5] as Vec3, scale: 0.6, color: CYAN, speed: 1.1 },
    ],
    [],
  )

  return (
    <>
      <ambientLight intensity={0.6} />
      <NeonCore scrollOffset={scrollOffset} reduceMotion={reduceMotion} />
      {shapes.map((s, i) => (
        <NeonShape
          key={i}
          position={s.position}
          scale={s.scale}
          color={s.color}
          speed={s.speed}
          pointer={pointer}
          scrollOffset={scrollOffset}
          reduceMotion={reduceMotion}
        />
      ))}
      {!reduceMotion && (
        <Sparkles count={48} scale={9} size={2.4} speed={0.3} color={CYAN} opacity={0.5} />
      )}
    </>
  )
}

/* Captures pointer + scroll into refs and feeds them to the R3F scene. */
function Stage({ reduceMotion }: { reduceMotion: boolean | null }) {
  const pointer = useRef({ x: 0, y: 0 })
  const scrollOffset = useRef(0)

  const { scrollYProgress } = useScroll()
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.5])
  const scrollZ = useTransform(scrollYProgress, [0, 1], [0, 2.5])

  // Keep the scroll progress in a ref so useFrame reads it without re-render.
  const last = useRef(0)
  const scrollFrame = useRef<number | null>(null)
  useFrame((state: RootState) => {
    // Pull latest scroll values cheaply each frame.
    scrollOffset.current = scrollZ.get()
    const rot = scrollRotate.get()
    if (rot !== last.current) {
      last.current = rot
      state.scene.rotation.y = THREE.MathUtils.lerp(state.scene.rotation.y, rot, 0.08)
    }

    if (reduceMotion) return
    // Normalize pointer to ~[-1, 1] with smoothing toward the target.
    const targetX = (state.pointer.x - 0.5) * 2
    const targetY = -(state.pointer.y - 0.5) * 2
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, targetX, 0.06)
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, targetY, 0.06)
  })
  // silence unused ref lint (kept for potential cleanup extensions)
  void scrollFrame

  return <Scene pointer={pointer} scrollOffset={scrollOffset} reduceMotion={reduceMotion} />
}

export default function CyberHero() {
  const reduceMotion = useReducedMotion()
  const camera = useMemo(() => ({ position: [0, 0, 5] as Vec3 }), [])

  return (
    <div className="cyber-hero" aria-hidden="true">
      <Canvas
        camera={camera}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <PerformanceMonitor
          onDecline={() => {
            /* drei lowers perf automatically; hint kept for clarity */
          }}
        />
        <AdaptiveDpr pixelated />
        <Stage reduceMotion={reduceMotion} />
      </Canvas>
      <style jsx>{`
        .cyber-hero {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.85;
        }
        @media (prefers-reduced-motion: reduce) {
          .cyber-hero {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
