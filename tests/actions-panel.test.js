"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("/tmp/fh-player-test/node_modules/linkedom");

const {window} = parseHTML("<html><body><div id=\"mount\"></div></body></html>");
const document = window.document;
const sourcePath = path.join(__dirname, "..", "docs", "javascripts", "fh-panel-actions.js");
const sandbox = {console, Date, Math, window};
sandbox.globalThis = sandbox;
vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), sandbox, {filename: sourcePath});

assert.ok(window.FH && Array.isArray(window.FH.panels), "the panel registry exists");
const panel = window.FH.panels.find(entry => entry.id === "actions");
assert.ok(panel, "the Actions panel registers itself");
assert.equal(panel.label, "Actions");
assert.equal(panel.tint, "#9f2f31");
assert.equal(panel.order, 30);
assert.equal(panel.showsRoller, true, "Actions keeps the core roller below it");

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function harness(initialStore) {
  let store = initialStore || {};
  const calls = {save:0, refresh:0, open:[], roll:[], note:[]};
  const ctx = {
    character:{name:"Harness",classes:[{name:"Wizard",level:5}],level:5,species:"Human",abilities:{STR:10,DEX:14,CON:13,INT:18,WIS:12,CHA:9},skills:{}},
    destiny:{score:8}, profile:{}, esc:escapeHtml,
    signed:value => Number(value) >= 0 ? "+" + Number(value) : String(Number(value)),
    mod:score => Math.floor((Number(score) - 10) / 2),
    store:id => { assert.equal(id, "actions"); return store; },
    save:() => { calls.save += 1; },
    refresh:() => { calls.refresh += 1; draw(); },
    openConsole:(...args) => calls.open.push(args),
    roll:(...args) => calls.roll.push(args),
    note:(...args) => calls.note.push(args)
  };
  const mount = document.getElementById("mount");
  function draw() { mount.innerHTML = "<div data-panel-body=\"actions\">" + panel.render(ctx) + "</div>"; }
  function click(selector) {
    const target = mount.querySelector(selector);
    assert.ok(target, "click target exists: " + selector);
    assert.equal(panel.onClick({target}, ctx), true, "Actions handles " + selector);
  }
  function change(selector, value) {
    const target = mount.querySelector(selector);
    assert.ok(target, "change target exists: " + selector);
    target.setAttribute("value", value);
    assert.equal(panel.onChange({target}, ctx), true, "Actions handles change for " + selector);
  }
  draw();
  return {ctx, calls, click, change, draw, mount, get store(){return store;}, set store(value){store=value;}};
}

const h = harness({});
assert.equal(h.store.schema, "fh-actions/1", "the persisted model is versioned");
assert.equal(h.store.turn.attackMax, 1, "one attack is available by default");
assert.equal(h.mount.querySelectorAll("[data-actions-economy]").length, 3, "all three action economies render");
assert.ok(h.mount.querySelector('[data-actions-economy="action"]'));
assert.ok(h.mount.querySelector('[data-actions-economy="bonus"]'));
assert.ok(h.mount.querySelector('[data-actions-economy="reaction"]'));
assert.match(h.mount.textContent, /Attack/);
assert.match(h.mount.textContent, /Opportunity Attack/);
assert.doesNotMatch(h.mount.querySelector('[data-actions-economy="bonus"]').textContent, /Second Wind/, "no universal Bonus Action is invented");

function setHarnessField(targetHarness, name, value) {
  const field = targetHarness.mount.querySelector('[data-actions-field="' + name + '"]');
  assert.ok(field, "editor field exists: " + name);
  if (field.localName === "select") {
    Array.from(field.options).forEach(option => {
      if (option.value === value) option.setAttribute("selected", "");
      else option.removeAttribute("selected");
    });
  } else if (field.localName === "textarea") field.textContent = value;
  else field.setAttribute("value", value);
}

function setField(name, value) { setHarnessField(h, name, value); }

