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
/* The belt's panels live in their own files and register onto window.FH.panels.
   Load them the way the page does, or the dock under test has one tab and the
   thing the belt exists for goes uncovered. */
const panelDir = path.join(__dirname,"..","docs","javascripts");
for (const name of fs.readdirSync(panelDir).filter(f=>/^fh-panel-.*\.js$/.test(f)).sort()) {
  vm.runInNewContext(fs.readFileSync(path.join(panelDir,name),"utf8"),sandbox,{filename:name});
}
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
/* Since dock v5 a roll ends on nothing at all: it lands in the stream and stays
   open. Closing one out means answering what blocks, then clearing the tray. */
/* REWRITTEN (dock v6): there is no Continue button to click through — an
   announcement never waited on one. Only a decision does, and each test that
   raises one answers it itself. */
function settleRoll(){
  const clear=root.querySelector("[data-clear-tray]");
  if(clear && !clear.disabled) clear.click();
}

/* ── Dock chrome ─────────────────────────────────────────────── */
assert.ok(root.querySelector(".fh-cd-dock"),"the Companion renders as a docked panel");
assert.equal(root.querySelector(".fh-ps-commandbar"),null,"the old command bar is gone");
assert.equal(root.querySelector(".fh-ps-rail"),null,"the redundant vertical rail no longer consumes sheet width");
/* REWRITTEN (belt): the satchel/loupe/anvil buttons left the header when the
   belt arrived -- Gear and Craft are tabs now, and navigation belongs to the
   belt. The header is identity and window chrome only. What still matters is
   not where the three pops are reached from, but that all three ARE reached,
   so this asserts the new route rather than dropping the old one. */
assert.equal(root.querySelector('.fh-cd-head [data-open-pop]'),null,"the dock header no longer carries content navigation");
assert.equal(root.querySelectorAll(".fh-cd-belttab").length,7,"the belt shows its seven sections");
function showPanel(id){root.querySelector('.fh-cd-belttab[data-panel="'+id+'"]').click();}
showPanel("gear");
assert.ok(root.querySelector('[data-open-pop="inventory"]'),"Gear reaches the inventory");
showPanel("craft");
assert.ok(root.querySelector('[data-open-pop="loop"]')&&root.querySelector('[data-open-pop="forge"]'),"Craft reaches the Soulforging Loop and the Soulforge");
showPanel("skills");
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

/* ── Major events keep their own line ────────────────────────────
   REWRITTEN (dock v6): each of these used to be a card with a Continue or
   Finish button under the dice. They are now lines above the dice, stacked,
   with no button at all — only the newest is marked current. */
const specialScenes=[
  ["nat1","NATURAL 1 · Fate accepted"],
  ["nat20","NATURAL 20 · Fate bends in your favor"],
  ["arcane-critical-failure","ARCANE CRITICAL FAILURE · Destiny d8 rolled 1"],
  ["arcane-critical-success","ARCANE CRITICAL SUCCESS · Destiny d8 rolled 8"]
];
t.state.events=[];
specialScenes.forEach(([kind,text],index)=>{
  t.state.events.unshift({id:"scene-"+index,kind,text,createdAt:new Date().toISOString()});
  t.render();
  const line=root.querySelector(".fh-cd-eline.is-"+kind);
  assert.ok(line,"the "+kind+" event renders its own line");
  assert.equal(line.querySelector("button"),null,"an announcement carries no button");
  assert.ok(line.classList.contains("is-current"),"and the one that just arrived is the current one");
});
assert.equal(root.querySelectorAll(".fh-cd-eline").length,4,"every earlier line is still on screen");
assert.equal(root.querySelectorAll(".fh-cd-eline.is-current").length,1,"exactly one line is current");
// The zone sits between the badge strip and the dice.
// The frame carries a mood class when something is owed, so match on the first
// class name rather than the whole attribute.
const stageChildren=Array.from(root.querySelector(".fh-cd-stage").children).map(node=>node.className.split(/\s+/)[0]);
assert.ok(stageChildren.indexOf("fh-cd-temps")<stageChildren.indexOf("fh-cd-events"),"events come after the badges");
assert.ok(stageChildren.indexOf("fh-cd-events")<stageChildren.indexOf("fh-cd-frame"),"and before the dice");
t.state.events=[{id:"awaken",kind:"awakening",text:"ARCANE AWAKENING · Natural 20 at Destiny 0",createdAt:new Date().toISOString()}];
t.render();
assert.match(root.querySelector(".fh-cd-eline.is-awakening").textContent,/The Hermit/i,"Arcane Awakening reveals the character's Major Arcana");
t.state.events=[{id:"chaos",kind:"chaos",text:"Chaos has noticed · 2d6 = 3 + 5",chaosRoll:[3,5],createdAt:new Date().toISOString()}];
t.render();
assert.match(root.querySelector(".fh-cd-eline.is-chaos").textContent,/total 8/,"Chaos shows its 2d6 total");
t.state.events=[];
t.state.queueDone="";
t.render();
assert.equal(root.querySelector(".fh-cd-events"),null,"an empty list costs the dice no height");

