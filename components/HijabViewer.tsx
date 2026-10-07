'use client'

import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useState } from 'react'
import type { Mesh, MeshStandardMaterial } from 'three'

import { ViewerErrorBoundary } from './ViewerErrorBoundary'

type ViewerProps = {
  glbUrl: string
  fabricMaterialName: string
  hex: string
}

function Model({ glbUrl, fabricMaterialName, hex }: ViewerProps) {
  const { scene } = useGLTF(glbUrl)

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        if (material.name === fabricMaterialName) {
          ;(material as MeshStandardMaterial).color.set(hex)
        }
      }
    })
  }, [scene, fabricMaterialName, hex])

  return <primitive object={scene} />
}

export function HijabViewer({ glbUrl, fabricMaterialName, hex }: ViewerProps) {
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    useGLTF.clear(glbUrl)
    setAttempt((current) => current + 1)
  }, [glbUrl])

  return (
    <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
      <ViewerErrorBoundary onRetry={retry}>
        <Canvas key={attempt} camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 2]}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <Suspense fallback={null}>
            <Model glbUrl={glbUrl} fabricMaterialName={fabricMaterialName} hex={hex} />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={1.8} maxDistance={5} />
        </Canvas>
      </ViewerErrorBoundary>
    </div>
  )
}
