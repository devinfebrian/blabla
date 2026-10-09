import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CartLine } from './cart-core'
import { addCartLine, clearCart, getCartLines, removeCartLine, setCartQty, useCart } from './cart-store'

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    productSlug: 'hijab-premium',
    productTitle: 'Hijab Premium',
    variantKey: 'navy',
    variantName: 'Navy',
    hex: '#1B2A4A',
    qty: 1,
    priceIdr: 199000,
    lineTotalIdr: 199000,
    inStock: true,
    ...overrides,
  }
}

beforeEach(() => {
  clearCart()
  window.localStorage.clear()
})

describe('cart store', () => {
  it('adds a line and persists it to localStorage', () => {
    addCartLine(line())

    expect(getCartLines()).toHaveLength(1)
    expect(JSON.parse(window.localStorage.getItem('blabla-cart') ?? '[]')).toHaveLength(1)
  })

  it('merges a duplicate line and refreshes the display snapshot', () => {
    addCartLine(line({ qty: 2 }))
    addCartLine(line({ qty: 1, priceIdr: 210000, lineTotalIdr: 210000 }))

    const [stored] = getCartLines()
    expect(getCartLines()).toHaveLength(1)
    expect(stored.qty).toBe(3)
    expect(stored.priceIdr).toBe(210000)
  })

  it('clamps quantity', () => {
    addCartLine(line({ qty: 500 }))
    expect(getCartLines()[0].qty).toBe(99)
  })

  it('drops the line when quantity reaches zero', () => {
    addCartLine(line())
    setCartQty('hijab-premium', 'navy', 0)
    expect(getCartLines()).toEqual([])
  })

  it('updates and removes by product + variant', () => {
    addCartLine(line())
    addCartLine(line({ variantKey: 'rose', variantName: 'Dusty Rose' }))

    setCartQty('hijab-premium', 'navy', 4)
    removeCartLine('hijab-premium', 'rose')

    const stored = getCartLines()
    expect(stored).toHaveLength(1)
    expect(stored[0].qty).toBe(4)
    expect(stored[0].variantKey).toBe('navy')
  })

  it('re-renders subscribers when the cart changes', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current).toEqual([])

    act(() => {
      addCartLine(line())
    })

    expect(result.current).toHaveLength(1)
  })

  it('recovers from corrupt stored data', async () => {
    window.localStorage.setItem('blabla-cart', '{not json')
    vi.resetModules()

    const fresh = await import('./cart-store')
    expect(fresh.getCartLines()).toEqual([])
  })
})
