"use strict";

// Optional DOM-level smoke test for the Companion dock. Install with:
// npm install --prefix /tmp/fh-player-test linkedom@0.18.12
// Every assertion below is a behaviour the sheet had before the dock redesign,
// re-pointed at the new markup, plus the behaviours the redesign added.
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
t.state.dockOpen=true;
t.render();

const root=document.getElementById("fhPlayerSheet");
function openMenu(){ if(!root.querySelector(".fh-cd-menu")) root.querySelector("[data-menu-toggle]").click(); }

/* ── Dock chrome ─────────────────────────────────────────────── */
assert.ok(root.querySelector(".fh-cd-dock"),"the Companion renders as a docked panel");
assert.equal(root.querySelector(".fh-ps-commandbar"),null,"the old command bar is gone");
assert.equal(root.querySelector(".fh-ps-rail"),null,"the redundant vertical rail no longer consumes sheet width");
assert.ok(root.querySelector('[data-open-pop="inventory"]')&&root.querySelector('[data-open-pop="loop"]')&&root.querySelector('[data-open-pop="forge"]'),"Inventory, Soulforging Loop and Soulforge pop from the dock header");
assert.equal(root.querySelector(".fh-cd-seal").textContent,"FH","the gold FH seal links back to the handbook");
assert.equal(root.querySelectorAll('[data-zone="console"],[data-zone="roller"],[data-zone="stream"]').length,3,"console, roller and stream are distinct zones");
assert.equal(root.querySelectorAll("[data-zone]").length,7,"the dock shows its seven zones at once");
openMenu();
assert.ok(root.querySelector("#fhPsLevel"),"an unlinked character keeps Level Up under the menu");

t.state.profile.ddbLinked=true;
t.state.menuOpen=true;
t.render();
assert.match(root.querySelector("#fhPsSync").textContent,/^Sync/,"a linked character gets the direct Sync action");
assert.ok(root.querySelector("#fhPsRelink"),"a linked character can still replace its DDB link");
assert.equal(root.querySelector("#fhPsLevel"),null,"Level Up disappears when Sync is the source of truth");
t.state.profile.ddbLinked=false;
t.state.menuOpen=false;
t.render();

/* ── Major events keep their own scene ───────────────────────── */
const specialScenes=[
  ["nat1","NATURAL 1 · Fate accepted"],
  ["nat20","NATURAL 20 · Fate bends in your favor"],
  ["arcane-critical-failure","ARCANE CRITICAL FAILURE · Destiny d8 rolled 1"],
  ["arcane-critical-success","ARCANE CRITICAL SUCCESS · Destiny d8 rolled 8"]
];
specialScenes.forEach(([kind,text])=>{
  t.state.currentEvent={kind,text,blocking:true,progress:1,total:1};
  t.state.queueDone="finish-sequence";
  t.render();
  const scene=root.querySelector(".fh-cd-card.is-"+kind);
  assert.ok(scene,"the "+kind+" event renders its dedicated card");
  assert.match(scene.textContent,/Finish/,"the last event of a sequence asks to Finish");
});
t.state.currentEvent={kind:"awakening",text:"ARCANE AWAKENING · Natural 20 at Destiny 0",blocking:true,progress:1,total:1};
t.render();
assert.match(root.querySelector(".fh-cd-card.is-awakening").textContent,/The Hermit/i,"Arcane Awakening reveals the character's Major Arcana");
t.state.currentEvent={kind:"chaos",text:"Chaos has noticed · 2d6 = 3 + 5",chaosRoll:[3,5],blocking:true,progress:1,total:1};
t.render();
assert.match(root.querySelector(".fh-cd-card.is-chaos").textContent,/total 8/,"Chaos shows its 2d6 total");
t.state.currentEvent=null;
t.state.queueDone="";
t.render();

