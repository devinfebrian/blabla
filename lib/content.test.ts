import { describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))

vi.mock('./sanity', () => ({ client: { fetch: fetchMock } }))
vi.mock('next/cache', () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }))

import { getProduct, getSite } from './content'

describe('content failure paths (must fail loudly)', () => {
  it('throws when the product document is missing', async () => {
    fetchMock.mockResolvedValueOnce(null)
    await expect(getProduct()).rejects.toThrow(/No product found/)
  })

  it('propagates a Sanity outage', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    await expect(getProduct()).rejects.toThrow('network down')
  })

  it('throws when the site document is missing', async () => {
    fetchMock.mockResolvedValueOnce(null)
    await expect(getSite()).rejects.toThrow(/No site document found/)
  })
})
