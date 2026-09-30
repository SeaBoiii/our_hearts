/* global document, scrollTo */
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const output = 'docs/screenshots'
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const base = process.env.SCREENSHOT_URL || 'http://127.0.0.1:4173/our_hearts/'
const snap = async name => { await page.waitForTimeout(400); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => { document.activeElement?.blur(); scrollTo({ top: 0, left: 0, behavior: 'instant' }) }); await page.screenshot({ path: `${output}/${name}.png`, fullPage: true }) }
await page.goto(base)
await snap('01-home-desktop-paper')
for (const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024]]) {
  await page.setViewportSize({width,height})
  await snap(`02-home-${width}-paper`)
}
await page.setViewportSize({width:390,height:844})
await page.goto(`${base}#/decks`)
await snap('03-decks-phone-paper')
await page.goto(`${base}#/saved`)
await snap('04-saved-empty-paper')
await page.getByRole('button',{name:'Settings',exact:true}).click()
await snap('05-settings-paper')
await page.getByRole('button',{name:'Dusk Soft & quiet'}).click()
await snap('06-settings-dusk')
await page.keyboard.press('Escape')
await page.goto(`${base}#/together`)
await snap('07-home-phone-dusk')
await page.getByRole('button',{name:'Let’s talk',exact:true}).click()
await snap('08-card-back-dusk')
await page.getByRole('button',{name:'Reveal question'}).click()
await snap('09-card-front-dusk')
await page.getByRole('button',{name:'Save question',exact:true}).click()
await page.getByRole('button',{name:'Settings',exact:true}).click()
await page.getByRole('button',{name:'Paper Warm & light'}).click()
await page.keyboard.press('Escape')
await snap('10-card-front-paper')
await page.getByRole('button',{name:'Next card',exact:true}).click()
await snap('11-card-back-paper')
for (let i = 0; i < 4; i++) {
  await page.getByRole('button',{name:'Reveal question'}).click()
  await page.getByRole('button',{name:'Next card',exact:true}).click()
}
await snap('12-session-closing')
await page.goto(`${base}#/saved`)
await snap('13-saved-populated-paper')
await page.getByRole('button',{name:'Settings',exact:true}).click()
await page.getByRole('button',{name:'Dusk Soft & quiet'}).click()
await page.keyboard.press('Escape')
await snap('14-saved-populated-dusk')
await page.goto(`${base}#/decks`)
await snap('15-decks-dusk')
await page.getByRole('button',{name:'Settings',exact:true}).click()
await page.getByRole('button',{name:'Paper Warm & light'}).click()
await page.keyboard.press('Escape')
await page.evaluate(() => {
  const key = 'our_hearts:data:v1'
  const data = JSON.parse(localStorage.getItem(key))
  const card = { id:'custom-visual-long',deckId:'life',kind:'question',depth:1,tags:['our-own'],prompt:'Imagine an ordinary day together with enough space to enjoy every small detail. '.repeat(6)+'Which detail would you choose to describe first, and what makes it feel like home?' }
  data.customCards.push(card)
  data.session = {...data.session,queue:[card],index:0,revealed:true,followUpOpen:false,speaker:0,seen:[card.id],completed:[],skipped:[],target:1,status:'active',filters:{decks:['life'],maxDepth:1}}
  localStorage.setItem(key,JSON.stringify(data))
})
await page.goto(`${base}#/play`)
await page.reload()
for (const [width,height] of [[320,568],[390,844]]) {
  await page.setViewportSize({width,height})
  await snap(`16-long-question-${width}`)
}
await writeFile(`${output}/console-errors.json`,JSON.stringify(errors,null,2))
await browser.close()
console.log(`Captured actual Chromium screenshots in ${output}. Console errors: ${errors.length}`)
