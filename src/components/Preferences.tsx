import { Check } from 'lucide-react'
import { decks } from '../content/cards'
import type { Settings } from '../core/types'

export function Preferences({ settings, onChange, showDecks = true }: { settings: Settings; onChange: (value: Settings) => void; showDecks?: boolean }) {
  return <div className="preferences">
    {showDecks && <fieldset><legend>What are we in the mood for?</legend><div className="deck-checks">{decks.map(deck => <label key={deck.id} className={settings.decks.includes(deck.id) ? 'selected' : ''}>
      <input type="checkbox" checked={settings.decks.includes(deck.id)} onChange={event => onChange({ ...settings, decks: event.target.checked ? [...settings.decks, deck.id] : settings.decks.filter(id => id !== deck.id) })} /><span className="check-box"><Check size={13} /></span>{deck.name}
    </label>)}</div>{settings.decks.length === 0 && <p className="field-error">Choose at least one deck to begin.</p>}</fieldset>}
    <fieldset><legend>How deep shall we go?</legend><div className="depth-options">{([{ value: 1, name: 'Light', caption: 'Easy & playful' }, { value: 2, name: 'Thoughtful', caption: 'A little more us' }, { value: 3, name: 'Deep', caption: 'When we’re ready' }] as const).map(depth => <label key={depth.value} className={settings.maxDepth === depth.value ? 'selected' : ''}><input type="radio" name="depth" value={depth.value} checked={settings.maxDepth === depth.value} onChange={() => onChange({ ...settings, maxDepth: depth.value })} /><span>{depth.name}</span><small>{depth.caption}</small></label>)}</div><p className="field-note">Includes lighter cards, too. Passing is always okay.</p></fieldset>
    <fieldset><legend>Who starts the first card?</legend><div className="segmented">{settings.names.map((name, index) => <button type="button" key={index} aria-pressed={settings.startingSpeaker === index} className={settings.startingSpeaker === index ? 'selected' : ''} onClick={() => onChange({ ...settings, startingSpeaker: index as 0 | 1 })}>{name}</button>)}</div></fieldset>
  </div>
}
