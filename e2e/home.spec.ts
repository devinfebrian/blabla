import { expect, test } from '@playwright/test'

// The home catalogue renders one reveal card per catalogue item (1 real + 5 mock).

test.describe('home catalogue', () => {
  test('renders the grid and filters by colour', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const cards = page.locator('[data-slot="product-reveal-card"]')
    await expect(cards).toHaveCount(6)
    await expect(page.getByText('6 item')).toBeVisible()

    await page.getByRole('button', { name: 'Mocca' }).click()

    await expect(cards).toHaveCount(1)
    await expect(page.getByText('1 item')).toBeVisible()
  })

  test('sorts the grid by price', async ({ page }) => {
    await page.goto('/')

    const cards = page.locator('[data-slot="product-reveal-card"]')

    await page.getByRole('button', { name: 'Rekomendasi' }).click()
    await page.getByRole('menuitem', { name: 'Harga: tinggi ke rendah' }).click()

    await expect(cards.first()).toContainText('Khimar Syari')
  })
})
