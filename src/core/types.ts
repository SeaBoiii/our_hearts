import { z } from 'zod'

export const DECK_IDS = ['laughs', 'know', 'story', 'closer', 'life', 'us'] as const
export const DeckIdSchema = z.enum(DECK_IDS)
export type DeckId = z.infer<typeof DeckIdSchema>
export const DepthSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])
const IdSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)
const IdListSchema = z.array(IdSchema).max(20_000)
const UniqueIdListSchema = IdListSchema.refine((ids) => new Set(ids).size === ids.length, 'Card IDs must be unique.')

export const CardSchema = z.object({
  id: IdSchema,
  deckId: DeckIdSchema,
  kind: z.enum(['question', 'activity']),
  prompt: z.string().trim().min(3).max(600),
  depth: DepthSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  followUp: z.object({ prompt: z.string().trim().min(3).max(400), depth: DepthSchema }).optional(),
})
export type Card = z.infer<typeof CardSchema>

export function normalizedPrompt(prompt: string): string {
  return prompt.toLocaleLowerCase('en').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export const SettingsSchema = z.object({
  names: z.tuple([z.string().trim().min(1).max(40), z.string().trim().min(1).max(40)]),
  theme: z.enum(['paper', 'dusk']),
  maxDepth: DepthSchema,
  startingSpeaker: z.union([z.literal(0), z.literal(1)]),
  decks: z.array(DeckIdSchema).max(6).refine((ids) => new Set(ids).size === ids.length, 'Select each deck once.'),
})
export type Settings = z.infer<typeof SettingsSchema>

export const HistorySchema = z.object({
  seen: UniqueIdListSchema,
  completed: UniqueIdListSchema,
  skipped: UniqueIdListSchema,
})
export type History = z.infer<typeof HistorySchema>

export const SessionSchema = z.object({
  id: IdSchema,
  createdAt: z.string().datetime(),
  queue: z.array(CardSchema).max(5_000),
  index: z.number().int().min(0).max(5_000),
  revealed: z.boolean(),
  followUpOpen: z.boolean(),
  speaker: z.union([z.literal(0), z.literal(1)]),
  seen: UniqueIdListSchema,
  completed: UniqueIdListSchema,
  skipped: UniqueIdListSchema,
  target: z.number().int().min(1).max(5_000).nullable(),
  status: z.enum(['active', 'finished', 'exhausted']),
  reason: z.enum(['empty-selection', 'all-seen', 'pool-exhausted']).optional(),
  filters: z.object({ decks: z.array(DeckIdSchema).max(6), maxDepth: DepthSchema }),
  allowSeen: z.boolean(),
}).superRefine((session, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
  const queueIds = new Set(session.queue.map((card) => card.id))
  if (queueIds.size !== session.queue.length) fail('A session cannot repeat a card.')
  if (session.index > session.queue.length) fail('The session position is outside its queue.')
  if (session.queue.some((card) => card.kind !== 'question' || card.depth > session.filters.maxDepth || !session.filters.decks.includes(card.deckId))) fail('The session contains cards outside its filters.')
  if ([...session.seen, ...session.completed, ...session.skipped].some((id) => !queueIds.has(id))) fail('Session history refers to a card outside its queue.')
  const advanced = [...session.completed, ...session.skipped]
  if (new Set(advanced).size !== advanced.length || advanced.length !== session.index) fail('Session progress does not match its position.')
  const earlier = new Set(session.queue.slice(0, session.index).map((card) => card.id))
  if (advanced.some((id) => !earlier.has(id))) fail('Session progress refers to an unplayed card.')
  if (session.completed.some((id) => !session.seen.includes(id))) fail('Completed questions must have been revealed.')
  const current = session.queue[session.index]
  if (session.status === 'active' && (!current || (session.target !== null && session.completed.length >= session.target))) fail('This active session has already ended.')
  if (session.status === 'finished' && (session.target === null || session.completed.length !== session.target)) fail('A finished session must meet its question target.')
  if (session.status === 'exhausted' && session.index !== session.queue.length) fail('An exhausted session must reach the end of its queue.')
  if (session.revealed && (!current || !session.seen.includes(current.id))) fail('The revealed card must appear in seen history.')
  if (session.followUpOpen && (!session.revealed || !current?.followUp || current.followUp.depth > session.filters.maxDepth)) fail('This follow-up is not available.')
})
export type Session = z.infer<typeof SessionSchema>

export const AppDataSchema = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
  customCards: z.array(CardSchema.refine((card) => card.id.startsWith('custom-'), 'Custom card IDs must begin with custom-.')).max(500)
    .refine((cards) => new Set(cards.map((card) => card.id)).size === cards.length, 'Custom card IDs must be unique.')
    .refine((cards) => new Set(cards.map((card) => normalizedPrompt(card.prompt))).size === cards.length, 'Custom questions must not be duplicated.'),
  saved: UniqueIdListSchema,
  history: HistorySchema,
  session: SessionSchema.nullable(),
})
export type AppData = z.infer<typeof AppDataSchema>

export const DEFAULT_SETTINGS: Settings = {
  names: ['Aleem', 'Nurul'], theme: 'paper', maxDepth: 2, startingSpeaker: 0, decks: [...DECK_IDS],
}
export const DEFAULT_DATA: AppData = {
  version: 1, settings: DEFAULT_SETTINGS, customCards: [], saved: [],
  history: { seen: [], completed: [], skipped: [] }, session: null,
}

export function freshData(): AppData {
  return structuredClone(DEFAULT_DATA)
}
