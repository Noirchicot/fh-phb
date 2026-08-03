# FHPC — interface terminology

The naming authority for the dock. One name per thing, in prose, in code
identifiers, in CSS classes, in prompts to package chats, and in what Eric and the
architect say out loud.

Ratified 2026-08-01 from Eric's structure drawing (`FHPC structure.jpg`).
In English, like the rest of the repo's technical docs — the living guide stays
French because it is for reading, this is for naming.

**Why this exists:** three words already meant two things each. `builder` meant
both the character-creation tool and the zone that assembles a roll. `destiny` and
`dice pool` named the same zone from opposite ends. `actions` was a belt panel
*and* one column inside it. Each collision is one confused sentence away from
someone fixing the wrong file.

---

## The ten zones, top to bottom

| # | Name | `data-zone` | What it holds | Attributes |
|---|---|---|---|---|
| 1 | **Identity** | `identity` | Portrait, name, seal, ⋯ menu, window modes. **Never content.** | fixed |
| 2 | **Character Info** | `character-info` | Stats, saves, AC/HP, passives | persistent · fixed |
| 3 | **Belt** | `belt` | The tab strip that selects a panel | persistent · fixed |
| 4 | **Panel** | `panel` | Whatever the Belt selected: Skills, Traits, Actions, Spells, Gear, Craft, Notes | persistent · scrollable |
| 5 | **Info Panel** | `info-panel` | Explains the item the player pointed at in Actions, Spells or Traits | **summoned** · scrollable |
| 6 | **Dice Pool** | `dice-pool` | Destiny score and points, ordinary dice, Major Arcana card | persistent · fixed |
| 7 | **Console** | `console` | The active console: Skill, Action, Spell, … | **summoned** · fixed |
| 8 | **Roll Builder** | `roll-builder` | Assembles one roll: dice, modifiers, ROLL button | **summoned** · fixed |
| 9 | **Dice Tray** | `dice-tray` | Where dice land and results read out — **yours, the party's and the DM's, together** | persistent · scrollable |
| 10 | **Stream** | `stream` | Consultable history, and the debugging surface | optional · scrollable · **off by default** |

Zone names are **Title Case in prose**, `kebab-case` in `data-zone` and CSS.

---

## The five attributes

These come from Eric's drawing. They are not decoration — each one forbids
something specific.

**persistent** — always present. The user cannot turn it off. Five zones are
persistent: Character Info, Belt, Panel, Dice Pool, Dice Tray.

**summoned** — appears **in response to an interaction**, and leaves when it is
no longer relevant. It is not a preference and it gets **no toggle** anywhere in
the interface. Info Panel, Console, Roll Builder.

> The drawing writes OPTIONAL on all four non-persistent zones, but Eric's ruling
> of 2026-08-01 splits them: *"il est allumé ou éteint en fonction de l'utilité ou
> des actions de l'utilisateur"*. Only the Stream is a preference. Collapsing the
> two into one word is how a package chat ends up shipping a "Show Info Panel"
> checkbox that nobody asked for.

**optional** — a **preference**. The user turns it on or off and it stays that
way. **The Stream is the only optional zone, and it ships off.**

**fixed** — *this is what the drawing calls HARD.* Fixed height: the zone never
scrolls and never shifts. Its height is decided once and does not react to its
contents. Renamed because "hard" says how it feels, not what it does; a rule has
to say what it forbids.
> ⏳ **Provisional.** Eric: *"on va mesurer, on remettra peut-être certains FIXED
> en question."* Four fixed zones against a 620px floor may not fit — see
> `UI-GAP.md` §B. A zone losing `fixed` is expected, not a defeat.

**scrollable** — scrolls internally, and carries a **comfort minimum**: a
`min-height` floor low enough to fit a small window, high enough that the zone is
still usable at that floor. For the Dice Tray the floor is stated in rolls, not
pixels — **four rolls visible**.

> ⚠️ **fixed does not mean the floor rules of §3 stop applying.** A flex item whose
> `overflow` is not `visible` still gets an automatic minimum size of 0. `fixed`
> is a design promise about height; it is not a CSS property and it does not
> exempt anything from the belt-measured-1px trap.

---

## Names inside a zone

**Dice Pool** shows two families of dice and they must stay visually separate —
Eric's rule: *distinguish them with titles and dice colours.*
- **Destiny dice** — the Destiny subsystem's own dice, with its score and points.
- **Pool dice** — ordinary dice available to the character.

Never write "dice pool" for the dice stacked onto a roll in progress. Those are
**bonus dice**, they live in the Roll Builder, and the distinction is the whole
reason this zone was hard to name.

