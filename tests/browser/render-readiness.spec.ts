import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { waitForVisualState } from './helpers/visual-state'

test('accessibility audits wait for a slow dialog entrance to finish', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./#/saved')
  await page.evaluate(() => document.fonts.ready)
  // Pause the original entrance so the starting state is deterministic even
  // on a busy runner, then resume it to exercise the wait with real motion.
  await page.addStyleTag({ content: '.sheet, .sheet-overlay { animation-duration: 1600ms !important; animation-play-state: paused !important; }' })
  await page.getByRole('button', { name: 'Add our own card', exact: true }).click()
  const dialog = page.getByRole('dialog')
  expect(await dialog.evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(1)
  await page.locator('.sheet, .sheet-overlay').evaluateAll(elements => {
    for (const element of elements) {
      for (const animation of element.getAnimations()) animation.play()
    }
  })
  await waitForVisualState(page)
  await expect(dialog).toHaveCSS('opacity', '1')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations.map(violation => violation.id)).toEqual([])
  await expect(dialog).toHaveCSS('opacity', '1')
})
