import { AppDataSchema, CardSchema, freshData, normalizedPrompt, type AppData, type Card } from './types'

export const STORAGE_KEY = 'our_hearts:data:v1'
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024
export const PRIVACY_NOTE = 'Your cards, saved questions and history stay in this browser profile. They do not automatically appear on another device, may be lost when browser data is cleared, and are not encrypted. Moving to another domain requires manual export and import.'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>
export interface Repository {
  read(): AppData
  write(data: AppData): boolean
  warning(): string | null
}

/** Never touches another app's keys, even when this app's data cannot be read. */
export function createRepository(providedStorage?: StorageLike | null): Repository {
  let memory = freshData()
  let initialized = false
  let warning: string | null = null
  let storage: StorageLike | null = null
  let persistent = true
  try {
    storage = providedStorage === undefined ? globalThis.localStorage : providedStorage
    if (!storage) throw new Error('Storage is unavailable.')
  } catch {
    persistent = false
    warning = 'Browser storage is unavailable. Changes are temporary in this tab and will be lost when it closes or reloads.'
  }

  const initialize = () => {
    if (initialized) return
    initialized = true
    if (!persistent) return
    try {
      const raw = storage!.getItem(STORAGE_KEY)
      if (raw !== null) memory = parseImport(raw)
    } catch {
      persistent = false
      warning = 'Saved data could not be read. This tab is using temporary data; your existing storage has been left untouched. Export anything you want to keep before closing.'
    }
  }

  return {
    read() {
      initialize()
      return structuredClone(memory)
    },
    write(data) {
      initialize()
      const validated = AppDataSchema.safeParse(data)
      if (!validated.success) {
        warning = 'This change could not be saved because its data was invalid. Your previous data is unchanged.'
        return false
      }
      memory = structuredClone(validated.data)
      if (!persistent) return false
      try {
        storage!.setItem(STORAGE_KEY, JSON.stringify(memory))
        warning = null
        return true
      } catch {
        persistent = false
        warning = 'Browser storage is full or blocked. Changes are temporary in this tab. Export your data before closing or reloading.'
        return false
      }
    },
    warning() {
      initialize()
      return warning
    },
  }
}

export function parseImport(text: string): AppData {
  if (text.length > MAX_IMPORT_BYTES || new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    throw new Error('This file is too large. Choose an our hearts export smaller than 2 MB.')
  }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('This is not a valid JSON file. Choose an our hearts export.')
  }
  if (typeof raw !== 'object' || raw === null || !('version' in raw) || raw.version !== 1) {
    throw new Error('This export version is not supported. This app accepts version 1 exports.')
  }
  const result = AppDataSchema.safeParse(raw)
  if (!result.success) throw new Error('This export contains missing or invalid data. Your current data has not changed.')
  return result.data
}

export function exportData(data: AppData): string {
  return JSON.stringify(AppDataSchema.parse(data), null, 2)
}

export function previewImport(data: AppData) {
  return {
    customCards: data.customCards.length, saved: data.saved.length, seen: data.history.seen.length,
    hasSession: data.session !== null, names: data.settings.names.join(' & '),
  }
}

const union = (first: string[], second: string[]) => [...new Set([...first, ...second])]

/** Merge preserves this device's preferences, active conversation, and conflicting custom IDs.
 * Replace is intentionally separate; the UI must ask for destructive replacement confirmation.
 */
export function applyImport(current: AppData, incoming: AppData, mode: 'merge' | 'replace'): AppData {
  const valid = AppDataSchema.parse(incoming)
  if (mode === 'replace') return structuredClone(valid)
  const localIds = new Set(current.customCards.map((card) => card.id))
  const localPrompts = new Map(current.customCards.map((card) => [normalizedPrompt(card.prompt), card.id]))
  const aliases = new Map<string, string>()
  const additions = valid.customCards.filter((card) => {
    if (localIds.has(card.id)) return false
    const duplicateId = localPrompts.get(normalizedPrompt(card.prompt))
    if (duplicateId) { aliases.set(card.id, duplicateId); return false }
    return true
  })
  const incomingIds = (ids: string[]) => ids.map((id) => aliases.get(id) ?? id)
  const customCards = [...current.customCards, ...additions]
  if (customCards.length > 500) throw new Error('Merging would exceed the 500 custom-card limit. Remove some cards or choose a smaller export.')
  const merged: AppData = {
    ...current,
    customCards,
    saved: union(current.saved, incomingIds(valid.saved)),
    history: {
      seen: union(current.history.seen, incomingIds(valid.history.seen)),
      completed: union(current.history.completed, incomingIds(valid.history.completed)),
      skipped: union(current.history.skipped, incomingIds(valid.history.skipped)),
    },
  }
  const result = AppDataSchema.safeParse(merged)
  if (!result.success) throw new Error('These exports are too large to merge safely. Your current data has not changed.')
  return result.data
}

export function resetData(data: AppData, scope: 'history' | 'saved' | 'custom' | 'all'): AppData {
  if (scope === 'all') return freshData()
  if (scope === 'history') return { ...data, history: { seen: [], completed: [], skipped: [] }, session: null }
  if (scope === 'saved') return { ...data, saved: [] }
  const ids = new Set(data.customCards.map((card) => card.id))
  return { ...data, customCards: [], saved: data.saved.filter((id) => !ids.has(id)) }
}

export function upsertCustomCard(data: AppData, card: Card): AppData {
  const valid = CardSchema.parse(card)
  if (!valid.id.startsWith('custom-')) throw new Error('Custom cards need a custom- ID.')
  const existing = data.customCards.findIndex((entry) => entry.id === valid.id)
  if (existing < 0 && data.customCards.length >= 500) throw new Error('You can keep up to 500 custom cards on this device.')
  const normalized = normalizedPrompt(valid.prompt)
  if (data.customCards.some((entry) => entry.id !== valid.id && normalizedPrompt(entry.prompt) === normalized)) {
    throw new Error('You already have a custom card with that question.')
  }
  const customCards = [...data.customCards]
  if (existing < 0) customCards.push(valid)
  else customCards[existing] = valid
  return { ...data, customCards }
}

/** An existing queue owns its snapshots. Deleting a custom card only affects future sessions. */
export function deleteCustomCard(data: AppData, id: string): AppData {
  return { ...data, customCards: data.customCards.filter((card) => card.id !== id), saved: data.saved.filter((saved) => saved !== id) }
}
