/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'

import { BjorkButton } from '@/components/bjork-ui/primitives/button'
import { cn } from '@/lib/utils'

export type ProductRevealFeature = { title: string; subtitle: string }

interface ProductRevealCardProps {
  name: string
  price: string
  description: string
  image: string
  href: string
  features?: ProductRevealFeature[]
  onAdd?: () => void
  className?: string
}

// ACME-style editorial frame: 1px hairline border, 3px radius, no shadow and no
// hover-only reveal — the product image and name are the emotional payload.
export function ProductRevealCard({
  name,
  price,
  description,
  image,
  href,
  features = [],
  onAdd,
  className,
}: ProductRevealCardProps) {
  return (
    <div
      data-slot="product-reveal-card"
      className={cn(
        'group/card flex h-full flex-col overflow-hidden rounded-[3px] border border-border bg-card text-card-foreground',
        className,
      )}
    >
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-card"
        aria-label={`Lihat ${name}`}
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <Link href={href} className="block">
          <h3 className="text-[13px] leading-tight font-bold tracking-[0.015em] uppercase">
            {name}
          </h3>
        </Link>
        <p className="text-[0.75rem] font-medium tabular-nums">{price}</p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>

        {features.length > 0 && (
          <ul className="flex flex-wrap gap-1 pt-1">
            {features.map((feature) => (
              <li
                key={feature.title}
                title={feature.subtitle}
                className="rounded-[3px] border border-border px-2 py-0.5 text-[0.6875rem] tracking-[0.02em] uppercase"
              >
                {feature.title}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            href={href}
            className="inline-flex h-9 items-center gap-1 rounded-[3px] border border-foreground px-3 text-[0.7rem] font-medium tracking-[0.015em] uppercase transition-colors hover:bg-muted"
          >
            Lihat detail
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
