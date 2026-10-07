import type { ColorVariant } from './types'

export type ResolvedColor = {
  color: ColorVariant
  normalizedKey: string | null
}

export function resolveColor(colors: ColorVariant[], key?: string | null): ResolvedColor {
  if (colors.length === 0) {
    throw new Error('Product has no color variants')
  }

  const match = key ? colors.find((color) => color.key === key) : undefined
  if (match) {
    return { color: match, normalizedKey: null }
  }

  const fallback = colors.find((color) => color.inStock) ?? colors[0]
  return { color: fallback, normalizedKey: fallback.key }
}
