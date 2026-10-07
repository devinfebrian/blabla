import { ProductView } from '@/components/ProductView'
import { getProduct, getSite } from '@/lib/content'

export default async function Home() {
  const [product, site] = await Promise.all([getProduct(), getSite()])

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <ProductView product={product} site={site} />
      </main>
    </div>
  )
}
