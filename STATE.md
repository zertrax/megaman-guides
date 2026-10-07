# Guide collection state

Updated: 2026-10-07.

## Current work

Final interface refinements are published at df611a5 through successful deployment 37701799886 under the renamed public repository `zertrax/megaman-guides`. The library collection links are uniform and shorter in appearance while keeping 44px targets. Translation notices and editorial-review disclosures sit inside every translated footer. Completed games show a faded cover and cyan clear stamp in library cards and guide title covers; existing stage marks, original artwork and saved-progress identities are preserved.

The build and full release gate pass, including footer-placement checks across 259 translated pages and all 26 localization regression groups. Sixteen real-script completion fixtures pass across eight languages and library/guide shapes. All 1,059 public files, including 306 HTML pages, return HTTP 200 and match the checked build. The library and X3 desktop shortcuts now use the new Pages address. The browser runtime could not initialize this turn, so a fresh visual/interaction check is unavailable; the earlier 152-case browser pass predates these refinements.

The earlier eight-language guide release was published at 8826d4f through successful deployment 37614157795. README includes English website screenshots and clear guide/language links; development details live in docs/development.md. GitHub About describes the guides and their eight languages. The source immediately before the final refinements is preserved at 2d193ed, tag public-before-final-ui-2026-10-07.

Eight-language support is complete and published. Locales: en, es-MX, pt-BR, ja, zh-Hans, fr, de and ru. English screenshots and existing stage identifiers remain unchanged. Native game aliases need title-specific official evidence before use; collection launcher language lists do not establish them. Descriptive guide headings are translated.

Static localization passes 26 regression groups and the full release gate: 57,932 current translations, 4,074 reviewed overrides, 296 current pages and 47,810 localized link/resource references. An independent audit checked 17 gameplay instructions per added language (119 samples); identified defects are fixed and rechecked. A 152-case representative browser pass covers all eight languages with valid anchors, no overflow, original media and 44px language/completion controls. Stage/game saves, translated chapter labels, expanded return trips, English-source navigation and image/Escape/focus checks pass. No native-speaker sign-off or exhaustive linguistic review is claimed. See docs/translation-review.md.

## Previous English release

User approved publication of the complete collection and preservation of the old public version. Published through successful GitHub Actions run 37580899433. All 796 public files, including 47 HTML pages (37 current and 10 comparison pages), return HTTP 200 and match the verified build after text line-ending normalization. A final maintenance commit records these results and makes cache hashes deterministic across Windows and Linux.

Public address: https://zertrax.github.io/megaman-guides/
Comparison address: https://zertrax.github.io/megaman-guides/previous/
Previous source: b802060b6c377e43e186136a393ef9804e184e85, tag public-before-2026-10-06.

The complete English collection immediately before translation is also preserved at 72b9f0b, tag public-before-translations-2026-10-07. The live /previous/ comparison continues to use the original b802060 site.

## Completed

36 campaign guides: 11 Classic, 9 X (including X4 Zero), 6 Zero/ZX and 10 Battle Network game/version campaigns. Shared presentation follows the approved X3 interface and wording. Reviewed src/games/*.json and src/campaigns/*.json remain authoritative; no authoring prototypes or placeholder pages remain.

Library order is Classic, X, Zero/ZX, Battle Network. Compact cover cards show the original artwork, first-release year, name and collection. Entire cards open their guides. Completed occupies a separate 44px footer and retains that label in either state. Six cards fit across at 1440px, four at 940px and two on phones. The simplified banner uses original Capcom artwork from Steam, hosted locally and credited at the bottom.

Every guide has an enlarged original cover beside its title, Completed beneath it, and game details at the bottom of its title panel. Stage counts sit beside the boss flow. Original browser/desktop icons remain. Cover, icon and banner manifests retain provenance, dimensions and hashes; archive labels are distinguished from independently verified desktop icons.

Stages and game completion remain reversible and independent. Sidebar/Contents checks indicate cleared stages; current-section highlighting remains separate. Existing reading and completion keys are preserved. Grouped return trips reuse the original pickup records, stay expanded after reopening, and support local enlargement. Three-or-more reward previews retain the approved 220px cap. Shared CSS/JS use content hashes.

The previous public site is rebuilt from its pinned source into /previous/ and verified by its original checks. Reading position and sidebar preference use separate keys, so comparison does not overwrite the current guide's settings. The current library links to it at the bottom. The desktop shortcuts Mega Man Field Guides.url and Mega Man X3 — Field Guide.url use the renamed website's library and /x3/ addresses.

## Final validation

Build and all-guide verification pass, including all content inventories, local assets, provenance, fragments and grouped return references. Previous-version build, original verification and page/asset links also pass.

A fresh final browser pass checks all 36 guides at 390×900, 940×900 and 1440×900 (108 checks): no horizontal overflow, missing covers, undersized completion targets or incorrect sidebar collapse. Library checks at 320/390/940/1440px pass for all 36 cards and the comparison link. X3's grouped two-pickup return, screenshot enlargement, Escape/focus return, expanded return/reading-position restore, current-section highlight and stage keyboard toggle/reload/undo pass. Temporary completion marks are restored.

Earlier completed checks include all-guide stage persistence/undo, cross-tab updates, X4 character separation, keyboard card navigation, network deep links and storage-failure source review. See docs/verification.md for evidence and content limits.

## Scope and limits

No unfinished requested campaigns or known release-blocking defects. This is source-checked guidance, not a complete gameplay run. New Classic/Zero/BN pickup imagery is selective; ordinary chip codes, optional Cyber-Elf/Secret Disk encyclopedias and trophy checklists remain linked references. Star Force, Legends and spin-offs are outside the requested collection. Browser marks are local to a profile/origin and do not transfer from localhost to the public site.
