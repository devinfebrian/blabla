import { describe, expect, it } from 'vitest'

import { buildWhatsAppUrl } from './whatsapp'

const site = { whatsappNumber: '6281234567890' }
const product = { title: 'Hijab Premium' }
const color = { key: 'navy', name: 'Navy', price: 199000, currency: 'IDR' }

const url = buildWhatsAppUrl({ site, product, color, qty: 2, pageUrl: 'https://blabla.example/' })

describe('buildWhatsAppUrl', () => {
  it('targets the wa.me deep link for the configured number', () => {
    expect(url.startsWith('https://wa.me/6281234567890?text=')).toBe(true)
  })

  it('encodes the message so newlines and spaces survive', () => {
    const text = new URL(url).searchParams.get('text') ?? ''
    expect(text).toContain('Hijab Premium')
    expect(text).toContain('Color: Navy')
    expect(text).toContain('Qty: 2')
    expect(text).toContain('\n')
  })

  it('carries the selected color key in the page URL', () => {
    const text = new URL(url).searchParams.get('text') ?? ''
    expect(text).toContain('https://blabla.example/?color=navy')
  })

  it('formats the price for the currency', () => {
    const text = new URL(url).searchParams.get('text') ?? ''
    expect(text).toContain('199.000')
  })
})
