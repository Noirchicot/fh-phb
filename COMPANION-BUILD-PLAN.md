# Player Companion — build plan (belt, tarot, AboveVTT)

Working document for a multi-chat build. Any chat should be able to start from
this file alone, without the conversation that produced it.

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
| 4 | **AboveVTT bridge.** Research first — how AboveVTT ingests external rolls (postMessage? custom event? its chat API?), then send the Companion's resolved rolls into it. | Sonnet · high, research-first | new `fh-abovevtt.js` | 1 |
| 5 | **Features panel** — abilities, traits, feats, with a real per-rest/per-day tracker. | Sonnet · high | `fh-panel-features.js` | 1 |
| 6 | **Actions panel** — Action / BA / Reaction, clickable rolls, `showsRoller: true`. | Sonnet · high | `fh-panel-actions.js` | 1 |
| 7 | **Spells panel** — list, slots, clickable casts. | Sonnet · high | `fh-panel-spells.js` | 1 |
| 8 | **Notes panel.** | Sonnet · medium | `fh-panel-notes.js` | 1 |
| 9 | **Bug hunt.** Adversarial pass over the roll engine and destiny/chaos/awakening state machine. | Opus · high | tests/ | after a few land |

Inventory already has a working pop and a party-inventory tool; package 1 wires it
to a belt tab rather than rebuilding it.

---

## 6. Open questions — Eric decides

1. **The Brick.** The website describes it narratively (a shard shaped once, through
   a story or song, seeding White Void). To put it in the Companion it needs a
   mechanical shape: is a Brick a *tracked token* the dock just holds and displays
   until the GM rules on it, or does it have dice/points behaviour of its own?
   The narrative version is codeable today as a badge; the mechanical version is not
   yet written anywhere.
2. **How many temporary Destiny Points does a Minor draw grant?** The Major draw is
   pinned at +1 Score / +10 temp Points. The Minor number is not in the chapters.
3. ~~**Card art.**~~ **Decided (2026-07-27):** ship **Rider–Waite–Smith** (1909,
   public domain) first — recognisable, legally clean for a paid product. It is a
   placeholder deck, not the destination.
   **Then a custom Fate's Hand deck**, generated externally (ChatGPT image prompts,
   written by the architect chat) from the world canon:
   - the **Saints d'AvA** are already the 22 Major Arcana, one saint per card —
     `2. World/Cosmologie/Panthéons/Saints d'AVA/Saints d'AVA.md` in the vault
     (0 En-Zalûm the Void-Walker → XV Karagall the Soul-Devourer → XXI Va-Enki the
     Perfect Unity). Sumerian-flavoured naming, each with a title and a descriptor.
   - `Handout, Saints d'AVA.jpg` in that folder is the existing visual reference.
   - world/lore sources: `2. World/` (cosmology, pantheons, the Primordial Forces).
   Because the custom faces drop into the same slots, **package 2 must key cards by
   numeral, never by filename**, so the deck can be swapped wholesale later.

   > ⚠️ **State the `{NUMERAL}.jpg` convention in the art brief BEFORE the deck is
   > generated.** Raised by the tarot chat, and it is right: art now falls back to
   > the numeral when an image 404s, which is good for a missing card and bad for a
   > mis-named delivery — 22 wrongly-named files would render as 22 gold numerals on
   > brown and break nothing visibly. The filenames are `0.jpg`, `I.jpg`, `II.jpg` …
   > `XXI.jpg` (Roman, uppercase, matching `card.numeral` in `arcana.js`), and the
   > Saints d'AvA map one saint per numeral, so the brief must carry the numeral —
   > not the saint's name — as the filename.

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
