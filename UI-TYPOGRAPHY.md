# FHPC — type and band vocabulary

The authority for **how big text is** and **how tall a row is**, so that a
size can be discussed instead of measured.

Ratified by Eric 2026-08-06, from measurements taken on the Dice Tray branch
(`dock-dice-tray`). In English like its sibling authorities; the spoken French
Eric and the architect actually use is given beside each name.

**Scope — read this before applying anything below.** This document governs the
**Dice Tray (zone 9) and nothing else, today.** The other nine zones keep what
they have. It is written to be adopted, not imposed: **each zone adopts the
vocabulary when it is next rebuilt, and inscribes its own values here in its own
section.** The names are shared across the dock; the numbers are local to a zone.
That is the whole design — it is what lets the Belt be refined later, or the
Console be built next, without renaming a single conversation.

---

## Why this exists

Because a size could not be named, it could not be discussed, and so it was
re-decided every time. The dock carries **43 distinct font sizes** in 0.1px
steps, for what is, on inspection, **seven intentions**. Nine of them sit
between 8 and 8.8 — nobody can see those differences, and everybody has to
maintain them.

None of that was carelessness. Each surface was built by its own session, each
appending to the end of one stylesheet; no one ever held the whole picture at
the moment of choosing a number. This file is the picture.

---

## The rule that comes before the tables

**Never measure the ink. Measure the setting.**

At one identical font size, `S` and `s` do not have the same drawn height — cap
height is ≈0.7em, x-height ≈0.5em — and every glyph has its own advance width.
A ruler held to rendered pixels will give a different answer for every letter,
which is exactly the frustration this document ends. The two discussable
invariants are the **body size** (`font-size`) and the **band height**. Those
are named below. Nothing else is.

---

## Body sizes — the T scale

**Seven rungs. `T1` is the smallest.** Stated explicitly because HTML's `H1` is
the largest, and that inversion misleads everyone who carries it in mind.

| Rung | Size | Spoken | What it sets |
|---|---|---|---|
| **T1** | **6.8px** | *micro* | Meta, mentions, the smallest legible mark |
| **T2** | **7.4px** | *mention* | The die label, the history verdict — the dock's most populated size |
| **T3** | **8.4px** | *libellé* | Labels |
| **T4** | **9.6px** | *corps* | Body — the roll's name, the readable line |
| **T5** | **11px** | *accent* | A step between body and title. **No current user** — it exists because 9.6 → 13 is the widest gap on the low scale. Its first use is a deliberate choice, never a migration |
| **T6** | **13px** | *titre* | Line title, total |
| **T7** | **30px** | *grand nombre* | The result that carries the line |

All seven are multiplied by `--cd-fs` like everything else in the dock, so zoom
keeps working untouched. In code: `--cd-t1` … `--cd-t7`, the dock's existing
`--cd-` namespace.

**Where the dock's existing values land** (declaration counts, whole dock):

| Existing | Count | Becomes |
|---|---|---|
| 6 · 6.3 · 6.4 · 6.5 · 6.6 · 6.8 · 6.9 | 30 | **T1** |
| 7 · 7.1 · 7.2 · 7.3 · 7.4 · 7.5 · 7.6 · 7.8 | **80** | **T2** |
| 8 · 8.1 · 8.2 · 8.3 · 8.4 · 8.5 · 8.6 · 8.7 · 8.8 | 64 | **T3** |
| 9 · 9.2 · 9.3 · 9.4 · 9.5 · 9.6 | 32 | **T4** |
| 10 · 10.5 · 11 · 11.5 | 21 | **T5** |
| 12 · 13 · 14 · 14.5 | 17 | **T6** |
| 16 · 17 · 26 · 30 | 4 | **T7** |

Snapping to a rung is a visual change of at most 0.8px. If a specific spot
genuinely needs to sit off-scale, that is allowed **once it is written here with
its reason** — an exception on the record is a decision; an exception in the
stylesheet is the 44th number.

