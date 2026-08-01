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
| 12a | **Table server.** The live feed moves onto the DM's machine (§12): Node + SSE + Cloudflare Tunnel, serving the Worker's `/feed` contract verbatim plus a stream, mirroring to the cloud backstop. This is what makes "the moment they hit ROLL" true. Verifiable with no AboveVTT and no live game. | Sonnet · high | new repo `fh-table` | 11 |
| 12b | **AboveVTT bridge (log-only).** The same repo's extension, subscribing to the table server over loopback like any other consumer; posts formatted lines into AboveVTT. Degrades by printing what it cannot drive. | Sonnet · high | `fh-table/extension` | 12a |
| — | **Dock + rendezvous** — the SSE client, the three table states (§12.5) and `POST/GET/DELETE /table/:code` on the Worker. **Architect work, not a package chat**: it is core (`fh-player-sheet.js`) and the Worker. | Opus · high | core + Worker | 12a |
| 10 | **Dice lab.** Prototype face-cycling, in-slot 3D tumble, materials, landing weight — side by side, no dock changes. | Sonnet · high | `tools/dice-lab.html` | — |
| 5 | **Features panel** — abilities, traits, feats, with a real per-rest/per-day tracker. | Sonnet · high | `fh-panel-features.js` | 1 |
| 6 | **Actions panel — READY / QUEUED.** Action / BA / Reaction, clickable rolls, `showsRoller: true`. The detailed V1 starter prompt is preserved in `architect-prompts/actions-v1.md`; it supersedes the short prompt in §8 and launches only after the character-validation gate and 12b. | Sonnet · high | `fh-panel-actions.js` | 1 |
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

**READY / QUEUED (2026-08-01).** The original short starter prompt is superseded
by the reviewed, table-usable V1 brief in
[`architect-prompts/actions-v1.md`](architect-prompts/actions-v1.md). It adds the
manual-first data model, turn economy, SRD/Fate's Hand boundaries, explicit core
hook gaps, persistence and adversarial tests. Before dispatch, refresh only its
worktree/branch preamble against the handoff; do not shrink its scope silently.

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

**Package 12a · The table server** — a NEW repo `~/tools/fh-table`, not a worktree

```
Build the Fate's Hand table server: a small Node program the DM runs on their own
machine during a session, which hosts the live campaign feed for a party of
remote players. It replaces a cloud feed that was measured at ~27s of latency.
Players install NOTHING -- they open a web page, as they do today.

READ COMPANION-BUILD-PLAN.md SECTION 12 IN FULL BEFORE WRITING ANY CODE, then
section 11 for the event shapes you are carrying. Both are in ~/tools/fh-phb.
Section 12 is the design and it is decided -- you are implementing it, not
revisiting it. Section 11's settlement rules, rollId+rev revisions, dedupe-by-id
and fh-event/1 / fh-roll/1 shapes are VERIFIED AND FROZEN: you change the
transport and nothing above it.

WHAT YOU ARE BUILDING (12.8): one file, `table-server.mjs`, ZERO npm
dependencies, run as `node table-server.mjs FH2`. It binds node:http to
127.0.0.1:8791 (--port to override), spawns `cloudflared tunnel --url
http://127.0.0.1:8791` and scrapes the assigned https URL from its output,
registers that URL with the cloud Worker and re-registers every 5 minutes, and
serves:

  GET    /feed/:code?since=&limit=   IDENTICAL to the Worker's response shape:
                                     {schemaVersion, lookbackMs, cursor, events[]}
  POST   /feed/:code                 IDENTICAL body and {ok, seq, id} response
  GET    /feed/:code/stream          NEW -- SSE, the contract is in 12.3
  DELETE /feed/:code                 clear the log
  GET    /health                     {ok, code, startedAt, connected, events}
  OPTIONS *                          the preflight, see below

The Worker's implementation of the first two is ~/tools/fh-worker/src/worker.js
lines 916-1010 (helpers, safeFeedEvent, readFeed) and 1153-1195 (the routes).
READ IT AND MATCH IT -- serving the poll contract
verbatim is what makes this a transport swap, and it is how you test before any
SSE client exists.

SIX THINGS THAT WILL BITE, ALL ALREADY PAID FOR:

1. CORS PREFLIGHT. The dock is on https://noirchicot.github.io, you are on
   *.trycloudflare.com. EventSource sends no custom headers so the stream is a
   simple request, but the POST carries Content-Type: application/json and DOES
   trigger an OPTIONS preflight. Without a real OPTIONS handler the stream looks
   perfect and rolls silently fail to submit. Mirror the Worker's allow-list
   (worker.js:38). Never ship `*`.
2. NO COMPRESSION ON THE STREAM. Cache-Control: no-cache, no-transform, no gzip.
   A buffering layer reintroduces exactly the latency this package exists to
   remove.
3. Last-Event-ID BEATS ?since. EventSource resends it automatically on reconnect.
   Replay the ring buffer from there, then stream live. The replay WILL overlap
   what the client already has -- that is fine and expected, because every reader
   dedupes by event.id. Do not try to make replay exact.
4. seq KEEPS THE 13-DIGIT FORMAT from 11.4 (padded epoch ms + 4-char tiebreaker),
   even though one process could use a counter -- the dock must not need to know
   which source it is talking to. Guard the clock: seq = max(now, lastSeq+1).
   Publish lookbackMs: 0 (one process assigns every seq, so there is no skew).
5. MIRROR EVERY EVENT ONWARD to the cloud Worker as it arrives, one POST each,
   NEVER batched (12.6). The Worker re-stamps ts on arrival, so mirroring within
   a second keeps the backstop's timestamps true; a retry queue would silently
   skew them. --no-mirror disables it. This needs no Worker change: safeFeedEvent
   preserves id, rollId and rev verbatim.
6. BIND TO 127.0.0.1, NEVER 0.0.0.0 (12.9). The tunnel is the only way in. Serve
   the feed routes and nothing else -- no static files, no path that reaches the
   filesystem. Cap bodies at ~8KB. Reject any code that is not the one the server
   was started for.

THE RULE THAT OUTRANKS EVERYTHING: NEVER FAIL SILENTLY. The DM's terminal is an
instrument panel readable across a room (12.8) -- campaign, player URL, connected
count, event count, mirror state. When the tunnel drops or the Worker refuses the
heartbeat, it says so IN THAT BLOCK, in red. The DM must never read a log to
learn the table is down.

MEASURE, DO NOT ASSUME (12.11). This package exists because a 27s number was
measured instead of assumed. Before you report success:
  - six probes, post-to-visible, through the tunnel. Target under 500ms.
    Over ~2s means something is buffering.
  - confirm Cloudflare Tunnel passes SSE UNBUFFERED. This is the one assumption
    the transport choice rests on. If it fails, say so and stop -- WebSocket is
    the pre-approved plan B (12.11) and it changes no event shape, but that is
    Eric's call to take, not yours.
  - a four-hour soak with a connection held open. Sleeping laptops and silently
    half-open tunnels are where the boring failures live, and four hours is the
    actual requirement.

DO NOT TOUCH ~/tools/fh-phb. The dock's side of this -- source resolution, the
SSE client, the three table states -- is core and belongs to the architect.
You build the server and freeze nothing but your own contract.

Done when: `node table-server.mjs FH2` prints a URL; two browsers pointed at it
see each other's rolls in under 500ms measured; a revised roll updates one line
instead of adding a second; killing the tunnel turns the panel red; and the six
probes plus the soak are in the report as numbers, not adjectives.
```

---

**Package 12b · AboveVTT bridge (log-only)** — the `extension/` folder of `fh-table`

```
Build the Fate's Hand DM bridge: a Chrome extension that reads the campaign feed
and writes the rolls into AboveVTT's game log. It runs on the DM's machine only.
Players install nothing. Package 12a (the table server) must be working first.

READ COMPANION-BUILD-PLAN.md SECTIONS 10, 11 AND 12 BEFORE WRITING ANY CODE.
They are in ~/tools/fh-phb. Section 10 is verified research into what AboveVTT
will and will not accept; 11 is the event contract; 12 is the server you are
subscribing to. All three are frozen -- you are a reader.

YOU ARE JUST ANOTHER SUBSCRIBER. Connect to
http://127.0.0.1:8791/feed/{CODE}/stream on loopback, exactly as a player's dock
connects over the tunnel. You get no privileged path into the server and you need
none -- which also means you can be built and tested with no tunnel at all, and
with fake events posted by curl.

Each event is fh-event/1 and carries TWO layers: `display` (an fh-roll/1 view
model -- display STRINGS, do not try to parse them) and `intent` (the semantic
layer -- act on this). Today only intent.kind === "check" is ever produced;
"damage" and "spell" shapes are frozen in 11.3 and will start arriving when the
Actions and Spells panels land, so handle an unknown kind by PRINTING it rather
than crashing.

THREE RULES YOU MUST NOT BREAK, all three already paid for:

1. DEDUPE BY event.id. A stream replays on reconnect (12.3), so you WILL see
   events you have already seen. A bridge that does not dedupe posts every line
   twice and, later, applies every point of damage twice.
2. A revision is not a new roll. Events carry rollId + rev; an open roll that
   gains a bonus die reappends with the same rollId and a higher rev. Key on
   rollId, keep the highest rev, and EDIT or supersede the line you already
   posted rather than adding a second one.
