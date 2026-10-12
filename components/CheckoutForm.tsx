'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'

import { checkoutAction } from '@/app/actions/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { trackBeginCheckout, trackOrderCreated } from '@/lib/analytics'
import { lineKey, summarize } from '@/lib/cart-core'
import { clearCart, useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/price'

export function CheckoutForm() {
  const lines = useCart()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const cart = summarize(lines)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const data = new FormData(event.currentTarget)
    setError(null)
    trackBeginCheckout()

    startTransition(async () => {
      const result = await checkoutAction({
        customer: {
          name: data.get('name'),
          phone: data.get('phone'),
          email: data.get('email'),
          address: data.get('address'),
        },
        lines: lines.map(({ productSlug, variantKey, qty }) => ({ productSlug, variantKey, qty })),
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      clearCart()
      trackOrderCreated()
      router.push(`/orders/${result.orderNumber}`)
    })
  }

  if (cart.lines.length === 0) {
    return (
      <p data-testid="checkout-empty" className="text-xs text-muted-foreground">
        Keranjang masih kosong.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-2 text-xs">
        {cart.lines.map((line) => (
          <li key={lineKey(line)} className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              {line.productTitle} — {line.variantName} × {line.qty}
            </span>
            <span className="tabular-nums">{formatPrice(line.lineTotalIdr, 'IDR')}</span>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex justify-between gap-4 text-[0.6875rem] tracking-[0.015em] uppercase">
        <span>Total</span>
        <span data-testid="checkout-total" className="tabular-nums">
          {formatPrice(cart.subtotalIdr, 'IDR')}
        </span>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Nomor WhatsApp</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Alamat pengiriman</Label>
          <Textarea id="address" name="address" required rows={3} />
        </div>

        {error && (
          <p
            role="alert"
            className="text-[0.6875rem] tracking-[0.015em] text-destructive uppercase"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Memproses…' : 'Buat pesanan'}
        </Button>
      </form>
    </div>
  )
}
