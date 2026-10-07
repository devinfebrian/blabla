import { formatPrice } from './price'
import type { ColorVariant, Product, Site } from './types'

export type OrderDetails = {
  site: Pick<Site, 'whatsappNumber'>
  product: Pick<Product, 'title'>
  color: Pick<ColorVariant, 'key' | 'name' | 'price' | 'currency'>
  qty: number
  pageUrl: string
}

export function buildWhatsAppUrl({ site, product, color, qty, pageUrl }: OrderDetails): string {
  const message = [
    'Hi! I would like to order:',
    `• ${product.title}`,
    `• Color: ${color.name}`,
    `• Qty: ${qty}`,
    `• Price: ${formatPrice(color.price, color.currency)}`,
    `${pageUrl}?color=${color.key}`,
  ].join('\n')

  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}
