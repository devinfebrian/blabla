import { expect, test } from '@playwright/test'

// These tests must not depend on catalogue content (names, prices, colour count) — the
// operator edits that in Sanity. They key off `data-key`, which is the stable ?color= value.

test.describe('product page', () => {
  test('gates the 3D viewer behind a tap, then mounts it', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pesan via WhatsApp' })).toBeVisible()

    // three.js must stay off the critical path: no big JS chunk before the tap.
    const heavyChunks = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entries
        .filter((entry) => entry.name.endsWith('.js') && entry.transferSize > 100_000)
        .map((entry) => entry.name)
    })
    expect(heavyChunks).toEqual([])
    await expect(page.locator('canvas')).toHaveCount(0)

    await page.getByRole('button', { name: 'Lihat dalam 3D' }).click()

    await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('viewer-poster')).toHaveCount(0)
  })

  test('changing colour updates the URL, pressed state, and order link', async ({ page }) => {
    await page.goto('/')

    const swatches = page.locator('button[data-key]')
    expect(await swatches.count()).toBeGreaterThan(1)

    const target = swatches.nth(1)
    const targetKey = await target.getAttribute('data-key')
    const targetName = await target.getAttribute('aria-label')

    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'true')
    await target.click()

    await expect(page).toHaveURL(new RegExp(`\\?color=${targetKey}$`))
    await expect(target).toHaveAttribute('aria-pressed', 'true')
    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'false')

    const href = (await page.getByRole('link', { name: 'Pesan via WhatsApp' }).getAttribute('href')) ?? ''
    const message = decodeURIComponent(href)
    expect(href).toContain('https://wa.me/')
    expect(message).toContain(`Color: ${targetName}`)
    expect(message).toContain(`?color=${targetKey}`)
  })

  test('deep link selects the colour on load', async ({ page }) => {
    await page.goto('/')
    const key = await page.locator('button[data-key]').nth(1).getAttribute('data-key')

    await page.goto(`/?color=${key}`)

    await expect(page.locator(`button[data-key="${key}"]`)).toHaveAttribute('aria-pressed', 'true')
  })

  test('unknown colour falls back to the first swatch', async ({ page }) => {
    await page.goto('/?color=definitely-not-a-colour')

    await expect(page.locator('button[data-key]').first()).toHaveAttribute('aria-pressed', 'true')
  })

  test('shows an error with retry when the model fails to load', async ({ page }) => {
    await page.route('**/models/hijab.glb', (route) => route.fulfill({ status: 404, body: '' }))
    await page.goto('/')
    await page.getByRole('button', { name: 'Lihat dalam 3D' }).click()

    await expect(page.getByTestId('viewer-error')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.unroute('**/models/hijab.glb')
    await page.getByRole('button', { name: 'Coba lagi' }).click()

    await expect(page.locator('canvas')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('viewer-error')).toHaveCount(0)
  })
})
