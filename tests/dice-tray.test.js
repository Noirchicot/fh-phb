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
const firstLine = inner.slice(inner.indexOf("fh-cd-trayline"));
const whoAt = firstLine.indexOf("fh-cd-tray-who");
const diceAt = firstLine.indexOf("fh-cd-tray-dice");
const rulingAt = firstLine.indexOf("fh-cd-tray-ruling");
assert.ok(whoAt >= 0 && diceAt > whoAt && rulingAt > diceAt,
  "a line reads left to right: who, then the dice, then the ruling");
assert.match(inner, />Yedrivel</, "the name is written in full — no initials, no portrait");
assert.doesNotMatch(inner, /fh-cd-portrait/, "no portrait in the tray line");
assert.match(inner, /<time>/, "the time exists on the line…");
assert.match(inner, /fh-cd-trayline:hover \.fh-cd-tray-who time\{opacity:1\}/.test(css) ? /<time>/ : /NEVER/,
  "…and the stylesheet only surfaces it on hover");
assert.match(inner, /fh-cd-tray-title/, "tier 1: the roll's name in bold");
assert.match(inner, /fh-cd-tray-total/, "tier 2: the total");
assert.match(inner, /Arcana \+7/, "the title carries the bonus, not the arithmetic");

/* ── 4. Sizes per band: large, small, snapshot ─────────────────────── */

t.state.history = [];
for (let i = 0; i < 6; i++) t.state.history.push(d20Entry("s" + i, "Arcana", 12, 19, i));
t.state.feed.events = [];
t.state.trayResults = []; t.state.traySelection = []; t.state.rollSequence = null; t.state.destinyStaged = null;
const banded = t.diceTrayInner();
const lines = banded.split("fh-cd-trayline").slice(1);
assert.match(lines[0], /is-l1/, "the newest roll is the large band");
assert.match(lines[0], /--fh-static-die-size:44px/, "its dice land at 44px");
assert.match(lines[1], /is-mid/, "rolls 2-4 are the small band");
assert.match(lines[1], /--fh-static-die-size:24px/, "their dice are 24px — small, but still able to roll");
assert.doesNotMatch(lines[1], /data-snapshot/, "a small-band die keeps a live canvas so it CAN animate");
assert.match(lines[4], /is-static/, "roll 5 opens the Static Area");
assert.match(lines[4], /data-snapshot="1"/, "where dice are frozen snapshots — no live WebGL context");
assert.match(lines[4], /data-animate="0"/, "and nothing animates, ever");
assert.match(css, /\.fh-cd-trayline\.is-static \.fh-cd-die\.is-spinning\{animation:none\}/,
  "even a remounted SVG die cannot replay its spin down there");

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
assert.match(feedLineHtml, />Ilyra</, "the who is the character's full name");

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
