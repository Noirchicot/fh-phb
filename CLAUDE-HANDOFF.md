# Fate's Hand — Combined Player Companion handoff

## Goal

This delivery combines the strongest parts of two interface concepts:

- **Player Companion architecture:** a dedicated, compact character cockpit designed to sit beside a VTT and D&D Beyond at roughly 360–520 px wide.
- **Professional tool shell:** full-screen tools, consistent navigation, readable controls, keyboard search, clear focus states and reduced-motion support.

The product is an easy rules reference first. It should make Fate's Hand character creation easy and keep the player's Fate's Hand-only information—especially Soulforging skills and inventory—one click away.

## Implemented information architecture

The homepage has three primary entrances:

1. **Create a character** → the guided level-1 builder.
2. **Open Player Companion** → the at-table character/Soulforging cockpit.
3. **Browse the rules** → task-oriented reference cards and indexed search.

The compact play loop is:

**Character → Inventory → Soulforge → Rules**

## Interactive Player Sheet — current implementation

The dedicated Player Companion has now been rebuilt as an active, D&D Beyond-inspired sheet rather than a collection of small accordions.

- `docs/player.md` contains the minimal application mount.
- `docs/javascripts/fh-player-sheet.js` owns the active sheet, rolls, Destiny state and contextual panels.
- `docs/stylesheets/player-sheet.css` owns its responsive visual system.
- `tests/player-sheet.test.js` verifies the canonical 26-skill list, Destiny slots, roll arithmetic and purchased-tool filtering.

Wide screens use a persistent left sheet and independently scrolling right activity panel. The skill board is **9 + 9 + 8 skills**, followed by a fourth column containing **only tools with an invested tier**. All four columns stay on the same horizontal band at desktop and VTT-side widths; the artificial “Skills 1/2/3” headings were removed. Only phone widths below 420 px reduce this to two columns.

Every ability, save, skill and purchased tool supports:

- Main click → immediate flat d20 roll.
- Small gear → advanced Roll Console.
- Disadvantage / Flat / FH +2 / Advantage.
- Guidance d4, configurable Bardic die, an available Destiny die, manual modifier and optional DC.
- Immutable stored d20s. Reopening a history entry can adjust additive bonuses and roll newly added bonus dice, but can never reroll or replace the original d20.
- `Repeat setup` creates a genuinely new roll from the old configuration.

The last five rolls remain visible; up to twenty are persisted. A permanent animated Dice Tray replaced the unused Prepared Magic/Soulforging Spells card, so the most recent result is visible even while the advanced console is closed. Destiny confirmation, the Natural-1 choice, the scary 2d6 Chaos result and Arcane Awakening all replace the contents of this same tray instead of opening unrelated overlays elsewhere on screen. Natural 20, Natural 1, Destiny critical success/failure, overreach and Arcane Awakening have dedicated visual states.

Destiny has separate editable **Maximum Score** and **Current Points**, automatic lowest-missing-die recovery on an even Points total, Long Rest +1 and direct full-die rolling. Dice of the same size are grouped as `×2`/`×3` (hard maximum three); the small −/+ controls correct the pool without rolling. Every Destiny use requires a confirmation explaining its possible score effects. A maximum Destiny die result costs only 1 Point and becomes a critical success; a result of 1 grants 1 Point and becomes a critical failure.

A natural 1 immediately asks **“Do you accept your fate?”**:

- Yes keeps the critical failure and grants +1 Destiny Point.
- No preserves the original 1 in history but transforms the kept result to 20, recalculates the total, sets Destiny to 0 and opens a separate animated 2d6 Chaos result.

A natural 20 has its own animation; if its −1 Destiny Point change reaches exactly 0, a dedicated Arcane Awakening overlay appears. A maximum result on a Destiny die is not treated as an Arcane Awakening.

The right-side panels provide the Soulforging Loop, a campaign inventory summary and Soulforge preparation while preserving links to the full-screen inventory and workshop.

### Player-state persistence

The sheet writes these profile properties through the existing profile endpoint:

- `destinyState`
- `rollHistory`
- `rollPrefs`

It also writes the same state to local storage under `fh-player-v2:{campaign}:{character}`. This is an intentional safety fallback: the sheet remains persistent on the current device if a deployed Worker version rejects new profile properties. For cross-device persistence, ensure the production Worker preserves these three fields when merging a profile patch.

