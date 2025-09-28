export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '—'
  const num = Number(amount)
  return num.toLocaleString(undefined, { style: 'currency', currency })
}
