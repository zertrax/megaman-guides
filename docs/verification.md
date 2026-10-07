# Verification

## Current collection · October 6, 2026

36 campaign guides plus the library build without dependencies: 9 X, 11 Classic, 6 Zero/ZX and 10 Battle Network versions. No unfinished cards. `verify-all.cjs` checks local assets and anchors, media provenance, return references, Classic boss rosters, all 40 MM8 Bolts, the Proto Shield return, Zero/ZX health and tank inventories, and all BN base HP/Buster/Sub/Regular Memory upgrades. BN2's initial 4MB unlock is separate from the 46MB of collected increases. Both BN4 versions include all 18 tournament scenario entries.

108 responsive browser checks cover every guide at 390×844, 940×900 and 1440×900. No horizontal page overflow. Sidebar is hidden at 390/940px and visible at 1440px; Contents remains available. X3's three-card previews retain whole images at 220px with fixed 44px arrow targets. On narrow screens, cards stack and use ordinary vertical scrolling; they do not clip content to force one-screen height.

Exercised X3's screenshot viewer: opens locally, focuses Close, Escape closes, returns focus and locks background scrolling only while open. Leaving X3's expanded Volt Catfish return and reopening the guide resumed at scrollY 13348, with Cleanup at 95.86px and the return still expanded. Its Contents highlight matched Cleanup. A direct BN6 link opened Central Town's inventory, positioned it below the header, and displayed all 12 rows in that destination. Tables can receive keyboard focus for horizontal scrolling. BN4's expanded SparkMan scenario survived reload. At 390px, selecting Cloud Man closed Contents and reached its stage; Escape closed Games. ZX Advent's local map enlarged and closed with Escape, returning focus to its link. Representative Classic, Zero and BN desktop views were inspected and saved outside the repository.

Content corrections include BN1 armor merchants, BN4's five-EvilChip Black Earth gate, BN5's Legacy Collection Ship Comp locations and S-rank teammate gates, BN6's initially invulnerable Count and SunKey sequence, and Zero 2's permanent lives and wall/ladder elves. References are retained at each guide's bottom. BN uses chronological chapters, folder/customization guidance, version-specific classes and destination-grouped inventories rather than a platform-game boss chain.

Limits: source checks and browser interaction checks are not a complete gameplay run. New Classic/Zero/BN pages use credited sprites and selected maps/captures; many new pickup cards give text directions without a location image. Temporary consumables, every ordinary chip code, optional Cyber-Elf/Secret Disk catalogues and trophy checklists are not exhaustively reproduced. Relevant full catalogues are linked. No public deployment was performed for this expansion.

Guide icons: after the user's correction, nine game identities have individual icons: X1–X3, X5, X6, X8, ZX, ZX Advent and MM11. The first eight use SteamGridDB copies tagged Official by the archive, without claiming independent executable verification. Their imagery was visually inspected. MM11 uses its original Steam ICO; other games retain collection ICO files. X Legacy Collection's fallback icon matches the installed game's Windows registry entry and local Steam file. Source URLs, uploaders and hashes are retained in guide-icons.json. X5/X6 use the archive's unchanged 512px thumbnail files rather than its larger originals. Original browser/shortcut icon assets remain; library artwork now uses game covers. Custom drawings and added number badges remain removed.

Library/progress refinement: 36 full-card links contain game names, artwork and correct collection membership, with separate completion buttons. Structural checks verify a stage control for every listed stage, including X8's Noah side stage, and one game control per guide. The anchor verifier now matches actual id attributes instead of mistaking data-stage-id attributes for duplicate anchors.

108 additional rendered checks cover completion controls at the three viewports above: no horizontal overflow or stage-title/button collisions. Game and stage marks survive reload, support Space/Enter and undo, and update other open same-origin tabs. Library check presses do not navigate; full-card Enter opens the guide. X4 Zero stays unmarked while testing X3. Game completion remains manual when stage marks change. Completed route panels keep their dimensions so toggles do not push the reading position down the page. Test marks are reversed before delivery; screenshots illustrate the feature rather than asserting the user's game progress. Shared progress adds no framework, fonts, analytics or server storage. Existing reading keys and pickup data are unchanged. Public deployment remains pending.

Before the cover update, the four library sections passed 12 responsive checks at 390px, 940px and 1440px with all 36 card icons loading. Browser Back refreshes the library's saved counters. Screenshot enlargement, Escape and focus return still pass with progress enabled. The storage-failure fallback was source-inspected rather than forced in the browser.

Latest cover/card/sidebar refinement: collection order is Classic, X, Zero/ZX, Battle Network. All 36 cards display original cover previews, plain first-release years and collection membership; completion occupies a separate, integrated 44px footer. Rendered checks at 390×900, 940×900 and 1440×900 find no page overflow, clipped card text or undersized completion targets. Covers display at 96px on phones and 112px at the larger widths. Visible previews load correctly. Keyboard Enter on a full card opens its guide; Space on its footer changes completion without navigation, survives reload and updates another open tab. Tests restore the original marks.

