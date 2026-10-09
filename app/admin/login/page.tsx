import { loginAction } from '@/app/actions/admin'

// Reads searchParams for the error state, so the route blocks rather than prerendering a shell.
export const instant = false

export const metadata = { title: 'Masuk admin — blabla hijab' }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <form action={loginAction} className="flex w-full max-w-sm flex-col gap-4 px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk admin</h1>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password admin"
          className="h-12 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        />
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            Password salah.
          </p>
        )}
        <button
          type="submit"
          className="h-12 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Masuk
        </button>
      </form>
    </div>
  )
}
