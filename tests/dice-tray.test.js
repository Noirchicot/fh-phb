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
    state, TRAY_MAX, trayLines, trayDiceFromEntry, feedLineDice, diceTrayInner,
    renderDiceTray, renderStageZone, rollExport, rollExportDice, visualDie, clearDiceTray
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
assert.match(t.renderDiceTray(), /DICE TRAY/, "and the cap names it");
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

/* ── 4c. The dice loupe (Eric, 2026-08-04) ─────────────────────────────
   Right click / long press magnifies a lower line's dice zone ×1.5; left
   click, a tap, D or Escape cancels. Line 1 keeps its die menus. */

t.state.history = [];
for (let i = 0; i < 6; i++) t.state.history.push(d20Entry("s" + i, "Arcana", 12, 19, i));
t.state.trayDiceZoom = "";
const unzoomed = t.diceTrayInner();
assert.match(unzoomed, /data-tray-line="s1"/, "every line carries its id so the loupe can find it");
assert.doesNotMatch(unzoomed, /is-zoomed/, "no loupe until asked");
t.state.trayDiceZoom = "s1";
const zoomedPass = t.diceTrayInner();
assert.match(zoomedPass, /is-zoomed[^"]*" data-tray-line="s1"/, "the asked line wears the loupe");
assert.equal((zoomedPass.match(/is-zoomed/g) || []).length, 1, "one line only");
t.state.trayDiceZoom = "s0"; // s0 is line 1 (the large band)
assert.doesNotMatch(t.diceTrayInner(), /is-zoomed/, "the large line never wears it — its dice are already large and keep their menus");
t.state.trayDiceZoom = "";
assert.match(css, /\.fh-cd-trayline\.is-zoomed \.fh-cd-tray-dice\{transform:scale\(1\.5\)/, "the loupe is a ×1.5 magnification of the dice zone only");

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

t.state.feed.tableState = "recent";
assert.match(t.diceTrayInner(), /cloud log, about 30s behind/, "RECENT says what it is");
assert.match(t.diceTrayInner(), /data-feed-refresh/, "and offers the one manual refresh (RECENT is never polled)");
t.state.feed.tableState = "live";
assert.match(t.diceTrayInner(), /every roll at the table, live/, "LIVE says what it is");
assert.doesNotMatch(t.diceTrayInner(), /data-feed-refresh/, "no refresh needed when the table streams");
t.state.feed.tableState = "off";
const offCap = t.diceTrayInner();
assert.match(offCap, /not reaching the table/, "OFF is written in plain words on the cap");
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

console.log("dice-tray: all assertions passed");
