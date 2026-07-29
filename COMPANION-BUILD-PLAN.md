# Player Companion — build plan (belt, tarot, AboveVTT)

Working document for a multi-chat build. Any chat should be able to start from
this file alone, without the conversation that produced it.

> **Taking over the architect thread?** Read **`ARCHITECT-HANDOFF.md`** first — the
> standing rules, the traps already paid for, and how the package chats are run.
> This file is the plan; that one is the job.

**Repo:** `~/tools/fh-phb` · branch `main` · deploy `./.venv/bin/mkdocs gh-deploy --force`
**Tests:** `for t in tests/*.test.js; do node "$t"; done` — all six must stay green.
**Harness:** `tools/dock-harness.html`, copied to `site/` and served on port 8125
(`.claude/launch.json` entry `fh-site-b`). Offline, stubbed Worker, no campaign code
needed. Add `?keep` to reload **without** wiping the panel stores.

**Sizing (fixed 2026-07-28).** Width follows the text, not the monitor:
`max(360px, min(400px × scale, 100vw))`. Scale steps are **1.15 / 1.3 / 1.45**, so
the dock is **460 / 520 / 580px** — identical on every display. The old `25vw`
meant a 2560px screen got 640px and the text control moved nothing. Two floors
keep it from ever folding: **360px wide**, **520px tall** (`--cd-floor`,
`--cd-floor-h`); past either, the shell scrolls instead of the zones collapsing.
Narrow screens also **cap the scale** (`--cd-fs` derives from `--cd-fs-pref` so a
media query can clamp it) — pinning width while type keeps growing is how it breaks.

> ⚠️ **`flex:none` on dock chrome is load-bearing.** A flex item whose `overflow`
> is not `visible` gets an automatic minimum size of **0**, not `min-content`. The
> belt got `overflow-x:auto` for sideways scrolling and thereby became able to
> shrink to nothing — measured **1px** tall in a 600px Table-mode window, which is
> how it vanished while its neighbours looked fine. Same trap one level down on the
> skills scroller. If you add a scrollable strip to the dock, give it `flex:none`
> or a real `min-height`, and floor the **zone**, never the scroller inside it —
> a scroller taller than its box overflows onto the row below.

---

## 1. The constraint that shapes everything

| File | Size | Contents |
|---|---|---|
| `docs/javascripts/fh-player-sheet.js` | 2 633 lines / 228 KB | state, persistence, DDB sync, roll engine, destiny, chaos, arcana, tray, console, event stream, every panel, every click handler — one IIFE |
| `docs/stylesheets/companion-dock.css` | 754 lines / 64 KB | the whole dock |

Every item on the roadmap wanted to edit **both of these**. Two chats in parallel
meant two chats rewriting the same 2 633-line closure: constant conflicts, and each
chat burning its context window re-reading the monolith before it could touch
anything.

**This is solved as of `73dedba`** — the belt was the seam, and a panel is now its
own file behind a small contract (§2). Core is still one big file, deliberately
(§5, package 1). A panel chat does not open it.

---

## 2. Target architecture

The belt sits **between the passives row and the skills zone**. Vitals + passives
stay pinned above it (always visible); the belt switches everything below.

```
┌─ header (portrait, menu, window mode) ──────────┐   core
├─ vitals · PB/AC/HP/EXH · passives ──────────────┤   core, always visible
├─ BELT: Skills│Traits│Actions│Spells│Gear│Craft│Notes   core, active tab lit
├─ … active panel body … ─────────────────────────┤   panel module
├─ destiny · console · tray · stage ──────────────┤   core, shown when panel asks
└─ stream ────────────────────────────────────────┘   core
```

Destiny / console / tray is **shared** — Skills and Actions both use it. It must
live in core and be declared by the panel (`showsRoller: true`), not copied twice.

### Files as they actually are

| File | Owner | Contents |
|---|---|---|
| `fh-player-sheet.js` | **architect only** | state, persistence, DDB sync, roll engine, destiny, chaos, arcana, tray/console/stage, stream, belt shell, panel registry — **and** the Skills panel, registered through the same contract as everything else |
| `fh-panel-traits.js` | chat | abilities, traits, feats — **a good tracker** is the point |
| `fh-panel-actions.js` | chat | Action / Bonus Action / Reaction, clickable rolls |
| `fh-panel-spells.js` | chat | spell list, slots, clickable casts |
| `fh-panel-gear.js` | chat | carried gear + party stash; surface the existing inventory pop |
| `fh-panel-craft.js` | chat | Soulforging: the Loop **and** the Forge, one tab |
| `fh-panel-notes.js` | chat | notes |

All five panel files exist already, as registering stubs. CSS stays in one
`companion-dock.css`; each panel appends its own block at the end.

### The contract (architect writes and freezes this first)

**As shipped** (`73dedba`) — this is the real API, not a sketch. A panel pushes
itself onto `window.FH.panels` from its own file; there is no registration
function to import and load order does not matter, because core reads the list
at render time:

```js
(function () {
  "use strict";
  (window.FH = window.FH || {}).panels = window.FH.panels || [];
  window.FH.panels.push({
    id: "features",              // belt tab, and the key for this panel's store
    label: "Features",
    tint: "#4a7a3a",             // the tab's colour when lit
    order: 20,                   // belt position
    showsRoller: false,          // true → core draws Destiny + Console + Tray below
    render: function (ctx) { return html; },
    // Event hooks, all optional, all scoped to this panel's own body.
    // Return true when handled; falsy lets core have the event.
    onClick: function (event, ctx) { return handled; },  // incl. non-buttons
    onChange: function (event, ctx) { return handled; },
    onInput: function (event, ctx) { return handled; },  // autosave while typing
    onBlur: function (event, ctx) { return handled; }    // delegated focusout
  });
})();
```

`ctx` is the whole surface a panel may touch:

