import { ProductCard } from '@/components/ProductCard'
import { getAllProducts } from '@/lib/content'

export const metadata = { title: 'Koleksi — blabla hijab' }

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Koleksi</h1>

        {products.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">Belum ada produk.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
