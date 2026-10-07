# Translation review

Updated October 7, 2026. Eight languages cover the library and 36 guides: English, Latin American Spanish, Brazilian Portuguese, Japanese, Simplified Chinese, French, German and Russian.

## Current status

Authoring and local release validation are complete. The library and all 36 guides have full translated body text in each added language. Publication is confirmed separately in the [release record](../STATE.md).

The added languages are authored directly by AI agents against complete English sentences and their game context. Earlier local translation-model trials changed directions and combat advice; none of that trial output is used in the current dictionaries. Selected important instructions, common controls and guide-written headings have separate authored overrides. A full native-speaker editorial review has not been completed.

## Names and screenshots

All screenshots remain English and use the same original media files. Bosses, stages, maps, weapons and item names retain their English spelling until a title-specific official alias is verified. A collection launcher's language list does not establish an individual game's terminology. No unverified official aliases are enabled.

Descriptions written for this guide can be translated. For example, “Return for ship health” is an instruction, and Battle Network's “Weather crisis” is a chapter heading written for this guide. Neither is an official stage name. “Life Tank unlock” becomes a native description while Life Tank remains the English item name. Game names and save identifiers do not change.

Exact-source exceptions distinguish ordinary words from similarly named characters or chips: the verbs “beat” and “roll,” German “Regal” (shelf), and the building in “Tower incident.” These exceptions apply only to documented source units; they do not disable name protection elsewhere. “Return flight” and “First Style” are descriptive guide labels; named programs such as Press remain English.

## Meaning checks

Gameplay review checks the action, target, prerequisite and order, rather than whether a sentence merely sounds fluent. The main risks are:

- Movement: dash-jump versus air dash, upward movement, wall-jumps and getting out of Ride Armor.
- Combat: charging a weapon versus a boss rushing, landing timing, phase conditions and invulnerability.
- Pickups: health versus lives, Sub Tank storage versus maximum health, exact landmarks and left/right directions.
- Permanent choices: X2 Zero parts, X3 pink chips and saber, X5 armor choices, X6 rescues, X7 upgrade ownership, Zero's elf/rank effects and version-specific Battle Network rewards.
- Ordered steps and negatives: release a charged weapon on the required surface, preserve a supporting block, refill before the next teleporter, or avoid taking an upgrade that closes another route.

Structural validation independently checks every source unit for numeric values, mathematical signs, fixed icons, canonical-name counts and unchanged inline HTML. Prose uses local thousands separators where needed; a decimal cannot silently become a whole number. Links, image paths, functional attributes and code remain immutable. Accessible text is translated separately. Source-text hashes invalidate edited English instructions; missing or stale entries block publication. Short proper names and valid cognates can remain unchanged, but ordinary untranslated explanatory sentences and the short requirement label “Need” cannot pass as completed translation.

A separate audit reviewed 17 gameplay instructions in every added language: **119 merged translations** covering the risks above. Corrections made retry lives distinct from health, stated permanent Vile destruction and holding Fire explicitly, preserved one-hunter chip allocation, distinguished energy refills from new weapons, restored explicit wall-jumping, and clarified armor counts and the collected-soul threshold. Selected clipped sentences were rewritten as complete instructions. This is a bounded semantic sample; some other copy can still benefit from native editorial review.

## Interface and state

All pages are generated before loading, so translation cannot move a page after its reading position has been restored. The language control uses native names, keyboard selection and a 44px target. Direct language links take precedence over saved preferences; the English-source link opens the original without resetting that preference.

Language changes preserve route IDs, completion storage keys, reading-section identity and expanded return trips. Pixel offsets can differ with text length. Stage announcements use the displayed heading, so guide-written chapter descriptions remain consistent with their translated controls.

The language runtime stays below 25KB and the added styles below 3KB. Images remain shared; there are no runtime translation requests, model downloads or automatic video playback. The previous comparison site keeps its original English content and separate reading settings.

## Release evidence

- **Coverage:** 8,276 unique English source units; 57,932 translations across seven added languages; 4,074 reviewed overrides. No missing or obsolete entries, ordinary prose fallback or provider residue passes the release gate.
- **Output:** 296 current HTML pages plus ten pinned comparison pages. Every generated page matches its current English source and effective translation dictionary; all 47,810 localized resource/link references pass.
- **Regression checks:** 26 engine/runtime groups, plus independent execution of the real image-viewer and storage-recovery scripts.
- **Browser layout:** 152 representative checks across all eight languages at 390, 940 and 1440px, with a 320px library check for each. Valid guide anchors, no horizontal overflow or loaded-image failures, and language/completion targets of at least 44px. This is representative coverage, not every guide at every viewport.
- **Interaction:** English/Portuguese reading-section, open return-trip, image/Escape/focus and stage-save checks pass. Russian Battle Network chapter marks retain their translated heading, persist in English and update sidebar checks; game completion carries to the translated library. Temporary marks were undone. French campaign-image closing retains its × and opener focus. Displayed X6 thresholds use the expected local grouping in all four affected languages.
- **Weight:** the added language runtime is 16,053 bytes and its CSS 1,805 bytes. The largest generated current HTML page is 136,932 bytes. Original media is shared and no runtime translation requests are made.

See [verification notes](verification.md) for public delivery evidence and [language research](language-research.md) for audience selection and the naming boundary. These checks do not imply native-speaker approval or a complete gameplay playthrough.
