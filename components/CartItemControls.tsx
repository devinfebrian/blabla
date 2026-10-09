'use client'

import { removeCartLine, setCartQty } from '@/lib/cart-store'

const STEP =
  'inline-flex h-9 w-9 items-center justify-center text-lg leading-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800'

export function CartItemControls({
  productSlug,
  variantKey,
  qty,
}: {
  productSlug: string
  variantKey: string
  qty: number
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
        <button
          type="button"
          aria-label="Kurangi jumlah"
          onClick={() => setCartQty(productSlug, variantKey, qty - 1)}
          className={STEP}
        >
          −
        </button>
        <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
        <button
          type="button"
          aria-label="Tambah jumlah"
          onClick={() => setCartQty(productSlug, variantKey, qty + 1)}
          className={STEP}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => removeCartLine(productSlug, variantKey)}
        className="text-sm text-zinc-500 underline transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        Hapus
      </button>
    </div>
  )
}
