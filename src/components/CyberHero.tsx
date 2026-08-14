'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Float, PerformanceMonitor, Sparkles } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import * as THREE from 'three'

/**
 * CyberHero — cursor-reactive 3D hero scene (R3F).
 *
 * A wireframe icosahedron core, a translucent inner shell, and a particle
 * field react to:
 *   - pointer position (parallax look-at),
 *   - page scroll (drift / zoom via framer-motion useScroll),
 *   - device framerate (drei PerformanceMonitor drops dpr; AdaptiveDpr
 *     regresses pixel ratio under load).
 *
 * Under `prefers-reduced-motion` the canvas renders a single static frame
 * (frameloop="demand"), no pointer/scroll motion, and dimmed materials.
 */

const CYAN = '#00f0ff'
const MAGENTA = '#ff2bd6'
const VIOLET = '#7a5cff'

function usePointerNormalized() {
  const target = useRef(new THREE.Vector2(0, 0))
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (e.pointerType === 'touch') return
      // Normalize to [-1, 1] with y inverted (screen down = negative).
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      )
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return target
}

/** Probe once for WebGL support so the canvas can degrade gracefully. */
function useSupportsWebGL() {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => {
    let ok = false
    try {
      const canvas = document.createElement('canvas')
      ok = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      ok = false
    }
    setSupported(ok)
  }, [])
  return supported
}

function HeroGroup({
  reduceMotion,
  scrollProgress,
}: {
  reduceMotion: boolean | null
  scrollProgress: ReturnType<typeof useSpring>
}) {
  const coreRef = useRef<THREE.Mesh>(null)
  const shellRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const pointer = usePointerNormalized()
  const { viewport } = useThree()

  // Scroll progress (0..1) -> spatial transforms. Disabled under reduced motion.
  const groupY = useTransform(scrollProgress, [0, 1], [0, reduceMotion ? 0 : -1.4])
  const groupZ = useTransform(scrollProgress, [0, 1], [0, reduceMotion ? 0 : 1.8])
  const coreSpin = useTransform(scrollProgress, [0, 1], [0, reduceMotion ? 0 : Math.PI * 0.6])

  // Smoothed pointer parallax.
  const look = useRef(new THREE.Vector2(0, 0))

  useFrame((_, delta) => {
    if (reduceMotion) return
    const d = Math.min(delta, 0.05)

    // Ease the parallax target for a liquid feel.
    look.current.lerp(pointer.current, 1 - Math.pow(0.001, d))

    if (groupRef.current) {
      // Keep the latest scroll-driven transforms in sync with the group.
      groupRef.current.position.y = groupY.get()
      groupRef.current.position.z = groupZ.get()
      // Parallax tilt toward the pointer.
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        look.current.y * 0.25,
        0.1,
      )
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        look.current.x * 0.35,
        0.1,
      )
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += d * 0.3
      coreRef.current.rotation.x += d * 0.12
      coreRef.current.rotation.z = coreSpin.get()
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= d * 0.18
      shellRef.current.rotation.z -= d * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Float
        enabled={!reduceMotion}
        speed={1.4}
        rotationIntensity={0.25}
        floatIntensity={0.6}
        floatingRange={[-0.12, 0.12]}
      >
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.85} />
        </mesh>
        <mesh ref={shellRef} scale={1.42}>
          <icosahedronGeometry args={[1.25, 0]} />
          <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.28} />
        </mesh>
      </Float>

      <Sparkles
        count={reduceMotion ? 40 : 90}
        scale={[viewport.width * 1.6, viewport.height * 1.6, 4]}
        size={2.4}
        speed={reduceMotion ? 0 : 0.4}
        opacity={0.7}
        color={MAGENTA}
      />
    </group>
  )
}

export default function CyberHero() {
  const reduceMotion = useReducedMotion()
  const webgl = useSupportsWebGL()
  const [dpr, setDpr] = useState<[number, number]>([1, 2])

  const { scrollYProgress } = useScroll()
  const scrollSpring = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  })

  const camera = useMemo(() => ({ position: [0, 0, 5] as [number, number, number] }), [])
  const frameloop = reduceMotion ? ('demand' as const) : ('always' as const)

  return (
    <div className="cyber-hero" aria-hidden="true">
      {webgl ? (
        <Canvas
          camera={camera}
          dpr={dpr}
          frameloop={frameloop}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr([1, 1.25])}
            onIncline={() => setDpr([1, 2])}
            flipflops={3}
          >
            <HeroGroup reduceMotion={reduceMotion} scrollProgress={scrollSpring} />
            <AdaptiveDpr pixelated={false} />
          </PerformanceMonitor>
        </Canvas>
      ) : null}
    </div>
  )
}