**Dice Tray** has a **Static Area**: everything below the first four rolls. Dice
never animate there. Rolls scroll into it and stop moving; ~~the tray holds
twenty~~ — **amended 2026-08-03 (Eric): the tray holds TEN.** Beyond ten the
record lives in the Stream, or on AboveVTT's own log. The first roll's dice are
large, rolls 2–4 small but still able to roll (simultaneous landings must be
seen); the Static Area's dice are bitmap snapshots of the same render — a
browser caps live WebGL contexts at ~16, so a zone holding six lines of dice
cannot hold six lines of contexts. Full line anatomy: end of
`UI-ROLL-VOCABULARY.md`.

**The Dice Tray is the shared surface** (Eric, 2026-08-02). Your roll, the party's
and the DM's land in the same place — you never navigate to see what someone else
rolled. This overrules plan §11.4c, which put the party log in the Stream's zone
on the argument that *the belt is what is inside the character, and the party is
not*. That argument held for the **belt**; it does not decide the tray, and the
moment of play wins: the point of a shared roll is that everyone sees it where
they are already looking.

**What is left of the Stream:** consultable history, and debugging. It is no
longer the party's live feed. The table also has AboveVTT's own stream, so a
second live feed inside the dock was solving a problem that was already solved
elsewhere. This is a demotion, and it is deliberate.

**Info Panel** is summoned by pointing at a thing, not by opening a screen. Hover
or right-click a spell, a feat, an action — the zone describes *that* thing.
Its purpose is subtractive: **it is what lets the Actions and Spells lists stay
short.** A list row carries a name and the few numbers you roll with; everything
else lives here, one gesture away. Any proposal to "just add the description to
the row" is a proposal to delete this zone, and should be refused as such.

### The summoning gestures (Eric, 2026-08-02)

**Pointer — this is what gets built.**

| Gesture on a stat, action, spell or feat | Result |
|---|---|
| Left click / press | **Rolls it** |
| Right click, or hover | Opens the **Info Panel** on that thing |
| Middle click (wheel) | Opens the **Info Panel and the Console** |

Long-press was considered and rejected: *"c'est pas toujours facile à faire."*

**Touch — deferred, deliberately.** The intent is: press to roll, and one gesture
that brings up Info Panel + Console + Dice Tray **with every persistent zone
hidden** — there is not enough room, so it is a different logic, not a narrower
version of the same one.

> ⚠️ **There is no middle click on a touchscreen**, so the gesture above has no
> touch equivalent yet. That is a known hole, not an oversight: Eric's ruling is
> that **the mobile interface is a separate project, designed later**. Build the
> pointer behaviour now, apply whatever seems reasonable on touch, and expect to
> redo it. **iPad is allowed to live outside the mobile format** — it has the room
> that a phone does not, and inheriting the phone's compromises there would be a
> mistake.

**Panel** hosts the seven belt panels. **Actions** is a panel name *and* a column
inside that panel — inside the Actions panel, the three columns are **Actions**,
**Bonus Actions** and **Reactions**, collectively the **action columns**. Say "the
Actions panel" for the panel and "the Actions column" for the column; never
"actions" bare.

**Console** is a family, not one screen: **Skill Console**, **Action Console**,
**Spell Console**. The zone is `console`; which console is showing is state.

---

## Migration from today's names

The code does not use these names yet. Nothing here is a rename request on its
own — each row lands with the work that touches that zone.

| Today | Becomes | Note |
|---|---|---|
| `data-zone="header"` | `identity` | The §2 rule is unchanged: identity and window chrome only, never content |
| `data-zone="vitals"` | `character-info` | |
| `data-zone="destiny"` | `dice-pool` | The zone keeps holding Destiny — Destiny is now the name of the *dice family*, not the zone |
| `data-zone="roller"` (a `fh-cd-stage`) | `roll-builder` | Splits: the tray part becomes its own zone |
| — | `dice-tray` | **New zone.** Currently fused into the roller |
| — | `info-panel` | **New zone.** Does not exist |
| `data-zone="skills"` | folds into `panel` | Skills becomes a belt panel like the other six, not a standing zone |
| `data-zone="console"` | `console` | Unchanged. Drop the "ROLL CONSOLE" caption in favour of the active console's own name |
| `data-zone="stream"` | `stream` | Unchanged |

**`Builder` alone is banned.** It means the **Skill Builder**, the
character-creation tool (`docs/skill-builder.html`, `docs/builder.md`, its own
Worker routes and logbook entry). The roll-assembly zone is always **Roll
Builder**, both words, every time.

---

## Known gap, not a naming question

The Actions panel shipped 2026-08-01 is a **single** manual list. The drawing asks
for **three** columns with click-to-roll on the name — one click rolls when nothing
else is triggered, and opens the Action Console when something is. That is a change
to the panel, not a rename, and it is not covered by this document.
