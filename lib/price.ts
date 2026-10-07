const LOCALES: Record<string, string> = {
  IDR: 'id-ID',
  USD: 'en-US',
  EUR: 'de-DE',
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(LOCALES[currency] ?? 'id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