| | |
|---|---|
| `ctx.character` | effective character (DDB + manual overrides) |
| `ctx.destiny` · `ctx.profile` | score/points/pool, and the saved profile |
| `ctx.esc` · `ctx.icon` · `ctx.signed` · `ctx.mod` | the same helpers core uses |
| `ctx.roll(name, ability, bonus, note)` | immediate flat d20 |
| `ctx.openConsole(name, ability, bonus, note, dc)` | the advanced console |
| `ctx.note(text, kind)` | write a line into the event stream |
| `ctx.store(id)` | the panel's own persisted object, saved with the play state |
| `ctx.save()` · `ctx.refresh()` | persist · re-render |

That is about forty lines instead of 2 633. `render` returning a string keeps a
panel from ever holding DOM across a re-render, and a panel that throws is caught
and reported in its own body rather than taking the dock down with it.

**Testing persistence:** the harness wipes the saved store on every load so each
run starts clean. Load `/dock-harness.html?keep` to reload *without* the wipe.

**Widened after package 8 (Notes).** Notes went first to find exactly this sort of
thing, and found two gaps, both now closed:
- the contract delegated `click` only, so a panel could not autosave on typing or
  on leaving a field — `onChange` / `onInput` / `onBlur` now delegate too;
- the harness wiped every panel's store on load, making "survives a reload"
  untestable without commenting out a line — hence `?keep`.
A third, found reviewing the same merge: panel clicks were delegated *inside*
`handleClick`, which bails on anything that is not a `<button>` — so a clickable
row or a tracker pip would have silently done nothing. Delegation now runs before
that guard.

---

## 3. What is already built (do not rebuild)

Checked in the source, not assumed:

- **Major Arcana awakening is done** (`drawArcana` / `keepArcana`, commit `4c69290`).
  It already grants **+1 permanent Destiny Score and +10 temporary Points either
  way**, then offers **keep vs. switch**, and writes the switch through to the
  profile. This matches `docs/chapters/fates-hand-mechanic.md` §5. It needs the
  card *visuals*, not the rule.
- `window.FH_ARCANA` holds the **22 Major** cards with numeral / meaning / impact /
  power / vibration.
- The arcana already renders at the **right of the Destiny row** (`.fh-cd-arcana`),
  and animates when an Awakening is owed.
- Text-size control (`--cd-fs`, 1 / 1.15 / 1.3) shipped — the dock's width scales with it.

## 4. What is missing

- **Minor Arcana do not exist.** The deck is 22 cards. The rules call for a full
  78-card tarot: a Minor draw grants temporary Destiny Points **and a Brick** —
  a shard of malleable reality shaped **once**, through a story or song the player
  composes, with the drawn Arcana setting the theme. Shaping it seeds a pocket of
  **White Void** (barrier → displacement → recomposition → fusion). Rules live in
  `docs/chapters/primordial-forces.md` §Part 1 and `fates-hand-mechanic.md` §5.
  **The Brick needs a rules decision before it can be coded** — see §6.
- **No card imagery, no flip.** Target behaviour (ref: randomtarotcard.com): on
  draw, the tray grows, one card is dealt **face down**, clicking it flips it over.
- **Features / Actions / Spells / Notes panels are stubs** — the tabs and files
  exist and register correctly; the bodies say "Not built yet".
- **No AboveVTT link.**

---

## 5. Work packages

Ordered. Package 1 gates everything else; after it, 3–7 are genuinely parallel
because they touch disjoint files.

| # | Package | Model · effort | Files | Depends on |
|---|---|---|---|---|
| 1 | ~~**The split + belt shell.**~~ **DONE — commit `73dedba`.** Belt shipped with all six tabs, colour-coded, active tab lit; panel registry + `ctx` contract frozen; five stub panel files created. **Deviation, on purpose:** core was *not* physically carved into `fh-companion-core.js`. The tests instrument `fh-player-sheet.js` by name, and splitting a 2 633-line closure across script tags is real regression risk on a working roll engine for no extra parallelism — panels being separate files is what unlocks the chats, and that is done. Skills still renders from core, registered through the same contract as everything else. Carve core later, or never. | Opus · high | + 5 panel files | — |
| 2 | **Tarot visuals.** 78-card deck data, face-down deal, click-to-flip, tray grows during a draw. Major keep/switch UI reskinned onto the card. | Sonnet · high | `fh-panel-*`? no — core (arcana) + new `companion-tarot.css` | 1 |
| 3 | **Minor Arcana + Brick.** Deck extension + the Brick as a tracked, once-shapeable resource. | Sonnet · medium | core (arcana) | 2, and §6 |
| 4 | ~~**AboveVTT bridge (per player).**~~ **SUPERSEDED by §11** — redesigned as a DM-side consumer of the campaign feed. Research complete, see §10. | — | — | 11 |
| 11 | ~~**Shared campaign feed.**~~ **DONE.** Worker `feed:{CODE}:{seq}` + `GET/POST/DELETE /feed/:code`, Companion posts on settle, party log live in the stream zone. **Deviations, both on purpose:** no cursor key (§11.4), and the party log is a **zone toggle, not a belt tab** (§11.4c). | Opus · high | Worker + core + CSS + harness | 1 |
| 12 | **DM bridge (log-only).** One extension on the DM's machine, reads the feed, posts formatted lines into AboveVTT. Degrades by printing what it cannot drive. | Sonnet · high | new repo | 11 |
| 10 | **Dice lab.** Prototype face-cycling, in-slot 3D tumble, materials, landing weight — side by side, no dock changes. | Sonnet · high | `tools/dice-lab.html` | — |
| 5 | **Features panel** — abilities, traits, feats, with a real per-rest/per-day tracker. | Sonnet · high | `fh-panel-features.js` | 1 |
| 6 | **Actions panel** — Action / BA / Reaction, clickable rolls, `showsRoller: true`. | Sonnet · high | `fh-panel-actions.js` | 1 |
| 7 | **Spells panel** — list, slots, clickable casts. | Sonnet · high | `fh-panel-spells.js` | 1 |
| 8 | **Notes panel.** | Sonnet · medium | `fh-panel-notes.js` | 1 |
| 9 | **Bug hunt.** Adversarial pass over the roll engine and destiny/chaos/awakening state machine. | Opus · high | tests/ | after a few land |

