import { describe, expect, it } from 'vitest'
import { createSession, revealCard } from './session'
import { applyImport, createRepository, deleteCustomCard, exportData, MAX_IMPORT_BYTES, parseImport, previewImport, resetData, STORAGE_KEY, upsertCustomCard } from './storage'
import { freshData, type Card } from './types'

const custom = (id = 'custom-one', prompt = 'What would make this evening lovely?'): Card => ({ id, prompt, deckId: 'us', kind: 'question', depth: 1, tags: ['ours'] })
function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
}

describe('local repository', () => {
  it('persists exact sessions while leaving origin-shared app data untouched', () => {
    const store = fakeStorage({ 'another_app:data': 'keep this' })
    const repository = createRepository(store)
    const data = repository.read()
    data.saved = ['custom-one']
    data.customCards = [custom()]
    data.session = revealCard(createSession(data.customCards, data.settings, 5, data.history))
    expect(repository.write(data)).toBe(true)
    expect(createRepository(store).read()).toEqual(data)
    expect(store.values.get('another_app:data')).toBe('keep this')
    expect([...store.values.keys()]).toEqual(['another_app:data', STORAGE_KEY])
    expect(repository.warning()).toBeNull()
  })

  it('returns isolated data so accidental mutations cannot bypass writes', () => {
    const repository = createRepository(fakeStorage())
    repository.read().settings.names[0] = 'Changed'
    expect(repository.read().settings.names[0]).toBe('Aleem')
  })

  it('preserves corrupt storage, shows a warning, and remains usable in memory', () => {
    const store = fakeStorage({ [STORAGE_KEY]: '{broken', 'another:data': 'untouched' })
    const repository = createRepository(store)
    expect(repository.read()).toEqual(freshData())
    expect(repository.warning()).toMatch(/temporary/)
    const next = { ...freshData(), saved: ['laughs-01'] }
    expect(repository.write(next)).toBe(false)
    expect(repository.read()).toEqual(next)
    expect(store.values.get(STORAGE_KEY)).toBe('{broken')
    expect(store.values.get('another:data')).toBe('untouched')
  })

  it('handles disabled storage and read exceptions without crashing', () => {
    const blocked = createRepository({ getItem() { throw new Error('Blocked') }, setItem() { throw new Error('Blocked') } })
    expect(blocked.read()).toEqual(freshData())
    expect(blocked.warning()).toMatch(/temporary/)
    const unavailable = createRepository(null)
    expect(unavailable.write({ ...freshData(), saved: ['one'] })).toBe(false)
    expect(unavailable.read().saved).toEqual(['one'])
    expect(unavailable.warning()).toMatch(/unavailable/)
  })

  it('retains a failed quota write in memory and reports the lack of persistence', () => {
    const repository = createRepository({ getItem: () => null, setItem() { throw new DOMException('Full', 'QuotaExceededError') } })
    const data = { ...freshData(), saved: ['one'] }
    expect(repository.write(data)).toBe(false)
    expect(repository.warning()).toMatch(/full or blocked/)
    expect(repository.read()).toEqual(data)
  })

  it('refuses invalid writes without replacing previous data', () => {
    const repository = createRepository(fakeStorage())
    const broken = freshData()
    broken.settings.names[0] = ''
    expect(repository.write(broken)).toBe(false)
    expect(repository.read()).toEqual(freshData())
    expect(repository.warning()).toMatch(/invalid/)
  })
})

