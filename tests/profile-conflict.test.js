"use strict";

// DOM-level test for plan §13.13.2/§13.13.4: every write to /profile/:code/:pseudo
// (and its /pull sub-route) carries the known revision, a 409 is never retried or
// silently applied, and the offered "Recharger" action adopts the server's
// current document without attempting any auto-merge (§13.13.4 explicitly rules
// that out). Install linkedom first, same as player-sheet.integration.test.js:
//   npm install   (linkedom is a devDependency in package.json)
const assert = require("node:assert/strict");
const webcrypto = require("node:crypto").webcrypto;
const crypto = {randomUUID:()=>webcrypto.randomUUID(),getRandomValues:array=>{array[0]=10;return array;}};
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("linkedom");

const {window} = parseHTML("<html><body><div id=\"fhPlayerSheet\" data-rules=\"../\" data-inventory=\"../party-inventory.html\" data-soulforge=\"../soulforge-tool.html\"></div></body></html>");
const {document} = window;
const storage = new Map();
window.setTimeout = setTimeout;
window.clearTimeout = clearTimeout;
window.scrollTo = () => {};

const sourcePath = path.join(__dirname,"..","docs","javascripts","fh-player-sheet.js");
const source = fs.readFileSync(sourcePath,"utf8").replace(/\}\)\(\);\s*$/, `
  globalThis.__fhPlayerSheetConflict = {state, render, effectiveCharacter, loadPlayState, saveProfile, loadBuild, stopFeed};
})();
`);

// Scripted fetch: each call pulled off `queue` in order, so a test can line up
// exactly the response sequence it wants to assert against.
let fetchLog = [];
let queue = [];
function mockFetch(url, options) {
  fetchLog.push({url, body: options && options.body ? JSON.parse(options.body) : null});
  const next = queue.shift() || {status:200, body:{profile:{}}};
  return Promise.resolve({
    ok: next.status < 300,
    status: next.status,
    json: async () => next.body
  });
}

const sandbox = {
  URL,clearTimeout,console,crypto,document,setTimeout,window,
  fetch: (...args) => mockFetch(...args),
  localStorage:{
    getItem:key=>storage.has(key)?storage.get(key):null,
    setItem:(key,value)=>storage.set(key,String(value))
  }
};
sandbox.globalThis = sandbox;
const panelDir = path.join(__dirname,"..","docs","javascripts");
for (const name of fs.readdirSync(panelDir).filter(f=>/^fh-panel-.*\.js$/.test(f)).sort()) {
  vm.runInNewContext(fs.readFileSync(path.join(panelDir,name),"utf8"),sandbox,{filename:name});
}
/* fh-utils.js et fh-dice-visual.js sont chargés avant le dock par mkdocs.yml
   (extraction du 2026-08-07) ; le bac à sable doit faire pareil. */
["fh-utils.js", "fh-dice-visual.js"].forEach(function (f) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "docs", "javascripts", f), "utf8"), sandbox, {filename: f});
});
vm.runInNewContext(source,sandbox,{filename:sourcePath});
document.dispatchEvent(new window.Event("DOMContentLoaded"));

const t = sandbox.__fhPlayerSheetConflict;
t.state.code = "FH1";
t.state.pseudo = "Conflict Tester";
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

