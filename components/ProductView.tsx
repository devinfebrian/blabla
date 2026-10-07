'use client'

import { useState } from 'react'

import { ColorPicker } from '@/components/ColorPicker'
import { HijabViewerIsland } from '@/components/HijabViewerIsland'
import { OrderButton } from '@/components/OrderButton'
import { replaceColorInUrl, useCurrentUrl } from '@/components/useCurrentUrl'
import { trackViewerInteract } from '@/lib/analytics'
import { resolveColor } from '@/lib/color'
import { formatPrice } from '@/lib/price'
import type { Product, Site } from '@/lib/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export function ProductView({ product, site }: { product: Product; site: Site }) {
  const [qty, setQty] = useState(1)
  const currentUrl = useCurrentUrl()

  const parsedUrl = currentUrl ? new URL(currentUrl) : null
  const requested = parsedUrl?.searchParams.get('color') ?? null
  const { color } = resolveColor(product.colors, requested)

  const pageUrl = parsedUrl ? parsedUrl.origin + parsedUrl.pathname : ''
  const orderHref = buildWhatsAppUrl({ site, product, color, qty, pageUrl })

  return (
    <>
      <HijabViewerIsland
        glbUrl={product.model.glbUrl}
        fabricMaterialName={product.model.fabricMaterialName}
        hex={color.hex}
      />

      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          <p className="text-lg">{formatPrice(color.price, color.currency)}</p>
          <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
        </header>

        <div className="flex flex-col gap-3">
          <ColorPicker
            colors={product.colors}
            value={color.key}
            onChange={(key) => {
              replaceColorInUrl(key)
              trackViewerInteract()
            }}
          />
          <p className="text-sm text-zinc-500">
            {color.name}
            {color.inStock ? '' : ' — stok habis'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="qty" className="text-sm">
            Jumlah
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={10}
            value={qty}
            onChange={(event) => {
              const next = Number(event.target.value)
              setQty(Number.isFinite(next) ? Math.max(1, Math.min(10, next)) : 1)
            }}
            className="w-16 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </div>

        <OrderButton href={orderHref} colorKey={color.key} disabled={!color.inStock} />

        {(product.fabric || product.care) && (
          <dl className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {product.fabric && (
              <>
                <dt className="font-medium">Bahan</dt>
                <dd>{product.fabric}</dd>
              </>
            )}
            {product.care && (
              <>
                <dt className="font-medium">Perawatan</dt>
                <dd>{product.care}</dd>
              </>
            )}
          </dl>
        )}
      </article>
    </>
  )
}
