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
re-decided every time. The Dice Tray alone carries **eleven distinct font
sizes** — `6.4 · 6.8 · 6.9 · 8.2 · 8.4 · 8.6 · 9 · 9.2 · 9.6 · 13 · 30` — for
what is, on inspection, **five intentions**. Six of those values sit inside a
1.4px span: nobody can see the difference, and everybody has to maintain it.
Dock-wide the count is **37**, in 0.1px steps.

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

**Six rungs. `T1` is the smallest.** Stated explicitly because HTML's `H1` is
the largest, and that inversion misleads everyone who carries it in mind.

| Rung | Size | Spoken | What it sets |
|---|---|---|---|
| **T1** | **6.8px** | *micro* | Meta, mentions, the smallest legible mark |
| **T2** | **8.4px** | *libellé* | Labels |
| **T3** | **9.6px** | *corps* | Body — the roll's name, the readable line |
| **T4** | **11px** | *accent* | A step between body and title. **No current user** — it exists because the gap 9.6 → 13 was the widest on the low scale. Its first use is a deliberate choice, never a migration |
| **T5** | **13px** | *titre* | Line title, total |
| **T6** | **30px** | *grand nombre* | The result that carries the line |

All six are multiplied by `--cd-fs` like everything else in the dock, so zoom
keeps working untouched. In code: `--cd-t1` … `--cd-t6`, the dock's existing
`--cd-` namespace.

**Where the eleven existing values land:**

| Existing | Becomes |
|---|---|
| 6.4 · 6.8 · 6.9 | **T1** |
| 8.2 · 8.4 · 8.6 | **T2** |
| 9 · 9.2 · 9.6 | **T3** |
| — | T4 |
| 13 | **T5** |
| 30 | **T6** |

Snapping to a rung is a visual change of at most 0.6px. If a specific spot
genuinely needs to sit off-scale, that is allowed **once it is written here with
its reason** — an exception on the record is a decision; an exception in the
stylesheet is the 38th number.

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
shows **four rolls at once**. Every pixel of band height is therefore multiplied
by four, inside a zone living under the dock's 620px height floor and the zone
budget of `UI-DIMENSIONS.md`. Moving a band from 56 to 72 is not +16px, it is
**+64px** taken from everything else on the dock.

---

## Out of scope, explicitly

**Component heights are not typography.** `10 · 12 · 14 · 18 · 24 · 26 · 34px`
in the tray are pills, icons and dice. They are not text, they do not belong to
the T scale, and folding them in would rebuild the very soup this file exists to
drain. If they need an authority one day, they get their own.

---

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