Inventory already has a working pop and a party-inventory tool; package 1 wires it
to a belt tab rather than rebuilding it.

---

## 6. Open questions

1. ~~**The Brick.**~~ **ANSWERED 2026-07-28 — and the answer changes what package 3
   builds.** A Brick is **not a mechanic**. It is a roleplay opportunity: the chance
   to dream something into reality. No objective, no statistics, no cost. Full rule
   in the vault at `0. D&D 5+ Rules/3. Arcane Destinies/D&D 5+ Fate's Hand Mechanic.md`
   §5.1, and live at `/chapters/fates-hand-mechanic/`.
   **What this means for the dock:** a Brick is a **tracked token with a story
   attached**, nothing more. The Companion should record that one was granted, which
   Minor Arcana themed it, and hold the player's written story — then get out of the
   way. Do **not** build resolution mechanics, costs, or a "spend" action; there are
   none, and inventing them would contradict the rule. The tattoos and the call of
   the White Void are the GM's and the player's business, not the dock's.
2. ~~**Minor Arcana temporary Points.**~~ **ANSWERED:** temporary Destiny Points
   **equal to the card's value** — numbered cards give their number (Ace = 1),
   **heads (Page, Knight, Queen, King) give 10**.
3. ~~**Card art.**~~ **Decided:** Rider–Waite–Smith placeholder first, then a custom
   deck from the **Saints d'AvA** (the 22 Majors, one saint per numeral) — vault
   `2. World/Cosmologie/Panthéons/Saints d'AVA/`. Design work lives in the vault at
   `Gpt in FH/Tarot Design/`, **not** in this repo.

   > ⚠️ **State the `{NUMERAL}.jpg` convention in the art brief BEFORE the deck is
   > generated.** Art falls back to the numeral when an image 404s, which is good for
   > a missing card and bad for a mis-named delivery — 22 wrongly-named files render
   > as 22 gold numerals on brown and break nothing visibly. Filenames are `0.jpg`,
   > `I.jpg` … `XXI.jpg` (Roman, uppercase, matching `card.numeral` in `arcana.js`),
   > so the brief must carry the **numeral**, not the saint's name.

---

## 7. How the chats run

- **One architect chat (Opus)** owns this file, the contract and package 1, and
  reviews what lands. It does not build panels.
- **One chat per package**, started cold from a transition prompt naming: the
  package, its files, the contract, and its done-when. No chat needs another
  chat's history.
- **One worktree per package**, all branched off `73dedba` (the belt), so every
  chat starts with the contract already in place and none can break another's
  checkout:

  | Worktree | Branch | Package |
  |---|---|---|
  | `~/tools/fh-worktrees/tarot` | `pkg2-tarot` | 2 — tarot visuals (+3, Minor/Brick) |
  | `~/tools/fh-worktrees/abovevtt` | `pkg4-abovevtt` | 4 — AboveVTT bridge |
  | `~/tools/fh-worktrees/features` | `pkg5-features` | 5 — Features panel |
  | `~/tools/fh-worktrees/actions` | `pkg6-actions` | 6 — Actions panel |
  | `~/tools/fh-worktrees/spells` | `pkg7-spells` | 7 — Spells panel |
  | `~/tools/fh-worktrees/notes` | `pkg8-notes` | 8 — Notes panel |

- **Per-worktree setup.** `site/` and `.venv/` are gitignored, so a fresh worktree
  has neither. To use the harness there:
  ```bash
  python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
  ./.venv/bin/mkdocs build && cp tools/dock-harness.html site/
  ```
  Then `preview_start` on the `fh-site-b` entry in `.claude/launch.json` and open
  `/dock-harness.html`. Tests need only `node`, no setup.
- **Merging.** Panel packages touch one new file each and cannot conflict; merge
  them to `main` in any order. Package 2 (tarot) and 4 (AboveVTT) *do* touch core,
  so they merge one at a time and rebase on `main` first.
- **Every chat runs the six test suites before committing** (`for t in tests/*.test.js;
  do node "$t"; done`) and verifies visually in the harness.
- **Every chat updates this file** when it changes the contract or closes a question.

---
## 8. Starter prompts

One per chat. Each is self-contained -- no chat needs another's history. Every
worktree already has its harness built and its own port, so there is no setup step.

| Worktree | Branch | Port | Model · effort |
|---|---|---|---|
| `notes` | `pkg8-notes` | 8130 | Sonnet · medium |
| `tarot` | `pkg2-tarot` | 8131 | Sonnet · high |
| `features` | `pkg5-features` | 8132 | Sonnet · high |
| `actions` | `pkg6-actions` | 8133 | Sonnet · high |
| `spells` | `pkg7-spells` | 8134 | Sonnet · high |
| `abovevtt` | `pkg4-abovevtt` | 8135 | Sonnet · high |

**Start Notes and Tarot first.** Notes is the cheap proof that the contract
holds; Tarot is unblocked and is the one worth looking at. Features / Actions /
Spells fan out after Notes reports back.

---

**Package 8 · Notes** — worktree `~/tools/fh-worktrees/notes`, branch `pkg8-notes`, port 8130