Every guide includes original cover artwork beside its title. 108 rendered header checks across all 36 guides and the three sizes above pass with loaded artwork, no horizontal overflow, no title/cover collisions and cover bounds inside the viewport. Stage toggle → reload → undo passes in all 36 guides, including gold sidebar and collapsed Contents checks with readable accessible names. Current-section highlighting remains independent. X3's full-size cover opens the existing viewer, focuses Close, closes with Escape and returns focus to the cover link.

All 35 distinct source covers were visually inspected. Original retail scans are sourced from libretro-thumbnails; MM9/10 use official iam8bit promotional virtual covers rather than fan-made Wii packaging, and MM11 uses its cached official Steam artwork. The full-size WebP files match every decoded source pixel; malformed ancillary PNG profile/text metadata was omitted during conversion. The previews are resized whole-cover images and total 836,996 bytes (about 24KB each). Sources, dimensions and original/output SHA-256 hashes are retained in game-info.json. First-release dates include Japanese equivalents; BN3 White/Blue and BN5 ProtoMan/Colonel retain their different first-release years. Shared CSS/JS content hashes prevent stale cached updates. Review screenshots are outside Git; no publication.

Latest simplified headers and compact cards: library banner text is limited to Mega Man / Field Guides and collection navigation, over original Steam collection artwork. Banner dimensions, credit links and hashes are checked; the two locally hosted artwork previews total 183,152 bytes. Fixed Completed labels remain unchanged on toggle, with check/color/aria-pressed providing the state. Guide completion controls sit beneath larger covers, while stage counts and instructions move to the boss flow. Covers use larger whole-image header previews averaging about 46KB; full-size artwork remains click-to-load.

108 guide-header checks at 390×900, 940×900 and 1440×900 pass for every guide: no horizontal overflow, title/cover collisions, missing covers, clipped completion labels or targets below 44px. Every header omits the stage counter, and every boss flow includes it. Library checks at 320/390/940/1440px pass for all 36 cards with no clipped text or horizontal overflow. Measured density: two columns at 320/390px, four at 940px and six at 1440px. Desktop cards measure 195.75px, versus roughly 398px before this pass. All game buttons read Completed. MM6's game toggle survives reload, retains its label and reverses; stage completion updates the relocated counter and sidebar; clicking Completed does not open the image viewer. Enlarged cover → Escape returns focus correctly. Test marks are reversed. Reading and completion storage keys remain unchanged. No deployment.

## Historical initial release

Checked September 18, 2026, before the initial public release.

## Build and structure

- Five guide pages plus collection homepage build without packages or a runtime framework.
- X1: 8 bosses, 16 pickup records, 47 anchors.
- X2: 8 bosses, 16 pickup records, 65 anchors.
- X3: 8 bosses, 24 location records (20 regular pickups + four optional chip alternatives), 67 anchors.
- X4 X: 8 bosses, 16 pickups, 46 anchors.
- X4 Zero: 8 bosses, 12 pickups, 41 anchors.
- All local page and asset links and fragment references resolve. Return disclosures reuse valid original item IDs. Every pickup has sourced image metadata or a character-specific video.
- All four X3 chip records are marked skip for Gold. Zero has no armor records and does not reuse X's Cyber Peacock reward-room pictures.
- No initial iframe, external script, font, account, analytics or database. Shared CSS ~23KB; JavaScript ~8KB. 109 local media files total 5,122,372 bytes. Media is loaded lazily and shared between pages.

## Browser checks

At 940×1277, no guide has horizontal overflow. Maximum measured stage heights: X1 992px, X2 854px, X3 1,038px, X4 X 944px, X4 Zero 965px. These leave room for the sticky header and anchor offset. Visually reviewed X3's three-card Neon Tiger stage including the red detour checkpoint, and Zero's three-card Frost Walrus stage with complete screenshots.

At 320×800, all five pages have no horizontal overflow; the compact header is 107px high. A 390px pass also confirmed the sidebar is collapsed. Small screens use vertical scrolling; no content is clipped to force a fixed height.

Volt Catfish's return disclosure opens both remaining pickups together. Opening its body screenshot focuses Close; Tab stays in the viewer; Escape closes it, returns focus to the originating image link and preserves scrollY 11,582. Navigating to the collection and back restored that scroll position, the expanded disclosure and the Return trips navigation highlight.

The Games menu switches X4 Zero to X correctly. Each campaign has its own storage ID and selected campaign tab. Zero's Cyber Peacock cards display the correct room 2/3 requirements and distinct timestamped video controls. No console errors observed during the final local pass.

## Content and limits

