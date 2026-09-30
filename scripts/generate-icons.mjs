import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const source = await readFile(new URL('../public/icons/mark.svg', import.meta.url))
for (const [name, size] of [['icon-192', 192], ['icon-512', 512], ['apple-touch-icon', 180]]) {
  await sharp(source).resize(size, size).png().toFile(fileURLToPath(new URL(`../public/icons/${name}.png`, import.meta.url)))
}
const inner = await sharp(source).resize(384, 384).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#F7F4EF' } })
  .composite([{ input: inner, left: 64, top: 64 }]).png()
  .toFile(fileURLToPath(new URL('../public/icons/icon-maskable-512.png', import.meta.url)))
console.log('Created original 192px, 512px, maskable and Apple touch icons.')
