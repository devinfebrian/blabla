'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-store'

export function CartLink() {
  const lines = useCart()
  const count = lines.reduce((total, line) => total + line.qty, 0)

  return (
    <Link
      href="/cart"
      className="text-[0.6875rem] font-medium tracking-[0.015em] uppercase transition-colors hover:text-muted-foreground"
    >
      Keranjang <span className="tabular-nums">[{count}]</span>
    </Link>
  )
}