3. NEVER FALL BACK SILENTLY. If you cannot reach AboveVTT, say so visibly. A DM
   believing the table saw a roll it never saw is the one failure that matters.

Graceful degradation is the whole design (11.3): translate what you can, PRINT
what you cannot. Log-only is a complete, shippable outcome for this package --
do not attempt damage application or AoE in this pass.

Testing needs Eric at the keyboard with a live campaign and AboveVTT running, so
build against the local feed first and only then ask for a live session.

Done when: a roll made in the Companion appears as a formatted line in the
AboveVTT game log on the DM's machine, exactly once, and a revised roll does not
produce a second line.
```

**Implementation status — BUILT LOCALLY / LIVE TEST PENDING (2026-08-01):**
`fh-table` branch `pkg12b-abovevtt`, commit `a7a8036`. The DM-only Manifest V3
extension subscribes to the loopback WebSocket, injects resolved plain text via
AboveVTT's `MB.inject_chat`, visibly reports `LIVE` versus `NOT DELIVERING`,
deduplicates by event id, and emits an explicit `UPDATE ... supersedes ...` for
higher revisions. A real local server+harness run with an initial event, exact
duplicate and higher revision produced exactly two lines. All 67 repository
tests pass from a separate clone of the commit. Nothing has been pushed or
deployed. The remaining done gate is the live AboveVTT test with Eric present.

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

> 📖 **A second AboveVTT reference exists**, `~/obsidian-vault/Gpt in FH/
> FHPC-AboveVTT-DDB-Integration-Bible.md` — genuinely useful for AoE
> shape/placement geometry and a capability-handshake pattern that this study
> did not cover, when package 12's "deepen" phase (§11.5 point 4) gets there.
> **It also recommends, as its headline pattern, sending dice *expressions*
> via AboveVTT slash commands (`/hit`, `/dmg`, `/save`, `/heal`) so "AboveVTT
> creates a real roll."** Its own text confirms that makes AboveVTT roll its
> own dice — which is exactly the second-source-of-randomness this page just
> forbade, if applied to a roll FHPC's engine already resolved. A correction
> is appended at the top of that file. Package 12b (log-only, current scope)
> already avoids this by posting plain resolved text, not slash commands.

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

> ✅ **RESOLVED 2026-07-29 — Eric's decision: neither. The live feed moves to the
> DM's machine.** Not a Durable Object, not a paid plan. During a session the DM
> already runs a program on their own machine (the AboveVTT bridge, package 12),
> everyone including the DM is connected remotely for four hours, and a server
> that only has to exist while the DM is present can hold an open socket per
> player and answer in milliseconds. The precedent is ordinary: self-hosted
> Foundry VTT is how a large share of tables already work.
>
> **What this section still governs:** everything above the transport. The
> settlement rules (§11.4b), `rollId` + `rev` revisions, dedupe by `id`, and the
> `fh-event/1` / `fh-roll/1` shapes are **unchanged and correct** — they were
> built against this transport and they carry over untouched. Only *where the
> events are stored and how they reach a dock* moves.
>
> **What the cloud feed becomes:** the backstop, not the feed. It keeps its
> routes, keeps working, and is relabelled honestly in the dock — see §12.5 and
> §12.6. It is not deleted and it is never selected silently.
>
> **The full design is §12.** Read it before touching any of this.

**Polling every 2–3s was the right call for a cloud KV feed and is retained as
the fallback path** — the backstop log in §12.6 is still read this way, and the
poll route is what the table server implements verbatim so a dock can talk to
either source with the same code. What polling could never do is beat a 27s
write-visibility lag, which is not a polling problem at all.

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

> ⚠️ **Two captions in the shipped code are now lies and must be fixed before the
> site is deployed.** `streamZoneInner()` says *"every roll in the campaign,
> live"* and the empty state says *"Nothing from the table yet."* Against the
> cloud feed both are false — it is ~30s behind, and "nothing yet" may mean "four
> rolls you cannot see yet". ~~This is the whole reason the site is undeployed.~~
> **Stale as of 2026-07-30 — the site was deployed** (`gh-pages` = "Deployed
> `0aad96e`") with the three honest states in place. What shipped with it is the
> 3-second cloud poll, which is what took production down; see §13.1.
> §12.5 replaces the binary on/off with **three named states**, and the amber one
> carries the lag in its own caption. Relabelling is separable from, and much
> smaller than, the table server: it is what makes the finished package-11 work
> shippable today rather than stranded.

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
3. ~~**DM bridge, log-only**~~ — **restaged 2026-07-29.** The bridge is no longer
   the next thing on its own: the same program on the DM's machine now also
   *serves* the live feed (§12). Package 12 therefore splits — **12a the table
   server**, which is what finally makes "the moment they hit ROLL" true and is
   verifiable with no AboveVTT and no live game; then **12b the bridge**, which is
   the original scope, reading the table server over loopback.
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

---

## 12. The table server (design, 2026-07-29)

**Eric's decision, and the reasoning is his:** rather than buy the Workers paid
plan for a Durable Object, host the live feed **on the DM's machine, during the
session**, fused with the AboveVTT bridge that was already going to run there.

> Sessions last four hours and everybody — the DM included — is connected
> remotely for all of it. The live feed only means anything while the DM is
> present anyway. Sheet edits and solo rolls between sessions stay on the cloud
> Worker, untouched. Only the live feed moves.

Self-hosted Foundry VTT is the same shape, and a great many tables run that way.
This is not an exotic choice.

### 12.1 What moves, and what emphatically does not

| Stays on the cloud Worker, unchanged | Moves to the DM's machine |
|---|---|
| `/builds`, `/party/:code`, `/party/:code/:pseudo` | the **live** campaign feed |
| `/profile/:code/:pseudo` | |
| `/inv/:code` (+ Soulforge) | |
| the GM tools, `gm.html`, the join-code model | |
| `/feed/:code` — **kept as the backstop** (§12.6) | |

And, above the transport, **nothing moves at all**. Acquisition at
`openRollState`, the `finish-sequence` branch, `rollTransactionActive()` gating,
the signature test, `rollId` + `rev` revisions, dedupe by `id`, `fh-event/1`,
`fh-roll/1`, the intent vocabulary: all verified, all correct, all carried over
byte-for-byte. **This package changes one thing: the base URL the feed talks to,
and how events arrive.** Any proposal that reopens the settlement logic has
misread this section.

### 12.2 The rule that decides the access question before anything else

The Companion is served from `https://noirchicot.github.io`. **An HTTPS page
cannot fetch `http://`** — the browser blocks it as mixed content. So whatever
the DM runs must be reachable over **HTTPS with a valid certificate**, and that
one sentence eliminates most of the option space:

- ❌ **Port forwarding on the router.** No certificate, so no browser will talk
  to it. Adding one means owning DNS and renewals, plus an inbound hole in Eric's
  home network. Rejected.
- ❌ **ngrok free.** Random URL per run *and* a browser interstitial on the free
  tier, which `fetch` and `EventSource` cannot click through. Rejected.
- ⚠️ **Tailscale Funnel.** Works, stable hostname, free — but it is a second
  account and a second daemon for a problem the first one already solves.
  Keep as a known alternative; do not build on it first.
- ✅ **Cloudflare Tunnel (`cloudflared`).** TLS terminated at Cloudflare's edge
  with a valid cert, **no inbound port opened at all** (the tunnel dials out),
  free, WebSocket- and SSE-capable, and Eric already has the Cloudflare account
  the Worker lives in.

Two flavours, and the design is **deliberately indifferent to which** because of
§12.4:

- **Quick Tunnel** — `cloudflared tunnel --url http://127.0.0.1:8791` prints a
  fresh `https://<random-words>.trycloudflare.com`. Zero configuration, **no
  domain required**. The URL changes every run, which §12.4 makes a non-issue.
  Cloudflare labels these as for testing and offers no uptime guarantee — a real
  caveat, named here rather than discovered at the table.
- **Named Tunnel** — a stable `https://table.<domain>`, requires a domain on
  Cloudflare. Better if Eric has or wants one; **strictly a config change**, not
  a design change.

**Start on Quick Tunnel.** It needs nothing Eric does not already have.

> **Nobody's browser talks to loopback except the extension.** The DM's own dock
> uses the tunnel URL like every player's, costing one round-trip to the edge and
> back. This is on purpose: fetching `http://127.0.0.1` from an HTTPS page drags
> in per-browser mixed-content exemptions *and* Chrome's Private Network Access
> preflight (`Access-Control-Allow-Private-Network`), and Safari is stricter than
> both. The extension has a `chrome-extension://` origin and a host permission,
> so none of that applies to it. One path for browsers, one for the extension.

### 12.3 Transport: push down, ordinary POST up

> 🔄 **SUPERSEDED IN PART, 2026-07-29 — the delivery half is WebSocket, not SSE.**
> Cloudflare Quick Tunnel delivers no streamed HTTP body at all (isolated with a
> 10-line server; measurements and the full elimination in §12.11 point 2).
> WebSocket through the same tunnel: 57 ms avg end to end. **The upstream half of
> this section is unchanged and still correct** — `POST` remains the submission
> path, for the reasons given below. Read reason 1 as still binding, reasons 2–4
> as the case for SSE that the measurement overruled, and §12.11 for what the
> switch actually cost (~40 lines of reconnect in the dock; nothing above the
> transport). The stream contract below is the **loopback/debug** shape now; the
> production one is `GET /feed/:code/ws[?since=SEQ]`.