Standalone tools use a shared navigation shell. On desktop it is a sticky top bar; at 760 px and below it becomes a five-item bottom dock so the page remains useful beside a VTT.

## Important routes and files

- `docs/index.md` — simplified homepage and rules map.
- `docs/player.md` — dedicated Player Companion page.
- `docs/javascripts/fh-mychar.js` — character cockpit, DDB sync UI, level-up overlay and Soulforging skill calculations.
- `docs/stylesheets/extra.css` — handbook and Player Companion styling.
- `docs/stylesheets/tool-ui.css` — shared standalone-tool navigation, accessibility and responsive polish.
- `docs/skill-builder.html` — guided character creation.
- `docs/party-inventory.html` — shared campaign inventory.
- `docs/soulforge-tool.html` — Soulforge workbench.
- `docs/stat-roller.html` — ability score roller.
- `docs/gm.html` — DM Control UI for campaigns, DDB imports, sync, deletion, downloads and loot.
- `WORKER-ADMIN-API.md` — exact authenticated Worker routes required for campaign CRUD and first-time DDB import.
- `docs/builder.md`, `docs/inventory.md`, `docs/soulforge.md`, `docs/dice-roller.md` — query/hash-preserving redirects to full-screen tools. Do not replace these with iframes.
- `site/` — deploy-ready static build generated from this source.

## D&D Beyond pull: preserve this contract

The browser must never fetch D&D Beyond directly. `fh-mychar.js` sends the link to:

`https://fh-builds.noirchicot.workers.dev`

The current production flow was verified against Marf's public D&D Beyond sheet before this combined delivery. The deployed Worker follows redirects and permits a 30-second upstream response. Its source is not part of this static-site repository.

Front-end behavior that must remain intact:

- Accept a bare numeric ID, a public character URL or a Shareable Link.
- Validate the exact `dndbeyond.com` host over HTTPS parsing.
- Convert the input to `https://www.dndbeyond.com/characters/{numeric-id}`.
- Store/use the numeric character ID for later syncs; do not persist share tokens.
- Send the initial URL as `{ "shareUrl": canonicalUrl }` to the Worker's `/profile/{campaign}/{character}/pull` endpoint.
- Keep actionable 403/404/timeout messages and re-enable the UI by re-rendering after failure.

If pull fails after deployment, check the production Worker and D&D Beyond sheet visibility before changing this client contract.

### First-time DDB import and DM Control

The player-sheet Pull button can sync/link DDB **after a campaign character record already exists**. It cannot safely create a brand-new campaign character from the static browser alone.

`docs/gm.html` now provides the complete DM-facing interface, including a small `DM` entry on the homepage. Existing build listing/download and loot work with the current Worker. Campaign creation/deletion, first-time DDB import, DM-triggered resync and character deletion intentionally call authenticated `/admin/*` endpoints. The deployed Worker source is absent from this repository, so Claude must implement `WORKER-ADMIN-API.md` in that Worker and redeploy it. The UI reports this missing backend explicitly on 404/405/501.

## Design rules for the next pass

- Optimize the Player Companion at 390 px first, then desktop.
- Keep character identity, level/PB, core abilities and the four Soulforging steps visible with minimal scrolling.
- Keep **Identify, Harvest, Prepare and Soulforge** collapsible.
- Keep inventory and Soulforge as full-screen tools; avoid nested scrolling and iframes.
- Prefer dense, readable dark-fantasy panels over large decorative surfaces.
- Keep touch targets around 40–44 px and preserve visible keyboard focus.
- The normal D&D Beyond sheet remains the source for standard D&D data; this site owns the Fate's Hand layer.

## Build and verification

Fresh environment:

```bash
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
./.venv/bin/mkdocs build --strict
```

Local preview:

```bash
./.venv/bin/mkdocs serve
```

GitHub Pages deployment:

```bash
./.venv/bin/mkdocs gh-deploy --force
```

Before changing behavior, also run JavaScript syntax checks for `docs/javascripts/fh-home.js` and `docs/javascripts/fh-mychar.js`, then test the builder, Player Companion, inventory and Soulforge at 390 px and desktop widths.
