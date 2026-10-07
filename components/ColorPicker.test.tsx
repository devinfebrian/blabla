import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ColorPicker } from './ColorPicker'
import type { ColorVariant } from '@/lib/types'

const colors: ColorVariant[] = [
  { key: 'dusty-rose', name: 'Dusty Rose', hex: '#C98B8B', price: 189000, currency: 'IDR', inStock: true },
  { key: 'navy', name: 'Navy', hex: '#1B2A4A', price: 199000, currency: 'IDR', inStock: false },
]

describe('ColorPicker', () => {
  it('marks the selected colour and disables out-of-stock swatches', () => {
    render(<ColorPicker colors={colors} value="dusty-rose" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Dusty Rose' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Navy' })).toBeDisabled()
  })

  it('reports the chosen key', () => {
    const onChange = vi.fn()
    render(<ColorPicker colors={colors} value="dusty-rose" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Dusty Rose' }))

    expect(onChange).toHaveBeenCalledWith('dusty-rose')
  })
})
