# Asset notes

## Original artwork

`public/icons/mark.svg` is original vector artwork created for this project: two curved lines meet in an open heart-shaped loop with a small central weave. The drawing uses the app's paper and plum palette; it does not trace a third-party mark.

`scripts/generate-icons.mjs` rasterizes that SVG with Sharp into genuine PNG files: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `apple-touch-icon.png`. The maskable icon keeps the motif inside the central safe zone. Regenerate with `npm run icons`.

Decorative deck motifs in the React UI use original SVG geometry. Interface labels and controls remain accessible HTML, not flattened artwork. Decorative illustrations do not carry information required to play.

No 21st.dev component code, stock photograph, brand artwork, proprietary question collection, or externally hosted image is bundled. Research references are listed in [design rationale](design-rationale.md).

## Fonts and icons

| Asset | Source | License | Delivery |
| --- | --- | --- | --- |
| Newsreader variable | [`@fontsource-variable/newsreader`](https://fontsource.org/fonts/newsreader) | SIL Open Font License 1.1 | Local package, Latin WOFF2 subset |
| Manrope variable | [`@fontsource-variable/manrope`](https://fontsource.org/fonts/manrope) | SIL Open Font License 1.1 | Local package, Latin WOFF2 subset |
| Lucide interface icons | [`lucide-react`](https://lucide.dev/license) | ISC; some upstream Feather icons MIT | Local SVG components, tree-shaken |
| Radix Dialog | [`@radix-ui/react-dialog`](https://github.com/radix-ui/primitives) | MIT | Local dependency; original product styling |

License texts accompany their installed packages. Font, Lucide, and Radix license copies are retained under `public/licenses/` so they accompany distributed assets. Dependency versions and integrity hashes are retained in `package-lock.json`.

## Generated decorative illustration

`public/art/ribbons.webp` is a 480px optimized derivative of the original retained in `docs/asset-sources/ribbons-original.png`. The built-in OpenAI `image_gen__imagegen` tool generated the source during development. It is decorative closing-screen artwork and is not needed for gameplay. No generation occurs at runtime and no API key is bundled.

Exact generation prompt:

> Use case: stylized-concept. Asset type: small decorative illustration for a personal couples conversation-card web app named our hearts. Create a sophisticated minimal editorial paper-cut illustration: two flowing narrow matte paper ribbons gently interweave into an abstract open knot suggesting two lives meeting. Restrained soft cast shadows, physically believable curled paper, dusty blush #E7D3D4 and muted sage #D7DFD4 with subtle deep rose #713C4D edge accents. Isolated central composition on warm ivory #F7F4EF, abundant negative space. Square canvas. Delicate tactile paper texture, warm contemporary stationery aesthetic. No text, letters, logos, hearts, people, interface, photorealism, gradients or glossy materials. This is a single decorative artwork, not a UI mockup.

The unoptimized tool output is retained at `docs/asset-sources/ribbons-original.png`. This generated illustration is original project artwork, not third-party licensed stock.

## Tool usage

Official websites and documentation were browsed, package metadata was checked with npm, and SVG artwork was authored directly. Sharp converts the local SVG to app-icon PNGs and optimizes the generated illustration; image generation was performed only by the built-in tool described above. Context7, shadcn MCP, and 21st MCP were not exposed as callable tools, so no use of those tools is claimed.

All 264 built-in cards are authored as project content. Structural and normalized-duplicate validation is paired with manual editorial review for semantic repetition and tone; automated tests do not establish originality.
