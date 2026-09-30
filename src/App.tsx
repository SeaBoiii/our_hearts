import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Bookmark, BookOpen, Heart, Settings, Sun, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Mark, Motif } from './components/Art'
import { Sheet } from './components/Sheet'
import { Preferences } from './components/Preferences'
import { Together } from './screens/Together'
import { Decks } from './screens/Decks'
import { Playing } from './screens/Playing'
import { Saved } from './screens/Saved'
import { SettingsScreen } from './screens/Settings'
import { activities, decks, questions } from './content/cards'
import { advanceCard, createSession, mergeSessionHistory, revealCard, toggleFollowUp } from './core/session'
import { createRepository, deleteCustomCard, upsertCustomCard } from './core/storage'
import { getDailyCard, millisecondsUntilSingaporeMidnight } from './core/daily'
import type { AppData, Card, DeckId, Session, Settings as SettingsType } from './core/types'

const repository = createRepository()
type Route = 'together' | 'decks' | 'saved' | 'play'
function readRoute(): Route { const route = location.hash.replace('#/', '').replace('#', ''); return ['decks', 'saved', 'play'].includes(route) ? route as Route : 'together' }

export function App() {
  const [data, setData] = useState<AppData>(() => repository.read())
  const [warning, setWarning] = useState(() => repository.warning())
  const [route, setRoute] = useState<Route>(readRoute)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mixOpen, setMixOpen] = useState(false)
  const [mix, setMix] = useState(data.settings)
  const [target, setTarget] = useState<number | null>(5)
  const [deckId, setDeckId] = useState<DeckId | null>(null)
  const [pending, setPending] = useState<Session | null>(null)
  const [dailyOpen, setDailyOpen] = useState(false)
  const [daily, setDaily] = useState(() => getDailyCard(questions))
  const [moment, setMoment] = useState<Card | null>(null)
  const [toast, setToast] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const { needRefresh: [needRefresh, setNeedRefresh], offlineReady: [offlineReady], updateServiceWorker } = useRegisterSW()
  const commit = useCallback((next: AppData) => { repository.write(next); setData(next); setWarning(repository.warning()) }, [])
  useEffect(() => { document.documentElement.dataset.theme = data.settings.theme; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', data.settings.theme === 'dusk' ? '#262324' : '#f7f4ef') }, [data.settings.theme])
  useEffect(() => { const onHash = () => { setRoute(readRoute()); window.scrollTo(0, 0); requestAnimationFrame(() => mainRef.current?.focus()) }; window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash) }, [])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { let timer: ReturnType<typeof setTimeout>; const refresh = () => { setDaily(getDailyCard(questions)); clearTimeout(timer); timer = setTimeout(refresh, millisecondsUntilSingaporeMidnight() + 30) }; refresh(); document.addEventListener('visibilitychange', refresh); return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', refresh) } }, [])
  function navigate(next: Route) { location.hash = `/${next}`; if (route === next) mainRef.current?.focus() }
  function begin(settings: SettingsType = data.settings, count = target, allowSeen = false, force = false) {
    const session = createSession([...questions, ...data.customCards], settings, count, data.history, allowSeen)
    if (data.session?.status === 'active' && !force) { setPending(session); return }
    commit({ ...data, settings, session }); navigate('play')
  }
  function sessionChange(next: Session) { commit({ ...data, session: next, history: mergeSessionHistory(data.history, next) }) }
  function save(id: string) { const has = data.saved.includes(id); commit({ ...data, saved: has ? data.saved.filter(item => item !== id) : [...data.saved, id] }); setToast(has ? 'Removed from saved questions' : 'A question to come back to. Saved.') }
  function configure() { setMix(data.settings); setMixOpen(true) }
  const playing = route === 'play' && !!data.session
  const deck = decks.find(item => item.id === deckId)
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus() }}>Skip to content</a><header className={`site-header ${playing ? 'during-play' : ''}`}><a className="brand" href="#/together" aria-label="our hearts home"><Mark /><span>our hearts<span className="brand-dot">.</span></span></a>{!playing && <nav className="desktop-nav" aria-label="Main navigation"><NavLinks route={route} /></nav>}<div className="header-end"><span className="couple-label">{data.settings.names.join(' & ')}</span><button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label="Settings"><Settings size={17} /><span>Settings</span></button></div></header>
    {warning && <div className="storage-warning" role="alert">{warning}</div>}
    {needRefresh && <div className="update-notice" role="status"><span>A fresh version is ready.{playing ? ' Return home when you’re ready to update.' : ''}</span>{!playing && <button className="text-button" onClick={() => void updateServiceWorker(true)}>Update now</button>}<button className="icon-button" aria-label="Dismiss update" onClick={() => setNeedRefresh(false)}><X size={16} /></button></div>}
    <main id="main-content" ref={mainRef} tabIndex={-1} className={playing ? 'main playing-main' : 'main'}>
      {(route === 'together' || (route === 'play' && !data.session)) && <Together data={data} target={target} setTarget={setTarget} onStart={() => begin()} onResume={() => navigate('play')} onConfigure={configure} onDaily={() => setDailyOpen(true)} />}
      {route === 'decks' && <Decks onDeck={setDeckId} onMix={configure} />}
      {route === 'saved' && <Saved data={data} onSave={save} onUpsert={card => commit(upsertCustomCard(data, card))} onDelete={id => commit(deleteCustomCard(data, id))} />}
      {playing && <Playing data={data} onHome={() => navigate('together')} onReveal={() => sessionChange(revealCard(data.session!))} onAdvance={action => sessionChange(advanceCard(data.session!, action))} onFollowUp={() => sessionChange(toggleFollowUp(data.session!))} onSave={save} onMoment={() => { const eligible = activities.filter(card => card.depth <= data.session!.filters.maxDepth); setMoment(eligible[Math.floor(Math.random() * eligible.length)]!) }} onRestart={allowSeen => begin({ ...data.settings, ...data.session!.filters }, null, allowSeen, true)} onConfigure={configure} />}
    </main>
    {!playing && <nav className="mobile-nav" aria-label="Mobile navigation"><NavLinks route={route} /></nav>}
    {settingsOpen && <SettingsScreen data={data} onChange={commit} offlineReady={offlineReady} onClose={() => setSettingsOpen(false)} />}
    <Sheet open={mixOpen} onClose={() => setMixOpen(false)} title="Make it our own" description="A little laughter, a little wondering. Pick what feels right today."><Preferences settings={mix} onChange={setMix} /><button className="button primary full-width" disabled={!mix.decks.length} onClick={() => { commit({ ...data, settings: mix }); setMixOpen(false); begin(mix) }}>Let’s talk<ArrowRight size={18} /></button></Sheet>
    <Sheet open={!!deck} onClose={() => setDeckId(null)} title={deck?.name ?? 'Our decks'} description={deck?.description}>{deck && <><div className={`deck-preview color-${deck.color}`}><Motif kind={deck.motif} /><span className="eyebrow">A LITTLE TASTE</span><blockquote>{questions.find(card => card.deckId === deck.id && card.depth === 1)?.prompt}</blockquote></div><p className="deck-details">{questions.filter(card => card.deckId === deck.id).length} original questions · {[...new Set(questions.filter(card => card.deckId === deck.id).map(card => card.depth))].sort().map(depth => ['', 'Light', 'thoughtful', 'deep'][depth]).join(', ')}</p><p className="field-note">Your current comfort level: {['', 'light', 'thoughtful', 'deep'][data.settings.maxDepth]}. Deeper questions only appear when you choose Deep in settings.</p><button className="button primary full-width" onClick={() => { setDeckId(null); begin({ ...data.settings, decks: [deck.id] }) }}>Open this deck<ArrowRight size={18} /></button></>}</Sheet>
    <Sheet open={!!pending} onClose={() => setPending(null)} title="A new conversation?" description="You have a conversation in progress. Starting a new one replaces its queue. Your saved questions and history stay with you."><div className="sheet-actions"><button className="button secondary" onClick={() => { setPending(null); navigate('play') }}>Continue ours</button><button className="button primary" onClick={() => { if (pending) commit({ ...data, session: pending }); setPending(null); navigate('play') }}>Start fresh</button></div></Sheet>
    <Sheet open={dailyOpen} onClose={() => setDailyOpen(false)} title="Just one today" description="One question for the day, following Singapore time. No streaks. No catching up."><div className="daily-question"><Sun size={28} strokeWidth={1.2} /><span className="eyebrow">A LITTLE SOMETHING TO SHARE</span><blockquote>{daily.prompt}</blockquote><button className="text-button" aria-pressed={data.saved.includes(daily.id)} onClick={() => save(daily.id)}><Bookmark size={17} fill={data.saved.includes(daily.id) ? 'currentColor' : 'none'} />{data.saved.includes(daily.id) ? 'Saved for another day' : 'Keep this question'}</button></div><button className="button primary full-width" onClick={() => setDailyOpen(false)}>Back to our space</button></Sheet>
    <Sheet open={!!moment} onClose={() => setMoment(null)} title="A little moment" description="An optional pause together. Join in however feels comfortable, or simply let it pass."><div className="daily-question"><Motif kind="spark" /><blockquote>{moment?.prompt}</blockquote><p className="field-note">This doesn’t count towards your questions.</p></div><button className="button primary full-width" onClick={() => setMoment(null)}>Back to our conversation</button></Sheet>
    <div aria-live="polite" role="status" className={toast ? 'toast visible' : 'toast'}>{toast}</div>
  </>
}

function NavLinks({ route }: { route: Route }) { return <>{[{ id: 'together', label: 'Together', icon: <Heart size={19} /> }, { id: 'decks', label: 'Decks', icon: <BookOpen size={19} /> }, { id: 'saved', label: 'Saved', icon: <Bookmark size={19} /> }].map(item => <a href={`#/${item.id}`} key={item.id} className={route === item.id ? 'active' : ''} aria-current={route === item.id ? 'page' : undefined}>{item.icon}<span>{item.label}</span></a>)}</> }
