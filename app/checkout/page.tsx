import { CheckoutForm } from '@/components/CheckoutForm'

export const metadata = { title: 'Checkout — blabla hijab' }

export default function CheckoutPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-6 py-12 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <CheckoutForm />
      </main>
    </div>
  )
}
