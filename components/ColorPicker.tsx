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
              data-key={variant.key}
              onClick={() => onChange(variant.key)}
              disabled={!variant.inStock}
              aria-pressed={selected}
              aria-label={variant.name}
              title={variant.name}
              className={`block h-11 w-11 rounded-[3px] border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                selected ? 'border-foreground' : 'border-border hover:border-foreground/60'
              }`}
            >
              <span
                className="block h-full w-full rounded-[3px]"
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
