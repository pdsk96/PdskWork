'use client'

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { logger } from '@/lib/logger'

/**
 * CyberBackground — full-bleed R3F backdrop.
 *
 * A single screen-aligned plane runs a fragment shader that composites:
 *   - FBM (fractal Brownian motion) noise for a drifting nebula/plasma field
 *   - a fresnel-style rim glow that brightens toward the screen edges
 * All animation mutates a uniform (`uTime`) via ref inside useFrame — never
 * setState — so the render loop stays allocation-free.
 *
 * prefers-reduced-motion: the clock stops advancing (uTime frozen) and the
 * canvas dims, eliminating vestibular motion while keeping a static field.
 */

/* ---- ShaderMaterial (drei) ----
 * declare + extend so we can render <fbmFresnelMaterial ref=... /> as JSX.
 */
const FbmFresnelMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#0a0d18'), // deep base
    uColorB: new THREE.Color('#00f0ff'), // cyan plasma
    uColorC: new THREE.Color('#7a5cff'), // violet rim
    uColorD: new THREE.Color('#ff2bd6'), // magenta sparks
    uResolution: new THREE.Vector2(1, 1),
  },
  /* glsl vertex */ /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl fragment */ /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform vec3 uColorD;
    uniform vec2 uResolution;

    // hash + value noise
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // fractal Brownian motion
    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++) {
        v += amp * vnoise(p);
        p = m * p;
        amp *= 0.5;
      }
      return v;
    }

    void main() {
      // aspect-correct coordinates centered at origin
      vec2 uv = vUv;
      vec2 p = (uv - 0.5);
      p.x *= uResolution.x / max(uResolution.y, 1.0);

      // slow drifting fbm plasma field
      float t = uTime * 0.08;
      float n = fbm(p * 2.2 + vec2(t, -t * 0.6));
      float n2 = fbm(p * 4.0 - vec2(t * 0.4, t));

      // fresnel-style rim: brighter toward edges (distance from center)
      float rim = smoothstep(0.0, 0.85, length(p));
      float glow = pow(rim, 2.0);

      // layer plasma + sparks
      vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.75, n));
      col = mix(col, uColorC, smoothstep(0.45, 0.9, n2) * 0.6);
      col += uColorD * smoothstep(0.7, 1.0, n2) * 0.25;
      col += uColorC * glow * 0.35;
      col += uColorB * glow * 0.25;

      // vignette to seat content above
      float vig = smoothstep(1.25, 0.35, length(p));
      col *= 0.55 + 0.45 * vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
)

// Register the material as a JSX element <fbmFresnelMaterial />.
extend({ FbmFresnelMaterial })

// Helpful typing for the extended element ref.
type FbmFresnelMaterialImpl = THREE.ShaderMaterial & {
  uTime: number
  uResolution: THREE.Vector2
  uColorA: THREE.Color
  uColorB: THREE.Color
  uColorC: THREE.Color
  uColorD: THREE.Color
}

/* eslint-disable @typescript-eslint/no-namespace */
declare module '@react-three/fiber' {
  interface ThreeElements {
    fbmFresnelMaterial: ThreeElements['shaderMaterial'] & {
      uTime?: number
      uResolution?: THREE.Vector2
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

function ShaderPlane({ reduceMotion }: { reduceMotion: boolean | null }) {
  const materialRef = useRef<FbmFresnelMaterialImpl>(null)
  const { size } = useThree()

  useFrame((_, delta) => {
    const m = materialRef.current
    if (!m) return
    if (!reduceMotion) m.uTime += delta
    if (m.uResolution) m.uResolution.set(size.width, size.height)
  })

  // The plane fills the viewport at z=0; camera at default distance.
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <fbmFresnelMaterial ref={materialRef} />
    </mesh>
  )
}

export default function CyberBackground() {
  const reduceMotion = useReducedMotion()
  const [glSupported, setGlSupported] = useState<boolean | null>(null)
  const camera = useMemo(() => ({ position: [0, 0, 1] as [number, number, number] }), [])

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      const supported = !!gl
      logger.debug('[cyber-bg] WebGL supported:', supported)
      setGlSupported(supported)
    } catch (err) {
      logger.warn('[cyber-bg] WebGL probe failed:', err)
      setGlSupported(false)
    }
  }, [])

  return (
    <div className="cyber-bg" aria-hidden="true" data-reduce={reduceMotion ? 'on' : 'off'}>
      {glSupported === true && (
        <Canvas
          camera={camera}
          dpr={[1, 1.75]}
          gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
        >
          <ShaderPlane reduceMotion={reduceMotion} />
        </Canvas>
      )}
      <style jsx>{`
        .cyber-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .cyber-bg[data-reduce='on'] {
          opacity: 0.4;
          filter: saturate(0.7);
        }
      `}</style>
    </div>
  )
}
