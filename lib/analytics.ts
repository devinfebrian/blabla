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
