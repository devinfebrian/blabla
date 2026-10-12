import Link from 'next/link'

import { CartLink } from '@/components/CartLink'
import { MobileNav } from '@/components/MobileNav'
import { Container } from '@/components/ui/Container'
import { getSite } from '@/lib/content'

export async function SiteHeader() {
  const site = await getSite()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <nav className="flex items-center justify-between py-3">
          <Link href="/" className="text-lg font-bold tracking-[0.015em] uppercase sm:text-2xl">
            {site.brandName}
          </Link>
          <div className="flex items-center gap-5">
            <CartLink />
            <MobileNav brandName={site.brandName} />
          </div>
        </nav>
      </Container>
    </header>
  )
}
