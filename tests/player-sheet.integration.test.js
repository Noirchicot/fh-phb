"use strict";

// Optional DOM-level smoke test. Install with:
// npm install --prefix /tmp/fh-player-test linkedom@0.18.12
const assert = require("node:assert/strict");
const crypto = require("node:crypto").webcrypto;
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
  globalThis.__fhPlayerSheetIntegration = {state, render, effectiveCharacter, loadPlayState};
})();
`);
const sandbox = {
  URL,clearTimeout,console,crypto,document,setTimeout,window,
  fetch: async () => ({ok:true,status:200,json:async()=>({profile:{}})}),
  localStorage:{
    getItem:key=>storage.has(key)?storage.get(key):null,
    setItem:(key,value)=>storage.set(key,String(value))
  }
};
sandbox.globalThis = sandbox;
vm.runInNewContext(source,sandbox,{filename:sourcePath});
document.dispatchEvent(new window.Event("DOMContentLoaded"));

const t=sandbox.__fhPlayerSheetIntegration;
t.state.code="FH1";
t.state.pseudo="Click Tester";
t.state.record={build:{
  character:{name:"Click Tester",abilityScores:{STR:10,DEX:14,CON:12,INT:16,WIS:13,CHA:11}},
  meta:{class:"Wizard",level:5,species:"Human"},nativeSkillTiers:{Arcana:"proficient"},skills:[],destiny:{score:8,arcana:{name:"The Hermit"}}
}};
t.state.profile={snapshot:null,levelUps:[],preparation:{tools:[]}};
t.state.character=t.effectiveCharacter();
t.loadPlayState(t.state.character);
t.render();

const root=document.getElementById("fhPlayerSheet");
assert.ok(root.querySelector(".fh-ps-rail"),"the persistent left navigation rail renders");
assert.equal(root.querySelectorAll(".fh-ps-roll-workbench > section").length,3,"console, animation log and dice tray are distinct zones");

root.querySelector('[data-config-name="Arcana"]').click();
let guidance=root.querySelector("#fhPsGuidance");
guidance.checked=true;
guidance.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector('[data-roll-mode="advantage"]').click();
assert.equal(t.state.rollConfig.guidance,true,"rerendering a roll mode preserves Guidance in console state");
assert.equal(root.querySelector("#fhPsGuidance").hasAttribute("checked"),true,"the preserved Guidance state is rendered back into the control");
// linkedom does not hydrate the checked property from the HTML attribute as a browser does.
root.querySelector("#fhPsGuidance").checked=true;
assert.ok(root.querySelector('[data-roll-mode="advantage"]').classList.contains("is-on"),"advantage stays selected");

root.querySelector("#fhPsRunRoll").click();
let entry=t.state.history[0];
assert.equal(entry.d20s.length,2,"advantage rolls two d20s");
assert.equal(entry.guidance.sides,4,"Guidance rolls beside the d20s");
assert.equal(t.state.trayResults.length,3,"the tray displays both d20s and the bonus die");
const originalD20=Array.from(entry.d20s);

t.state.currentEvent=null;
t.render();
root.querySelector('[data-history-id="'+entry.id+'"]').click();
assert.equal(t.state.rollConfig.editingId,entry.id,"clicking the event log reopens that roll");
const custom=root.querySelector("#fhPsCustom");
custom.value="3";
custom.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("#fhPsRunRoll").click();
entry=t.state.history.find(item=>item.id===entry.id);
assert.deepEqual(Array.from(entry.d20s),originalD20,"adjusting bonuses never rerolls the original d20s");
assert.equal(entry.custom,3,"the edited bonus is applied");

root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Spend this Destiny die\?/i,"Destiny always asks for confirmation before rolling");
root.querySelector("[data-tray-cancel]").click();
assert.equal(t.state.trayPrompt,null,"Destiny confirmation can be cancelled without spending the die");

console.log("Player sheet DOM integration tests passed.");
