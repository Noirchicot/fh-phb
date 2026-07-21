"use strict";

// Optional DOM-level smoke test. Install with:
// npm install --prefix /tmp/fh-player-test linkedom@0.18.12
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
assert.match(root.querySelector(".fh-ps-dice-tray-head h2").textContent,/Arcana \+6/,"opening a console names the prepared check in the tray");
assert.equal(root.querySelectorAll(".fh-ps-tray-dice .die-d20").length,1,"a flat console starts with one prepared d20");
let guidance=root.querySelector("#fhPsGuidance");
guidance.checked=true;
guidance.dispatchEvent(new window.Event("change",{bubbles:true}));
// linkedom does not hydrate checked properties from newly rendered attributes.
root.querySelector("#fhPsGuidance").checked=true;
root.querySelector('[data-roll-mode="advantage"]').click();
assert.equal(t.state.rollConfig.guidance,true,"rerendering a roll mode preserves Guidance in console state");
assert.equal(root.querySelector("#fhPsGuidance").hasAttribute("checked"),true,"the preserved Guidance state is rendered back into the control");
// linkedom does not hydrate the checked property from the HTML attribute as a browser does.
root.querySelector("#fhPsGuidance").checked=true;
assert.ok(root.querySelector('[data-roll-mode="advantage"]').classList.contains("is-on"),"advantage stays selected");
const plusTwo=root.querySelector("#fhPsPlusTwo");plusTwo.checked=true;plusTwo.dispatchEvent(new window.Event("change",{bubbles:true}));
assert.ok(root.querySelector(".fh-ps-modifier-token"),"the +2 option appears as a visible tray token");
root.querySelector("#fhPsGuidance").checked=true;root.querySelector("#fhPsPlusTwo").checked=true;

root.querySelector("#fhPsRunRoll").click();
let entry=t.state.history[0];
assert.equal(entry.d20s.length,2,"advantage rolls two d20s");
assert.equal(entry.guidance.sides,4,"Guidance rolls beside the d20s");
assert.equal(t.state.trayResults.length,4,"the tray displays both d20s, Guidance and the +2 token");
const originalD20=Array.from(entry.d20s);

root.querySelector("[data-event-ok]").click();
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
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Add this Destiny die to the Dice Tray/i,"Destiny is reserved rather than rolled while any console is open");
root.querySelector("[data-tray-cancel]").click();
assert.equal(t.state.trayPrompt,null,"Destiny confirmation can be cancelled without spending the die");

root.querySelector('[data-config-name="Arcana"]').click();
root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Add this Destiny die to the Dice Tray/i,"a console reserves Destiny instead of rolling it immediately");
root.querySelector("[data-tray-confirm-destiny]").click();
assert.ok(t.state.rollConfig.destinyDieId,"the confirmed Destiny die is reserved in console state");
assert.ok(root.querySelector(".fh-ps-destiny-die.is-selected"),"the reserved Destiny die flashes in the pool");
assert.equal(t.state.trayResults[0].label,"Destiny","the reserved Destiny die appears first in the tray");
const beforeDestinyHistory=t.state.history.length;
root.querySelector("#fhPsRunRoll").click();
assert.equal(t.state.history.length,beforeDestinyHistory,"the d20 has not rolled while Destiny events await confirmation");
assert.match(t.state.currentEvent.text,/Destiny d\d+ rolled \d+.*Lost \d+ Destiny Point/i,"one Destiny popup contains the die result and its point implication");
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Continue/i,"the Destiny popup says Continue because the d20 still has to roll");
assert.equal(root.querySelector("[data-clear-tray]").disabled,true,"Clear cannot cancel a transaction after Destiny has been spent");
const spentPoints=t.state.destiny.points;
root.querySelector('[data-quick-name="Arcana"]').click();
assert.equal(t.state.history.length,beforeDestinyHistory,"another skill cannot replace an unfinished Destiny transaction");
assert.equal(t.state.destiny.points,spentPoints,"a blocked second roll cannot spend or alter Destiny again");
let guard=8;
while(t.state.rollSequence&&t.state.rollSequence.phase==="destiny-events"&&guard--){root.querySelector("[data-event-ok]").click();}
assert.equal(t.state.history.length,beforeDestinyHistory+1,"the remaining dice roll only after every Destiny event is acknowledged");
entry=t.state.history[0];
assert.equal(t.state.trayResults[0].label,"Destiny","the spent Destiny result remains before the d20s");
assert.equal(t.state.trayResults[1].sides,20,"the d20 result follows Destiny in the tray");
root.querySelector("[data-event-ok]").click();

