const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Formats whole Colombian pesos for display, e.g. 150000 -> "$ 150.000".
 * Amounts are integers everywhere (docs/PROMPT_MAESTRO.md §6.3): a fractional value is a bug, so it throws.
 */
export function formatCOP(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`COP amounts must be integers, received ${amount}`)
  }
  return copFormatter.format(amount)
}
