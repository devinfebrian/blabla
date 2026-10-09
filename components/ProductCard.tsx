import Image from 'next/image'
import Link from 'next/link'

import { resolveColor } from '@/lib/color'
import { formatPrice } from '@/lib/price'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const { color } = resolveColor(product.colors)

  return (
    <li>
      <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={800}
              height={800}
              sizes="(min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span
                className="h-16 w-16 rounded-full"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">{product.title}</span>
          <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {formatPrice(color.price, color.currency)}
          </span>
        </div>
      </Link>
    </li>
  )
}
