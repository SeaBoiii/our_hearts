# our hearts

A little closer, one question at a time. An original, local-first conversation-card app for Aleem & Nurul, made for two people sharing one phone and answering aloud.

## Run locally

Use Node.js 24 LTS and npm (Node 22.13+ in the 22.x series also works). The lockfile pins the dependency tree.

```sh
npm ci
npm run dev
```

Open the URL Vite prints, normally `http://127.0.0.1:5173/our_hearts/`. No account, API key, backend, or paid service is needed. The project uses React, TypeScript, Vite, Tailwind CSS, Radix Dialog, Lucide icons, and Vite PWA. Assets and fonts are local.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run typecheck` | Strict TypeScript validation |
| `npm run lint` | ESLint |
| `npm test` | Content and pure-logic tests |
| `npm run test:watch` | Watch unit tests |
| `npm run build` | Type check and static production build in `dist/` |
| `npm run preview` | Serve the production build |
| `npx playwright install chromium webkit` | Install the browser-test engines |
| `npm run test:browser` | Real-browser interactions and accessibility checks against a production build |
| `npm run icons` | Regenerate PNG icons from the original SVG |

Build before running browser tests. Playwright starts the preview server automatically. On Linux, install browser system dependencies with `npx playwright install --with-deps chromium webkit`. Browser emulation is not physical-device testing.

## The deck

Six decks contain 40 original questions each: Little Laughs, Know Me Better, Our Story, Closer Still, The Life We're Building, and Only Us. Another 24 optional Little Moments offer simple shared activities. Activities do not count toward a question target or appear automatically.

Sessions begin with a card back. Reveal, answer aloud, then move on; passing is always neutral. Completed questions alternate the starting speaker; passed cards do not. Session queues are shuffled without replacement, prefer locally unseen questions, and retain their exact state after refresh. Light and thoughtful prompts are the default; deeper prompts require a choice. Daily questions use an explicit Singapore calendar date and a versioned built-in pool, independently of session history.

## Project structure

- `src/content/`: validated deck definitions and built-in questions/activities.
- `src/core/`: session, daily-card, and local-data logic and tests.
- `src/`: React screens, reusable interface pieces, styles, and entry point.
- `public/`: original app icons and `.nojekyll`.
- `tests/browser/`: production-browser checks.
- `docs/`: design rationale, asset provenance, and saved verification artifacts.
- `.github/workflows/pages.yml`: validation and optional Pages deployment.

## Local data and privacy

The app does not collect answers. Saved cards, authored cards, preferences, and history stay in this browser profile. They do not automatically appear on another device, may be lost if browser data is cleared, and are not encrypted. JSON exports can contain personal custom content and are not encrypted either. Import previews and merge/replace choices make transfers explicit; keep an export before replacing data or moving domains.

Storage keys and service-worker caches are namespaced with `our_hearts`. The app resets only its own local data. It does not clear all origin storage, delete sibling apps' caches, or unregister their workers. Storage failures fall back to temporary in-memory use with an explanation.

The deployed app and its bundled questions are publicly accessible. The `noindex` directive discourages indexing; it is not access control or a security boundary. No passwords, private addresses, employer information, API keys, or secrets belong in the bundle. Hosting providers may still keep ordinary request logs.

## GitHub Pages

Deployment is prepared, not activated by this implementation. Nothing here changes DNS or publishes the current workspace.

When ready to publish this repository:

1. Push the project, including `package-lock.json`, to the intended `our_hearts` repository.
2. In that repository, select **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to the repository's default branch, or explicitly run **Validate and deploy our hearts** from Actions. Ensure the `github-pages` environment permits the intended branch.

The workflow derives `/<repository-name>/` from `GITHUB_REPOSITORY`, installs with `npm ci`, runs types/lint/unit tests and Chromium/WebKit browser checks against root and project bases, then uploads `dist/` through the official Pages artifact workflow. Pull requests and non-default branch pushes validate without deploying. Deployment uses the `github-pages` environment and only that job receives `pages: write` and `id-token: write` permissions. A manual run is an explicit deployment request.

The generated artifact contains `.nojekyll`; no root/Jekyll repository is modified. Hash routes such as `/our_hearts/#/decks` work without rewrites and survive refresh.

The validation job has `pages: read` for the official configuration action's [Pages metadata request](https://docs.github.com/en/rest/pages/pages#get-a-github-pages-site). Automatic Pages enablement is explicitly disabled; select GitHub Actions in repository settings before the first deployment.

## Base paths and a future domain

The default local base is `/our_hearts/`. Set `VITE_BASE_PATH` before building, or copy `.env.example` to `.env.local`. All shell assets, icons, manifest scope/start URL, and the worker use that base. Do not change just the manifest or HTML paths independently.

For a project site named something else, use `/<repository-name>/`. For a root site or future custom domain, use `/`.

```powershell
# PowerShell: build and test at the domain root
$env:VITE_BASE_PATH = '/'
npm run build
npm run test:browser
Remove-Item Env:VITE_BASE_PATH

# Restore/test the default project-path artifact
npm run build
npm run test:browser
```

```sh
# POSIX shell equivalents
VITE_BASE_PATH=/ npm run build
VITE_BASE_PATH=/ npm run test:browser
npm run build
npm run test:browser
```

For the possible future `hearts.aleemxnurul.love` domain, first export local data on the old origin. When separately authorized to activate it, set the repository Actions variable `VITE_BASE_PATH` to `/`, configure the custom domain in that repository's Pages settings, follow GitHub's domain-verification/DNS instructions, enable HTTPS after certificate issuance, and rebuild. Then import the exported data at the new origin. No `CNAME` is active or included now. Domain changes do not migrate browser storage or installed apps automatically.

## Offline, installation, and updates

Visit the production app online first and allow caching to finish. After the offline-ready indication, the shell, built-in cards, local fonts, and essential assets can reload offline. An uncached first visit cannot work offline. Browser installation is optional: use the browser's install control when available; on iPhone/iPad Safari, use Share → Add to Home Screen. Ordinary browser use remains complete.

The worker is disabled during `npm run dev`; use a production build and preview to test offline behavior. Updates display a quiet prompt and are applied only on request. Finish or pause a conversation before applying one. Existing session state is local and survives the reload. Cache cleanup is confined to the app's precache; broad outdated-cache cleanup is disabled to protect apps sharing a Pages origin.

## Troubleshooting

- **Blank page or missing assets:** rebuild with the correct `VITE_BASE_PATH`; visit that base, not an unconfigured root. Check the browser's Network panel for failing requests.
- **Browser tests cannot find executables:** run the Playwright install command above. CI needs `--with-deps` on Linux.
- **Offline reload fails:** check a production build, successful worker registration, and completed caching. Localhost and HTTPS support workers; arbitrary HTTP hosts generally do not.
- **Old installed version:** go online and accept the app's update notice. Avoid clearing shared-origin storage; export local data before any targeted browser reset.
- **Data disappears after closing:** the storage warning indicates temporary mode, or the browser is configured to discard site data. Export before leaving. Private browsing and different profiles maintain separate storage.
- **Pages fails before upload:** fix the failed validation check; a failing check intentionally blocks deployment. A first deployment also needs Pages set to GitHub Actions.

See [design rationale](docs/design-rationale.md), [asset notes](docs/assets.md), [actual verification results](docs/verification.md), and [screenshots](docs/screenshots/). The final mobile Lighthouse lab run measured 91 performance and 100 accessibility. Both Chromium and WebKit were checked at the root and project deployment bases; physical-device testing and publication remain outside this local implementation.
