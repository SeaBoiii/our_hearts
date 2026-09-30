# Content release 1

The built-in collection is in `src/content/cards.ts`: 240 original questions and 24 optional Little Moments activities. These were written for this app from the supplied tone and personal context. No third-party question collection was copied, imported, or scraped. IDs use explicit source numbers so editing wording does not change saved references.

## Inventory and comfort levels

| Deck | Light (1) | Thoughtful (2) | Deeper (3) | Questions |
| --- | ---: | ---: | ---: | ---: |
| Little Laughs | 32 | 8 | 0 | 40 |
| Know Me Better | 18 | 18 | 4 | 40 |
| Our Story | 20 | 16 | 4 | 40 |
| Closer Still | 12 | 20 | 8 | 40 |
| The Life We’re Building | 14 | 20 | 6 | 40 |
| Only Us | 28 | 12 | 0 | 40 |
| Total | 124 | 94 | 22 | 240 |

Each deck has 20 optional follow-ups, for 120 overall. A follow-up has its own depth and is never below the parent question's depth. The playing screen must check that depth against the current session limit before offering it. The first six question IDs in each deck are light; the versioned daily pool can safely reference them explicitly.

Every deck has at least 12 light questions, so every nonempty deck combination supports the twelve-question format at each maximum depth before history is considered. A deck does not need deeper questions simply to fill a quota: playful and personalised prompts can remain light or thoughtful.

There are four activities associated with each deck. Twenty-one are light and three are thoughtful. They have `kind: 'activity'` and stable `moment-01` through `moment-24` IDs. They are separate from the question array and are intended only for an explicit optional interlude; they must not change a session's question target or speaker.

## Manual editorial review

Read the complete collection by deck and compared nearby themes across decks, including personal preferences versus shared routines, individual interests versus shared space, remembered support versus future support, and several kinds of appreciation. Checked each prompt for a clear primary question, conversational phrasing, an appropriate depth, and a follow-up that develops its particular answer.

Three overlaps were revised during that review:

- `story-15` originally revisited food and sensory memories already covered by `story-03`; it now asks about becoming pleasantly absorbed in a shared activity.
- `life-18` originally covered space for individual interests, close to `us-35`; it now asks about maintaining connections with meaningful people and places.
- `us-28` originally revisited enjoying a wait together, close to `story-13`; it now imagines a garden with a puzzle rule.

The remaining shared themes serve different conversational purposes. For example, remembering a specific helpful moment is distinct from explaining the kind of help wanted next time. The deck roles stay clear: play, discovery, memories, care, shared life, and personal interests.

The tone review checked for accusatory wording, partner comparisons, forced disclosure, gendered responsibilities, assumed children, alcohol, explicit sexual content, date-dependent wedding copy, religious instruction, and invented personal history. None is part of the collection. References to Aleem, Nurul, Singapore, engineering, water-sort puzzles, nature, and travel use only the supplied context. Memory prompts invite the couple to provide their own events. Passing remains appropriate if a prompt has no fitting answer.

Activities do not require physical touch, leaving the room, buying anything, artistic skill, a timer, or sharing a written answer. Drawing and writing suggestions include a spoken alternative. All 240 main questions fit within 32 whitespace-separated words.

## Validation

`validateContent()` runs once when built-in content enters the app. It uses the shared `CardSchema` and checks the full inventory, distinct IDs, required fields, known deck references, distinct nonempty tags, normalized duplicate prompts, follow-up depth, and usable twelve-question filters. This validator is specifically for the complete built-in release; imported and custom cards use the core schemas instead.

`src/content/cards.test.ts` additionally checks stable ID sequences, the light daily-pool candidates, question length, the optional-activity boundary, all 189 nonempty deck-combination/maximum-depth pairs, and malformed fixtures. Normalization removes differences in case, punctuation, whitespace, and Unicode typography. It cannot establish semantic distinctness or prove originality; the manual review above addresses meaning and voice.

Validation command: `npm test -- src/content/cards.test.ts`. Seven tests passed. The initial sandboxed invocation encountered Windows child-process `EPERM`; the approved invocation with the process access required by Vitest passed.
