# Stage 4 — Roller, Events and Dice Tray audit

Base: `9378fab` (`DM Control: testable fh-gm.js client, worker status, deep links to player sheets`)

## Rules terminology implemented

| Destiny die result | Visible rule name | Destiny effect |
| --- | --- | --- |
| Natural 1 | **Arcane Critical Failure** | Gain 1 Destiny Point; the die is spent |
| Maximum face, such as 8 on d8 | **Arcane Critical Success** | Treat as a Natural 20; lose only 1 Destiny Point; the die is spent |
| Other result | Destiny roll | Subtract the result from Destiny Points; add it to the check |

**Arcane Awakening** remains separate: it occurs only when a natural 20 on the d20 reduces Destiny Points to 0.

## Corrected behavior

- A configured Destiny die rolls before the d20 and all other bonus dice.
- Its ordinary implications are combined in one blocking event: die result, Point change, current Points and recovered die.
- Chaos is kept as a separate major event.
- The next phase is labelled `Continue`; only the last event of a completed roll is labelled `Finish`.
- The tray cannot be cleared or mutated during an unresolved roll transaction.
- Clicking a second skill or another unrelated sheet action cannot overwrite a pending roll.
- Refreshing during the Destiny phase restores the serialized transaction without spending the die twice.
- A failed check can receive Bardic or Destiny rescue without rerolling its original d20.
- History adjustment keeps the original d20 immutable.
- The Destiny die is recovered only when Points increase to an even total; spending to an even total never recovers the just-spent die.
- Special event presentation distinguishes Natural 1, Natural 20, Arcane Critical Failure, Arcane Critical Success, Chaos and Arcane Awakening.

## Deterministic verification matrix

| Scenario | Verified result |
| --- | --- |
| Destiny maximum | Arcane Critical Success; −1 Point; die spent |
| Destiny 1 | Arcane Critical Failure; +1 Point; lowest missing die may recover |
| Destiny overreach | Consolidated Destiny event, then separate Chaos event |
| Natural 20 to 0 Points | Arcane Awakening event |
| Natural 1 accepted | One grouped Fate/Point event, then final result |
| Natural 1 defied | Transformation event, separate scary Chaos event, then final result |
| Advantage / Disadvantage | Two d20s; correct kept die |
| Guidance / Bardic / Destiny | Correct tray order and delayed rolling |
| Failed roll rescue | Bonus die added without changing original d20 |
| History adjustment | Original d20 remains unchanged |
| Mid-roll refresh | Pending phase resumes; Destiny spent once |
| Clear / second skill during roll | Blocked until transaction is finished |

## Commands passed

```text
node --check docs/javascripts/fh-player-sheet.js
node tests/player-sheet.test.js
node tests/player-sheet.integration.test.js
node tests/roller-state-machine.test.js
node tests/gm-control.integration.test.js
python3 -m mkdocs build --strict
```

All commands pass. MkDocs reports only its upstream Material-for-MkDocs notice and the pre-existing `backgrounds.md` navigation notice.
