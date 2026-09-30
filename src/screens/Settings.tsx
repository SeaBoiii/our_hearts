import { Download, Moon, Sun, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { Preferences } from '../components/Preferences'
import { applyImport, exportData, MAX_IMPORT_BYTES, parseImport, previewImport, resetData } from '../core/storage'
import type { AppData } from '../core/types'

export function SettingsScreen({ data, onChange, onClose, offlineReady }: { data: AppData; onChange: (data: AppData) => void; onClose: () => void; offlineReady: boolean }) {
  const [incoming, setIncoming] = useState<AppData | null>(null)
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [confirm, setConfirm] = useState(false)
  const [reset, setReset] = useState<'history' | 'saved' | 'custom' | 'all' | null>(null)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const preview = incoming ? previewImport(incoming) : null
  const updateSettings = (settings: AppData['settings']) => onChange({ ...data, settings })
  async function importFile(file?: File) {
    if (!file) return
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('This file is too large. Choose an our hearts export under 2 MB.')
      const imported = parseImport(await file.text())
      setIncoming(imported); setConfirm(false); setMode('merge'); setNotice('')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'That file could not be read.') }
    if (fileInput.current) fileInput.current.value = ''
  }
  function download() {
    const blob = new Blob([exportData(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'our_hearts-backup.json'; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Export created. Keep it somewhere you trust; it is not encrypted.')
  }
  return <Sheet open onClose={onClose} title="Make yourself at home" description="Small preferences for your little space." wide>
    <div className="settings-content"><fieldset><legend>The light in here</legend><div className="theme-options"><button className={data.settings.theme === 'paper' ? 'selected' : ''} aria-pressed={data.settings.theme === 'paper'} onClick={() => updateSettings({ ...data.settings, theme: 'paper' })}><Sun size={21} /><span>Paper<small>Warm & light</small></span></button><button className={data.settings.theme === 'dusk' ? 'selected' : ''} aria-pressed={data.settings.theme === 'dusk'} onClick={() => updateSettings({ ...data.settings, theme: 'dusk' })}><Moon size={21} /><span>Dusk<small>Soft & quiet</small></span></button></div></fieldset>
    <fieldset><legend>The two of you</legend><form className="names-form" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const names: [string, string] = [String(form.get('first')).trim(), String(form.get('second')).trim()]; if (names.every(Boolean)) { updateSettings({ ...data.settings, names }); setNotice('Names updated.') } }}><div className="form-two"><label>First name<input key={`first-${data.settings.names[0]}`} name="first" defaultValue={data.settings.names[0]} required maxLength={40} autoComplete="off" /></label><label>Second name<input key={`second-${data.settings.names[1]}`} name="second" defaultValue={data.settings.names[1]} required maxLength={40} autoComplete="off" /></label></div><button type="submit" className="text-button">Save names</button></form></fieldset>
    <Preferences settings={data.settings} onChange={updateSettings} showDecks={false} />
    <section className="settings-section"><h3>Just on this device</h3><p>Your saved questions, own cards, and history stay in this browser profile. They don’t automatically appear on another device, may be lost when browser data is cleared, and are not encrypted. We don’t collect your answers.</p><p>The app and built-in questions are publicly accessible. Search indexing is discouraged, but this is not access control. Your hosting provider may keep access logs.</p><div className="data-actions"><button className="button secondary" onClick={download}><Download size={17} /> Export data</button><button className="button secondary" onClick={() => fileInput.current?.click()}><Upload size={17} /> Import data</button><input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-label="Choose backup file" onChange={e => void importFile(e.target.files?.[0])} /></div><p className="field-note">Exports may contain personal custom cards and are not encrypted. Moving to a new domain or device requires export and import.</p></section>
    <section className="settings-section"><h3>A place on your home screen</h3><p>On iPhone or iPad, use Safari’s Share menu → Add to Home Screen. On Android, look for Install app in your browser menu. On desktop, use the address-bar install icon when offered.</p><p>{offlineReady ? 'Ready for offline use on this browser. The app and its cards have finished caching.' : 'Offline use is available after a successful visit and completed caching.'} Installation is optional.</p></section>
    <section className="settings-section"><h3>A fresh page</h3><p>Reset only what you choose. Other apps in this browser are unaffected.</p><div className="reset-options">{([{ scope: 'history', text: 'Clear question history' }, { scope: 'saved', text: 'Clear saved questions' }, { scope: 'custom', text: 'Remove our own cards' }, { scope: 'all', text: 'Reset all our hearts data' }] as const).map(item => <button key={item.scope} className="text-button" onClick={() => setReset(item.scope)}>{item.text}</button>)}</div></section>
    {notice && <p className="notice" role="status">{notice}</p>}
    </div>
    <Sheet open={!!incoming} onClose={() => { setIncoming(null); setConfirm(false) }} title={confirm ? 'Replace this device’s data?' : 'A look inside your backup'} description={confirm ? 'Your current preferences, own cards, saved questions, history, and conversation will be replaced. Export them first if you want to keep a copy.' : 'Nothing changes until you choose to import.'}>
      {preview && <><div className="import-preview"><p>{preview.names}</p><span>{preview.customCards} own cards · {preview.saved} saved questions</span><span>{preview.seen} seen questions · {preview.hasSession ? 'Includes a conversation' : 'No conversation'}</span></div>{!confirm && <><fieldset><legend>How should we bring it in?</legend><div className="segmented"><button className={mode === 'merge' ? 'selected' : ''} aria-pressed={mode === 'merge'} onClick={() => setMode('merge')}>Merge</button><button className={mode === 'replace' ? 'selected' : ''} aria-pressed={mode === 'replace'} onClick={() => setMode('replace')}>Replace</button></div></fieldset><p className="field-note">{mode === 'merge' ? 'Adds cards, bookmarks, and history. Keeps your current settings, conversation, and local version of matching cards.' : 'Replaces all our hearts data in this browser with the backup.'}</p></>}<button className="button primary full-width" onClick={() => { if (mode === 'replace' && !confirm) setConfirm(true); else if (incoming) { try { onChange(applyImport(data, incoming, mode)); setIncoming(null); setConfirm(false); setNotice('Your backup is here. Make yourself at home.') } catch (error) { setNotice(error instanceof Error ? error.message : 'Import failed.'); setIncoming(null) } } }}>{confirm ? 'Yes, replace my data' : 'Import backup'}</button></>}
    </Sheet>
    <Sheet open={!!reset} onClose={() => setReset(null)} title="Start a fresh page?" description={`This will ${reset === 'all' ? 'remove all our hearts data and restore the defaults' : reset === 'history' ? 'clear question history and end the current conversation' : reset === 'saved' ? 'clear your bookmarks' : 'remove your own cards and their bookmarks'}. This cannot be undone.`}><div className="sheet-actions"><button className="button secondary" onClick={() => setReset(null)}>Keep my data</button><button className="button primary" onClick={() => { if (reset) onChange(resetData(data, reset)); setReset(null); setNotice('Your selected data has been reset.') }}>Confirm reset</button></div></Sheet>
  </Sheet>
}