```
Work in ~/tools/fh-worktrees/notes (branch pkg8-notes).

Build the Notes panel by filling in docs/javascripts/fh-panel-notes.js.

Notes = somewhere to write things down at the table. Keep it simple: a
textarea (or a short list of entries), persisted through ctx.store("notes")
and ctx.save(), surviving a reload.

YOU ARE GOING FIRST ON PURPOSE. Notes is the only package that exercises the
two halves of the contract that have never been run: ctx.store/ctx.save
persistence, and onClick delegation from a panel's own body. If either is
broken or awkward, you are the one who finds it -- report it plainly rather
than working around it in silence.

Read COMPANION-BUILD-PLAN.md first. The full ctx contract is documented at the
top of docs/javascripts/fh-panel-features.js -- you should not need to open
fh-player-sheet.js at all, and you MUST NOT edit it: core is the architect
chat's file and another chat may be changing it right now.

Style must match the dock. Add your panel's CSS at the END of
docs/stylesheets/companion-dock.css. Every font-size goes through
calc(Npx * var(--cd-fs)) -- the dock has a user text-size control and a
hardcoded px will not scale with it.

The harness is already built and your worktree has its own port, so just
preview_start the fh-site-b entry in .claude/launch.json and open
/dock-harness.html. Do not commit .claude/launch.json (it is skip-worktree'd).

Tests: for t in tests/*.test.js; do node "$t"; done -- all six must pass.

COMMIT YOUR WORK on your branch before reporting back. Both of the first two
packages reported "done" with everything still uncommitted in the working tree,
one stray git command away from being lost. Reporting is not delivering.

Done when: the Notes tab works, all six test suites pass, and it looks right in
the harness. Then report back what you built and whether the ctx contract gave
you everything you needed -- if you had to work around it, say so.
```

---

**Package 5 · Features** — worktree `~/tools/fh-worktrees/features`, branch `pkg5-features`, port 8132

```
Work in ~/tools/fh-worktrees/features (branch pkg5-features).

Build the Features panel by filling in docs/javascripts/fh-panel-features.js.

Features = abilities, traits and feats. The POINT of this panel is a real
tracker for everything that recharges: per short rest, per long rest, per day,
N uses. A player should be able to see at a glance what they have left and
spend one with a click.

FIRST, find out what data you actually have: log ctx.character in the harness
and look. The build payload is an FH level-1 builder record plus DDB sync, and
it may well NOT carry feats, traits or class features. If it does not, say so and build a
manual-entry version rather than inventing a data source -- then note the gap
in COMPANION-BUILD-PLAN.md so the architect chat can decide where the data
comes from. Do not fake it.

Read COMPANION-BUILD-PLAN.md first. The full ctx contract is documented at the
top of docs/javascripts/fh-panel-features.js -- you should not need to open
fh-player-sheet.js at all, and you MUST NOT edit it: core is the architect
chat's file and another chat may be changing it right now.

Style must match the dock. Add your panel's CSS at the END of
docs/stylesheets/companion-dock.css. Every font-size goes through
calc(Npx * var(--cd-fs)) -- the dock has a user text-size control and a
hardcoded px will not scale with it.

The harness is already built and your worktree has its own port, so just
preview_start the fh-site-b entry in .claude/launch.json and open
/dock-harness.html. Do not commit .claude/launch.json (it is skip-worktree'd).

Tests: for t in tests/*.test.js; do node "$t"; done -- all six must pass.

COMMIT YOUR WORK on your branch before reporting back. Both of the first two
packages reported "done" with everything still uncommitted in the working tree,
one stray git command away from being lost. Reporting is not delivering.

Done when: the Features tab works, all six test suites pass, and it looks right in
the harness. Then report back what you built and whether the ctx contract gave
you everything you needed -- if you had to work around it, say so.
```

---

**Package 6 · Actions** — worktree `~/tools/fh-worktrees/actions`, branch `pkg6-actions`, port 8133

```
Work in ~/tools/fh-worktrees/actions (branch pkg6-actions).

Build the Actions panel by filling in docs/javascripts/fh-panel-actions.js.

Actions = what you can do on your turn, split Action / Bonus Action /
Reaction, each one a clickable roll (ctx.roll for a flat d20, ctx.openConsole
for the advanced console). This panel already declares showsRoller: true, so
core draws Destiny + Console + Tray underneath it exactly as under Skills --
do not build your own roller.

FIRST, find out what data you actually have: log ctx.character in the harness
and look. The build payload is an FH level-1 builder record plus DDB sync, and
it may well NOT carry attacks, actions or class actions. If it does not, say so and build a
manual-entry version rather than inventing a data source -- then note the gap
in COMPANION-BUILD-PLAN.md so the architect chat can decide where the data
comes from. Do not fake it.

Read COMPANION-BUILD-PLAN.md first. The full ctx contract is documented at the
top of docs/javascripts/fh-panel-features.js -- you should not need to open
fh-player-sheet.js at all, and you MUST NOT edit it: core is the architect
chat's file and another chat may be changing it right now.

Style must match the dock. Add your panel's CSS at the END of
docs/stylesheets/companion-dock.css. Every font-size goes through
calc(Npx * var(--cd-fs)) -- the dock has a user text-size control and a
hardcoded px will not scale with it.

The harness is already built and your worktree has its own port, so just
preview_start the fh-site-b entry in .claude/launch.json and open
/dock-harness.html. Do not commit .claude/launch.json (it is skip-worktree'd).

Tests: for t in tests/*.test.js; do node "$t"; done -- all six must pass.

COMMIT YOUR WORK on your branch before reporting back. Both of the first two
packages reported "done" with everything still uncommitted in the working tree,
one stray git command away from being lost. Reporting is not delivering.

Done when: the Actions tab works, all six test suites pass, and it looks right in
the harness. Then report back what you built and whether the ctx contract gave
you everything you needed -- if you had to work around it, say so.
```

---

**Package 7 · Spells** — worktree `~/tools/fh-worktrees/spells`, branch `pkg7-spells`, port 8134

