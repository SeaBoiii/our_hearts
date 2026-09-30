import { expect, type Page } from '@playwright/test'

/** A visible dialog can still be partially transparent. Wait for the actual
 * finite animations/transitions to settle before sampling colors or clicking
 * a newly entered screen. Keep motion enabled so these checks exercise it.
 */
export async function waitForVisualState(page: Page) {
  await expect(page.locator('main')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => {
    const timing = animation.effect?.getComputedTiming()
    return timing?.iterations !== Infinity && (animation.pending || animation.playState === 'running')
  }).length), { message: 'Finite UI animations and transitions have finished' }).toBe(0)
}