**Originally decided: Server-Sent Events for delivery, unchanged HTTP POST for
submission.** WebSocket was the pre-approved plan B (§12.11) — and it was called
in. The event shape is identical either way, which is exactly why the bet was
safe.

The traffic is **asymmetric**, and that is what settles it. Upstream is rare,
discrete and already works: one `POST /feed/:code` when a roll settles, whose
response is the ack that clears the dock's `offline` status and whose failure
sets it. Downstream is the half that must be instant.

SSE fits that asymmetry exactly:

1. **The upstream path is preserved verbatim.** Same route, same body, same ack,
   same failure semantics — code that is already verified is not rewritten. A
   WebSocket would replace both halves with one channel and force us to invent an
   app-level ack to get back what `POST` gives for free.
2. **`Last-Event-ID` *is* the `since` cursor**, already designed. `EventSource`
   reconnects on its own and replays its last id; resume-after-drop is implemented
   by the browser rather than by us. With a WebSocket, reconnection, backoff and
   resync are all ours to write and ours to get wrong.
3. **Failure is loud by construction** — `onerror` fires, and a server heartbeat
   every 15s makes a silent half-open connection detectable. No hand-rolled
   ping/pong. This is the §2 rule getting cheaper to obey, which is the best kind
   of argument.
4. **It degrades to the existing poll** without a second implementation, because
   the table server serves both (§12.4).
5. WebSocket's bidirectionality buys nothing here. The dock has exactly one thing
   to say and says it a few times a minute.

**The stream contract:**

```text
GET /feed/{CODE}/stream[?since=SEQ]        Accept: text/event-stream
  → 200  Content-Type: text/event-stream
         Cache-Control: no-cache, no-transform
         Connection: keep-alive

     retry: 3000                    once, on open
     : hb                           a comment line every 15s — the liveness signal

     id: 0001753822451000-a3f9      the seq; EventSource echoes it as Last-Event-ID
     event: fh-event
     data: {…one fh-event/1…}
```

- `Last-Event-ID` (sent automatically on reconnect) **takes precedence over**
  `?since`.
- On connect the server replays the ring buffer from that point, then streams
  live. Replay may overlap what the dock already holds — **dedupe by `id` still
  applies**, exactly as §11.4 requires. Never remove it.
- **Compression must be off on this route** (`no-transform`, no gzip). A buffering
  proxy is the one thing that would quietly reintroduce latency.

**`seq` keeps the 13-digit-ms + tiebreaker format** from §11.4, even though a
single process could use a plain counter. Two reasons: the dock's cursor code
then needs no knowledge of which source it is talking to, and a mirrored event
(§12.6) sorts correctly in the cloud. Guard against clock adjustment with
`seq = max(now, lastSeq + 1)`.

The clock-skew *lookback* becomes unnecessary — one process assigns every seq, so
ordering is total and exact. The table server publishes **`lookbackMs: 0`** and the
dock's existing `feedRewind` then rewinds by nothing. Dedupe stays regardless.

**CORS is not optional and is not free.** The dock is on `noirchicot.github.io`,
the server is on `*.trycloudflare.com`: cross-origin. `EventSource` sends no
custom headers so the stream is a simple request, but the `POST` carries
`Content-Type: application/json` and therefore **triggers a preflight** — the
table server needs a real `OPTIONS` handler or the submit path dies while the
stream looks perfect. Mirror the Worker's allow-list (`ADMIN_ORIGINS`,
`worker.js:38`); do not ship `*`.

### 12.4 The rendezvous: how a remote dock finds a machine whose URL changes

This is the piece that makes a Quick Tunnel acceptable, and it is one small route
on the **cloud Worker** — which is exactly the right place, because the Worker is
already the campaign's directory and already gates on the join code.

```text
POST   /table/:code   (GM token)  { url }   → register / heartbeat, TTL 15 min
GET    /table/:code   (public)              → { live:true, url, startedAt, … }
                                            → { live:false }
DELETE /table/:code   (GM token)            → the table is over
```

Stored as **one key**, `table:{CODE}` — a single-key `get`, never a `list()`.
The 27s measurement was `list()` walking a key index for freshly created keys;
this is the operation KV is actually good at. It is read about once a minute per
dock and written once per five.

`POST` (not `PUT`) on purpose: `adminCors` already advertises `GET, POST, DELETE,
OPTIONS` (`worker.js:49`), so the rendezvous reuses the exact shape `/feed`
already proves — public `GET` behind `validCode`, GM-token `POST`/`DELETE` behind
`adminCors`. No new auth, no new CORS surface.

**The TTL is the liveness model, and it is why there is no shutdown handshake.**
The table server re-POSTs every 5 minutes with `expirationTtl: 900`. Close the
laptop, kill the process, lose the wifi — within 15 minutes the record simply
ceases to exist and every dock says *no table running*. Nothing has to be
cleaned up, and a crash cannot leave a stale "live" claim forever.

That 15-minute window sounds long and is not, because **the record answers "where
do I connect?", never "am I connected?"** A dock knows its own stream state
first-hand and turns red the instant it drops. The TTL only bounds how long a
*newly arriving* dock keeps retrying a dead URL.

> **Assumed, not measured: KV single-key `get` is fast enough here.** Cloudflare
> documents up to ~60s global propagation for a changed value. The design is
> insensitive to it — the DM starts the server before players arrive, and a dock
> that reads a stale record retries and self-heals (§12.5) — but **it is one
> probe to check, using the same method that condemned `list()`, and 12a should
> check it rather than assume it.** That discipline is what produced the 27s
> number in the first place.

**A manual override must exist anyway.** A field where the DM pastes a URL into
the dock (and the DM reads it out over voice) is the escape hatch for every
rendezvous failure, and it is three lines. The design is indifferent to where the
URL came from — including a human.

### 12.5 Three table states, and the discipline that keeps them honest

§2 forbids **silent** fallback. It does not forbid fallback — it forbids the user
not knowing. So the dock stops having a binary `offline` flag and gets three named
states, each with its own caption:

| State | When | Caption | Tab |
|---|---|---|---|
| **LIVE** | rendezvous says a table is live **and** the stream is up | *every roll at the table, live* | green |
| **RECENT** | rendezvous says **no table is running** | *no live table — cloud log, about 30s behind* | amber |
| **OFF** | rendezvous says live, stream is **down** | *not reaching the table* | red |

Three rules make this safe rather than clever:

1. **OFF never becomes RECENT.** A dropped stream while a table is live means
   *stop and say so* — it does **not** mean quietly reroute to the cloud. That
   reroute is precisely the silent divergence §2 exists to forbid, and it is the
   tempting bug.
2. **One writer at a time.** In LIVE, the dock posts **only** to the table server.
   In OFF it posts **nowhere** and says so — a roll the table did not see must
   look like a roll the table did not see. In RECENT it posts to the cloud. Never
   both; a dual write would double every line for anyone reading the other source.
3. **Promotion is automatic; demotion needs the record to disappear.** A dock in
   RECENT re-checks the rendezvous every 60s and switches to LIVE the moment a
   table appears, announcing it in the caption. Going the other way requires
   `GET /table/:code` to return `live:false` — not a connection blip.

Rule 3 closes the split-brain that would otherwise be the real hazard here: a
player joining two minutes late, reading a stale rendezvous, going to cloud mode,
rolling, and **never being seen by a table that is right there**. The residual
window is ~60s and self-heals, and §12.6 makes even that window truthful.

### 12.6 The cloud feed becomes the backstop — and the table server mirrors into it

Keep `/feed/:code` on the Worker. Demote it from *the feed* to *the backstop*, and
have the table server **POST every event onward to the cloud as it arrives**.

Four things fall out, all of them cheap:

- The RECENT state stops being a decoy. A dock that has not yet promoted sees a
  complete log, merely late, instead of an empty panel that reads as *nobody is
  rolling*.
- **The session survives the DM's laptop.** The cloud copy is an off-site backup
  with a 12h TTL.
- Package 11's Worker code stays exercised instead of rotting unused.
- **It needs no Worker change whatsoever.** `safeFeedEvent` preserves `id`,
  `rollId` and `rev` verbatim (`worker.js:976`, `989`, `990`), so a mirrored event keeps its
  identity — and every reader already dedupes by `id`, so a dock that saw an event
  live and later reads it from the backstop merges it into the same line. That
  property falls straight out of §11 being id-based rather than position-based.

**Mirror immediately, one POST per event, never batched.** The Worker re-stamps
`ts` with its own arrival time (`worker.js:977`), and the dock renders `event.ts`
(`fh-player-sheet.js:2201`). Mirroring within a second of the roll keeps that
timestamp true to the second; batching or retry queues would silently skew the
backstop's clock. If mirroring ever needs to be deferred, the Worker must start
accepting a caller-supplied `ts` instead — a small change, but do not let it
happen by accident.

Mirroring is **on by default, `--no-mirror` to disable**. Volume is far under the
Worker's 90-posts-per-minute-per-IP limit; a table does not roll 90 times a minute.

### 12.7 Persistence: a ring buffer, a session file, nothing more

**Ephemeral in intent.** The question is only what "ephemeral" has to survive.

- **Across a reconnect — required.** A closed lid, a dropped wifi, a
  picture-in-picture window reopening. This is what makes `Last-Event-ID` mean
  anything, and it needs an **in-memory ring buffer** (400 events is generous for
  a session), not storage.
