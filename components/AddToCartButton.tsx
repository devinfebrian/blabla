'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { trackAddToCart } from '@/lib/analytics'
import { addCartLine } from '@/lib/cart-store'
import type { ColorVariant } from '@/lib/types'

export function AddToCartButton({
  productSlug,
  productTitle,
  color,
  qty,
  disabled,
}: {
  productSlug: string
  productTitle: string
  color: ColorVariant
  qty: number
  disabled?: boolean
}) {
  const [added, setAdded] = useState(false)

  function add() {
    addCartLine({
      productSlug,
      productTitle,
      variantKey: color.key,
      variantName: color.name,
      hex: color.hex,
      sku: color.sku,
      qty,
      priceIdr: color.price,
      lineTotalIdr: color.price * qty,
      inStock: color.inStock,
    })
    setAdded(true)
    trackAddToCart(color.key, qty)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" size="lg" onClick={add} disabled={disabled}>
        Tambah ke keranjang <span aria-hidden>→</span>
      </Button>
      {added && (
        <p role="status" className="text-[0.6875rem] tracking-[0.015em] text-muted-foreground uppercase">
          Ditambahkan ke keranjang.{' '}
          <Link href="/cart" className="text-foreground underline">
            Lihat keranjang
          </Link>
        </p>
      )}
    </div>
  )
}
