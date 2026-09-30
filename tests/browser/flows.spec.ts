import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { cards } from '../../src/content/cards'
import { getDailyCard } from '../../src/core/daily'
import { STORAGE_KEY } from '../../src/core/storage'
import { freshData, type AppData } from '../../src/core/types'

test.use({ viewport: { width: 390, height: 844 } })
const browserErrors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on('pageerror', error => errors.push(error.message))
})
test.afterEach(({ page }) => expect(browserErrors.get(page)).toEqual([]))

async function stored(page: Page): Promise<AppData> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY)
}

async function seed(page: Page, data = freshData()) {
  await page.addInitScript(({ key, initial }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(initial))
    if (!localStorage.getItem('another_app:data')) localStorage.setItem('another_app:data', 'leave this alone')
  }, { key: STORAGE_KEY, initial: data })
}

async function rapidClick(page: Page, name: string) {
  const control = page.getByRole('button', { name, exact: true })
  await expect(control).toBeEnabled()
  await control.evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click() })
}

test('five questions: reveal, neutral pass, rapid taps, save, exact resume, and finish', async ({ page }) => {
  await seed(page)
  await page.goto('./')
  await page.getByRole('button', { name: /Let.s talk/ }).click()
  await expect(page.getByText('Aleem starts')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reveal question', exact: true })).toBeVisible()
  const initial = (await stored(page)).session!
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  const prompt = await page.locator('.question-body h1').innerText()
  await expect(page.locator('.question-body h1')).toBeFocused()
  await page.getByRole('button', { name: 'Save question', exact: true }).click()
  await rapidClick(page, 'Next card')
  await expect.poll(async () => (await stored(page)).session!.index).toBe(1)
  expect((await stored(page)).session!.completed).toHaveLength(1)
  await expect(page.getByText('Nurul starts')).toBeVisible()
  await rapidClick(page, 'Pass for now')
  const passed = (await stored(page)).session!
  expect(passed.index).toBe(2)
  expect(passed.completed).toHaveLength(1)
  expect(passed.skipped).toHaveLength(1)
  expect(passed.speaker).toBe(1)
  await page.getByRole('button', { name: 'Share a little moment', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('doesn’t count towards your questions')
  await page.getByRole('button', { name: 'Back to our conversation', exact: true }).click()
  expect((await stored(page)).session).toEqual(passed)
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  const revealed = (await stored(page)).session!
  await page.getByRole('button', { name: 'Pause & return', exact: true }).click()
  await page.getByRole('button', { name: 'Continue our conversation', exact: true }).click()
  await page.reload()
  expect((await stored(page)).session).toEqual(revealed)
  await expect(page.locator('.question-body h1')).toHaveText(revealed.queue[revealed.index]!.prompt)
  await page.getByRole('button', { name: 'Next card', exact: true }).click()
  for (let count = 0; count < 3; count++) {
    await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
    await page.getByRole('button', { name: 'Next card', exact: true }).click()
  }
  await expect(page.getByText('5 questions shared', { exact: true })).toBeVisible()
  const finished = (await stored(page)).session!
  expect(finished.status).toBe('finished')
  expect(finished.queue).toEqual(initial.queue)
  expect(new Set(finished.completed).size).toBe(5)
  await page.getByRole('button', { name: 'Back to our space', exact: true }).click()
  await page.getByRole('link', { name: 'Saved', exact: true }).click()
  await expect(page.getByRole('heading', { name: prompt, exact: true })).toBeVisible()
})

test('mix filters persist, empty selections cannot start, and replacement requires a choice', async ({ page }) => {
  await seed(page)
  await page.goto('./')
  await page.getByRole('button', { name: 'Make it our own', exact: true }).click()
  const sheet = page.getByRole('dialog')
  const checks = sheet.getByRole('checkbox')
  for (const checkbox of await checks.all()) await checkbox.uncheck()
  await expect(sheet.getByRole('button', { name: /Let.s talk/ })).toBeDisabled()
  await expect(sheet.getByText('Choose at least one deck to begin.')).toBeVisible()
  await sheet.getByRole('checkbox', { name: 'Only Us', exact: true }).check()
  await sheet.getByRole('radio', { name: 'Light Easy & playful' }).check()
  await sheet.getByRole('button', { name: 'Nurul', exact: true }).click()
  await sheet.getByRole('button', { name: /Let.s talk/ }).click()
  await expect(page.getByText('Nurul starts')).toBeVisible()
  const started = (await stored(page)).session!
  expect(started.queue.every(card => card.deckId === 'us' && card.depth === 1)).toBe(true)
  expect((await stored(page)).settings.decks).toEqual(['us'])
  await page.getByRole('button', { name: 'Pause & return', exact: true }).click()
  await page.getByRole('button', { name: 'Start a new conversation', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'A new conversation?' })).toBeVisible()
  expect((await stored(page)).session!.id).toBe(started.id)
  await page.getByRole('button', { name: 'Continue ours', exact: true }).click()
  expect((await stored(page)).session!.id).toBe(started.id)
  await page.getByRole('button', { name: 'Pause & return', exact: true }).click()
  await page.getByRole('button', { name: 'Start a new conversation', exact: true }).click()
  await page.getByRole('button', { name: 'Start fresh', exact: true }).click()
  expect((await stored(page)).session!.id).not.toBe(started.id)
})

test('custom cards support create, duplicate validation, edit, save, export, delete, and merge import', async ({ page }) => {
  await seed(page)
  await page.goto('./#/saved')
  await expect(page.getByText('Some questions stay with you.')).toBeVisible()
  await page.getByRole('button', { name: 'Add our own card', exact: true }).click()
  await page.getByRole('textbox', { name: 'Your question' }).fill('Which quiet place shall we explore next?')
  await page.getByRole('button', { name: 'Add our card', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Which quiet place shall we explore next?' })).toBeVisible()
  await page.getByRole('button', { name: 'Add our own card', exact: true }).click()
  await page.getByRole('textbox', { name: 'Your question' }).fill('WHICH quiet place shall we explore next!')
  await page.getByRole('button', { name: 'Add our card', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('already have a custom card')
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Edit our card', exact: true }).click()
  await page.getByRole('textbox', { name: 'Your question' }).fill('What shall we bring on our next nature walk?')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.getByRole('button', { name: 'Save question', exact: true }).click()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export data', exact: true }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('our_hearts-backup.json')
  const backup = await readFile((await download.path())!, 'utf8')
  const exported = JSON.parse(backup) as AppData
  expect(exported.customCards[0]!.prompt).toBe('What shall we bring on our next nature walk?')
  expect(exported.saved).toEqual([exported.customCards[0]!.id])
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Delete our card', exact: true }).click()
  await page.getByRole('button', { name: 'Delete card', exact: true }).click()
  expect((await stored(page)).customCards).toHaveLength(0)
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByLabel('Choose backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) })
  await expect(page.getByRole('dialog', { name: 'A look inside your backup' })).toContainText('1 own cards')
  expect((await stored(page)).customCards).toHaveLength(0)
  await page.getByRole('button', { name: 'Import backup', exact: true }).click()
  expect((await stored(page)).customCards).toEqual(exported.customCards)
  expect((await stored(page)).saved).toEqual(exported.saved)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Our own cards', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search questions' }).fill('nature')
  await expect(page.getByRole('heading', { name: 'What shall we bring on our next nature walk?' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Search questions' }).fill('no matching question')
  await expect(page.getByText('Nothing here just yet.')).toBeVisible()
})

test('imports reject malformed files and preview a confirmed replacement; reset is scoped', async ({ page }) => {
  await seed(page)
  await page.goto('./')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  const file = page.getByLabel('Choose backup file')
  await file.setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{not JSON') })
  await expect(page.getByText('This is not a valid JSON file. Choose an our hearts export.')).toBeVisible()
  const incoming = freshData()
  incoming.settings.theme = 'dusk'
  incoming.settings.names = ['A', 'N']
  incoming.saved = ['laughs-01']
  incoming.customCards = [{ id: 'custom-literal', deckId: 'us', depth: 1, kind: 'question', tags: [], prompt: 'What does <img src=x onerror=alert(1)> mean to us?' }]
  await file.setInputFiles({ name: 'replace.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) })
  await page.getByRole('button', { name: 'Replace', exact: true }).click()
  await page.getByRole('button', { name: 'Import backup', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Yes, replace my data', exact: true })).toBeVisible()
  expect((await stored(page)).settings.names).toEqual(['Aleem', 'Nurul'])
  await page.getByRole('button', { name: 'Yes, replace my data', exact: true }).click()
  expect((await stored(page)).settings.names).toEqual(['A', 'N'])
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dusk')
  await page.getByRole('button', { name: 'Clear saved questions', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm reset', exact: true }).click()
  const reset = await stored(page)
  expect(reset.saved).toEqual([])
  expect(reset.customCards).toHaveLength(1)
  expect(reset.settings.theme).toBe('dusk')
  expect(await page.evaluate(() => localStorage.getItem('another_app:data'))).toBe('leave this alone')
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('link', { name: 'Saved', exact: true }).click()
  await page.getByRole('button', { name: 'Our own cards', exact: true }).click()
  await expect(page.getByRole('heading', { name: incoming.customCards[0]!.prompt })).toBeVisible()
  await expect(page.locator('.saved-card img')).toHaveCount(0)
})

test('corrupt storage stays untouched while temporary conversations remain usable', async ({ page }) => {
  await page.addInitScript(key => { localStorage.setItem(key, '{broken'); localStorage.setItem('another_app:data', 'keep'); }, STORAGE_KEY)
  await page.goto('./')
  await expect(page.getByRole('alert')).toContainText('temporary data')
  await page.getByRole('button', { name: /Let.s talk/ }).click()
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  await expect(page.locator('.question-body h1')).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('{broken')
  expect(await page.evaluate(() => localStorage.getItem('another_app:data'))).toBe('keep')
})

test('blocked storage shows a clear warning and supports a temporary session', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } }))
  await page.goto('./')
  await expect(page.getByRole('alert')).toContainText('storage is unavailable')
  await page.getByRole('button', { name: /Let.s talk/ }).click()
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  await page.getByRole('button', { name: 'Next card', exact: true }).click()
  await expect(page.getByText('Nurul starts')).toBeVisible()
})

test('settings trap keyboard focus, close with Escape, and restore their trigger', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const settings = page.getByRole('button', { name: 'Settings', exact: true })
  await settings.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Make yourself at home' })
  await expect(dialog).toBeVisible()
  for (let index = 0; index < 30; index++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(settings).toBeFocused()
})

test('a small unseen pool ends explicitly and replay requires a deliberate reshuffle', async ({ page }) => {
  const initial = freshData()
  initial.settings.decks = ['us']
  initial.settings.maxDepth = 1
  initial.history.seen = cards.filter(card => card.deckId === 'us' && card.kind === 'question' && card.depth === 1).map(card => card.id)
  initial.customCards = [{ id: 'custom-last', deckId: 'us', depth: 1, kind: 'question', tags: [], prompt: 'What tiny detail made today a little brighter?', followUp: { prompt: 'What would you like support with next?', depth: 3 } }]
  await seed(page, initial)
  await page.goto('./')
  await page.getByRole('button', { name: /Let.s talk/ }).click()
  expect((await stored(page)).session!.queue.map(card => card.id)).toEqual(['custom-last'])
  await page.getByRole('button', { name: 'Reveal question', exact: true }).click()
  await expect(page.getByRole('button', { name: 'A little deeper', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Next card', exact: true }).click()
  await expect(page.getByText('1 question shared', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reshuffle this selection', exact: true })).toBeVisible()
  expect((await stored(page)).session!.status).toBe('exhausted')
  await page.getByRole('button', { name: 'Reshuffle this selection', exact: true }).click()
  const replay = (await stored(page)).session!
  expect(replay.allowSeen).toBe(true)
  expect(replay.queue.length).toBeGreaterThan(1)
  expect(new Set(replay.queue.map(card => card.id)).size).toBe(replay.queue.length)
  await expect(page.getByRole('button', { name: 'Reveal question', exact: true })).toBeVisible()
})

test('the visible daily card changes at Singapore midnight without a reload', async ({ page }) => {
  const before = new Date('2026-09-30T15:59:59.000Z')
  const after = new Date('2026-09-30T16:00:00.100Z')
  await page.clock.install({ time: new Date(before.getTime() - 10_000) })
  await page.clock.pauseAt(before)
  await page.goto('./')
  await page.getByRole('button', { name: /Just one today/ }).click()
  await expect(page.getByRole('dialog').locator('blockquote')).toHaveText(getDailyCard(cards, before).prompt)
  await page.clock.fastForward(1_100)
  await expect(page.getByRole('dialog').locator('blockquote')).toHaveText(getDailyCard(cards, after).prompt)
})
