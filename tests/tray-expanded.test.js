"use strict";

/* Phase 6 (architecture lot, dock-dice-tray) — le tray déployé.

   Eric's ratified ask: « voir un max de l'historique du stream de DÉS,
   avec un bouton — ça recouvrirait tout sauf la fiche id du perso ».
   The deployed is the TRAY writ large — trayLineHtml's own lines on the
   ramp-A felt — never the textual Stream (T22, untouched). Ruled here:

   1. the band carries the door: an expand button beside the ⊕;
   2. the overlay covers everything but Identity (top pinned to the
      measured header; 53px CSS fallback), z 26 — over band 25 and the
      summoned group 24, under Stream 27;
   3. its lines are the tray's own gabarit, frozen: every die a
      zero-context snapshot, no menus, no reopen, no climb — a click
      only pings;
   4. depth = everything the session knows locally: state.history
      (MAX_HISTORY 20) merged with the feed's rolls (FEED_MAX 60,
      echoes deduped), true chronology, newest first, no ten-line cap;
   5. closed by ×, by the band's button again, by Escape — and the SAFE
      takeover rule: opening is refused while anything holds the stage,
      and render() retires the deployed when a hold arrives. */

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
  globalThis.__fhTrayExp = {
    state, TRAY_MAX, MAX_HISTORY, FEED_MAX,
    expandedTrayLines, renderTrayExpanded, toggleTrayExpanded,
    trayLines, trayLineHtml, trayDiceFromEntry, feedLineDice,
    renderDestiny, renderDiceTray, onKeydown, overlayHeld, render
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
const t = sandbox.__fhTrayExp;

function isoAt(minutesAgo) { return new Date(Date.now() - minutesAgo * 60000).toISOString(); }
function d20Entry(id, name, kept, total, minutesAgo, extra) {
  return Object.assign({
    id, kind:"d20", name, ability:"INT", baseBonus:7, d20Mode:"flat", d20s:[kept], kept,
    natural:kept, plusTwo:false, custom:0, guidance:null, bardic:null, destiny:null,
    bonusDice:[], dc:"", natChoice:null, createdAt:isoAt(minutesAgo), total
  }, extra || {});
}
function feedRoll(id, pseudo, character, title, total, minutesAgo) {
  return {
    id, type:"roll", rollId:id, rev:0, ts:isoAt(minutesAgo),
    actor:{pseudo, character, ddbCharacterId:null},
    display:{schema:"fh-roll/1", title, total, outcome:"Success", parts:[], badges:[], dc:14,
      dice:[{sides:20, result:total-2, label:"d20", role:"base"},{sides:0, result:2, label:"Bonus", role:"modifier"}]}
  };
}

t.state.pseudo = "Me";
t.state.code = "FH1";
t.state.character = {name:"Yedrivel"};
t.state.destiny = {points:2, score:3, dice:[], awakeningOwed:0};

/* ── 1. The door on the band, beside the ⊕ ─────────────────────────── */

const band = t.renderDestiny({destinyBuild:{arcana:{}}});
assert.match(band, /data-tray-expand/, "the band carries the deployed history's button");
assert.match(band, /data-tray-expand[^>]*title="Expand the dice history"/, "with the clear title Eric asked for");
const expandAt = band.indexOf("data-tray-expand"), freeAt = band.indexOf("data-free-pop");
assert.ok(expandAt >= 0 && freeAt >= 0 && expandAt < freeAt, "the expand button sits just before (beside) the ⊕ on the band");
assert.match(css, /\.fh-cd-expbtn\{[^}]*border:1px dashed rgba\(201,164,90,\.55\)/, "same dashed-gold family as the ⊕");

/* ── 2. The overlay: geometry, ramp inheritance, z-order ───────────── */

t.state.history = [];
t.state.feed.events = [];
let overlay = t.renderTrayExpanded();
assert.match(overlay, /data-zone="tray-expanded"/, "the deployed is its own zone");
assert.match(overlay, /class="fh-cd-zone fh-cd-dicetray fh-cd-trayexp"/,
  "it carries .fh-cd-dicetray so ramp A and every tray line tint apply by inheritance — one visual language");
assert.match(overlay, /is-empty/, "an empty session says so instead of rendering a void");
assert.match(overlay, /class="fh-cd-trayexp-x"[^>]*data-tray-expand[^>]*aria-label="Close the dice history"/,
  "the × on the cap closes through the same data hook as the band's button");
/* Geometry: .fh-cd-dicetray pins left/right/bottom 0 (line reused); the
   deployed overrides top (Identity stays above) and z-index. */
assert.match(css, /\.fh-cd-trayexp\{top:53px;height:auto;z-index:26/,
  "top 53px fallback (render() pins the measured header inline), z 26 — over band 25/group 24, under Stream 27");
assert.match(source, /headNode\.offsetHeight\)expNode\.style\.top=headNode\.offsetHeight\+"px"/,
  "render() measures the real header so the covered area is exact at any zoom");
assert.match(source, /keepExpScroll/, "the deployed list's scroll survives the feed-poll re-renders like the tray's");

/* ── 3. Depth: all of history + all of the feed, deduped, newest first ── */

t.state.history = [];
for (let i = 0; i < 20; i++) t.state.history.push(d20Entry("mine-" + i, "Arcana", 12, 19, i * 2));
t.state.feed.events = [];
for (let i = 0; i < 15; i++) t.state.feed.events.push(feedRoll("feed-" + i, "Brunir", "Brunir", "Stealth", 14, i * 2 + 1));
// My own echo and a non-roll event must both be dropped.
t.state.feed.events.push(feedRoll("mine-3", "Me", "Yedrivel", "Arcana", 19, 6));
t.state.feed.events.push({id:"note-1", type:"note", ts:isoAt(4)});
const lines = t.expandedTrayLines();
assert.equal(lines.length, 35, "20 of mine + 15 table rolls — no ten-line cap, echoes and non-rolls dropped");
assert.equal(t.MAX_HISTORY, 20, "my side of the depth is MAX_HISTORY (documented: 20)");
assert.equal(t.FEED_MAX, 60, "the table's side is FEED_MAX (documented: 60)");
assert.equal(lines[0].id, "mine-0", "true chronology — the newest roll leads");
for (let i = 1; i < lines.length; i++)
  assert.ok(String(lines[i-1].ts) >= String(lines[i].ts), "…and every line is newer than the one under it");
assert.ok(lines.every(line => Array.isArray(line.dice)), "every line rebuilt its dice for the shared gabarit");
// The surface override is the ten-line registre's gesture, not the record's.
t.state.traySurfaceId = "mine-19"; t.state.traySurfaceAt = new Date().toISOString();
assert.equal(t.expandedTrayLines()[0].id, "mine-0", "a climbed line does not reorder the deployed's true chronology");
t.state.traySurfaceId = ""; t.state.traySurfaceAt = "";

/* ── 4. The lines: the tray's gabarit, frozen ──────────────────────── */

overlay = t.renderTrayExpanded();
assert.match(overlay, /35 rolls this session/, "the cap counts the real depth");
const lineCount = (overlay.match(/fh-cd-trayline/g) || []).length;
assert.equal(lineCount, 35, "every known roll renders as a line");
assert.ok(!/is-l1/.test(overlay) && !/is-mid/.test(overlay), "no privileged line — the deployed is a registre, all is-static");
assert.match(overlay, /is-static/, "…the tray's own static band class, same gabarit");
assert.match(overlay, /data-tray-line="mine-0"/, "lines keep their identity for the ping");
assert.match(overlay, /data-snapshot="1"/, "settled dice are born bitmap snapshots — zero live WebGL contexts");
assert.doesNotMatch(overlay, /data-wave=/, "nothing lands in the deployed — no live host anywhere");
assert.doesNotMatch(overlay, /data-die-landed/, "die menus are cleanly disabled: no handles, the delegation never matches");
assert.doesNotMatch(overlay, /data-history-id/, "no reopen button either — the live hand stays the tray's affair");
assert.match(overlay, /HARNESS|BRUNIR|Yedrivel/i, "the phase-5 flank (owner's name) rides every line");
// The ping is the only line gesture, and the climb declines deployed lines.
assert.match(source, /pingExpandedTrayLine/, "a click on a deployed line pings it");
assert.match(source, /line\.closest&&line\.closest\("\.fh-cd-trayexp"\)\)return false/,
  "…and surfaceClickedTrayDie declines the deployed — no climb from a surface where everything is visible");
