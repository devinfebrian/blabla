'use client'

import { trackOrder } from '@/lib/analytics'

export function OrderButton({
  href,
  colorKey,
  disabled,
}: {
  href: string
  colorKey: string
  disabled?: boolean
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled}
      onClick={() => trackOrder(colorKey)}
      className={`inline-flex h-12 items-center justify-center rounded-full px-6 font-medium text-white transition-colors ${
        disabled ? 'pointer-events-none bg-zinc-400' : 'bg-green-700 hover:bg-green-800'
      }`}
    >
      Pesan via WhatsApp
    </a>
  )
}
