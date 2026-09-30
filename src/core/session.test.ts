import { describe, expect, it } from 'vitest'
import { advanceCard, createSession, currentCard, mergeSessionHistory, revealCard, toggleFollowUp } from './session'
import { DEFAULT_SETTINGS, SessionSchema, type Card, type History, type Settings } from './types'

const emptyHistory = (): History => ({ seen: [], completed: [], skipped: [] })
const question = (id: string, overrides: Partial<Card> = {}): Card => ({ id, deckId: 'laughs', kind: 'question', prompt: `What would you choose for ${id}?`, depth: 1, tags: [], ...overrides })
const settings = (overrides: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...overrides })

describe('conversation sessions', () => {
  it('filters by selected deck and depth and never automatically includes activities', () => {
    const cards = [question('yes'), question('deep', { depth: 3 }), question('other', { deckId: 'us' }), question('moment', { kind: 'activity' })]
    const session = createSession(cards, settings({ decks: ['laughs'], maxDepth: 2 }), 5, emptyHistory())
    expect(session.queue.map((card) => card.id)).toEqual(['yes'])
    expect(session.status).toBe('active')
  })

  it('reserves every eligible card once, even when the pool is smaller than the target', () => {
    const session = createSession([question('one'), question('two'), question('one')], settings(), 5, emptyHistory())
    expect(session.queue).toHaveLength(2)
    expect(new Set(session.queue.map((card) => card.id)).size).toBe(2)
    let played = session
    while (played.status === 'active') played = advanceCard(revealCard(played), 'complete')
    expect(played.status).toBe('exhausted')
    expect(played.reason).toBe('pool-exhausted')
    expect(played.completed).toHaveLength(2)
    expect(SessionSchema.safeParse(played).success).toBe(true)
  })

  it('chooses unseen questions and requires explicit permission before replaying seen cards', () => {
    const history = { ...emptyHistory(), seen: ['seen'] }
    const cards = [question('seen'), question('new')]
    expect(createSession(cards, settings(), 5, history).queue.map((card) => card.id)).toEqual(['new'])
    const exhausted = createSession([question('seen')], settings(), 5, history)
    expect(exhausted.status).toBe('exhausted')
    expect(exhausted.reason).toBe('all-seen')
    expect(createSession(cards, settings(), 5, history, true).queue).toHaveLength(2)
  })

  it('gives an explicit empty selection result with no looping', () => {
    const session = createSession([question('one')], settings({ decks: [] }), null, emptyHistory())
    expect(session.status).toBe('exhausted')
    expect(session.reason).toBe('empty-selection')
    expect(currentCard(session)).toBeUndefined()
    expect(revealCard(session)).toBe(session)
  })

  it('begins with the chosen speaker, flips only after completion, and excludes passes from the target', () => {
    let session = createSession(['one', 'two', 'three'].map((id) => question(id)), settings({ startingSpeaker: 1 }), 2, emptyHistory())
    expect(session.speaker).toBe(1)
    const skippedId = currentCard(session)!.id
    session = advanceCard(session, 'skip')
    expect(session.speaker).toBe(1)
    expect(session.completed).toHaveLength(0)
    expect(session.skipped).toEqual([skippedId])
    expect(session.seen).toHaveLength(0)
    session = advanceCard(revealCard(session), 'complete')
    expect(session.speaker).toBe(0)
    expect(session.status).toBe('active')
    session = advanceCard(revealCard(session), 'complete')
    expect(session.speaker).toBe(1)
    expect(session.status).toBe('finished')
    expect(session.completed).toHaveLength(2)
    expect(SessionSchema.safeParse(session).success).toBe(true)
  })

  it('requires reveal before completion and ignores an immediate second complete', () => {
    const concealed = createSession([question('one'), question('two')], settings(), 2, emptyHistory())
    expect(advanceCard(concealed, 'complete')).toBe(concealed)
    const next = advanceCard(revealCard(concealed), 'complete')
    expect(next.index).toBe(1)
    expect(next.revealed).toBe(false)
    expect(advanceCard(next, 'complete')).toBe(next)
  })

  it('records revealed, completed, and skipped questions separately', () => {
    const initial = createSession([question('one')], settings(), 5, emptyHistory())
    const passed = advanceCard(revealCard(initial), 'skip')
    const history = mergeSessionHistory(emptyHistory(), passed)
    expect(history).toEqual({ seen: ['one'], completed: [], skipped: ['one'] })
    expect(mergeSessionHistory(history, passed)).toEqual(history)
  })

  it('opens follow-ups only after reveal and only within the chosen comfort level', () => {
    const card = question('one', { followUp: { prompt: 'What would help with that?', depth: 2 } })
    const concealed = createSession([card], settings(), 1, emptyHistory())
    expect(toggleFollowUp(concealed)).toBe(concealed)
    const shown = revealCard(concealed)
    expect(toggleFollowUp(shown).followUpOpen).toBe(true)
    expect(toggleFollowUp(toggleFollowUp(shown)).followUpOpen).toBe(false)
    const light = revealCard(createSession([card], settings({ maxDepth: 1 }), 1, emptyHistory()))
    expect(toggleFollowUp(light)).toBe(light)
  })

  it('balances available decks and moves gently from light to thoughtful within a target', () => {
    const cards = DEFAULT_SETTINGS.decks.flatMap((deckId) => [1, 2].flatMap((depth) => Array.from({ length: 5 }, (_, index) => question(`${deckId}-${depth}-${index}`, { deckId, depth: depth as 1 | 2 }))))
    const session = createSession(cards, settings(), 12, emptyHistory())
    expect(session.queue.slice(0, 6).every((card) => card.depth === 1)).toBe(true)
    expect(new Set(session.queue.slice(0, 6).map((card) => card.deckId)).size).toBe(6)
    expect(session.queue.slice(6, 12).every((card) => card.depth === 2)).toBe(true)
    expect(new Set(session.queue.slice(6, 12).map((card) => card.deckId)).size).toBe(6)
  })

  it('snapshots content and survives serialization without reshuffling or losing state', () => {
    const cards = [question('custom-example'), question('two')]
    let session = createSession(cards, settings(), null, emptyHistory())
    session = revealCard(session)
    const snapshot = SessionSchema.parse(JSON.parse(JSON.stringify(session)))
    cards[0]!.prompt = 'An edited question for a future session?'
    expect(snapshot).toEqual(session)
    expect(session.queue.find((card) => card.id === 'custom-example')!.prompt).not.toBe(cards[0]!.prompt)
    expect(advanceCard(snapshot, 'complete')).toEqual(advanceCard(session, 'complete'))
  })

  it('stops an open-ended session when its queue runs out and never repeats silently', () => {
    const session = createSession([question('one')], settings(), null, emptyHistory())
    const ended = advanceCard(revealCard(session), 'complete')
    expect(ended.status).toBe('exhausted')
    expect(advanceCard(ended, 'complete')).toBe(ended)
  })

  it('rejects invalid targets', () => {
    for (const target of [0, -1, 1.2, NaN, 10_000]) expect(() => createSession([], settings(), target, emptyHistory())).toThrow()
  })
})
