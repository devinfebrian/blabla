'use client'

import Link from 'next/link'

import { CartItemControls } from '@/components/CartItemControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/PageShell'
import { Separator } from '@/components/ui/separator'
import { lineKey, summarize } from '@/lib/cart-core'
import { useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/price'

export default function CartPage() {
  const cart = summarize(useCart())

  return (
    <PageShell>
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-h1 font-bold tracking-[-0.27px] uppercase">Keranjang</h1>
        <Link
          href="/products"
          className="text-[0.6875rem] tracking-[0.015em] uppercase underline underline-offset-4"
        >
          Lanjut belanja
        </Link>
      </header>

      {cart.lines.length === 0 ? (
        <p data-testid="cart-empty" className="text-xs text-muted-foreground">
          Keranjang masih kosong.
        </p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border">
            {cart.lines.map((line) => (
              <li key={lineKey(line)} className="flex items-start justify-between gap-4 py-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[13px] font-bold tracking-[0.015em] uppercase">
                      {line.productTitle}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-4 w-4 rounded-[3px] border border-border"
                        style={{ backgroundColor: line.hex }}
                        aria-hidden
                      />
                      {line.variantName}
                      {!line.inStock && <Badge variant="destructive">Stok habis</Badge>}
                    </p>
                  </div>
                  <CartItemControls
                    productSlug={line.productSlug}
                    variantKey={line.variantKey}
                    qty={line.qty}
                  />
                </div>
                <p className="text-[13px] font-medium tabular-nums">
                  {formatPrice(line.lineTotalIdr, 'IDR')}
                </p>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] tracking-[0.015em] uppercase">Subtotal</span>
            <span data-testid="cart-subtotal" className="text-h3 font-bold tabular-nums">
              {formatPrice(cart.subtotalIdr, 'IDR')}
            </span>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">Lanjut ke checkout</Link>
          </Button>
        </>
      )}
    </PageShell>
  )
}
