'use client'

export function OrderButton({ href, disabled }: { href: string; disabled?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled}
      className={`inline-flex h-12 items-center justify-center rounded-full px-6 font-medium text-white transition-colors ${
        disabled ? 'pointer-events-none bg-zinc-400' : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      Pesan via WhatsApp
    </a>
  )
}
