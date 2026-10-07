import { expect, test } from '@playwright/test'

test.describe('product page', () => {
  test('renders the product and mounts the 3D viewer', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Hijab Premium' })).toBeVisible()
    await expect(page.getByText('189.000')).toBeVisible()

    await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('viewer-skeleton')).toHaveCount(0)
  })

  test('changing colour updates the URL, price, and order link', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Navy' }).click()

    await expect(page).toHaveURL(/\?color=navy$/)
    await expect(page.getByText('199.000')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Navy' })).toHaveAttribute('aria-pressed', 'true')

    const href = (await page.getByRole('link', { name: 'Pesan via WhatsApp' }).getAttribute('href')) ?? ''
    const message = decodeURIComponent(href)
    expect(href).toContain('https://wa.me/6281234567890')
    expect(message).toContain('Color: Navy')
    expect(message).toContain('/?color=navy')
  })

  test('deep link selects the colour on load', async ({ page }) => {
    await page.goto('/?color=black')

    await expect(page.getByRole('button', { name: 'Black' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('189.000')).toBeVisible()
  })

  test('unknown colour falls back to the default', async ({ page }) => {
    await page.goto('/?color=nope')

    await expect(page.getByRole('button', { name: 'Dusty Rose' })).toHaveAttribute('aria-pressed', 'true')
  })
})
