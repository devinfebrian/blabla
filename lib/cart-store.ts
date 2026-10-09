import { useSyncExternalStore } from 'react'

import { clampQty, lineKey, type CartLine } from './cart-core'

const STORAGE_KEY = 'blabla-cart'

// ponytail: lines carry a display snapshot read from localStorage; the server re-prices
// every line from Sanity at checkout, so a stale snapshot is cosmetic only.
let lines: CartLine[] | null = null
const listeners = new Set<() => void>()

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false

  const line = value as Record<string, unknown>
  return (
    typeof line.productSlug === 'string' &&
    typeof line.productTitle === 'string' &&
    typeof line.variantKey === 'string' &&
    typeof line.variantName === 'string' &&
    typeof line.hex === 'string' &&
    typeof line.qty === 'number' &&
    typeof line.priceIdr === 'number' &&
    typeof line.lineTotalIdr === 'number' &&
    typeof line.inStock === 'boolean'
  )
}

function read(): CartLine[] {
  if (lines) return lines

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    lines = Array.isArray(parsed)
      ? parsed.filter(isCartLine).map((line) => ({ ...line, qty: clampQty(line.qty) }))
      : []
  } catch {
    lines = []
  }

  return lines
}

function write(next: CartLine[]): void {
  lines = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Client-only. Never call this during render on the server — the hook's server snapshot is [].
export function getCartLines(): CartLine[] {
  return read()
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => [])
}

export function addCartLine(line: CartLine): void {
  const key = lineKey(line)
  const current = read()
  const existing = current.find((item) => lineKey(item) === key)

  write(
    existing
      ? current.map((item) =>
          lineKey(item) === key ? { ...line, qty: clampQty(item.qty + line.qty) } : item,
        )
      : [...current, { ...line, qty: clampQty(line.qty) }],
  )
}

export function setCartQty(productSlug: string, variantKey: string, qty: number): void {
  const key = lineKey({ productSlug, variantKey })
  const current = read()

  if (qty <= 0) {
    write(current.filter((item) => lineKey(item) !== key))
    return
  }

  write(current.map((item) => (lineKey(item) === key ? { ...item, qty: clampQty(qty) } : item)))
}

export function removeCartLine(productSlug: string, variantKey: string): void {
  const key = lineKey({ productSlug, variantKey })
  write(read().filter((item) => lineKey(item) !== key))
}

export function clearCart(): void {
  write([])
}
