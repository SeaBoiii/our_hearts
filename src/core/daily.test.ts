import { afterEach, describe, expect, it, vi } from 'vitest'
import { cards } from '../content/cards'
import { dailyCardId, DAILY_POOL_IDS, DAILY_POOL_VERSION, getDailyCard, millisecondsUntilSingaporeMidnight, singaporeDateKey } from './daily'

afterEach(() => vi.unstubAllEnvs())

describe('a shared Singapore daily question', () => {
  it('publishes an explicit unique versioned pool of built-in light/thoughtful questions', () => {
    expect(DAILY_POOL_VERSION).toBe('v1')
    expect(DAILY_POOL_IDS).toHaveLength(36)
    expect(new Set(DAILY_POOL_IDS).size).toBe(36)
    for (const id of DAILY_POOL_IDS) {
      const card = cards.find((entry) => entry.id === id)
      expect(card).toBeDefined()
      expect(card!.kind).toBe('question')
      expect(card!.depth).toBeLessThanOrEqual(2)
      expect(card!.id.startsWith('custom-')).toBe(false)
    }
  })

  it('derives date parts using Asia/Singapore at the midnight boundary', () => {
    expect(singaporeDateKey(new Date('2027-01-31T15:59:59.999Z'))).toBe('2027-01-31')
    expect(singaporeDateKey(new Date('2027-01-31T16:00:00.000Z'))).toBe('2027-02-01')
    expect(singaporeDateKey(new Date('2027-12-31T16:00:00.000Z'))).toBe('2028-01-01')
  })

  it('selects the same question throughout one Singapore day and independent of content order', () => {
    const morning = new Date('2026-09-29T16:00:00Z')
    const evening = new Date('2026-09-30T15:59:59Z')
    expect(dailyCardId(morning)).toBe(dailyCardId(evening))
    expect(getDailyCard(cards, morning)).toEqual(getDailyCard([...cards].reverse(), evening))
    // Fixed test vector locks the published v1 algorithm against accidental changes.
    expect(dailyCardId(morning)).toBe('know-03')
  })

  it('is independent of the device timezone', () => {
    const instant = new Date('2026-09-30T16:30:00Z')
    const expected = dailyCardId(instant)
    for (const timezone of ['Pacific/Honolulu', 'America/New_York', 'Europe/London', 'Asia/Tokyo']) {
      vi.stubEnv('TZ', timezone)
      expect(singaporeDateKey(instant)).toBe('2026-10-01')
      expect(dailyCardId(instant)).toBe(expected)
    }
  })

  it('calculates midnight waits through month, year, and leap-day rollovers', () => {
    expect(millisecondsUntilSingaporeMidnight(new Date('2027-01-31T15:59:59.999Z'))).toBe(1)
    expect(millisecondsUntilSingaporeMidnight(new Date('2027-12-31T15:00:00Z'))).toBe(3_600_000)
    expect(millisecondsUntilSingaporeMidnight(new Date('2028-02-28T16:00:00Z'))).toBe(86_400_000)
    expect(millisecondsUntilSingaporeMidnight(new Date('2028-02-29T15:30:00Z'))).toBe(1_800_000)
  })

  it('fails loudly if the published pool loses a card instead of silently changing the daily selection', () => {
    expect(() => getDailyCard([], new Date('2026-09-30T12:00:00Z'))).toThrow(/published daily pool/)
  })
})
