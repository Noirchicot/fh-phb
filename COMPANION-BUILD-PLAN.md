# Player Companion — build plan (belt, tarot, AboveVTT)

Working document for a multi-chat build. Any chat should be able to start from
this file alone, without the conversation that produced it.

**Repo:** `~/tools/fh-phb` · branch `main` · deploy `./.venv/bin/mkdocs gh-deploy --force`
**Tests:** `for t in tests/*.test.js; do node "$t"; done` — all six must stay green.
**Harness:** `tools/dock-harness.html`, copied to `site/` and served on port 8125
(`.claude/launch.json` entry `fh-site-b`). Offline, stubbed Worker, no campaign code needed.

---

## 1. The constraint that shapes everything

| File | Size | Contents |
|---|---|---|
| `docs/javascripts/fh-player-sheet.js` | 2 633 lines / 228 KB | state, persistence, DDB sync, roll engine, destiny, chaos, arcana, tray, console, event stream, every panel, every click handler — one IIFE |
| `docs/stylesheets/companion-dock.css` | 754 lines / 64 KB | the whole dock |

Every item on the roadmap edits **both of these**. Two chats working in parallel
today means two chats rewriting the same 2 600-line closure: constant conflicts,
and each chat burning its context window re-reading the monolith before it can
touch anything.

**So the split is not a nice-to-have — it is the thing that makes parallel chats
possible at all.** The belt is the natural seam: six tabs, six owners.

---

## 2. Target architecture

The belt sits **between the passives row and the skills zone**. Vitals + passives
stay pinned above it (always visible); the belt switches everything below.

```
┌─ header (portrait, menu, window mode) ──────────┐   core
├─ vitals · PB/AC/HP/EXH · passives ──────────────┤   core, always visible
├─ BELT: Skills │Features│Actions│Spells│Inv│Notes┤   core, colourful, active tab lit
├─ … active panel body … ─────────────────────────┤   panel module
├─ destiny · console · tray · stage ──────────────┤   core, shown when panel asks
└─ stream ────────────────────────────────────────┘   core
```

Destiny / console / tray is **shared** — Skills and Actions both use it. It must
live in core and be declared by the panel (`showsRoller: true`), not copied twice.

### Files after the split

| File | Owner | Contents |
|---|---|---|
| `fh-companion-core.js` | architect | state, persistence, DDB sync, roll engine, destiny, chaos, arcana, tray/console/stage, stream, belt shell + routing, panel registry |
| `fh-panel-skills.js` | (extract, don't rewrite) | skills & tools board |
| `fh-panel-features.js` | chat | abilities, traits, feats — **a good tracker** is the point |
| `fh-panel-actions.js` | chat | Action / Bonus Action / Reaction, clickable rolls |
| `fh-panel-spells.js` | chat | spell list, slots, clickable casts |
| `fh-panel-inventory.js` | chat | wire the existing inventory pop into the belt |
| `fh-panel-notes.js` | chat | notes |

CSS splits the same way: `companion-core.css` + one block per panel.

### The contract (architect writes and freezes this first)

```js
FH.registerPanel({
  id: "features",
  label: "Features",
  colour: "--cd-belt-features",
  showsRoller: false,          // true → core renders destiny/console/tray below
  render: function (ctx) { return html; },
  onClick: function (event, ctx) { return handled; }
});
```

`ctx` gives a panel read access to the character and the roll API — `ctx.character`,
`ctx.roll(spec)`, `ctx.stageDie(size)`, `ctx.pushEvent(text, kind)` — and nothing
else. A panel chat then needs to read **the contract, not the engine**. That is the
whole point: it collapses each subject chat's required context from 2 600 lines to
about 40.

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
- **Belt does not exist.** Only the Skills content exists, unlabelled and always-on.
- **Features / Actions / Spells / Notes panels do not exist.**
- **No AboveVTT link.**

---

## 5. Work packages

Ordered. Package 1 gates everything else; after it, 3–7 are genuinely parallel
because they touch disjoint files.

| # | Package | Model · effort | Files | Depends on |
|---|---|---|---|---|
| 1 | **The split + belt shell.** Carve core out of the monolith, write and freeze the panel contract, build the belt (6 tabs, colour-coded, active tab lit), move Skills into `fh-panel-skills.js` unchanged. No new features. Tests stay green. | Opus · high | both monoliths → 3 files | — |
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
3. **Card art.** Rider–Waite–Smith (1909) is public domain and is what most tarot
   sites use — safest given the SRD 5.2 compliance work. 78 images, or a styled
   generative back + typographic face? Art choice affects package 2's size a lot.

---

## 7. How the chats run

- **One architect chat (Opus)** owns this file, the contract and package 1, and
  reviews what lands. It does not build panels.
- **One chat per package**, started cold from a transition prompt naming: the
  package, its files, the contract, and its done-when. No chat needs another
  chat's history.
- **Sequencing beats branching.** Package 1 lands on `main` first. After that the
  packages touch disjoint files, so parallel chats can each commit to `main`
  without conflicts. Only merge into a branch if two chats must share a file.
- **Every chat runs the six test suites before committing**, and verifies visually
  against `dock-harness.html` on port 8125.
- **Every chat updates this file** when it changes the contract or closes a question.