root.querySelector('[data-config-name="Arcana"]').click();
const dc=root.querySelector("#fhPsDc");dc.value="20";dc.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("#fhPsRunRoll").click();
entry=t.state.history[0];
const failedD20=Array.from(entry.d20s);
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Add a bonus die/i,"a known failure offers one last bonus die");
root.querySelector("[data-rescue-bardic]").click();
assert.deepEqual(Array.from(entry.d20s),failedD20,"the rescue never rerolls the failed d20");
assert.ok(entry.bardic&&entry.bardic.result,"the selected Bardic die is added and rolled");
while(t.state.currentEvent&&root.querySelector("[data-event-ok]")){root.querySelector("[data-event-ok]").click();}

root.querySelector("[data-clear-tray]").click();
assert.equal(t.state.trayResults.length,0,"Clear empties every die and result");
assert.equal(t.state.rollConfig,null,"Clear also releases the active roll setup");
assert.doesNotMatch(root.querySelector(".fh-ps-dice-tray").textContent,/Up to 2d20/i,"the unwanted yellow capacity subtitle is removed");
root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Roll and spend this Destiny die\?/i,"outside a console, Destiny uses the explicit spend confirmation");
assert.match(root.querySelector(".fh-ps-event-zone").textContent,/Current Points:/i,"the direct-spend warning shows current Destiny Points");
root.querySelector("[data-tray-cancel]").click();

const originalName=t.state.character.name;
root.querySelector("#fhPsCorrect").click();
assert.ok(t.state.editDraft,"Edit opens a working copy instead of the right-side corrections panel");
assert.ok(root.querySelector(".fh-ps-app.is-edit-mode"),"the central character sheet visibly enters Edit mode");
assert.ok(root.querySelector("#fhPsEditSave")&&root.querySelector("#fhPsEditCancel"),"the working copy exposes explicit Save and Cancel actions");
assert.doesNotMatch(root.querySelector(".fh-ps-right").textContent,/MANUAL CORRECTIONS/i,"the old correction form no longer occupies the temporary right panel");
root.querySelector("#fhPsEditName").value="Discarded name";
root.querySelector("#fhPsEditCancel").click();
assert.equal(t.state.character.name,originalName,"Cancel discards the working copy without changing the live sheet");

root.querySelector("#fhPsCorrect").click();
root.querySelector("#fhPsEditName").value="Edited Hero";
root.querySelector("#fhPsEditPb").value="4";
root.querySelector('[data-edit-ability="INT"]').value="18";
root.querySelector("#fhPsEditInitiative").value="5";
root.querySelector("#fhPsEditAc").value="17";
root.querySelector('[data-edit-passive="vigilance"]').value="16";
const arcanaTier=root.querySelector('[data-edit-skill-tier="Arcana"]');
Array.from(arcanaTier.querySelectorAll("option")).forEach(option=>{
  if(option.getAttribute("value")==="expert") option.setAttribute("selected","");
  else option.removeAttribute("selected");
});
root.querySelector('[data-edit-add-bonus="Arcana"]').click();
const bonusRow=root.querySelector('[data-edit-bonus-row="Arcana"]');
bonusRow.querySelector("[data-edit-bonus-label]").value="Arcane focus";
bonusRow.querySelector("[data-edit-bonus-value]").value="2";
root.querySelector("#fhPsEditAddTool").click();
assert.equal(t.state.editDraft.tools.length,1,"an official FH tool can be added to the working copy");
root.querySelector("#fhPsEditSave").click();

setTimeout(()=>{
  assert.equal(t.state.editDraft,null,"Save exits Edit mode");
  assert.equal(t.state.character.name,"Edited Hero","identity corrections are applied to the live sheet");
  assert.equal(t.state.character.pb,4,"PB can be corrected manually");
  assert.equal(t.state.character.abilities.INT,18,"ability scores can be corrected manually");
  assert.equal(t.state.character.initiative,5,"initiative can be corrected manually");
  assert.equal(t.state.character.armorClass,17,"AC can be corrected manually");
  assert.equal(t.state.character.passiveOverrides.vigilance,16,"passive scores can be corrected manually");
  assert.equal(t.state.character.skills.Arcana.tier,"expert","skill mastery can be altered without changing the 26-skill list");
  assert.equal(t.state.character.specialBonuses.Arcana[0].value,2,"named special bonuses persist on a skill");
  assert.match(root.querySelector('[data-quick-name="Arcana"]').title,/Arcana/i,"the edited skill remains rollable");
  assert.ok(root.querySelector(".fh-ps-bonus-dots"),"a red dot reminds the player that a special bonus is active");
  assert.match(root.querySelector(".fh-ps-bonus-dots").title,/Arcane focus \+2/,"hover text explains each red bonus dot");
  assert.equal(Object.keys(t.state.character.skills).filter(name=>name.indexOf("Tool - ")!==0).length,26,"Edit mode cannot add or delete core skills");
  console.log("Player sheet DOM integration tests passed.");
},0);
