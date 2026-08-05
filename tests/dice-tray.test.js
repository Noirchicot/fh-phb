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
      on the cap in plain words — never a silent fallback;
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
    surfaceTrayLine
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
/* REWRITTEN (lot texte T14, 2026-08-04): the DICE TRAY word is gone — the
   dice say it — and the cap is led by the state chip, with CLEAR TRAY's ×
   on its right edge (D4). */
assert.doesNotMatch(t.renderDiceTray(), /DICE TRAY/, "the cap no longer spells the zone's name");
assert.match(t.renderDiceTray(), /fh-cd-traystate/, "the state chip leads the cap instead");
assert.match(t.renderDiceTray(), /fh-cd-trayclear[^>]*data-clear-tray/, "and the × on the cap is CLEAR TRAY's final seat");
/* Lot BACKLOG-A (Eric, revue 2026-08-04): the cap is a BAND now — same
   56px as the standard mid/static lines, contents scaled to fill it,
   and the zone's deterministic height follows (284 → 320) so the four
   bands stay exactly visible. */
assert.match(css, /\.fh-cd-root\{--cd-traycap-h:56px;--cd-tray-h:320px\}/,
  "the cap takes a band's height (56px, like .is-mid/.is-static) and the zone grows by the same 36px");
assert.match(css, /\.fh-cd-dicetray>\.fh-cd-cap\{height:var\(--cd-traycap-h\)/,
  "the cap's height is the band variable, not a fossil pixel value");
assert.match(css, /\.fh-cd-trayline\.is-mid,\.fh-cd-trayline\.is-static\{min-height:56px\}/,
  "…and 56 is still what a standard band measures (change one, change both)");
assert.match(css, /\.fh-cd-trayarrow\.is-up\{top:calc\(var\(--cd-traycap-h\) \+ 4px\)\}/,
  "the up chevron follows the cap's lower edge instead of assuming ~20px");
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
assert.match(lines[0], /--fh-static-die-size:44px/, "its dice land at 44px");
assert.match(lines[1], /is-mid/, "rolls 2-4 are the small band");
/* REWRITTEN (Eric, 2026-08-04): lower lines sacrifice the seal for SIZE —
   always naked, 30px for a small hand. At rest they are snapshots (zero
   live contexts); a die landing there still animates, as a live host. */
assert.match(lines[1], /is-naked/, "lower-line dice are bare — the seal is sacrificed for size");
assert.match(lines[1], /--fh-static-die-size:30px/, "and larger: 30px for a small hand");
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
assert.match(rollingPass, /data-settle-size="20"/, "each die knows the size it will zoom to at settle");
assert.match(rollingPass, /--fh-static-die-size:16px/, "and rolls small");
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
assert.doesNotMatch(twelvePass, /data-wave="1"/, "twelve dice roll at once — never a second wave");
assert.doesNotMatch(twelvePass, /is-rows/, "and sit on one line");
t.state.history = [trayHand("twentyfive", 25, 88)];
t.state.diceSignatures = {};
const rowsPass = t.diceTrayInner();
assert.match(rowsPass, /is-rows/, "thirteen to thirty wrap into rows of ten");
assert.match(rowsPass, /data-wave="2"/, "…and tumble row after row: 10, 10, 5");
assert.match(rowsPass, /--fh-cd-tray-die-size:20px/, "the row rides the line's own settled die size");
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
assert.doesNotMatch(wrappedBonus, /fh-cd-src is-|fh-cd-src-mini/, "and carries NO separate source token — the seal is the die");
assert.match(wrappedBonus, /fh-cd-src" title=/, "the empty slot still names the source on hover (reclaiming it = the measures lot)");

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

/* ── 4d. The carpet is a clean taupe ramp (maquette C, Eric 2026-08-05) ─
   The woven dark carpet gave way to a continuous textureless gradient —
   parchment-to-ink taupe, light at line 1. The LAST background declared
   for the tray must be the ramp alone (no radial glow, no weave), and
   the cap gold was re-tinted for the lighter top (#c9a45a read 3.2:1 on
   #5c5344; #eac878 reads 4.7:1). */
const lastTrayBg = [...css.matchAll(/\.fh-cd-dicetray\{background:([^}]+)\}/g)].pop();
assert.equal(lastTrayBg && lastTrayBg[1],
  "linear-gradient(180deg,#5c5344 0%,#4a4436 34%,#38332a 68%,#26231c 100%)",
  "the tray's last word on background is the plain « C » ramp — no texture layers");
assert.match(css, /\.fh-cd-dicetray>\.fh-cd-cap\{color:#eac878\}/,
  "the cap's gold was lifted to hold 4.5:1 on the ramp's light top");

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

/* ── 6. LIVE / RECENT / OFF on the cap — never a silent fallback ───── */

/* REWRITTEN (lot texte T15/T17, 2026-08-04): the status phrase rides the
   chip's hover title now, and URL…/Refresh live behind the cap's ⋮ — the
   state itself is still always shown, by the chip. */
t.state.feed.tableState = "recent";
assert.match(t.diceTrayInner(), /cloud log, about 30s behind/, "RECENT still says what it is — on the chip's title");
assert.match(t.diceTrayInner(), /data-tray-capmenu/, "and the cap offers its ⋮ (RECENT has a refresh to hold)");
t.state.trayCapMenu = true;
assert.match(t.diceTrayInner(), /data-feed-refresh/, "the ⋮ holds the one manual refresh (RECENT is never polled)");
t.state.feed.tableState = "live";
assert.match(t.diceTrayInner(), /every roll at the table, live/, "LIVE says what it is");
assert.doesNotMatch(t.diceTrayInner(), /data-feed-refresh/, "no refresh needed when the table streams");
t.state.trayCapMenu = false;
t.state.feed.tableState = "off";
const offCap = t.diceTrayInner();
assert.match(offCap, /not reaching the table/, "OFF is written in plain words on the chip's title");
assert.match(offCap, /is-off/, "and wears the loud state chip — never folded into a quieter caption");
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

console.log("dice-tray: all assertions passed");
