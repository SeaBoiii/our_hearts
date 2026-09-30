import type { Card } from './types'

/** This pool is a published contract: changing IDs or their order requires a new version.
 * Keep it explicit and independent of the order of the full content collection.
 */
export const DAILY_POOL_VERSION = 'v1'
export const DAILY_POOL_IDS = [
  'laughs-01', 'laughs-02', 'laughs-03', 'laughs-04', 'laughs-05', 'laughs-06',
  'know-01', 'know-02', 'know-03', 'know-04', 'know-05', 'know-06',
  'story-01', 'story-02', 'story-03', 'story-04', 'story-05', 'story-06',
  'closer-01', 'closer-02', 'closer-03', 'closer-04', 'closer-05', 'closer-06',
  'life-01', 'life-02', 'life-03', 'life-04', 'life-05', 'life-06',
  'us-01', 'us-02', 'us-03', 'us-04', 'us-05', 'us-06',
] as const

const singaporeDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit',
})

function singaporeParts(date: Date) {
  const parts = singaporeDate.formatToParts(date)
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === name)!.value
  return { year: part('year'), month: part('month'), day: part('day') }
}

export function singaporeDateKey(date: Date = new Date()): string {
  const { year, month, day } = singaporeParts(date)
  return `${year}-${month}-${day}`
}

export function dailyCardId(date: Date = new Date()): string {
  const key = `${DAILY_POOL_VERSION}:${singaporeDateKey(date)}`
  // FNV-1a uses defined 32-bit integer arithmetic on every browser/device.
  let hash = 2166136261
  for (let index = 0; index < key.length; index++) hash = Math.imul(hash ^ key.charCodeAt(index), 16777619)
  return DAILY_POOL_IDS[(hash >>> 0) % DAILY_POOL_IDS.length]!
}

export function getDailyCard(cards: readonly Card[], date: Date = new Date()): Card {
  const id = dailyCardId(date)
  const card = cards.find((entry) => entry.id === id)
  if (!card || card.kind !== 'question' || card.depth > 2 || card.id.startsWith('custom-')) {
    throw new Error(`The published daily pool ${DAILY_POOL_VERSION} is missing an eligible question: ${id}`)
  }
  return card
}

/** Singapore has a fixed UTC+08:00 offset. Calendar parts, including date rollover,
 * are explicitly Singapore parts; the device timezone never enters this calculation.
 * Recompute on visibilitychange as mobile browsers can suspend background timers.
 */
export function millisecondsUntilSingaporeMidnight(date: Date = new Date()): number {
  const { year, month, day } = singaporeParts(date)
  const next = Date.UTC(Number(year), Number(month) - 1, Number(day) + 1) - 8 * 60 * 60 * 1000
  return Math.max(1, next - date.getTime())
}