setField("name", "Second Wind");
setField("economy", "bonus");
setField("category", "Utility");
setField("ability", "");
setField("bonus", "0");
setField("dc", "");
setField("note", "Regain hit points");
setField("source", "Manual");
h.click("[data-actions-save]");
let custom = h.store.entries.find(entry => entry.name === "Second Wind");
assert.ok(custom && custom.custom, "a custom action is created with a stable local entry");
const stableId = custom.id;
assert.ok(stableId.startsWith("manual-"));
assert.ok(h.calls.save > 0, "creating an action persists the panel store");

h.click('[data-actions-edit="' + stableId + '"]');
setField("name", "Second Wind edited");
setField("note", "Recover now");
h.click("[data-actions-save]");
custom = h.store.entries.find(entry => entry.id === stableId);
assert.equal(custom.name, "Second Wind edited", "editing keeps the stable id");
assert.equal(custom.note, "Recover now");

const reloaded = harness(JSON.parse(JSON.stringify(h.store)));
assert.match(reloaded.mount.textContent, /Second Wind edited/, "custom actions survive a store reload");
reloaded.click('[data-actions-delete="' + stableId + '"]');
assert.equal(reloaded.store.entries.some(entry => entry.id === stableId), false, "custom actions can be deleted");
assert.equal(reloaded.mount.querySelector('[data-actions-delete="srd-attack"]'), null, "SRD references cannot be deleted");

const attack = h.store.entries.find(entry => entry.id === "srd-attack");
attack.bonus = 5;
attack.dc = 14;
attack.note = "Vex blade";
h.draw();
h.click('[data-actions-run="srd-attack"]');
assert.deepEqual(h.calls.open.at(-1), ["Attack", "STR", 5, "Vex blade", 14], "a configured roll opens the shared console with exact parameters");
assert.equal(h.store.turn.attackUsed, 1, "opening an attack consumes one ATK slot");
const openCount = h.calls.open.length;
const rollCount = h.calls.roll.length;
h.click("[data-actions-new-turn]");
h.click('[data-actions-use="srd-dash"]');
assert.equal(h.calls.open.length, openCount, "a Utility action does not open a fake d20 console");
assert.equal(h.calls.roll.length, rollCount, "a Utility action does not make a quick d20 roll");
assert.match(h.calls.note.at(-1)[0], /Dash used/, "a no-roll action writes a clear event line");

h.click("[data-actions-new-turn]");
assert.deepEqual({attackUsed:h.store.turn.attackUsed,bonusUsed:h.store.turn.bonusUsed,reactionUsed:h.store.turn.reactionUsed}, {attackUsed:0,bonusUsed:false,reactionUsed:false}, "NEW TURN restores every economy");
h.change("[data-actions-attack-max]", "3");
assert.equal(h.store.turn.attackMax, 3, "the number of attacks is configurable");
for (let i = 0; i < 3; i += 1) { h.draw(); h.click('[data-actions-quick="srd-attack"]'); }
assert.equal(h.store.turn.attackUsed, 3, "each attack consumes one configured ATK slot");
assert.equal(h.calls.roll.length, rollCount + 3, "QUICK uses the core immediate roller");
h.draw();
assert.equal(h.mount.querySelector('[data-actions-quick="srd-attack"]').disabled, true, "a fourth attack is unavailable");

h.click("[data-actions-new-turn]");
h.draw();
h.click('[data-actions-quick="srd-attack"]');
h.draw();
h.click("[data-actions-light]");
assert.equal(h.store.turn.nickAvailable, true, "Light follow-up can be armed only after an attack");
h.click("[data-actions-nick]");
assert.equal(h.store.turn.nickAvailable, false);
assert.equal(h.store.turn.nickUsed, true, "Nick is consumed once without spending the Bonus Action");
assert.equal(h.store.turn.bonusUsed, false);
h.draw();
assert.equal(h.mount.querySelector("[data-actions-nick]").disabled, true, "Nick cannot be used twice in one turn");

