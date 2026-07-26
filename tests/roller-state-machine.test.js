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
    resolveNatOne,rollTransactionActive,entryTotal,outcomeFor,
    applyPhaseActive,stagedList,stageBonusDie,stageDestinyDie,applyStagedModifiers,finishApply,
    pendingFate,armPendingFate,rollPendingFate,renderDestiny
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
    rollConfig:null,trayPrompt:null,traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayResultText:"",currentEvent:null,eventQueue:[],queueDone:"",queueTotal:0,rollSequence:null,message:"",messageKind:"",pendingArmed:null,
    character:{destinyBuild:{arcana:{name:"The Hermit"}},build:{}}
  });
  t.state.destiny.pending=[];
}
function acknowledgeAll(limit=20){while(t.state.currentEvent&&limit--){t.acknowledgeEvent();}assert.ok(limit>0,"event queue must always terminate");}
/* A roll now ends on APPLY, not on a popup: closing one means acknowledging
   whatever still blocks, then applying. */
function settle(limit=20){acknowledgeAll(limit);if(t.applyPhaseActive())t.finishApply();}
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
// REWRITTEN (tranche 2): the result popup is gone. A landed roll stays open on APPLY.
assert.equal(t.state.currentEvent,null,"a landed roll no longer ends in a blocking result popup");
assert.equal(t.applyPhaseActive(),true,"it waits on APPLY instead, with every source of a new die still live");
assert.match(t.renderStageZone(),/data-apply-roll[^>]*>APPLY</,"the tray offers APPLY where it used to offer ROLL");
assert.equal(t.renderStageZone().includes("data-clear-tray disabled"),true,"Clear is disabled until the transaction finishes");
t.finishApply();
assert.equal(t.rollTransactionActive(),false);

// Advantage and disadvantage are committed to BEFORE the dice leave the hand,
// so they resolve themselves. Offering a choice on top of them was the old bug.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"advantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"advantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,18,"advantage keeps the higher die");assert.equal(entry.d20Choice,1);settle();
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"disadvantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"disadvantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,4,"disadvantage keeps the lower die");assert.equal(entry.d20Mode,"disadvantage");settle();

// A/D is the one mode that rolls two and lets the player pick afterwards.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"choice"});t.runConfiguredRoll();assert.equal(t.state.history.length,0,"A/D waits");assert.equal(t.state.trayPrompt.type,"die-choice");t.resolveDieChoice(0);entry=t.state.history[0];assert.equal(entry.kept,4,"A/D may deliberately take the lower result");assert.equal(entry.d20Mode,"choice");settle();

reset();queueRolls(10,2,7);t.state.rollConfig=t.rollInput("Tactics","INT",4,{mode:"flat"});t.state.rollConfig.bonusDice=[{id:"superiority",label:"Superiority",sides:8,advantageMode:"advantage",forcedResult:null}];t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"a bonus die on advantage resolves itself too");entry=t.state.history[0];assert.equal(entry.bonusDice[0].result,7);assert.deepEqual(Array.from(entry.bonusDice[0].rolls),[2,7]);assert.equal(entry.total,21);settle();

// A/D on a Destiny die is the Major Arcana case it exists for.
reset(5,[die("destiny-choice",4,true)]);queueRolls(2,4,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",3,{mode:"flat"}),{destinyDieId:"destiny-choice",destinyConfirmed:true,destinyMode:"choice"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt.target,"destiny","Destiny resolves its choice before any d20 exists");t.resolveDieChoice(0);assert.equal(t.state.currentEvent.kind,"destiny");t.acknowledgeEvent();entry=t.state.history[0];assert.equal(entry.destiny.result,2);assert.deepEqual(Array.from(entry.destiny.rolls),[2,4]);settle();

// Portent-style results never consume randomness and remain permanently marked manual.
reset();t.state.rollConfig=t.rollInput("Arcana","INT",5,{mode:"flat"});t.state.rollConfig.d20ForcedResult=17;t.state.rollConfig.bonusDice=[{id:"forced-d8",label:"Superiority",sides:8,advantageMode:"flat",forcedResult:6}];t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.kept,17);assert.equal(entry.d20Forced,true);assert.equal(entry.bonusDice[0].result,6);assert.equal(entry.bonusDice[0].forced,true);assert.equal(entry.total,28);settle();
reset();t.state.rollConfig=t.rollInput("Arcana","INT",0,{mode:"flat"});t.state.rollConfig.d20ForcedResult=10;t.state.rollConfig.bonusDice=[4,6,8,10].map((sides,index)=>({id:"cap-"+index,label:"Bonus "+index,sides,advantageMode:"flat",forcedResult:1}));t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.bonusDice.length,3,"structured checks enforce the three-bonus-die cap in the engine as well as the UI");settle();