```
Work in ~/tools/fh-worktrees/spells (branch pkg7-spells).

Build the Spells panel by filling in docs/javascripts/fh-panel-spells.js.

Spells = the spell list: what is prepared, how many slots remain per level,
and casting from the panel. showsRoller is already true, so attack rolls and
saves go through the shared roller -- do not build your own.

FIRST, find out what data you actually have: log ctx.character in the harness
and look. The build payload is an FH level-1 builder record plus DDB sync, and
it may well NOT carry a spell list or slots. If it does not, say so and build a
manual-entry version rather than inventing a data source -- then note the gap
in COMPANION-BUILD-PLAN.md so the architect chat can decide where the data
comes from. Do not fake it.

Read COMPANION-BUILD-PLAN.md first. The full ctx contract is documented at the
top of docs/javascripts/fh-panel-features.js -- you should not need to open
fh-player-sheet.js at all, and you MUST NOT edit it: core is the architect
chat's file and another chat may be changing it right now.

Style must match the dock. Add your panel's CSS at the END of
docs/stylesheets/companion-dock.css. Every font-size goes through
calc(Npx * var(--cd-fs)) -- the dock has a user text-size control and a
hardcoded px will not scale with it.

The harness is already built and your worktree has its own port, so just
preview_start the fh-site-b entry in .claude/launch.json and open
/dock-harness.html. Do not commit .claude/launch.json (it is skip-worktree'd).

Tests: for t in tests/*.test.js; do node "$t"; done -- all six must pass.

COMMIT YOUR WORK on your branch before reporting back. Both of the first two
packages reported "done" with everything still uncommitted in the working tree,
one stray git command away from being lost. Reporting is not delivering.

Done when: the Spells tab works, all six test suites pass, and it looks right in
the harness. Then report back what you built and whether the ctx contract gave
you everything you needed -- if you had to work around it, say so.
```

---

**Package 2 · Tarot visuals** — worktree `~/tools/fh-worktrees/tarot`, branch `pkg2-tarot`, port 8131

```
Work in ~/tools/fh-worktrees/tarot (branch pkg2-tarot).

READ COMPANION-BUILD-PLAN.md SECTIONS 3, 4 AND 6 BEFORE WRITING ANY CODE.

The Major Arcana awakening is ALREADY BUILT and works: drawArcana/keepArcana in
docs/javascripts/fh-player-sheet.js already grant +1 permanent Destiny Score and
+10 temporary Points either way, then offer keep-vs-switch, and write the switch
through to the profile. DO NOT REBUILD THE RULE. You are building the card.

What to build:
- On an Awakening draw, the tray GROWS and deals one card FACE DOWN.
- Clicking the card flips it over (reference: randomtarotcard.com).
- The existing keep-vs-switch choice then reads off the revealed card.
- Art: Rider-Waite-Smith (1909, public domain) as a PLACEHOLDER deck.

CRITICAL: key every card by its NUMERAL (0, I, II ... XXI), never by filename.
A custom Fate's Hand deck -- the Saints d'AvA, who are already the 22 Majors --
replaces these faces later and must drop into the same slots untouched.

Unlike the panel packages, this one DOES touch core (fh-player-sheet.js), so:
rebase on main before you merge, and keep your diff to the arcana/tray area.
Put card CSS in a new docs/stylesheets/companion-tarot.css and add it to
mkdocs.yml + tools/dock-harness.html.

The harness is already built and this worktree runs on port 8131: preview_start
the fh-site-b entry in .claude/launch.json and open /dock-harness.html. Do not
commit .claude/launch.json (skip-worktree'd). To force an Awakening for testing,
drive the state directly in the console rather than rolling until one happens.

Tests: for t in tests/*.test.js; do node "$t"; done -- all six must pass.

COMMIT YOUR WORK on your branch before reporting back. Both of the first two
packages reported "done" with everything still uncommitted in the working tree,
one stray git command away from being lost. Reporting is not delivering.

Done when: an Awakening deals a face-down card that flips to a real RWS face,
keep-vs-switch still works, all six suites pass. Report back with a screenshot.

DO NOT build Minor Arcana or the Brick -- that is package 3 and it is BLOCKED on
a rules decision from Eric (see plan section 6).
```

---

**Package 4 · AboveVTT bridge** — worktree `~/tools/fh-worktrees/abovevtt`, branch `pkg4-abovevtt`, port 8135

```
Work in ~/tools/fh-worktrees/abovevtt (branch pkg4-abovevtt).

RESEARCH FIRST, BUILD SECOND. Do not write feature code until the research
question is answered in writing.

The question: how does AboveVTT accept a roll produced outside it? postMessage?
a custom DOM event? its chat input? a websocket? something else? AboveVTT is a
browser extension layered over D&D Beyond, so the answer may be "there is no
clean external hook" -- that is a legitimate finding and worth knowing BEFORE a
session is spent on it, not during.

Sources: the AboveVTT source/docs, and Eric's prior work at
~/obsidian-vault/7.CLAUDE AND ERIC LOGBOOK/D&D — Tech & Outils/AboveVTT Statblocks.md

Write what you find into COMPANION-BUILD-PLAN.md and STOP THERE if the answer is
that no supported hook exists -- report back before building anything.

If a hook does exist: send the Companion's resolved rolls into AboveVTT from a
NEW file docs/javascripts/fh-abovevtt.js. It should subscribe to rolls rather
than have core call it, so core stays unaware of it. Read the ctx contract at the
top of docs/javascripts/fh-panel-features.js; if you need core to expose a roll
hook it does not have, propose the smallest possible addition and flag it -- do
not restructure fh-player-sheet.js.

Harness: this worktree runs on port 8135. Tests: for t in tests/*.test.js; do
node "$t"; done -- all six must pass.

Done when: either a roll in the Companion appears in AboveVTT, or the plan
records exactly why it cannot. Both are a successful outcome for this package.
```

---

**Package 12 · DM bridge (log-only)** — a NEW repo, not a worktree of this one

