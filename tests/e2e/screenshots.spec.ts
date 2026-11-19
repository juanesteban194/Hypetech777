import { test } from '@playwright/test'

// Not assertions: these captures are reviewed against §4 of docs/PROMPT_MAESTRO.md at the end of
// every phase (390, 768, 1024 and 1440 px, dark and light). They land in test-results/screenshots.
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const
const SCHEMES = ['dark', 'light'] as const
const PAGES = [{ name: 'home', path: '/' }] as const

for (const { name, path } of PAGES) {
  for (const scheme of SCHEMES) {
    for (const viewport of VIEWPORTS) {
      test(`capture ${name} ${viewport.width}px ${scheme}`, async ({ browser }) => {
        const context = await browser.newContext({ colorScheme: scheme, viewport })
        const page = await context.newPage()
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready)
        await page.screenshot({
          path: `test-results/screenshots/${name}-${viewport.width}-${scheme}.png`,
          fullPage: true,
        })
        await context.close()
      })
    }
  }
}
