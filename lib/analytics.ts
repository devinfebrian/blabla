import { track } from '@vercel/analytics'

let interacted = false

export function trackViewerInteract() {
  if (interacted) return
  interacted = true
  track('viewer_interact')
}

export function trackOrder(colorKey: string) {
  track('order_whatsapp', { color: colorKey })
}

export function trackAddToCart(colorKey: string, qty: number) {
  track('add_to_cart', { color: colorKey, qty })
}

export function trackBeginCheckout() {
  track('begin_checkout')
}

export function trackOrderCreated() {
  track('order_created')
}