```
Build the Fate's Hand DM bridge: a Chrome extension that reads a campaign feed
and writes the rolls into AboveVTT's game log. It runs on the DM's machine only.
Players install nothing.

READ COMPANION-BUILD-PLAN.md SECTIONS 10 AND 11 BEFORE WRITING ANY CODE. They
are in ~/tools/fh-phb. Section 10 is verified research into what AboveVTT will
and will not accept; section 11 is the feed you are consuming, and its contract
is frozen -- you are a reader of it, you do not change it.

The feed, in one paragraph. GET https://fh-builds.noirchicot.workers.dev/feed/FH1
returns {schemaVersion, lookbackMs, cursor, events[]}. Poll it every 2-3s passing
?since=<the cursor you last got>. Each event is fh-event/1 and carries TWO
layers: `display` (an fh-roll/1 view model -- display STRINGS, do not try to
parse them) and `intent` (the semantic layer -- act on this). Today only
intent.kind === "check" is ever produced; "damage" and "spell" shapes are frozen
in 11.3 and will start arriving when the Actions and Spells panels land, so
handle an unknown kind by printing it rather than crashing.

THREE RULES YOU MUST NOT BREAK, all three already paid for:

1. DEDUPE BY event.id. The poll deliberately re-reads a few seconds every time
   (edge clocks disagree; see 11.4), so you WILL see events you have already
   seen. A bridge that does not dedupe will post every line twice and, later,
   apply every point of damage twice.
2. A revision is not a new roll. Events carry rollId + rev; an open roll that
   gains a bonus die reappends with the same rollId and a higher rev. Key on
   rollId, keep the highest rev, and EDIT or supersede the line you already
   posted rather than adding a second one.
3. NEVER FALL BACK SILENTLY. If you cannot reach AboveVTT, say so visibly. A DM
   believing the table saw a roll it never saw is the one failure that matters.

Graceful degradation is the whole design (11.3): translate what you can, PRINT
what you cannot. Log-only is a complete, shippable outcome for this package --
do not attempt damage application or AoE in this pass.

Testing needs Eric at the keyboard with a live campaign and AboveVTT running,
so build against the feed first (it works standalone, and you can post fake
events to it with curl), and only then ask for a live session.

Done when: a roll made in the Companion appears as a formatted line in the
AboveVTT game log on the DM's machine, exactly once, and a revised roll does not
produce a second line.
```

---

## 9. The belt, settled (2026-07-28)

**Skills · Traits · Actions · Spells · Gear · Craft · Notes.**

- `Features` became **Traits** — nine characters truncated on a 460px belt.
- Inventory became **Gear**, and **Craft** is its own tab, not folded into Gear:
  they have different rhythms (gear is an at-table lookup, the Forge is downtime
  work), so sharing a tab would have made the frequent thing slower to reach.
- The **Soulforging Loop is inside Craft**, not beside it — it is the Forge's prep
  checklist, not a peer of it. Three header buttons became one tab.
- The header is now **identity and window chrome only**: portrait, name, seal, ⋯,
  window modes. All content navigation belongs to the belt; the ⋯ menu keeps what
  leaves the dock (Sync, Edit, Level Up, Change character, the ↗ tools).
- The Gear and Craft **stubs open the existing pops**, so nothing that worked
  before the header cleanup is out of reach while those panels are unbuilt.
- On phones (≤520px) the belt **wraps to two rows** rather than scrolling
  sideways — a belt that can hide the lit tab defeats its own purpose.

---

## 10. AboveVTT — verified findings (2026-07-28)

Full study in the vault: `Gpt in FH/FHPC × AboveVTT.md`. It is accurate — its
source references were checked against ours and match exactly (`quickRoll` at
`fh-player-sheet.js:1117`, `rollDie(20)` at 1119, `rollExport` → `fh-roll/1` at
2038, and zero transport code anywhere). **Read it before starting package 4.**
What follows is only what was independently verified, plus what the study did not
settle.

### A browser extension is unavoidable

AboveVTT 1.58's manifest injects into exactly:

```
https://www.dndbeyond.com/campaigns/*
https://www.dndbeyond.com/characters*
host_permissions: *://*.dndbeyond.com/*
```

The Companion is served from `github.io`. `BroadcastChannel` is same-origin, and
there is no public AboveVTT API. **Every** integration — even one that only writes
a line into the game log — has to cross that origin boundary, so the extension is
forced, not chosen. Do not look for a way around it, and specifically do not try
to reach D&D Beyond/AboveVTT WebSockets from a Worker: that needs session secrets
and is the wrong shape.

### You cannot push a roll FHPC already made

Checked in `DiceRoller.js`:

```
roll(diceRoll, multiroll = false, critRange = 20, critType = 2,
     spellSave, damageType, forceCritType)
```

There is **no forced-result path** — no `setResult`, no way to render dice from
caller-supplied values. It generates its own randomness through `rpgDiceRoller`.

And the 3D dice everyone likes are **D&D Beyond's, not AboveVTT's**: with
`ddb3dDiceShareToggle` on, AboveVTT delegates by clicking DDB's own dice UI. Its
native path is chat-log text.

**Consequence, and it decides the architecture:** "FHPC rolls and pushes the
result" and "the table sees the nice dice" are mutually exclusive. If FHPC rolls,
Above can only show text. If you want the dice, D&D Beyond must roll — and then
FHPC *must* read the result back, or its engine is blind (no natural = no Natural
20/1, no Destiny, no Chaos, no Awakening). There is no cheap push-only version
that keeps the dice.

The upside: the animation is a free DDB feature. The bridge never builds it.

### The whole risk is in one place

Sending a roll is easy — `window.diceRoller.roll(...)` is a real callable. There
is **no `await roll()`**, so the hard half is catching the result and matching it
to the request that asked for it. With DDB rolling, that means observing DDB's
`dice/roll/fulfilled` broker message. Correlation is the genuine problem: several
players roll at once and nothing in that message names an FHPC request.

**Spike this before building anything else.** One throwaway extension, one
`1d20+5`, sent from a page, rolled by DDB with 3D dice, exact faces returned and
correlated. No protocol, no UI, no second repo. If it holds, the rest is ordinary
engineering; if it does not, the plan changes shape and nothing has been wasted.
It can only be tested against a live campaign with AboveVTT running — that needs
Eric at the keyboard.

### Non-negotiables from the study

- Insert **before** `rollDie()`, never after `addHistory()` — otherwise two
  sources of randomness for one roll.
- Return **every die face and the kept index**, never just a total: FHPC needs the
  kept natural for Natural 1/20, history and badges. Same for Guidance/Bardic/Destiny.
- Bind by D&D Beyond **`characterId`**, never by character name.
- **Never fall back to a local roll silently.** A visible error beats two players
  believing a roll reached the table when it did not.

