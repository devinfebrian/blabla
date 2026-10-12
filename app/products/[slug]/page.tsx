import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { ProductDetailOne } from '@/components/product-detail-01'
import { getAllProducts, getProductsBySlugs } from '@/lib/content'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({ slug: product.slug }))
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getProductsBySlugs([slug])
  const product = products[0]

  if (!product) notFound()

  return <ProductDetailOne product={product} />
}

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <p
            data-testid="product-loading"
            className="mx-auto w-full max-w-[1440px] px-4 py-8 text-xs text-muted-foreground sm:px-6"
          >
            Memuat produk…
          </p>
        }
      >
        <ProductDetail params={params} />
      </Suspense>
    </main>
  )
}