describe('exports, imports and scoped changes', () => {
  it('round-trips all current data and presents a useful preview', () => {
    const data = upsertCustomCard(freshData(), custom())
    data.saved = ['custom-one']
    data.session = revealCard(createSession(data.customCards, data.settings, 5, data.history))
    expect(parseImport(exportData(data))).toEqual(data)
    expect(previewImport(data)).toEqual({ customCards: 1, saved: 1, seen: 0, hasSession: true, names: 'Aleem & Nurul' })
  })

  it('rejects malformed, oversized, future-version and structurally invalid data', () => {
    expect(() => parseImport('not json')).toThrow(/JSON/)
    expect(() => parseImport(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow(/large/)
    expect(() => parseImport(JSON.stringify({ ...freshData(), version: 2 }))).toThrow(/version/)
    expect(() => parseImport(JSON.stringify({ ...freshData(), settings: {} }))).toThrow(/invalid/)
    expect(() => parseImport(JSON.stringify({ ...freshData(), customCards: [custom('builtin-id')] }))).toThrow(/invalid/)
    expect(() => parseImport(JSON.stringify({ ...freshData(), saved: ['same', 'same'] }))).toThrow(/invalid/)
    expect(() => parseImport(JSON.stringify({ ...freshData(), customCards: [custom(), custom('custom-copy', 'WHAT would make this evening lovely!')] }))).toThrow(/invalid/)
  })

  it('bounds UTF-8 bytes and treats imported markup as ordinary text', () => {
    expect(() => parseImport('♥'.repeat(MAX_IMPORT_BYTES / 2))).toThrow(/large/)
    const data = upsertCustomCard(freshData(), custom('custom-text', '<img src=x onerror=alert(1)>'))
    expect(parseImport(exportData(data)).customCards[0]!.prompt).toBe('<img src=x onerror=alert(1)>')
  })

  it('rejects duplicate queues, impossible progress and follow-ups outside the chosen depth', () => {
    const data = freshData()
    const card = { ...custom(), followUp: { prompt: 'A deeper follow-up?', depth: 3 as const } }
    data.session = createSession([card], data.settings, 5, data.history)
    const duplicate = structuredClone(data)
    duplicate.session!.queue.push(card)
    expect(() => parseImport(JSON.stringify(duplicate))).toThrow(/invalid/)
    const impossible = structuredClone(data)
    impossible.session!.index = 50
    expect(() => parseImport(JSON.stringify(impossible))).toThrow(/invalid/)
    const tooDeep = structuredClone(data)
    tooDeep.session = { ...revealCard(tooDeep.session!), followUpOpen: true }
    expect(() => parseImport(JSON.stringify(tooDeep))).toThrow(/invalid/)
  })

  it('merges unique content and history while retaining local preferences and session', () => {
    const local = upsertCustomCard(freshData(), custom())
    local.settings.theme = 'dusk'
    local.session = createSession(local.customCards, local.settings, 5, local.history)
    local.saved = ['one']
    const incoming = upsertCustomCard(upsertCustomCard(freshData(), custom('custom-one', 'A different version of this card?')), custom('custom-two', 'A new question from elsewhere?'))
    incoming.saved = ['one', 'two']
    incoming.history.seen = ['two']
    const merged = applyImport(local, incoming, 'merge')
    expect(merged.customCards).toHaveLength(2)
    expect(merged.customCards[0]!.prompt).toBe(local.customCards[0]!.prompt)
    expect(merged.saved).toEqual(['one', 'two'])
    expect(merged.history.seen).toEqual(['two'])
    expect(merged.settings.theme).toBe('dusk')
    expect(merged.session).toEqual(local.session)
    expect(applyImport(local, incoming, 'replace')).toEqual(incoming)
  })

  it('editing or deleting a custom card preserves the exact active snapshot', () => {
    let data = upsertCustomCard(freshData(), custom())
    data.saved = ['custom-one']
    data.session = createSession(data.customCards, data.settings, 5, data.history)
    const original = data.session.queue[0]!.prompt
    data = upsertCustomCard(data, custom('custom-one', 'What should our next quiet date include?'))
    expect(data.session!.queue[0]!.prompt).toBe(original)
    data = deleteCustomCard(data, 'custom-one')
    expect(data.customCards).toHaveLength(0)
    expect(data.saved).toHaveLength(0)
    expect(data.session!.queue[0]!.prompt).toBe(original)
    expect(parseImport(exportData(data))).toEqual(data)
  })

  it('merges duplicate custom questions under the existing ID without losing bookmarks', () => {
    const local = upsertCustomCard(freshData(), custom())
    const incoming = upsertCustomCard(freshData(), custom('custom-copy', 'WHAT would make this evening lovely!'))
    incoming.saved = ['custom-copy']
    incoming.history.seen = ['custom-copy']
    const merged = applyImport(local, incoming, 'merge')
    expect(merged.customCards).toEqual(local.customCards)
    expect(merged.saved).toEqual(['custom-one'])
    expect(merged.history.seen).toEqual(['custom-one'])
  })

  it('rejects normalized duplicate custom prompts and invalid custom references', () => {
    const data = upsertCustomCard(freshData(), custom())
    expect(() => upsertCustomCard(data, custom('custom-two', 'WHAT would make this evening lovely!'))).toThrow(/already/)
    expect(() => upsertCustomCard(data, custom('reserved-id'))).toThrow(/custom-/)
  })

  it('resets only the requested scope and never mutates the input', () => {
    const data = upsertCustomCard(freshData(), custom())
    data.settings.theme = 'dusk'
    data.saved = ['custom-one', 'laughs-01']
    data.history.seen = ['laughs-01']
    data.session = createSession(data.customCards, data.settings, 5, data.history)
    expect(resetData(data, 'saved').saved).toEqual([])
    expect(resetData(data, 'saved').customCards).toEqual(data.customCards)
    expect(resetData(data, 'history').session).toBeNull()
    expect(resetData(data, 'history').history.seen).toEqual([])
    expect(resetData(data, 'custom').saved).toEqual(['laughs-01'])
    expect(resetData(data, 'custom').session).toEqual(data.session)
    expect(resetData(data, 'all')).toEqual(freshData())
    expect(data.customCards).toHaveLength(1)
    expect(data.settings.theme).toBe('dusk')
  })
})
