import { createClient } from '@sanity/client'

import { apiVersion, dataset, projectId } from '@/sanity/env'

// The catalogue's inStock flag is display-only (the DB variant_stock row is authoritative), so a
// failure here must never block the stock write. Best-effort sync, logged and swallowed.
export async function setVariantInStock(
  productSlug: string,
  variantKey: string,
  inStock: boolean,
): Promise<void> {
  const token = process.env.SANITY_API_TOKEN
  if (!token) {
    console.warn('[sanity] skipped inStock sync: SANITY_API_TOKEN is not set')
    return
  }

  try {
    const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
    const id = await client.fetch<string | null>(
      `*[_type == "product" && slug.current == $slug][0]._id`,
      { slug: productSlug },
    )
    if (!id) return

    await client
      .patch(id)
      .set({ [`colors[_key=="${variantKey}"].inStock`]: inStock })
      .commit()
  } catch (error) {
    console.error('[sanity] failed to sync inStock:', error)
  }
}
