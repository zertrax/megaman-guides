# Guide collection state

Updated: 2026-10-06.

Public baseline: X1-X8 at https://zertrax.github.io/megaman-x-guides/ (b802060). No publication in the current expansion turn.

Authorization: approved X3 visual and wording treatment across all X guides. Then Classic 1-11, Zero/ZX, Battle Network in that order. See docs/collection-expansion.md for coverage and quality gates.

Completed locally: 36 campaign guides and the four-collection library. All nine X campaigns share the approved X3 presentation, newcomer guidance and wording. Added Classic 1–11, Zero 1–4, ZX, ZX Advent and ten Battle Network game/version campaigns. Reviewed source data is authoritative: src/games/*.json and src/campaigns/*.json. One-time authoring prototypes were removed to prevent overwriting manual corrections.

Validation: all-guide build and structural checks pass. Browser checks pass across all 36 guides at 390×844, 940×900 and 1440×900 without horizontal page overflow. The sidebar collapses at 940px and remains available at 1440px. Screenshot modal, focus return, saved reading section/offset/open returns, section highlight and direct links into collapsed inventories were exercised. See docs/verification.md for evidence and content limits.

Delivery: local preview at http://localhost:4185/. Public deployment and desktop links remain at the prior release. No placeholders or unfinished collection cards. Star Force, Legends and spin-offs are outside this request. New pickup screenshots are selective; no claim of a complete gameplay validation or an exhaustive chip/disk encyclopedia.

Guide icons: user clarified that original game identity takes priority over custom artwork. Individual artwork icons are now used for X1–X3, X5, X6, X8, ZX and ZX Advent, from archive entries tagged Official by SteamGridDB. These archive copies have not been independently checked against release executables, and credits say so. MM11 retains its own verified Steam desktop icon. Remaining games use their collection's original Steam icon. Archive-provided smaller X5/X6 files avoid loading the large originals; artwork is not redrawn or badged. All icons are hosted locally; library display is 32px. guide-icons.json records sources, attribution and hashes. X5–X8 collection membership is correctly labeled Legacy Collection 2 independently of which icon is used.

Library and personal progress: all 36 campaigns are full-card links showing only name, icon, collection and completion status. Separate 44px check buttons avoid nested interactive controls. Normal, hover, pressed, released and keyboard focus states share the approved colors. Reversible stage/chapter/mission and game completion marks use browser storage, update route panels and open tabs, and remain independent. No pickup tracking or automatic game completion. Local and public origins keep separate progress. No publication in this turn.

Additional validation: 108 completion-control layout checks across all 36 guides at 390×844, 940×900 and 1440×900 pass with no horizontal overflow or boss-title/control collisions. Browser interactions verify game/stage persistence after reload, undo, keyboard navigation, cross-tab synchronization and separate X4 campaign records. All-guide build, structural/content checks and progress-control coverage checks pass. Review screenshots are outside the repository; temporary completion marks used in testing are removed before delivery.
