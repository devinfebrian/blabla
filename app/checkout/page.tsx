import { CheckoutForm } from '@/components/CheckoutForm'
import { PageShell } from '@/components/ui/PageShell'

export const metadata = { title: 'Checkout — blabla hijab' }

export default function CheckoutPage() {
  return (
    <PageShell>
      <h1 className="text-h1 font-bold tracking-[-0.27px] uppercase">Checkout</h1>
      <CheckoutForm />
    </PageShell>
  )
}
