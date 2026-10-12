import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { getSite } from '@/lib/content'

export async function SiteFooter() {
  const site = await getSite()

  return (
    <footer className="mt-16 border-t border-border">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-bold tracking-[0.015em] uppercase">{site.brandName}</p>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Hijab premium, banyak pilihan warna.
          </p>
        </div>
        <nav className="flex flex-col gap-3">
          <Link
            href="/cart"
            className="text-[0.6875rem] tracking-[0.015em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Keranjang
          </Link>
          <a
            href={`https://wa.me/${site.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.6875rem] tracking-[0.015em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            WhatsApp
          </a>
        </nav>
        <p className="text-[0.625rem] tracking-[0.02em] text-muted-foreground uppercase">
          © {site.brandName}
        </p>
      </Container>
    </footer>
  )
}
