"use strict";

// Optional DOM-level smoke test for the Companion dock. Install with:
// npm install   (linkedom is a devDependency in the repo's package.json)
// Every assertion below is a behaviour the sheet had before the dock redesign,
// re-pointed at the new markup, plus the behaviours the redesign added.
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
  globalThis.__fhPlayerSheetIntegration = {state, render, effectiveCharacter, loadPlayState, rollSummaryText};
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
/* REWRITTEN (zone overlay pass, 2026-08-03): Stream is `optional`, off by
   default (UI-TERMINOLOGY.md zone 10) and now a real toggle instead of an
   always-mounted zone, so it is absent from the DOM until opened -- the old
   counts of 3 and 7 assumed it was always there. Opened once here and left
   open, since everything from the "Stream" section below reads finished
   rolls straight out of its zone, the same way the file always has. */
assert.equal(root.querySelector('[data-zone="stream"]'),null,"Stream starts closed, off by default");
openMenu();
root.querySelector('[data-stream-toggle]').click();
assert.equal(root.querySelectorAll('[data-zone="console"],[data-zone="roller"],[data-zone="stream"]').length,3,"console, roller and stream are distinct zones");
/* REWRITTEN (dock-dice-tray, 2026-08-03): the Dice Tray is its own zone now
   (data-zone="dice-tray", extracted from the roller), and it is `persistent`
   — present on every panel. Seven zones became eight with the Stream open. */
assert.equal(root.querySelectorAll("[data-zone]").length,8,"the dock shows its eight zones at once, Stream opened");
assert.ok(root.querySelector('[data-zone="dice-tray"]'),"the Dice Tray is a zone of its own");
openMenu();
assert.ok(root.querySelector("#fhPsLevel"),"an unlinked character keeps Level Up under the menu");
/* General rule: a click outside an open dropdown closes it. root itself is
   not a button, so handleClick no-ops on it -- a click that changes nothing
   else, only proving the outside-close rule on its own. */
root.click();
assert.equal(root.querySelector(".fh-cd-menu"),null,"a click outside the header menu closes it");

openMenu();
document.body.click();
assert.equal(root.querySelector(".fh-cd-menu"),null,"a click outside the dock entirely closes it too");

t.state.profile.ddbLinked=true;
t.state.menuOpen=true;
t.render();
assert.match(root.querySelector("#fhPsSync").textContent,/^Sync/,"a linked character gets the direct Sync action");
assert.ok(root.querySelector("#fhPsRelink"),"a linked character can still replace its DDB link");
assert.equal(root.querySelector("#fhPsLevel"),null,"Level Up disappears when Sync is the source of truth");
t.state.profile.ddbLinked=false;
t.state.menuOpen=false;
t.render();

/* ── Major events: the stacked lines are gone ────────────────────
   REWRITTEN (dock v6): each of these used to be a card with a Continue or
   Finish button under the dice, then a stack of lines above them.
   REWRITTEN AGAIN (dock-dice-tray, third fitting, Eric 2026-08-03): the
   stack itself is gone — above the judgment window there are only the
   badges. What an event still does is set the frame's MOOD; what it said
   is carried by the Ruling in the window and by the Stream's record. */
const specialScenes=[
  ["nat1","NATURAL 1 · Fate accepted","crit-failure"],
  ["nat20","NATURAL 20 · Fate bends in your favor","crit-success"],
  ["arcane-critical-failure","ARCANE CRITICAL FAILURE · Destiny d8 rolled 1","arcane-failure"],
  ["arcane-critical-success","ARCANE CRITICAL SUCCESS · Destiny d8 rolled 8","arcane-success"]
];
t.state.events=[];
specialScenes.forEach(([kind,text,mood],index)=>{
  t.state.events.unshift({id:"scene-"+index,kind,text,createdAt:new Date().toISOString()});
  t.render();
  assert.equal(root.querySelector(".fh-cd-eline"),null,"no stacked line for "+kind+" — the window and the Stream carry it");
  assert.ok(root.querySelector(".fh-cd-frame.is-judgment").classList.contains("mood-"+mood),
    "the "+kind+" event sets the judgment window's mood");
});
const stageChildren=Array.from(root.querySelector(".fh-cd-stage").children).map(node=>node.className.split(/\s+/)[0]);
assert.equal(stageChildren.indexOf("fh-cd-events"),-1,"no event zone in the roller at all");
assert.ok(stageChildren.indexOf("fh-cd-temps")<stageChildren.indexOf("fh-cd-frame"),"the badges sit above the judgment window");
/* REWRITTEN (dock-dice-tray, three fittings): landed dice left the roller
   for the Dice Tray; the roller's frame is the permanent judgment window,
   dressed as assembly while a prepared (pending) d20 waits on ROLL. */