---

## 11. The shared campaign feed (design, 2026-07-28)

Eric's model, and it reshapes everything downstream of it:

> Every player opens a character in the same campaign. Each builds their roll on
> **their own console**, privately. The moment they hit **ROLL**, everyone sees it.
> All of it lands in one **common feed** — which is then fed to AboveVTT in an
> **exploitable** format: damage applied to monsters, a spell opening a cone.

Private assembly, public result. Nobody watches you fiddle; everybody sees the
outcome. One event per ROLL, appended to a campaign feed.

### 11.1 Why this changes the AboveVTT architecture for the better

The study in §10 designed a bridge **per player**. That was solving the wrong
shape. With a campaign feed on the Worker, the bridge belongs on the **DM's
machine**, and three separate problems dissolve at once:

- **Distribution.** Players need **no extension at all** — they POST to the Worker
  over ordinary HTTPS, so there is no origin problem for them. One install, on the
  DM's machine, instead of one per player.
- **Permission.** Applying damage to a monster and drawing on the map are *DM*
  powers. A player's browser very likely cannot do them; the DM's can.
- **Correlation — the risk §10 called the whole project's risk — disappears.**
  Nobody has to catch an unlabelled dice result and guess whose it was. The feed
  carries the identity, and there is exactly one consumer.

What is traded away: AboveVTT stops being the source of randomness. FHPC rolls,
and the table sees the result rather than D&D Beyond's 3D dice. That trade is
already implied by wanting good local dice (package 10).

### 11.2 `fh-roll/1` is a view model, not a domain model

Checked in the source. `rollExport()` produces:

```js
parts:  [{k:"d20 (adv)", v:"12 / 18 → 18"}, {k:"Hunting", v:"+5"}]
badges: ["NATURAL 20", "Chaos 2d6 = 7"]
```

Those are **display strings**. They render a stream line beautifully and are
useless to a machine: nothing can reliably parse `"d20 (adv)"`, and nothing can
derive *"apply 9 fire damage to that token"* from a badge that reads `"NATURAL 20"`.

So "exploitable format" is not a reuse of `fh-roll/1`. It needs a second,
**semantic** layer beside it. The feed carries both, and they serve different
readers:

```json
{
  "schema": "fh-event/1",
  "id": "uuid",                     // idempotency — a retry must not double-post
  "seq": 412,                       // server-assigned, monotonic — the poll cursor
  "ts": "2026-07-28T21:04:11.000Z",
  "campaign": "FH1",
  "actor": { "pseudo": "Sol", "character": "Yedrivel", "ddbCharacterId": "123456789" },
  "type": "roll",
  "display": { /* exactly today's fh-roll/1 — unchanged */ },
  "intent":  { /* the semantic layer, below — omitted when there is nothing to act on */ }
}
```

`display` costs nothing: other players' Companions render it with the stream
renderer that already exists. `intent` is what the DM bridge acts on, and it can
start tiny and grow without ever breaking `display`.

### 11.3 The intent vocabulary

Design it once, now, carefully — everything downstream depends on it. Implement
only `check` in the first pass; the rest arrive with their panels.

```json
"intent": { "kind":"check", "check":"Hunting", "ability":"WIS",
            "total":27, "natural":20, "dc":null,
            "outcome":"success|failure|critical-success|critical-failure|null" }

"intent": { "kind":"damage", "amounts":[{"amount":9,"type":"fire"}],
            "targets":[], "halfOnSave":true }

"intent": { "kind":"spell", "name":"Burning Hands", "level":1,
            "area":{"shape":"cone","size":15,"unit":"ft"},
            "save":{"ability":"DEX","dc":15,"effect":"half"},
            "damage":[{"dice":"3d6","type":"fire"}] }
```

**Damage and spell cannot be produced yet** — FHPC has no Actions or Spells panel
(packages 6 and 7). Design the vocabulary now, emit `check` now, and let the panels
fill in the rest as they land.

**Graceful degradation is the load-bearing rule.** The DM bridge translates what it
can and *prints what it cannot*: if it can drive AboveVTT's cone tool it draws the
cone; if it cannot, it posts *"Yedrivel — Burning Hands, 15 ft cone, DEX save DC 15,
9 fire"* to the game log. Value on day one, depth later, and the feed never changes.

### 11.4 Transport

`inv:{CODE}` already proves campaign-scoped shared state in this Worker, so this is
a trodden path. The feed differs in being append-only and concurrent.

**Do not put the whole feed on one KV key** — KV allows roughly one write per second
per key and is eventually consistent, so five players rolling at once would lose
events. Write one key per event and read a range:

```text
feed:{CODE}:{seq}          -> one event, TTL 12h
GET  /feed/:code?since=SEQ -> events after SEQ (+ cursor, lookbackMs)
POST /feed/:code           -> append
DELETE /feed/:code         -> clear the log (GM token)
```

> ⚠️ **CORRECTED WHILE BUILDING — there is no cursor key.** This section used to
> specify `feed:{CODE}:cursor` holding the last allocated seq. That reintroduces
> the exact defect the rest of the paragraph exists to avoid: allocating a seq is
> a read-modify-write on **one key**, so every append in the campaign serialises
> through it at ~1 write/sec and five simultaneous rolls race on it. The cursor
> *was* the bottleneck, just moved.
>
> **The sequence is the timestamp instead:** epoch ms zero-padded to 13 digits
> (so lexicographic order — which is the order KV `list()` returns — matches
> chronological order) plus a 4-char random tiebreaker. No shared key, no
> contention, no allocation round-trip.
>
> The price is that edge clocks disagree by a few ms, so `since` is not exact: an
> event written by a lagging edge can sort behind a cursor the reader has passed.
> Readers therefore poll with a **lookback** (`lookbackMs`, 5s, published in every
> response) and drop ids they already hold. **Writer-side idempotency is
> deliberately absent** — recording each id would cost an extra KV write per roll,
> and readers must dedupe by `id` anyway because of the lookback. Any consumer,
> including the DM bridge, **must treat `id` as identity and ignore repeats**, or
> it will apply the same damage twice.

