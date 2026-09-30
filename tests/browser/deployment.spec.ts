import { test, expect, type Page } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { waitForVisualState } from './helpers/visual-state'

async function artifactServer(revision = () => 1) {
  const base = process.env.VITE_BASE_PATH || '/our_hearts/'
  const dist = resolve(process.env.PLAYWRIGHT_DIST_DIR || 'dist')
  const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' }
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url!, 'http://localhost').pathname
      if (pathname === '/another-app/sw.js') {
        response.writeHead(200, { 'Content-Type': 'text/javascript' }).end('self.addEventListener("install", () => self.skipWaiting());')
        return
      }
      if (!pathname.startsWith(base)) { response.writeHead(404).end(); return }
      const relative = decodeURIComponent(pathname.slice(base.length)) || 'index.html'
      const file = resolve(dist, relative)
      if (!file.startsWith(`${dist}${sep}`)) { response.writeHead(403).end(); return }
      let body = await readFile(file)
      if (relative === 'sw.js') body = Buffer.concat([body, Buffer.from(`\n// Browser verification revision ${revision()}\n`)])
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body)
    } catch { response.writeHead(404).end() }
  })
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test server did not bind')
  let stopped = false
  return {
    url: `http://127.0.0.1:${address.port}${base}`,
    stop: async () => {
      if (stopped) return
      stopped = true
      server.closeAllConnections()
      await new Promise<void>(done => server.close(() => done()))
    },
  }
}

async function cacheReady(page: Page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    if (registration.active?.state !== 'activated') {
      await new Promise<void>(done => registration.active?.addEventListener('statechange', () => {
        if (registration.active?.state === 'activated') done()
      }))
    }
  })
  await expect.poll(() => page.evaluate(async () => {
    const keys = await caches.keys()
    const appCache = keys.find(key => key.startsWith('our_hearts-'))
    if (!appCache) return false
    const requests = await (await caches.open(appCache)).keys()
    return requests.some(request => request.url.includes('.woff2')) && requests.some(request => request.url.includes('index.html'))
  })).toBe(true)
}

test('manifest, icons, assets, direct hashes, refresh and browser back agree with the configured base', async ({ page, baseURL }) => {
  const failed: string[] = []
  page.on('requestfailed', request => failed.push(request.url()))
  page.on('pageerror', error => failed.push(error.message))
  await page.goto(`${baseURL}#/decks`)
  await expect(page.getByRole('heading', { name: /a mood for every moment/i })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: /a mood for every moment/i })).toBeVisible()
  const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestUrl).toBeTruthy()
  const manifest = await (await page.request.get(new URL(manifestUrl!, baseURL).href)).json()
  const base = new URL(baseURL!).pathname
  expect(manifest.scope).toBe(base)
  expect(manifest.start_url).toBe(`${base}#/together`)
  for (const icon of manifest.icons as { src: string; sizes: string }[]) {
    expect(icon.src.startsWith(base)).toBe(true)
    const response = await page.request.get(new URL(icon.src, baseURL).href)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('image/png')
    const png = await response.body()
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(png.readUInt32BE(16)).toBe(Number(icon.sizes.split('x')[0]))
  }
  await page.goto(`${baseURL}#/saved`)
  await expect(page.getByRole('heading', { name: /a little collection/i })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: /a mood for every moment/i })).toBeVisible()
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex')
  expect(failed).toEqual([])
})

test('cached production shell and exact conversation reload offline without touching sibling data', async ({ page }) => {
  const server = await artifactServer()
  const baseURL = server.url
  try {
  await page.goto(baseURL)
  test.skip(!(await page.evaluate(() => 'serviceWorker' in navigator)), 'This browser runtime does not expose service workers.')
  await page.evaluate(async () => {
    localStorage.setItem('another_app:sentinel', 'keep me')
    const cache = await caches.open('another_app:sentinel')
    await cache.put('/another-app/sentinel', new Response('keep this cache'))
    await navigator.serviceWorker.register('/another-app/sw.js', { scope: '/another-app/' })
  })
  await cacheReady(page)
  // A prompt-mode worker does not claim an already-open document. A completed
  // online navigation confirms this document is under the installed worker.
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    return { scope: registration.scope, script: registration.active?.scriptURL }
  })
  expect(worker.scope).toBe(baseURL)
  expect(worker.script).toBe(`${baseURL}sw.js`)
  await page.getByRole('button', { name: /let.s talk/i }).click()
  await page.getByRole('button', { name: 'Reveal question' }).click()
  const exactSession = await page.evaluate(() => JSON.parse(localStorage.getItem('our_hearts:data:v1')!).session)
  // Stop the real origin rather than WebKit's broken offline emulation:
  // https://github.com/microsoft/playwright/issues/42775
  await server.stop()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Next card' })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('our_hearts:data:v1')!).session)).toEqual(exactSession)
  const savedFontStatus = await page.evaluate(async () => {
    await document.fonts.ready
    return document.fonts.check('16px "Manrope Variable"') && document.fonts.check('24px "Newsreader Variable"')
  })
  expect(savedFontStatus).toBe(true)
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Reset all our hearts data' }).click()
  await page.getByRole('button', { name: 'Confirm reset' }).click()
  expect(await page.evaluate(() => localStorage.getItem('another_app:sentinel'))).toBe('keep me')
  expect(await page.evaluate(async () => (await (await caches.open('another_app:sentinel')).match('/another-app/sentinel'))?.text())).toBe('keep this cache')
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).some(registration => registration.scope.endsWith('/another-app/')))).toBe(true)
  } finally { await server.stop() }
})

// Serve the real artifact on an isolated origin. Only the worker's response bytes
// change; no production files or global worker registrations are modified.
test('a newly installed worker waits during play and applies only after an explicit request', async ({ page }) => {
  let revision = 1
  const server = await artifactServer(() => revision)
  const url = server.url
  try {
    await page.addInitScript(() => sessionStorage.setItem('verification:loads', String(Number(sessionStorage.getItem('verification:loads') || '0') + 1)))
    await page.goto(url)
    await cacheReady(page)
    await page.reload()
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
    await page.getByRole('button', { name: /let.s talk/i }).click()
    await waitForVisualState(page)
    await page.getByRole('button', { name: 'Reveal question' }).click()
    await expect(page.getByRole('button', { name: 'Next card' })).toBeVisible()
    const data = await page.evaluate(() => localStorage.getItem('our_hearts:data:v1'))
    expect(JSON.parse(data!).session.revealed).toBe(true)
    const loads = await page.evaluate(() => sessionStorage.getItem('verification:loads'))
    revision = 2
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
    await expect(page.getByText(/a fresh version is ready/i)).toBeVisible({ timeout: 15_000 })
    expect(await page.evaluate(() => sessionStorage.getItem('verification:loads'))).toBe(loads)
    expect(await page.evaluate(() => localStorage.getItem('our_hearts:data:v1'))).toBe(data)
    await expect(page.getByRole('button', { name: 'Next card' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Update now' })).toHaveCount(0)
    await page.getByRole('link', { name: 'our hearts home' }).click()
    await Promise.all([
      page.waitForEvent('load'),
      page.getByRole('button', { name: 'Update now' }).click(),
    ])
    await expect.poll(() => page.evaluate(() => Number(sessionStorage.getItem('verification:loads')))).toBe(Number(loads) + 1)
    expect(await page.evaluate(() => localStorage.getItem('our_hearts:data:v1'))).toBe(data)
    await expect(page.getByRole('button', { name: /continue our conversation/i })).toBeVisible()
  } finally {
    await server.stop()
  }
})
