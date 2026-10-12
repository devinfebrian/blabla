'use client'

import { useMemo, useState } from 'react'

import { ProductRevealCard } from '@/components/bjork-ui/cards/product-reveal-card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trackAddToCart } from '@/lib/analytics'
import { addCartLine } from '@/lib/cart-store'
import { cn } from '@/lib/utils'

export type CatalogueItem = {
  id: string
  title: string
  colorName: string
  price: string
  priceValue: number
  description: string
  image: string
  href: string
  features: { title: string; subtitle: string }[]
  orderable?: {
    productSlug: string
    variantKey: string
    variantName: string
    hex: string
    sku?: string
    priceIdr: number
  }
}

const SORTS = [
  { key: 'featured', label: 'Rekomendasi' },
  { key: 'price-asc', label: 'Harga: rendah ke tinggi' },
  { key: 'price-desc', label: 'Harga: tinggi ke rendah' },
  { key: 'name', label: 'Nama: A–Z' },
] as const

type SortKey = (typeof SORTS)[number]['key']

const pill = (active: boolean) =>
  cn(
    'rounded-[3px] border px-3 py-1 text-[0.6875rem] tracking-[0.015em] uppercase transition-colors',
    active
      ? 'border-foreground bg-foreground text-primary-foreground'
      : 'border-border text-foreground hover:border-foreground',
  )

export function CatalogueGrid({ items }: { items: CatalogueItem[] }) {
  const [sort, setSort] = useState<SortKey>('featured')
  const [color, setColor] = useState<string>('all')

  const colors = useMemo(() => [...new Set(items.map((item) => item.colorName))], [items])

  const visible = useMemo(() => {
    const filtered = color === 'all' ? items : items.filter((item) => item.colorName === color)
    const sorted = [...filtered]

    if (sort === 'price-asc') sorted.sort((a, b) => a.priceValue - b.priceValue)
    if (sort === 'price-desc') sorted.sort((a, b) => b.priceValue - a.priceValue)
    if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title))

    return sorted
  }, [items, color, sort])

  const activeSort = SORTS.find((option) => option.key === sort)?.label ?? 'Rekomendasi'

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-y border-border py-3">
        <p className="text-[0.6875rem] tracking-[0.015em] uppercase tabular-nums">
          [{visible.length}]
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-[0.6875rem] tracking-[0.015em] uppercase underline-offset-4 outline-none hover:underline">
            {activeSort}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORTS.map((option) => (
              <DropdownMenuItem key={option.key} onSelect={() => setSort(option.key)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className="flex flex-wrap gap-2 py-4">
        <li>
          <button type="button" aria-pressed={color === 'all'} onClick={() => setColor('all')} className={pill(color === 'all')}>
            Semua
          </button>
        </li>
        {colors.map((name) => (
          <li key={name}>
            <button
              type="button"
              aria-pressed={color === name}
              onClick={() => setColor(name)}
              className={pill(color === name)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-2 gap-[3px] md:grid-cols-3 lg:grid-cols-4">
        {visible.map((item) => {
          const orderable = item.orderable

          return (
            <li key={item.id}>
              <ProductRevealCard
                name={item.title}
                price={item.price}
                description={item.description}
                image={item.image}
                href={item.href}
                features={item.features}
                onAdd={
                  orderable
                    ? () => {
                        addCartLine({
                          productSlug: orderable.productSlug,
                          productTitle: item.title,
                          variantKey: orderable.variantKey,
                          variantName: orderable.variantName,
                          hex: orderable.hex,
                          sku: orderable.sku,
                          qty: 1,
                          priceIdr: orderable.priceIdr,
                          lineTotalIdr: orderable.priceIdr,
                          inStock: true,
                        })
                        trackAddToCart(orderable.variantKey, 1)
                      }
                    : undefined
                }
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
