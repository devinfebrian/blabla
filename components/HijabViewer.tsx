'use client'

import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useState } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { ViewerErrorBoundary } from './ViewerErrorBoundary'

type ViewerProps = {
  glbUrl: string
  fabricMaterialName: string
  hex: string
}

function Model({ glbUrl, fabricMaterialName, hex }: ViewerProps) {
  const gltf = useLoader(GLTFLoader, glbUrl)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    gltf.scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        if (material.name === fabricMaterialName) {
          ;(material as MeshStandardMaterial).color.set(hex)
        }
      }
    })

    invalidate()
  }, [gltf, fabricMaterialName, hex, invalidate])

  return <primitive object={gltf.scene} />
}

function Controls() {
  const camera = useThree((state) => state.camera)
  const renderer = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minDistance = 1.8
    controls.maxDistance = 5

    const onChange = () => invalidate()
    controls.addEventListener('change', onChange)

    return () => {
      controls.removeEventListener('change', onChange)
      controls.dispose()
    }
  }, [camera, renderer, invalidate])

  return null
}

export function preloadModel(url: string) {
  void useLoader.preload(GLTFLoader, url)
}

export function HijabViewer({ glbUrl, fabricMaterialName, hex }: ViewerProps) {
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    useLoader.clear(GLTFLoader, glbUrl)
    setAttempt((current) => current + 1)
  }, [glbUrl])

  return (
    <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
      <ViewerErrorBoundary onRetry={retry}>
        <Canvas
          key={attempt}
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [0, 0, 3.2], fov: 40 }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <Suspense fallback={null}>
            <Model glbUrl={glbUrl} fabricMaterialName={fabricMaterialName} hex={hex} />
          </Suspense>
          <Controls />
        </Canvas>
      </ViewerErrorBoundary>
    </div>
  )
}
