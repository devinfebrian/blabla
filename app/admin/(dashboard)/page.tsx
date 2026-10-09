import Link from 'next/link'

import { getAdminStats } from '@/lib/admin-analytics'
import { formatPrice } from '@/lib/price'

export const metadata = { title: 'Dasbor admin — blabla hijab' }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <dt className="text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dasbor</h1>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Pendapatan" value={formatPrice(stats.revenueIdr, 'IDR')} />
        <Stat label="Pesanan" value={String(stats.orderCount)} />
        <Stat label="Pendapatan 7 hari" value={formatPrice(stats.revenue7Idr, 'IDR')} />
        <Stat label="Menunggu konfirmasi" value={String(stats.pendingCount)} />
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Produk terlaris</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Belum ada penjualan.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {stats.topProducts.map((product) => (
              <li key={product.name} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span>{product.name}</span>
                <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                  {product.qty}× · {formatPrice(product.revenueIdr, 'IDR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Stok menipis</h2>
          <Link href="/admin/stock" className="text-sm underline">
            Atur stok
          </Link>
        </div>
        {stats.lowStock.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Semua stok aman.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {stats.lowStock.map((row) => (
              <li
                key={`${row.productSlug}:${row.variantKey}`}
                className="flex items-center justify-between gap-4 py-2 text-sm"
              >
                <span>
                  {row.productSlug} — {row.variantKey}
                </span>
                <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
                  {row.onHand} tersisa
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
