import { describe, expect, it } from 'vitest'

import { resolveColor } from './color'
import type { ColorVariant } from './types'

const colors: ColorVariant[] = [
  { key: 'dusty-rose', name: 'Dusty Rose', hex: '#C98B8B', price: 189000, currency: 'IDR', inStock: false },
  { key: 'black', name: 'Black', hex: '#111111', price: 189000, currency: 'IDR', inStock: true },
  { key: 'navy', name: 'Navy', hex: '#1B2A4A', price: 199000, currency: 'IDR', inStock: true },
]

describe('resolveColor', () => {
  it('returns the matching variant without normalizing', () => {
    const result = resolveColor(colors, 'navy')
    expect(result.color.key).toBe('navy')
    expect(result.normalizedKey).toBeNull()
  })

  it('falls back to the first in-stock color on an unknown key', () => {
    const result = resolveColor(colors, 'chartreuse')
    expect(result.color.key).toBe('black')
    expect(result.normalizedKey).toBe('black')
  })

  it('falls back on a missing key', () => {
    expect(resolveColor(colors, undefined).color.key).toBe('black')
    expect(resolveColor(colors, '').color.key).toBe('black')
  })

  it('uses the first color when nothing is in stock', () => {
    const outOfStock = colors.map((color) => ({ ...color, inStock: false }))
    const result = resolveColor(outOfStock, 'nope')
    expect(result.color.key).toBe('dusty-rose')
    expect(result.normalizedKey).toBe('dusty-rose')
  })

  it('throws when there are no colors', () => {
    expect(() => resolveColor([], 'black')).toThrow()
  })
})
