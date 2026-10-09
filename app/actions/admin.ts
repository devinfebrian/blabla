'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminPassword,
  sessionToken,
  verifyPassword,
  verifySession,
} from '@/lib/admin-auth'
import { getAllProducts } from '@/lib/content'
import { updateOrderStatus } from '@/lib/orders'
import { setVariantInStock } from '@/lib/sanity-write'
import { setVariantStock } from '@/lib/stock'

async function requireAdmin(): Promise<void> {
  const jar = await cookies()
  if (!verifySession(jar.get(ADMIN_COOKIE)?.value)) throw new Error('Tidak diizinkan.')
}

export async function loginAction(formData: FormData): Promise<void> {
  const candidate = String(formData.get('password') ?? '')
  if (!verifyPassword(candidate)) redirect('/admin/login?error=1')

  const jar = await cookies()
  jar.set(ADMIN_COOKIE, sessionToken(adminPassword()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}

export async function saveStockAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const productSlug = String(formData.get('productSlug') ?? '')
  const variantKey = String(formData.get('variantKey') ?? '')
  const onHand = Math.trunc(Number(formData.get('onHand')))
  if (!Number.isFinite(onHand) || onHand < 0) throw new Error('Jumlah stok tidak valid.')

  // The form is a trust boundary: only touch variants that exist in the catalogue.
  const products = await getAllProducts()
  const variant = products
    .find((product) => product.slug === productSlug)
    ?.colors.find((color) => color.key === variantKey)
  if (!variant) throw new Error('Varian tidak ditemukan.')

  await setVariantStock(productSlug, variantKey, onHand)
  await setVariantInStock(productSlug, variantKey, onHand > 0)

  revalidateTag('product', { expire: 0 })
  revalidatePath('/admin/stock')
}

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const orderNumber = String(formData.get('orderNumber') ?? '')
  const status = String(formData.get('status') ?? '')
  await updateOrderStatus(orderNumber, status)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderNumber}`)
  revalidatePath(`/orders/${orderNumber}`)
}
