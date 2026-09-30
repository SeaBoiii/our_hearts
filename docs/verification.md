# Verification

This app was built and checked locally on Windows on 30 September 2026. The folder was initially empty; no existing application, repository content, DNS setting, or deployed website was changed.

## Actual results

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass; final changed capture/test files also linted |
| `npm test` | 4 files, 40 passing tests |
| Production build at `/our_hearts/` | Pass |
| Production build at `/` | Pass, isolated in `dist-root` |
| Chromium + WebKit at `/our_hearts/` | All 46 scenarios pass across full and focused runs; no skips |
| Chromium + WebKit at `/` | All 46 scenarios pass across full and focused runs; no skips |
| Axe checks | No WCAG A/AA violations in the tested screens and both themes |
| Final screenshot capture | 21 PNGs, zero console/page errors |
| Lighthouse 13.5 mobile lab run | Performance **91**, accessibility **100**, best practices **100** |

Each final full browser run completed 45 passing scenarios and one keyboard-harness failure: Windows WebKit tabs directly to form controls rather than links by default. After correcting the harness to verify that native behavior explicitly, the affected scenario passed at both bases; Chromium’s normal skip-link tab flow also passed again. The application code did not require a keyboard workaround. See [accessibility review](accessibility-review.md) for the distinction.

The saved [Lighthouse HTML report](qa/lighthouse-mobile.report.html) and [raw JSON](qa/lighthouse-mobile.report.json) record FCP 2.0 s, LCP 3.0 s, total blocking time 150 ms, and CLS 0. Scores are a local mobile simulation, not a guarantee on physical devices or a deployed network. SEO scored 60 because indexing is deliberately discouraged. Earlier runs identified contrast and font-loading improvements; only the final measured report is retained.

The default production artifact totals approximately 729 kB on disk. Its main JavaScript is approximately 445 kB / 137 kB gzip and its CSS approximately 38 kB / 9 kB gzip. Fonts, artwork, questions, and essential assets are local.

Final browser commands used:

```powershell
npm run test:browser -- --workers=2 --output=artifacts/final-nested-results --reporter=list
npm run test:browser -- tests/browser/accessibility.spec.ts --grep 'keyboard opens' --workers=2 --output=artifacts/final-keyboard-results --reporter=list

# Root build/testing used its own artifact and preview at port 4174.
$env:VITE_BASE_PATH = '/'
npx vite build --outDir dist-root
$env:PORT = '4174'
$env:PLAYWRIGHT_DIST_DIR = 'dist-root'
# Start `npm run preview -- --outDir dist-root --port 4174 --strictPort`
# in a separate terminal before these isolated-root commands.
npx playwright test --output=test-results-root --reporter=list
npx playwright test tests/browser/accessibility.spec.ts --project=webkit --grep 'keyboard opens' --output=test-results-root-keyboard --reporter=list
Remove-Item Env:VITE_BASE_PATH, Env:PORT, Env:PLAYWRIGHT_DIST_DIR
```

## Reproduce

Use Node 24 LTS (or the supported version range in `package.json`).

```sh
npm ci
npx playwright install chromium webkit
npm run typecheck
npm run lint
npm test
npm run build
npm run test:browser
npm run preview
```

Open `http://127.0.0.1:4173/our_hearts/` for the production preview. For editing, use `npm run dev` and `http://127.0.0.1:5173/our_hearts/`. Playwright runs the production artifact, and its configuration starts a preview server when one is not already running. The normal worker limit is two to keep local runs predictable.

Windows sandbox restrictions initially prevented Vite/browser child processes from spawning. Running the authorized local build and test commands outside that process sandbox resolved the restriction. No application workaround or weakened validation was needed.

## Coverage

Unit tests cover exact card counts, unique IDs, normalized duplicate prompts, all deck/depth combinations, question lengths, follow-ups, no within-session repeats, depth waves, unseen preference, speaker rules, neutral passing, pool exhaustion, exact queue/reveal persistence, custom-card snapshots, corrupt/blocked/quota-limited storage, bounded versioned imports, merge/replace, scoped resets, and the deterministic Singapore daily pool. Manual editorial review is recorded separately in [content review](content-review.md); automated duplicate detection is not evidence of semantic originality.

Browser tests exercise both Chromium and WebKit:

- Starting, revealing, completing, passing, bookmarking, exact refresh/resume, finishing, and explicit reshuffling.
- Repeated rapid taps, selected deck/depth/speaker, replacement confirmation, and optional activity interludes.
- Custom-card creation, duplicate rejection, editing, deletion, export/import, malformed files, literal imported markup, and confirmed destructive replacement. Oversized payload rejection is additionally covered in unit tests.
- Corrupt and blocked storage, useful empty states, and a live Singapore-midnight rollover.
- WCAG A/AA axe scans on home, decks, empty/populated Saved, the editor, settings, both card faces, and both themes.
- Layouts at 320×568, 360×640, 390×844, 430×932, 768×1024, and 1440×1000; a long custom question; 200% text enlargement; reduced motion; keyboard focus trapping, Escape, and restoration.
- Manifest, real icon dimensions, asset requests, direct hash navigation, refresh, browser back, and both deployment bases.
- Completed caching followed by a real local-origin shutdown and offline reload, including local fonts and the exact active conversation.
- Waiting service-worker updates that do not reload during play, followed by an explicit update from home.
- Another app’s storage key, cache, and registered service worker remain intact after this app’s reset.

Playwright WebKit’s offline-emulation API had an upstream failure in this environment. The tests instead shut down an isolated real static server after the worker activates. Both engines must reload from their cache with that origin unavailable; this is an actual offline-cache check, not a skipped test.

## Visual review

Actual screenshots are retained in [screenshots](screenshots/). Regenerate with the production preview running:

```sh
node scripts/capture-screenshots.mjs
```

The capture script includes home at five phone/tablet sizes and desktop, deck covers, empty/populated Saved, settings, both card faces and themes, the closing screen, and long custom questions at 320 and 390 pixels. The long-card screenshot deliberately uses a synthetic repeated-text stress fixture, separate from the original built-in collection. `console-errors.json` records browser console/page errors during capture. These are browser viewport tests, not physical-device tests.

Visual inspection led to darker secondary text and deck accents, larger supporting text, 16px form fields, bounded stacked edges for very long questions, wrapped headers and headings at enlarged text, and screenshots captured after brief transitions finish. The original generated ribbon is optimized to a small local WebP and appears only as optional decoration on the closing screen.

## Limits

No physical iPhone/Android installation or native assistive-technology session was performed. Automated axe and keyboard checks complement, but do not replace, those checks. Browser installation availability depends on platform support.

GitHub Actions and Pages configuration are prepared, not published or remotely executed. The workflow validates pull requests and restricts deployment to the default branch or a manual run. No active CNAME or DNS change is included. Hosting latency and real-device performance may differ from the local Lighthouse laboratory result.
