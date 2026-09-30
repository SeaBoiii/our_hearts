import { type Card, type History, type Session, type Settings } from './types'

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/** Reserve every eligible question, with small light-to-thoughtful waves.
 * Choosing the least-used available deck keeps a mix balanced even when pools differ.
 * The snapshot protects an active conversation from later content/custom-card edits.
 */
function arrangeQueue(cards: Card[], target: number | null): Card[] {
  const remaining = shuffled(cards)
  const queue: Card[] = []
  const deckUse = new Map<string, number>()
  const waveSize = Math.max(1, target ?? 12)
  const depths = [1, 2, 3].filter((depth) => remaining.some((card) => card.depth === depth))
  const take = (depth: number, count: number) => {
    for (let n = 0; n < count; n++) {
      let choice = -1
      let least = Infinity
      for (let i = 0; i < remaining.length; i++) {
        const card = remaining[i]!
        if (card.depth === depth && (deckUse.get(card.deckId) ?? 0) < least) {
          choice = i
          least = deckUse.get(card.deckId) ?? 0
        }
      }
      if (choice < 0) break
      const [card] = remaining.splice(choice, 1)
      queue.push(card!)
      deckUse.set(card!.deckId, least + 1)
    }
  }
  while (remaining.length) {
    let budget = waveSize
    depths.forEach((depth, i) => {
      const availableDepthsAfter = depths.slice(i + 1).filter((next) => remaining.some((card) => card.depth === next)).length
      const quota = i === depths.length - 1 ? budget : Math.max(1, Math.ceil(budget / (availableDepthsAfter + 1)))
      const before = queue.length
      if (budget > 0) take(depth, quota)
      budget -= queue.length - before
    })
  }
  return structuredClone(queue)
}

export function createSession(
  cards: readonly Card[], settings: Settings, target: number | null, history: History, allowSeen = false,
): Session {
  if (target !== null && (!Number.isInteger(target) || target < 1 || target > 5_000)) throw new Error('Choose a valid question target.')
  const ids = new Set<string>()
  const eligible = cards.filter((card) => {
    if (card.kind !== 'question' || card.depth > settings.maxDepth || !settings.decks.includes(card.deckId) || ids.has(card.id)) return false
    ids.add(card.id)
    return true
  })
  const seen = new Set(history.seen)
  const selected = allowSeen ? eligible : eligible.filter((card) => !seen.has(card.id))
  const queue = arrangeQueue(selected, target)
  return {
    id: `session-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
    createdAt: new Date().toISOString(), queue, index: 0, revealed: false, followUpOpen: false,
    speaker: settings.startingSpeaker, seen: [], completed: [], skipped: [], target,
    status: queue.length ? 'active' : 'exhausted',
    ...(queue.length ? {} : { reason: eligible.length ? 'all-seen' as const : 'empty-selection' as const }),
    filters: { decks: [...settings.decks], maxDepth: settings.maxDepth }, allowSeen,
  }
}

export function currentCard(session: Session): Card | undefined {
  return session.status === 'active' ? session.queue[session.index] : undefined
}

export function revealCard(session: Session): Session {
  const card = currentCard(session)
  if (!card || session.revealed) return session
  return { ...session, revealed: true, seen: [...new Set([...session.seen, card.id])] }
}

/** Completion requires a reveal; the newly concealed card cannot be accidentally completed twice. */
export function advanceCard(session: Session, action: 'complete' | 'skip'): Session {
  const card = currentCard(session)
  if (!card || (action === 'complete' && !session.revealed)) return session
  const completed = action === 'complete' ? [...session.completed, card.id] : session.completed
  const skipped = action === 'skip' ? [...session.skipped, card.id] : session.skipped
  const index = session.index + 1
  const finished = session.target !== null && completed.length >= session.target
  const exhausted = !finished && index >= session.queue.length
  return {
    ...session, index, completed, skipped, revealed: false, followUpOpen: false,
    speaker: action === 'complete' ? session.speaker === 0 ? 1 : 0 : session.speaker,
    status: finished ? 'finished' : exhausted ? 'exhausted' : 'active',
    ...(exhausted ? { reason: 'pool-exhausted' as const } : {}),
  }
}

export function toggleFollowUp(session: Session): Session {
  const card = currentCard(session)
  if (!session.revealed || !card?.followUp || card.followUp.depth > session.filters.maxDepth) return session
  return { ...session, followUpOpen: !session.followUpOpen }
}

export function mergeSessionHistory(history: History, session: Session): History {
  return {
    seen: [...new Set([...history.seen, ...session.seen])],
    completed: [...new Set([...history.completed, ...session.completed])],
    skipped: [...new Set([...history.skipped, ...session.skipped])],
  }
}
