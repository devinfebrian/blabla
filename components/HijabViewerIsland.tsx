'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'

import { trackViewerInteract } from '@/lib/analytics'

const HijabViewer = dynamic(() => import('./HijabViewer').then((module) => module.HijabViewer), {
  ssr: false,
})

function preloadModel(glbUrl: string) {
  void import('./HijabViewer')
    .then((module) => module.preloadModel(glbUrl))
    .catch(() => {})
}

// three.js is ~253KB gzip. Loading it on arrival dominates mobile TBT, so the viewer
// only mounts on request. Hover/focus preloads the chunk so the tap feels instant, and
// swatch changes still count as interaction.
function ViewerPoster({ glbUrl, onOpen }: { glbUrl: string; onOpen: () => void }) {
  return (
    <div
      data-testid="viewer-poster"
      className="flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Lihat hijab dari segala sisi.</p>
      <button
        type="button"
        onClick={onOpen}
        onPointerEnter={() => preloadModel(glbUrl)}
        onFocus={() => preloadModel(glbUrl)}
        className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Lihat dalam 3D
      </button>
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
  const [opened, setOpened] = useState(false)

  const open = useCallback(() => {
    setOpened(true)
    trackViewerInteract()
  }, [])

  return (
    <div className="w-full">
      {opened ? (
        <HijabViewer glbUrl={glbUrl} fabricMaterialName={fabricMaterialName} hex={hex} />
      ) : (
        <ViewerPoster glbUrl={glbUrl} onOpen={open} />
      )}
    </div>
  )
}
