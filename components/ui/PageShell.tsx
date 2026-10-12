import type { ReactNode } from 'react'

export function PageShell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-1 justify-center">
      <main className={`flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-20 ${className}`}>
        {children}
      </main>
    </div>
  )
}