/* ── Console ─────────────────────────────────────────────────── */
root.querySelector('[data-config-name="Arcana"]').click();
assert.match(root.querySelector(".fh-cd-cname").textContent,/Arcana \+6/,"opening a console names the prepared check");
assert.match(root.querySelector(".fh-cd-status").textContent,/Arcana \+6/,"the roller frame echoes the prepared check");
assert.equal(root.querySelectorAll(".fh-cd-dicerow .fh-cd-diewrap").length,1,"a flat console starts with one prepared d20");
// REWRITTEN (dock v5): the Guid / Bard / Destiny chips are gone. Every die now
// comes from the white picker, and a seal is something you give a die afterwards.
assert.equal(root.querySelectorAll("[data-bonus-preset]").length,0,"the Guidance and Bardic chips are gone from the console");
assert.equal(root.querySelector("#fhPsDestinyDie"),null,"and so is the Destiny selector — the gold pool is the only way in");
assert.equal(root.querySelectorAll(".fh-cd-whiterow .fh-cd-wdie").length,7,"the white picker offers d4 through d100");
assert.equal(root.querySelector("#fhPsRunRoll"),null,"the console no longer carries a second roll button");
assert.match(root.querySelector("[data-roll-now]").textContent,/^ROLL/,"one permanent ROLL leads with its label");

root.querySelector('.fh-cd-whiterow [data-add-tray-die="4"]').click();
root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').click();
assert.equal(t.state.rollConfig.bonusDice.length,1,"a white die joins the prepared roll");
assert.equal(t.state.rollConfig.bonusDice[0].sides,4,"and keeps the size that was clicked");
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

root.querySelector("[data-roll-now]").click();
assert.equal(root.querySelector('[data-die-choice="0"]'),null,"advantage was decided before the roll — it never stops to ask");
let entry=t.state.history[0];
assert.equal(entry.d20s.length,2,"advantage rolls two d20s");
assert.equal(entry.kept,Math.max(entry.d20s[0],entry.d20s[1]),"advantage keeps the higher d20");
// REWRITTEN (dock v5): the die is a plain d4 until a seal is put on it.
assert.equal(entry.bonusDice[0].sides,4,"the picked d4 rolls beside the d20s");
assert.equal(t.state.trayResults.length,4,"the frame displays both d20s, the bonus die and the +2 token");
assert.equal(root.querySelectorAll('.fh-cd-static3d[data-sides="20"]').length,2,"resolved d20s use the static 3D renderer");
assert.equal(root.querySelector('.fh-cd-static3d').dataset.result,String(entry.d20s[0]),"the renderer receives the face already chosen by FHPC");
const originalD20=Array.from(entry.d20s);

/* ── Stream ──────────────────────────────────────────────────── */
settleRoll();
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
root.querySelector("[data-roll-now]").click();
entry=t.state.history.find(item=>item.id===entry.id);
assert.deepEqual(Array.from(entry.d20s),originalD20,"adjusting bonuses never rerolls the original d20s");
assert.equal(entry.custom,3,"the edited bonus is applied");
settleRoll();

