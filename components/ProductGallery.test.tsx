/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProductGallery } from './ProductGallery'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('ProductGallery', () => {
  it('renders a colour fallback and no thumbnails when there are no images', () => {
    render(<ProductGallery images={[]} hex="#111111" alt="Hijab Premium" />)

    expect(screen.getByTestId('gallery-fallback')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByAltText('Hijab Premium')).toBeNull()
  })

  it('swaps the main image when a thumbnail is picked', () => {
    render(<ProductGallery images={['/a.jpg', '/b.jpg']} hex="#111111" alt="Hijab Premium" />)

    expect(screen.queryByTestId('gallery-fallback')).toBeNull()
    expect(screen.getByAltText('Hijab Premium')).toHaveAttribute('src', '/a.jpg')

    const thumbs = screen.getAllByRole('button')
    expect(thumbs).toHaveLength(2)

    fireEvent.click(thumbs[1])

    expect(thumbs[1]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByAltText('Hijab Premium')).toHaveAttribute('src', '/b.jpg')
  })
})