h.click("[data-actions-vex]");
assert.equal(h.store.turn.vexReady, true, "Vex can be armed manually without a badge");
assert.equal(h.mount.querySelectorAll(".fh-cd-actions-badge").length, 0, "Vex never creates a panel badge");
h.click("[data-actions-vex]");
assert.equal(h.store.turn.vexReady, false, "the manual Vex state is cancellable");

h.click("[data-actions-new-turn]");
const bonusEntry = h.store.entries.find(entry => entry.id === stableId);
bonusEntry.name = "Bonus utility";
bonusEntry.economy = "bonus";
bonusEntry.category = "Utility";
h.draw();
h.click('[data-actions-use="' + stableId + '"]');
assert.equal(h.store.turn.bonusUsed, true, "a Bonus Action can be used before the Action");
assert.equal(h.store.turn.attackUsed, 0);
h.draw();
h.click('[data-actions-run="srd-opportunity"]');
assert.equal(h.store.turn.reactionUsed, true, "a Reaction card consumes R");

const duplicateStore = harness({schema:"fh-actions/0",entries:[
  {id:"manual-recovered-1",name:"Occupied recovery id",economy:"action",category:"Utility",custom:true},
  {id:"manual-recovered-1",name:"Recovered sibling",economy:"bonus",category:"Utility",custom:true},
  {id:"manual-dup",name:"Duplicate first",economy:"action",category:"Utility",custom:true},
  {id:"manual-dup",name:"Duplicate second",economy:"reaction",category:"Utility",custom:true}
],turn:null,editor:{id:"missing-editor"}});
let normalizedIds = duplicateStore.store.entries.map(entry => entry.id);
assert.equal(new Set(normalizedIds).size, normalizedIds.length, "normalization produces globally unique ids");
assert.equal(duplicateStore.store.entries.find(entry => entry.name === "Occupied recovery id").id, "manual-recovered-1", "the first valid id remains stable");
assert.equal(duplicateStore.store.entries.find(entry => entry.name === "Recovered sibling").id, "manual-recovered-1-2", "a colliding recovery id receives a unique suffix");
assert.equal(duplicateStore.store.editor.id, "", "a corrupt editor target is cleared");
const recoveredDuplicate = duplicateStore.store.entries.find(entry => entry.name === "Duplicate second");
const firstDuplicate = duplicateStore.store.entries.find(entry => entry.name === "Duplicate first");
assert.notEqual(recoveredDuplicate.id, firstDuplicate.id, "duplicate source ids no longer make actions ambiguous");
duplicateStore.click('[data-actions-edit="' + recoveredDuplicate.id + '"]');
setHarnessField(duplicateStore, "name", "Duplicate second edited");
duplicateStore.click("[data-actions-save]");
assert.equal(duplicateStore.store.entries.find(entry => entry.id === firstDuplicate.id).name, "Duplicate first", "editing the recovered entry does not alter its former duplicate");
assert.equal(duplicateStore.store.entries.find(entry => entry.id === recoveredDuplicate.id).name, "Duplicate second edited");
duplicateStore.click('[data-actions-delete="' + recoveredDuplicate.id + '"]');
assert.ok(duplicateStore.store.entries.some(entry => entry.id === firstDuplicate.id), "deleting the recovered entry leaves its former duplicate intact");
assert.equal(duplicateStore.store.entries.some(entry => entry.id === recoveredDuplicate.id), false);