/* ── Console ─────────────────────────────────────────────────── */
root.querySelector('[data-config-name="Arcana"]').click();
assert.match(root.querySelector(".fh-cd-cname").textContent,/Arcana \+6/,"opening a console names the prepared check");
assert.match(root.querySelector(".fh-cd-status").textContent,/Arcana \+6/,"the roller frame echoes the prepared check");
assert.equal(root.querySelectorAll(".fh-cd-dicerow .fh-cd-diewrap").length,1,"a flat console starts with one prepared d20");
assert.equal(root.querySelectorAll("[data-bonus-preset]").length,2,"the console keeps only the Guidance and Bardic presets");
assert.equal(root.querySelector('[data-bonus-preset="Tactical Mind"]'),null,"Tactical Mind is retired from the console");
assert.ok(root.querySelector("#fhPsDestinyDie"),"Destiny is chosen from the console itself");
assert.equal(root.querySelector("#fhPsRunRoll .fh-icon"),null,"the Roll button carries no icon — the word alone is the call-to-action");
assert.match(root.querySelector("#fhPsRunRoll").textContent,/^ROLL/,"the Roll button leads with its label");

root.querySelector("#fhPsGuidance").click();
root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').click();
assert.equal(t.state.rollConfig.guidance,true,"rerendering a d20 mode preserves the Guidance preset");
assert.ok(root.querySelector("#fhPsGuidance").classList.contains("is-on"),"the Guidance preset remains visibly active");
assert.ok(root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').classList.contains("is-on"),"advantage stays selected");
root.querySelector("#fhPsPlusTwo").click();
assert.ok(root.querySelector(".fh-cd-diewrap.is-modifier"),"the +2 option appears as a visible token beside the dice");
assert.equal(root.querySelector(".fh-cd-diewrap.is-modifier .fh-cd-src").textContent.trim(),"","the fixed +2 token stays free of a source seal");

/* the tray feeds bonus dice into an open console, capped at three */
root.querySelector('[data-add-tray-die="8"]').click();
assert.equal(t.state.rollConfig.bonusDice.length,2,"a tray die joins the prepared roll as a bonus die");
assert.equal(t.state.rollConfig.bonusDice[1].sides,8,"the tray die keeps the size that was clicked");
root.querySelector('[data-add-tray-die="6"]').click();
root.querySelector('[data-add-tray-die="12"]').click();
assert.equal(t.state.rollConfig.bonusDice.length,3,"a roll never carries more than three bonus dice");
assert.equal(root.querySelector('[data-add-tray-die="20"]').disabled,true,"the base d20 is not a bonus slot");
t.state.rollConfig.bonusDice=t.state.rollConfig.bonusDice.slice(0,1);
t.render();

root.querySelector("#fhPsRunRoll").click();
assert.equal(root.querySelector('[data-die-choice="0"]'),null,"advantage was decided before the roll — it never stops to ask");
let entry=t.state.history[0];
assert.equal(entry.d20s.length,2,"advantage rolls two d20s");
assert.equal(entry.kept,Math.max(entry.d20s[0],entry.d20s[1]),"advantage keeps the higher d20");
assert.equal(entry.guidance.sides,4,"Guidance rolls beside the d20s");
assert.equal(t.state.trayResults.length,4,"the frame displays both d20s, Guidance and the +2 token");
const originalD20=Array.from(entry.d20s);

/* ── Stream ──────────────────────────────────────────────────── */
root.querySelector("[data-event-ok]").click();
const streamLine=root.querySelector(".fh-cd-sentry");
assert.ok(streamLine,"a finished roll lands in the stream");
assert.match(streamLine.textContent,/Click Tester/,"every stream line names the character who rolled");
assert.match(streamLine.textContent,/Arcana/,"the stream line names the check");
const exported=JSON.parse(streamLine.querySelector("[data-roll]").getAttribute("data-roll"));
assert.equal(exported.schema,"fh-roll/1","stream lines carry a versioned export payload");
assert.equal(exported.character,"Click Tester","the export names the character for a later AboveVTT bridge");
assert.ok(exported.parts.length>=3,"the export keeps the d20, the base bonus and every extra die");

/* ── Reopening a roll never rerolls its d20 ──────────────────── */
root.querySelector('[data-history-id="'+entry.id+'"]').click();
assert.equal(t.state.rollConfig.editingId,entry.id,"clicking a stream line reopens that roll");
const custom=root.querySelector("#fhPsCustom");
custom.value="3";
custom.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("#fhPsRunRoll").click();
entry=t.state.history.find(item=>item.id===entry.id);
assert.deepEqual(Array.from(entry.d20s),originalD20,"adjusting bonuses never rerolls the original d20s");
assert.equal(entry.custom,3,"the edited bonus is applied");
root.querySelector("[data-event-ok]").click();

/* ── Destiny is reserved, never spent, while a console is open ─ */
root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Add this Destiny die to the Dice Tray/i,"Destiny is reserved rather than rolled while any console is open");
root.querySelector("[data-tray-cancel]").click();
assert.equal(t.state.trayPrompt,null,"Destiny confirmation can be cancelled without spending the die");

