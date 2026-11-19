import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY, isTheme } from '@/lib/theme'

function preferLight(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({ matches }),
  })
}

function runInitScript() {
  new Function(THEME_INIT_SCRIPT)()
  return document.documentElement.getAttribute('data-theme')
}

describe('THEME_INIT_SCRIPT', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('applies the stored choice over the system preference', () => {
    preferLight(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(runInitScript()).toBe('light')
  })

  it('follows prefers-color-scheme on the first visit', () => {
    preferLight(true)
    expect(runInitScript()).toBe('light')
  })

  it('defaults to dark when the system has no light preference', () => {
    preferLight(false)
    expect(runInitScript()).toBe('dark')
  })

  it('ignores invalid stored values', () => {
    preferLight(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(runInitScript()).toBe('dark')
  })

  it('still honors the system preference when storage is blocked', () => {
    preferLight(true)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    expect(runInitScript()).toBe('light')
  })

  it('falls back to dark when matchMedia fails', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('no matchMedia')
      },
    })
    expect(runInitScript()).toBe('dark')
  })
})

describe('isTheme', () => {
  it('accepts only the two themes', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('light')).toBe(true)
    expect(isTheme('system')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })
})
