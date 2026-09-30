import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, Flower2, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Motif } from '../components/Art'
import { decks } from '../content/cards'
import { currentCard } from '../core/session'
import type { AppData, Session } from '../core/types'

export function Playing({ data, onHome, onReveal, onAdvance, onSave, onFollowUp, onMoment, onRestart, onConfigure }: {
  data: AppData; onHome: () => void; onReveal: () => void; onAdvance: (action: 'complete' | 'skip') => void; onSave: (id: string) => void; onFollowUp: () => void; onMoment: () => void; onRestart: (allowSeen: boolean) => void; onConfigure: () => void
}) {
  const session = data.session!
  const card = currentCard(session)
  const questionRef = useRef<HTMLHeadingElement>(null)
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => { if (session.revealed) questionRef.current?.focus() }, [session.index, session.revealed])
  function act(action: () => void) {
    if (lock.current) return
    lock.current = true; setBusy(true); action()
    timer.current = setTimeout(() => { lock.current = false; setBusy(false) }, 280)
  }
  if (!card) return <Closing session={session} onHome={onHome} onRestart={onRestart} onConfigure={onConfigure} />
  const deck = decks.find(item => item.id === card.deckId)!
  const isSaved = data.saved.includes(card.id)
  return <section className="playing-page"><div className="play-topbar"><button className="text-button" onClick={onHome}><ArrowLeft size={19} /> Pause & return</button><span className="play-counter" aria-label={`${session.completed.length} completed${session.target ? ` of ${session.target}` : ''}`}>{String(session.completed.length + 1).padStart(2, '0')} <span>/ {session.target ? String(session.target).padStart(2, '0') : '∞'}</span></span></div>
    <p className="speaker-label"><span className="speaker-initial">{data.settings.names[session.speaker].charAt(0)}</span>{data.settings.names[session.speaker]} starts<span className="speaker-divider">·</span> both of you answer</p>
    <div className={`play-card-stack ${session.revealed ? 'is-revealed' : ''}`}><div className="play-card" key={`${card.id}-${session.revealed}`}>
      {session.revealed ? <><div className="question-top"><span className="eyebrow"><span className={`category-dot color-${deck.color}`} />{deck.name}</span><button className={`icon-button save-button ${isSaved ? 'is-saved' : ''}`} onClick={() => onSave(card.id)} aria-label={isSaved ? 'Unsave question' : 'Save question'} aria-pressed={isSaved}><Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} /></button></div><div className="question-body"><span className="question-quote" aria-hidden="true">“</span><h1 ref={questionRef} tabIndex={-1}>{card.prompt}</h1></div>
        {card.followUp && card.followUp.depth <= session.filters.maxDepth && <div className="follow-up"><button className="text-button" aria-expanded={session.followUpOpen} onClick={onFollowUp}><Flower2 size={17} /> A little deeper<ChevronDown size={15} /></button>{session.followUpOpen && <p>{card.followUp.prompt}</p>}</div>}<div className="question-bottom"><span>{['', 'Easy & light', 'A little thoughtful', 'A little deeper'][card.depth]}</span><span>our hearts</span></div></> : <div className="play-card-back"><div className="card-inner-frame"><span className="art-card-eyebrow">THERE’S ALWAYS MORE TO KNOW</span><Motif /><span className="art-wordmark">our hearts</span><span className="art-card-footer">A LITTLE CLOSER, ONE CARD AT A TIME</span></div></div>}
    </div></div>
    <div className="play-actions"><button className="button primary" disabled={busy} onClick={() => act(session.revealed ? () => onAdvance('complete') : onReveal)}>{session.revealed ? 'Next card' : 'Reveal question'}<ArrowRight size={19} /></button><button className="text-button pass-button" disabled={busy} onClick={() => act(() => onAdvance('skip'))}>Pass for now</button></div>
    <div className="play-bottom"><p>{session.revealed ? 'Take your time. The best part happens off-screen.' : 'A little curiosity. No perfect answers needed.'}</p><button className="text-button" onClick={onMoment}><Flower2 size={15} /> Share a little moment</button></div>
  </section>
}

function Closing({ session, onHome, onRestart, onConfigure }: { session: Session; onHome: () => void; onRestart: (allowSeen: boolean) => void; onConfigure: () => void }) {
  const exhausted = session.status === 'exhausted'
  return <section className="closing-page"><div className="closing-art"><img src={`${import.meta.env.BASE_URL}art/ribbons.webp`} width="158" height="158" loading="lazy" alt="" /></div><p className="eyebrow">{exhausted ? 'A LITTLE PAUSE' : 'A MOMENT, SHARED'}</p><h1>{exhausted ? 'That’s this little stack.' : <>Leave a little room<br />for <em>the conversation.</em></>}</h1><p>{exhausted ? session.reason === 'empty-selection' ? 'There are no questions in this selection. Try another deck or depth.' : 'You’ve reached the end of the unseen questions in this selection.' : 'The cards can rest. You can stay right here a little longer.'}</p>{session.completed.length > 0 && <span className="closing-fact"><Check size={16} /> {session.completed.length} {session.completed.length === 1 ? 'question' : 'questions'} shared</span>}<div className="closing-actions">{session.reason !== 'empty-selection' && <button className="button primary" onClick={() => onRestart(exhausted)}>{exhausted ? <><RotateCcw size={17} /> Reshuffle this selection</> : <>Keep talking<ArrowRight size={17} /></>}</button>}{exhausted && <button className="button secondary" onClick={onConfigure}>Choose another mix</button>}<button className="text-button" onClick={onHome}>Back to our space</button></div></section>
}
