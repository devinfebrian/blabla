import { notFound } from 'next/navigation'

import { setOrderStatusAction } from '@/app/actions/admin'
import { PrintButton } from '@/components/PrintButton'
import { getOrder, ORDER_STATUS_LABELS } from '@/lib/orders'
import { formatPrice } from '@/lib/price'

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const order = await getOrder(orderNumber)
  if (!order) notFound()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Pesanan {order.orderNumber}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{' '}
            {new Date(order.createdAt).toLocaleString('id-ID')}
          </p>
        </div>
        <PrintButton />
      </header>

      <section className="flex flex-col gap-1 text-sm">
        <h2 className="font-medium">Pelanggan</h2>
        <p>{order.customer.name}</p>
        <p>{order.customer.phone}</p>
        {order.customer.email ? <p>{order.customer.email}</p> : null}
        <p className="text-zinc-600 dark:text-zinc-400">{order.customer.address}</p>
      </section>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Harga</th>
            <th className="py-2 text-right font-medium">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr
              key={`${item.productSlug}:${item.variantKey}`}
              className="border-b border-zinc-100 dark:border-zinc-900"
            >
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-right tabular-nums">{item.qty}</td>
              <td className="py-2 text-right tabular-nums">{formatPrice(item.priceIdr, 'IDR')}</td>
              <td className="py-2 text-right tabular-nums">
                {formatPrice(item.qty * item.priceIdr, 'IDR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="font-medium">Total</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatPrice(order.totalIdr, 'IDR')}
        </span>
      </div>

      <form action={setOrderStatusAction} className="flex gap-3 print:hidden">
        <input type="hidden" name="orderNumber" value={order.orderNumber} />
        {order.status !== 'paid' ? (
          <button
            type="submit"
            name="status"
            value="paid"
            className="h-11 rounded-full bg-green-700 px-5 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Tandai dibayar
          </button>
        ) : null}
        {order.status !== 'cancelled' ? (
          <button
            type="submit"
            name="status"
            value="cancelled"
            className="h-11 rounded-full border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-700"
          >
            Batalkan
          </button>
        ) : null}
      </form>
    </div>
  )
}
