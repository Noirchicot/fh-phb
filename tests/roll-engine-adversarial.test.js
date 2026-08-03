"use strict";

// Package 9 — adversarial bug hunt over the roll engine and the Destiny /
// Chaos / Arcane Awakening state machine (ARCHITECT-HANDOFF.md §6, "Package
// 9"). Each block below reproduces one concrete defect found by reading and
// fuzzing docs/javascripts/fh-player-sheet.js, then asserts the fixed
// behaviour. Every assertion here failed against the pre-fix source — see the
// session's report for the exact repro scripts used to confirm that before
// any line of fh-player-sheet.js was touched.
//
// Each block gets its OWN sandboxed load of the engine (a fresh vm context),
// because the fetch mock and exposed surface differ per scenario and cross-
// test state must never leak into a deterministic dice queue.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "docs", "javascripts", "fh-player-sheet.js");
const rawSource = fs.readFileSync(sourcePath, "utf8");

function loadEngine(expose, fetchImpl) {
  const source = rawSource.replace(/\}\)\(\);\s*$/, `
  globalThis.__t={${expose.join(",")}};
})();
`);
  let bucket = [];
  const crypto = {
    randomUUID: () => "id-" + Math.random().toString(16).slice(2),
    getRandomValues: array => { if (!bucket.length) throw new Error("Deterministic roll queue exhausted"); array[0] = bucket.shift(); return array; }
  };
  const storage = new Map();
  const sandbox = {
    URL, clearTimeout, console, crypto, setTimeout,
    window: {crypto, setTimeout, clearTimeout, history: null, location: {href: "https://example.test/player/"}},
    fetch: fetchImpl || (async () => ({ok: true, status: 200, json: async () => ({profile: {}})})),
    localStorage: {getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value))},
    document: {addEventListener() {}}
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: sourcePath});
  return {t: sandbox.__t, queue: (...results) => bucket.push(...results.map(r => Number(r) - 1))};
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
function baseDestiny(points) {
  return {score: 8, points: points, dice: [], pending: [], overreach: 0, awakeningOwed: 0, lastChange: null};
}

async function testBroadcastRetriesAfterFailedSend() {
  let fetchCalls = 0, failNext = false;
  const {t} = loadEngine(
    ["state", "broadcastEntry", "feedSignature"],
    async () => {
      fetchCalls++;
      if (failNext) { failNext = false; throw new Error("simulated network failure"); }
      return {ok: true, status: 200, json: async () => ({})};
    }
  );
  t.state.code = "FH2"; t.state.pseudo = "TestPlayer";
  t.state.feed.tableState = "recent";
  const entry = {
    id: "entry-1", kind: "d20", name: "Arcana", ability: "INT", baseBonus: 3,
    d20s: [15], kept: 15, natural: 15, plusTwo: false, custom: 0, bonusDice: [],
    guidance: null, bardic: null, destiny: null, dc: "", note: "",
    createdAt: new Date().toISOString(), adjusted: false, total: 18, outcome: ""
  };

  failNext = true;
  t.broadcastEntry(entry);
  await flush();
  assert.equal(t.state.feed.status, "offline", "a failed send must surface as offline, not as silently OK");
  assert.equal(fetchCalls, 1);

  // The entry never changed. Broadcasting it again (e.g. the next
  // openRollState pass) must actually retry the network call — a failed
  // delivery must never be recorded as if the table had seen it.
  t.broadcastEntry(entry);
  await flush();
  assert.equal(fetchCalls, 2, "a failed broadcast must remain retryable on the very next call for the same, unchanged entry");
  assert.equal(t.state.feed.status, "", "and a retry that lands clears the offline flag for real, not by coincidence");
  // Values crossing out of the vm sandbox's own realm compare fine with
  // assert.equal on primitives; a whole-object deepEqual against a
  // same-realm literal spuriously fails on prototype identity across
  // realms (the same reason existing tests wrap vm arrays in Array.from).
  var recorded = t.state.feed.sent[entry.id];
  assert.equal(recorded.signature, t.feedSignature(entry), "the confirmed send is recorded under this entry's signature");
  assert.equal(recorded.rev, 0, "the CONFIRMED send is rev 0 — the earlier failed attempt must not have consumed a revision number");

  // The companion invariant this fix must not break: two SYNCHRONOUS calls
  // for the same still-unchanged entry (no failure, no await between them)
  // must still cost exactly one network request — see campaign-feed.test.js
  // "broadcasting an unchanged entry again costs nothing".
  fetchCalls = 0;
  const entry2 = Object.assign({}, entry, {id: "entry-2"});
  t.broadcastEntry(entry2);
  t.broadcastEntry(entry2);
  await flush();
  assert.equal(fetchCalls, 1, "back-to-back synchronous broadcasts of an unchanged, still in-flight entry must not double-send");
}

function testAwakeningOwedCountsEachDraw() {
  const {t, queue} = loadEngine(["state", "quickRoll", "keepArcana"]);
  t.state.code = "FH2"; t.state.pseudo = "P";
  t.state.destiny = baseDestiny(0);
  t.state.character = {destinyBuild: {arcana: {name: "The Hermit"}}, build: {}};
  t.state.vitals = {current: null, max: null, exhaustion: 0, shortRestUsed: false};

  queue(20); t.quickRoll("Arcana", "INT", 5);
  assert.equal(t.state.destiny.awakeningOwed, 1, "one Natural 20 at 0 points owes one draw");
  queue(20); t.quickRoll("Investigation", "INT", 5);
  assert.equal(t.state.destiny.awakeningOwed, 2, "REGRESSION: a second Natural 20 at 0, before the first card is drawn, owes a SECOND draw — it must not collapse back into the same single flag");

  t.keepArcana({name: "The Fool", numeral: "0", power: "", vibration: "", meaning: ""}, false);
  assert.equal(t.state.destiny.awakeningOwed, 1, "drawing once settles exactly one owed Awakening");
  t.keepArcana({name: "The Fool", numeral: "0", power: "", vibration: "", meaning: ""}, false);
  assert.equal(t.state.destiny.awakeningOwed, 0, "and the second draw settles the second — nothing is lost, nothing goes negative");
}