X2 detour update: all eight entrance/approach images load from local assets. Verified the expanded cards at 940px and 390px with no horizontal overflow. Clicking a screenshot opens the existing viewer; Escape closes it and returns focus to the originating link. Build, inventory, page/asset links and diff checks pass across all five campaign pages. These frames show the relevant approach landmarks; source timestamps and creator credits are retained in the bottom credits.

Game routes were cross-checked against the linked stage/item sources; see content-audit.md for decisions and resolved contradictions. All added images were visually inspected, including the replacement X4 isolated sprites. The site has not been validated by a complete console/emulator playthrough. Frame fit is specific to measured viewports and normal text size; longer future content and enlarged text can require scrolling.

Reading state belongs to one browser profile and origin. Clearing browser data removes it; it does not sync between devices or migrate from a previous hostname.

2026-09-18: Added source-checked Useful tips sections to X1, X2, X3 and both X4 campaigns, with contextual refill links. Built each completed game update sequentially; verify-all passed for all six HTML pages, local media, unique anchors, return cards and character differences. git diff --check passed. Crystal Snail movement and refill advice are source/user-checked, not emulator-tested. No new media, scripts, styles or dependencies were added to the site. X5-X8 remain outside this update.

## Publication preparation · October 6, 2026

The user approved publishing all 36 guides and retaining the previous public site. A fresh 108-guide responsive pass at 390/940/1440px, four-width library pass, X3 grouped-return/image-dialog/reading-restore/stage-toggle regression and complete build/content/asset verification pass. The earlier local-only notes above are historical review checkpoints.

The pinned b802060 source builds into /previous/ and passes its original verification plus archive page/asset links. Presentation and content remain unchanged; reading/sidebar keys use field-guide-previous to avoid overwriting the current guides. The library footer links to the comparison. The annotated tag public-before-2026-10-06 preserves the previous source. The workflow fetches full history for reproducible snapshot builds. Public deployment and live checks will be recorded after completion.

## Published release · October 6, 2026

GitHub Actions run [37580899433](https://github.com/zertrax/megaman-x-guides/actions/runs/37580899433) built and deployed revision 42d53dd successfully. The repository remains public with HTTPS enforced. The live library shows 36 cards in the requested collection order and loaded banner artwork.

A full-tree public check fetched 796 files, including all 47 HTML pages, shared scripts/styles, original covers, screenshots, sprites and the previous-version manifest. Every request returned HTTP 200; every binary matched the local build, and every text file matched after line-ending normalization. HTML comparisons initially exposed Windows/Linux line-ending differences in stylesheet cache hashes; the build now canonicalizes generated text before hashing, so local and CI URLs agree. The 37 affected HTML comparisons pass after that correction.

An independent local scan also checks 8,043 links/media references across both versions, including cross-page fragments. The previous version stays accessible at https://zertrax.github.io/megaman-x-guides/previous/ and its source tag is published. Desktop URLs remain unchanged; the main shortcut is renamed Mega Man Field Guides.url and X3 continues to open /x3/. No requested campaigns or release-blocking items remain pending. Gameplay and selective-media limits above still apply.

## Eight-language release checks · October 7, 2026

The complete build and default verification command pass after the final semantic corrections. There are 296 current pages (the library and 36 guides in eight languages) and ten pinned comparison pages. The gate validates all 57,932 current translations, 4,074 reviewed overrides, 47,810 localized link/resource references and exact page agreement with current source. All 26 localization engine/runtime regression groups pass. The previous site retains its original content and separate settings.

An independent reviewer checked 17 gameplay instructions in each added language, for 119 merged samples. Reported precision and interface defects are corrected and rechecked. All seven short requirement labels and 28 locale number-formatting overrides are checked separately. This selected semantic review is distinct from the complete structural checks; neither establishes native-speaker approval or an exhaustive review of every translated paragraph.

The final browser matrix records 152 representative checks: six pages in each language at 390/940/1440px, plus each library at 320px. All have valid targeted anchors, no horizontal overflow, no failed loaded images and language/completion controls at least 44px wide/high. The pages include X3's three-pickup stage, X8's four-pickup stage, Classic, Zero and a Battle Network chapter. This does not mean all 296 pages were inspected at every width.

English/Portuguese checks preserve the reading section, open grouped return trip and stage marks through language changes; an English-source link preserves the language preference. French campaign-image enlargement keeps the × close symbol and returns opener focus after Escape. Russian Battle Network chapter completion uses the translated chapter heading, persists in English and updates both sidebar checks; manual game completion carries to the translated library. All temporary marks are undone. Displayed X6 thresholds use Portuguese/German dots, French narrow no-break spaces and Russian no-break spaces while retaining the value 3000.

The language runtime adds 16,053 bytes and its stylesheet 1,805 bytes. The largest current generated HTML file is 136,932 bytes. Screenshots, covers and sprites remain shared English-source media; reading pages requires no translation service, model download or video autoplay. Public deployment evidence follows after the workflow completes.
