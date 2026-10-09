import { expect, test } from '@playwright/test'

// The cart is client-side localStorage — no backend required. These tests must not depend on
// Sanity content; they key off stable UI copy and data-testids.

test.describe('cart (client-side)', () => {
  test('adds to cart, shows the subtotal, and reaches checkout', async ({ page }) => {
    await page.goto('/products/hijab-premium')

    await page.getByRole('button', { name: 'Tambah ke keranjang' }).click()
    await expect(page.getByRole('status')).toContainText('Ditambahkan ke keranjang')

    await page.getByRole('link', { name: 'Lihat keranjang' }).click()
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.getByRole('heading', { name: 'Keranjang' })).toBeVisible()
    await expect(page.getByTestId('cart-subtotal')).toBeVisible()

    await page.getByRole('link', { name: 'Lanjut ke checkout' }).click()
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByLabel('Nama')).toBeVisible()
    await expect(page.getByTestId('checkout-total')).toBeVisible()
  })

  test('persists the cart across reloads', async ({ page }) => {
    await page.goto('/products/hijab-premium')
    await page.getByRole('button', { name: 'Tambah ke keranjang' }).click()
    await expect(page.getByRole('status')).toContainText('Ditambahkan')

    await page.goto('/cart')
    await expect(page.getByTestId('cart-subtotal')).toBeVisible()
    await expect(page.getByTestId('cart-empty')).toHaveCount(0)
  })

  test('removing the only line empties the cart', async ({ page }) => {
    await page.goto('/products/hijab-premium')
    await page.getByRole('button', { name: 'Tambah ke keranjang' }).click()

    await page.goto('/cart')
    await page.getByRole('button', { name: 'Hapus' }).first().click()

    await expect(page.getByTestId('cart-empty')).toBeVisible()
  })
})
