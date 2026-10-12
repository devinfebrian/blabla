'use client'

import Image from 'next/image'
import { useState } from 'react'

export function ProductGallery({
  images,
  hex,
  alt,
}: {
  images: string[]
  hex: string
  alt: string
}) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-[3px] border border-border bg-card">
        {current ? (
          <Image
            src={current}
            alt={alt}
            fill
            priority
            sizes="(min-width: 768px) 42rem, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            data-testid="gallery-fallback"
            className="flex h-full w-full items-center justify-center"
          >
            <span
              className="h-16 w-16 rounded-[3px]"
              style={{ backgroundColor: hex }}
              aria-hidden
            />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                aria-label={`Lihat gambar ${index + 1}`}
                className={`relative block h-16 w-16 overflow-hidden rounded-[3px] border transition-colors ${
                  index === active ? 'border-foreground' : 'border-border hover:border-foreground/40'
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
