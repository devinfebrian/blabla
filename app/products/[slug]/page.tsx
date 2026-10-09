import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { ProductView } from '@/components/ProductView'
import { getAllProducts, getProductsBySlugs, getSite } from '@/lib/content'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({ slug: product.slug }))
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [products, site] = await Promise.all([getProductsBySlugs([slug]), getSite()])
  const product = products[0]

  if (!product) notFound()

  return <ProductView product={product} site={site} />
}

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <Suspense
          fallback={
            <p data-testid="product-loading" className="text-zinc-600 dark:text-zinc-400">
              Memuat produk…
            </p>
          }
        >
          <ProductDetail params={params} />
        </Suspense>
      </main>
    </div>
  )
}
