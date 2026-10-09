import { resolveOrderLines, summarize, type RequestedLine } from './cart-core'
import { getProductsBySlugs } from './content'
import { getDb } from './db'
import type { CustomerDetails, Order, OrderItem } from './types'

type OrderItemPayload = {
  product_slug: string
  variant_key: string
  name: string
  sku: string | null
  qty: number
  price_idr: number
}

// Prices always come from Sanity via resolveOrderLines — never from the client. The RPC then
// re-checks the total and decrements stock in the same transaction that writes the order.
export async function createOrder(input: {
  customer: CustomerDetails
  lines: RequestedLine[]
}): Promise<string> {
  const slugs = [...new Set(input.lines.map((line) => line.productSlug))]
  const products = await getProductsBySlugs(slugs)
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]))

  const lines = resolveOrderLines(input.lines, bySlug)
  if (lines.length === 0) throw new Error('Keranjang kosong.')

  const items: OrderItemPayload[] = lines.map((line) => ({
    product_slug: line.productSlug,
    variant_key: line.variantKey,
    name: `${line.productTitle} — ${line.variantName}`,
    sku: line.sku ?? null,
    qty: line.qty,
    price_idr: line.priceIdr,
  }))

  const rows = await getDb().query('select create_order($1::jsonb, $2::jsonb, $3) as order_number', [
    JSON.stringify(input.customer),
    JSON.stringify(items),
    summarize(lines).subtotalIdr,
  ])

  const orderNumber = (rows[0] as { order_number: string } | undefined)?.order_number
  if (!orderNumber) throw new Error('Gagal membuat pesanan.')

  return orderNumber
}

type OrderRow = {
  order_number: string
  status: string
  customer: CustomerDetails
  subtotal_idr: number
  total_idr: number
  created_at: string
  items: OrderItem[]
}

export async function getOrder(orderNumber: string): Promise<Order | null> {
  const rows = await getDb().query(
    `select o.order_number,
            o.status,
            o.customer,
            o.subtotal_idr,
            o.total_idr,
            o.created_at,
            coalesce(
              json_agg(
                json_build_object(
                  'productSlug', i.product_slug,
                  'variantKey', i.variant_key,
                  'name', i.name,
                  'sku', i.sku,
                  'qty', i.qty,
                  'priceIdr', i.price_idr
                ) order by i.id
              ),
              '[]'::json
            ) as items
       from orders o
       left join order_items i on i.order_id = o.id
      where o.order_number = $1
      group by o.id`,
    [orderNumber],
  )

  const row = rows[0] as OrderRow | undefined
  if (!row) return null

  return {
    orderNumber: row.order_number,
    status: row.status,
    customer: row.customer,
    subtotalIdr: Number(row.subtotal_idr),
    totalIdr: Number(row.total_idr),
    createdAt: row.created_at,
    items: row.items,
  }
}
