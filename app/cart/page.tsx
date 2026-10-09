'use client'

import Link from 'next/link'

import { CartItemControls } from '@/components/CartItemControls'
import { lineKey, summarize } from '@/lib/cart-core'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/price'

export default function CartPage() {
  const cart = summarize(useCart())

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Keranjang</h1>
          <Link href="/products" className="text-sm underline">
            Lanjut belanja
          </Link>
        </header>

        {cart.lines.length === 0 ? (
          <p data-testid="cart-empty" className="text-zinc-600 dark:text-zinc-400">
            Keranjang masih kosong.
          </p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.lines.map((line) => (
                <li key={lineKey(line)} className="flex items-start justify-between gap-4 py-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-medium">{line.productTitle}</p>
                      <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700"
                          style={{ backgroundColor: line.hex }}
                          aria-hidden
                        />
                        {line.variantName}
                        {line.inStock ? '' : ' — stok habis'}
                      </p>
                    </div>
                    <CartItemControls
                      productSlug={line.productSlug}
                      variantKey={line.variantKey}
                      qty={line.qty}
                    />
                  </div>
                  <p className="font-medium tabular-nums">{formatPrice(line.lineTotalIdr, 'IDR')}</p>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="font-medium">Subtotal</span>
              <span data-testid="cart-subtotal" className="text-lg font-semibold tabular-nums">
                {formatPrice(cart.subtotalIdr, 'IDR')}
              </span>
            </div>

            <Link
              href="/checkout"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Lanjut ke checkout
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