function testPendingFateNeverDropsSilently() {
  const {t} = loadEngine(["state", "addPendingFate", "pendingFate"]);
  t.state.destiny = baseDestiny(5);

  t.addPendingFate({kind: "chaos", entryId: "r1", ability: "INT", name: "defy #1"});
  t.addPendingFate({kind: "chaos", entryId: "r2", ability: "STR", name: "defy #2"});
  t.addPendingFate({kind: "overreach", entryId: "r3", ability: "WIS", dc: 14, overreach: 4});
  t.addPendingFate({kind: "chaos", entryId: "r4", ability: "CHA", name: "defy #4"});
  assert.equal(t.state.events.length, 0, "no debt has been dropped yet — no expiry line should exist");

  t.addPendingFate({kind: "overreach", entryId: "r5", ability: "DEX", dc: 11, overreach: 1});
  assert.equal(t.pendingFate().some(item => item.entryId === "r1"), false, "the strip still holds only 4 — the oldest is evicted under load, same as before");
  assert.equal(t.pendingFate().length, 4);
  // REGRESSION: the old code called .slice(-4) and threw the oldest debt away
  // with no trace at all — a fatigue-bearing Chaos/Overreach obligation simply
  // vanishing is exactly the silent fallback ARCHITECT-HANDOFF.md §2 forbids.
  assert.equal(t.state.events.length, 1, "an eviction must leave a visible trace instead of vanishing without one");
  assert.match(t.state.events[0].text, /never faced.*expired/i);
}

function testForcedDieResultRejectsFractionalHostileValues() {
  const {t} = loadEngine(["forcedDieResult", "normalizeBonusDie", "makeDiePlan"]);
  assert.equal(Number.isInteger(t.forcedDieResult(15.7, 20)), true, "a die face must be an integer even if the stored value is not");
  assert.equal(t.forcedDieResult(15.7, 20), 16, "rounds rather than truncating toward a face that was never actually the closest one");
  assert.equal(t.forcedDieResult("12.25", 20), 12);
  assert.equal(t.forcedDieResult(0.4, 20), 1, "still clamps to the die's real minimum face");
  assert.equal(t.forcedDieResult(-5, 8), 1);
  assert.equal(t.forcedDieResult(99, 8), 8);

  const bonus = t.normalizeBonusDie({label: "Corrupted", sides: 8, forcedResult: 6.6}, 0);
  assert.equal(bonus.forcedResult, 7, "a bonus die rehydrated from a corrupted/hand-edited profile also lands on a real face");

  const plan = t.makeDiePlan(20, "flat", 7.9);
  assert.equal(plan.result, 8, "and the plan that actually feeds the total carries the sanitized integer, not the raw hostile input");
}

function testArcaneRefusalUpdatesThePointRecord() {
  // Found by the roll-vocabulary lot (UI-ROLL-VOCABULARY.md §5, 2026-08-03):
  // refusing an Arcane 1 zeroed the pool via setDestinyPoints but never touched
  // spent.pointsAfter, so the Ruling and the destiny-spend badge kept quoting
  // the pre-refusal balance ("Current 9") while the real pool was 0.
  const {t, queue} = loadEngine(["state", "spendDestinyDie", "resolveArcaneOne", "rollRuling", "rollBadges"]);
  t.state.code = "FH2"; t.state.pseudo = "P";
  t.state.destiny = baseDestiny(8);
  t.state.destiny.dice = [{id: "d1", sides: 8, available: true, colour: "gold"}];
  t.state.vitals = {current: null, max: null, exhaustion: 0, shortRestUsed: false};

  queue(1);
  const spent = t.spendDestinyDie("d1", true);
  assert.equal(spent.criticalFailure, true);
  assert.equal(spent.pointsAfter, 9, "the granted point is on the record at spend time");

  const entry = {id: "e1", kind: "d20", name: "Test", ability: "INT", modifier: 0,
    kept: 10, natural: null, dc: "", dice: [], destiny: spent};
  t.state.history.unshift(entry);
  t.resolveArcaneOne("e1", "chaos");

  assert.equal(t.state.destiny.points, 0, "refusing empties the pool");
  assert.equal(spent.pointsAfter, 0, "REGRESSION: the record must say the pool is empty, not quote the pre-refusal 9");
  const ruling = t.rollRuling(entry);
  assert.equal(ruling.account.some(line => /Current 9/.test(line)), false, "the Ruling no longer quotes the stale balance");
  assert.equal(ruling.account.some(line => /Current 0/.test(line)), true, "it states where the refusal actually leaves you");
  const destinyBadge = t.rollBadges(entry).find(badge => badge.id === "destiny-spend");
  assert.match(destinyBadge.t, /→ 0/, "and the badge agrees with the Ruling on the real balance");
}

(async () => {
  await testBroadcastRetriesAfterFailedSend();
  testAwakeningOwedCountsEachDraw();
  testPendingFateNeverDropsSilently();
  testForcedDieResultRejectsFractionalHostileValues();
  testArcaneRefusalUpdatesThePointRecord();
  console.log("Roll-engine adversarial regression tests passed.");
})().catch(error => { console.error(error); process.exit(1); });
