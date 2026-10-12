import Link from 'next/link'

import { CatalogueGrid, type CatalogueItem } from '@/components/CatalogueGrid'
import { Container } from '@/components/ui/Container'
import { resolveColor } from '@/lib/color'
import { getProduct, getSite } from '@/lib/content'
import { coverImage } from '@/lib/cover'
import { MOCK_PRODUCTS } from '@/lib/mock-products'
import { formatPrice } from '@/lib/price'

const ghostButton =
  'inline-flex h-12 items-center gap-2 rounded-[3px] border border-foreground bg-transparent px-5 text-[0.75rem] font-medium tracking-[0.015em] uppercase transition-colors hover:bg-card'

export default async function Home() {
  const [product, site] = await Promise.all([getProduct(), getSite()])
  const { color } = resolveColor(product.colors)

  const realItem: CatalogueItem = {
    id: product.slug,
    title: product.title,
    colorName: color.name,
    price: formatPrice(color.price, color.currency),
    priceValue: color.price,
    description: product.description,
    image: color.images?.[0] ?? product.imageUrl ?? coverImage(color.hex),
    href: `/products/${product.slug}?color=${color.key}`,
    features: [
      { title: product.fabric ?? 'Bahan premium', subtitle: 'Bahan' },
      { title: `${product.colors.length} warna`, subtitle: 'Pilihan' },
    ],
    orderable: {
      productSlug: product.slug,
      variantKey: color.key,
      variantName: color.name,
      hex: color.hex,
      sku: color.sku,
      priceIdr: color.price,
    },
  }

  const mockItems: CatalogueItem[] = MOCK_PRODUCTS.map((mock) => ({
    id: mock.slug,
    title: mock.title,
    colorName: mock.colorName,
    price: formatPrice(mock.price, 'IDR'),
    priceValue: mock.price,
    description: mock.description,
    image: coverImage(mock.hex),
    href: '/products',
    features: [
      { title: mock.fabric, subtitle: 'Bahan' },
      { title: mock.colorName, subtitle: 'Warna' },
    ],
  }))

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border">
        <Container className="py-10 sm:py-16 lg:py-24">
          <p className="text-[0.625rem] tracking-[0.02em] text-muted-foreground uppercase">
            Hijab premium, banyak pilihan warna
          </p>
          <h1 className="mt-5 text-[clamp(3.25rem,16vw,9.25rem)] leading-[0.92] font-bold tracking-[-0.01em] uppercase">
            {site.brandName}
          </h1>
          <div className="mt-8">
            <Link href="#koleksi" className={ghostButton}>
              Belanja sekarang <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>

      <section id="koleksi" className="flex flex-1 flex-col">
        <Container className="py-8 sm:py-12">
          <nav
            aria-label="Breadcrumb"
            className="text-[0.625rem] tracking-[0.02em] text-muted-foreground uppercase"
          >
            <Link href="/" className="hover:underline">
              Beranda
            </Link>
            <span className="px-1">/</span>
            <span>Koleksi</span>
          </nav>

          <h2 className="mt-4 text-h1 font-bold tracking-[-0.27px] uppercase">Koleksi</h2>

          <div className="mt-6">
            <CatalogueGrid items={[realItem, ...mockItems]} />
          </div>
        </Container>
      </section>
    </main>
  )
}
