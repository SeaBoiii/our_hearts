import { ArrowUpRight, SlidersHorizontal } from 'lucide-react'
import { Motif } from '../components/Art'
import { decks, questions } from '../content/cards'
import type { DeckId } from '../core/types'

export function Decks({ onDeck, onMix }: { onDeck: (deck: DeckId) => void; onMix: () => void }) {
  return <section className="collection-page"><div className="page-heading"><p className="eyebrow">SIX WAYS TO FIND EACH OTHER</p><h1>A mood for <em>every moment.</em></h1><p>Start somewhere familiar. Discover something new.</p></div><div className="section-label"><h2>Our collection</h2><button className="text-button" onClick={onMix}><SlidersHorizontal size={16} /> Make a mix</button></div><div className="deck-grid">{decks.map((deck, index) => <button className={`deck-tile color-${deck.color}`} key={deck.id} onClick={() => onDeck(deck.id)}><div className="deck-cover"><span className="deck-number">0{index + 1}</span><Motif kind={deck.motif} /><span className="deck-cover-mark">our hearts</span><ArrowUpRight size={18} /></div><div className="deck-description"><h2>{deck.name}</h2><p>{deck.description}</p><span>{questions.filter(card => card.deckId === deck.id).length} questions</span></div></button>)}</div><p className="home-footnote">A little laughter, a little wondering, a little closer.</p></section>
}
