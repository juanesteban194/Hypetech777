import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const SCHEMES = ['dark', 'light'] as const

test.describe('home', () => {
  test('renders in es-CO with a single h1 and no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-CO')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    expect(errors).toEqual([])
  })

  for (const scheme of SCHEMES) {
    test(`has no axe violations in ${scheme} theme`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: scheme })
      const page = await context.newPage()
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme)

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
      expect(results.violations).toEqual([])
      await context.close()
    })
  }

  test('follows the system theme on first visit and keeps an explicit choice', async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: 'light' })
    const page = await context.newPage()

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.evaluate(() => localStorage.setItem('theme', 'dark'))
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await context.close()
  })

  test('paints with the active theme tokens', async ({ browser }) => {
    const expected = { dark: 'rgb(7, 8, 10)', light: 'rgb(247, 247, 248)' } as const
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({ colorScheme: scheme })
      const page = await context.newPage()
      await page.goto('/')
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      expect(background, scheme).toBe(expected[scheme])
      await context.close()
    }
  })

  test('preloads at most two fonts', async ({ page }) => {
    await page.goto('/')
    const preloaded = await page.locator('link[rel="preload"][as="font"]').count()
    expect(preloaded).toBeLessThanOrEqual(2)
  })

  test('uses the expanded Archivo cut for the display headline', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const heading = page.getByRole('heading', { level: 1 })
    const stretch = await heading.evaluate((node) => getComputedStyle(node).fontStretch)
    expect(stretch).toBe('125%')
  })
})
