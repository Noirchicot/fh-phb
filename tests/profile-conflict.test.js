"use strict";

// DOM-level test for plan §13.13.2/§13.13.4: every write to /profile/:code/:pseudo
// (and its /pull sub-route) carries the known revision, a 409 is never retried or
// silently applied, and the offered "Recharger" action adopts the server's
// current document without attempting any auto-merge (§13.13.4 explicitly rules
// that out). Install linkedom first, same as player-sheet.integration.test.js:
//   npm install --prefix /tmp/fh-player-test linkedom@0.18.12
const assert = require("node:assert/strict");
const webcrypto = require("node:crypto").webcrypto;
const crypto = {randomUUID:()=>webcrypto.randomUUID(),getRandomValues:array=>{array[0]=10;return array;}};
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("/tmp/fh-player-test/node_modules/linkedom");

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
vm.runInNewContext(source,sandbox,{filename:sourcePath});
document.dispatchEvent(new window.Event("DOMContentLoaded"));

const t = sandbox.__fhPlayerSheetConflict;
t.state.code = "FH1";
t.state.pseudo = "Conflict Tester";
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

(async () => {
  // 1. GET /profile/:code/:pseudo adopts the server's revision as the dock's
  // starting point (§13.13.3's "adopts their revisions as its own").
  t.state.record = {build:{
    character:{name:"Conflict Tester",abilityScores:{STR:10,DEX:12,CON:14,INT:16,WIS:13,CHA:14}},
    meta:{class:"Wizard",level:3,species:"Human"},nativeSkillTiers:{},skills:[],destiny:{score:8}
  }};
  queue = [
    {status:200, body:{builds:[{pseudo:"Conflict Tester"}]}},
    {status:200, body:{profile:{vitalsState:{current:10,max:10}}, revision:7}}
  ];
  fetchLog = [];
  t.loadBuild();
  await flush(); await flush();
  assert.equal(t.state.profileRevision, 7, "the known revision comes from the GET response, not invented locally");

  // 2. A normal write states the revision it is based on (§13.13.2).
  queue = [{status:200, body:{profile:{note:"saved"}, revision:8}}];
  fetchLog = [];
  await t.saveProfile({note:"hello"});
  const writeCall = fetchLog[fetchLog.length-1];
  assert.match(writeCall.url, /\/profile\/FH1\/Conflict(?:%20|\+)Tester$/);
  assert.equal(writeCall.body.revision, 7, "the write carries the revision the dock knew before this call");
  assert.equal(t.state.profileRevision, 8, "a successful write adopts the new revision the server stamped");

  // 3. A 409 is never retried automatically and never silently applied
  // (§13.13.4) -- it surfaces a modal with a "Recharger" action instead.
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

  // 4. Clicking Recharger adopts the server's document and revision, and
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