> **Renumbered 2026-08-06, hours after ratification, and deliberately.** The
> first draft had six rungs and no 7.x at all: its inventory had been drawn by
> matching selector *names*, so it never saw `.fh-cd-diewrap em` — the die
> label — nor the seventeen other declarations at 7.3/7.4. The 7–7.8 band is
> **the most populated in the whole dock (80 declarations)**; a scale that
> jumps it is not a scale. Inserting the rung at position 2 keeps every rung
> Eric ratified, in the same order, and keeps the die label at its size — so
> the tray's "38px fits 7 mixed-case characters" survives, where snapping it to
> 8.4 would have cost a character on every die.
>
> **This renumbering was free precisely because it happened before the first
> line of code consumed a token.** That window closes at the tray's next
> commit. The rule it leaves behind: **a scale is derived once, from a complete
> inventory, before anything is built on it.**

---

## Line height — already settled, do not name it

The tray uses three values and they are **ratios**, not pixels: `1`, `1.1`,
`1.2`. Ratios follow the body size and the zoom by themselves. This part of the
system already works. Nothing to name, nothing to change.

---

## Band heights — states, not numbers

A row is not "63px because that looks right": it is as tall as what it holds.
So bands carry **state names**, and the pixel value is a *consequence* recorded
here — the opposite convention to the T scale, deliberately, because a body size
is a continuum and a row is a small set of discrete cases.

| State | Spoken | CSS class | Height |
|---|---|---|---|
| **Live** | *vivante* | `.is-l1` | **56px** |
| **Current** | *courante* | `.is-mid` / `.is-static` | **56px** |
| **Deep** | *profonde* | `.is-deep` | **72px** |
| **Empty** | *vide* | `.is-empty` | **40px** |

The existing class names are kept as they are. This table is a dictionary, not
a rename.

**The arithmetic that makes this Eric's decision and not a session's:** the tray
shows **five rolls at once** — `--cd-tray-h` is `284px` (declared three times,
`284 → 320 → 284`; the last wins), and the stylesheet states the settled sum
itself: top padding 2 + 5 × 56 = **282 ≤ 284, five whole bands with 2px spare**,
since the cap row died on 2026-08-05 and its 56 became a fifth line. Inside a
zone living under the dock's 620px height floor and the budget of
`UI-DIMENSIONS.md`, one band moved from 56 to 72 costs **+16px**, and the same
move applied to all five costs **+80px** taken from everything else.

> **Corrected 2026-08-06, same day as ratification.** This paragraph first said
> *four* bands and *+64px*, taken from the handoff's description of the tray —
> which predates the cap's death and the 84 → 56 revert. The Dice Tray session
> caught it. **The stylesheet's own settled arithmetic outranks any prose
> description of a zone, including this file's.**

---

## Out of scope, explicitly

**Component heights are not typography.** `10 · 12 · 14 · 18 · 24 · 26 · 34px`
in the tray are pills, icons and dice. They are not text, they do not belong to
the T scale, and folding them in would rebuild the very soup this file exists to
drain. If they need an authority one day, they get their own.

---

## The adoption plan — ratified by Eric 2026-08-06

Zone-by-zone adoption is the mechanism; this is the schedule it ends on.

**Entry condition:** the five lower-half surfaces are rebuilt and merged — Dice
Tray, Roll Builder, Dice Pool, Console, Info Panel. They arrive on the scale
natively, so the residual is only the upper half: Identity, Character Info,
Belt, the seven panels.

**Position in the queue: after those five, and BEFORE the deploy gate opens.**
The reasoning is the gate's own, one step further out: if the pass follows the
release, players watch the dock change **twice** — once for the lower half,
once for typography. One coherent dock, once.

**Exit condition — this is the part that matters.** A pass without a guard
decays: the 44th number returns with the first session in a hurry. The lot is
done when **a test fails if any dock `font-size` is not a token**. That is what
turns this file from an intention into an executed rule, and it joins the
suites that already run at every delivery.

