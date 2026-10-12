import { ProductCard } from '@/components/ProductCard'
import { Container } from '@/components/ui/Container'
import { getAllProducts } from '@/lib/content'

export const metadata = { title: 'Koleksi — blabla hijab' }

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <main className="flex flex-1 flex-col">
      <Container className="py-8 sm:py-12">
        <h1 className="text-h1 font-bold tracking-[-0.27px] uppercase">
          Koleksi <span className="tabular-nums">[{products.length}]</span>
        </h1>

        {products.length === 0 ? (
          <p className="mt-6 text-xs text-muted-foreground">Belum ada produk.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-[3px] md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </ul>
        )}
      </Container>
    </main>
  )
}
