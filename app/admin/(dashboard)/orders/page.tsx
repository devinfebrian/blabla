import Link from 'next/link'

import { listOrders, ORDER_STATUS_LABELS } from '@/lib/orders'
import { formatPrice } from '@/lib/price'

export const metadata = { title: 'Pesanan — blabla hijab' }

const FILTERS = ['', 'pending', 'paid', 'cancelled'] as const

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = FILTERS.find((filter) => filter === status) ?? ''
  const orders = await listOrders(active || undefined)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Pesanan</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {FILTERS.map((filter) => (
          <Link
            key={filter || 'semua'}
            href={filter ? `/admin/orders?status=${filter}` : '/admin/orders'}
            className={`rounded-full border px-3 py-1 ${
              active === filter
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {filter ? ORDER_STATUS_LABELS[filter] : 'Semua'}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Belum ada pesanan.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/admin/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {order.customerName} · {order.itemCount} item ·{' '}
                    {new Date(order.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="tabular-nums">{formatPrice(order.totalIdr, 'IDR')}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
