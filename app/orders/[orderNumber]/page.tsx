import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/ui/PageShell'
import { Separator } from '@/components/ui/separator'
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
        <p
          data-testid="order-status"
          className="w-fit rounded-[3px] border border-border px-2 py-0.5 text-[0.6875rem] tracking-[0.015em] text-muted-foreground uppercase"
        >
          {order.status === 'paid' ? 'Dibayar' : 'Menunggu konfirmasi'}
        </p>
        <h1 className="text-h1 font-bold tracking-[-0.27px] uppercase">
          Pesanan {order.orderNumber}
        </h1>
        <p className="text-xs text-muted-foreground">
          Simpan nomor pesanan ini, lalu konfirmasi lewat WhatsApp.
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-border">
        {order.items.map((item) => (
          <li
            key={`${item.productSlug}:${item.variantKey}`}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div>
              <p className="text-[13px] font-bold tracking-[0.015em] uppercase">{item.name}</p>
              <p className="text-xs text-muted-foreground">Jumlah: {item.qty}</p>
            </div>
            <p className="text-[13px] font-medium tabular-nums">
              {formatPrice(item.qty * item.priceIdr, 'IDR')}
            </p>
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] tracking-[0.015em] uppercase">Total</span>
        <span data-testid="order-total" className="text-h3 font-bold tabular-nums">
          {formatPrice(order.totalIdr, 'IDR')}
        </span>
      </div>

      <Button asChild size="lg" className="w-full sm:w-auto">
        <a href={handoffUrl} target="_blank" rel="noopener noreferrer">
          Konfirmasi via WhatsApp <span aria-hidden>→</span>
        </a>
      </Button>
    </div>
  )
}

export default function OrderPage({ params }: PageProps<'/orders/[orderNumber]'>) {
  return (
    <PageShell>
      <Suspense
        fallback={<p data-testid="order-loading" className="text-muted-foreground">Memuat pesanan…</p>}
      >
        <OrderDetail params={params} />
      </Suspense>
    </PageShell>
  )
}
