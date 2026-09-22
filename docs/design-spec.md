# Shared guide design

The site is a reference kept beside a running game. Keep directions readable and compact; prioritize complete frames and quick return from media.

- Stage identity, navigation, sprite, combat advice, weakness and reward form one compact header.
- Previous/next controls flank the area name; the stage number returns to the boss flow. Targets are at least 44px.
- Cards wrap naturally. At suitable widths, three or more pickups use two columns and full-scene previews capped at the user-approved 220px height. Width constraints can make them smaller. No stage height, clipped instructions or image cropping.
- A click opens the original local image in a keyboard-accessible modal. Escape, Close and the backdrop dismiss it and preserve reading position.
- Each return stage has one disclosure containing all referenced pickup records.
- Permanent decisions use red warnings at the plan and exact route checkpoint. Optional mutually exclusive chips are visibly distinct.
- Sidebar collapses at 1280px. Contents and Games provide compact navigation. Active section and per-campaign reading position update while scrolling.
- Fonts are local system fonts; animation is limited and respects reduced motion. Videos are opt-in.
- Credits belong in the bottom source register, not each pickup card.

The 940×1277 reference viewport is a fit target, not a promise for every text size or future item count. Phone widths and zoom may scroll vertically. Horizontal overflow and hidden information are failures.
