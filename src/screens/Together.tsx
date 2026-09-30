import { ArrowRight, SlidersHorizontal, Sun, MoveUpRight, Leaf, Infinity as InfinityIcon } from 'lucide-react'
import { Motif } from '../components/Art'
import type { AppData } from '../core/types'

export function Together({ data, target, setTarget, onStart, onResume, onConfigure, onDaily }: {
  data: AppData; target: number | null; setTarget: (target: number | null) => void; onStart: () => void; onResume: () => void; onConfigure: () => void; onDaily: () => void
}) {
  const active = data.session?.status === 'active'
  return <div className="together-page">
    <section className="home-hero">
      <div className="home-copy"><p className="eyebrow"><span className="tiny-line" /> A little space for the two of you</p>
        <h1>Less scrolling.<br /><em>More us.</em></h1>
        <p className="hero-description">A little closer, one question at a time.<br />No right answers. Just you, me, and a moment.</p>
        <div className="home-start desktop-start"><StartControls active={active} onStart={onStart} onResume={onResume} onConfigure={onConfigure} /></div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="hero-card hero-card-back"><span>the little things</span><Motif kind="path" /></div><div className="hero-card hero-card-middle" /><div className="hero-card hero-card-front"><div className="card-inner-frame"><span className="art-card-eyebrow">A CONVERSATION, JUST FOR US</span><Motif /><span className="art-wordmark">our hearts</span><span className="art-card-footer">{data.settings.names.map(name => name.charAt(0)).join(' × ')}</span></div></div><span className="art-caption">Good conversations start with a little curiosity.</span><svg className="art-spark" viewBox="0 0 40 50"><path d="M10 30L3 26M23 19L21 4M32 26l7-7" /></svg></div>
      <div className="home-start mobile-start"><StartControls active={active} onStart={onStart} onResume={onResume} onConfigure={onConfigure} /></div>
    </section>
    <section className="pace-section" aria-labelledby="pace-heading"><div className="section-label"><h2 id="pace-heading">Make a little room for us</h2><span>Choose your kind of moment</span></div>
      <div className="pace-options">{[{ value: 5, title: 'A little moment', note: '5 questions · a small pause', icon: <Leaf /> }, { value: 12, title: 'Our evening', note: '12 questions · settle in', icon: <Sun /> }, { value: null, title: 'Keep talking', note: 'No set number · see where it goes', icon: <InfinityIcon /> }].map(mode => <button key={mode.title} className={`pace-option ${target === mode.value ? 'selected' : ''}`} aria-pressed={target === mode.value} onClick={() => setTarget(mode.value)}><span className="pace-icon">{mode.icon}</span><span><strong>{mode.title}</strong><small>{mode.note}</small></span><span className="radio-dot" /></button>)}</div>
    </section>
    <button className="daily-teaser" onClick={onDaily}><span className="daily-icon"><Sun size={28} strokeWidth={1.25} /></span><span><span className="eyebrow">ONE SMALL QUESTION, A NEW DAY</span><strong>Just one today</strong><small>A little something to talk about, whenever you find a moment.</small></span><MoveUpRight size={23} strokeWidth={1.4} /></button>
    <p className="home-footnote">Made for {data.settings.names.join(' & ')}. Best enjoyed together.</p>
  </div>
}

function StartControls({ active, onStart, onResume, onConfigure }: { active: boolean; onStart: () => void; onResume: () => void; onConfigure: () => void }) {
  return <><button className="button primary talk-button" onClick={active ? onResume : onStart}>{active ? 'Continue our conversation' : 'Let’s talk'}<ArrowRight size={19} /></button><button className="text-button configure-button" onClick={onConfigure}><SlidersHorizontal size={16} /> Make it our own</button>{active && <button className="text-button replace-link" onClick={onStart}>Start a new conversation</button>}</>
}
