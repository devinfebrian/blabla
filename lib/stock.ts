import { getDb } from './db'

export type StockRow = {
  productSlug: string
  variantKey: string
  onHand: number
}

// A variant with no row here is untracked — create_order does not decrement it.
export async function getStock(): Promise<StockRow[]> {
  const rows = await getDb().query(
    'select product_slug, variant_key, on_hand from variant_stock order by product_slug, variant_key',
  )

  return rows.map((row) => ({
    productSlug: String(row.product_slug),
    variantKey: String(row.variant_key),
    onHand: Number(row.on_hand),
  }))
}

export async function setVariantStock(
  productSlug: string,
  variantKey: string,
  onHand: number,
): Promise<void> {
  await getDb().query(
    `insert into variant_stock (product_slug, variant_key, on_hand, updated_at)
     values ($1, $2, $3, now())
     on conflict (product_slug, variant_key)
     do update set on_hand = excluded.on_hand, updated_at = now()`,
    [productSlug, variantKey, onHand],
  )
}
