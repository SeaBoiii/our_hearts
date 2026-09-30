# Design rationale

## Direction

Make a small physical deck feel at home on a phone. Warm paper, plum ink, editorial serif questions, and a restrained intertwined-line signature give this app a recognizable character. The conversation is the useful product; decoration supports the short transition from looking at a card to looking at each other.

Paper is the default. Dusk uses warm low-glare surfaces with deliberately chosen readable text rather than a color inversion. Newsreader adds a literary, spoken quality to questions; Manrope keeps labels and actions clear. Locally hosted Latin fonts and fallbacks preserve that hierarchy offline.

## References actually inspected

Research was performed on 30 September 2026. No proprietary question set, branding, illustration, or component code was copied.

| Reference | Adopted principle | Decision and user benefit |
| --- | --- | --- |
| [Paired](https://www.paired.com/) | A low-effort invitation to a short shared conversation | Start a sensible session immediately; omit its assessment, account, and expert-led product framing. |
| [Agapé](https://www.getdailyagape.com/) | One approachable question can anchor a moment | Offer a small daily card; omit typed-answer unlocking, points, rewards, streaks, and outcome claims. Answering aloud keeps attention between people. |
| [21st.dev cards](https://21st.dev/community/components/s/card), [navigation](https://21st.dev/community/components/s/navigation-menu), and [Motion Primitives](https://21st.dev/@ibelick/library/motion-primitives) | Clear hierarchy in card and navigation patterns, restrained transitions | Original CSS stacks and small motion; no copied registry component, heavy animated hero, shader, or extra motion dependency. The catalog's eclectic visual styles were not combined. |
| [shadcn/ui theming](https://ui.shadcn.com/docs/theming) | Semantic CSS variables and a consistent component vocabulary | Product-specific tokens make Paper and Dusk coherent and permit measured contrast fixes. |
| [Dialog](https://ui.shadcn.com/docs/components/radix/dialog), [Sheet](https://ui.shadcn.com/docs/components/radix/sheet), [Button](https://ui.shadcn.com/docs/components/radix/button), [Tabs](https://ui.shadcn.com/docs/components/radix/tabs), [Switch](https://ui.shadcn.com/docs/components/radix/switch), [Tooltip](https://ui.shadcn.com/docs/components/radix/tooltip) | Dialog structure, explicit labels, focused controls | Use Radix Dialog for accessible modal/sheet behavior and original styling. Native controls and hash links cover simpler needs without a full component package. |
| [Context7 overview](https://context7.com/docs/overview) | Match documentation to installed libraries | No Context7 tool was exposed in this environment. npm package metadata and official documentation supplied the fallback; Context7 retrieval is not claimed. |
| [Vite static deployment](https://vite.dev/guide/static-deploy.html), [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and official Actions release pages | A reproducible static artifact with a deliberate base | Root and repository bases share one configuration. PRs validate while deployment remains restricted to default-branch pushes/manual runs. |
| [Vite PWA guide](https://vite-pwa-org.netlify.app/guide/) and [prompted updates](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) | Cache local essentials and ask before updating | Offline use is promised only after caching. Updates cannot interrupt a conversation automatically. |
| [Playwright emulation](https://playwright.dev/docs/emulation) | Explicit viewport, reduced-motion, and browser configurations | Use reproducible browser checks and saved screenshots, describing them as emulation rather than physical-device tests. |

## Interaction decisions

- Three destinations keep the app learnable: Together, Decks, Saved. Settings remain behind a labeled control. The playing view removes bottom navigation so the question stays dominant.
- Five questions are an invitation, not homework. Twelve and open-ended sessions are available without forcing setup first.
- A face-down card creates a small shared moment. A short reveal with reduced-motion support adds tactility without making people wait for a performance.
- Passing never changes the starting speaker or judges the choice. Deeper prompts and follow-ups respect the selected comfort limit.
- Scrollable question cards and sheets prioritize readable content at small heights and enlarged text. Controls remain explicit; no gesture is required.
- Stable daily selection in Singapore time makes the shared daily card predictable across devices without suggesting synchronization.
- Transparent local storage and export/import suit a tiny personal app without inventing a secure vault. No answer collection keeps the interface focused on spoken conversation.

## Implementation choices

React and TypeScript provide a small typed UI; pure session logic and schemas remain separate from rendering. Tailwind's Vite integration is available alongside semantic CSS. Radix contributes modal accessibility, Lucide supplies consistent interface icons, and native CSS handles short transitions. No state library, remote service, analytics, authentication, runtime AI, or motion framework is needed.

Current npm metadata was inspected before installation. Versions are fixed in `package.json` and `package-lock.json`; Vitest 4 is selected deliberately because the installed Node 25 environment is outside Vitest 5's declared engine range. CI targets Node 24 LTS.

## Verification

Rendered inspection, actual command results, screenshot locations, and any environment limitations belong in the final verification notes. Content validation detects exact normalized duplicates and structural problems; it does not prove originality. Semantic repetition also requires an editorial reading.
