import { cacheLife, cacheTag } from 'next/cache'

import { client } from './sanity'
import type { Product, Site } from './types'

const PRODUCT_FIELDS = `title,
  "slug": slug.current,
  description,
  fabric,
  care,
  "imageUrl": image.asset->url,
  model { glbUrl, fabricMaterialName },
  "colors": colors[]{
    key,
    name,
    hex,
    price,
    currency,
    inStock,
    sku
  }`

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{${PRODUCT_FIELDS}}`

const PRODUCTS_BY_SLUGS_QUERY = `*[_type == "product" && slug.current in $slugs]{${PRODUCT_FIELDS}}`

const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(title asc){${PRODUCT_FIELDS}}`

export async function getProduct(slug = 'hijab-premium'): Promise<Product> {
  'use cache'
  cacheTag('product')
  cacheLife('minutes')

  const product = await client.fetch<Product | null>(PRODUCT_QUERY, { slug })

  if (!product) {
    throw new Error(`No product found for slug "${slug}"`)
  }

  return product
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  'use cache'
  cacheTag('product')
  cacheLife('minutes')

  if (slugs.length === 0) return []

  return client.fetch<Product[]>(PRODUCTS_BY_SLUGS_QUERY, { slugs })
}

export async function getAllProducts(): Promise<Product[]> {
  'use cache'
  cacheTag('product')
  cacheLife('minutes')

  return client.fetch<Product[]>(ALL_PRODUCTS_QUERY)
}

const SITE_QUERY = `*[_type == "site"][0]{
  brandName,
  whatsappNumber,
  currency
}`

export async function getSite(): Promise<Site> {
  'use cache'
  cacheTag('site')
  cacheLife('minutes')

  const site = await client.fetch<Site | null>(SITE_QUERY)

  if (!site) {
    throw new Error('No site document found')
  }

  return site
}