root.querySelector('[data-config-name="Arcana"]').click();
root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Add this Destiny die to the Dice Tray/i,"a console reserves Destiny instead of rolling it immediately");
root.querySelector("[data-tray-confirm-destiny]").click();
assert.ok(t.state.rollConfig.destinyDieId,"the confirmed Destiny die is reserved in console state");
assert.ok(root.querySelector(".fh-cd-ddie.is-selected"),"the reserved Destiny die is flagged in the pool");
assert.equal(t.state.trayResults[0].label,"Destiny","the reserved Destiny die appears first in the frame");
const beforeDestinyHistory=t.state.history.length;
root.querySelector("#fhPsRunRoll").click();
assert.equal(t.state.history.length,beforeDestinyHistory,"the d20 has not rolled while Destiny events await confirmation");
assert.match(t.state.currentEvent.text,/Destiny d\d+ rolled \d+.*Lost \d+ Destiny Point/i,"one Destiny popup contains the die result and its point implication");
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Continue/i,"the Destiny popup says Continue because the d20 still has to roll");
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
assert.equal(t.state.trayResults[1].sides,20,"the d20 result follows Destiny in the frame");
root.querySelector("[data-event-ok]").click();

/* ── A failed DC still offers one last die ───────────────────── */
root.querySelector('[data-config-name="Arcana"]').click();
const dc=root.querySelector("#fhPsDc");dc.value="20";dc.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("#fhPsRunRoll").click();
entry=t.state.history[0];
const failedD20=Array.from(entry.d20s);
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Add a bonus die/i,"a known failure offers one last bonus die");
root.querySelector("[data-rescue-bardic]").click();
assert.deepEqual(Array.from(entry.d20s),failedD20,"the rescue never rerolls the failed d20");
assert.ok(entry.bardic&&entry.bardic.result,"the selected Bardic die is added and rolled");
while(t.state.currentEvent&&root.querySelector("[data-event-ok]")){root.querySelector("[data-event-ok]").click();}

/* ── A pool die boosts a roll that already landed ────────────── */
t.state.destiny.points=6;
t.state.destiny.dice.forEach(die=>{die.available=true;});
t.render();
root.querySelector('[data-quick-name="Arcana"]').click();
const settled=t.state.history[0];
const totalBeforeBoost=settled.total;
const pointsBeforeBoost=t.state.destiny.points;
assert.ok(root.querySelector("[data-event-ok]"),"a flat roll waits on its result before it is filed");
root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Boost/i,"a pool die offers to boost the roll that just landed");
root.querySelector("[data-tray-confirm-destiny]").click();
guard=8;
while(t.state.currentEvent&&root.querySelector("[data-event-ok]")&&guard--){root.querySelector("[data-event-ok]").click();}
const boosted=t.state.history.find(item=>item.id===settled.id);
assert.ok(boosted.destiny,"the boost attaches a Destiny die to the finished roll");
assert.ok(boosted.total>totalBeforeBoost,"the boost raises the total");
assert.ok(t.state.destiny.points<pointsBeforeBoost,"the boost spends Destiny by the ruleset's own cost");
assert.deepEqual(Array.from(boosted.d20s),Array.from(settled.d20s),"boosting never touches the original d20");

/* ── Free tray ───────────────────────────────────────────────── */
root.querySelector("[data-clear-tray]").click();
assert.equal(t.state.trayResults.length,0,"Clear empties every die and result");
assert.equal(t.state.rollConfig,null,"Clear also releases the active roll setup");