- **Across a server restart — cheap enough to be worth it.** One append-only
  **JSONL file per campaign per day**, one line per event, `fsync` never needed.
  On startup, replay the tail: the last 200 events **newer than 4 hours**. One
  rule, no flags, and it does the right thing whether the DM restarts mid-fight or
  starts a fresh session next week.
- **Across sessions — no.** §11.6 already settled this: a table log, not an
  archive. Personal history lives in each dock's own STREAM.

> **A side benefit worth naming because it costs nothing:** that JSONL is a
> complete, timestamped, machine-readable transcript of every roll the table made.
> Eric already runs a *Journal de campagne PDF* and a *Réécriture littéraire*
> pipeline; this is free raw material for both. The program never prunes these
> files and never reads yesterday's — deleting them is the DM's business.

### 12.8 What the DM actually runs

**One command, zero npm dependencies, one file.** This program runs immediately
before a game, with players waiting; it must never fail on an install.

```bash
node table-server.mjs FH2
```

It: binds `node:http` to **127.0.0.1:8791** (`--port` to override — deliberately
clear of wrangler's 8787 and of the worktree ports 8130–8136); spawns
`cloudflared tunnel --url http://127.0.0.1:8791` and reads the assigned hostname
from its output; registers that URL with the Worker and heartbeats it every 5
minutes; serves the routes below; mirrors to the cloud; appends the JSONL.

**The routes are the Worker's contract, plus two:**

```text
GET    /feed/:code?since=&limit=     identical response to the Worker's — same
                                     {schemaVersion, lookbackMs, cursor, events[]}
POST   /feed/:code                   identical body, identical {ok, seq, id}
GET    /feed/:code/ws[?since=SEQ]    NEW — the production push channel.
                                     WebSocket; frames are {seq, event}.
                                     Replays from `since`, then streams live.
GET    /feed/:code/stream            SSE — LOOPBACK AND DEBUG ONLY. Works
                                     perfectly on 127.0.0.1 and is the quickest
                                     way to watch a feed with `curl -N`, but a
                                     Quick Tunnel delivers none of it (§12.11).
                                     Never a path a remote dock may take.
DELETE /feed/:code                   clear the live ring buffer (GM token)
GET    /health                       {ok, code, startedAt, connected, ws, sse,
                                      events, tunnel, tunnelHealthy, rendezvous}
OPTIONS *                            the preflight §12.3 requires
```

**The WebSocket upgrade is origin-checked by the server itself** — a browser
applies no CORS to it, so nothing else will. See §12.11.

Implementing the poll route verbatim is what makes the whole thing a genuine
transport swap: **the dock's existing cloud-mode code path works against the
table server unchanged**, which is also how 12a gets tested before any SSE client
exists.

The terminal is the DM's instrument panel and must be readable across a room:

```text
  FATE'S HAND — TABLE SERVER
  campaign   FH2
  players    https://<assigned>.trycloudflare.com
  status     LIVE · 3 connected · 47 events · mirroring ✓
```

…and when the tunnel drops or the Worker refuses the heartbeat, it says so, in
red, in that block. The DM must never have to read a log to learn the table is
down. **The §2 rule binds this program exactly as it binds the dock.**

Worth wiring into the **Dashboard Widget / Raccourcis Campagnes** one-click
session launcher once it works — it belongs with the windows that already open at
the start of a game.

### 12.9 Security surface

The DM's laptop is now answering the internet. Proportionate, not paranoid:

- **Bind to `127.0.0.1`, never `0.0.0.0`.** The tunnel is then the *only* way in,
  and a tunnel that is down means genuinely closed — not quietly exposed to the
  café wifi.
- **The join code stays the whole membership model** (§11.6 — the feed does not
  invent a second one). The server is started *for one campaign* and rejects every
  other code with a flat 403; it has no builds KV to consult and needs none.
- **Serve the feed routes and nothing else.** No static files, no directory
  listing, no path that reaches the filesystem. This program is not a web server
  that happens to do feeds.
- **Cap the body** (~8 KB, matching `safeOpaque`) and rate-limit per IP the way
  the Worker does. Validate with the same shape as `safeFeedEvent`.
- The URL is unguessable and lives one session. **If a URL ever leaks**, the
  upgrade is a per-session token in the rendezvous record — handed only to someone
  who already has the campaign code, so it adds rotation rather than a second
  membership model. Not built now; noted so it is a config decision later rather
  than a redesign.

### 12.10 Package 12 splits in two — and the dock is not part of it

| | What | Where | Needs Eric live? |
|---|---|---|---|
| **12a** | the table server | new repo `fh-table` | no |
| **12b** | the AboveVTT bridge | same repo, `extension/` | yes |

**12a is verifiable alone, tonight, with no AboveVTT and no live game:** run it,
open the dock in two browser profiles pointed at the tunnel, roll in one, watch it
land in the other. The latency promise is either delivered or it is not, and the
same six-probe method that condemned KV settles it.

**12b is the original package 12, unchanged in scope** — and it gets simpler,
because the bridge subscribes to `http://127.0.0.1:8791/feed/{CODE}/stream` like
any other consumer. **The bridge has no privileged path into the server**; it is
just another subscriber that happens to be on loopback. It can therefore be built
and tested with no tunnel at all.

> **The dock side belongs to the architect, not to package 12.** Source
> resolution, the SSE client, and the three states all live in
> `docs/javascripts/fh-player-sheet.js` — core, which HANDOFF §1 puts off-limits
> to package chats. Package 12 builds against a client contract the architect
> freezes; it does not edit the Companion. The rendezvous route on the Worker is
> likewise architect work (~40 lines beside `/feed`).

**Order:** Worker rendezvous and 12a in parallel (12a can hardcode a URL until the
route exists) → dock client and the three states → 12b.

### 12.11 What must be measured before any of this is believed

The 27s number is why this package exists. Do not replace one assumption with
three.

1. ✅ **MEASURED 2026-07-29 — end-to-end roll latency through a Quick Tunnel.**
   Six probes, post-to-visible, same method as §11.4, against a real
   `*.trycloudflare.com` tunnel: **522, 426, 436, 337, 340, 407 ms.** Target was
   under 500 ms; five of six landed inside it, the sixth (522ms) is explained by
   cold DNS/TLS on the first request. **This alone is the headline win** — 27s
   down to under half a second — and it holds with plain polling, independent of
   whether SSE works (point 2).
2. ✅ **RESOLVED 2026-07-29 — the transport is WebSocket. SSE is dead through
   the tunnel; WebSocket works, and the fallback cost nothing above the
   transport exactly as this section promised.**
   >
   > **The SSE failure was isolated, not guessed.** A 10-line SSE server — no
   > `Connection` header, nothing exotic — behind its own Quick Tunnel delivered
   > **zero bytes**, while the same server on loopback streamed instantly. It is
   > the tunnel, not our code. Also ruled out: the missing `Accept:
   > text/event-stream` header (a real `EventSource` always sends it; adding it
   > changed nothing), backgrounding artifacts, a size threshold (40 events
   > queued), and HTTP/2 framing (HTTP/1.1 forced).
   >
   > **WebSocket through the same Quick Tunnel, measured:** connect **290 ms**,
   > first frame **291 ms**, then ticks on the millisecond. No buffering.
   >
   > **End-to-end with the real table server, six probes, POST → tunnel → server
   > → WS → back: 115, 49, 43, 46, 42, 46 ms — avg 57 ms.** Against the cloud
   > feed's 22–28 s, that is a factor of ~470. (Both ends of this probe sit on
   > one machine, so a remote player adds their own hop to the CF edge — expect
   > roughly 60–150 ms in the room, not 57. The order of magnitude is settled.)
   >
   > **Also verified against the real server through the tunnel:** two clients
   > connected at once both receive the same roll; a client that drops,
   > reconnects with `?since=<cursor>` and replays **exactly** the events it
   > missed, no more and no less.
   >
   > **What the fallback actually cost**, honestly stated: `Last-Event-ID` and
   > browser-managed reconnection are gone. Resume is now an explicit `?since=`
   > query param (the same cursor the poll route uses), and the dock must own
   > its own reconnect-with-backoff. That is ~40 lines in the dock. Everything
   > else — the event shape, the seq format, settlement, `rollId`+`rev`,
   > dedupe-by-id, the merge layer, the mirror, the poll route — is untouched,
   > which is the whole reason SSE-first was a safe bet rather than a gamble.
   >
   > **`POST` stays the upstream.** WebSocket is a pure downstream push channel;
   > rolls still go up over HTTP so the per-roll ack that drives the dock's
   > offline state survives intact (§12.3 reason 1, which the switch does not
   > invalidate).
   >
   > **New security consequence, and it is not optional.** A browser applies
   > **no CORS to a WebSocket upgrade** — no preflight, no `Allow-Origin`, no
   > enforcement. Any page anywhere may open a socket to a reachable server, so
   > the `Origin` header is the only gate that exists and the server must check
   > it itself against the §12.9 allow-list. A request with **no** `Origin` at
   > all is a non-browser client (curl, the 12b bridge on loopback) and is
   > allowed, which keeps the campaign code as the single membership model
   > (§11.6). Implemented and unit-tested in `ws.mjs`.
   >
   > **SSE is kept, scoped, and labelled** — it works perfectly over loopback and
   > `curl -N` on it is the fastest way to eyeball a live feed. It is a debugging
   > and bridge affordance, **never** a path a remote dock may take.

   <details><summary>The original SSE failure measurement, kept as evidence</summary>

   🚨 **MEASURED 2026-07-29 — Cloudflare Quick Tunnel does NOT stream SSE.**
   Contrary to the plan's stated expectation, the assumption failed. Headers
   arrive immediately and correctly (`200`, `Content-Type: text/event-stream`,
   `Cache-Control: no-cache, no-transform`) — but the body never does. Confirmed
   with a foreground `curl -N` (ruling out shell/backgrounding artifacts), with
   40 events already sitting in the buffer to replay (ruling out "nothing to
   send"), with a 10-second wait (ruling out a size-threshold flush), and with
   HTTP/1.1 forced (ruling out an HTTP/2 framing quirk). An ordinary buffered
   `GET` on the same server, same tunnel, returns instantly. **The response body
   of a long-lived streamed request is fully withheld — likely full buffering
   somewhere between cloudflared and Cloudflare's edge for the free Quick Tunnel
   product specifically**, which the plan already flagged as "for testing", but
   the *streaming* limitation was not anticipated; only the uptime disclaimer
   was.
   >
   > **This is Eric's decision, not a default to pick alone (§12.11 said so in
   > advance, and that holds):** three live options, none built —
   > - **(a) Plain polling against the table server**, unchanged from the dock's
   >   existing cloud-mode code (§12.10) — already proven fast by point 1. A
   >   2–3s poll interval against a *local* server turns "30s stale" into
   >   "≤3s stale", with **zero new code**: the dock already polls, it would
   >   just point at a different URL. The honest loss: not truly *instant*, and
   >   `lookbackMs: 0` plus a poll cadence reintroduce a small, bounded staleness
   >   the SSE design was meant to remove entirely.
   > - **(b) WebSocket**, the plan's pre-approved fallback (Tunnel documents
   >   WebSocket support explicitly, separately from plain HTTP streaming). Needs
   >   measuring in its own right — nothing here proves WebSocket works either,
   >   only that this specific failure mode doesn't obviously apply to a
   >   different protocol.
   > - **(c) A Named Tunnel** (a domain on Cloudflare, §12.2) instead of Quick
   >   Tunnel — untested here for lack of a domain to point at. Quick and Named
   >   Tunnels share `cloudflared` but not necessarily the same edge path, so
   >   this failure may be Quick-Tunnel-specific rather than fundamental to
   >   Cloudflare Tunnel as a category.

   **Option (b) was taken**, and it is built and measured — see the RESOLVED
   block above. (a) and (c) are moot: (a) is strictly worse than a working push
   channel, and (c) is unnecessary since Quick Tunnel carries WebSocket fine —
   though a Named Tunnel remains the upgrade for a **stable URL** (§12.2), which
   is a separate concern from streaming.

   </details>

