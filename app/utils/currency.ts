export type CurrencyCode = 'USD' | 'KHR'

export function formatCurrency(amount: number | string, currency: CurrencyCode): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount

  if (currency === 'KHR') {
    return new Intl.NumberFormat('km-KH', {
      style: 'currency',
      currency: 'KHR',
      maximumFractionDigits: 0
    }).format(num)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return currency === 'KHR' ? '៛' : '$'
}
