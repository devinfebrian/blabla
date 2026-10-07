export type ColorVariant = {
  key: string
  name: string
  hex: string
  price: number
  currency: string
  inStock: boolean
  sku?: string
}

export type Product = {
  title: string
  slug: string
  description: string
  fabric?: string
  care?: string
  model: { glbUrl: string; fabricMaterialName: string }
  colors: ColorVariant[]
}

export type Site = {
  brandName: string
  whatsappNumber: string
  currency: string
}
