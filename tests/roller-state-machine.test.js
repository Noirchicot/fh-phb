"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sourcePath=path.join(__dirname,"..","docs","javascripts","fh-player-sheet.js");
const source=fs.readFileSync(sourcePath,"utf8").replace(/\}\)\(\);\s*$/,`
  globalThis.__fhRollMachine={
    state,makeDestinySlots,setDestinyPoints,spendDestinyDie,destinyEventSpecs,naturalDestiny,
    rollInput,runConfiguredRoll,resolveDieChoice,acknowledgeEvent,queueEvents,renderEventContent,renderStageZone,
    resolveNatOne,rescueWithBardic,rescueWithDestiny,rollTransactionActive,entryTotal,outcomeFor
  };
})();
`);

let uuidCounter=0;
const randomBuckets=[];
const crypto={
  randomUUID:()=>`roll-${++uuidCounter}`,
  getRandomValues:array=>{if(!randomBuckets.length)throw new Error("Deterministic roll queue exhausted");array[0]=randomBuckets.shift();return array;}
};
function queueRolls(...results){randomBuckets.push(...results.map(result=>Number(result)-1));}

const storage=new Map();
const sandbox={URL,clearTimeout,console,crypto,setTimeout,window:{crypto,setTimeout,clearTimeout,history:null,location:{href:"https://example.test/player/"}},
  fetch:async()=>({ok:true,status:200,json:async()=>({profile:{}})}),
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))},
  document:{addEventListener(){}}};
sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox,{filename:sourcePath});
const t=sandbox.__fhRollMachine;

function die(id,sides,available=true){return {id,sides,available};}
function reset(points=5,dice=[die("d4",4,true),die("d6",6,true),die("d8",8,true)]){
  randomBuckets.length=0;
  Object.assign(t.state,{
    code:"",pseudo:"",destiny:{score:8,points,dice:JSON.parse(JSON.stringify(dice)),lastChange:null},history:[],events:[],prefs:{bardicSides:6},
    rollConfig:null,trayPrompt:null,traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayResultText:"",currentEvent:null,eventQueue:[],queueDone:"",queueTotal:0,rollSequence:null,message:"",messageKind:"",
    character:{destinyBuild:{arcana:{name:"The Hermit"}},build:{}}
  });
}
function acknowledgeAll(limit=20){while(t.state.currentEvent&&limit--){t.acknowledgeEvent();}assert.ok(limit>0,"event queue must always terminate");}
function natOne(id="nat-one"){return {id,kind:"d20",name:"Arcana",ability:"INT",baseBonus:3,d20Mode:"flat",d20s:[1],kept:1,natural:1,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"",note:"",createdAt:new Date().toISOString(),total:4,outcome:"Natural 1 · choose fate",natChoice:null};}

// A spent die must disappear. Losing points never recovers the die that was just spent.
reset(3,[die("spent",4,true),die("missing",6,false)]);queueRolls(4);
let spent=t.spendDestinyDie("spent",true);
assert.equal(spent.criticalSuccess,true);
assert.equal(t.state.destiny.points,2);
assert.equal(t.state.destiny.dice.find(item=>item.id==="spent").available,false,"the rolled Destiny die disappears from the full pool");
assert.equal(spent.recovered,null,"spending down to an even score cannot recover a die");
let specs=t.destinyEventSpecs(spent,"entry");
assert.equal(specs.length,1,"all ordinary implications of one Destiny die share one popup");
assert.match(specs[0].text,/ARCANE CRITICAL SUCCESS.*Lost 1 Destiny Point.*Current 2/);

// Gaining points to an even threshold may recover exactly one lowest missing die.
reset(3,[die("fumble",6,true),die("missing-d4",4,false),die("missing-d8",8,false)]);queueRolls(1);
spent=t.spendDestinyDie("fumble",true);specs=t.destinyEventSpecs(spent,"entry");
assert.equal(spent.criticalFailure,true);
assert.equal(t.state.destiny.points,4);
assert.equal(spent.recovered.id,"missing-d4");
assert.equal(specs.length,1);
assert.match(specs[0].text,/ARCANE CRITICAL FAILURE.*Gained 1 Destiny Point.*Gained a Destiny d4/);

// Chaos remains a separate major implication, after the consolidated spend summary.
// Points stop at zero; the shortfall is carried as Overreach, which is what sets the DC.
reset(3,[die("chaos-d8",8,true)]);queueRolls(5);
spent=t.spendDestinyDie("chaos-d8",true);t.state.rollSequence={entry:{ability:"WIS"}};specs=t.destinyEventSpecs(spent,"entry");
assert.equal(specs.length,2);
assert.equal(t.state.destiny.points,0,"Destiny Points never fall below zero");
assert.equal(t.state.destiny.overreach,2,"the 2 points it could not pay become Overreach");
assert.match(specs[0].text,/Lost 3 Destiny Points.*Current 0/);
assert.match(specs[1].text,/CHAOS RISK.*Overreach 2.*WIS save DC 12/);