/* ── Destiny is staged, never spent, until ROLL ────────────────── */
// REWRITTEN (dock v6): the confirmation popup is gone. A gold die is picked up
// exactly like a white one — the click stages it, ROLL spends it, and a right
// click on the die in the tray puts it back.
root.querySelector('[data-config-name="Arcana"]').click();
root.querySelector("[data-destiny-die]").click();
assert.equal(root.querySelector(".fh-cd-popups"),null,"no popup stands between the pool and the tray");
assert.ok(t.state.rollConfig.destinyDieId,"the die is staged in console state by the click alone");
assert.ok(t.state.destiny.dice.some(die=>die.id===t.state.rollConfig.destinyDieId&&die.available),"and it is still in the pool, unspent");
assert.match(root.querySelector(".fh-cd-events").textContent,/waits in the tray/i,"a line says it is waiting");
// Right click on the staged gold die takes it back, and its line goes with it.
const stagedGold=root.querySelector("[data-die-destiny]");
assert.ok(stagedGold,"the staged Destiny die answers to a right click");
stagedGold.dispatchEvent(new window.Event("contextmenu",{bubbles:true,cancelable:true}));
assert.match(root.querySelector(".fh-cd-popups").textContent,/Remove this die/i,"its menu offers to cancel it");
assert.equal(root.querySelector(".fh-cd-popups").textContent.includes("Colour"),false,"gold is a Destiny die's identity, so no palette is offered");
root.querySelector("[data-die-drop]").click();
assert.equal(t.state.rollConfig.destinyDieId,"","cancelling takes the die back");
assert.equal(root.querySelector(".fh-cd-events"),null,"and takes its line with it");

root.querySelector("[data-destiny-die]").click();
assert.ok(root.querySelector(".fh-cd-ddie.is-selected"),"the staged Destiny die is flagged in the pool");
assert.equal(t.state.trayResults[0].label,"Destiny","the staged Destiny die appears first in the frame");
const beforeDestinyHistory=t.state.history.length;
root.querySelector("[data-roll-now]").click();
assert.equal(t.state.history.length,beforeDestinyHistory+1,"REWRITTEN (dock v6): no click stands between Destiny and the d20");
assert.ok(t.state.events.some(event=>/Destiny d\d+ rolled \d+/i.test(event.text)),"the Destiny summary is announced as a line");
assert.equal(root.querySelector("[data-clear-tray]").disabled,false,"and nothing is blocking, so CLEAR TRAY stays reachable");
entry=t.state.history[0];
assert.equal(t.state.trayResults[0].label,"Destiny","the spent Destiny result remains before the d20s");
assert.equal(t.state.trayResults[1].sides,20,"the d20 result follows Destiny in the frame");
settleRoll();

/* ── A landed roll stays open behind the one ROLL ─────────────── */
// REWRITTEN (dock v5): no rescue popup, no APPLY. The roll stays open, the
// sources call for three seconds, and ROLL rolls whatever was added since.
root.querySelector('[data-config-name="Arcana"]').click();
const dc=root.querySelector("#fhPsDc");dc.value="20";dc.dispatchEvent(new window.Event("change",{bubbles:true}));
root.querySelector("[data-roll-now]").click();
entry=t.state.history[0];
const failedD20=Array.from(entry.d20s);
const linesAfterRoll=t.state.history.length;
assert.equal(root.querySelector(".fh-cd-popups"),null,"a known failure no longer stops the table with a popup");
assert.ok(root.querySelector("[data-roll-now]"),"the one ROLL is still the only button");
assert.equal(root.querySelector("[data-clear-tray]").disabled,false,"and an open roll never locks the dock");
const whiteD6=root.querySelector('.fh-cd-whiterow [data-add-tray-die="6"]');
assert.equal(whiteD6.disabled,false,"the white picker stays live to add another die");
assert.ok(whiteD6.classList.contains("is-calling"),"it calls for one, briefly");
assert.ok(root.querySelector(".fh-cd-ddie.is-calling"),"the Destiny pool calls too");
whiteD6.click();
assert.equal(t.state.rollSequence.staged.length,1,"the picked die is staged, not rolled on the spot");
assert.match(root.querySelector("[data-roll-now]").textContent,/1 new die/,"ROLL says what it is about to roll");
root.querySelector("[data-roll-now]").click();
assert.deepEqual(Array.from(entry.d20s),failedD20,"rolling a late modifier never rerolls the failed d20");
assert.equal(entry.bonusDice.length,1,"the staged die is rolled and folded into the same entry");
assert.ok(entry.bonusDice[0].result,"and it really rolled");
assert.equal(t.state.history.length,linesAfterRoll,"it joins the same stream line rather than opening a new one");
settleRoll();
assert.equal(t.state.rollSequence,null,"CLEAR TRAY is what releases an open roll");

