# Mega Man Field Guides

36 independent fan guides for Mega Man X1–X8, Classic 1–11, Zero 1–4, ZX / ZX Advent, and all ten game/version campaigns in both Battle Network Legacy Collection volumes. X4 includes separate X and Zero campaigns.

The October 6 expansion is ready in the local preview. The [public website](https://zertrax.github.io/megaman-x-guides/) remains at its prior X1–X8 release until these changes are published.

## Run locally

Requires Node.js 22 or newer. No packages to install.

```sh
npm run build
npm run verify
python -m http.server 4185 --directory dist
```

Open http://localhost:4185. This is a preview on your computer. Ordinary static hosting serves the same generated files publicly. No database, account, ads, analytics or external fonts are needed. Videos load only after a click and never autoplay.

## Template and content

- `src/games/*.json` contains the nine X campaigns; `src/template.cjs` and `guide-layout.cjs` render them.
- `src/campaigns/*.json` contains the 27 Classic, Zero/ZX and Battle Network guides; `campaign-template.cjs` renders their different progression systems.
- `src/guide-theme.css` gives all guides and the library the approved X3 presentation. `style.css`, `stage.css` and `collection.css` handle shared responsive layout.
- `src/library-template.cjs` builds the collection index from completed campaign records.
- `src/guide-icons.cjs` generates 37 original vector helmet icons for browser tabs and library cards, with game numbers and version markers. They are local SVGs; no icon service or image package is needed.
- `src/guide.js`, `reading-position.js` and `collection.js` handle dialogs, navigation, saved reading state and games menus.
- `src/network-upgrades.json` and sprite manifests retain checked inventory/media reference data.
- `scripts/build.cjs` produces 36 guides and the library in `dist/`; `verify-all.cjs` checks content inventories, anchors, assets and return references.

Reviewed JSON is authoritative. Shared components reuse pickup records in stage and return views. Layout supports arbitrary pickup counts without fixed-height clipping; three-or-more reward images retain the approved 220px preview cap and full-size enlargement. Stable IDs preserve bookmarks. Per-guide reading position and expanded sections stay in this browser, without cloud syncing.

A new game needs researched mechanics and content, not renamed X armor records. Platform games use routes and stage pickups; Battle Network uses story chapters, compatible chip folders, customization, version differences and grouped upgrade inventories. See [expansion scope](docs/collection-expansion.md) and [current state](STATE.md).

## Publishing

GitHub Pages deploys after a push to `main` passes the build and verification workflow. Pages must use GitHub Actions. Publication is confirmed only after deployment succeeds and the intended public URLs return HTTP 200. Existing desktop shortcuts remain valid because the homepage and X page paths are unchanged.

## Sources and verification

Game imagery and Mega Man belong to Capcom. Captures and sprites are credited to their contributors in each guide's bottom Sources section; media records retain source URLs, credits and dimensions. No ownership or open-media license is claimed for third-party assets.

Game-specific sources include HonestGamers, MMHP, Mega Man XZ / RetroPixel, The Rockman EXE Zone, credited walkthrough authors and Capcom collection information. Source and browser checks do not replace a complete gameplay run. The new guides include selected media; not every pickup has a screenshot. Optional chip-code, Cyber-Elf and Secret Disk encyclopedias remain linked references.

See [verification](docs/verification.md), [X3 design review](docs/x3-newcomer-review.md), [original content decisions](docs/content-audit.md), [X5 review](docs/x5-review.md) and [X6–X8 review](docs/x6-x8-review.md).
