'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium print:hidden dark:border-zinc-700"
    >
      Cetak
    </button>
  )
}
