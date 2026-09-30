import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { questions } from '../../src/content/cards'
import { createSession } from '../../src/core/session'
import { STORAGE_KEY } from '../../src/core/storage'
import { freshData, type AppData, type Card } from '../../src/core/types'

async function seed(page: Page, data: AppData = freshData()) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: data })
}

async function assertAxe(page: Page, state: string) {
  await page.evaluate(() => document.fonts.ready)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  if (results.violations.length) {
    await test.info().attach(`axe-${state}`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' })
  }
  expect.soft(results.violations.map(({ id, impact, nodes }) => ({ id, impact, elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), state).toEqual([])
}

async function assertNoHorizontalOverflow(page: Page, state: string) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    sheets: [...document.querySelectorAll<HTMLElement>('[role="dialog"]')].map((node) => ({ client: node.clientWidth, scroll: node.scrollWidth })),
    offenders: [...document.querySelectorAll<HTMLElement>('body *')].filter((node) => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1)
    }).slice(0, 12).map((node) => ({ tag: node.tagName, class: node.className, right: Math.round(node.getBoundingClientRect().right) })),
  }))
  expect(overflow.document, `${state}: ${JSON.stringify(overflow.offenders)}`).toBeLessThanOrEqual(overflow.viewport + 1)
  for (const sheet of overflow.sheets) expect(sheet.scroll, `${state}: dialog`).toBeLessThanOrEqual(sheet.client + 1)
}

function longCard(): Card {
  return {
    id: 'custom-accessible-long', deckId: 'life', kind: 'question', depth: 1, tags: ['our-own'],
    prompt: 'Imagine an ordinary day together with enough space to enjoy every small detail. '.repeat(6) + 'Which detail would you choose to describe first, and what makes it feel like home?',
  }
}

for (const theme of ['paper', 'dusk'] as const) {
  test(`${theme}: primary screens and sheets have no WCAG axe violations`, async ({ page }) => {
    test.setTimeout(90_000)
    const data = freshData()
    data.settings.theme = theme
    await seed(page, data)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('./')
    await assertAxe(page, `${theme}-home`)

    await page.getByRole('link', { name: 'Decks', exact: true }).click()
    await assertAxe(page, `${theme}-decks`)
    await page.getByRole('link', { name: 'Saved', exact: true }).click()
    await expect(page.getByText('Some questions stay with you.')).toBeVisible()
    await assertAxe(page, `${theme}-saved-empty`)

    await page.getByRole('button', { name: 'Add our own card', exact: true }).click()
    await assertAxe(page, `${theme}-card-editor`)
    await page.getByRole('textbox', { name: 'Your question' }).fill('Which little detail would make today feel especially ours?')
    await page.getByRole('button', { name: 'Add our card', exact: true }).click()
    await page.getByRole('button', { name: 'Save question', exact: true }).click()
    await page.getByRole('button', { name: 'Saved questions', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Which little detail would make today feel especially ours?' })).toBeVisible()
    await assertAxe(page, `${theme}-saved-populated`)

    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await assertAxe(page, `${theme}-settings`)
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: 'Together', exact: true }).click()
    await page.getByRole('button', { name: /Let.s talk/ }).click()
    await assertAxe(page, `${theme}-card-back`)
    await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
    await expect(page.locator('.question-body h1')).toBeFocused()
    await assertAxe(page, `${theme}-question`)
  })
}

for (const viewport of [
  { width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 },
  { width: 430, height: 932 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 },
]) {
  test(`${viewport.width}px: core pages, settings, and long questions do not overflow`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const data = freshData()
    const card = longCard()
    data.customCards = [card]
    data.saved = [card.id]
    data.session = createSession([card], data.settings, 5, data.history)
    await seed(page, data)
    await page.goto('./')
    await assertNoHorizontalOverflow(page, 'home')
    await page.getByRole('link', { name: 'Decks', exact: true }).click()
    await assertNoHorizontalOverflow(page, 'decks')
    await page.getByRole('link', { name: 'Saved', exact: true }).click()
    await expect(page.locator('.saved-card h2')).toHaveText(card.prompt)
    await assertNoHorizontalOverflow(page, 'saved long question')
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await assertNoHorizontalOverflow(page, 'settings')
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: 'Together', exact: true }).click()
    await page.getByRole('button', { name: 'Continue our conversation', exact: true }).click()
    await expect(page.locator('.question-body')).toHaveCount(0)
    await assertNoHorizontalOverflow(page, 'card back')
    await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(card.prompt)
    await assertNoHorizontalOverflow(page, 'revealed long question')
    const clipped = await page.locator('.question-body h1').evaluate((node) => node.scrollHeight > node.clientHeight + 1)
    expect(clipped, 'Long question is allowed to grow vertically').toBe(false)
    await page.getByRole('button', { name: 'Pass for now', exact: true }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Pass for now', exact: true })).toBeInViewport()
  })
}

test('keyboard opens a sheet, traps focus, closes with Escape, and restores the trigger', async ({ page, browserName }) => {
  await seed(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // This Windows WebKit port skips anchor links during native Tab traversal.
  // Keep the sheet scenario entirely keyboard-driven from its first control.
  const nativeTabSkipsLinks = browserName === 'webkit' && process.platform === 'win32'
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await page.keyboard.press('Tab')
  if (!nativeTabSkipsLinks) {
    await expect(skipLink).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
    await page.keyboard.press('Shift+Tab')
  }
  const settings = page.getByRole('button', { name: 'Settings', exact: true })
  await expect(settings).toBeFocused()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  for (let index = 0; index < 32; index += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Shift+Tab')
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(settings).toBeFocused()
  await expect(settings).toHaveCSS('outline-style', 'solid')
  if (nativeTabSkipsLinks) {
    // Verify skip-link activation separately; this is a focus API check, not a
    // claim that Windows WebKit's native Tab policy traversed an anchor link.
    await skipLink.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  }
})

test('reduced motion disables animated card transitions while keeping reveal usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const data = freshData()
  data.session = createSession([questions[0]], data.settings, 5, data.history)
  await seed(page, data)
  await page.goto('./#/play')
  await expect(page.locator('.play-card')).toHaveCSS('animation-name', 'none')
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(questions[0].prompt)
  await expect(page.locator('.play-card')).toHaveCSS('animation-name', 'none')
  await expect(page.getByRole('button', { name: 'Next card', exact: true })).toBeEnabled()
})

test('200% text enlargement keeps essential home and question controls reachable', async ({ page }) => {
  await seed(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  // Simulate text-only enlargement from a snapshot of computed sizes; changing
  // root font-size alone would not exercise this design's pixel-based typography.
  const enlarge = async () => page.evaluate(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('h1,h2,h3,p,a,button,span,small,strong,em,label,legend,input,select,textarea')]
      .filter((element) => !element.dataset.a11yExpanded)
    const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize))
    elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; element.dataset.a11yExpanded = 'true' })
  })
  await enlarge()
  await assertNoHorizontalOverflow(page, 'home at 200% text')
  await page.getByRole('button', { name: /Let.s talk/ }).click()
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  await enlarge()
  await assertNoHorizontalOverflow(page, 'question at 200% text')
  await page.getByRole('button', { name: 'Next card', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Next card', exact: true })).toBeInViewport()
  await page.getByRole('button', { name: 'Pass for now', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Pass for now', exact: true })).toBeInViewport()
})