// REWRITTEN (tranche 2): a failure no longer opens a one-shot rescue popup.
// The roll simply stays open, and any number of modifiers may be staged in turn.
reset();queueRolls(5);t.state.rollConfig=t.rollInput("Arcana","INT",3,{mode:"flat",dc:20});t.runConfiguredRoll();
entry=t.state.history[0];const locked=Array.from(entry.d20s);
assert.equal(t.state.trayPrompt,null,"a failed DC no longer stops the table with a rescue popup");
assert.equal(t.applyPhaseActive(),true,"the failed roll waits on APPLY with every die source still live");
t.stageBonusDie(6,"Bardic","bardic");
assert.equal(t.stagedList().length,1,"a die chosen after the roll is staged, not rolled on the spot");
assert.match(t.renderStageZone(),/APPLY<i class="fh-cd-applylong"> NEW MODIFIERS<\/i>/,"staging turns APPLY into APPLY NEW MODIFIERS");
assert.match(t.renderStageZone(),/fh-cd-applyct"> ×1</,"a phone-width dock falls back to a count");
queueRolls(6);t.applyStagedModifiers();
assert.deepEqual(Array.from(entry.d20s),locked,"applying a modifier never rerolls the d20");
assert.equal(entry.bardic.result,6);assert.equal(entry.total,14);
assert.equal(t.state.currentEvent,null,"a plain bonus die never blocks");
assert.equal(t.applyPhaseActive(),true,"the cycle reopens — a second modifier may still be added");
t.stageBonusDie(4,"Guidance","guidance");queueRolls(3);t.applyStagedModifiers();
assert.equal(entry.guidance.result,3,"the loop really is repeatable");
assert.equal(entry.total,17);settle();

// Accepting or defying a natural 1 keeps implications grouped and preserves the original die.
reset(3,[die("missing-d4",4,false)]);entry=natOne("accept");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"accept");
// REWRITTEN (tranche 2): the trailing result popup is gone, so the Fate summary stands alone.
assert.equal(t.state.queueTotal,1,"one popup for the whole Fate summary, and no result popup after it");
assert.match(t.state.currentEvent.text,/FATE ACCEPTED.*Gained 1 Destiny Point.*Current 4.*Gained a Destiny d4/);settle();

// REWRITTEN (tranche 3): defying a natural 1 no longer rolls Chaos on the spot.
reset(4);entry=natOne("defy");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"chaos");
assert.equal(entry.d20s[0],1);assert.equal(entry.kept,20);assert.equal(entry.transformed,true);assert.equal(t.state.destiny.points,0);
assert.equal(entry.chaosRoll,undefined,"the 2d6 are deferred, not rolled while the table waits");
assert.equal(t.state.queueTotal,2,"Fate defied, then the pending-Chaos notice");
assert.match(t.state.currentEvent.text,/FATE DEFIED.*Destiny becomes 0/);t.acknowledgeEvent();
assert.equal(t.state.currentEvent.kind,"chaos");assert.match(t.state.currentEvent.text,/CHAOS IS PENDING.*1 fatigue point per round/);
settle();
assert.equal(t.pendingFate().length,1,"the Chaos roll is carried, not lost");
assert.equal(t.rollTransactionActive(),false,"a pending Chaos never blocks the next roll");
assert.match(t.renderDestiny(t.state.character),/data-pending-open/,"a red button installs itself until it is faced");
t.armPendingFate(t.pendingFate()[0].id);
assert.equal(t.state.trayResults.length,2,"resolving arms 2d6 in the tray");
assert.equal(t.state.trayResults[0].special,"chaos","the Chaos dice carry their own red material");
assert.equal(t.state.trayResults[0].result,null,"they wait on ROLL — arming never rolls for the player");
queueRolls(2,5);t.rollPendingFate();
assert.deepEqual(Array.from(entry.chaosRoll),[2,5],"the deferred 2d6 land back on the entry that defied fate");
assert.equal(t.pendingFate().length,0,"resolving clears the marker");
settle();