3. **KV single-key `get` freshness** for the rendezvous — ⚠️ **the "not deployed"
   note here was stale.** The route is deployed and working: `GET /table/FH2` →
   `200` in **102 ms** with a live record, measured 2026-07-30 22:40 UTC, on a day
   when `/party` and `/feed` were both returning `500` for exhausted `list()`
   quota. That is §12.4's central claim — single-key `get` is the operation KV is
   good at — confirmed under load it was not designed for. **Freshness itself is
   still unmeasured**: how long a *changed* value takes to propagate is a
   different question from whether a read is fast, and only the six-probe method
   settles it. Not on the critical path: the manual URL override (§12.4) reaches a
   working live table without it.
4. **A four-hour soak — PASS WITH RESERVATIONS, 2026-07-31.** The real chain
   `table-server.mjs` → Quick Tunnel → WebSocket held **4:00:02**: 242 probes
   sent and received, zero loss, duplicate, reordering, failed POST or socket
   close. Latency: p50 114 ms, p95 191 ms, p99 298 ms, with one isolated
   10.122 s spike and no associated loss. A reconnecting `?since=` client
   replayed exactly two missed events.
   > The wider failure scope was exercised too: killing the server while leaving
   > `cloudflared` alive produced a tunnel `502` while rendezvous still returned
   > `live:true`. Cleanup then stopped both processes and deleted rendezvous.
   > Sleep/wake was not tested. Full evidence is in the vault logbook `Fate's
   > Hand — Table Server Soak 4h`.

### 12.12 What is deliberately not built

- **No Durable Object, no paid plan.** That option stays documented and available;
  if the tunnel ever proves unworkable it is the fallback, and §11's design still
  drops onto it unchanged.
- **No auto-start of the table server.** The DM starts a session deliberately. A
  daemon that is always up is a machine that is always exposed.
- **No player-side install, ever.** That is the property §11.1 bought and it is
  worth more than any feature that would cost it. Players open a web page.
- **No chat, no presence, no "who is connected" in the dock.** The feed is rolls.
  The table is already on voice.
- **No cross-session archive.** §11.6 stands; the JSONL is a by-product, not a
  feature with a retention policy.
- **No backfill from the cloud into the table server.** Rolls made before the
  table came up are in the backstop and not in the live log, and that is correct:
  the table was not running. Importing them would break the one-writer rule of
  §12.5, duplicate events the mirror is about to write, and put rolls in the DM's
  bridge that predate the session. It will look like a helpful thing to add. It
  is not.

---

## 13. Where the campaign lives (design, 2026-07-30)

> 🟡 **PROPOSED — NOT RATIFIED.** Eric decides architecture; this section is the
> architect's recommendation and the reasoning behind it. Nothing here is built.
> §13.9 is the exception: those fixes are due whichever way the decision goes,
> and one of them is a live outage.

**The question put to this seat:** should the table server become the source of
truth for the whole campaign — characters included — and not merely for the roll
feed?

**The recommendation, in one line: no — but the *hosting* moves, not the
*storage*.** Characters stay in a Worker + KV; what changes is that the Worker
stops being *FHPC's server* and becomes *one campaign's home*, deployable by
whoever runs the table. Plus a local read replica, because the DM asking to read
his own characters offline is a real requirement that does not need the
architecture inverted to satisfy it.

The two arguments that produced the question are both correct and neither is
answered by moving characters to a laptop. §13.5 and §13.6 are where that is
argued rather than asserted.

### 13.1 What the 2026-07-30 outage actually proves

The Worker returned `500` / Cloudflare `1101` on `/party` and `/feed`, logging
`KV list() limit exceeded for the day`. `/table` kept working, because it is a
single-key `get`.

**Verified in source, not inferred:**

| Fact | Where |
|---|---|
| `GET /party/:code` calls `listAllKeys()` on every request | `worker.js:1065` |
| `readFeed()` calls `listAllKeys()` on every poll | `worker.js:1007` |
| the dock polls the cloud feed every **3 s**, 12 s when hidden or quiet ≥2 min | `fh-player-sheet.js:2193`, `2319` |
| the poll runs whenever a character is open in RECENT — the default state | `fh-player-sheet.js:2311–2316` |
| `gh-pages` = *"Deployed 0aad96e"*, and `dbf6072` is an ancestor of it | `git branch -v`, `git merge-base` |

That last row is the missing half of the incident report: **the polling dock is
in production.** It went live with the deploy, and the quota died the next day.

**The arithmetic, and it is not close.** Cloudflare's free plan meters `list()`
separately from reads: 100,000 reads/day but **1,000 `list()`/day** (from
Cloudflare's published free-tier table and the error string itself — not measured
here). One dock polling at 3 s spends **1,200 `list()`/hour**. One player, alone,
with a sheet open: **the entire daily allowance in 50 minutes.**

> ⚠️ **§11.6 counted the operations correctly and compared them to the wrong
> ceiling.** It says, verbatim: *"`GET /feed` costs one KV `list` per poll. At
> five players on a 4h session that is roughly 24k reads — inside the free
> tier."* The count is right — 5 × 4 h × 1,200 = 24,000 — and 24,000 *reads*
> would indeed be inside the free tier. They are not reads. They are 24,000
> `list()` against an allowance of 1,000: **24× over, per session.** One
> mislabelled noun is the whole incident.

**Correction to the framing this design was handed.** The handoff attributes the
burn to `/party`'s `listAllKeys()` *and* to `readFeed`'s. Both do call it, but
the terms are three orders of magnitude apart: `/party` costs one `list()` per
**page load** (a few dozen a day), `/feed` costs one per **3 seconds per open
dock**. The consequence is not academic — **fixing `/party` alone leaves the app
broken.** A campaign index key is worth doing (§13.9) and would have removed the
symptom's most visible route, but the quota would still be gone by lunchtime.

**Measured live while writing this, 2026-07-30 22:40 UTC:**

```text
GET /table/FH2  → 200  {"live":true,"url":"https://institutes-…trycloudflare.com"}
GET /party/FH2  → 500  error code: 1101          ← still down, right now
```

The outage is **ongoing, not historical**, and the KV counters reset at 00:00
UTC — so it will recur every day the deployed dock keeps polling. Two further
things fell out of the same probe, both worth recording:

- The registered tunnel answers **1033** (*Cloudflare cannot resolve this
  tunnel*), and `ps` shows `cloudflared` alive for 33 minutes with **no
  `table-server.mjs` behind it** — an orphaned tunnel and a rendezvous record
  that outlives its server by up to `TABLE_TTL_SECONDS` (15 min, `worker.js:956`).
  A dock in that state reads `live:true`, fails to connect, and shows **OFF** —
  which is §12.5 rule 1 behaving exactly as designed, in the wild, under a
  failure nobody staged. Good news, recorded as such.
