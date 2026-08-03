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
| **Destiny** | **∞** lemniscate, heavier stroke | gold |
| **Guidance** | ★ | blue |
| **Bardic** | ♪ | violet |
| **Tactical** | 🛡 shield | red |
| **Bonus I · II · III** | I / II / III | grey |

**The glyph carries the identity; the colour reinforces it.** Never colour alone:
at 12px, blue and violet are not reliably distinguishable — not for a colour-blind
player, not for anyone in a badly lit room on a Wednesday night. What this rule
retires is *choosing the two independently*, not the icon itself.

∞ was chosen for Destiny partly because it is the only **horizontal** mark in the
set. A star and a musical note are both "small spiky thing" at 12px; ∞ is not
mistakable for either.

The shield won Tactical for the mirror reason: it is the only silhouette in the set
that **narrows towards the bottom**, so it survives being reduced to a smudge.
Both sword candidates were rejected, and the reason is worth keeping because it is
not obvious in isolation — **glyphs are judged against their neighbours, not on
their own.** A single sword becomes a vertical stroke with a bar, which is exactly
the `I · II · III` numerals sitting beside it in the same tray. Crossed swords
become a radial spiky mass, which is the Guidance star sitting on the other side.
Both collisions are a few pixels apart in the same row.

**Draw these properly.** The first ∞ shipped in a mockup was three separate arcs
whose ends did not meet; at 48px it looked sloppy and at 12px it was a smudge. The
lemniscate is one continuous path, and the heavier stroke weight is the one to use:
these glyphs are never seen large, they are seen at 12px, at an angle, mid-session.

> ~~**State today:** only two sources are declared, `guidance` and `bardic`, as
> two `if`s in `fh-player-sheet.js:1682`. And `.fh-cd-src` is hard-coded to
> `--cd-gold-bright`, so **every source icon is currently gold**, whatever it
> is. There is no table.~~
>
> ✅ **BUILT 2026-08-03**, branch `roll-vocabulary`. `ROLL_SOURCES` is the table,
> and it is now the only declaration of a source anywhere: the die's 12px slot,
> the advanced drawer's mark, the seal card's row and the label a sealed die
> takes all read it. Each tone is one CSS variable (`--cd-src-*`) and one rule.
> `.fh-cd-src b` inherits the tone instead of pinning gold — that hard-coding
> was why a Bonus II read as a Destiny die at a glance.
>
> Two things the table being real immediately paid for: **Tactical was drawable
> by the engine and unreachable from the seal card**, because the card kept its
> own hand-written list of seals; and **a Destiny die left its 12px slot empty**,
> the one die in the tray whose provenance the player had to infer. Both are
> fixed by the row existing, not by a patch.

> ~~**Open:** the Tactical glyph.~~ **Decided 2026-08-03: a filled shield with
> square shoulders and STRAIGHT sides converging to a point** — half block, half
> wedge.
>
> The first attempt was a proper heater shield with curved flanks, and it was
> wrong for a reason worth keeping: **rasterised at 12px its corners rounded off
> and it read as a solid blob with no taper at all.** The taper is the entire
> argument for the shield over the swords, so a shield whose taper does not
> survive the raster is not a shield, it is a smudge that happens to be red.
> Straight edges and a flat top survive 12px; curves at this size do not.
>
> The general rule, which cost a redraw to learn: **judge a glyph on its 12px
> RASTER, not on its path.** A path that describes a taper and a raster that
> shows one are different claims. Measured in the harness by drawing each glyph
> into a 12×12 canvas and magnifying the actual pixels.

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

> ✅ **BUILT 2026-08-03.** `ROLL_BADGE_RULES` is the table — thirteen rules, five
> families, in reading order — and `rollBadges` walks it. `rollVocabulary(entry)`
> is the single derivation every surface calls; it returns the badges and the
> Ruling off the same entry in the same pass, so a surface cannot read one
> without the other and cannot compute either for itself. The spoiler flag now
> rides **on** the badge, so a surface hiding an unrevealed result no longer
> needs its own copy of which families are spoilers.

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

