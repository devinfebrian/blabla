'use client'

import { MenuIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MobileNav({ brandName }: { brandName: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon />
          <span className="sr-only">Buka menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="rounded-none border-l border-border bg-card">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-[13px] font-bold tracking-[0.015em] uppercase">
            {brandName}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2">
          <Link
            href="/cart"
            className="flex h-12 items-center border-b border-border px-2 text-[0.75rem] font-medium tracking-[0.015em] uppercase transition-colors hover:bg-muted"
          >
            Keranjang
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