// REWRITTEN (tranche 2/3): a Destiny die added to a landed roll is staged first,
// and the Overreach save it triggers is now carried instead of rolled at once.
reset(2,[die("rescue-d8",8,true)]);entry={id:"rescue-entry",kind:"d20",name:"Arcana",ability:"INT",baseBonus:3,d20Mode:"flat",d20s:[5],kept:5,natural:5,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"20",note:"",createdAt:new Date().toISOString(),total:8,outcome:"Failure"};
t.state.history=[entry];t.state.rollSequence={phase:"apply",entryId:entry.id,staged:[]};
t.stageDestinyDie("rescue-d8");
assert.equal(t.stagedList().length,1,"the pool die is staged by the click, not spent by it");
assert.equal(t.state.destiny.dice[0].available,true,"staging never spends the die");
queueRolls(5);t.applyStagedModifiers();
assert.deepEqual(Array.from(entry.d20s),[5]);assert.equal(entry.destiny.result,5);
assert.equal(t.state.queueTotal,2,"the spend summary and the Overreach notice — no result popup after them");
assert.match(t.state.currentEvent.text,/Destiny d8 rolled 5.*Current 0/);assert.equal(t.state.destiny.overreach,3);t.acknowledgeEvent();assert.match(t.state.currentEvent.text,/INT save DC 13/);
settle();
assert.equal(t.pendingFate().length,1,"the Overreach save is carried, not rolled mid-turn");
assert.equal(t.pendingFate()[0].dc,13,"the DC stays 10 + Overreach");
assert.equal(t.pendingFate()[0].kind,"overreach","Chaos and Overreach stay two separate mechanics");
// The Overreach envelope resolves as a save in the tray, not as 2d6 on the Chaos table.
t.state.character={destinyBuild:{arcana:{name:"The Hermit"}},build:{},abilities:{STR:10,DEX:10,CON:10,INT:16,WIS:10,CHA:10},savingProficiencies:["INT"],pb:3};
t.armPendingFate(t.pendingFate()[0].id);
assert.equal(t.state.trayResults.length,1,"an Overreach arms a single d20 save");
assert.equal(t.state.trayResults[0].sides,20);
assert.equal(t.state.trayResults[0].special,undefined,"and it is a plain save die, not a Chaos die");
queueRolls(11);t.rollPendingFate();
assert.equal(t.state.history[0].total,17,"the save adds the character's own INT save bonus");
assert.equal(t.state.history[0].outcome,"Success","17 clears DC 13");
assert.equal(t.pendingFate().length,0,"and the marker is cleared");
settle();

// Adding Destiny from history never rerolls the stored d20.
reset(4,[die("history-d4",4,true)]);entry={id:"history-entry",kind:"d20",name:"Hunting",ability:"WIS",baseBonus:4,d20Mode:"flat",d20s:[10],kept:10,natural:10,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"",note:"",createdAt:new Date().toISOString(),total:14,outcome:""};
t.state.history=[entry];t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",4,{mode:"flat"}),{editingId:entry.id,destinyDieId:"history-d4",destinyConfirmed:true});queueRolls(4);t.runConfiguredRoll();
assert.match(t.state.currentEvent.text,/ARCANE CRITICAL SUCCESS/);t.acknowledgeEvent();assert.deepEqual(Array.from(entry.d20s),[10]);assert.equal(entry.destiny.result,4);assert.equal(t.state.destiny.points,3);assert.equal(t.state.destiny.dice[0].available,false);settle();

// A serialized mid-Destiny transaction resumes exactly once after refresh.
reset(5,[die("resume",4,true)]);queueRolls(2,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",4,{mode:"flat"}),{destinyDieId:"resume",destinyConfirmed:true});t.runConfiguredRoll();
const pending=JSON.parse(JSON.stringify({rollSequence:t.state.rollSequence,eventQueue:t.state.eventQueue,currentEvent:t.state.currentEvent,queueDone:t.state.queueDone,queueTotal:t.state.queueTotal,destiny:t.state.destiny}));
Object.assign(t.state,pending);t.acknowledgeEvent();assert.equal(t.state.history.length,1);assert.deepEqual(Array.from(t.state.history[0].d20s),[12]);assert.equal(t.state.destiny.dice.find(item=>item.id==="resume").available,false,"refresh cannot spend the same Destiny die twice");settle();

assert.equal(randomBuckets.length,0,"every deterministic die result was consumed exactly once");
console.log("Roller state-machine tests passed.");
