# Mega Man X1–X8 Field Guides

[Open the public guides](https://zertrax.github.io/megaman-x-guides/)

Compact, independent fan guides for the original Mega Man X through X8. X4 has separate X and Zero campaigns. Includes boss order, weaknesses, permanent pickups, armor, return trips and route-dependent secrets.

## Run locally

Requires Node.js 22 or newer. No packages to install.

```sh
npm run build
npm run verify
python -m http.server 4180 --directory dist
```

Open http://localhost:4180. The site also works on ordinary static hosting. No server-side app, database, account, analytics or external font is required. YouTube loads only after a reader requests a video.

## Template and content

- `src/games/*.json` owns independently researched game and character content.
- `src/template.cjs` renders shared boss, pickup, roadmap and return-trip components.
- `src/style.css`, `stage.css` and `collection.css` provide responsive presentation.
- `src/guide.js` handles dialogs and on-demand videos; `reading-position.js` restores per-campaign reading state.
- `scripts/build.cjs` produces nine guide pages plus the collection index in `dist/`.
- `scripts/verify-all.cjs` checks inventory, internal links, media metadata, return references and character distinctions.

Return cards reuse the same pickup records as the stage. Layout accepts arbitrary pickup counts without fixed-height clipping. Stable IDs preserve bookmarks. Add future games by creating researched JSON, extending the build roster, game menu and collection card; never infer their mechanics by renaming an existing guide.

The X3 chip records describe alternative locations, not four items to collect in one run. X4 arm capsules count as one interchangeable slot. Character-specific videos replace misleading X screenshots on Zero's Cyber Peacock cards.

## Publishing

GitHub Pages deploys automatically after a push to `main` passes the build and verification workflow. Pages must be configured to use GitHub Actions. Public pages require no sign-in. Browser reading state is local to the browser and site origin; it is not cloud-synced.

## Sources and credits

Game imagery and Mega Man belong to Capcom. Captures and sprites are credited to HonestGamers, MMKB contributors and Mega Man XZ / RetroPixel. Every media record retains a source page, original asset URL, contributor and native dimensions; the guide's bottom Sources section renders credits. No ownership or open-media license is claimed for third-party assets.

See [content decisions](docs/content-audit.md), [design](docs/design-spec.md), and [verification](docs/verification.md). Source verification does not replace a complete gameplay run.

## X5–X8 expansion

The collection now includes X1–X8, with 220px maximum previews for stages and return grids containing three or more rewards. See [X5 review](docs/x5-review.md) and [X6–X8 review](docs/x6-x8-review.md) for content decisions and validation limits.

To compare screenshot heights without changing defaults, run `node scripts/preview-size.cjs` after building, then open `/x5/#grizzly`. The floating control affects only the generated local preview. Rebuilding removes it.
