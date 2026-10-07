import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_TOKEN. Run with: pnpm seed',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-10-07',
  token,
  useCdn: false,
})

const product = {
  _id: 'product-hijab',
  _type: 'product',
  title: 'Hijab Premium',
  slug: { _type: 'slug', current: 'hijab-premium' },
  description: 'Satu model tiga dimensi, banyak pilihan warna.',
  fabric: 'Voal premium',
  care: 'Cuci tangan dengan air dingin, jangan diperas.',
  model: {
    glbUrl: 'https://example.com/models/hijab.glb',
    fabricMaterialName: 'Fabric',
  },
  colors: [
    { _key: 'dusty-rose', _type: 'colorVariant', key: 'dusty-rose', name: 'Dusty Rose', hex: '#C98B8B', price: 189000, currency: 'IDR', inStock: true },
    { _key: 'black', _type: 'colorVariant', key: 'black', name: 'Black', hex: '#111111', price: 189000, currency: 'IDR', inStock: true },
    { _key: 'navy', _type: 'colorVariant', key: 'navy', name: 'Navy', hex: '#1B2A4A', price: 199000, currency: 'IDR', inStock: true },
  ],
}

const site = {
  _id: 'site',
  _type: 'site',
  brandName: 'blabla hijab',
  whatsappNumber: '6281234567890',
  currency: 'IDR',
}

await client.createOrReplace(product)
await client.createOrReplace(site)

type Color = {
  key: string
  name: string
  hex: string
  price: number
  currency: string
  inStock: boolean
}

type SeededProduct = { title: string; colors: Color[] }

const fetched = await client.fetch<SeededProduct>(
  `*[_type == "product" && slug.current == $slug][0]{
    title,
    "colors": colors[]{ key, name, hex, price, currency, inStock }
  }`,
  { slug: 'hijab-premium' },
)

if (!fetched || fetched.colors.length !== 3) {
  throw new Error(`Seed verification failed: expected 3 colors, got ${fetched?.colors?.length ?? 0}`)
}
if (fetched.colors.some((color) => !/^#[0-9a-fA-F]{6}$/.test(color.hex))) {
  throw new Error('Seed verification failed: invalid hex value persisted')
}

console.log(
  `Seeded "${fetched.title}":`,
  fetched.colors.map((color) => `${color.name} ${color.hex}`).join(', '),
)
