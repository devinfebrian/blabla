import { getDb } from './db'

export type AdminStats = {
  revenueIdr: number
  orderCount: number
  revenue7Idr: number
  orderCount7: number
  pendingCount: number
  topProducts: { name: string; qty: number; revenueIdr: number }[]
  lowStock: { productSlug: string; variantKey: string; onHand: number }[]
}

const LOW_STOCK_THRESHOLD = 5

export async function getAdminStats(): Promise<AdminStats> {
  const sql = getDb()

  const [totals, week, pending, top, low] = await Promise.all([
    sql.query(
      `select coalesce(sum(total_idr), 0)::int as revenue, count(*)::int as orders
         from orders where status <> 'cancelled'`,
    ),
    sql.query(
      `select coalesce(sum(total_idr), 0)::int as revenue, count(*)::int as orders
         from orders
        where status <> 'cancelled' and created_at >= now() - interval '7 days'`,
    ),
    sql.query(`select count(*)::int as count from orders where status = 'pending'`),
    sql.query(
      `select i.name, sum(i.qty)::int as qty, sum(i.qty * i.price_idr)::int as revenue
         from order_items i
         join orders o on o.id = i.order_id
        where o.status <> 'cancelled'
        group by i.name
        order by qty desc
        limit 5`,
    ),
    sql.query(
      `select product_slug, variant_key, on_hand
         from variant_stock
        where on_hand < $1
        order by on_hand asc
        limit 10`,
      [LOW_STOCK_THRESHOLD],
    ),
  ])

  const allTime = totals[0] as { revenue: number; orders: number }
  const lastWeek = week[0] as { revenue: number; orders: number }

  return {
    revenueIdr: Number(allTime.revenue),
    orderCount: Number(allTime.orders),
    revenue7Idr: Number(lastWeek.revenue),
    orderCount7: Number(lastWeek.orders),
    pendingCount: Number((pending[0] as { count: number }).count),
    topProducts: (top as { name: string; qty: number; revenue: number }[]).map((row) => ({
      name: row.name,
      qty: Number(row.qty),
      revenueIdr: Number(row.revenue),
    })),
    lowStock: (low as { product_slug: string; variant_key: string; on_hand: number }[]).map(
      (row) => ({
        productSlug: row.product_slug,
        variantKey: row.variant_key,
        onHand: Number(row.on_hand),
      }),
    ),
  }
}
