import { describe, expect, it } from 'vitest'
import { formatCOP } from '@/lib/format/currency'

// Intl uses a no-break space between the symbol and the amount; normalize it for readability.
const plain = (value: string) => value.replace(/\s/g, ' ')

describe('formatCOP', () => {
  it('formats whole pesos with Colombian separators', () => {
    expect(plain(formatCOP(150000))).toBe('$ 150.000')
    expect(plain(formatCOP(1250000))).toBe('$ 1.250.000')
  })

  it('formats zero without decimals', () => {
    expect(plain(formatCOP(0))).toBe('$ 0')
  })

  it('rejects fractional amounts: money is stored as integers', () => {
    expect(() => formatCOP(10.5)).toThrow(RangeError)
    expect(() => formatCOP(Number.NaN)).toThrow(RangeError)
  })
})
