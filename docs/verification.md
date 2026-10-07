# Verification

## Current collection · October 6, 2026

36 campaign guides plus the library build without dependencies: 9 X, 11 Classic, 6 Zero/ZX and 10 Battle Network versions. No unfinished cards. `verify-all.cjs` checks local assets and anchors, media provenance, return references, Classic boss rosters, all 40 MM8 Bolts, the Proto Shield return, Zero/ZX health and tank inventories, and all BN base HP/Buster/Sub/Regular Memory upgrades. BN2's initial 4MB unlock is separate from the 46MB of collected increases. Both BN4 versions include all 18 tournament scenario entries.

108 responsive browser checks cover every guide at 390×844, 940×900 and 1440×900. No horizontal page overflow. Sidebar is hidden at 390/940px and visible at 1440px; Contents remains available. X3's three-card previews retain whole images at 220px with fixed 44px arrow targets. On narrow screens, cards stack and use ordinary vertical scrolling; they do not clip content to force one-screen height.

Exercised X3's screenshot viewer: opens locally, focuses Close, Escape closes, returns focus and locks background scrolling only while open. Leaving X3's expanded Volt Catfish return and reopening the guide resumed at scrollY 13348, with Cleanup at 95.86px and the return still expanded. Its Contents highlight matched Cleanup. A direct BN6 link opened Central Town's inventory, positioned it below the header, and displayed all 12 rows in that destination. Tables can receive keyboard focus for horizontal scrolling. BN4's expanded SparkMan scenario survived reload. At 390px, selecting Cloud Man closed Contents and reached its stage; Escape closed Games. ZX Advent's local map enlarged and closed with Escape, returning focus to its link. Representative Classic, Zero and BN desktop views were inspected and saved outside the repository.

Content corrections include BN1 armor merchants, BN4's five-EvilChip Black Earth gate, BN5's Legacy Collection Ship Comp locations and S-rank teammate gates, BN6's initially invulnerable Count and SunKey sequence, and Zero 2's permanent lives and wall/ladder elves. References are retained at each guide's bottom. BN uses chronological chapters, folder/customization guidance, version-specific classes and destination-grouped inventories rather than a platform-game boss chain.

Limits: source checks and browser interaction checks are not a complete gameplay run. New Classic/Zero/BN pages use credited sprites and selected maps/captures; many new pickup cards give text directions without a location image. Temporary consumables, every ordinary chip code, optional Cyber-Elf/Secret Disk catalogues and trophy checklists are not exhaustively reproduced. Relevant full catalogues are linked. No public deployment was performed for this expansion.

Guide icons: after the user's correction, all 37 page documents point to the original Steam desktop icon for their release. The eight ICO files remain unmodified; hashes and official URLs are retained in guide-icons.json. X Legacy Collection's icon also matches the installed game's Windows registry entry and local Steam file. All 24 icon-review images (eight originals at 16, 32 and 64px) loaded and were visually inspected. Library cards display authentic icons at 32px. Games within a collection share its icon; custom helmet drawings and added badges have been removed.

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
