import { describe, expect, it } from 'vitest'

import {
  MAX_QTY,
  buildCartLines,
  clampQty,
  lineKey,
  mergeLines,
  resolveOrderLines,
  summarize,
  type RequestedLine,
} from './cart-core'
import type { Product } from './types'

const product: Product = {
  title: 'Hijab Premium',
  slug: 'hijab-premium',
  description: 'Satu model, banyak warna.',
  model: { glbUrl: '/models/hijab.glb', fabricMaterialName: 'Fabric' },
  colors: [
    { key: 'navy', name: 'Navy', hex: '#1B2A4A', price: 199000, currency: 'IDR', inStock: true, sku: 'HJ-NVY' },
    { key: 'rose', name: 'Dusty Rose', hex: '#C98B8B', price: 189000, currency: 'IDR', inStock: false },
    { key: 'usd', name: 'USD only', hex: '#111111', price: 15, currency: 'USD', inStock: true },
  ],
}

const catalogue: Record<string, Product> = { 'hijab-premium': product }

describe('clampQty', () => {
  it('keeps quantities inside 1..MAX_QTY', () => {
    expect(clampQty(3)).toBe(3)
    expect(clampQty(0)).toBe(1)
    expect(clampQty(-4)).toBe(1)
    expect(clampQty(MAX_QTY + 10)).toBe(MAX_QTY)
  })

  it('truncates fractions and falls back on non-finite input', () => {
    expect(clampQty(2.9)).toBe(2)
    expect(clampQty(Number.NaN)).toBe(1)
  })
})

describe('mergeLines', () => {
  it('merges duplicate lines by summing quantity', () => {
    expect(
      mergeLines([
        { productSlug: 'hijab-premium', variantKey: 'navy', qty: 2 },
        { productSlug: 'hijab-premium', variantKey: 'navy', qty: 3 },
        { productSlug: 'hijab-premium', variantKey: 'rose', qty: 1 },
      ]),
    ).toEqual([
      { productSlug: 'hijab-premium', variantKey: 'navy', qty: 5 },
      { productSlug: 'hijab-premium', variantKey: 'rose', qty: 1 },
    ])
  })

  it('clamps the merged quantity', () => {
    const merged = mergeLines([{ productSlug: 'p', variantKey: 'v', qty: MAX_QTY + 5 }])
    expect(merged[0].qty).toBe(MAX_QTY)
  })
})

describe('buildCartLines', () => {
  const items: RequestedLine[] = [
    { productSlug: 'hijab-premium', variantKey: 'navy', qty: 2 },
    { productSlug: 'deleted-product', variantKey: 'navy', qty: 1 },
    { productSlug: 'hijab-premium', variantKey: 'usd', qty: 1 },
    { productSlug: 'hijab-premium', variantKey: 'gone', qty: 1 },
  ]

  it('resolves live prices and skus instead of client-supplied values', () => {
    const [line] = buildCartLines(items, catalogue)
    expect(line.priceIdr).toBe(199000)
    expect(line.lineTotalIdr).toBe(398000)
    expect(line.sku).toBe('HJ-NVY')
  })

  it('drops rows for missing products, missing variants, and non-IDR currencies', () => {
    const lines = buildCartLines(items, catalogue)
    expect(lines.map((line) => lineKey(line))).toEqual(['hijab-premium:navy'])
  })

  it('flags out-of-stock variants without dropping them', () => {
    const line = buildCartLines(
      [{ productSlug: 'hijab-premium', variantKey: 'rose', qty: 1 }],
      catalogue,
    )[0]
    expect(line.inStock).toBe(false)
  })
})

describe('resolveOrderLines', () => {
  it('returns merged, freshly priced lines when everything resolves', () => {
    const lines = resolveOrderLines(
      [
        { productSlug: 'hijab-premium', variantKey: 'navy', qty: 2 },
        { productSlug: 'hijab-premium', variantKey: 'navy', qty: 1 },
      ],
      catalogue,
    )

    expect(lines).toHaveLength(1)
    expect(lines[0].qty).toBe(3)
  })

  it('throws loudly when any requested line no longer resolves', () => {
    expect(() =>
      resolveOrderLines(
        [
          { productSlug: 'hijab-premium', variantKey: 'navy', qty: 1 },
          { productSlug: 'deleted-product', variantKey: 'navy', qty: 1 },
        ],
        catalogue,
      ),
    ).toThrow(/tidak tersedia/)
  })
})

describe('summarize', () => {
  it('totals line prices and counts every unit', () => {
    const cart = summarize(
      buildCartLines(
        [
          { productSlug: 'hijab-premium', variantKey: 'navy', qty: 2 },
          { productSlug: 'hijab-premium', variantKey: 'rose', qty: 3 },
        ],
        catalogue,
      ),
    )

    expect(cart.subtotalIdr).toBe(199000 * 2 + 189000 * 3)
    expect(cart.itemCount).toBe(5)
  })

  it('is empty when there are no lines', () => {
    expect(summarize([])).toEqual({ lines: [], subtotalIdr: 0, itemCount: 0 })
  })
})
