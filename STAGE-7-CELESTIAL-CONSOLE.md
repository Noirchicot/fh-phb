# Stage 7 — Celestial console identity

## Scope

This delivery builds on the Stage 6 generalized roller and applies the visual direction approved by Eric on 2026-07-23.

The permanent character sheet keeps its existing structure. Its parchment is only softened slightly; the Roll Console, event log and Dice Tray become one midnight-blue celestial workbench.

## Files

- `docs/javascripts/fh-player-sheet.js`
  - Adds one reusable inline-SVG icon family.
  - Adds the compact Guidance, Tactical Mind, Bardic and Other preset cards.
  - Tactical Mind prepares a d10.
  - Other creates `Other I`, `Other II` and `Other III` sources.
  - Preserves source identity if the custom label is edited.
  - Adds the chosen **A · Clean** d20/ouroboros Roll action.
  - Carries source seals into the Dice Tray.
  - Keeps the blue `+2` modifier deliberately free of a seal.
- `docs/stylesheets/player-sheet.css`
  - Adds the Stage 7 celestial workbench skin.
  - Keeps the upper sheet parchment-led and readable.
  - Uses gold/ivory icons on dark surfaces and burgundy/night icons on parchment.
  - Dice palette: base d20 ivory, Destiny gold, bonus dice green, fixed `+2` blue.
  - Adds compact A/D coin controls, tarot-card presets, source seals and the star field.
- `tests/player-sheet.integration.test.js`
  - Covers the four preset cards, Tactical Mind d10, Other source persistence, Dice Tray Roman seal and the unbadged `+2` token.

The Stage 6 logic and its existing test updates remain included because this graphic pass is designed for that implementation.

## Approved icon map

| Source | Console icon | Dice Tray seal |
| --- | --- | --- |
| Guidance | Four-point star | Star |
| Tactical Mind | Short sword | Sword |
| Bardic | Lyre | Lyre |
| Destiny | Hand and crescent | Dedicated gold die |
| Other | Fan of three cards | `I`, `II`, `III` |
| Roll | Clean d20 with open-mouth ouroboros | Same icon |

## Non-changes

- No Worker/API change.
- No change to the Destiny rules or recovery logic.
- No change to the upper-sheet information architecture.
- `mkdocs.yml` is untouched.
- `fh-mychar.js` was not restored or referenced.

