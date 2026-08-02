# FHPC — the dimensions budget

Ratified by Eric 2026-08-02, from measurements taken on the real dock
(`tools/dock-harness.html`, real CSS, real panels) and on his own devices.

**The reference size is `425 × 680`.** That is 100 % zoom, the size the Table
button opens at, and the size every layout decision is judged against.

---

## The three numbers

| | Value | What it means |
|---|---|---|
| **Reference** | **425 × 680** | Comfort. Design here. 100 % zoom. Table mode opens here. |
| **Height floor** | **620** | Survival. Below it the dock **scrolls** — it never re-arranges. |
| **Width floor** | **360** | Unchanged. Below 420 the belt wraps to 4 + 3, which is the existing net. |

Where 425 comes from: it is a sixth of Eric's 2560px screen, so six Table windows
tile across it exactly, two rows deep. It also clears **421px**, the width below
which the belt stops fitting on one row.

Where 680 comes from: a Table window is `(1440 − 25 menu bar) ÷ 2 ≈ 707`, minus
Chrome's ~30px picture-in-picture title bar → **~677px of real content**. A cheap
13" PC laptop (1366×768) leaves ~660. 680 is the honest middle of the two.

## The belt: seven tabs on one row at the reference — nothing to change

At 425 the belt fits seven tabs on one row, because 425 clears the 421px
threshold. On every device in the table below, the belt is one row.

**The existing wrap rule stays exactly as it is:**

```css
/* Seven tabs stop fitting one row somewhere under ~420px, and a belt that
   scrolls sideways can hide the lit tab -- the one thing it exists to show. */
@media(max-width:420px){ .fh-cd-belt{flex-wrap:wrap} … }
```

It only fires **below 420px** — a phone, or a window deliberately squeezed. It is
a net, not a layout Eric has to look at. It was reasoned through once already,
including the deliberate choice not to tie it to the 520px phone breakpoint; there
is no reason to re-open it.

> An earlier draft of this file claimed "belt always at seven" required moving the
> width floor from 360 to 425 and deleting this query. That was wrong, and worth
> recording because the mistake is easy to repeat: **the small-laptop case is a
> height problem, not a width one.** A 1366×768 laptop has ample width for a 425
> dock; what it lacks is the 620–680 of height. The floors stay **620 tall,
> 360 wide**.

Phones remain explicitly out of scope (Eric, 2026-08-02): the mobile interface is
a separate project with a different logic, not a narrower version of this one.
iPad is not "mobile" here — it has the room.

---

## Zoom

Replace the current `1.15 / 1.3 / 1.45` scales — which mean nothing to a reader —
with the convention every browser, map and design tool already uses:

| | |
|---|---|
| Steps | **100 · 125 · 150 · 175 · 200 %** |
| 100 % | **425 × 680** — the reference |
| Below 100 % | **does not exist.** Eric: *"faire moins non."* |
| Controls | `⌘ +` / `⌘ −`, and a **Reset** that returns to 100 % |

Reset is not a nicety: zoom is the one control a user can get lost inside, and a
one-click way back to a known size is what makes experimenting with it safe.

`--cd-fs` keeps doing the work internally — 100 % maps to today's 1.15, so nothing
about the type scale itself changes. What changes is what the user is shown and
what the steps are named.

## Table mode opens at the reference

Today `enterPip()` computes its window from the current dock and the screen:

```js
var width  = Math.round(Math.min(760, Math.max(380, box.width || 440)));
var height = Math.round(Math.min(1000, Math.max(520, availHeight * 0.92)));
```

That is why a Table window arrives at some incidental size — 520 × 805 on a
1440-tall screen. **It should open at `425 × 680`**, the reference, every time:
predictable, tiles six across on a 2560 screen, and the user resizes from a known
starting point instead of an accidental one.

---

## The height budget, against 680

Measured at the reference, zones as they ship today.

| Zone | Height |
|---|---|
| Identity | 71 |
| Character Info | 119 |
| Belt | 44 |
| Panel | 90 |
| Dice Pool | 64 |
| Dice Tray | 96 |
| **Persistent subtotal** | **484** |
| **Free at 680** | **196** |
| Roll Builder (summoned) | 44 |
| Console (summoned) | 118 |
| Info Panel (summoned) | ≈100 — does not exist yet |
| Stream (optional, ships off) | 96 |

| Situation | Stacked | Overlaid |
|---|---|---|
| Persistent only | 484 ✅ | 484 ✅ |
| + Roll Builder | 528 ✅ | 484 ✅ |
| + Console | 646 ✅ *(34 to spare)* | 484 ✅ |
| + Console **and** Info Panel | **746** ❌ *over by 66* | 484 ✅ |

Raising the target from 620 to 680 buys back most of the overflow — the Console
alone now fits, where at 620 it did not. **The middle-click case still does not.**
Eric's own gesture opens the Info Panel and the Console together, and stacked that
is 746 against 680.

So the two decisions are complementary, not alternatives: **680 makes the common
case comfortable; overlaying makes the worst case possible.** With both, the
persistent 484 leaves 196 free and no combination of summoned zones can overflow.

## Character Info is the compressible one

119px at the reference, in three bands:

| Band | Height |
|---|---|
| The six ability cards | 36 |
| PB · INIT · AC · HP · EXH · SHORT · REST | 39 |
| PASSIVES | 25 |

It is not the tallest zone — the Skills panel is ≈430px with Yedrivel's 34 skills
and 3 tools. But Skills is a **scroller** with a 90px floor, while Character Info
is 119px **of which not one pixel folds**. That is why it reads as heavy.

If height is ever needed back, PASSIVES (25) and the SHORT/REST band (39) are the
candidates: **64px** for two things you read *between* rolls, not during one. The
ability cards stay.

---

## Method, so this can be re-run

```
python3 -m http.server 8125 --directory site     # .claude/launch.json → "fh-site-b"
cp tools/dock-harness.html site/
open http://localhost:8125/dock-harness.html
```
Force `.fh-cd-root` to the size under test and read `getBoundingClientRect()` on
each `[data-zone]`. Re-run after any zone changes — a budget measured once goes
stale silently.

## Devices this was checked against

| Device | Usable height | Note |
|---|---|---|
| iPad Pro 13" M4, Display Zoom normal | ~940 | 1376 × 1032 pt. The dock at 460 is a third of the width. Not "mobile". |
| Table window, one of six on 2560×1440 | ~677 | Chrome's PiP title bar costs ~30px and **cannot be hidden** — the API forbids it, so the user always knows which site owns the floating window. |
| Cheap 13" PC laptop, 1366×768 | ~660 | The case the 620 floor exists for. |
