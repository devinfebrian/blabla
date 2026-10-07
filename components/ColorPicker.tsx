'use client'

import type { ColorVariant } from '@/lib/types'

export function ColorPicker({
  colors,
  value,
  onChange,
}: {
  colors: ColorVariant[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <ul className="flex flex-wrap gap-3">
      {colors.map((variant) => {
        const selected = variant.key === value
        return (
          <li key={variant.key}>
            <button
              type="button"
              onClick={() => onChange(variant.key)}
              disabled={!variant.inStock}
              aria-pressed={selected}
              aria-label={variant.name}
              title={variant.name}
              className={`block h-10 w-10 rounded-full border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                selected ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent'
              }`}
            >
              <span
                className="block h-full w-full rounded-full"
                style={{ backgroundColor: variant.hex }}
                aria-hidden
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