// Natural 20 and Awakening consolidate score implications into one animated event.
reset(1);let entry={id:"awakening",natural:20};
let events=t.naturalDestiny(entry);
assert.equal(events.length,1);
assert.equal(events[0].kind,"awakening");
assert.match(events[0].text,/ARCANE AWAKENING.*Lost 1 Destiny Point.*Current 0/);

// The button says Continue whenever more dice or another phase still follows.
reset();t.state.rollSequence={phase:"destiny-events"};t.queueEvents([{text:"Destiny summary",kind:"destiny"}],"roll-remaining");
assert.match(t.renderEventContent(),/>Continue</);
assert.doesNotMatch(t.renderEventContent(),/>Finish</);
t.state.rollSequence={phase:"result"};t.queueEvents([{text:"Final result",kind:"result"}],"finish-sequence");
assert.match(t.renderEventContent(),/>Finish</);

// Destiny rolls first. The d20 and bonus dice do not exist until its popup is acknowledged.
reset(5,[die("first",4,true)]);queueRolls(3,15,2,5);
t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",8,{mode:"flat",dc:18}),{guidance:true,bardic:true,bardicSides:6,destinyDieId:"first",destinyConfirmed:true});
t.runConfiguredRoll();
assert.equal(t.state.history.length,0,"the d20 waits while Destiny consequences are shown");
assert.equal(t.state.rollSequence.phase,"destiny-events");
assert.match(t.state.currentEvent.text,/Destiny d4 rolled 3.*Lost 3 Destiny Points/);
assert.match(t.renderEventContent(),/>Continue</);
t.acknowledgeEvent();
assert.equal(t.state.history.length,1);
entry=t.state.history[0];
assert.deepEqual(Array.from(entry.d20s),[15]);
assert.equal(entry.guidance.result,2);assert.equal(entry.bardic.result,5);
assert.equal(t.state.trayResults[0].label,"Destiny","Destiny remains first in the visible tray");
assert.equal(t.state.currentEvent.kind,"result","the final result is always the last blocking event");
assert.match(t.renderEventContent(),/>Finish</);
assert.equal(t.renderStageZone().includes("data-clear-tray disabled"),true,"Clear is disabled until the transaction finishes");
t.acknowledgeEvent();
assert.equal(t.rollTransactionActive(),false);

// Advantage and disadvantage are committed to BEFORE the dice leave the hand,
// so they resolve themselves. Offering a choice on top of them was the old bug.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"advantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"advantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,18,"advantage keeps the higher die");assert.equal(entry.d20Choice,1);acknowledgeAll();
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"disadvantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"disadvantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,4,"disadvantage keeps the lower die");assert.equal(entry.d20Mode,"disadvantage");acknowledgeAll();

// A/D is the one mode that rolls two and lets the player pick afterwards.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"choice"});t.runConfiguredRoll();assert.equal(t.state.history.length,0,"A/D waits");assert.equal(t.state.trayPrompt.type,"die-choice");t.resolveDieChoice(0);entry=t.state.history[0];assert.equal(entry.kept,4,"A/D may deliberately take the lower result");assert.equal(entry.d20Mode,"choice");acknowledgeAll();

reset();queueRolls(10,2,7);t.state.rollConfig=t.rollInput("Tactics","INT",4,{mode:"flat"});t.state.rollConfig.bonusDice=[{id:"superiority",label:"Superiority",sides:8,advantageMode:"advantage",forcedResult:null}];t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"a bonus die on advantage resolves itself too");entry=t.state.history[0];assert.equal(entry.bonusDice[0].result,7);assert.deepEqual(Array.from(entry.bonusDice[0].rolls),[2,7]);assert.equal(entry.total,21);acknowledgeAll();

// A/D on a Destiny die is the Major Arcana case it exists for.
reset(5,[die("destiny-choice",4,true)]);queueRolls(2,4,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",3,{mode:"flat"}),{destinyDieId:"destiny-choice",destinyConfirmed:true,destinyMode:"choice"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt.target,"destiny","Destiny resolves its choice before any d20 exists");t.resolveDieChoice(0);assert.equal(t.state.currentEvent.kind,"destiny");t.acknowledgeEvent();entry=t.state.history[0];assert.equal(entry.destiny.result,2);assert.deepEqual(Array.from(entry.destiny.rolls),[2,4]);acknowledgeAll();

// Portent-style results never consume randomness and remain permanently marked manual.
reset();t.state.rollConfig=t.rollInput("Arcana","INT",5,{mode:"flat"});t.state.rollConfig.d20ForcedResult=17;t.state.rollConfig.bonusDice=[{id:"forced-d8",label:"Superiority",sides:8,advantageMode:"flat",forcedResult:6}];t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.kept,17);assert.equal(entry.d20Forced,true);assert.equal(entry.bonusDice[0].result,6);assert.equal(entry.bonusDice[0].forced,true);assert.equal(entry.total,28);acknowledgeAll();
reset();t.state.rollConfig=t.rollInput("Arcana","INT",0,{mode:"flat"});t.state.rollConfig.d20ForcedResult=10;t.state.rollConfig.bonusDice=[4,6,8,10].map((sides,index)=>({id:"cap-"+index,label:"Bonus "+index,sides,advantageMode:"flat",forcedResult:1}));t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.bonusDice.length,3,"structured checks enforce the three-bonus-die cap in the engine as well as the UI");acknowledgeAll();

