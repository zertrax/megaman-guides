# X3 newcomer layout review · 2026-10-06

Historical review record. The approved X3 presentation now lives in `src/guide-layout.cjs` and `src/guide-theme.css`, shared across the collection. The temporary X3-only renderer and stylesheet have been removed. See `collection-expansion.md` for the rollout and `verification.md` for current checks.

## Critique and independent audit

The critic's central diagnosis was that the existing page served an experienced collector before orienting a newcomer. Upgrade benefits were buried after two route cards and eight boss panels; Gold and saber were bundled together. The independent auditor verified the mechanics, retained the existing weakness order and rejected the critic's reported escaped-link defect: the existing Neon Tiger link works.

Implemented: compact hero with Start/Continue actions; visible survival primer and four armor benefits; expandable X3-specific Zero/vehicle/saving explanation; independently optional Gold and saber cards with benefits before red consequences; one recommended route preserving the Gold option; specific first-visit tasks; first-visit cards before deferred items; pink-chip alternatives in separate disclosures; full pickup index after progression. Existing section and pickup IDs remain. The original 20 regular items and 4 alternative chips remain present.

Qualified recommendations: armor is strongly recommended for a first clear, never described as required. Body comes late on this weakness route; this tradeoff is stated. No new boss order or universal one-screen fit was promised. Sources include MMHP, RetroPixel, HonestGamers and StrategyWiki. Gold and saber mechanics are independently source-checked; this is not an emulator playthrough.

## Isolation

Only X3 opts into `layoutEdition: newcomer`. `src/x3-layout.cjs` post-processes known renderer fragments and refuses other games. New CSS is loaded by X3 only and additionally scoped to its body attribute. Stable IDs and the existing modal/disclosure/reading scripts are reused. Build copies the separate CSS.

Generated HTML hashes were captured before work. After implementation, only `dist/x3/index.html` differs; all other campaign pages and the collection index are identical. Shared CSS and JavaScript source remain untouched. No commit, push, deployment or desktop shortcut change was performed. Public X3 still shows the previous layout until review.

## Validation

- Independent implementation audit: PASS, no blocking findings.
- Build and all-guide verification: PASS; local links, unique IDs, media provenance, counts, grouped returns and character distinctions.
- X3 final HTML: 86,917 bytes, 74 anchors.
- 940px preview: readable two-column armor/decision panels and full-frame 220px pickup previews.
- 390px preview: no horizontal overflow; decisions stack naturally.
- Direct chip bookmark automatically opens its parent disclosure; original pickup ID retained.
- Local 640px screenshot opens in modal; Escape closes it.
- Catfish return disclosure contains both original pickup cards.
- No video iframe loads during inspection.
- Remaining desktop reading-state and preview screenshot evidence recorded after final browser pass.

Final browser pass: 1440px layout has no overflow and highlights Start here in the sidebar. Leaving the guide and reopening its base URL restores the new introduction to the same 96.39px position. Saved 940×1277 screenshot evidence lives in the sibling work/x3-review folder (x3-introduction.jpg and x3-choices.jpg). Default viewport restored before handoff.

## Legacy Collection visual critique and preview

A separate read-only graphics critic inspected the Legacy Collection main menu (https://lutris.net/media/games/screenshots/s1_YIavas7.jpg) and Capcom's official Gallery image at https://store.captown.capcom.com/products/282351-jp. Its diagnosis: the improved organization still looked like generic gray documentation. Recommended cobalt/navy framing, selective corner chamfers, italic display labels, gold selection chevrons and quiet reading surfaces. These are adapted visual traits; the CSS values are not official measurements.

Applied to X3 only: subdued blue grid outside the reading pane, blue header strips, angular hero/actions, bold italic headings, blue pickup frames, gold active navigation and focus outlines, magenta optional-chip framing, and consistent blue image-viewer controls. Red consequences remain distinct. No new bitmap assets, remote fonts, audio or continuous animation. Added CSS totals 11,962 bytes, including the earlier layout rules.

Visual checks: 390px, 940px and 1440px show no horizontal overflow. The 940px Buffalo panel retains three complete contain-fit images at 220px; stage navigation targets remain 44px. Click-enlarge opens and Escape closes. Wide sidebar highlights Start here in gold/blue with chevron. All-guide verification passes; no shared styling changes, publication or commit. New evidence: sibling work/x3-review/x3-legacy-introduction.jpg and x3-legacy-stage.jpg. Viewport override reset; local X3 preview left at intro.

Follow-up refinements: grouped previous/next controls before stage labels, retaining keyboard order and fixed 44px targets. All eight stages have identical arrow positions at 940px; 390px has no overflow. Section-header cyan accent now uses an inset stripe inside a continuous 1px outline; removed the misaligned corner mask. All-guide verification passes. Wording proposals supplied for review; no prose changes applied.

Approved wording applied to X3: concrete upgrade benefits, direct Gold restriction, explicit Zero/saber choice, and later visits in place of cleanup/branch jargon. Pickup directions and mechanics preserved. Header outline removed; cyan left accent retained with a broader 5px blue lower shadow and soft depth shadow. Local preview only.
