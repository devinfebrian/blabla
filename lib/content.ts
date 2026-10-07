import { client } from './sanity'
import type { Product, Site } from './types'

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
  'use cache'

  const product = await client.fetch<Product | null>(PRODUCT_QUERY, { slug })

  if (!product) {
    throw new Error(`No product found for slug "${slug}"`)
  }

  return product
}

const SITE_QUERY = `*[_type == "site"][0]{
  brandName,
  whatsappNumber,
  currency
}`

export async function getSite(): Promise<Site> {
  'use cache'

  const site = await client.fetch<Site | null>(SITE_QUERY)

  if (!site) {
    throw new Error('No site document found')
  }

  return site
}
