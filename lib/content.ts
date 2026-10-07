import { client } from './sanity'
import type { Product } from './types'

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  description,
  fabric,
  care,
  model { glbUrl, fabricMaterialName },
  "colors": colors[]{
    key,
    name,
    hex,
    price,
    currency,
    inStock,
    sku
  }
}`

export async function getProduct(slug = 'hijab-premium'): Promise<Product> {
  const product = await client.fetch<Product | null>(PRODUCT_QUERY, { slug })

  if (!product) {
    throw new Error(`No product found for slug "${slug}"`)
  }

  return product
}
