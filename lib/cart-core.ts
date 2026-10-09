import type { Product } from './types'

export const MAX_QTY = 99
export const CHECKOUT_CURRENCY = 'IDR'

export type RequestedLine = {
  productSlug: string
  variantKey: string
  qty: number
}

export type CartLine = {
  productSlug: string
  productTitle: string
  variantKey: string
  variantName: string
  hex: string
  sku?: string
  qty: number
  priceIdr: number
  lineTotalIdr: number
  inStock: boolean
}

export type Cart = {
  lines: CartLine[]
  subtotalIdr: number
  itemCount: number
}

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1
  return Math.max(1, Math.min(MAX_QTY, Math.trunc(qty)))
}

export function lineKey(line: Pick<CartLine, 'productSlug' | 'variantKey'>): string {
  return `${line.productSlug}:${line.variantKey}`
}

export function mergeLines(lines: RequestedLine[]): RequestedLine[] {
  const byKey = new Map<string, RequestedLine>()

  for (const line of lines) {
    const key = lineKey(line)
    const existing = byKey.get(key)
    byKey.set(key, {
      productSlug: line.productSlug,
      variantKey: line.variantKey,
      qty: clampQty((existing?.qty ?? 0) + line.qty),
    })
  }

  return [...byKey.values()]
}

// Server-side validator: resolves requested lines against the live Sanity catalogue so the
// client can never dictate price, currency, or availability. Invalid lines are dropped;
// resolveOrderLines turns that into a loud failure.
export function buildCartLines(
  items: RequestedLine[],
  products: Record<string, Product>,
): CartLine[] {
  const lines: CartLine[] = []

  for (const item of items) {
    const product = products[item.productSlug]
    const variant = product?.colors.find((color) => color.key === item.variantKey)
    if (!product || !variant || variant.currency !== CHECKOUT_CURRENCY) continue

    const qty = clampQty(item.qty)
    lines.push({
      productSlug: item.productSlug,
      productTitle: product.title,
      variantKey: variant.key,
      variantName: variant.name,
      hex: variant.hex,
      sku: variant.sku,
      qty,
      priceIdr: variant.price,
      lineTotalIdr: variant.price * qty,
      inStock: variant.inStock,
    })
  }

  return lines
}

export function resolveOrderLines(
  requested: RequestedLine[],
  products: Record<string, Product>,
): CartLine[] {
  const merged = mergeLines(requested)
  const lines = buildCartLines(merged, products)

  if (lines.length !== merged.length) {
    throw new Error('Beberapa item sudah tidak tersedia. Perbarui keranjang Anda.')
  }

  return lines
}

export function summarize(lines: CartLine[]): Cart {
  return {
    lines,
    subtotalIdr: lines.reduce((total, line) => total + line.lineTotalIdr, 0),
    itemCount: lines.reduce((count, line) => count + line.qty, 0),
  }
}
