'use client'

import { ProductRevealCard } from '@/components/bjork-ui/cards/product-reveal-card'
import { trackAddToCart } from '@/lib/analytics'
import { addCartLine } from '@/lib/cart-store'
import { resolveColor } from '@/lib/color'
import { coverImage } from '@/lib/cover'
import { formatPrice } from '@/lib/price'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const { color } = resolveColor(product.colors)
  const href = `/products/${product.slug}?color=${color.key}`
  const image = color.images?.[0] ?? product.imageUrl ?? coverImage(color.hex)

  function add() {
    addCartLine({
      productSlug: product.slug,
      productTitle: product.title,
      variantKey: color.key,
      variantName: color.name,
      hex: color.hex,
      sku: color.sku,
      qty: 1,
      priceIdr: color.price,
      lineTotalIdr: color.price,
      inStock: color.inStock,
    })
    trackAddToCart(color.key, 1)
  }

  return (
    <li>
      <ProductRevealCard
        name={product.title}
        price={formatPrice(color.price, color.currency)}
        description={product.description}
        image={image}
        href={href}
        features={[
          { title: product.fabric ?? 'Bahan premium', subtitle: 'Bahan' },
          { title: `${product.colors.length} warna`, subtitle: 'Pilihan' },
        ]}
        onAdd={color.inStock ? add : undefined}
      />
    </li>
  )
}