(async () => {
  // 1. GET /profile/:code/:pseudo adopts the server's revision as the dock's
  // starting point (§13.13.3's "adopts their revisions as its own"). The real
  // Worker (fh-worker src/worker.js publicCharacterProfile) nests revision
  // inside the profile document -- never at the response's top level -- so
  // every mock below matches that shape rather than the old (wrong) one that
  // let this bug ship undetected in the phase-2 suite.
  t.state.record = {build:{
    character:{name:"Conflict Tester",abilityScores:{STR:10,DEX:12,CON:14,INT:16,WIS:13,CHA:14}},
    meta:{class:"Wizard",level:3,species:"Human"},nativeSkillTiers:{},skills:[],destiny:{score:8}
  }};
  queue = [
    {status:200, body:{builds:[{pseudo:"Conflict Tester"}]}},
    {status:200, body:{profile:{vitalsState:{current:10,max:10}, revision:7}}}
  ];
  fetchLog = [];
  t.loadBuild();
  await flush(); await flush();
  assert.equal(t.state.profileRevision, 7, "the known revision comes from profile.revision in the GET response, not the top level");

  // 2. A normal write states the revision it is based on (§13.13.2).
  queue = [{status:200, body:{profile:{note:"saved", revision:8}}}];
  fetchLog = [];
  await t.saveProfile({note:"hello"});
  const writeCall = fetchLog[fetchLog.length-1];
  assert.match(writeCall.url, /\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(writeCall.body.revision, 7, "the write carries the revision the dock knew before this call");
  assert.equal(t.state.profileRevision, 8, "a successful write adopts the new revision nested in profile.revision");

  // 2b. Two successive saves in a row must not raise a false conflict: each
  // carries forward the revision the previous response actually stamped.
  queue = [{status:200, body:{profile:{note:"saved-again", revision:9}}}];
  fetchLog = [];
  await t.saveProfile({note:"hello again"});
  assert.equal(fetchLog[0].body.revision, 8, "the second successive save carries the revision the first save just adopted");
  assert.equal(t.state.profileRevision, 9, "the second successive save adopts its own new revision without a false conflict");

  // 3. Character writes follow the same LIVE/RECENT/OFF authority split as
  // the roll feed, but keep writing to the cloud whenever the dock is not LIVE.
  t.state.feed.tableUrl = "https://table.example.test";

  t.state.feed.tableState = "live";
  queue = [{status:200, body:{profile:{note:"table", revision:10}}}];
  fetchLog = [];
  await t.saveProfile({note:"table"});
  assert.equal(fetchLog.length, 1, "LIVE profile writes have exactly one destination");
  assert.match(fetchLog[0].url, /^https:\/\/table\.example\.test\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(fetchLog[0].body.revision, 9, "LIVE writes still carry the known revision");
  assert.equal(t.state.profileRevision, 10, "LIVE writes adopt the table server's stamped revision");

  t.state.feed.tableState = "recent";
  queue = [{status:200, body:{profile:{note:"recent", revision:11}}}];
  fetchLog = [];
  await t.saveProfile({note:"recent"});
  assert.equal(fetchLog.length, 1, "RECENT profile writes have exactly one destination");
  assert.match(fetchLog[0].url, /^https:\/\/fh-builds\.noirchicot\.workers\.dev\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(t.state.profileRevision, 11, "RECENT writes keep the cloud revision chain");

  t.state.feed.tableState = "off";
  queue = [{status:200, body:{profile:{note:"off", revision:12}}}];
  fetchLog = [];
  await t.saveProfile({note:"off"});
  assert.equal(fetchLog.length, 1, "OFF profile writes have exactly one destination");
  assert.match(fetchLog[0].url, /^https:\/\/fh-builds\.noirchicot\.workers\.dev\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(t.state.profileRevision, 12, "OFF writes keep the cloud revision chain");

  // 4. The destination is chosen when the write happens, so a dock that opened
  // in RECENT starts writing to the table as soon as the rendezvous promotes it.
  t.state.feed.tableState = "recent";
  t.state.profileRevision = 20;
  t.state.feed.tableState = "live";
  queue = [{status:200, body:{profile:{note:"promoted", revision:21}}}];
  fetchLog = [];
  await t.saveProfile({note:"promoted"});
  assert.equal(fetchLog.length, 1, "a mid-session promotion still produces one write");
  assert.match(fetchLog[0].url, /^https:\/\/table\.example\.test\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(fetchLog[0].body.revision, 20, "the promoted write uses the revision already loaded in the dock");

  // 5. A table-server 409 follows the same conflict UI as the cloud path.
  t.state.feed.tableState = "live";
  const tableCurrentDoc = {vitalsState:{current:6,max:10}, note:"table-side edit"};
  queue = [{status:409, body:{error:"conflict", currentRevision:30, current:tableCurrentDoc}}];
  fetchLog = [];
  let tableRejected = null;
  await t.saveProfile({note:"my table edit"}).catch(error => { tableRejected = error; });
  assert.ok(tableRejected, "a table-server conflict rejects the write");
  assert.equal(tableRejected.silent, true, "a table-server conflict is surfaced by profileWrite");
  assert.equal(fetchLog.length, 1, "a table-server conflict is not retried");
  assert.match(fetchLog[0].url, /^https:\/\/table\.example\.test\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  const tableModal = document.querySelector(".fh-mc-modal-wrap");
  assert.ok(tableModal, "a table-server conflict opens the same reload modal");
  tableModal.querySelector("#fhPsConflictReload").click();
  assert.equal(t.state.profileRevision, 30, "the table-server reload adopts the returned revision");
  assert.deepEqual(t.state.profile, tableCurrentDoc, "the table-server reload adopts the returned document");

  // 6. A cloud 409 is never retried automatically and never silently applied
  // (§13.13.4) -- it surfaces a modal with a "Recharger" action instead.
  t.state.feed.tableState = "recent";
  const currentDoc = {vitalsState:{current:3,max:10}, note:"someone else's edit"};
  queue = [{status:409, body:{error:"conflict", currentRevision:12, current:currentDoc}}];
  fetchLog = [];
  let rejected = null;
  await t.saveProfile({note:"my edit"}).catch(error => { rejected = error; });
  assert.ok(rejected, "the write promise still rejects -- callers must not treat a 409 as success");
  assert.equal(rejected.silent, true, "the conflict is already surfaced here, so callers must not show a second, generic error");
  assert.equal(fetchLog.length, 1, "no automatic retry of the rejected write");
  assert.notEqual(t.state.profile && t.state.profile.note, "my edit", "the local edit is never silently applied over the conflicting server state");

  const modal = document.querySelector(".fh-mc-modal-wrap");
  assert.ok(modal, "a conflict opens a modal rather than only setting a message that could be missed");
  assert.match(modal.textContent, /modifiée ailleurs/, "the modal states plainly that the sheet changed elsewhere");
  const reload = modal.querySelector("#fhPsConflictReload");
  assert.ok(reload, "the modal offers an explicit Recharger action");

  // 7. Clicking Recharger adopts the server's document and revision, and
  // does NOT resend the rejected write or attempt any merge (§13.13.4).
  reload.click();
  assert.equal(t.state.profileRevision, 12, "reloading adopts the server's revision");
  assert.deepEqual(t.state.profile, currentDoc, "reloading replaces local state with the server's current document, not a merge of the two");
  assert.equal(document.querySelector(".fh-mc-modal-wrap"), null, "the modal closes once handled");
  assert.equal(fetchLog.length, 1, "reloading is a local state adoption from the 409 body, not a new network call");

  t.stopFeed(); // the dock's feed poll would otherwise keep the process alive
  console.log("Profile revision / 409 conflict tests passed.");
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