- `~/tools/fh-table/data/` is **empty**. The JSONL persistence of §12.7 is built
  and unit-tested but has **never written a byte in anger.** Relevant to §13.7:
  any proposal to put characters on that disk is proposing to trust a path with
  no operational history.

**The verdict this section exists to deliver:** the outage was caused by a code
defect with a known, small fix. It is **not** evidence that hosted storage is the
wrong model, and the architecture decision must not be taken under its shadow. A
laptop running the same 3-second poll against a `list()`-shaped index would have
been equally wrong; it would merely have failed later and more quietly.

### 13.2 The property that decided §12 does not carry to characters

§12 is sound, and it is sound for reasons that are specific to a roll feed. Set
the two workloads side by side and they are near-opposites:

| | The live feed (§12) | Characters, profiles, inventory |
|---|---|---|
| **When is it read?** | during a session, while the DM is present | *between* sessions — a Tuesday tweak, a phone check, the builder at 2am |
| **Mutability** | append-only; events are immutable | mutable records, edited in place |
| **Writers** | one event, one writer, unique id | the player, the DM, the builder, a DDB pull |
| **Conflict model** | dedupe by `id`, keep highest `rev` — merge is free | last-write-wins on a whole record — merge is a real problem |
| **Loss tolerance** | 12 h TTL by design; it is a table log, not an archive | loss is a character sheet gone |
| **Availability needed** | exactly as long as the DM is at the table | always |

Every column that made "put it on the DM's machine" obviously right for the feed
points the other way for characters. The clean statement:

> **The feed moved local because it is ephemeral, append-only, single-writer and
> session-scoped. Characters are none of those four things.** §12's reasoning
> does not extend to them; it has to be re-argued from scratch, and it loses.

The conflict row is the one that would bite hardest and is easiest to
under-estimate. §11 got merging for free because events are immutable and
identified — a dock that sees the same roll twice keeps one line. A character
profile has no such property. Two writers and a mutable record means either a
real sync protocol (versions, vector clocks, conflict UI) or silent loss — and
silent loss is precisely what §2 forbids. **Any local-truth design owes an answer
to "the player edited their sheet while the DM's Mac was off"** and none of the
cheap answers are honest.

> 🔴 **DECIDED AGAINST, 2026-07-31 — Eric ratified a different architecture.**
> §13.3–13.4 below argue for the Worker staying the sole owner of characters.
> Eric considered this and chose otherwise: **his Mac owns the characters and
> becomes the server during a session, exactly like a self-hosted Foundry world**,
> with a cloud copy that players can also **write to** while he is offline (not
> merely read, which was the safer option offered and declined). §13.3–13.4 are
> kept because the risk they name — two writers, a mutable record, silent loss —
> is real and does not go away; it is now a problem §13.13 has to solve rather
> than a problem avoided by not building this. Read §13.13 for the ratified
> design.

### 13.3 The recommendation: three tiers, each holding what suits it — superseded, kept for the risk analysis

**Tier A — the campaign home. Cloud Worker + KV, one per DM. Source of truth.**
Characters, profiles, inventory, campaign codes, the rendezvous record, the feed
backstop. Shape unchanged from today. What changes is ownership: it stops being
*the* FHPC server and becomes *this campaign's home*, deployed by whoever runs
the table into their own Cloudflare account (§13.5).

**Tier B — the table server. Local, while the session runs.** Source of truth for
the live feed, exactly as §12 built it, unchanged. **Plus a read-only replica** of
the home's characters, refreshed on start and on demand. The replica exists so the
DM can read his own sheets with the cloud unreachable — which is his stated
requirement, satisfied without inverting anything. **The table server never
accepts a character write.** One writer stays one writer.

**Tier C — the DM's archive. Plain files on the DM's disk, always.** The replica
*is* the archive: a directory of JSON, one file per character, plus the roll
JSONL §12.7 already writes. Readable with `cat`, greppable, backed up by whatever
already backs up that machine, and useful when FHPC itself is not running.

The layering rule that keeps this honest, and it is one sentence:

> **Tier A is the only writer of characters. Tier B and Tier C are copies that
> know they are copies, and say so.** A replica older than its home is labelled
> with its age, never silently served as current.

### 13.4 The options, and why the other three lose

**Option 1 — local server is the whole source of truth, cloud deleted.**
*Rejected.* It makes the character sheet unavailable whenever the DM's machine is
off, which is most of the week; it destroys the "players install nothing and it
just works" property §12.12 calls worth more than any feature; it makes the DM's
disk a single point of failure for the campaign; and it does not actually remove
the cloud (§13.6). This is Foundry's shape, and players-cannot-see-their-sheet is
Foundry's best-known complaint, not an incidental one.

**Option 2 — local is truth, cloud is a mirror.**
*Rejected, and it is the tempting one.* It reads like §12.6's mirror applied one
layer up, but the mirror worked because events are immutable and id-addressed.
Mirroring mutable records means the copy can be edited too, and then you own a
sync protocol — versions, conflict detection, a UI for "these two disagree". That
is a large, subtle system, and the failure mode of getting it slightly wrong is
**silently losing a player's edits**, which §2 forbids more strongly than it
forbids anything else.

**Option 3 — status quo: Eric's Worker hosts every table.**
*Rejected on Eric's reasoning, which is correct.* He would pay for strangers'
storage and quota, their traffic would take his campaign down (the free tier is
small enough that this is not hypothetical — see §13.1), and he would be
custodian of other people's data. Additionally, and this is worth stating
because it is invisible from the outside: **`GM_TOKEN` is a single global secret**
(`worker.js:177`). One token authorises listing every campaign, downloading every
build, and cascade-deleting any campaign with its characters and profiles
(`worker.js:1559–1573`). There is no per-campaign authority. A second DM on this
Worker is not "multi-tenant with rough edges" — it is **every tenant holding root
on every other tenant.**

**Option 4 — the home is a deployment, not a service. ✅ Recommended.**
Another DM runs `wrangler deploy` into their own free Cloudflare account with
their own KV namespace and their own `GM_TOKEN`. They get their own quota, their
own bill (zero), their own data, their own root. Eric's Worker holds Eric's table
and nothing else. Foundry's ownership property — *your data is on hardware you
control* — obtained without Foundry's availability cost, because a Worker is up
when the laptop is not.

### 13.5 What "another DM uses FHPC" actually costs under Option 4

Concretely, for the second DM:

1. A free Cloudflare account, one KV namespace, `npx wrangler deploy` — the
   Worker is a single file with no build step.
2. `wrangler secret put GM_TOKEN`.
3. A campaign code, created through their own `gm.html` against their own Worker.

That is more setup than "Eric adds you to his server" and dramatically less than
"install Node and keep a server running whenever your players want to look at
their sheet". It is also the same order of effort as installing Foundry, for a
strictly better availability story.

**The one thing that must be true for any of this, and it is small:** the site
must not hard-code one origin. Today it does, in **seven places** — `docs/javascripts/fh-player-sheet.js:7`,
`fh-gm.js:4`, `docs/gm.html:122` and `:208`, `docs/skill-builder.html:1506`,
`docs/party-inventory.html:86`, `docs/soulforge-tool.html:223`. The dock's is the
easy one: it flows through exactly **one** helper, `api()` at
`fh-player-sheet.js:181`, so redirecting the dock is a one-line change behind a
single choke point. This is the only structural work Option 4 requires, and it is
worth doing **now** even though there is no second DM, because it is what keeps
the door open at near-zero cost.

**How a player reaches the right home — and what is deliberately deferred.**
Two answers, and the recommendation is the cheaper one:

- ✅ **The second DM forks the site too.** `mkdocs gh-deploy` onto their own
  GitHub Pages, one constant changed. Their players get a URL from their DM, as
  they already do. Eric holds *nothing* for them — no record, no traffic, no
  liability. Recommended, because it is the only option with zero ongoing
  obligation on Eric.
