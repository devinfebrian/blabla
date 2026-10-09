'use server'

import { revalidatePath } from 'next/cache'

import { MAX_QTY, type RequestedLine } from '@/lib/cart-core'
import { createOrder } from '@/lib/orders'
import type { CustomerDetails } from '@/lib/types'

export type CheckoutResult = { ok: true; orderNumber: string } | { ok: false; error: string }

function requireText(value: unknown, label: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw new Error(`${label} wajib diisi.`)
  return text.slice(0, 500)
}

function optionalText(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  return text ? text.slice(0, 200) : undefined
}

function readLines(value: unknown): RequestedLine[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Keranjang kosong.')
  if (value.length > 50) throw new Error('Terlalu banyak item di keranjang.')

  return value.map((item) => {
    const record = (item ?? {}) as Record<string, unknown>
    const qty = Math.trunc(Number(record.qty))
    if (!Number.isFinite(qty)) throw new Error('Jumlah tidak valid.')

    return {
      productSlug: requireText(record.productSlug, 'Produk'),
      variantKey: requireText(record.variantKey, 'Varian'),
      qty: Math.max(1, Math.min(MAX_QTY, qty)),
    }
  })
}

export async function checkoutAction(input: {
  customer?: { name?: unknown; phone?: unknown; email?: unknown; address?: unknown }
  lines?: unknown
}): Promise<CheckoutResult> {
  try {
    const customer: CustomerDetails = {
      name: requireText(input?.customer?.name, 'Nama'),
      phone: requireText(input?.customer?.phone, 'Nomor WhatsApp'),
      email: optionalText(input?.customer?.email),
      address: requireText(input?.customer?.address, 'Alamat'),
    }

    const orderNumber = await createOrder({ customer, lines: readLines(input?.lines) })

    revalidatePath('/cart')
    return { ok: true, orderNumber }
  } catch (error) {
    console.error('[checkout] failed:', error)
    return {
      ok: false,
      error: error instanceof Error && error.message ? error.message : 'Gagal membuat pesanan',
    }
  }
}