/* ── A pool die boosts a roll that already landed ────────────── */
t.state.destiny.points=6;
t.state.destiny.dice.forEach(die=>{die.available=true;});
t.render();
root.querySelector('[data-quick-name="Arcana"]').click();
const settled=t.state.history[0];
const totalBeforeBoost=settled.total;
const pointsBeforeBoost=t.state.destiny.points;
// REWRITTEN (dock v5): the roll is already filed; it simply stays open.
assert.ok(t.state.rollSequence,"a flat roll stays open after it lands");
root.querySelector("[data-destiny-die]").click();
// REWRITTEN (dock v6): the boost confirmation is gone with every other Destiny
// popup — the click stages the die, and ROLL is what spends it.
assert.equal(root.querySelector(".fh-cd-popups"),null,"a pool die is staged by the click, with nothing to confirm");
assert.equal(t.state.destiny.points,pointsBeforeBoost,"staging spends nothing");
assert.ok(t.state.rollSequence.staged.some(item=>item.kind==="destiny"),"the die waits inside the open roll");
root.querySelector("[data-roll-now]").click();
settleRoll();
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
root.querySelector("[data-roll-now]").click();
assert.equal(t.state.history[0].name,"Fireball","the free roll keeps its purpose in history");
assert.equal(t.state.history[0].dice.length,8,"all damage dice are recorded");
// REWRITTEN (dock v5): a free roll drops its trailing result popup too — the
// tray shows the verdict and the stream keeps it. Only a nat 20/1 stops the table.
assert.equal(root.querySelector("[data-event-ok]"),null,"a free roll no longer ends in a result popup");
assert.match(root.querySelector(".fh-cd-status b").textContent,/^Fireball /,"its verdict reads straight off the tray");
settleRoll();

/* ── Portents live in each die's own right-click menu ─────────── */
// REWRITTEN (dock v5): the FINE TUNE drawer is gone. A Portent belongs to one
// die, so it is a dropdown inside that die's menu.
root.querySelector('[data-config-name="Arcana"]').click();
assert.equal(root.querySelector("[data-console-adv]"),null,"the ⋯ drawer is gone from the console");
assert.equal(root.querySelector("[data-die-portent]"),null,"a Portent only exists once a die is picked up");
function tuneDie(selector){
  const die=root.querySelector(selector);
  die.dispatchEvent(new window.Event("contextmenu",{bubbles:true,cancelable:true}));
  return root.querySelector("[data-die-portent]");
}
// linkedom exposes select.value read-only, so the option is selected directly.
function choosePortent(select,face){
  select.querySelector('option[value="'+face+'"]').selected=true;
  select.dispatchEvent(new window.Event("change",{bubbles:true}));
}
let portent=tuneDie(".fh-cd-diewrap[data-die-base]");
assert.ok(portent,"the base d20 has its own menu with a Portent dropdown");
assert.equal(portent.querySelectorAll("option").length,21,"a d20 offers — plus its twenty faces");
choosePortent(portent,17);
assert.equal(t.state.rollConfig.d20ForcedResult,17,"choosing a face forces the d20");
root.querySelector('.fh-cd-whiterow [data-add-tray-die="6"]').click();
portent=tuneDie('.fh-cd-diewrap[data-die-bonus]');
assert.equal(portent.querySelectorAll("option").length,7,"a d6 offers — plus its six faces");
choosePortent(portent,6);
root.querySelector("[data-die-seal='other-1']").click();
root.querySelector("[data-tray-close]").click();
root.querySelector("[data-roll-now]").click();
entry=t.state.history[0];
assert.equal(entry.kept,17,"Portent replaces the d20 roll");
assert.equal(entry.d20Forced,true,"a forced d20 is stored as manual");
assert.equal(entry.bonusDice[0].forced,true,"a forced tray bonus die is stored as manual");
assert.equal(entry.bonusDice[0].sourceIcon,"other-1","the first custom die keeps its Other I identity after its label is edited");
assert.equal(root.querySelector(".fh-cd-src b").textContent.trim(),"I","the die carries the Other I seal in the frame");
// REWRITTEN (tranche 2): there is no result popup left to carry the mark, so the
// dice themselves carry it while the roll stays open on APPLY.
assert.match(root.querySelector(".fh-cd-dicerow").textContent,/MANUAL/,"a forced die is marked MANUAL in the tray itself");
assert.match(root.querySelector(".fh-cd-sentry").textContent,/MANUAL/,"the stream line marks forced results too");
settleRoll();
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
// REWRITTEN (Exhaustion): the strip gains the Exhaustion read-out and the short
// rest that clears a level, both next to HP where the player already looks.
assert.deepEqual(miniCells,["PB","INIT","AC","HP","EXH","SHORT","REST"],"vitals, Exhaustion and both rests sit together, not with Destiny");
// PB and AC are read-outs; only the cells that roll or act are buttons.
// REWRITTEN (Exhaustion): EXH opens the same tracker as HP, and SHORT spends the
// one short rest that clears a level.
assert.deepEqual(Array.from(root.querySelectorAll(".fh-cd-minfo"),n=>n.tagName),["SPAN","SPAN"],"PB and AC are not buttons");
assert.deepEqual(Array.from(root.querySelectorAll(".fh-cd-mstat"),n=>n.textContent.trim().split(/\s+/)[0]),["INIT","HP","EXH","SHORT","REST"],"only the cells that roll or act are actionable");
assert.equal(root.querySelector("#fhPsShortRest").disabled,true,"SHORT is dead while there is no Exhaustion to shake off");
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
// REWRITTEN (Exhaustion recovery): a long rest always clears one level; a short
// rest may clear one MORE, but only once a day between two long rests.
root.querySelector('[data-exh-step="1"]').click();
root.querySelector('[data-exh-step="1"]').click();
assert.equal(t.state.vitals.exhaustion,2,"two levels taken by hand");
root.querySelector("#fhPsLongRest").click();
assert.equal(t.state.vitals.current,34,"a long rest also restores hit points");
assert.equal(t.state.destiny.points,Math.min(t.state.destiny.score,pointsBeforeRest+1),"a long rest still returns one Destiny Point");
assert.equal(t.state.vitals.exhaustion,1,"and a long rest always clears one level of Exhaustion");
assert.equal(root.querySelector("#fhPsShortRest").disabled,false,"the day's short rest is available again");
root.querySelector("#fhPsShortRest").click();
assert.equal(t.state.vitals.exhaustion,0,"a short rest clears one more level");
root.querySelector('[data-exh-step="1"]').click();
assert.equal(t.state.vitals.exhaustion,1,"one level taken again");
assert.equal(root.querySelector("#fhPsShortRest").disabled,true,"but only once a day — a second short rest before the next long rest does nothing");
root.querySelector("#fhPsLongRest").click();
assert.equal(t.state.vitals.exhaustion,0,"the next long rest clears it regardless, and resets the day's short rest too");
root.querySelector("[data-hp-open]").click();
assert.equal(root.querySelector(".fh-cd-hp"),null,"the tracker collapses again");