// A known failure offers one final bonus die without rerolling the d20.
reset();queueRolls(5);t.state.rollConfig=t.rollInput("Arcana","INT",3,{mode:"flat",dc:20});t.runConfiguredRoll();
entry=t.state.history[0];const locked=Array.from(entry.d20s);assert.equal(t.state.trayPrompt.type,"rescue");
queueRolls(6);t.rescueWithBardic(entry.id,6);
assert.deepEqual(Array.from(entry.d20s),locked);assert.equal(entry.bardic.result,6);assert.equal(entry.total,14);assert.equal(t.state.currentEvent.kind,"bardic");acknowledgeAll();

// Accepting or defying a natural 1 keeps implications grouped and preserves the original die.
reset(3,[die("missing-d4",4,false)]);entry=natOne("accept");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"accept");
assert.equal(t.state.queueTotal,2,"Fate summary plus final result, not one popup per side effect");
assert.match(t.state.currentEvent.text,/FATE ACCEPTED.*Gained 1 Destiny Point.*Current 4.*Gained a Destiny d4/);acknowledgeAll();

reset(4);entry=natOne("defy");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};queueRolls(2,5);t.resolveNatOne(entry.id,"chaos");
assert.equal(entry.d20s[0],1);assert.equal(entry.kept,20);assert.equal(entry.transformed,true);assert.equal(t.state.destiny.points,0);
assert.equal(t.state.queueTotal,3,"Fate defied, major Chaos roll, then final result");
assert.match(t.state.currentEvent.text,/FATE DEFIED.*Destiny becomes 0/);t.acknowledgeEvent();assert.equal(t.state.currentEvent.kind,"chaos");assert.deepEqual(Array.from(t.state.currentEvent.chaosRoll),[2,5]);acknowledgeAll();

// A rescue Destiny die preserves the failed d20 and derives the Chaos save ability from history.
reset(2,[die("rescue-d8",8,true)]);entry={id:"rescue-entry",kind:"d20",name:"Arcana",ability:"INT",baseBonus:3,d20Mode:"flat",d20s:[5],kept:5,natural:5,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"20",note:"",createdAt:new Date().toISOString(),total:8,outcome:"Failure"};
t.state.history=[entry];t.state.rollSequence={phase:"rescue",entryId:entry.id};queueRolls(5);t.rescueWithDestiny(entry.id,"rescue-d8");
assert.deepEqual(Array.from(entry.d20s),[5]);assert.equal(entry.destiny.result,5);assert.equal(t.state.queueTotal,3);
assert.match(t.state.currentEvent.text,/Destiny d8 rolled 5.*Current 0/);assert.equal(t.state.destiny.overreach,3);t.acknowledgeEvent();assert.match(t.state.currentEvent.text,/INT save DC 13/);acknowledgeAll();

// Adding Destiny from history never rerolls the stored d20.
reset(4,[die("history-d4",4,true)]);entry={id:"history-entry",kind:"d20",name:"Hunting",ability:"WIS",baseBonus:4,d20Mode:"flat",d20s:[10],kept:10,natural:10,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"",note:"",createdAt:new Date().toISOString(),total:14,outcome:""};
t.state.history=[entry];t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",4,{mode:"flat"}),{editingId:entry.id,destinyDieId:"history-d4",destinyConfirmed:true});queueRolls(4);t.runConfiguredRoll();
assert.match(t.state.currentEvent.text,/ARCANE CRITICAL SUCCESS/);t.acknowledgeEvent();assert.deepEqual(Array.from(entry.d20s),[10]);assert.equal(entry.destiny.result,4);assert.equal(t.state.destiny.points,3);assert.equal(t.state.destiny.dice[0].available,false);acknowledgeAll();

// A serialized mid-Destiny transaction resumes exactly once after refresh.
reset(5,[die("resume",4,true)]);queueRolls(2,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",4,{mode:"flat"}),{destinyDieId:"resume",destinyConfirmed:true});t.runConfiguredRoll();
const pending=JSON.parse(JSON.stringify({rollSequence:t.state.rollSequence,eventQueue:t.state.eventQueue,currentEvent:t.state.currentEvent,queueDone:t.state.queueDone,queueTotal:t.state.queueTotal,destiny:t.state.destiny}));
Object.assign(t.state,pending);t.acknowledgeEvent();assert.equal(t.state.history.length,1);assert.deepEqual(Array.from(t.state.history[0].d20s),[12]);assert.equal(t.state.destiny.dice.find(item=>item.id==="resume").available,false,"refresh cannot spend the same Destiny die twice");acknowledgeAll();

assert.equal(randomBuckets.length,0,"every deterministic die result was consumed exactly once");
console.log("Roller state-machine tests passed.");
