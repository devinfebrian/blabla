'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { AddToCartButton } from '@/components/AddToCartButton'
import { ColorPicker } from '@/components/ColorPicker'
import { ProductGallery } from '@/components/ProductGallery'
import { replaceColorInUrl, useCurrentUrl } from '@/components/useCurrentUrl'
import { Button } from '@/components/ui/button'
import { resolveColor } from '@/lib/color'
import { formatPrice } from '@/lib/price'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

// Adapted from CommerCN "Product Detail 01" (https://www.commercn.com). Changes for this store:
// real product + IDR price (no sample data, no discount/rating strings), the "Available Sizes" row
// becomes the colour swatches, cart-only (no WhatsApp), and the image gallery is our ProductGallery.
export function ProductDetailOne({ product, className }: { product: Product; className?: string }) {
  const [quantity, setQuantity] = useState(1)
  const currentUrl = useCurrentUrl()

  const parsedUrl = currentUrl ? new URL(currentUrl) : null
  const requested = parsedUrl?.searchParams.get('color') ?? null
  const { color } = resolveColor(product.colors, requested)

  const images =
    color.images?.length ? color.images : product.imageUrl ? [product.imageUrl] : []

  return (
    <div className={cn('mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12', className)}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery key={color.key} images={images} hex={color.hex} alt={product.title} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-h2 font-bold tracking-[-0.23px] uppercase sm:text-h1">
              {product.title}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <p className="text-h2 font-bold tabular-nums">{formatPrice(color.price, color.currency)}</p>

          <div>
            <h3 className="mb-2 text-[0.75rem] tracking-[0.015em] text-muted-foreground uppercase">
              Warna: {color.name}
            </h3>
            <ColorPicker colors={product.colors} value={color.key} onChange={replaceColorInUrl} />
            {!color.inStock && (
              <p className="mt-2 text-[0.6875rem] tracking-[0.015em] text-destructive uppercase">
                Stok habis
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-[3px] border border-border">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Kurangi jumlah"
                className="h-11 w-11"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus />
              </Button>
              <span className="w-12 text-center font-medium tabular-nums">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Tambah jumlah"
                className="h-11 w-11"
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus />
              </Button>
            </div>

            <div className="flex-1">
              <AddToCartButton
                productSlug={product.slug}
                productTitle={product.title}
                color={color}
                qty={quantity}
                disabled={!color.inStock}
              />
            </div>
          </div>

          {(product.fabric || product.care) && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-t border-border pt-6 text-xs">
              {product.fabric && (
                <>
                  <dt className="tracking-[0.015em] text-muted-foreground uppercase">Bahan</dt>
                  <dd>{product.fabric}</dd>
                </>
              )}
              {product.care && (
                <>
                  <dt className="tracking-[0.015em] text-muted-foreground uppercase">Perawatan</dt>
                  <dd>{product.care}</dd>
                </>
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
