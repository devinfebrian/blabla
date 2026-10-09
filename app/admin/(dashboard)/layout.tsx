import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { logoutAction } from '@/app/actions/admin'
import { ADMIN_COOKIE, verifySession } from '@/lib/admin-auth'

// Auth gate: block until the session cookie is checked — never stream admin content first.
export const instant = false

const LINKS = [
  { href: '/admin', label: 'Dasbor' },
  { href: '/admin/orders', label: 'Pesanan' },
  { href: '/admin/stock', label: 'Stok' },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const jar = await cookies()
  if (!verifySession(jar.get(ADMIN_COOKIE)?.value)) redirect('/admin/login')

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <nav className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-5 text-sm">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="underline-offset-4 hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              Keluar
            </button>
          </form>
        </nav>
        {children}
      </main>
    </div>
  )
}
