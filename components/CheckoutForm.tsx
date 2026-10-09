'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'

import { checkoutAction } from '@/app/actions/checkout'
import { trackBeginCheckout, trackOrderCreated } from '@/lib/analytics'
import { lineKey, summarize } from '@/lib/cart-core'
import { clearCart, useCart } from '@/lib/cart-store'
import { formatPrice } from '@/lib/price'

const FIELD =
  'w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100'

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
      <p data-testid="checkout-empty" className="text-zinc-600 dark:text-zinc-400">
        Keranjang masih kosong.{' '}
        <Link href="/products" className="underline">
          Lihat koleksi
        </Link>
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-2 text-sm">
        {cart.lines.map((line) => (
          <li key={lineKey(line)} className="flex justify-between gap-4">
            <span>
              {line.productTitle} — {line.variantName} × {line.qty}
            </span>
            <span className="tabular-nums">{formatPrice(line.lineTotalIdr, 'IDR')}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 border-t border-zinc-200 pt-2 font-medium dark:border-zinc-800">
          <span>Total</span>
          <span data-testid="checkout-total" className="tabular-nums">
            {formatPrice(cart.subtotalIdr, 'IDR')}
          </span>
        </li>
      </ul>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm">
            Nama
          </label>
          <input id="name" name="name" required className={`${FIELD} h-12`} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm">
            Nomor WhatsApp
          </label>
          <input id="phone" name="phone" type="tel" required className={`${FIELD} h-12`} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm">
            Email (opsional)
          </label>
          <input id="email" name="email" type="email" className={`${FIELD} h-12`} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm">
            Alamat pengiriman
          </label>
          <textarea id="address" name="address" required rows={3} className={`${FIELD} py-2`} />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:bg-zinc-600"
        >
          {pending ? 'Memproses…' : 'Buat pesanan'}
        </button>
      </form>
    </div>
  )
}
