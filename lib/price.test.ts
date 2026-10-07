import { describe, expect, it } from 'vitest'

import { formatPrice } from './price'

describe('formatPrice', () => {
  it('formats IDR with Indonesian grouping and no decimals', () => {
    const formatted = formatPrice(189000, 'IDR')
    expect(formatted).toContain('Rp')
    expect(formatted).toContain('189.000')
    expect(formatted).not.toContain(',00')
  })
})
