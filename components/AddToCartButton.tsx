'use client'

import Link from 'next/link'
import { useState } from 'react'

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
      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:bg-zinc-600"
      >
        Tambah ke keranjang
      </button>
      {added && (
        <p role="status" className="text-sm text-green-700 dark:text-green-500">
          Ditambahkan ke keranjang.{' '}
          <Link href="/cart" className="underline">
            Lihat keranjang
          </Link>
        </p>
      )}
    </div>
  )
}
