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

`.fh-cd-src b` is a bold Georgia letter slot — it was built for exactly the
`I / II / III` numerals the bonus dice need. Nothing to add there.

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

---

## Open questions

1. **The Tactical glyph** (§1).
2. **"Suggestion" popups.** Eric listed these among the things to design; the
   referent is not established. Two readings, and they land in different places:
   the engine proposing a move (*"you can spend a Destiny point here"*) belongs to
   the Console; a tooltip explaining what an Overreach *is* belongs to the Info
   Panel. Asked twice, still open — do not guess.
3. **How tall is a tray line with dice shown**, as opposed to the compact
   Stream-style line. Needs a drawing before it can be budgeted.
