'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

/**
 * Subtle cyberpunk hero backdrop rendered with React Three Fiber.
 * A drifting wireframe icosahedron with additive glow. Static + dimmed
 * when the user prefers reduced motion.
 */
function DriftingMesh() {
  const ref = useRef<THREE.Mesh>(null)
  const reduceMotion = useReducedMotion()

  useFrame((_, delta) => {
    if (!ref.current || reduceMotion) return
    ref.current.rotation.x += delta * 0.15
    ref.current.rotation.y += delta * 0.2
  })

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshBasicMaterial
        color="#00f0ff"
        wireframe
        transparent
        opacity={reduceMotion ? 0.18 : 0.35}
      />
    </mesh>
  )
}

export default function HeroScene() {
  const camera = useMemo(() => ({ position: [0, 0, 5] as [number, number, number] }), [])
  return (
    <div className="hero-scene" aria-hidden="true">
      <Canvas camera={camera} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <DriftingMesh />
      </Canvas>
    </div>
  )
}
