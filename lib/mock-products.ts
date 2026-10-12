export type MockProduct = {
  slug: string
  title: string
  colorName: string
  hex: string
  price: number
  description: string
  fabric: string
}

// Placeholder catalogue so the grid reads like a full listing while the store has one real product.
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: 'hijab-voal-motif',
    title: 'Hijab Voal Motif',
    colorName: 'Motif Bunga',
    hex: '#c9a0a0',
    price: 199000,
    fabric: 'Voal motif',
    description: 'Voal motif bunga dengan jatuh yang lembut dan tidak menerawang.',
  },
  {
    slug: 'pashmina-ceruty',
    title: 'Pashmina Ceruty',
    colorName: 'Mocca',
    hex: '#a9825f',
    price: 229000,
    fabric: 'Ceruty babydoll',
    description: 'Pashmina ceruty bertekstur jatuh, nyaman untuk acara formal.',
  },
  {
    slug: 'hijab-instan-jersey',
    title: 'Hijab Instan Jersey',
    colorName: 'Hitam',
    hex: '#1a1a1a',
    price: 149000,
    fabric: 'Jersey premium',
    description: 'Hijab instan berbahan jersey yang elastis dan mudah dipakai.',
  },
  {
    slug: 'bergo-maryam',
    title: 'Bergo Maryam',
    colorName: 'Abu',
    hex: '#9aa0a6',
    price: 175000,
    fabric: 'Bella square',
    description: 'Bergo Maryam pet antem dengan bahan bella square yang adem.',
  },
  {
    slug: 'khimar-syari',
    title: 'Khimar Syari',
    colorName: 'Dusty Blue',
    hex: '#6b7f9e',
    price: 259000,
    fabric: 'Wolly crepe',
    description: 'Khimar syari panjang berbahan wolly crepe, menutup hingga dada.',
  },
]
