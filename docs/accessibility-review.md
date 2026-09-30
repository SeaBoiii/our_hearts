# Accessibility and responsive review

The browser regression checks live in `tests/browser/accessibility.spec.ts`, matching the configured Playwright test directory. They run against the built application in Chromium and WebKit.

## Coverage

- Axe checks for WCAG A/AA rules on Together, Decks, Saved empty and populated, the own-card editor, Settings, the card back, and a revealed question. Each is checked in Paper and Dusk: 32 screen/theme/browser scans across the two browser projects.
- Horizontal overflow checks at 320×568, 360×640, 390×844, 430×932, 768×1024, and 1440×1000 CSS pixels, including Settings and a long custom question in Saved and Playing. The question must grow vertically and its pass action must remain reachable by scrolling.
- Keyboard opening, focus trapping, reverse tabbing, Escape dismissal, visible focus, trigger restoration, and skip-link activation. Revealing a question must focus its heading.
- Reduced-motion preference disables card animations while reveal remains functional.
- Simulated 200% text enlargement checks reflow and access to essential controls. The test doubles the computed font sizes of text elements; it does not claim to emulate an operating system's text-size setting or physical-device zoom.

The broad review found insufficient contrast on selected Paper captions and two deck-cover accents, horizontal overflow from rotated card edges on tall custom cards, and an enlarged header/heading that exceeded a narrow viewport. Those findings were reported to the implementation owner and corrected. Subsequent checks passed the 32 axe scans, all six normal-width layouts in both engines, reduced motion, and the enlarged-text cases after the final heading fix.

## Browser keyboard policy

On this Windows WebKit build, native Tab traversal goes to Settings before anchor links; Option/Alt+Tab did not change that result. The test therefore starts the WebKit sheet scenario at its native keyboard destination and verifies the dialog entirely with keyboard events. It separately focuses the skip link and activates it with Enter, explicitly distinguishing activation from native Tab traversal. Chromium checks the actual Tab → skip link → main content path.

These are browser automation checks, not physical iPhone/iPad tests or a manual screen-reader audit. Playwright's WebKit is a patched WebKit build, and platform behavior can vary; it is not branded Safari. See the [official Playwright browser documentation](https://playwright.dev/docs/browsers#webkit). Axe passing does not establish complete accessibility conformance.

## Reproduction and artifacts

Run `npm run build` before `npx playwright test tests/browser/accessibility.spec.ts`. Playwright starts the configured production preview when needed. Run the targeted suite with `--project=chromium` or `--project=webkit` to inspect one engine. Set the same `VITE_BASE_PATH` for the build and test processes when testing the root deployment base.

The independent review used `artifacts/a11y-results` and `artifacts/a11y-report` for the broad review, and `artifacts/a11y-focused-results` / `artifacts/a11y-focused-report` for focused refinement checks. These include failure screenshots and traces from the review process; final application screenshots and complete suite results are recorded in the main testing documentation. Separate output directories avoid deleting another concurrent test run's artifacts.
