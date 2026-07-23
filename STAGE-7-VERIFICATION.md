# Stage 7 — Verification

## Automated checks

Executed from the repository root:

```text
node --check docs/javascripts/fh-player-sheet.js
PASS

node tests/player-sheet.test.js
Player sheet unit tests passed.

node tests/roller-state-machine.test.js
Roller state-machine tests passed.

NODE_PATH=/tmp/fh-player-test/node_modules node tests/player-sheet.integration.test.js
Player sheet DOM integration tests passed.

NODE_PATH=/tmp/fh-css/node_modules node -e "... css-tree.parse(player-sheet.css) ..."
CSS parse passed.

PYTHONPATH=/tmp/fh-python python3 -m mkdocs build --strict
PASS
```

The strict MkDocs build emitted only the expected Material-for-MkDocs upstream banner and the pre-existing notice that `chapters/backgrounds.md` is not in `nav`.

## Behaviors rechecked

- Guidance remains compatible with the legacy `entry.guidance` mirror.
- Tactical Mind adds one generic d10 without creating a special roll-engine branch.
- Other sources retain `I`/`II`/`III` identity after their editable labels change.
- The Dice Tray displays the source seal on bonus dice only.
- The fixed blue `+2` token has no upper-right badge.
- Advantage/disadvantage, forced results, history adjustment and transaction locking remain covered by the Stage 6 suites.
- The upper character sheet DOM and information hierarchy are unchanged.

## Visual decisions

- The upper two-thirds remain parchment-led for dense-data readability.
- The workbench uses a CSS-only sparse star field; there is no raster dependency.
- Green is reserved for bonus dice and the Advantage state. Their different shapes and locations keep the meanings distinct.
- The A · Clean d20/ouroboros is inline SVG, so it stays sharp at 24–32 px.

