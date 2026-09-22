# X5 local review — 2026-09-22

Local draft only. Nothing committed, pushed or published. X6–X8 not started.

## Content

- Eight stages and 20 permanent pickup locations: eight hearts, two Sub Tanks, Weapon Tank, EX Tank, four Falcon programs and four Gaea programs.
- Standard route and optional eight-DNA-part route. Separate character ownership, first-character choice, level threshold, mutually exclusive DNA choices, development delay and colony randomness are called out.
- Falcon completion return after Firefly; Gaea cleanup after the colony event; Firefly return groups both items while explaining the two loadouts.
- Secret capsule instructions cover both Ultimate Armor and Black Zero before clearing Zero Space 3. Zero combat inputs, endings, fortress and ordinary refill tips included.
- 21 full-scene 320×240 location images plus eight boss sprites, with per-file source and contributor records. Some source scenes show Zero or another suit; they identify the location, not necessarily the recommended route loadout.
- Sources linked in the guide: RetroPixel locations/parts/techniques; Emeq's level/rank guide; NeoChozo walkthrough; independent item guides; MMHP; MMKB armor pages; MegaYoYo video reference. Old claims of guaranteed colony success were not adopted. No glitches, cheats or RNG manipulation in the route.

## Screenshot-height experiment

Run the normal build, then `node scripts/preview-size.cjs`. Serve `dist` locally. Open `/x5/#grizzly`.

The floating panel adjusts only grids with three or more pickups. It provides 180/220/300px presets, a 120–420px slider and Original. Values are maximum heights: object-fit containment preserves the full scene and width constraints can make an image smaller. Session storage retains the comparison value between local guide pages. Collapse the panel to inspect the whole stage.

This script patches generated output only. A normal build removes the panel. The user approved a shared 220px maximum for grids with 3+ rewards on 2026-09-22; it now applies to every guide. Bigger pictures trade some scrolling for legibility; three/four full cards are not guaranteed to fit one screen.

## Verification

- Build and all-guide verification passed: pickup totals, files, local links, anchor IDs, return references and armor counts.
- Contact sheet inspected: all 21 location images are full game scenes; rejected cropped media and menu icons are outside shipped assets.
- Browser: 940×1277 preview, 240px and 300px rendered heights, full-scene containment, lightbox opening and Escape closing; 390px document has no horizontal overflow.
- Gameplay routes are source-checked, not emulator-playtested. Colony outcomes remain probabilistic. Tight-clock DNA route needs in-game review.