const reservedStore = harness({schema:"legacy-actions",entries:[
  {id:"srd-attack",name:"Custom reserved attack",economy:"bonus",category:"Check",custom:true},
  {id:"srd-attack",name:"Configured SRD Attack",economy:"action",category:"Attack",ability:"DEX",bonus:7,custom:false},
  {id:"srd-attack",name:"Duplicate canonical attack",economy:"reaction",category:"Attack",custom:false},
  {id:"srd-dash",name:"Custom reserved dash",economy:"bonus",category:"Utility",custom:true},
  {id:"legacy-locked",name:"Legacy unknown",economy:"reaction",category:"Utility",custom:false}
],turn:{attackMax:"4",attackUsed:"2"}});
normalizedIds = reservedStore.store.entries.map(entry => entry.id);
assert.equal(new Set(normalizedIds).size, normalizedIds.length, "reserved-id recovery also stays globally unique");
assert.equal(reservedStore.store.entries.filter(entry => entry.id === "srd-attack").length, 1, "exactly one canonical SRD Attack owns the reserved id");
assert.equal(reservedStore.store.entries.find(entry => entry.id === "srd-attack").name, "Configured SRD Attack", "a legitimate saved SRD configuration keeps its id");
assert.equal(reservedStore.store.entries.find(entry => entry.name === "Custom reserved attack").custom, true);
assert.notEqual(reservedStore.store.entries.find(entry => entry.name === "Custom reserved attack").id, "srd-attack", "a custom entry cannot capture an SRD id");
assert.equal(reservedStore.store.entries.find(entry => entry.name === "Duplicate canonical attack").custom, true, "a second canonical-looking record becomes a removable recovery entry");
assert.notEqual(reservedStore.store.entries.find(entry => entry.name === "Custom reserved dash").id, "srd-dash");
assert.equal(reservedStore.store.entries.filter(entry => entry.id === "srd-dash").length, 1, "the missing canonical Dash is restored under its reserved id");
assert.equal(reservedStore.store.entries.find(entry => entry.name === "Legacy unknown").custom, true, "unknown legacy records cannot become undeletable built-ins");

const legacyStore = harness({schema:null,entries:[null,{},
  {id:"",name:"Blank id",economy:"wrong",category:"wrong"},
  {id:"manual-recovered-1",name:"Legacy one",custom:true},
  {id:"manual-recovered-1",name:"Legacy duplicate",custom:true}
],turn:"broken",editor:42});
normalizedIds = legacyStore.store.entries.map(entry => entry.id);
assert.equal(new Set(normalizedIds).size, normalizedIds.length, "old and malformed records receive unique ids");
assert.ok(normalizedIds.every(Boolean), "no normalized entry has a blank id");
assert.equal(legacyStore.store.schema, "fh-actions/1");
assert.deepEqual({attackMax:legacyStore.store.turn.attackMax,attackUsed:legacyStore.store.turn.attackUsed}, {attackMax:1,attackUsed:0});
const renderedCardIds = Array.from(legacyStore.mount.querySelectorAll("[data-actions-card]"), card => card.dataset.actionsCard);
assert.equal(new Set(renderedCardIds).size, renderedCardIds.length, "the rendered edit/delete targets are unambiguous too");

const corrupt = harness({schema:9,entries:"not-an-array",turn:{attackMax:"nope",attackUsed:99,bonusUsed:"yes"},editor:"bad"});
assert.doesNotThrow(() => corrupt.draw(), "corrupt saved data is normalized without throwing");
assert.equal(corrupt.store.schema, "fh-actions/1");
assert.equal(corrupt.store.turn.attackMax, 1);
assert.equal(corrupt.store.turn.attackUsed, 1);
assert.equal(Array.isArray(corrupt.store.entries), true);

corrupt.store.entries.push({id:"manual-xss",name:'<img src=x onerror="boom">',economy:"action",category:"Utility",ability:"",bonus:0,dc:null,note:"<script>boom()</script>",source:"Manual",custom:true});
const escapedHtml = panel.render(corrupt.ctx);
assert.doesNotMatch(escapedHtml, /<img src=x/, "user names are escaped before HTML insertion");
assert.doesNotMatch(escapedHtml, /<script>boom/, "user notes are escaped before HTML insertion");
corrupt.draw();
assert.equal(corrupt.mount.querySelector("script"), null);
assert.equal(corrupt.mount.querySelector("img"), null);

console.log("actions-panel.test.js: all assertions passed");