assert.match(css, /\.fh-cd-trayexp \.fh-cd-trayline\.is-ping\{animation:fh-cd-exp-ping/, "the ping's brief highlight is CSS-only");
// The tray itself is untouched by the deployed's existence.
assert.match(t.renderDiceTray(), /data-zone="dice-tray"/, "the tray still renders as its own zone");
assert.equal(t.trayLines().length, t.TRAY_MAX, "…and keeps its ten-line registre");

/* ── 5. Open/close: toggle, Escape, and the SAFE takeover rule ─────── */

t.state.trayExpanded = false;
t.state.rollSequence = null; t.state.trayPrompt = null; t.state.pendingArmed = null;
t.state.diePrompt = null; t.state.trayRevealAt = 0;
t.state.freePop = true; t.state.destinyPoolMenu = true;
t.toggleTrayExpanded();
assert.equal(t.state.trayExpanded, true, "the band's button opens the deployed");
assert.equal(t.state.freePop, false, "…and closes the ⊕ popover it would cover");
assert.equal(t.state.destinyPoolMenu, false, "…and the Destiny menu too — nothing stranded underneath");
t.toggleTrayExpanded();
assert.equal(t.state.trayExpanded, false, "the same button closes it again");

// Escape closes it first, before anything it covers.
t.state.trayExpanded = true;
t.onKeydown({key:"Escape", target:{tagName:"DIV", id:""}, preventDefault(){}});
assert.equal(t.state.trayExpanded, false, "Escape retires the deployed");

// SAFE rule, half 1: opening is refused while a transaction holds the stage.
t.state.message = "";
t.state.rollSequence = {phase:"nat1", entry:{}, entryId:"mine-0"};
t.toggleTrayExpanded();
assert.equal(t.state.trayExpanded, false, "a blocking phase refuses the deployed");
assert.match(t.state.message, /Finish the current roll/, "…and says why (warnRollLocked)");
// SAFE rule, half 2: a hold arriving while deployed retires it (render's guard).
t.state.rollSequence = null;
t.state.trayExpanded = true;
t.state.trayPrompt = {type:"nat1", entryId:"mine-0"};
assert.equal(t.overlayHeld(), true, "a takeover prompt holds the stage");
t.render(); // no root in the harness: the guard runs before the early return
assert.equal(t.state.trayExpanded, false, "…and render() retires the deployed the instant the hold arrives — a takeover is never hidden");
t.state.trayPrompt = null;
assert.match(source, /if\(state\.trayExpanded&&overlayHeld\(\)\)state\.trayExpanded=false/,
  "the takeover rule is render()'s first word, ahead of every early return");
/* Belt and braces, measured at the bench: a jet's FIRST render arms its
   reveal DURING diceTrayInner — after render's overlayHeld guard has run —
   so a roll born while deployed would keep its first frame covered. The
   birth gesture itself (invokeBuilder, every path a jet starts by) retires
   the deployed instead. */
assert.match(source, /function invokeBuilder\(\)\{[\s\S]{0,600}state\.trayExpanded=false;\}/,
  "a jet being born retires the deployed on the gesture, not one render later");

console.log("Deployed tray (phase 6): all tests passed");
