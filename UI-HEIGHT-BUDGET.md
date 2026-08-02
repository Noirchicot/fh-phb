# FHPC — the height budget

Measured 2026-08-02 against the real dock (`tools/dock-harness.html`, real CSS,
real panels), with the dock forced to the documented floor of **620 × 360**.
Not estimated. The numbers below are `getBoundingClientRect()` on the shipped
zones.

**Verdict: the structure drawing does not fit at 620px.** Not marginally — the
worst case is over by roughly 130px, and the gap opens before any of the new
zones are built.

---

## Measured, at the 620px floor

| Zone (new name) | `data-zone` today | Height |
|---|---|---|
| Identity | `header` | **71** |
| Character Info | `vitals` | **119** |
| Belt | `.fh-cd-belt` | **44** |
| Panel | `skills` | **90** (`min-height: 89.7px`) |
| Dice Pool | `destiny` | **64** |
| Dice Tray | `roller > .fh-cd-frame` | **96** ⚠️ see below |
| **Persistent subtotal** | | **484** |
| **Left of the 620 floor** | | **136** |
| Roll Builder | `roller` bars | **44** (summoned) |
| Console | `console` | **118** (summoned) |
| Info Panel | — | **does not exist** |
| Stream | `stream` | 96 (`min-height: 96px`, optional, ships off) |

## The arithmetic

| Situation | Total | Against 620 |
|---|---|---|
| Persistent only | 484 | ✅ 136 to spare |
| + Roll Builder | 528 | ✅ 92 to spare |
| + Console | **646** | ❌ **over by 26** |
| + Console **and** Info Panel | **≈746** | ❌ **over by ≈126** |

The last line is not a corner case. It is Eric's own gesture: **middle click opens
the Info Panel *and* the Console together**. The most explicitly specified
interaction in the drawing is the one that overflows hardest.

And the Console alone already overflows — **today, on shipped code, before a single
new zone is built.** That is worth sitting with: the budget was already spent.

## Two numbers that make it worse

**The Dice Tray's 96px is not a Dice Tray.** It is one row of dice plus a status
line (63 + 30). The drawing asks for **four rolls visible**, scrolling to twenty,
with a Static Area. Four stacked roll lines cannot be 96px. This was **not
measured** — the harness has an empty history and inventing a row height would be
worse than admitting the gap. It is the single largest unknown in this document,
and it can only push the total up, never down.

**The Info Panel's ≈100px is an assumption**, marked as such. A zone whose job is
to explain a spell in prose will not be usefully smaller.

---

## What this means

Demoting Skills into the belt frees nothing: the Panel zone occupies that slot
either way. There is no spare fat in the persistent zones — 484px for six zones is
already lean.

So the constraint has to break somewhere, and there are only four places:

1. **Summoned zones overlay instead of stacking.** ← *recommended.*
   The Console and Info Panel float over the dock rather than pushing the
   persistent zones. The budget stops being additive, and the worst case becomes
   the persistent 484 — comfortably inside 620. This also matches what a summoned
   zone *is*: a temporary answer to a gesture, not a permanent tenant. It costs
   the ability to read a persistent zone and a summoned one at the same time,
   which for "what does Fireball do" is not a real loss.
2. **Some `fixed` zones become collapsible.** Eric already anticipated this:
   *"on va mesurer, on remettra peut-être certains FIXED en question."* Character
   Info at 119px is the obvious candidate — the numbers you check between rolls,
   not during.
3. **Raise the floor above 620.** Honest, and it narrows where the dock is usable.
4. **Fewer zones.** The Stream is the candidate: since the Dice Tray became the
   shared surface (2026-08-02), the Stream is history plus debugging. It ships
   off and costs nothing when off — but it is worth asking whether it still earns
   a zone.

These are not exclusive. 1 alone resolves the overflow; 1 + 2 gives room to grow.

---

## Method, so this can be re-run

```
python3 -m http.server 8125 --directory site     # .claude/launch.json → "fh-site-b"
cp tools/dock-harness.html site/
open http://localhost:8125/dock-harness.html
```
Then force `.fh-cd-root` to `620px × 360px` and read `getBoundingClientRect()` on
each `[data-zone]`. Re-run after any zone changes — a budget measured once is a
budget that goes stale silently.
