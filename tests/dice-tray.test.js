"use strict";

/* The Dice Tray as its own zone (UI-TERMINOLOGY.md zone 9), extracted from
   the roller on branch dock-dice-tray. Shape ruled by Eric 2026-08-03:

   1. one persistent zone, data-zone="dice-tray", holding TEN rolls;
   2. each line is THREE spaces left to right with nothing said twice —
      the name in full (time on hover only, no portrait), the dice with
      their full wrapper, then the ruling on three tiers;
   3. the newest roll's dice are LARGE, rolls 2-4 small but able to roll,
      and the Static Area below renders frozen snapshots (data-snapshot,
      no live WebGL context — the ~16-context browser cap);
   4. it is the table's SHARED surface: feed rolls merge in, my own feed
      echoes do not, and the three states LIVE / RECENT / OFF are written
      in plain words — on the Identity line's chip since phase 2 (mort du
      cap) — never a silent fallback;
   5. the fh-roll/1 display layer now carries the dice, so another dock
      can draw a roll instead of guessing it from display strings. */

const assert = require("node:assert/strict");
const crypto = require("node:crypto").webcrypto;
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "docs", "javascripts", "fh-player-sheet.js");
const source = fs.readFileSync(sourcePath, "utf8");
const cssPath = path.join(__dirname, "..", "docs", "stylesheets", "companion-dock.css");
const css = fs.readFileSync(cssPath, "utf8");

