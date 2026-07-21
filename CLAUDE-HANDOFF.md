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
- `tests/player-sheet.test.js` verifies the canonical 26-skill list, generalized import normalization, AC fallbacks, Destiny slots, roll arithmetic, tray limits and purchased-tool ordering.
- `tests/player-sheet.integration.test.js` performs a DOM click-through of the advanced roller and proves that mode changes preserve bonus controls and history edits preserve the original d20s.

Wide screens now use three areas: a narrow persistent navigation rail, the scrolling character sheet, and an independently scrolling temporary panel. The rail opens Inventory, Soulforging Loop, Soulforge, manual corrections and Rules. Campaign/Character/Load are collapsed at the top of the temporary panel. The character content order is Identity → Characteristics → Skills → horizontal Destiny → Roll Workbench. The skill board is **9 + 9 + 8 skills**, followed by a fourth column containing **only tools with an invested tier**, always sorted in canonical Fate's Hand order rather than import order.

Every ability, save, skill and purchased tool supports:

- Main click → immediate flat d20 roll.
- Small gear → advanced Roll Console.
- Disadvantage / Flat / FH +2 / Advantage.
- Guidance d4, configurable Bardic die, an available Destiny die, manual modifier and optional DC.
- Immutable stored d20s. Reopening a history entry can adjust additive bonuses and roll newly added bonus dice, but can never reroll or replace the original d20.
- `Repeat setup` creates a genuinely new roll from the old configuration.

The Roll Workbench has three permanent zones: **Roll Console / animation + 10-event log / Dice Tray**. The tray supports at most 2d20 plus 3 other dice and exposes d4, d6, d8, d10, d12, d20 and d100 calls. The old capacity subtitle was deliberately removed. Guidance, Bardic and Destiny dice animate beside the d20s with their own die shapes; FH +2 is a visible square token. Destiny confirmation, the Natural-1 choice, the scary 2d6 Chaos result and Arcane Awakening use the middle animation zone. Natural 20, Natural 1, Destiny critical success/failure, overreach and Arcane Awakening have dedicated visual states.

Opening any console or making a quick skill roll clears the previous tray. A console immediately prepares the visible recipe (`Hunting +8`, one/two pending d20s and every selected bonus). Bardic and a reserved Destiny die pulse; the matching Destiny pool die pulses too. `Clear` empties the tray and releases the active setup.

Destiny is transactional. While a console is open, clicking a pool die asks **Add this Destiny die to the Dice Tray?** and reserves it without spending it. With no console, it asks **Roll and spend this Destiny die?**, shows Current Points and warns that the result changes Destiny. On a configured roll, Destiny always rolls first. Its score/critical/recovery events form a blocking queue (`Event 1 of N`) and each requires Continue. Only after the last acknowledgement do the d20s and other bonus dice roll. The final result is always the last blocking event and also requires Finish.

When a DC proves the locked d20 result failed and neither Bardic nor Destiny has been spent, the middle zone offers one last Bardic or available Destiny die, or Accept Result. The bonus is rolled without touching the original d20. With no DC, the final event exposes an optional Add a bonus die action. A roll phase is persisted as `pendingRoll`, so refreshing after Destiny was spent resumes the event queue instead of allowing a second spend.

The intermittent Roll Console failure was caused by a rerender discarding unsaved checkbox/select values. Every console-related click/change now synchronizes the visible controls into state before a rerender. The integration test covers Guidance → Advantage → Roll → history adjustment end to end.

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
- `rollEvents`
- `manualOverrides` (AC, all 26 skill tiers and the canonical tool tiers)
- `pendingRoll` (serializable roll phase, event queue and tray presentation)

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

The player client contains a defensive, character-agnostic adapter. It accepts snapshot arrays or name-keyed maps, wrapped `{ data: ... }` snapshots, mixed case skill names, official DDB tool aliases, DDB proficiency modifiers, several AC field shapes and array/object ability scores. The adapter is now strict: a pull can produce only the 26 canonical FH skills, and only recognized tools backed by an explicit proficiency source. Inventory items, non-proficiency modifiers and unknown labels cannot become active tools. Unknown labels are retained in `character.importReport` and shown in the current correction panel for diagnosis. Manual corrections are applied last and therefore survive every later sync. **There is no character-specific code.** Import order never controls display order.

This client adapter cannot invent a field that the Worker never returns. The production Worker must use one parser for every initial import and resync and satisfy the normalized snapshot contract in `WORKER-ADMIN-API.md`. Do not “fix” individual characters by name or URL.

If pull fails after deployment, check the production Worker and D&D Beyond sheet visibility before changing this client contract.

### First-time DDB import and DM Control

The player-sheet Pull button can sync/link DDB **after a campaign character record already exists**. It cannot safely create a brand-new campaign character from the static browser alone.

`docs/gm.html` now provides the complete DM-facing interface, including a small `DM` entry on the homepage. Existing build listing/download and loot work with the current Worker. Campaign creation/deletion, first-time DDB import, DM-triggered resync and character deletion intentionally call authenticated `/admin/*` endpoints. The deployed Worker source is absent from this repository, so Claude must implement `WORKER-ADMIN-API.md` in that Worker and redeploy it. The UI reports this missing backend explicitly on 404/405/501.

The static ZIP therefore completes the sheet-side import adapter and manual correction UI, but “every DDB import” is only complete in production after the Worker has been updated and redeployed against the contract below. Awki should be retested as one ordinary fixture alongside several unrelated public characters.

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

Optional DOM roller test:

```bash
npm install --prefix /tmp/fh-player-test --cache /tmp/fh-npm-cache linkedom@0.18.12
node tests/player-sheet.integration.test.js
```