for(let i=0;i<8;i++)root.querySelector('[data-add-tray-die="6"]').click();
assert.equal(t.state.traySelection.length,8,"the damage roller accepts an 8d6 Fireball pool");
assert.match(root.querySelector(".fh-cd-dicerow").innerHTML,/width="34"/,"a crowded pool shrinks its dice to stay in the frame");
const freeLabel=root.querySelector("#fhPsTrayLabel");freeLabel.value="Fireball";freeLabel.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("[data-roll-tray]").click();
assert.equal(t.state.history[0].name,"Fireball","the free roll keeps its purpose in history");
assert.equal(t.state.history[0].dice.length,8,"all damage dice are recorded");
root.querySelector("[data-event-ok]").click();
root.querySelector("[data-clear-tray]").click();

/* ── Portents and per-die controls live under the ⋯ drawer ───── */
root.querySelector('[data-config-name="Arcana"]').click();
assert.equal(root.querySelector("#fhPsD20Forced"),null,"the console stays uncluttered until fine-tuning is asked for");
root.querySelector("[data-console-adv]").click();
const portent=root.querySelector("#fhPsD20Forced");portent.value="17";portent.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector('[data-add-tray-die="6"]').click();
const generic=root.querySelector("[data-bonus-row]");
generic.querySelector("[data-bonus-label]").value="Superiority";
generic.querySelector("[data-bonus-forced]").value="6";
generic.querySelector("[data-bonus-forced]").dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("#fhPsRunRoll").click();
entry=t.state.history[0];
assert.equal(entry.kept,17,"Portent replaces the d20 roll");
assert.equal(entry.d20Forced,true,"a forced d20 is stored as manual");
assert.equal(entry.bonusDice[0].forced,true,"a forced tray bonus die is stored as manual");
assert.equal(entry.bonusDice[0].sourceIcon,"other-1","the first custom die keeps its Other I identity after its label is edited");
assert.equal(root.querySelector(".fh-cd-src b").textContent.trim(),"I","the die carries the Other I seal in the frame");
assert.match(t.state.currentEvent.text,/MANUAL/,"the roll event visibly marks forced results");
assert.match(root.querySelector(".fh-cd-sentry").textContent,/MANUAL/,"the stream line marks forced results too");
root.querySelector("[data-event-ok]").click();
root.querySelector("[data-clear-tray]").click();

/* ── Destiny Score is click-to-edit, no padlock ──────────────── */
assert.equal(root.querySelector('[data-destiny-field="score"]'),null,"the Score is not an input until it is clicked");
const scoreBefore=root.querySelector("[data-score-edit]").textContent.trim();
root.querySelector("[data-score-edit]").click();
const scoreInput=root.querySelector('[data-destiny-field="score"]');
assert.ok(scoreInput,"clicking the Score turns it into an editable field");
assert.equal(scoreInput.disabled,false,"the revealed field is directly editable — no lock to open first");
scoreInput.value=String(Number(scoreBefore)+1);
scoreInput.dispatchEvent(new window.Event("change",{bubbles:true}));
assert.equal(t.state.destiny.score,Number(scoreBefore)+1,"the typed Score is committed");
assert.equal(root.querySelector('[data-destiny-field="score"]'),null,"committing closes the inline editor");
t.state.destiny.score=Number(scoreBefore);t.render();

/* ── Vitals: full words, five passives, tracked hit points ───── */
assert.match(root.querySelector(".fh-cd-vsave").textContent,/^Save /,"saves are spelled out instead of SV");
const passiveNames=Array.from(root.querySelectorAll(".fh-cd-pcell small"),node=>node.textContent);
assert.deepEqual(passiveNames,["Vigilance","Delve","Survival","Insight","Investigation"],"five passives are written in full, in reading order");
assert.equal(root.querySelector(".fh-cd-plabel").textContent,"PASSIVES","the row is labelled in full");
const miniCells=Array.from(root.querySelectorAll(".fh-cd-mstat,.fh-cd-minfo"),node=>node.textContent.trim().split(/\s+/)[0]);
assert.deepEqual(miniCells,["PB","INIT","AC","HP","REST"],"Rest sits with PB/INIT/AC/HP, not with Destiny");
// PB and AC are read-outs; only the three that roll or act are buttons.
assert.deepEqual(Array.from(root.querySelectorAll(".fh-cd-minfo"),n=>n.tagName),["SPAN","SPAN"],"PB and AC are not buttons");
assert.deepEqual(Array.from(root.querySelectorAll(".fh-cd-mstat"),n=>n.textContent.trim().split(/\s+/)[0]),["INIT","HP","REST"],"only INIT, HP and REST are actionable");
assert.ok(root.querySelector("#fhPsLongRest .fh-icon"),"Rest is carried by an icon, not by a bare number");
assert.equal(root.querySelectorAll(".fh-cd-vgear").length,13,"every ability, save and initiative carries its own console gear");

