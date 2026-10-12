import { expect, test } from '@playwright/test'

// These tests must not depend on catalogue content (names, prices, colour count) — the
// operator edits that in Sanity. They key off `data-key`, which is the stable ?color= value.

test.describe('product page', () => {
  test('changing colour updates the URL and pressed state', async ({ page }) => {
    await page.goto('/products/hijab-premium')

    const swatches = page.locator('button[data-key]')
    expect(await swatches.count()).toBeGreaterThan(1)

    const target = swatches.nth(1)
    const targetKey = await target.getAttribute('data-key')

    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'true')
    await target.click()

    await expect(page).toHaveURL(new RegExp(`\\?color=${targetKey}$`))
    await expect(target).toHaveAttribute('aria-pressed', 'true')
    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('deep link selects the colour on load', async ({ page }) => {
    await page.goto('/products/hijab-premium')
    const key = await page.locator('button[data-key]').nth(1).getAttribute('data-key')

    await page.goto(`/products/hijab-premium?color=${key}`)

    await expect(page.locator(`button[data-key="${key}"]`)).toHaveAttribute('aria-pressed', 'true')
  })

  test('unknown colour falls back to the first swatch', async ({ page }) => {
    await page.goto('/products/hijab-premium?color=definitely-not-a-colour')

    await expect(page.locator('button[data-key]').first()).toHaveAttribute('aria-pressed', 'true')
  })
})