- ⏸️ **A public campaign directory on Eric's Worker** (`GET /home/:code →
  {api}`), so every table can keep using `noirchicot.github.io`. Elegant, one
  tiny KV `get` per session per player, and Eric stores a pointer rather than
  data. **Deferred deliberately:** it makes Eric a directory operator, it needs
  a host allow-list or it becomes a way to point somebody's dock (and their
  character data) at an arbitrary origin, and there is no second DM yet. Named
  here so it stays a config decision later rather than a redesign.

### 13.6 The deposit point — the argument that closes the question

The handoff asks whether the builder needs "a drop-off point that exists when the
DM's machine is off". Under the recommendation the question dissolves: the
builder POSTs to the campaign home, which is where characters live anyway. No
special surface, no second store.

Under a local-truth model it does not dissolve — it multiplies. Local-truth still
needs, in the cloud:

1. a deposit box, so `POST /builds` works at 2am;
2. the rendezvous, so a dock can find the tunnel (§12.4 — already true today);
3. somewhere for players to read their sheets between sessions, or the app is
   session-only.

> **Local-truth does not remove the cloud. It replaces one cloud store with a
> laptop plus two or three cloud surfaces, and adds a sync protocol between
> them.** That is the whole argument in one sentence, and it is why the answer to
> the question as put is *no*.

### 13.7 Persistence, backup, and the dead-disk question

Asked directly: *characters must not be lost — what storage, what backup, what
happens when the DM's disk dies?*

**Under the recommendation the question inverts, and that is the point.** The
truth is in KV, which Cloudflare replicates; a dead laptop costs the DM a replica
he re-downloads in one command. Nothing about the campaign is at risk. Under
local-truth the same dead disk costs the campaign, unless the DM has maintained
a backup discipline — and DMs do not, which is exactly why hosted VTTs exist.

What Tier C is, concretely, when it is built:

- **`~/fh-archive/{CODE}/{pseudo}.json`** — one file per character, rewritten on
  every replica refresh, `.tmp` + `rename()` so a crash mid-write cannot truncate
  a sheet. Plain JSON, identical to what `GET /party/:code/:pseudo` returns, so it
  is re-importable by `POST /builds` with no transform.
- **`~/fh-archive/{CODE}/feed-YYYY-MM-DD.jsonl`** — where §12.7's session log
  already goes, moved out of the repo's `data/` directory so a `git clean` cannot
  take the transcript with it.
- **Backup is whatever already backs up that directory.** Time Machine covers it
  by default; the DM chooses. The archive is deliberately plain files precisely
  so no FHPC-specific backup tool has to exist.
- **`node table-server.mjs FH2 --offline`** — serve the replica and the archive
  with no tunnel, no rendezvous, no cloud. This is the answer to *"MJ sur son
  propre Mac doit pouvoir consulter ses persos sans dépendre d'un cloud"*, and it
  is perhaps forty lines on top of what exists.

**Named honestly:** the replica is only as fresh as its last refresh, and a
replica served without its age stated would be exactly the silent divergence §2
forbids. Every offline read is captioned with the refresh timestamp, in the same
spirit as LIVE/RECENT/OFF — *"local copy, synced 2 h ago"*. A stale copy that
says so is useful. A stale copy that does not is a bug that looks like a feature.

### 13.8 What changes in the dock

Almost nothing, which is a good sign for a design.

- `API` (`fh-player-sheet.js:7`) becomes resolved rather than literal: a build-time
  constant with a `localStorage`/query override for development. One choke point
  (`api()`, line 181) means one edit.
- **No change to the three states.** LIVE/RECENT/OFF describe the *feed*, and the
  feed's design is untouched by any of this.
- **No new state for characters.** They come from the home or the request fails
  loudly, as today. The replica is the DM's offline reader, not a fallback the
  players' dock may silently take. If a session ever does lose the cloud
  mid-game, the escalation is a labelled read-through on the table server — a
  designed-not-built item (§13.12), not a thing to add speculatively.

### 13.9 The fixes that are due regardless of the decision

These are not part of the architecture question. **One of them is a live
outage** and should not wait for a ratification.

1. **Stop the dock polling the cloud feed.** This is the whole quota. RECENT
   should load the backstop **once when the TABLE zone is opened**, plus an
   explicit refresh — not every 3 seconds. It is also the *honest* cadence:
   §11.4 already established the cloud feed is ~27 s stale, and polling a 27 s
   source every 3 s was never buying anything. Note that slowing the poll is
   **not** sufficient: even 60 s costs 1,200 `list()`/day for five players over
   four hours, still over the 1,000 allowance. The periodic `list()` has to go,
   not shrink.
2. **`/party/:code` reads a maintained index key** — `party:{CODE}` →
   `[{pseudo, updatedAt}]`, written on `POST /builds` and on admin delete.
   `campaign-index` (`worker.js:88`) is the precedent; this is the same move.
   Removes `list()` from the most-loaded public route.
3. **Leave the `/admin` listings alone** — they are DM-driven and infrequent. The
   rule to write down is narrower and permanent: **no `list()` on any path a page
   can call on a timer.**
4. ⏸️ **A single-key cloud backstop becomes possible, and is worth noting rather
   than building.** The per-event key design (§11.4) exists because five browsers
   wrote the feed concurrently and KV allows ~1 write/s per key. Since §12, there
   is exactly **one** writer to the cloud feed — the table server's mirror. One
   writer can coalesce into `feed-recent:{CODE}`, making `GET /feed` a single-key
   `get`: no `list()`, and no 27 s index lag either. The catch is that RECENT-mode
   docks still post directly when no table is running, which reintroduces
   concurrent writers; resolving that means deciding what the backstop is *for*
   when nobody is at the table. Designed, not built, and not urgent once fix 1
   lands.

**Suggested order:** 1 today (it is an outage), 2 next, then ratify §13, then
Tier B/C. Fix 1 is a dock change and a deploy; fix 2 is a Worker change and a
deploy Eric runs.

### 13.10 Migration, and the rollback in both directions

**If Option 4 is ratified, there is no data migration.** Nothing moves. The work
is: parameterise the origin (§13.5), build the replica and archive (§13.7),
document the deploy. Every step is independently revertable and none of them
touch stored data. That is a genuine argument in its favour: **the recommended
architecture is reachable without a migration**, and any design that requires one
should have to beat that.

**If Eric chooses local-truth instead**, the order matters and is written here so
the choice is informed rather than discovered:

1. **Export first, verify, keep.** `GET /builds` + `/party/:code/:pseudo` +
   `/profile/:code/:pseudo` for every character, to files. Verify by count and by
   round-tripping one character through `POST /builds` into a scratch campaign.
2. **Run both, cloud still authoritative, for at least two sessions.** The local
   store is read-only and compared against the cloud after each session. Any
   divergence at this stage is a design flaw surfacing cheaply.
3. **Flip the writer**, one route at a time, `/profile` last — it has the most
   writers (player, DM, DDB pull) and is where conflicts will appear first.
4. **Keep the cloud readable for a month**, then delete deliberately.
5. **Rollback** is re-pointing the dock's `API`, at any point up to step 4, which
   is why step 4 waits a month.

Non-negotiable in either direction: **no step deletes cloud data until a local
copy has been read back and verified**, and no step leaves two writers on the
same record — that is the state where losses happen silently.

### 13.11 Measured vs assumed

**Measured (2026-07-30, this session):**
- `/party/FH2` → `500` / `1101` at 22:40 UTC. The outage is current.
- `/table/FH2` → `200` in 102 ms with a live record. Single-key `get` is
  unaffected by the exhausted `list()` quota, as §12.4 predicted.
- The registered tunnel → `1033`; `cloudflared` alive 33 min with no
  `table-server.mjs`. Stale rendezvous → dock shows OFF: §12.5 rule 1 confirmed
  under an unstaged failure.
- `~/tools/fh-table/data/` empty — the JSONL path has never run in anger.
- Source-verified: `worker.js:1065`, `1007`, `177`, `1559`; `fh-player-sheet.js:7`,
  `181`, `2193`, `2319`; seven hard-coded origins; `gh-pages` deployed `0aad96e`.

**Assumed, and each carries its label:**
- **The 1,000 `list()`/day free-tier figure** comes from the logged error and
  Cloudflare's published limits, not from a probe here. The *shape* of the
  conclusion (a 3 s poll is untenable against a per-day allowance three orders of
  magnitude smaller than the poll count) survives even if the number is off by a
  factor of a few.
- **Nobody has measured KV read latency for a `get`-shaped `/party`.** Fix
  §13.9.2 is expected to be fast because `/table` is; expected, not measured. The
  same six-probe method that condemned `list()` settles it, and should.
- **The replica refresh cost is unmeasured** — a full party fetch is a handful of
  `get`s, which should be trivial, but "should" is the word §12.11 exists to
  distrust.
- **No second DM has ever deployed this Worker.** The claim that `wrangler
  deploy` into a fresh account is a ten-minute job is an assumption until someone
  does it once, start to finish, from the written instructions.

### 13.12 What is deliberately not built

- **No sync protocol.** Tier A writes, Tiers B and C copy. The moment two tiers
  can write the same record, this section's cheapest property is gone.
- **No write-through proxy on the table server.** A dock whose home is
  unreachable fails loudly, as today. If a real session loses the cloud mid-game,
  the escalation is a labelled outbox — designed then, on evidence, not now on
  speculation.
- **No campaign directory on Eric's Worker.** §13.5: a second DM forks the site.
  Revisit when there is a second DM, not before.
- **No per-campaign GM tokens on Eric's Worker.** Under Option 4 each home has
  exactly one DM, so a single token is the right granularity. This stops being
  true the instant two DMs share a Worker — which is precisely the arrangement
  Option 4 exists to avoid.
- **No account system, ever.** The join code is the membership model (§11.6) and
  survives untouched. Self-hosting is what replaces accounts, not the reverse.
- **No archive UI.** Tier C is files. A folder of JSON that `jq` can read is worth
  more than a viewer, and Eric's existing pipelines (*Journal de campagne PDF*,
  *Réécriture littéraire*) already consume exactly this shape.

---

## 13.13 Eric's ratified decision, and the design it requires (2026-07-31)

> ✅ **DECIDED — overrides §13.3/§13.4's recommendation.** Eric's own words: *"je
> veux que mon ordinateur soit propriétaire des fichiers, qu'il se transforme en
> serveur durant la partie — idem Foundry — et qu'une copie des éléments soit sur
> le cloud pour être utilisée par les joueurs lorsque je suis hors connexion."*
> Asked directly whether that cloud copy should be read-only or writable while he
> is offline — because the answer decides whether this needs a sync protocol at
> all — **he chose writable.** That closes off the cheapest version of this
> design (§13.3's "Tier A is the only writer") and reopens exactly the risk
> §13.4 raised against Option 2: a mutable record with two possible writers.
> **This section is the design for making that safe, not an argument against it.**
> Nothing below is built yet.

### 13.13.1 The shape, restated in the vocabulary already in this plan

- **The DM's Mac is the owner.** While the table server (§12) is running, it holds
  the authoritative character documents for its campaign — not just the live roll
  feed. Same program, wider job.
- **The cloud Worker + KV holds a copy that accepts writes.** Players read and
  write their own characters there — build, level-up, profile edits — through the
  existing `/builds` and `/profile/:code/:pseudo` routes, unchanged in shape.
  This is what makes "hors connexion" actually mean something: today's `/builds`
  and `/profile` already work with no table server running, because §12 never
  touched them (§12.1's table). Nothing here removes that.
- **The two must reconcile**, because both can now be written to. This is the
  part that has to be designed, and Foundry's own shape does not answer it —
  self-hosted Foundry has exactly one server, ever; it never had this problem to
  solve. Eric is asking for something a stock self-hosted VTT does not do:
  own the data **and** stay writable while offline. That combination is why a
  reconciliation rule is unavoidable, not optional polish.

### 13.13.2 The rule: one active writer per record, enforced by a revision number

Not a merge system, not a CRDT, not real-time collaborative editing on the same
sheet. A single rule, already proven in this project at smaller scale:

> **§12.5 rule 2 says "one writer at a time" for the roll feed. The same rule
> governs characters — it just has to be enforced per-record instead of
> per-campaign, because who the writer is can differ character by character.**

Every character document carries a `revision` counter (this is not new — the
ChatGPT audit already sketched exactly this field in `fh-character/2`, §2 of
that document, independently arriving at the same primitive: optimistic
concurrency by revision number is the standard, boring answer to this problem,
which is a point in its favour, not against it).

- **A write must state the revision it is based on.** `POST /profile/:code/:pseudo`
  (or the table server's equivalent route) includes `{ revision: N, ...patch }`.
- **The store accepts the write only if `N` matches its current revision**, then
  stamps `N+1`. If it does not match, the write is **rejected with `409
  Conflict`**, not silently applied and not silently dropped. The caller is told
  *"this character changed elsewhere since you loaded it"* and must reload before
  retrying — the same shape as any optimistic-locking system (this is not a novel
  invention, it is the standard fix for exactly this problem).
- **This is enough because true simultaneous editing of the same sheet is not the
  real case here.** The real case is *alternating* access: a player edits at home
  on Tuesday (cloud is the only thing up), the table server starts Thursday and
  has to catch up, or the DM tweaks a profile at the table and a player checks
  their phone between fights. A conflict — two edits to the *same* character
  landing within the same short window with neither side having seen the other —
  is rare, and rejecting it loudly is the honest answer, not preventing it from
  ever being possible.

### 13.13.3 Who is authoritative when, and the handoff between them

- **Table server not running:** the cloud Worker is the only thing there is.
  Every write lands there, bumps the revision, done. This is exactly today's
  behaviour — §12 never changed it and this does not either.
- **Table server starting up:** before it will call itself ready, it pulls the
  current `party`/`profile` records for its campaign from the cloud and adopts
  their revisions as its own starting point. **This is the step that makes the
  ownership claim honest** — a table server that started from a stale local copy
  and began overwriting would be exactly the silent-loss failure this whole
  section exists to prevent. Modelled directly on how the roll feed's replay
  already works (§12.7): pull the tail, then go live.
- **Table server running:** it is now the writer players in LIVE mode reach
  (mirroring the roll feed's own LIVE/RECENT split, §12.5) — but unlike the feed,
  **the cloud path is not turned off**. A player who is not connected to the
  table server (phone on data, table server unreachable, or simply not a player
  at tonight's session) still hits the Worker directly, and the Worker still
  accepts their write, bumping its own revision. The table server's mirror
  (§12.6, already built for feed events) extends to character writes: every local
  write is pushed to the cloud immediately, carrying the revision forward on both
  sides in step. **A write on either side that races the other loses the 409, not
  the data** — the rejected caller reloads and reapplies, exactly §13.13.2.
- **Table server stopping:** nothing extra to do. Because every local write was
  already mirrored as it happened (same discipline as §12.6's roll mirror,
  "never batched, one POST per event"), the cloud is caught up the moment the
  last mirror call lands. There is no "sync back" step separate from ordinary
  operation — this is what makes the design cheap.

### 13.13.4 What a player or the DM actually sees on a conflict

§2's rule applies here exactly as it does everywhere else in this plan: **never
fail silently.** A `409` is not an error to swallow — it is shown, plainly:

> *"Cette fiche a été modifiée ailleurs depuis ton dernier chargement. Recharge-la
> avant de renvoyer tes changements."*

with a reload action attached. This is more friction than silent overwrite and
less harm than silent loss — the honest trade §2 has made everywhere else in this
project (the three feed states, the outage caption, the OFF state that never
slides to RECENT). No auto-merge is attempted; a conflict is rare enough at this
table's scale that asking a human to look is the right amount of engineering.

### 13.13.5 What this changes about §13.3–§13.9, concretely

- **§13.5's "another DM forks the site" still holds** — this section is
  orthogonal to who owns the Worker. A second DM under this design still runs
  their own Worker and their own table server; the reconciliation rule is the
  same either way.
- **§13.7's Tier C (plain-file archive) is unaffected in shape, changed in
  role.** It stops being merely a read-only convenience and becomes the actual
  local copy of the owner's data — still plain JSON files, still `.tmp` +
  `rename()`, still backed up by whatever already backs up the DM's Mac. What
  changes: it needs the `revision` field written alongside each character so a
  restarted table server can resume from where it left off without re-fetching
  everything from the cloud on every boot.
- **§13.9's fixes are still due first, unchanged.** The `list()` quota outage
  does not care which side owns the data — it is caused by a 3-second poll on a
  route this design does not touch. Fix it before building any of this.
- **§13.4's Option 1 and Option 2 analysis is not wasted** — it is what told us
  the shape of the actual risk (mutable record, two writers, silent loss is the
  failure mode to guard against) that §13.13.2 now answers directly instead of
  avoiding.

### 13.13.6 Measured vs assumed

**Assumed, not yet measured, and worth naming before building:**
- **How often a real conflict will actually happen.** The claim in §13.13.2 that
  simultaneous edits to the same sheet are rare is a judgment about how this
  table plays, not a measurement. If it turns out wrong — players editing
  profiles constantly while the DM is also at the keyboard — the honest fix is
  still not silent merge; it would mean revisiting whether `revision` should be
  scoped more finely than "the whole profile document" (e.g. per-field), which is
  a real redesign, not a tuning knob.
- **Whether the table server can reach the Worker reliably enough to mirror
  character writes the instant they happen**, the same way it already does for
  roll events. No reason to expect otherwise — it is the same network path
  already proven for the feed mirror — but not yet run against this workload.

### 13.13.7 What is deliberately not built

- **No field-level merge.** A conflict rejects the whole write. Splitting
  `revision` per field is a redesign to reach for only if §13.13.6's assumption
  about conflict frequency turns out false.
- **No offline queue on the player's own device.** If a player's browser cannot
  reach the Worker at all (not just "table server down" — the Worker itself
  unreachable), the write fails loudly, as every write in this project already
  does when its destination is unreachable. Queuing writes for later delivery is
  a distinct, larger feature and is not assumed here.
- **No automatic conflict resolution UI beyond "reload and reapply."** A richer
  diff-and-merge view is a real feature someone could want later; it is not
  cheap, and the plain rejection above is the §2-honest minimum, not a stopgap
  apologized for.

### 13.14 Operational validation and two client-chain corrections (2026-08-01)

The first real character-ownership edit used Yedrivel. AC 15→16 reached the
table server and was persisted, but the next dock write showed a false conflict.
The server's optimistic locking was correct; the client failed to adopt the new
revision because `/profile` returns `{profile:{revision}}`, while the dock read
`response.revision`.

- `4e36c63` normalizes the response shape in `profileWrite()` and `loadBuild()`
  and adds the two-successive-saves regression case.
- Review then found a separate existing gap: `skill-builder.html` sent
  `POST /builds` without any revision, making its second send always 409.
  `207f597` remembers the last successful revision per campaign+pseudo, sends
  it, and never retries a real conflict.
- Both were independently verified from separate clones: all **11** suites pass
  and `mkdocs build --strict` succeeds.
- Both are pushed on `origin/main` at `207f597` and deployed on `gh-pages` at
  `5889eac`; the served files were fetched back and checked with a cache-buster.

**Safety held during the failure:** no stale client write was accepted and no
character data was silently overwritten. Yedrivel was restored to AC 15 after
the failed trial.

**Final gate — PASSED 2026-08-01:** the deployed client was exercised against a
real LIVE table server and Cloudflare Tunnel. Yedrivel advanced AC 15→16, saved,
then 16→15 and saved again without any conflict modal; a full page reload returned
AC 15. The local table archive and the cloud Worker both then reported revision
18 and AC 15. The server, tunnel and rendezvous were cleaned up (`live:false`).
The Mac-owned character path is operationally validated; package 12b is next.

**Known rough edge, not data loss:** if Skill Builder's local revision storage is
lost while the server already has that build, the server safely returns 409 but
the builder has no guided recovery/explicit replacement workflow yet. Design
that only if it occurs in real use; never solve it with blind fetch-and-retry.
