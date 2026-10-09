import Link from 'next/link'

import { getSite } from '@/lib/content'

export async function SiteHeader() {
  const site = await getSite()

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {site.brandName}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/products">Koleksi</Link>
          <Link href="/cart">Keranjang</Link>
        </div>
      </nav>
    </header>
  )
}
