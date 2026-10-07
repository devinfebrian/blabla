'use client'

import dynamic from 'next/dynamic'

import { useInView } from './useInView'

const HijabViewer = dynamic(() => import('./HijabViewer').then((module) => module.HijabViewer), {
  ssr: false,
})

function preloadModel(glbUrl: string) {
  void import('./HijabViewer')
    .then((module) => module.preloadModel(glbUrl))
    .catch(() => {})
}

function ViewerSkeleton() {
  return (
    <div
      data-testid="viewer-skeleton"
      className="flex aspect-square w-full items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900"
    >
      <span className="text-sm text-zinc-400">Memuat model 3D…</span>
    </div>
  )
}

export function HijabViewerIsland({
  glbUrl,
  fabricMaterialName,
  hex,
}: {
  glbUrl: string
  fabricMaterialName: string
  hex: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className="w-full"
      onPointerEnter={() => preloadModel(glbUrl)}
      onTouchStart={() => preloadModel(glbUrl)}
    >
      {inView ? (
        <HijabViewer glbUrl={glbUrl} fabricMaterialName={fabricMaterialName} hex={hex} />
      ) : (
        <ViewerSkeleton />
      )}
    </div>
  )
}
