# FHPC — what the structure drawing asks for that does not exist

Measured against `main` on 2026-08-01, after `UI-TERMINOLOGY.md` fixed the names.
This is a gap list, not a plan: two items need a ruling from Eric before anything
can be scheduled.

---

## Gaps — buildable once decided

**1. Info Panel — does not exist at all.** A new zone that explains whatever the
player selected in Actions, Spells or Traits. The panels do not currently announce
a selection to anything, so this needs a small addition to core
(`fh-player-sheet.js`): a selection event panels emit and the Info Panel listens
for. **Architect work, not a package chat** — it is core.

**2. Dice Tray is not its own zone.** It is fused into `roller` (`fh-cd-stage`).
Splitting it out brings three behaviours the drawing spells out and the code does
not have: a comfort minimum of **four rolls visible**, scrolling down to **twenty**,
and a **Static Area** below the first four where dice never animate.
*Half-good news:* the state already carries `trayTitle: "Dice Tray"` — the name was
already there, only the zone was not.

**3. Actions panel: one list → three columns.** Actions, Bonus Actions, Reactions,
with click-on-the-name rolling directly when nothing else is triggered, and opening
the Action Console when something is. This is a rebuild of the panel shipped on
2026-08-01, not a rename.

**4. Console is one screen, not a family.** Today: a single zone captioned
`ROLL CONSOLE`. The drawing wants **Skill Console**, **Action Console**,
**Spell Console** as named variants of the same zone, with room for more.

**5. Skills is a standing zone; the drawing demotes it to a belt panel.** Today
`data-zone="skills"` is permanent chrome. In the drawing, Skills is one belt panel
among the seven. That frees vertical space, which §B below says is the scarce
resource.

**6. Major Arcana card in the Dice Pool — unverified.** The drawing puts a Major
Arcana card at the right of the Dice Pool, opening the Info Panel on click. Arcana
logic exists in core, but whether that card is rendered in this zone was not
confirmed. Check before scheduling.

---

## A. Conflict — party rolls in the Dice Tray

The drawing says the Dice Tray shows **all the party rolls + DM**.

The code puts the party feed in the **Stream** zone, deliberately, and says why in
a comment above `streamZoneInner()`:

> the belt is everything inside the character, and the party is not inside the
> character — and a feed you have to navigate to defeats the point

Plan §11.4c ratified that: the party log is a zone toggle, not a belt tab, because
sharing the Stream's zone costs no vertical space, *"which the dock does not have
to spare"*.

So the drawing and a ratified decision disagree about where other people's rolls
appear. Both readings are defensible — the drawing's is arguably better for the
moment of play, since your own roll and the party's land in the same place instead
of one being a zone away. **This needs Eric's ruling, and it is not a small one:**
the Dice Tray becomes the shared surface, and the Stream's reason to exist shrinks
to history.

---

## B. Arithmetic — ten zones do not obviously fit

The dock is a quarter of the screen, with a hard floor of **620px tall** (§2).
Against that floor the drawing asks for:

- **five persistent zones** that can never be turned off — Character Info, Belt,
  Panel, Dice Pool, Dice Tray;
- **four of them marked fixed**, i.e. a height that never yields;
- plus comfort minimums on the scrollable ones — and the Dice Tray's is stated in
  content, **four rolls**, not in pixels, so it is not free to shrink either.

Adding the Info Panel and splitting out the Dice Tray both *add* height demand.
Nothing in the drawing gives any of it back except gap 5, demoting Skills.

**Before building any of this, the height budget should be written down**: measured
minimum for each zone at the 620px floor, summed, compared to 620. If the sum
exceeds the floor, the drawing is not implementable as drawn and something has to
become optional or collapsible — better to discover that on paper than three
packages in.

This is the same class of mistake as the belt measuring 1px: a layout that is
correct per zone and impossible in aggregate.
