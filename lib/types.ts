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
  imageUrl?: string
  model: { glbUrl: string; fabricMaterialName: string }
  colors: ColorVariant[]
}

export type Site = {
  brandName: string
  whatsappNumber: string
  currency: string
}

export type CustomerDetails = {
  name: string
  phone: string
  email?: string
  address: string
}

export type OrderItem = {
  productSlug: string
  variantKey: string
  name: string
  sku?: string | null
  qty: number
  priceIdr: number
}

export type Order = {
  orderNumber: string
  status: string
  customer: CustomerDetails
  subtotalIdr: number
  totalIdr: number
  createdAt: string
  items: OrderItem[]
}