**What the same pass necessarily repairs**, because they are the same defect:
the four hard-coded sizes that ignore zoom (`15px`, `16px`, `9.3px`, `8.4px`)
and the whole unsized-inherits-16px class described in the next section.

**Standing exception, on the record:** the six sizes derived from
`--fh-static-die-size` (`calc(var(--fh-static-die-size) * .19 … .324)`) stay
off the scale. They track the die, which tracks the zoom — they are
proportional by design, not unnamed by neglect.

**The reservation, stated so it is not discovered late:** this is not a `sed`.
The P4 case of 2026-08-06 is the proof — a die label fitting 38px with 0.2px
to spare is a load-bearing value wearing the clothes of a detail. Each zone
redoes its width arithmetic as it snaps. **A lot, not a chore**, and one more
reason to take zones at rebuild time rather than all 2 179 lines in one night.

---

## Unsized text falls out of the zoom system entirely

**No ancestor in the dock chain declares a `font-size`** — not `.fh-cd-root`,
not `.fh-cd-dock`, not `.fh-cd-trayline`. Verified by inspection, 2026-08-06.

The consequence is sharper than a wrong size: an element that declares no size
and sits under no sized parent inherits **the page's 16px**, which is not
multiplied by `--cd-fs` and therefore **does not respond to zoom at all**. It
grows while everything around it shrinks. Found by the Dice Tray session on
`.fh-cd-tray-outcome` (`font-weight:700` and nothing else) — its neighbour
`.fh-cd-tray-verdict` is sized, it is not.

**So this is a class of defect, not one element: every text node in the dock
must land on a rung, explicitly or through a sized parent.** Silence is not a
default here, it is an escape from the zoom system.

---

## Cleanup owed — PAID 2026-08-06, on branch `tray-labels-r34-r39` (`0cbcf9a`)

The four debts below were settled by the architect the same day, on the
R34-R39 lot's own branch rather than on `main` — R40 sits inside that lot's
scope, so fixing it on `main` would have handed the session a conflict
instead of clean ground. **The T scale now exists in code**: `--cd-t1` …
`--cd-t7` on `:root`, each carrying `--cd-fs`, so a size written as a rung
follows the zoom by construction. `.fh-cd-tray-outcome` reads T2 (T4 on the
Live band). The dead `is-l1{min-height:84px}`, the orphan cap rules and
`--cd-traycap-h` are gone, and **`--cd-tray-h` is declared exactly once**.
19/19 green. The record of what was wrong is kept below, because the
diagnosis is worth more than the diff.

## Cleanup owed, found while measuring (2026-08-06)

`companion-dock.css` states the Live band's height **twice, contradicting
itself, 430 lines apart**: line 1271 `.fh-cd-trayline.is-l1{min-height:84px}`
with a comment explaining an arithmetic of "84 + 3×56 ≈ 284", and line 1702
`.fh-cd-trayline.is-l1{min-height:56px}` which overrides it (same specificity,
later in the sheet, so 56 is what ships).

The 56 is the session's deliberate revert and is correct. The 84 is dead, and
its comment describes an arithmetic that no longer holds — anyone reading the
file top to bottom concludes 84. **This is the disease in one example**, and it
is why "how tall is a row" could not be answered by reading. Not a functional
bug; a cleanup to carry at the Dice Tray delivery review.

`--cd-tray-h` has the same shape: declared at 1253 (`284`), 1621 (`320`) and
1734 (`284`). Only a reader who scans to the end knows the answer. Beside it,
`--cd-traycap-h:56px` (1621) is now dead outright — the cap row is no longer
rendered.

**And a warning about how this file was first written**, because it is the
mistake most likely to be repeated: its opening inventory was drawn with a
regex over selector *names* (`fh-cd-tray…`), which silently excluded every
element that renders in the tray without carrying "tray" in its class —
`.fh-cd-diewrap em`, the die label at the heart of the whole discussion, chief
among them. **A zone's boundary is not visible in the stylesheet.** Inventory a
zone from what it renders, never from what its selectors are called.