> 🚨 **MEASURED ON THE LIVE WORKER, 2026-07-29 — KV `list()` lags ~27 seconds,
> and this defeats the promise.** Six probes posted to `FH2` and polled every 2s
> until visible: **22s, 27s, 28s, 27s, 28s** (one outlier at 0s, almost certainly
> the read landing on the edge that took the write). The event is *written*
> immediately — `POST` returns its seq — but it does not appear in the key index
> that `GET /feed` walks for around half a minute.
>
> Polling every 3s against a source that lags 27s is pointless. "The moment they
> hit ROLL, everyone sees it" is **not** what this delivers; what it delivers is a
> party log that is right about half a minute ago.
>
> This is not fixable by reading differently. Putting the feed back on one key to
> get a single-key `get` trades a latency problem for a **correctness** one —
> concurrent appends to one KV key are last-write-wins and silently lose rolls,
> which is why the per-event design exists.
>
> **The honest fix is the Durable Object**, and this measurement is exactly the
> evidence for deciding it is worth the Workers paid plan. Until then the party
> log is a *recent* log, not a live one, and should not be described to players as
> live. **The design below is unchanged and correct — only the transport's latency
> is wrong**, so moving to a DO later replaces the storage and touches neither the
> event shape, the settlement rules, nor the client.

**Polling every 2–3s is enough** for a party of five and costs nothing. A Durable
Object gives instant push over WebSocket and strict ordering, and is the honest
upgrade — but it requires the Workers **paid** plan. Given Railway was cancelled on
cost, start with polling and treat the DO as a later, deliberate purchase.

Polling backs off to 12s when the tab is hidden or the table has been quiet for two
minutes. It **never stops**: gating it on `document.hidden` was tried and is wrong,
because Table mode runs the dock in a picture-in-picture window while the main
document is hidden — the feed would have gone silent exactly when it was in use.

**Retention:** cap the feed (a session's worth, or N events) and prune. It is a
table log, not an archive; the Companion's own stream already keeps personal history.

### 11.4b When a roll has settled — and why it is not `addHistory`

Built and verified. This was the hard half, and the plan had not looked at it.

`addHistory` is the funnel every roll passes through, so it looks like the place
to post. It is not:

- `finishRolledEntry` calls `addHistory` and then **returns** on a natural 1,
  leaving the player to accept or defy. Defying turns the 1 into a **20**.
  Posting there shows the table a critical failure that silently becomes a crit.
- `completeHistoryAdjustment` never calls `addHistory` at all — it mutates the
  entry in place, so an adjusted roll would never reach the table.

**`openRollState` is where every d20 path converges**, plus the `finish-sequence`
branch of `runQueueDone` for a standalone Destiny die. But an open roll can still
accrete staged dice, so the same entry legitimately settles **more than once** —
which is why events carry `rollId` + `rev`:

- the wire stays strictly append-only;
- a **signature** of what the table can see (total, outcome, natural, DC,
  adjusted, natChoice, bonus-die count, destiny result) decides whether anything
  actually changed, so re-broadcasting an unchanged entry costs nothing;
- readers key on `rollId` and keep the highest `rev`, so the log shows **one line
  per roll that updates in place** rather than three lines for one roll.

`rollTransactionActive()` gates the whole thing: nothing is broadcast while the
dock is still asking the player a question.

### 11.4c The party log is a zone, not a belt tab

The package table said "new panel". It is not one, for two reasons that both come
from rules already written down:

- **The belt is everything *inside the character*** (HANDOFF §2). The party is not
  inside the character.
- A feed you have to navigate to defeats its own purpose — the point is that the
  moment someone rolls, *everyone sees it*.

So the **stream zone reads two ways**: `STREAM` (this character's resolved rolls,
unchanged) and `TABLE` (the campaign feed, live), one toggle in the zone caption.
Zero extra vertical space, which the dock does not have to spare, and the feed is
one click away from every tab. `display` being `fh-roll/1` means the party log
renders through the same shape the personal stream exports — the two read
identically by construction.

A feed that is not reaching the Worker **says so on the tab itself** (`is-off`,
red) and in the caption: *"not reaching the table"*. Never fall back silently.

### 11.5 Staging

The feed is worth building **on its own, with zero AboveVTT** — right now every
player's dock is an island and nobody can see anyone else's rolls. A live shared
party log is a real feature at the table even if the bridge never ships. It is also
the prerequisite for the bridge, so it is step one either way.

1. ~~**Feed + party log**~~ — **DONE.** Worker endpoints, Companion posts on settle,
   Companion shows the party's rolls live. No extension, no AboveVTT.
2. ~~**Intent vocabulary**~~ — **DONE.** `check` is emitted; damage and spell shapes
   are frozen and already accepted by the Worker, so the panels that produce them
   need no Worker deploy.
3. **DM bridge, log-only** — one extension, reads the feed, posts formatted lines.
   Low risk, immediate table value. **This is next; the feed contract is frozen.**
4. **Deepen** — damage application, then AoE if it proves reachable at all (§10 rates
   AoE as doubtful; the degradation rule is what makes failing at it safe).

### 11.6 What is deliberately not built

- **Retention is a 12h TTL per event**, not a pruning sweep. It is a table log, not
  an archive, and the Companion's own stream keeps personal history. A reader caps
  at 200 events.
- **`GET /feed` costs one KV `list` per poll.** At five players on a 4h session that
  is roughly 24k reads — inside the free tier, but it is the metered thing here, and
  it is why the backoff exists. If it ever bites, the honest fix is the Durable
  Object, not a cleverer polling scheme.
- **Anyone with the join code can post**, exactly like `POST /builds`. The join code
  is the membership model for the whole app; the feed does not invent a second one.
- **Damage and spell intents are not produced** — there are no Actions or Spells
  panels yet (packages 6 and 7). The vocabulary is frozen so they can just emit.