const instrumented = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__fhDiceTray = {
    state, TRAY_MAX, MAX_FREE_DICE, trayLines, trayDiceFromEntry, feedLineDice, diceTrayInner,
    renderDiceTray, renderStageZone, rollExport, rollExportDice, visualDie, clearDiceTray,
    surfaceTrayLine, prepareTrayForConfig, renderJudgmentFrame, surfaceClickedTrayDie, dieSvg,
    renderDockHeader, feedChipHtml, feedStatusCaption
  };
})();
`);
assert.notEqual(instrumented, source, "the test hook was injected into the module tail");

const storage = new Map();
const sandbox = {
  URL, clearTimeout, console, crypto, setTimeout,
  fetch: () => Promise.reject(new Error("Network disabled in unit test")),
  localStorage: {getItem: key => storage.has(key) ? storage.get(key) : null, setItem: (key, value) => storage.set(key, String(value))},
  window: {crypto, setTimeout, clearTimeout, location:{href:"https://example.invalid/player/"}, history:{replaceState(){}}}
};
sandbox.document = {addEventListener() {}};
sandbox.globalThis = sandbox;
vm.runInNewContext(instrumented, sandbox, {filename: sourcePath});
const t = sandbox.__fhDiceTray;
/* The module runs in its own vm realm, so its arrays are not this realm's
   Array — strict deep equality would compare prototypes and fail on values
   that are identical. Cross the boundary explicitly. */
const plain = value => JSON.parse(JSON.stringify(value));

function isoAt(minutesAgo) { return new Date(Date.now() - minutesAgo * 60000).toISOString(); }
function d20Entry(id, name, kept, total, minutesAgo, extra) {
  return Object.assign({
    id, kind:"d20", name, ability:"INT", baseBonus:7, d20Mode:"flat", d20s:[kept], kept,
    natural:kept, plusTwo:false, custom:0, guidance:null, bardic:null, destiny:null,
    bonusDice:[], dc:"", natChoice:null, createdAt:isoAt(minutesAgo), total
  }, extra || {});
}
function feedRoll(id, pseudo, character, title, total, minutesAgo, extra) {
  return Object.assign({
    id, type:"roll", rollId:id, rev:0, ts:isoAt(minutesAgo),
    actor:{pseudo, character, ddbCharacterId:null},
    display:Object.assign({schema:"fh-roll/1", title, total, outcome:"Success", parts:[], badges:[], dc:14},
      extra && extra.display || {})
  }, extra && extra.event || {});
}

t.state.pseudo = "Me";
t.state.code = "FH1";
t.state.character = {name:"Yedrivel"};

/* ── 1. The zone, and its ten-roll cap ─────────────────────────────── */

assert.equal(t.TRAY_MAX, 10, "the tray holds ten rolls — beyond that, the Stream or AboveVTT");
assert.match(t.renderDiceTray(), /data-zone="dice-tray"/, "the Dice Tray is its own zone");
/* REWRITTEN (phase 2, mort du cap, Eric R5 2026-08-05): the cap row is DEAD
   — the tray renders nothing but its list of lines and the two floating
   chevrons. Its cargo moved: the state chip to the Identity line
   (asserted in section 6), CLEAR TRAY and the ⋮'s URL…/Refresh into the
   Identity ⋮ (provisional seat for Clear until phase 3). */
assert.doesNotMatch(t.renderDiceTray(), /DICE TRAY/, "the zone still never spells its own name");
assert.doesNotMatch(t.renderDiceTray(), /fh-cd-cap/, "the cap row is gone — the tray is lines of rolls, nothing else");
assert.doesNotMatch(t.renderDiceTray(), /fh-cd-traystate/, "the state chip left the tray for the Identity line");
assert.doesNotMatch(t.renderDiceTray(), /data-clear-tray/, "the × died with the cap");
assert.match(t.renderDiceTray(), /fh-cd-traylist/, "the list survives");
assert.match(t.renderDiceTray(), /data-tray-scroll="up"[\s\S]*data-tray-scroll="down"/, "and both chevrons float on");
assert.match(css, /\.fh-cd-trayline\.is-mid,\.fh-cd-trayline\.is-static\{min-height:56px\}/,
  "…and 56 is still what a standard band measures (change one, change both)");
/* REWRITTEN (phase 2): the chevron's perch was calc(--cd-traycap-h + 4px)
   under a cap that no longer exists — its LAST word must be the top of the
   list. And the zone's LAST height word stays 284: with no cap that is
   2px top padding + 5×56 = 282 ≤ 284 — FIVE whole bands visible now
   (BACKLOG-B's 284 already priced the cap's announced death). */
const lastUpArrow = [...css.matchAll(/\.fh-cd-trayarrow\.is-up\{top:([^}]+)\}/g)].pop();
assert.equal(lastUpArrow && lastUpArrow[1], "4px", "the up chevron floats over line 1 — no dead cap offset");
/* (The 284 last-word assertion lives just below, in the BACKLOG-B block —
   rewritten there for the five-band arithmetic.) */
/* Lot BACKLOG-B (Eric, 2026-08-05): L1 loses its 84px privilege — the
   « C » ramp says which roll is newest by POSITION, not by a taller
   band. 56 nominal everywhere; 72 only for a 21-30-dice hand (three
   rows of ten, is-deep); and the chevron steps exactly one band. The
   last word on each height is pinned so an appended regression cannot
   quietly re-grow a line. */
const lastL1 = [...css.matchAll(/\.fh-cd-trayline\.is-l1\{min-height:(\d+)px\}/g)].pop();
assert.equal(lastL1 && lastL1[1], "56", "line 1 is a 56px band like every other — a min-height, never a frozen 84");
const lastDeep = [...css.matchAll(/\.fh-cd-trayline\.is-deep\{min-height:(\d+)px\}/g)].pop();
assert.equal(lastDeep && lastDeep[1], "72", "only a 21-30-dice hand deepens its line, to 72");
const lastL1T3 = [...css.matchAll(/\.fh-cd-trayline\.is-l1 \.fh-cd-tray-t3\{max-height:(\d+)px\}/g)].pop();
assert.equal(lastL1T3 && lastL1T3[1], "22", "L1's tier-3 headroom was 84-era slack — back to the common 22");
assert.match(source, /trayScroll==="up"\?-56:56/, "one chevron click steps exactly one 56px band");
/* REWRITTEN (phase 2, mort du cap): the acted 284 now buys FIVE bands.
   With border-box folding each line's paddings and separator inside its
   56, and no cap row at all, the zone needs 2 (tray pad) + 5×56 = 282.
   BACKLOG-B's 284 already priced the cap's announced death — the LAST
   word is what the browser reads. */
const lastTrayH = [...css.matchAll(/--cd-tray-h:(\d+)px/g)].pop();
assert.equal(lastTrayH && lastTrayH[1], "284", "the tray's last word on its height is the acted 284 — 2 + 5×56 = 282 needed, 2px spare");
assert.doesNotMatch(t.renderStageZone(), /data-zone="dice-tray"/, "the roller does not carry the tray any more");

t.state.history = [];
for (let i = 0; i < 14; i++) t.state.history.push(d20Entry("h" + i, "Arcana", 11, 18, i));
t.state.feed.events = [];
assert.equal(t.trayLines().length, 10, "fourteen history rolls still show only ten tray lines");

/* ── 2. The shared surface: merge, dedupe, order ───────────────────── */

t.state.history = [d20Entry("mine-new", "Arcana", 14, 21, 1), d20Entry("mine-old", "Stealth", 9, 16, 30)];
t.state.feed.events = [
  feedRoll("their-mid", "Wen", "Ilyra", "Perception", 27, 5),
  feedRoll("mine-echo", "Me", "Yedrivel", "Arcana", 21, 1),
  feedRoll("their-old", "Mara", "Brakka", "Athletics", 19, 60)
];
const merged = t.trayLines();
assert.deepEqual(plain(merged.map(line => line.id)), ["mine-new", "their-mid", "mine-old", "their-old"],
  "mine and the table's rolls merge newest-first");
assert.ok(!merged.some(line => line.id === "mine-echo"),
  "my own roll echoing back through the feed is not shown twice");
assert.equal(merged.find(line => line.id === "their-mid").kind, "feed", "the party's rolls are feed lines");

/* ── 3. The line: three spaces, nothing twice, time on hover only ──── */

const inner = t.diceTrayInner();
/* REWRITTEN (third fitting, same day): the line reads verdict-first now —
   LEFT the chip and what Fate said, CENTRE the dice, RIGHT the roll's name
   over its total ("Arcana +7 / 21"). */
const firstLine = inner.slice(inner.indexOf("fh-cd-trayline"));
const leftAt = firstLine.indexOf("fh-cd-tray-left");
const diceAt = firstLine.indexOf("fh-cd-tray-dice");
const rightAt = firstLine.indexOf("fh-cd-tray-right");
assert.ok(leftAt >= 0 && diceAt > leftAt && rightAt > diceAt,
  "a line reads left to right: the verdict flank, then the dice, then name and total");
assert.ok(firstLine.indexOf("fh-cd-tray-who") < diceAt, "the chip leads the left flank");
assert.match(firstLine.slice(rightAt), /fh-cd-tray-title">Arcana \+7</, "the right flank names the roll");
/* REWRITTEN (same lot, Eric's second fitting 2026-08-03): the who became a
   CHIP — my face or two letters — because the full name cost the line its
   flanks. The whole name and the time still exist, on hover and in the
   title attribute. */
assert.match(inner, /fh-cd-tray-initials">Ye</, "the who is a chip — two letters when there is no portrait");
assert.match(inner, /fh-cd-tray-name">Yedrivel/, "the full name rides the hover label…");
assert.match(inner, /title="Yedrivel · /, "…and the title attribute, with the time");
assert.match(css, /\.fh-cd-tray-who:hover \.fh-cd-tray-name\{opacity:1\}/, "and the stylesheet only surfaces it on hover");
assert.match(inner, /fh-cd-tray-title/, "the roll's name in bold, right flank");
assert.match(inner, /fh-cd-tray-total/, "the total under it");
assert.match(inner, /Arcana \+7/, "the title carries the bonus, not the arithmetic");

/* ── 4. Sizes per band: large, small, snapshot ─────────────────────── */

t.state.history = [];
for (let i = 0; i < 6; i++) t.state.history.push(d20Entry("s" + i, "Arcana", 12, 19, i));
t.state.feed.events = [];
t.state.trayResults = []; t.state.traySelection = []; t.state.rollSequence = null; t.state.destinyStaged = null;
t.diceTrayInner(); // first pass: these six rolls land (and animate); the bands are judged at rest
const banded = t.diceTrayInner();
const lines = banded.split("fh-cd-trayline").slice(1);
assert.match(lines[0], /is-l1/, "the newest roll is the large band");
/* REWRITTEN (grille ratifiée Eric, lot BACKLOG-B 2026-08-05): the crowd
   sets the size now, not the band — every line is the same 56. A 1-5
   skill hand keeps the wrapper at 38px WITH its label (the 44 was the
   84-era L1 privilege; T9's label ban falls with it), on EVERY line —
   the old always-naked-30px mid lines went with the band distinction.
   The zero-context law survives the change of dress: wrapped dice on
   lines 2-4 are reborn as snapshots at rest, exactly as the naked ones
   were; only a die landing this pass animates as a live host. */
assert.match(lines[0], /--fh-static-die-size:38px/, "a skill hand lands at 38px — one grid for every line");
assert.match(lines[0], /<em>d20<\/em>/, "and keeps its label under the die");
assert.match(lines[1], /is-mid/, "rolls 2-4 are the small band");
assert.doesNotMatch(lines[1], /is-naked/, "a 1-5 hand keeps its wrapper on the lower lines too");
assert.match(lines[1], /--fh-static-die-size:38px/, "at the same 38px — the crowd, not the band, sets the size");
assert.match(lines[1], /data-snapshot="1"/, "at rest they are snapshots — zero live contexts");
assert.match(lines[4], /is-static/, "roll 5 opens the Static Area");
assert.match(lines[4], /data-snapshot="1"/, "where dice are frozen snapshots — no live WebGL context");
assert.match(lines[4], /data-animate="0"/, "and nothing animates, ever");
assert.match(css, /\.fh-cd-trayline\.is-static \.fh-cd-die\.is-spinning\{animation:none\}/,
  "even a remounted SVG die cannot replay its spin down there");

/* ── 4b. The swarm choreography (Eric, 2026-08-04) ─────────────────────
   Past five dice: roll small, stop, zoom. 13+ roll in WAVES of ten (row
   after row, under the ~16-context cap); a re-rendered swarm die is born
   as a snapshot at the settled size — zero live contexts. The +2/+X coin
   rides naked at swarm scale, never rolls, never had a label to lose. */

t.state.feed.events = [];
t.state.trayResults = []; t.state.rollSequence = null;
const bigHand = [];
for (let i = 0; i < 14; i++) bigHand.push({sides:6, result:(i % 6) + 1});
t.state.history = [{id:"swarm-roll", kind:"tray", name:"Damage roll", dice:bigHand, total:49, createdAt:isoAt(0)}];
t.state.diceSignatures = {};
const rollingPass = t.diceTrayInner();
assert.match(rollingPass, /data-wave="0"/, "the first ten dice roll as wave zero");
assert.match(rollingPass, /data-wave="1"/, "the next ten as wave one — row after row");
assert.match(rollingPass, /data-settle-size="20"/, "each die knows the size it will land at");
/* REWRITTEN (grille ratifiée Eric, 2026-08-05): a row of ten never dips
   under 20px — the floor is the NUMERAL (~11px of digit at 20; ~8px of
   texture at the old 16) — so roll size equals settle size and the
   roll-small-stop-zoom collapses to a straight tumble. */
assert.match(rollingPass, /--fh-static-die-size:20px/, "and tumbles at that same 20 — never under 20 in a row of ten");
const settledPass = t.diceTrayInner();
assert.doesNotMatch(settledPass, /data-wave=/, "a re-rendered swarm die does not roll again");
assert.match(settledPass, /data-snapshot="1"/, "it is born as a snapshot — zero live contexts");
assert.match(settledPass, /--fh-static-die-size:20px/, "at the settled, zoomed size");

const coin = t.visualDie({kind:"modifier", result:2, label:"FH bonus"}, 9, 10, false, {naked:true, sizePx:20, plainLabel:true});
assert.match(coin, /is-naked/, "the +2 coin rides naked in a swarm");
assert.doesNotMatch(coin, /<em>/, "no label — the value is printed on the coin");

/* ── 4b². Rows of ten, and the ∞ line (Eric, 2026-08-04) ───────────────
   Up to 12 dice: one line, one wave. 13-30: rows of EXACTLY ten, the row
   sized from the line's own die size, tumbling row after row. Past 30 the
   dice stay home — a big ∞ holds the zone, the total speaks on the right,
   and the full account lives in the Stream. Free rolls stop at fifty. */

function trayHand(id, count, total) {
  const dice = [];
  for (let i = 0; i < count; i++) dice.push({sides:6, result:(i % 6) + 1});
  return {id, kind:"tray", name:"Damage roll", dice, total, createdAt:isoAt(0)};
}
t.state.feed.events = [];
t.state.trayResults = []; t.state.rollSequence = null;
t.state.history = [trayHand("twelve", 12, 42)];
t.state.diceSignatures = {};
const twelvePass = t.diceTrayInner();
/* REWRITTEN (grille ratifiée Eric, 2026-08-05): the one-line ceiling moves
   from 12 to TEN — 11-20 dice are two rows of exactly ten at 20px (2×20 +
   gap ≈ 49, inside the 56 band), so twelve dice now wrap and wave. */
assert.match(twelvePass, /is-rows/, "eleven to twenty wrap into two rows of ten");
assert.match(twelvePass, /data-wave="1"/, "…and tumble row after row: 10, 2");
assert.doesNotMatch(twelvePass, /is-deep/, "two rows still live inside the nominal 56");
t.state.history = [trayHand("twentyfive", 25, 88)];
t.state.diceSignatures = {};
const rowsPass = t.diceTrayInner();
assert.match(rowsPass, /is-rows/, "twenty-five dice wrap into rows of ten");
assert.match(rowsPass, /data-wave="2"/, "…and tumble row after row: 10, 10, 5");
assert.match(rowsPass, /--fh-cd-tray-die-size:20px/, "the row rides the line's own settled die size");
assert.match(rowsPass, /is-deep/, "three rows of ten deepen the line to 72 — the one growth case");
assert.match(css, /\.fh-cd-tray-dice\.is-rows\{max-width:calc\(10 \* var\(--fh-cd-tray-die-size/,
  "and the stylesheet caps a row at ten of THAT size — never eleven, never nine");
t.state.history = [trayHand("legion", 31, 108)];
t.state.diceSignatures = {};
const infinitePass = t.diceTrayInner();
assert.match(infinitePass, /is-infinite/, "past thirty the zone goes infinite");
assert.match(infinitePass, /fh-cd-tray-inf[^>]*>∞</, "a big ∞ where the dice would be");
assert.doesNotMatch(infinitePass, /data-sides=/, "no dice are drawn at all");
assert.match(infinitePass, /fh-cd-tray-total is-\w+"[^>]*>108</, "the total still speaks on the right");
assert.match(source, /if\(count>30\)\{state\.trayRevealAt=0;return;\}/,
  "and nothing holds the reveal — with no dice rolling, the total just appears");
assert.equal(t.MAX_FREE_DICE, 50, "nothing goes beyond fifty dice");
/* STABLE columns while the wave rolls: every cell is fixed at the settled
   size, so a die tumbling small cannot change the pitch mid-roll. */
assert.match(css, /\.fh-cd-tray-dice\.is-rows \.fh-cd-diewrap\{width:var\(--fh-cd-tray-die-size/,
  "the cell is the settled size — rows of ten hold from first wave to rest");
/* THE SEAL IS THE DIE (Eric, ratified 2026-08-03, wired 2026-08-04):
   "color and dice = all in one" — provenance is the die's tint, the
   separate 12px token is retired everywhere. Destiny gold, Tactical
   (the warrior) crimson, Bardic violet, Guidance azure, plain bonus ash
   (light grey). A hand-picked colour still wins. */
const tintOf = html => (html.match(/data-material="([^"]+)"/) || [])[1];
const mkBonus = (icon, extra) => Object.assign({sides:6, result:4, dieRole:"bonus", sourceIcon:icon, label:icon}, extra || {});
assert.equal(tintOf(t.visualDie(mkBonus("guidance"), 0, 14, false, {naked:true, sizePx:16, plainLabel:true})), "azure", "Guidance rolls azure");
assert.equal(tintOf(t.visualDie(mkBonus("bardic"), 0, 14, false, {naked:true, sizePx:16, plainLabel:true})), "violet", "Bardic rolls violet");
assert.equal(tintOf(t.visualDie(mkBonus("tactical"), 0, 14, false, {naked:true, sizePx:16, plainLabel:true})), "crimson", "Tactical — the warrior's die — rolls crimson");
assert.equal(tintOf(t.visualDie(mkBonus("other-2"), 0, 14, false, {naked:true, sizePx:16, plainLabel:true})), "ash", "a plain bonus rolls light-grey ash");
assert.equal(tintOf(t.visualDie(mkBonus("guidance", {colour:"slate"}), 0, 14, false, {naked:true, sizePx:16, plainLabel:true})), "slate", "a hand-picked colour outranks the source tint");
const wrappedBonus = t.visualDie(mkBonus("guidance"), 0, 3, false, {sizePx:44});
assert.equal(tintOf(wrappedBonus), "azure", "the wrapped die is tinted the same");
// REWRITTEN (lot BACKLOG-C, décision Eric 2026-08-05: « violet + Bardic,
// rien de plus ») — the empty 12px slot is deleted at the source, not
// merely hidden in the tray: a wrap is the tinted die plus its label,
// nothing above, and the wrapper's own title names the source on hover.
assert.doesNotMatch(wrappedBonus, /fh-cd-src/, "no src slot — sealed OR empty — rides the wrap any more");
assert.match(wrappedBonus, /title="guidance"/, "the wrapper still names the source on hover");

/* ── 4c. The reading glass — REMOVED for good ─────────────────────────
   REWRITTEN (lot BACKLOG-B, décision Eric 2026-08-05) : the glass had
   only been switched off (TRAY_LOUPE_ENABLED, fccf1d0); Eric then ruled
   it out permanently. This section flips from pinning the dormant
   machinery to pinning its ABSENCE — the constant, the hover clamp, the
   is-loupe-on class, the ×1.5 lift and its CSS gate are all gone. The
   loupe-dress assertions (the ::after plaque, the gated lift, the wired
   mouseover) are deleted with the code they tested; what stays below are
   the glass's two survivors: the unclipped-registre rule of thumb and
   the live hand's overflow, which the rows of ten still need. */

assert.doesNotMatch(source, /TRAY_LOUPE_ENABLED|onTrayHover|is-loupe-on|--fh-cd-loupe-dy/,
  "no constant, no clamp, no class, no CSS hook — the glass left no machinery behind");
assert.doesNotMatch(css, /is-loupe-on|--fh-cd-loupe-dy|scale\(1\.5\)/,
  "the stylesheet carries neither the lift nor its gate any more");
assert.doesNotMatch(source, /addEventListener\("mouseover"/, "the tray listens to no hover at all");
assert.doesNotMatch(source, /trayDiceZoom|toggleTrayLoupe|trayLoupeTarget/,
  "and the older click-toggled loupe stays just as gone");
assert.equal((css.match(/\.fh-cd-traylist\{overflow:visible\}/g) || []).length, 0,
  "the registre is NEVER unclipped — its scroll survives (the glass's hard-won lesson outlives it)");
/* The live hand's frame keeps letting its content grow out — three rows
   of ten need it even with no glass to ride out. */
assert.match(css, /\.fh-cd-dicetray \.fh-cd-frame\.is-trayhand\{overflow:visible\}/,
  "line 1's frame lets its rows out");
assert.match(css, /\.fh-cd-floatbottom\{overflow-x:clip\}/,
  "the summoned group clips sideways without conjuring a vertical scroll (overflow-x:hidden did)");

/* ── 4d. The carpet is the RAMP A of the three strata (lot R8, Eric
   2026-08-05) ─────────────────────────────────────────────────────────
   REWRITTEN (lot R8): the « C » ramp gave way to the validated ramp A —
   depth tells the roll's age: light at the top where the vivid roll
   lives, sinking to near-ink for history. The LAST background declared
   for the tray must be ramp A alone (no texture layers). The cap sits
   on the ramp's light top 20% (#8a8172→#6d6557): its gold (#eac878,
   4.7:1 on the old #5c5344) fell to 2.4–3.6:1 there, so the cap glyphs
   go near-white #fffdf6 and the state chip lies on a dark plate. Line
   1's tints are lifted a step (is-l1 scope) — dark ink was measured
   and rejected (2.66:1 at line 1's top, see the CSS lot comment). */
const lastTrayBg = [...css.matchAll(/\.fh-cd-dicetray\{background:([^}]+)\}/g)].pop();
assert.equal(lastTrayBg && lastTrayBg[1],
  "linear-gradient(180deg,#8a8172 0%,#6d6557 20%,#4a443a 55%,#2a261f 85%,#211e18 100%)",
  "the tray's last word on background is ramp A — light top, ink bottom, no texture layers");
assert.match(css, /\.fh-cd-dicetray>\.fh-cd-cap\{color:#fffdf6;/,
  "the cap's glyphs are near-white on the ramp's light top");
assert.match(css, /\.fh-cd-dicetray \.fh-cd-traystate\{background:rgba\(30,26,19,\.8\)\}/,
  "the state chip is a dark token on the felt — its tinted letters measured on the plate");
assert.match(css, /\.fh-cd-dicetray \.fh-cd-trayline\.is-l1 \.fh-cd-tray-verdict\{color:#ffd98a\}/,
  "line 1's verdict gold is lifted for the light band it lives on");

/* ── 4e. The builder is POSED ON the sheet (lot R9, Eric 2026-08-05) ──
   The wooden judgment box dies: the builder's background is transparent
   so the stage's parchment runs continuous under it — no box border, no
   sunk shadow — and every lettering that was light-on-wood is ink on
   parchment again. The dice alone carry a drop shadow to say « posés
   dessus ». The LAST word each time must be the parchment dress. */
const lastJudgmentDress = [...css.matchAll(/\.fh-cd-frame\.is-judgment\{([^}]+)\}/g)].pop();
assert.equal(lastJudgmentDress && lastJudgmentDress[1],
  "border:0;background:none;box-shadow:none;border-radius:0",
  "the builder's last dress is bare parchment — no wood, no box, no inset shadow");
const lastJudgmentB = [...css.matchAll(/\.fh-cd-frame\.is-judgment \.fh-cd-judgment>b\{color:([^}]+)\}/g)].pop();
assert.equal(lastJudgmentB && lastJudgmentB[1], "var(--cd-ink)",
  "the builder's headings are ink on parchment again");
const lastJudgeAskB = [...css.matchAll(/\.fh-cd-frame\.is-judgment \.fh-cd-judgeask>b\{color:([^}]+)\}/g)].pop();
assert.equal(lastJudgeAskB && lastJudgeAskB[1], "var(--cd-oxblood)",
  "the grande occasion asks its question in oxblood — dramatic on the light sheet");
assert.match(css, /\.fh-cd-frame\.is-judgment \.fh-cd-static-die\{filter:drop-shadow/,
  "the dice are what casts a shadow on the sheet");

/* ── 5. The wire: fh-roll/1 carries the dice ───────────────────────── */

const exported = t.rollExport(d20Entry("wire", "Arcana", 14, 21, 0, {
  bonusDice:[{id:"b1", label:"Guidance", sides:4, result:3, sourceIcon:"guidance"}]
}));
assert.ok(Array.isArray(exported.dice) && exported.dice.length >= 2, "the export carries the dice");
assert.equal(exported.dice[0].sides, 20, "the d20 leads");
assert.equal(exported.dice[0].result, 14, "with its result");
const guidanceDie = exported.dice.find(die => die.source === "guidance");
assert.ok(guidanceDie, "a bonus die keeps its source token on the wire");
assert.equal(guidanceDie.result, 3, "and its result");
assert.equal(exported.bonus, 7, "the export states the flat bonus so the title can say Arcana +7");

const wireBack = t.feedLineDice({display:{dice:exported.dice}});
assert.equal(wireBack.length, exported.dice.length, "a feed line rebuilds every exported die");
assert.equal(wireBack[0].sides, 20, "same shape");
assert.equal(wireBack.find(die => die.sourceIcon === "guidance").label, "Guidance", "same provenance");
assert.deepEqual(plain(t.feedLineDice({display:{}})), [], "an event without dice (an older dock) renders without them — graceful degradation");

/* A feed line's dice are read-only: no handles, so no menus can reach them. */
t.state.feed.events = [feedRoll("armed", "Wen", "Ilyra", "Perception", 27, 0,
  {display:{dice:[{sides:20, result:17, label:"d20", role:"base", source:""}]}})];
t.state.history = [];
const feedLineHtml = t.diceTrayInner();
assert.match(feedLineHtml, /is-feed/, "the party's roll renders as a feed line");
assert.doesNotMatch(feedLineHtml, /data-die-landed/, "another player's dice carry no handles");
/* REWRITTEN (second fitting): the feed who is a chip too — the wire has no
   avatar, so it is always the two letters, full name on hover. */
assert.match(feedLineHtml, /fh-cd-tray-initials">Il</, "the who is the character's chip, two letters");
assert.match(feedLineHtml, /fh-cd-tray-name">Ilyra/, "with the full name on hover");

/* ── 6. LIVE / RECENT / OFF on the Identity line — never a silent
       fallback ─────────────────────────────────────────────────────── */

/* REWRITTEN (phase 2, mort du cap, Eric R5 2026-08-05): the chip left the
   dead cap for the Identity line, beside the campaign code it qualifies —
   same three states, same T24 phrases on its hover title, same loud OFF.
   URL… and Refresh moved from the cap's ⋮ into the Identity's EXISTING ⋮.
   The tray itself no longer says any of it (asserted in section 1). */
const headerCh = {name:"Yedrivel", species:"Elf", classes:[{name:"Wizard",level:5}]};
t.state.feed.tableState = "recent";
assert.match(t.feedChipHtml(), /cloud log, about 30s behind/, "RECENT still says what it is — on the chip's title");
assert.match(t.renderDockHeader(headerCh), /FH1[\s\S]*data-feed-chip/, "and the chip sits on the Identity line, after the campaign code");
assert.match(t.renderDockHeader(headerCh), /is-recent"[^>]*>RECENT</, "wearing the state in plain words");
t.state.menuOpen = true;
let identityMenu = t.renderDockHeader(headerCh);
assert.match(identityMenu, /data-feed-refresh/, "the Identity ⋮ holds the one manual refresh (RECENT is never polled)");
assert.match(identityMenu, /data-table-url-set/, "and the DM's URL… escape hatch");
assert.match(identityMenu, /data-stream-toggle/, "beside the Stream toggle it always carried");
/* REWRITTEN (phase 3, D1, 2026-08-05): the provisional Clear tray entry is
   RETIRED — its real seats landed (CLEAR TRAY in the ⊕ popover, a discreet
   ✕ clear in the builder overlay), so the Identity ⋮ carries it no more. */
assert.doesNotMatch(identityMenu, /data-clear-tray/, "Clear tray left the Identity ⋮ for its real seats (⊕ popover + builder corner)");
t.state.feed.tableState = "live";
identityMenu = t.renderDockHeader(headerCh);
assert.match(t.feedChipHtml(), /every roll at the table, live/, "LIVE says what it is");
assert.doesNotMatch(identityMenu, /data-feed-refresh/, "no refresh needed when the table streams");
assert.doesNotMatch(identityMenu, /data-table-url-set/, "and no URL… either — the table is already found");
t.state.menuOpen = false;
t.state.feed.tableState = "off";
const offChip = t.feedChipHtml();
assert.match(offChip, /not reaching the table/, "OFF is written in plain words on the chip's title");
assert.match(offChip, /is-off/, "and wears the loud state chip — never folded into a quieter caption");
assert.match(css, /\.fh-cd-traystate\.is-off\{color:#fff;border-color:var\(--cd-bad\);background:var\(--cd-bad\)\}/,
  "OFF's red plate is unscoped, so it stays CRIANT on the Identity line too");
/* The 360-floor sacrifice hierarchy (measured: prose + code + RECENT
   overflows the Identity line by ~15px there): the species/class prose
   ellipsizes, the code and the chip are flex:none — the STATE is never
   the clipped thing. */
assert.match(t.renderDockHeader(headerCh), /fh-cd-subwho[\s\S]*fh-cd-subcode[\s\S]*data-feed-chip/,
  "the subtitle splits into shrinkable prose, then the incompressible code and chip");
assert.match(css, /\.fh-cd-subwho\{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\}/,
  "the prose is what ellipsizes at the floor");
assert.match(css, /\.fh-cd-id \.fh-cd-traystate\{flex:none\}/,
  "the chip refuses to shrink");
/* No campaign → no chip, and the invitation must still be SAID: it moved
   from the dead cap's small print to the Identity subtitle itself. */
const savedCode = t.state.code;
t.state.code = "";
assert.equal(t.feedChipHtml(), "", "without a campaign there is no connection to state");
assert.match(t.renderDockHeader(null), /load one to join the table/, "the « load a character » invitation survives, on the Identity line");
t.state.code = savedCode;
t.state.feed.tableState = "recent";

/* ── 7. CLEAR TRAY empties the hand, not the registre ──────────────── */

t.state.history = [d20Entry("kept", "Arcana", 14, 21, 1)];
t.state.trayResults = [{sides:20, result:14, label:"d20", dieRole:"base", entryId:"kept", landedKey:"d20"}];
t.clearDiceTray(true);
assert.equal(t.state.trayResults.length, 0, "CLEAR TRAY empties the hand");
assert.equal(t.state.history.length, 1, "the registre under it keeps the roll");
assert.match(t.diceTrayInner(), /Arcana/, "and the tray still shows it as a line");

/* ── 8. The summoned group anchors above the tray ──────────────────── */

assert.match(css, /\.fh-cd-floatbottom\{bottom:var\(--cd-tray-h,0px\);max-height:calc\(100% - var\(--cd-tray-h,0px\)\)\}/,
  "Console and Roll Builder float ABOVE the tray — the dice stay visible while a roll is configured");
assert.match(css, /\.fh-cd-dicetray\{height:var\(--cd-tray-h\)/, "the zone's height is deterministic, so the anchor cannot drift");

/* ── 8b. Phase 1: the Destiny & Dice Pool band ──────────────────────
   A persistent 44px strip between the panel's flow and the tray. The
   tray keeps bottom:0 and its 284; the band anchors at bottom:
   var(--cd-tray-h); the summoned group re-anchors ABOVE the band so it
   can never cover it again (constat C1 — the old in-flow Destiny zone
   was permanently hidden under the group). */
assert.match(css, /\.fh-cd-root\{--cd-band-h:44px\}/, "the band's height is a variable everything above it can anchor on");
assert.match(css, /\.fh-cd-band\{position:absolute;left:0;right:0;bottom:var\(--cd-tray-h\);height:var\(--cd-band-h\)/,
  "the band sits exactly on the tray's top edge, at its fixed 44px");
const lastFloatBottomAnchor=[...css.matchAll(/\.fh-cd-floatbottom\{bottom:([^;]*);/g)].pop();
assert.equal(lastFloatBottomAnchor[1],"calc(var(--cd-tray-h,0px) + var(--cd-band-h,0px))",
  "the summoned group's LAST anchor override clears the band — it must never cover it");
assert.match(css, /\.fh-cd-dock:has\(\.fh-cd-band\)\{padding-bottom:calc\(var\(--cd-tray-h\) \+ var\(--cd-band-h\)\)\}/,
  "the flow reserves band + tray, so the panel ends cleanly above the band — no dead 45px");
assert.match(css, /\.fh-cd-band \.fh-cd-picker-die\{width:22px\}/, "the gold dice compact to 22px in the band");

/* ── 9. The fold gets an affordance ; a roll can resurface (Eric, D3) ──
   ~350px of rolls hid below the fold with nothing to say so — two thin
   chevrons now ride the list's edges, shown only when their side has
   content. surfaceTrayLine calls a roll back up to line 1 — display
   order only, the wire and the Stream keep the true time. Its original
   trigger (the reading glass) is gone; an eye icon will rewire it. */

t.state.history = [d20Entry("mine-new", "Arcana", 14, 21, 1), d20Entry("mine-old", "Stealth", 9, 16, 30)];
t.state.feed.events = [];
t.state.trayResults = []; t.state.rollSequence = null;
const trayShell = t.renderDiceTray();
assert.match(trayShell, /fh-cd-trayarrow is-up[^>]*data-tray-scroll="up"/, "an up chevron rides the list's top edge");
assert.match(trayShell, /fh-cd-trayarrow is-down[^>]*data-tray-scroll="down"/, "a down chevron rides its bottom edge");
assert.match(css, /\.fh-cd-dicetray\.is-can-down \.fh-cd-trayarrow\.is-down\{display:flex\}/,
  "each is shown only when there IS something on its side (syncTrayArrows toggles the zone)");
assert.match(source, /function syncTrayArrows/, "…derived from the scroller, not guessed");
/* REWRITTEN (lot BACKLOG-A, 2026-08-05): the line snap of fbe871e is
   withdrawn — it re-snapped the restored scrollTop on every render
   (feed poll every few seconds) and fought the chevrons' fixed 76px
   step against 56/84px lines. The two assertions below pin the
   APPENDED override that turns it off, so a stylesheet regression
   cannot quietly bring the snap back. */
const lastSnapType = [...css.matchAll(/\.fh-cd-traylist\{scroll-snap-type:([^}]+)\}/g)].pop();
assert.equal(lastSnapType && lastSnapType[1], "none", "the line snap is withdrawn — the last word on scroll-snap-type is none");
const lastSnapAlign = [...css.matchAll(/\.fh-cd-trayline\{scroll-snap-align:([^}]+)\}/g)].pop();
assert.equal(lastSnapAlign && lastSnapAlign[1], "none", "…and the lines no longer declare a snap alignment");

/* REWRITTEN (lot BACKLOG-B, 2026-08-05) : the right-click resurface was
   the GLASS's gesture and is deleted with it — but surfaceTrayLine
   itself is KEPT machinery (a future eye icon will call it), so its
   behaviour stays pinned. */
assert.match(t.diceTrayInner(), /data-tray-line="mine-new"/, "every line still carries its id — the kept resurface machinery needs it");
assert.equal(plain(t.trayLines())[0].id, "mine-new", "newest first, before any resurfacing");
t.surfaceTrayLine("mine-old");
assert.equal(plain(t.trayLines())[0].id, "mine-old", "surfaceTrayLine still climbs a roll to line 1 (kept, not deleted)");
assert.equal(t.state.history[1].id, "mine-old", "…without touching the history itself (display order only)");
t.state.history.unshift(d20Entry("mine-newest", "History", 12, 19, 0));
assert.equal(plain(t.trayLines())[0].id, "mine-newest", "and the next real roll lands above it naturally");
t.state.traySurfaceId = ""; t.state.traySurfaceAt = "";
/* REWRITTEN (lot BACKLOG-B, 2026-08-05): the trigger no longer exists to
   sit behind a switch — onTrayContext belongs entirely to the die menus. */
assert.doesNotMatch(source, /glassZone|glassLine/,
  "onTrayContext keeps no glass branch — the right click is the die menus', everywhere");

/* ── 10. R1 — the +2 coin is VISIBLE during assembly (lot BUGS, 2026-08-05)
   A coin carries its value from birth: its `result` is its face, not a
   landing. Before the fix, the +2 token's non-null result convinced both
   the judgment frame (`assembling`) and the tray (`engaged`) that the hand
   had already fallen — the assembly vanished, coin included, and the +2
   survived only folded into the right column's number. Now the coin shows
   as a pending piece in the assembly, and the right column says the BASE
   bonus alone — nothing said twice. */

t.state.history = []; t.state.feed.events = [];
t.state.trayResults = []; t.state.traySelection = []; t.state.rollSequence = null;
t.state.destinyStaged = null; t.state.trayPrompt = null; t.state.diceSignatures = {};
t.state.rollConfig = {name:"Dexterity Check", ability:"DEX", baseBonus:2, d20Mode:"flat",
  plusTwo:true, custom:0, bonusDice:[], destinyDieId:"", dc:"", note:""};
t.prepareTrayForConfig(t.state.rollConfig);
const plusTwoBuild = t.renderJudgmentFrame();
assert.match(plusTwoBuild, /is-assembly/, "a pending hand with a +2 coin still reads as assembly — the coin's face is not a landing");
assert.match(plusTwoBuild, /fh-cd-token/, "the +2 coin is visible in the assembly");
assert.match(plusTwoBuild, /is-pending[^>]*is-modifier|is-modifier[^>]*is-pending/, "…as a pending piece, same dress as in the tray");
assert.match(plusTwoBuild, /fh-cd-judgeright"><b>Dexterity Check<\/b><i>\+2<\/i>/,
  "the right column keeps the BASE bonus alone — the coin already says the +2, nothing said twice");
assert.doesNotMatch(t.diceTrayInner(), /is-livehand/, "and the tray shows no live hand — the coin does not engage it either");
t.state.rollConfig = null; t.state.trayResults = [];

/* ── 11. R2 — the manual +X mints a coin too (lot BUGS, 2026-08-05)
   `trayDiceFromEntry` only minted coins for plusTwo and Exhaustion — the
   typed modifier (`entry.custom`) had none, anywhere. Now it is a coin
   like the others: pending in the assembly the moment it is typed, on the
   settled line after the roll, signed (« +3 » / « −2 »), label Manual,
   copper tone. A zero mints nothing. And because rollExportDice flattens
   trayDiceFromEntry's own list, the coin reaches the wire and the party's
   feed lines rebuild it for free. */

const manualEntry = d20Entry("manual-roll", "Arcana", 14, 24, 0, {custom:3});
const manualDice = plain(t.trayDiceFromEntry(manualEntry));
const manualCoin = manualDice.find(die => die.kind === "modifier" && die.label === "Manual");
assert.ok(manualCoin, "a settled roll with a manual modifier carries its coin");
assert.equal(manualCoin.result, 3, "with the typed value");
assert.equal(manualCoin.tone, "mod", "in copper — the tone of anything typed by hand");
assert.ok(!plain(t.trayDiceFromEntry(d20Entry("no-coin", "Arcana", 14, 21, 0)))
  .some(die => die.label === "Manual"), "a custom of zero mints nothing");
assert.match(t.visualDie({kind:"modifier", result:3, label:"Manual", tone:"mod"}, 0, 2, false, {sizePx:38, plainLabel:true}),
  /\+3/, "the coin prints its value signed");
assert.match(t.visualDie({kind:"modifier", result:-2, label:"Manual", tone:"mod"}, 0, 2, false, {sizePx:38, plainLabel:true}),
  /−2/, "…a negative one with the true minus sign");

/* The wire: the coin rides fh-roll/1 and a feed line rebuilds it. */
const manualWire = t.rollExportDice(manualEntry);
const wireCoin = plain(manualWire).find(die => die.role === "modifier" && die.label === "Manual");
assert.ok(wireCoin, "the Manual coin reaches the wire as a modifier");
assert.equal(wireCoin.result, 3, "with its value");
const rebuiltCoin = plain(t.feedLineDice({display:{dice:plain(manualWire)}}))
  .find(die => die.kind === "modifier" && die.label === "Manual");
assert.ok(rebuiltCoin, "and a feed line rebuilds it — the table sees the coin too");

/* The assembly: the coin is pending from the moment it is typed. */
t.state.history = []; t.state.feed.events = [];
t.state.trayResults = []; t.state.traySelection = []; t.state.rollSequence = null;
t.state.rollConfig = {name:"Arcana", ability:"INT", baseBonus:5, d20Mode:"flat",
  plusTwo:false, custom:3, bonusDice:[], destinyDieId:"", dc:"", note:""};
t.prepareTrayForConfig(t.state.rollConfig);
const manualBuild = plain(t.state.trayResults).find(die => die.kind === "modifier" && die.label === "Manual");
assert.ok(manualBuild && manualBuild.pending, "MOD +3 posé → a pending Manual coin waits in the assembly");
assert.match(t.renderJudgmentFrame(), /fh-cd-token/, "…and the judgment window draws it");
t.state.rollConfig = null; t.state.trayResults = [];

/* ── 12. R3 — clicking a die of a lower line calls the roll back up
   (décision Eric, lot BUGS 2026-08-05). surfaceTrayLine finally gets its
   left-click trigger: a die of any line BELOW the live hand — mine or the
   table's — climbs its roll to line 1, display order only. The guard
   rails: a <button> keeps its own action (the who-chip's reopen…), the
   LIVE hand is excluded (its dice already answer to menus and choices),
   and the right click stays the die menus'. Reopening in the Roll Builder
   is NOT wired here — that is the future eye icon's lot. */

assert.match(source, /function handleClick\(event\)\{if\(surfaceClickedTrayDie\(event\)\)return;/,
  "the surface check leads handleClick — before its button-only bail, which would drop a die span");
/* REWRITTEN (M1+M3 lot, 2026-08-06): the climb now records WHICH die was
   clicked (its index among the line's diewraps), so the fake line answers
   querySelectorAll and the fake dice register themselves on it. */
const fakeLine = id => {const line = {classList:{contains:cls => false}, getAttribute:() => id, dies:[],
  querySelectorAll:() => line.dies}; return line;};
const fakeDie = line => {const die = {closest:sel => sel === "li[data-tray-line]" ? line : null};
  if(line.dies) line.dies.push(die); return die;};
const clickOn = (die, onButton) => ({target:{closest:sel =>
  sel === "button" ? (onButton ? {} : null) : sel === ".fh-cd-diewrap" ? die : null}});
t.state.traySurfaceId = ""; t.state.traySurfaceAt = "";
assert.equal(t.surfaceClickedTrayDie(clickOn(fakeDie(fakeLine("mine-old")))), true,
  "a left click on a lower line's die is claimed by the surface gesture");
assert.equal(t.state.traySurfaceId, "mine-old", "…and calls that roll back up (surfaceTrayLine)");
const liveLine = {classList:{contains:cls => cls === "is-livehand"}, getAttribute:() => "live"};
assert.equal(t.surfaceClickedTrayDie(clickOn(fakeDie(liveLine))), false,
  "the live hand is excluded — its dice keep their existing interactions");
assert.equal(t.surfaceClickedTrayDie(clickOn(fakeDie(fakeLine("x")), true)), false,
  "a click that lands on a button is never claimed — the button keeps its own action");
assert.equal(t.surfaceClickedTrayDie({target:{closest:() => null}}), false,
  "a click outside any die is left to the rest of handleClick");
assert.equal(t.state.traySurfaceId, "mine-old", "none of the refused clicks surfaced anything");
/* A feed line's dice carry no handles (pinned in section 5) but ARE
   .fh-cd-diewrap spans inside a data-tray-line li — the same gesture
   reaches them: local display order, no remote write. */
t.state.traySurfaceId = ""; t.state.traySurfaceAt = "";

/* ── 13. M3 — the climb is SEEN, and the clicked die can be found again
   (décision Eric, lot correctif M1+M3, 2026-08-06). Three additions:
   (a) the registre scrolls back to its top (a one-shot USER gesture that
   replaces the remembered position instead of fighting fbe871e's
   preservation), (b) the climbed line flashes once, (c) THE die that was
   clicked keeps a persistent ring until something else happens — another
   climb, a new roll, a die menu opening, or CLEAR TRAY. */

// (c) the clicked die's index is carried into the climb's state.
t.state.traySurfaceId = ""; t.state.traySurfaceDie = null;
const idxLine = fakeLine("mine-old");
fakeDie(idxLine); // a first die at index 0
const secondDie = fakeDie(idxLine);
assert.equal(t.surfaceClickedTrayDie(clickOn(secondDie)), true, "the click on the line's second die is claimed");
assert.deepEqual(plain(t.state.traySurfaceDie), {lineId:"mine-old", di:1},
  "the climb remembers WHICH die was clicked — line id and index among its diewraps");
// (a)+(b) the one-shot flags are armed by the climb…
assert.equal(t.state.trayScrollToTop, true, "the climb asks the next render to scroll the registre to its top");
assert.equal(t.state.traySurfaceFlash, true, "…and the climbed line to announce itself");
/* REWRITTEN (same lot, bench finding): native scrollTo({behavior:"smooth"})
   proved inert on the reborn traylist in bench Chromium — the glide is now
   a hand-driven rAF ease-out (smoothTrayScrollTop), same contract. */
assert.match(source, /if\(keepTrayScroll&&!reduced\)smoothTrayScrollTop\(trayScroller,keepTrayScroll\)/,
  "render honours the scroll-to-top request (glide from the restored position)");
assert.match(source, /function smoothTrayScrollTop\(node,from\)\{[\s\S]{0,600}isConnected/,
  "…a glide that stops itself when a later render rebuilds the list");
assert.match(source, /prefers-reduced-motion/, "…and asks the motion preference before animating the glide");

// (b) the flash renders once on the climbed line, then is consumed.
t.state.history = [d20Entry("mine-new", "Arcana", 14, 21, 1),
  d20Entry("mine-old", "Stealth", 9, 16, 30,
    {bonusDice:[{id:"m3-bardic", label:"Bardic", sides:6, result:4, sourceIcon:"bardic", advantageMode:"flat"}]})];
t.state.feed.events = []; t.state.trayResults = []; t.state.rollSequence = null; t.state.diceSignatures = {};
const surfacedPass = t.diceTrayInner();
const surfacedLine = surfacedPass.match(/<li[^>]*data-tray-line="mine-old"[^>]*>/)[0];
assert.match(surfacedLine, /is-surfaced/, "the climbed line carries is-surfaced on the first render after the climb");
assert.doesNotMatch(surfacedPass.replace(surfacedLine, ""), /is-surfaced/, "and no other line does");
const secondPass = t.diceTrayInner();
assert.doesNotMatch(secondPass, /is-surfaced/, "the announcement plays once — a feed poll's re-render cannot restart it");
assert.match(css, /\.fh-cd-trayline\.is-surfaced\{animation:fh-cd-surfaced 1\.8s/, "the liseré is a ~1.8s one-shot animation");
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*\.fh-cd-trayline\.is-surfaced\{animation:none/,
  "reduced motion gets a static liseré that the next render clears — no animation");

// (c) the ring lands on exactly the clicked die, and persists across renders.
const pickedPass = t.diceTrayInner();
const pickedLine = pickedPass.match(/<li[^>]*data-tray-line="mine-old"[^>]*>[\s\S]*?<\/li>/)[0];
const wrapsBefore = pickedLine.split("fh-cd-diewrap").length - 1;
assert.ok(wrapsBefore >= 2, "the fixture line holds at least two diewraps (d20 + coin/bonus)");
assert.equal((pickedPass.match(/is-picked/g) || []).length, 1, "exactly one die in the whole registre wears the ring");
const beforePicked = pickedLine.slice(0, pickedLine.indexOf("is-picked"));
assert.equal(beforePicked.split("fh-cd-diewrap").length - 1, 2,
  "…and it is the SECOND diewrap of the climbed line — the one that was clicked (di=1)");
assert.match(t.diceTrayInner(), /is-picked/, "the ring is persistent — it survives a plain re-render");
assert.match(css, /\.fh-cd-diewrap\.is-picked\{outline:2px solid var\(--cd-gold-hi\)/,
  "the ring is an outline — no layout cost, the marked die neither grows nor shifts its row");

// Extinction: a new roll landing, any die menu opening, or CLEAR TRAY.
assert.match(source, /function addHistory\(entry\) \{[\s\S]{0,220}traySurfaceDie=null/,
  "a new roll landing retires the ring (addHistory)");
assert.match(source, /function openDieMenu\(node\)\{[\s\S]{0,180}traySurfaceDie=null/,
  "opening a die menu retires it too");
t.clearDiceTray(false);
assert.equal(t.state.traySurfaceDie, null, "CLEAR TRAY retires it as well");
t.state.traySurfaceId = ""; t.state.traySurfaceAt = ""; t.state.traySurfaceFlash = false; t.state.trayScrollToTop = false;

/* ---- M4: gradient ids are unique PER SVG INSTANCE. url(#id) resolves
   against the whole document to the FIRST def found; when that first def
   sits in a display:none container (the closed Stream, measured on the
   public bench: gviolet6/gash6), the browser paints nothing and the die
   goes white. Each svg must therefore reference only its OWN defs. */
const defIds = s => [...s.matchAll(/<linearGradient id="([^"]+)"/g)].map(m => m[1]);
const refIds = s => [...s.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);
const svgA = t.dieSvg(6, 30, "violet", "4");
const svgB = t.dieSvg(6, 30, "violet", "4");
assert.ok(defIds(svgA).length >= 2, "a dieSvg defines its body and glint gradients");
assert.notDeepEqual(defIds(svgA), defIds(svgB),
  "two successive dieSvg of the SAME material/sides carry DIFFERENT gradient ids — no document-wide sharing");
assert.equal(defIds(svgA).filter(id => defIds(svgB).includes(id)).length, 0,
  "…and no id overlaps between the two instances");
for (const s of [svgA, svgB, t.dieSvg(20, 52, "ivory", "17"), t.dieSvg(8, 26, "ash", "?")]) {
  const defs = defIds(s);
  for (const ref of refIds(s)) {
    assert.ok(defs.includes(ref), "every url(#" + ref + ") in an svg points to a def in THAT SAME svg");
  }
}
assert.doesNotMatch(css, /url\(#g/, "the CSS pins no gradient id — ids are free to be per-instance");

/* ---- M5: the PORTENT label must not slide under its select. The label
   column was a fixed 36px box while the text scales with --cd-fs; the
   spilled letters were painted over by the select 3px later. The fix is
   a cascade override: 36px becomes a MINIMUM and the box grows to fit. */
assert.match(source, /<div class=\\"fh-cd-dmrow\\"><span>Portent<\/span>"\+\s*"<select class=\\"fh-cd-dmportent/,
  "the Portent row is label THEN select, siblings in one flex row");
const fixedRule = css.indexOf(".fh-cd-card .fh-cd-dmrow>span{flex:none;width:36px");
const growRule = css.indexOf(".fh-cd-card .fh-cd-dmrow>span{width:auto;min-width:36px;white-space:nowrap}");
assert.ok(fixedRule >= 0 && growRule >= 0, "both the base rule and the M5 override exist");
assert.ok(growRule > fixedRule,
  "the override comes AFTER the fixed-width rule, so at equal specificity the label box grows to its content");

console.log("dice-tray: all assertions passed");