assert.equal(root.querySelector(".fh-cd-hp"),null,"the hit point tracker costs no height until it is opened");
root.querySelector("[data-hp-open]").click();
assert.ok(root.querySelector(".fh-cd-hp"),"clicking HP opens the tracker");
const hpMax=root.querySelector('[data-hp-field="max"]');
hpMax.value="34";hpMax.dispatchEvent(new window.Event("change",{bubbles:true}));
assert.equal(t.state.vitals.max,34,"the typed maximum is stored");
assert.equal(t.state.vitals.current,34,"setting a maximum starts the character at full health");
root.querySelector('[data-hp-step="-5"]').click();
root.querySelector('[data-hp-step="-1"]').click();
assert.equal(t.state.vitals.current,28,"damage steps subtract from current hit points");
root.querySelector('[data-hp-step="1"]').click();
assert.equal(t.state.vitals.current,29,"healing steps add back");
root.querySelector("[data-hp-full]").click();
assert.equal(t.state.vitals.current,34,"FULL returns to the maximum");
root.querySelector('[data-hp-step="-5"]').click();
const pointsBeforeRest=t.state.destiny.points;
root.querySelector("#fhPsLongRest").click();
assert.equal(t.state.vitals.current,34,"a long rest also restores hit points");
assert.equal(t.state.destiny.points,Math.min(t.state.destiny.score,pointsBeforeRest+1),"a long rest still returns one Destiny Point");
root.querySelector("[data-hp-open]").click();
assert.equal(root.querySelector(".fh-cd-hp"),null,"the tracker collapses again");

/* ── Window modes replace the lone collapse arrow ────────────── */
assert.deepEqual(Array.from(root.querySelectorAll("[data-cd-mode]"),node=>node.dataset.cdMode),["margin","table","seal"],"the header offers Margin, Table and Seal");
assert.ok(root.querySelector('[data-cd-mode="margin"]').classList.contains("is-on"),"Margin is the active mode while docked");
root.querySelector('[data-cd-mode="seal"]').click();
assert.equal(t.state.dockOpen,false,"Seal collapses the dock");
root.querySelector('[data-cd-mode="margin"]').click();
assert.equal(t.state.dockOpen,true,"Margin brings it back");

root.querySelector("[data-destiny-die]").click();
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Roll and spend this Destiny die\?/i,"outside a console, Destiny uses the explicit spend confirmation");
assert.match(root.querySelector(".fh-cd-overlay").textContent,/Current Points:/i,"the direct-spend warning shows current Destiny Points");
root.querySelector("[data-tray-cancel]").click();

/* ── Inline sheet editing ────────────────────────────────────── */
const originalName=t.state.character.name;
openMenu();
root.querySelector("#fhPsCorrect").click();
assert.ok(t.state.editDraft,"Edit opens a working copy");
assert.ok(root.querySelector(".fh-cd-pop"),"the working copy takes over the dock as a full panel");
assert.ok(root.querySelector("#fhPsEditSave")&&root.querySelector("#fhPsEditCancel"),"the working copy exposes explicit Save and Cancel actions");
assert.equal(root.querySelector(".fh-ps-right"),null,"the old temporary right panel is gone for good");
root.querySelector("#fhPsEditName").value="Discarded name";
root.querySelector("#fhPsEditCancel").click();
assert.equal(t.state.character.name,originalName,"Cancel discards the working copy without changing the live sheet");

openMenu();
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
  assert.ok(root.querySelector(".fh-cd-sdots"),"a red dot reminds the player that a special bonus is active");
  assert.match(root.querySelector(".fh-cd-sdots").title,/Arcane focus \+2/,"hover text explains each red bonus dot");
  assert.equal(Object.keys(t.state.character.skills).filter(name=>name.indexOf("Tool - ")!==0).length,26,"Edit mode cannot add or delete core skills");
  console.log("Player sheet DOM integration tests passed.");
},0);