assert.ok(root.querySelector('.fh-cd-stage .fh-cd-frame.is-judgment.is-assembly'),"the judgment window is dressed as assembly while a hand waits");
assert.equal(root.querySelector('.fh-cd-stage .fh-cd-frame.is-trayhand'),null,"never a landed hand");
t.state.events=[];
t.state.queueDone="";
t.render();

/* ── Console ─────────────────────────────────────────────────── */
root.querySelector('[data-config-name="Arcana"]').click();
/* REWRITTEN (round 7b): the console no longer repeats the check's name above
   the dice -- the tray right below it already says what is being rolled, so
   the console header was saying the same thing twice. */
assert.equal(root.querySelector(".fh-cd-cname"),null,"the console does not repeat what the tray already names");
/* REWRITTEN (dock-dice-tray): the status line became the tray line's ruling
   space (three tiers, right of the dice) and the dice row became the live
   hand inside the Dice Tray zone. Same claims, new surface. */
/* REWRITTEN (fourth fitting): nothing said twice on the wood — the check's
   identity lives in the RIGHT column ("Arcana / +6"), and the left keeps
   only the informative part ("Ready"). */
assert.match(root.querySelector(".fh-cd-frame.is-judgment .fh-cd-judgeright").textContent,/Arcana/,"opening a console names the prepared check in the right column");
assert.match(root.querySelector(".fh-cd-frame.is-judgment .fh-cd-judgeright").textContent,/\+6/,"with its flat bonus under the name");
assert.equal(root.querySelectorAll(".fh-cd-frame.is-assembly .fh-cd-diewrap").length,1,"a flat console starts with one prepared d20");
// REWRITTEN (dock v5): the Guid / Bard / Destiny chips are gone. Every die now
// comes from the white picker, and a seal is something you give a die afterwards.
assert.equal(root.querySelectorAll("[data-bonus-preset]").length,0,"the Guidance and Bardic chips are gone from the console");
assert.equal(root.querySelector("#fhPsDestinyDie"),null,"and so is the Destiny selector — the gold pool is the only way in");
/* REWRITTEN 2026-08-03 (roll-vocabulary lot): the die classes are named by
   FUNCTION now (UI-ROLL-VOCABULARY.md §2) -- .fh-cd-wdie -> .fh-cd-calling-die,
   .fh-cd-ddie -> .fh-cd-picker-die, .fh-cd-static3d -> .fh-cd-static-die. The
   old names are false about the current markup; every behaviour asserted here
   is unchanged, and each selector still names the same element. */
assert.equal(root.querySelectorAll(".fh-cd-whiterow .fh-cd-calling-die").length,7,"the white picker offers d4 through d100");
assert.equal(root.querySelector("#fhPsRunRoll"),null,"the console no longer carries a second roll button");
/* REWRITTEN (round 7): ROLL is the d20 artwork now, which carries the word on
   its face; the button names itself through the image's alt so it still has an
   accessible name and still paints "ROLL" if the artwork fails to load. */
assert.equal(root.querySelector("[data-roll-now] .fh-cd-rolldie").getAttribute("alt"),"ROLL","one permanent ROLL, named by its die");

