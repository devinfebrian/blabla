'use client'

import { removeCartLine, setCartQty } from '@/lib/cart-store'

const STEP =
  'inline-flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors hover:bg-muted'

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
      <div className="flex items-center rounded-[3px] border border-border">
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
        className="text-[0.6875rem] tracking-[0.015em] text-muted-foreground uppercase underline transition-colors hover:text-foreground"
      >
        Hapus
      </button>
    </div>
  )
}
