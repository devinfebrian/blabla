import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getSite } from '@/lib/content'
import { getOrder } from '@/lib/orders'
import { formatPrice } from '@/lib/price'
import { buildOrderHandoffUrl } from '@/lib/whatsapp'

async function OrderDetail({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const [order, site] = await Promise.all([getOrder(orderNumber), getSite()])

  if (!order) notFound()

  const handoffUrl = buildOrderHandoffUrl({
    site,
    orderNumber: order.orderNumber,
    items: order.items,
    totalIdr: order.totalIdr,
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p data-testid="order-status" className="text-sm uppercase tracking-wide text-zinc-500">
          {order.status === 'paid' ? 'Dibayar' : 'Menunggu konfirmasi'}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Pesanan {order.orderNumber}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Simpan nomor pesanan ini, lalu konfirmasi lewat WhatsApp.
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {order.items.map((item) => (
          <li
            key={`${item.productSlug}:${item.variantKey}`}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Jumlah: {item.qty}</p>
            </div>
            <p className="font-medium tabular-nums">
              {formatPrice(item.qty * item.priceIdr, 'IDR')}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="font-medium">Total</span>
        <span data-testid="order-total" className="text-lg font-semibold tabular-nums">
          {formatPrice(order.totalIdr, 'IDR')}
        </span>
      </div>

      <a
        href={handoffUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-full bg-green-700 px-6 font-medium text-white transition-colors hover:bg-green-800"
      >
        Konfirmasi via WhatsApp
      </a>
    </div>
  )
}

export default function OrderPage({ params }: PageProps<'/orders/[orderNumber]'>) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <Suspense
          fallback={
            <p data-testid="order-loading" className="text-zinc-600 dark:text-zinc-400">
              Memuat pesanan…
            </p>
          }
        >
          <OrderDetail params={params} />
        </Suspense>
      </main>
    </div>
  )
}
