# FHPC — the roll vocabulary

The shared language of a roll: what a die says about where it came from, what a
badge says about what happened, and how a roll reads as one line.

**Fix this before building the Roll Builder or the Dice Tray.** Both render the
same objects, and so does the Stream and every Console. A "Fate refused" must look
and mean the same thing on all four surfaces. Built surface by surface, it will be
rediscovered surface by surface, and then there are four truths.

Ratified with Eric 2026-08-02. Open items are marked as such — they are decisions
not yet taken, not omissions.

---

## 1. Source tokens

Every die carries its provenance. One token per source, defined once, read
everywhere.

| Source | Glyph | Colour |
|---|---|---|
| **Destiny** | **∞** | gold |
| **Guidance** | ★ | blue |
| **Bardic** | ♪ | violet |
| **Tactical** | *open* | red |
| **Bonus I · II · III** | I / II / III | grey |

**The glyph carries the identity; the colour reinforces it.** Never colour alone:
at 12px, blue and violet are not reliably distinguishable — not for a colour-blind
player, not for anyone in a badly lit room on a Wednesday night. What this rule
retires is *choosing the two independently*, not the icon itself.

∞ was chosen for Destiny partly because it is the only **horizontal** mark in the
set. A star and a musical note are both "small spiky thing" at 12px; ∞ is not
mistakable for either.

> **State today:** only two sources are declared, `guidance` and `bardic`, as two
> `if`s in `fh-player-sheet.js:1682`. And `.fh-cd-src` is hard-coded to
> `--cd-gold-bright`, so **every source icon is currently gold**, whatever it is.
> There is no table. This section is the table.

> **Open:** the Tactical glyph.

## 2. The die wrapper

`.fh-cd-diewrap` already is the object this vocabulary is about — a vertical grid
stacking three slots:

```
.fh-cd-src    12px   the source glyph (SVG, or a bold letter in <b>)
.fh-cd-die           the die
em                   the label, truncated at 64px
```

Concretely, in a tray showing three dice, **each column is one wrapper**. The
rightmost might stack: the gold **I** on top, the green triangle showing **1**, and
the label **Bonus I** underneath. It does not "wrap" a die decoratively — it makes
provenance, die and label a single movable unit with its own states.

`.fh-cd-src b` is a bold Georgia letter slot — it was built for exactly the
`I / II / III` numerals the bonus dice need. Nothing to add there.

### The four die types

Their current class names say nothing. Rename them by **function**, so a new
developer does not have to ask:

| Today | Rename to | What it actually is |
|---|---|---|
| `fh-cd-die` | `die` | the base die |
| `fh-cd-ddie` | **`picker-die`** | 31px, clickable, the d4·d6·d8·d10·d12·d20·d% row |
| `fh-cd-wdie` | **`calling-die`** | a die that pulses (`is-calling`) because it is waiting on something |
| `fh-cd-static3d` | **`static-die`** | the pseudo-3D render used in the tray |

> `fh-cd-dieglow` is **not a die type** — it is the name of a keyframes animation
> (the gold glow on a selected picker die). It appeared in an early inventory as if
> it were a fourth kind of die; it is not.

Three states, and one of them has a rule worth keeping:

| State | Effect |
|---|---|
| `is-dropped` | opacity .38, label struck through — a discarded die |
| `is-pending` | opacity .88 |
| `is-flashing` | a Destiny die blinking, **and it never stops** |

The flashing Destiny die is the only animation in the dock that does not settle
after three seconds. Its own comment says why: *what it is announcing is a cost
that has not been paid yet*. Do not "fix" it.

## 3. Badges

Thirteen badges are emitted today, in five visual families:

| Family | Badges |
|---|---|
| `n20` | NATURAL 20 · ARCANE AWAKENING |
| `chaos` | NATURAL 1 accepted · Fate refused · Chaos 2d6 = N · the chaos row · Arcane fate refused · Overreach + save DC |
| `manual` | MANUAL · Exhaustion −N |
| `adjusted` | adjusted |
| `destiny` | Destiny point changes (e.g. *Arcane Critical Success · −1 pt → 5*) |

Result tones, separate from badges: `is-n` (natural) · `is-ok` · `is-bad` ·
`is-quiet`.

### Badges must become derived, not emitted

Today they are pushed at **thirteen separate call sites inside the render path**.
That means each surface recomputes them, and nothing guarantees the Tray and the
Stream agree about the same roll.

**A badge is a property of the roll, not of its rendering.** The shape is a
declarative table of `condition → badge`, evaluated once on the entry. Every
surface then renders the same list because it reads the same list.

This is the same principle as one Console with three field specs: what comes from
the engine is computed once; what is specific is declared.

It matters more than it used to. Since the Dice Tray became the shared surface
(2026-08-02), a divergence is not a private mistake — the whole table sees it.

## 4. The roll line

The Stream already has the format Eric described — *who on the left, result on the
right*:

```
line 1:   time · who · title · total · outcome icon
line 2:   parts · DC · badges
```

`.fh-cd-who` … `.fh-cd-total`. **The Dice Tray does not invent a row: it is this
row, plus the dice.** That also settles the number that blocked the height budget
— a tray line is a Stream entry (~36px) plus dice when they are shown.

**Who: the portrait.** Now that the tray carries the whole table's rolls, the
question you answer while scanning it is *whose roll is this*. A face is
recognised faster than a name at 8px. Name is the fallback when there is no
portrait.

## 5. Ruling text

The line that appears above a resolved roll:

```
ARCANE CRITICAL SUCCESS   Destiny d8 rolled 8 · Lost 1 Destiny Point · Current 5
```

Two parts: a **verdict** in oxblood, then the **account** — what was rolled, what
it cost, where it leaves you.

**It is never flavour.** The name was chosen against "narrative text" for exactly
that reason: call a field narrative and within months someone writes *"the blade
hisses in the dark"* into it, and the day you need to check why you lost four
Destiny points the fact is drowned in prose.

Ruling is the right word because at the table a *ruling* is what the DM decides —
here it is what the engine decided, said out loud. It is the concrete form of the
dock's founding rule, **never fall back silently**: the Ruling is where the engine
discloses what it just did to you.

It follows the same discipline as badges (§3): derived from the entry, not written
at render time, so every surface says the same thing about the same roll.

---

## Open questions

1. **The Tactical glyph** (§1).
2. **How tall is a tray line with dice shown**, as opposed to the compact
   Stream-style line. Needs a drawing before it can be budgeted.