/* ── Window modes replace the lone collapse arrow ────────────── */
assert.deepEqual(Array.from(root.querySelectorAll("[data-cd-mode]"),node=>node.dataset.cdMode),["margin","table","seal"],"the header offers Margin, Table and Seal");
assert.ok(root.querySelector('[data-cd-mode="margin"]').classList.contains("is-on"),"Margin is the active mode while docked");
root.querySelector('[data-cd-mode="seal"]').click();
assert.equal(t.state.dockOpen,false,"Seal collapses the dock");
root.querySelector('[data-cd-mode="margin"]').click();
assert.equal(t.state.dockOpen,true,"Margin brings it back");

/* REWRITTEN (dock v6): outside a console there is no spend confirmation left.
   The gold die goes to the free tray like a white one, blinking, and ROLL is
   the only thing that spends it — which is what makes cancelling free. */
const pointsBeforeStandalone=t.state.destiny.points;
root.querySelector("[data-destiny-die]").click();
assert.equal(root.querySelector(".fh-cd-popups"),null,"the cold-click spend confirmation is gone");
assert.ok(t.state.destinyStaged,"the die waits in the free tray instead");
assert.equal(t.state.destiny.points,pointsBeforeStandalone,"and clicking a gold die can no longer spend Destiny on its own");
const waitingGold=root.querySelector("[data-die-pool]");
assert.ok(waitingGold,"it is reachable by right click in the tray");
assert.ok(waitingGold.classList.contains("is-flashing"),"and blinks between empty and full until ROLL");
assert.match(root.querySelector("[data-roll-now]").textContent,/Destiny d\d+/,"ROLL says what it is about to spend");
waitingGold.dispatchEvent(new window.Event("contextmenu",{bubbles:true,cancelable:true}));
root.querySelector("[data-die-drop]").click();
assert.equal(t.state.destinyStaged,null,"and a right click puts it back in the pool");

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