root.querySelector('.fh-cd-whiterow [data-add-tray-die="4"]').click();
assert.equal(root.querySelectorAll('.fh-cd-static-die[data-sides="4"][data-pending="1"]').length,1,"the d4 already uses its opaque 3D ready pose before rolling");
root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').click();
assert.equal(t.state.rollConfig.bonusDice.length,1,"a white die joins the prepared roll");
assert.equal(t.state.rollConfig.bonusDice[0].sides,4,"and keeps the size that was clicked");
assert.ok(root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').classList.contains("is-on"),"advantage stays selected");
// REWRITTEN (round 8): D, A and +2 are one mutually-exclusive set now (Eric:
// "when A/D/+2 are off it's a flat roll ... can't be 2 or 3 at a time") --
// lighting +2 turns advantage back off instead of stacking with it, and
// clicking advantage again turns +2 back off in turn.
root.querySelector("#fhPsPlusTwo").click();
assert.equal(root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').classList.contains("is-on"),false,"+2 turns advantage back off");
assert.ok(root.querySelector(".fh-cd-diewrap.is-modifier"),"the +2 option appears as a visible token beside the dice");
// REWRITTEN (lot BACKLOG-C 2026-08-05): the empty src slot is deleted from
// every wrapper — the +2 token is now coin + label, with no slot above it.
assert.equal(root.querySelector(".fh-cd-diewrap.is-modifier .fh-cd-src"),null,"the fixed +2 token carries no source slot at all");
root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').click();
assert.equal(root.querySelector("#fhPsPlusTwo").classList.contains("is-on"),false,"advantage turns +2 back off in turn");
assert.ok(root.querySelector('[data-die-scope="d20"][data-die-mode="advantage"]').classList.contains("is-on"),"advantage is back on for the roll below");

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
// REWRITTEN (round 8): +2 was turned back off (by re-clicking advantage,
// above) before this roll, so the frame carries no +2 token here.
assert.equal(t.state.trayResults.length,3,"the frame displays both d20s and the bonus die");
assert.equal(root.querySelectorAll('.fh-cd-static-die[data-sides="20"]').length,2,"resolved d20s use the static 3D renderer");
assert.equal(root.querySelectorAll('.fh-cd-static-die[data-sides="4"]').length,1,"the resolved bonus d4 uses the same static 3D renderer");
assert.equal(root.querySelector('.fh-cd-static-die').dataset.result,String(entry.d20s[0]),"the renderer receives the face already chosen by FHPC");
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
/* REWRITTEN (round 7b): MOD and DC live behind the console's ⋮ now, so the
   test opens it exactly as a player would. */
assert.equal(root.querySelector("#fhPsCustom"),null,"the manual modifier is not taking room in the row until it is asked for");
root.querySelector("[data-console-menu]").click();
const custom=root.querySelector("#fhPsCustom");
assert.ok(custom,"the ⋮ reveals the manual modifier");
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
/* REWRITTEN (third fitting): no announcement line — the staged gold die
   itself says it is waiting, flashing in the judgment window, and the flash
   never stops until ROLL pays the cost. */
assert.ok(root.querySelector(".fh-cd-frame.is-judgment .fh-cd-diewrap.is-flashing"),"the staged die waits in the judgment window, flashing");
// Right click on the staged gold die takes it back, and its line goes with it.
const stagedGold=root.querySelector("[data-die-destiny]");
assert.ok(stagedGold,"the staged Destiny die answers to a right click");
stagedGold.dispatchEvent(new window.Event("contextmenu",{bubbles:true,cancelable:true}));
assert.match(root.querySelector(".fh-cd-popups").textContent,/Remove this die/i,"its menu offers to cancel it");
assert.equal(root.querySelector(".fh-cd-popups").textContent.includes("Colour"),false,"gold is a Destiny die's identity, so no palette is offered");
root.querySelector("[data-die-drop]").click();
assert.equal(t.state.rollConfig.destinyDieId,"","cancelling takes the die back");
assert.equal(root.querySelector(".fh-cd-frame.is-judgment .fh-cd-diewrap.is-flashing"),null,"and stops waiting anywhere");

root.querySelector("[data-destiny-die]").click();
assert.ok(root.querySelector(".fh-cd-picker-die.is-selected"),"the staged Destiny die is flagged in the pool");
/* REWRITTEN (fourth fitting, 2026-08-04): strict left-to-right construction
   — the staged Destiny die takes its chronological place, last. */
assert.equal(t.state.trayResults[t.state.trayResults.length-1].label,"Destiny","the staged Destiny die takes its construction-order place");
const beforeDestinyHistory=t.state.history.length;
root.querySelector("[data-roll-now]").click();
assert.equal(t.state.history.length,beforeDestinyHistory+1,"REWRITTEN (dock v6): no click stands between Destiny and the d20");
assert.ok(t.state.events.some(event=>/Destiny d\d+ rolled \d+/i.test(event.text)),"the Destiny summary is announced as a line");
assert.equal(root.querySelector("[data-clear-tray]").disabled,false,"and nothing is blocking, so CLEAR TRAY stays reachable");
entry=t.state.history[0];
/* REWRITTEN (fourth fitting): construction order — the spent Destiny result
   keeps its chronological place after the d20s, not the head of the row. */
assert.equal(t.state.trayResults[t.state.trayResults.length-1].label,"Destiny","the spent Destiny result keeps its construction-order place");
assert.equal(t.state.trayResults[0].sides,20,"the d20, first posed, leads the hand");
settleRoll();

/* ── A landed roll stays open behind the one ROLL ─────────────── */
// REWRITTEN (dock v5): no rescue popup, no APPLY. The roll stays open, the
// sources call for three seconds, and ROLL rolls whatever was added since.
root.querySelector('[data-config-name="Arcana"]').click();
root.querySelector("[data-console-menu]").click();
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
assert.ok(root.querySelector(".fh-cd-picker-die.is-calling"),"the Destiny pool calls too");
whiteD6.click();
assert.equal(t.state.rollSequence.staged.length,1,"the picked die is staged, not rolled on the spot");
/* REWRITTEN (round 7c): the composition line came off the button -- it is the
   bare die now -- and is headed for the tray's legend. What a press is about
   to roll is announced in the tray, which is where the dice already are. */
assert.match(t.state.trayResultText,/1 new die/,"the tray says what ROLL is about to roll");
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

root.querySelector('[data-add-tray-die="100"]').click();
assert.equal(root.querySelectorAll('.fh-cd-static-die[data-sides="100"] .fh-cd-static-die-part').length,2,"a ready d100 is already represented by two physical d10s");
root.querySelector("[data-roll-now]").click();
const percentileEntry=t.state.history[0],percentileResult=percentileEntry.dice[0].result;
const percentileText=percentileResult===100?"00":String(percentileResult).padStart(2,"0");
assert.equal(Array.from(root.querySelectorAll('.fh-cd-static-die[data-sides="100"] .fh-cd-static-die-result')).map(item=>item.textContent).join(""),percentileText,"the two d10 overlays compose the resolved percentile value");
settleRoll();
root.querySelector("[data-clear-tray]").click();

for(let i=0;i<8;i++)root.querySelector('[data-add-tray-die="6"]').click();
assert.equal(t.state.traySelection.length,8,"the damage roller accepts an 8d6 Fireball pool");
/* REWRITTEN (dock-dice-tray, third fitting): past six dice a pending pool
   is a bare SWARM in the judgment window — mini dice, no wrapper, rows. */
assert.match(root.querySelector(".fh-cd-frame.is-assembly").innerHTML,/is-naked/,"a crowded pool goes bare");
/* REWRITTEN (grille ratifiée Eric, lot BACKLOG-B 2026-08-05): the 6-10
   band scales 30→20 by the crowd — an 8d6 pool stages at 25px. */
assert.match(root.querySelector(".fh-cd-frame.is-assembly").innerHTML,/width="25"/,"as legible minis (8 dice → 25px on the 6-10 scale)");
assert.ok(root.querySelector(".fh-cd-frame.is-assembly .fh-cd-tray-dice.is-swarm"),"in a wrapping swarm row");
/* REWRITTEN (round 7c): the console no longer carries the naming field -- it
   is headed for the tray's legend. The label itself still names the roll and
   still persists, so that contract is asserted here by setting it directly;
   restore a UI assertion once the field reappears in the legend. */
assert.equal(root.querySelector("#fhPsTrayLabel"),null,"the console no longer carries the free roll's naming field");
t.state.trayLabel="Fireball";
root.querySelector("[data-roll-now]").click();
assert.equal(t.state.history[0].name,"Fireball","the free roll keeps its purpose in history");
assert.equal(t.state.history[0].dice.length,8,"all damage dice are recorded");
// REWRITTEN (dock v5): a free roll drops its trailing result popup too — the
// tray shows the verdict and the stream keeps it. Only a nat 20/1 stops the table.
assert.equal(root.querySelector("[data-event-ok]"),null,"a free roll no longer ends in a result popup");
/* REWRITTEN (round 5b): the tray used to print the total the instant the roll
   resolved, while the dice still had most of a second left to roll -- it
   answered the question before the roll could. The verdict now names the roll
   while the dice are in the air and adds the total once they settle. */
/* REWRITTEN (dock-dice-tray, third fitting): the quiet-reveal reads off the
   line's flanks — the RIGHT names the roll and keeps the total quiet as …,
   the LEFT says Rolling… until the dice stop. */
assert.equal(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-title").textContent,"Fireball","while the dice are rolling the right flank names the roll without spoiling it");
assert.equal(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-total").textContent,"…","the total stays quiet while the dice are in the air");
assert.match(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-speak").textContent,/Rolling/,"and the left flank says the dice have not landed yet");
assert.equal(root.querySelector(".fh-cd-sentry .fh-cd-total").textContent,"…","the newest stream line withholds its total too -- it sits right under the tray");
assert.ok(root.querySelectorAll(".fh-cd-die.is-spinning").length>0,"dice that have just landed do roll");
t.state.trayRevealAt=0;t.render();
/* REWRITTEN (dock-dice-tray, third fitting): same claim on the flanks —
   the right keeps the name, and gives up the total once the dice settle. */
assert.equal(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-title").textContent,"Fireball","once the dice settle the right flank still names the roll");
assert.equal(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-total").textContent,String(t.state.history[0].total),"and gives up the total");
assert.equal(root.querySelector(".fh-cd-sentry .fh-cd-total").textContent,String(t.state.history[0].total),"and the stream line gives up its total");
/* Animation is decided per die, not per tray. A tray-wide signature meant any
   later render -- picking up one more die, a Destiny die, anything -- re-rolled
   every die already lying in the tray, whose values had not changed. */
assert.equal(root.querySelectorAll(".fh-cd-die.is-spinning").length,0,"a later render leaves dice that have already landed alone");
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
/* REWRITTEN (chantier sceaux, 2026-08-04): the seal IS the die — a plain
   bonus reads as the ash tint (plus its titled slot), not a numeral token. */
assert.ok(root.querySelector(".fh-cd-frame.is-trayhand [data-material=\"ash\"]"),"the Other die rolls ash — the tint is its seal in the frame");
// REWRITTEN (tranche 2): there is no result popup left to carry the mark, so the
// dice themselves carry it while the roll stays open on APPLY.
/* REWRITTEN (dock-dice-tray, second fitting): die labels went minimal — the
   MANUAL mark moved off the label and reads as the line's badge (tier 3),
   while the die itself keeps its is-forced dress. Same disclosure, said
   once instead of twice. */
assert.match(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-tray-speak").textContent,/MANUAL/,"a forced roll is marked MANUAL on its tray line");
assert.ok(root.querySelector(".fh-cd-frame.is-trayhand .fh-cd-diewrap.is-forced"),"and the forced die itself wears the mark");
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

/* ── One ⋮ pilots every Destiny size's pool; outside-click closes it ── */
root.querySelector("[data-destiny-poolmenu]").click();
assert.ok(root.querySelector(".fh-cd-dpoolmenu"),"the ⋮ opens the pool menu");
root.querySelector('.fh-cd-dpoolmenu [data-destiny-pool="4:1"]').click();
assert.ok(root.querySelector(".fh-cd-dpoolmenu"),"acting inside the menu (Add) keeps it open for the next size");
root.click();
assert.equal(root.querySelector(".fh-cd-dpoolmenu"),null,"a click outside the pool menu closes it, same general rule as the header menu");

/* ── The general rule reaches EVERY floating card (lot BACKLOG-A) ────
   The die menu (right click on a die — Eric's "seal card") and the
   badge cards joined OUTSIDE_CLICK_POPUPS: outside closes, inside
   never does. The roll's decision prompts (nat1, die-choice, chaos,
   arcana-draw, awakening) stay OUT — they are the roll's state
   machine, not menus. */
t.state.traySelection=[{id:"free-click",sides:6}];
t.state.diePrompt={freeId:"free-click"};
t.render();
assert.ok(root.querySelector(".fh-cd-card.is-diemenu"),"a free die's menu (the seal card) is open");
root.querySelector(".fh-cd-card.is-diemenu [data-die-colour=\"crimson\"]").click();
assert.ok(root.querySelector(".fh-cd-card.is-diemenu"),"acting inside the card (a colour) keeps it open");
root.click();
assert.equal(root.querySelector(".fh-cd-card.is-diemenu"),null,"a click outside the die menu closes it, same general rule");
t.state.trayPrompt={type:"pending-new"};
t.render();
assert.ok(root.querySelector(".fh-cd-card.is-badgemenu"),"the PIN A BADGE card is open");
root.querySelector("#fhPsBadgeLabel").click();
assert.ok(root.querySelector(".fh-cd-card.is-badgemenu"),"clicking its input keeps it open — typing must survive");
root.click();
assert.equal(root.querySelector(".fh-cd-card.is-badgemenu"),null,"a click outside the badge card closes it too");
t.state.trayPrompt={type:"nat1",entryId:"none"};
root.click();
assert.equal(t.state.trayPrompt&&t.state.trayPrompt.type,"nat1","a roll DECISION never vanishes on a stray click");
t.state.trayPrompt=null;t.state.traySelection=[];t.render();

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
/* REWRITTEN (round 7c): same as the other two -- the composition line left the
   button for the tray's legend, so what ROLL is about to spend is read there. */
assert.match(t.rollSummaryText(),/Destiny d\d+/,"the roll's composition says what ROLL is about to spend");
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