> ✅ **BUILT 2026-08-03.** `rollRuling(entry)` returns `{verdict, title, account}`.
> The verdict comes from `ROLL_VERDICTS`, **one table with two readings**: the
> machine-facing `outcome` string that `outcomeTone` and `feedTone` already match
> on, and the `verdict` the Ruling says out loud — declared side by side so they
> cannot drift the way thirteen scattered pushes let badges drift. `title` (name
> + total) is the heading's fallback when the engine decided nothing, and moves
> into the account when there IS a verdict, so the roll's identity is never lost
> and never doubled.
>
> The frame's status line grants `.fh-cd-verdict` / `.fh-cd-account` **by
> equality with the derived verdict**, not by a flag: a Chaos or Overreach prompt
> written into the same slot ("Roll 2d6 and read the Chaos table") is not a
> ruling and cannot borrow its authority.
>
> **It reads as designed and it immediately found something.** On the arcane
> "Refuse" path, `resolveArcaneOne` calls `setDestinyPoints(0, …)` but never
> updates `spent.pointsAfter`, so the Ruling says *Gained 1 Destiny Point ·
> Current 9* while the pool is actually 0. The badge has been saying the same
> thing (`+1 pt → 9`) all along — the two surfaces agree, which is what this lot
> is for; they agree on a stale number, which is a roll-engine defect and not a
> vocabulary one. Out of scope here, and left for the engine.

> **Position, not content:** the Ruling still renders where the old verdict line
> rendered — docked at the bottom of the frame, not above the dice. Moving it is
> a Dice Tray decision (§4), and moving it here would have been this lot building
> the surface it exists to prepare.

---

## Open questions

1. ~~**How tall is a tray line with dice shown**, as opposed to the compact
   Stream-style line. Needs a drawing before it can be budgeted.~~
   **ANSWERED — Eric, 2026-08-03, and it reshaped the line itself** (built on
   branch `dock-dice-tray`). A tray line is **three spaces left to right,
   nothing said twice**: the **who as a chip** — your own portrait cropped to
   the face, or two letters ("Ha" for Harness) when there is none, and always
   two letters for the table since the wire carries no avatar; the full name
   and the time surface on hover (second fitting, same day — the first cut
   wrote the name in full and it cost the line its flanks), then **the dice,
   each with its full §2 wrapper** but a minimal label (no "· ready" suffix —
   the line's own heading says that — and allowed a second line instead of
   colliding sideways), then **the ruling on three tiers** — the roll's name
   in bold ("Arcana +7"), the total with NATURAL 20/1 beside it, and the
   ruling text, abridged when long (Chaos, a Destiny-point change…) with the
   full account on hover.
   **And the builder is not the tray**: a hand still being assembled — every
   die pending, nothing landed — renders in the Roll Builder's own dashed
   assembly frame in the roller, and only enters the tray when ROLL lands it.
   The tray shows rolls; the builder shows intentions.
   **Third fitting, same day (Eric):** the line reads **verdict-first** — the
   ruling tiers are superseded by two flanks: LEFT the chip and what Fate
   said (verdict, badges), RIGHT the roll's name in bold over its total
   ("Arcana +5 / 24"), account small underneath. Past **six** dice a hand is
   a **swarm**: bare mini dice (no source token, no label — colour will
   carry damage type later), wrapping into rows, 22px on the large line,
   16px below — a 28d6 reads as three rows. And the Roll Builder's frame is
   now the **permanent judgment window**: decisions (Natural 1, Arcane 1,
   A/D choice), the assembly, and the Ruling of the roll just landed all
   speak there, by that priority; the stacked announcement lines above it
   are gone — only the badge strip remains, and the Stream keeps the
   record. `state.events` persists (the newest entry still drives the
   window's mood streaks); it simply no longer renders as lines.
   Sizes are banded, not per-line-negotiated: the newest roll's dice land
   **large (44px ceiling)**, rolls 2–4 are **small (24px) but still able to
   roll** — simultaneous landings must be seen — and the **Static Area
   (rolls 5–10)** freezes everything as bitmap snapshots. **The tray holds
   TEN rolls** (supersedes the twenty in `UI-TERMINOLOGY.md`); beyond ten,
   the Stream keeps the record, or AboveVTT's own log does.
   Measured heights at the reference: large line 84px, small/static lines
   56px, zone `--cd-tray-h:284px` — deterministic, which is what lets the
   summoned group anchor to the tray's top edge.
   The §5 position question is settled the same day: **the Ruling moved off
   the frame's bottom edge and into the line of the roll it judges.**
   And the answer to "does the small version roll as nicely?" is yes,
   measured: the renderer's 32px internal floor means a 24px die is
   supersampled, and the tumble is resolution-independent. What does NOT
   survive small is a live WebGL context per die — the ~16-context browser
   cap — which is why the Static Area is snapshots
   (`FHStaticDice.resultImage`, the picker's own shared-generator pattern).
