"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sourcePath=path.join(__dirname,"..","docs","javascripts","fh-player-sheet.js");
const source=fs.readFileSync(sourcePath,"utf8").replace(/\}\)\(\);\s*$/,`
  globalThis.__fhRollMachine={
    state,makeDestinySlots,setDestinyPoints,spendDestinyDie,destinyEventSpecs,naturalDestiny,
    rollInput,runConfiguredRoll,resolveDieChoice,announceEvents,renderEventContent,renderEventList,renderStageZone,
    resolveNatOne,resolveArcaneOne,arcaneDecision,rollTransactionActive,entryTotal,outcomeFor,
    rollOpen,stagedList,stageBonusDie,stageDestinyDie,stageDestinyFromPool,rollStagedDice,releaseRoll,clearDiceTray,
    pendingFate,addPendingFate,dropPendingFate,armPendingFate,rollPendingFate,renderDestiny,renderConsole,
    findStagedDie,mutateStagedDie,sealStagedDie,dropStagedDie,addTrayDie,rollTrayDice,standaloneDestiny,
    trayDiceForDisplay,setTrayFromEntry,visualDie,retuneLandedDie,sealLabel,
    exhaustionLevel,setExhaustion,chaosRowText,quickRoll,setVitals,MAX_EXHAUSTION
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
// The real generated table, not a stand-in: this is what proves the whole chain
// — vault markdown, the parser in sync_from_vault.py, and the dock reading a row.
const chaosPath=path.join(__dirname,"..","docs","javascripts","chaos-tables.js");
vm.runInNewContext(fs.readFileSync(chaosPath,"utf8"),sandbox,{filename:chaosPath});
vm.runInNewContext(source,sandbox,{filename:sourcePath});
const t=sandbox.__fhRollMachine;

function die(id,sides,available=true){return {id,sides,available};}
function reset(points=5,dice=[die("d4",4,true),die("d6",6,true),die("d8",8,true)]){
  randomBuckets.length=0;
  Object.assign(t.state,{
    code:"",pseudo:"",destiny:{score:8,points,dice:JSON.parse(JSON.stringify(dice)),lastChange:null},history:[],events:[],prefs:{bardicSides:6},
    rollConfig:null,trayPrompt:null,diePrompt:null,destinyStaged:null,trayColours:{},callUntil:0,traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayResultText:"",queueDone:"",rollSequence:null,message:"",messageKind:"",pendingArmed:null,
    vitals:{current:null,max:null,exhaustion:0,shortRestUsed:false},
    character:{destinyBuild:{arcana:{name:"The Hermit"}},build:{}}
  });
  t.state.destiny.pending=[];
}
/* REWRITTEN (dock v6): there is no acknowledgeAll any more. An announcement no
   longer waits on a click, so nothing is left to drain — the newest line is
   simply state.events[0]. Only a decision still holds the roll. */
function latest(){return t.state.events[0]||null;}
/* A roll no longer ends on a button at all: it lands in the stream and stays
   open. Closing one out means answering whatever still blocks, then clearing. */
function settle(){assert.equal(t.rollTransactionActive(),false,"nothing may still be blocking when a roll is settled");if(t.rollOpen())t.clearDiceTray(true);}
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
// REWRITTEN (dock v6): a 1 on a Destiny die is now an offer, not a verdict, so
// the line announces the roll only — the point it moved may still be undone by
// refusing, and a line must not claim what may be undone.
assert.match(specs[0].text,/^ARCANE CRITICAL FAILURE · Destiny d6 rolled 1$/);
const offer=t.arcaneDecision(spent,"entry");
assert.equal(offer.type,"arcane1","and the failure raises a decision instead");
assert.equal(offer.sides,6);

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

// REWRITTEN (dock v6): the Continue/Finish button is gone with the whole popup
// queue. Announcements stack as lines, newest first, and none of them blocks.
reset();t.state.rollSequence={phase:"destiny-events"};
t.announceEvents([{text:"Destiny summary · Lost 3 Destiny Points",kind:"destiny"},{text:"CHAOS RISK · pending",kind:"chaos"}],"");
assert.equal(t.state.events.length,2,"both announcements land at once — the second does not wait for the first");
assert.equal(latest().text,"CHAOS RISK · pending","newest first");
assert.doesNotMatch(t.renderEventList(),/data-event-ok|>Continue<|>Finish</,"an announcement carries no button at all");
assert.match(t.renderEventList(),/fh-cd-eline is-chaos is-current[^>]*><b>CHAOS RISK<\/b>/,"the newest line is the current one");
assert.match(t.renderEventList(),/fh-cd-eline is-destiny"[^>]*><b>Destiny summary<\/b>/,"and the one before it stays on screen, unhighlighted");
assert.equal(t.rollTransactionActive(),false,"announcing never holds the dock");

// Destiny still rolls first, but its consequences no longer gate the d20: the
// whole sequence resolves in one pass and simply narrates itself as it goes.
reset(5,[die("first",4,true)]);queueRolls(3,15,2,5);
t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",8,{mode:"flat",dc:18}),{guidance:true,bardic:true,bardicSides:6,destinyDieId:"first",destinyConfirmed:true});
t.runConfiguredRoll();
assert.equal(t.state.history.length,1,"REWRITTEN (dock v6): no click stands between Destiny and the d20 any more");
assert.ok(t.state.events.some(event=>/Destiny d4 rolled 3.*Lost 3 Destiny Points/.test(event.text)),"the Destiny summary is still announced, as a line");
entry=t.state.history[0];
assert.deepEqual(Array.from(entry.d20s),[15]);
assert.equal(entry.guidance.result,2);assert.equal(entry.bardic.result,5);
assert.equal(t.state.trayResults[0].label,"Destiny","Destiny remains first in the visible tray");
// REWRITTEN (dock v5): the result popup is gone and so is APPLY. A landed roll
// stays OPEN behind the one permanent ROLL, and it no longer locks the dock.
assert.equal(t.rollOpen(),true,"it stays open, with every source of a new die still reachable");
/* REWRITTEN (round 7): ROLL is now the d20 artwork, which carries the word on
   its own face. The button must still NAME itself ROLL -- via the image's alt,
   so a screen reader announces it and a failed image still paints the word. */
assert.match(t.renderStageZone(),/data-roll-now[^>]*>\s*<img[^>]*alt="ROLL"/,"there is one button, and it names itself ROLL");
assert.doesNotMatch(t.renderStageZone(),/APPLY/,"APPLY is gone from the dock entirely");
assert.equal(t.renderStageZone().includes("data-clear-tray disabled"),false,"an open roll no longer holds the dock hostage");
assert.equal(t.rollTransactionActive(),false,"only a question that must be answered locks the dock now");
// The event zone sits between the badges and the dice, and menus stay below them.
assert.ok(t.renderStageZone().indexOf("fh-cd-temps")<t.renderStageZone().indexOf("fh-cd-events"),"events come after the badge strip");
assert.ok(t.renderStageZone().indexOf("fh-cd-events")<t.renderStageZone().indexOf("fh-cd-frame"),"and before the dice");
t.clearDiceTray(true);
assert.equal(t.state.events.length,0,"CLEAR TRAY takes the running commentary with the hand");

// Advantage and disadvantage are committed to BEFORE the dice leave the hand,
// so they resolve themselves. Offering a choice on top of them was the old bug.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"advantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"advantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,18,"advantage keeps the higher die");assert.equal(entry.d20Choice,1);settle();
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"disadvantage"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"disadvantage never stops to ask");entry=t.state.history[0];assert.equal(entry.kept,4,"disadvantage keeps the lower die");assert.equal(entry.d20Mode,"disadvantage");settle();

// A/D is the one mode that rolls two and lets the player pick afterwards.
reset();queueRolls(4,18);t.state.rollConfig=t.rollInput("Vigilance","WIS",3,{mode:"choice"});t.runConfiguredRoll();assert.equal(t.state.history.length,0,"A/D waits");assert.equal(t.state.trayPrompt.type,"die-choice");t.resolveDieChoice(0);entry=t.state.history[0];assert.equal(entry.kept,4,"A/D may deliberately take the lower result");assert.equal(entry.d20Mode,"choice");settle();

reset();queueRolls(10,2,7);t.state.rollConfig=t.rollInput("Tactics","INT",4,{mode:"flat"});t.state.rollConfig.bonusDice=[{id:"superiority",label:"Superiority",sides:8,advantageMode:"advantage",forcedResult:null}];t.runConfiguredRoll();assert.equal(t.state.trayPrompt,null,"a bonus die on advantage resolves itself too");entry=t.state.history[0];assert.equal(entry.bonusDice[0].result,7);assert.deepEqual(Array.from(entry.bonusDice[0].rolls),[2,7]);assert.equal(entry.total,21);settle();

// A/D on a Destiny die is the Major Arcana case it exists for.
reset(5,[die("destiny-choice",4,true)]);queueRolls(2,4,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",3,{mode:"flat"}),{destinyDieId:"destiny-choice",destinyConfirmed:true,destinyMode:"choice"});t.runConfiguredRoll();assert.equal(t.state.trayPrompt.target,"destiny","Destiny resolves its choice before any d20 exists");t.resolveDieChoice(0);assert.equal(latest().kind,"destiny","REWRITTEN (dock v6): the Destiny summary is announced, not queued");entry=t.state.history[0];assert.equal(entry.destiny.result,2);assert.deepEqual(Array.from(entry.destiny.rolls),[2,4]);settle();

// Portent-style results never consume randomness and remain permanently marked manual.
reset();t.state.rollConfig=t.rollInput("Arcana","INT",5,{mode:"flat"});t.state.rollConfig.d20ForcedResult=17;t.state.rollConfig.bonusDice=[{id:"forced-d8",label:"Superiority",sides:8,advantageMode:"flat",forcedResult:6}];t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.kept,17);assert.equal(entry.d20Forced,true);assert.equal(entry.bonusDice[0].result,6);assert.equal(entry.bonusDice[0].forced,true);assert.equal(entry.total,28);settle();
reset();t.state.rollConfig=t.rollInput("Arcana","INT",0,{mode:"flat"});t.state.rollConfig.d20ForcedResult=10;t.state.rollConfig.bonusDice=[4,6,8,10].map((sides,index)=>({id:"cap-"+index,label:"Bonus "+index,sides,advantageMode:"flat",forcedResult:1}));t.runConfiguredRoll();entry=t.state.history[0];assert.equal(entry.bonusDice.length,3,"structured checks enforce the three-bonus-die cap in the engine as well as the UI");settle();

// REWRITTEN (tranche 2): a failure no longer opens a one-shot rescue popup.
// The roll simply stays open, and any number of modifiers may be staged in turn.
reset();queueRolls(5);t.state.rollConfig=t.rollInput("Arcana","INT",3,{mode:"flat",dc:20});t.runConfiguredRoll();
entry=t.state.history[0];const locked=Array.from(entry.d20s);
assert.equal(t.state.trayPrompt,null,"a failed DC no longer stops the table with a rescue popup");
assert.equal(t.rollOpen(),true,"the failed roll waits on APPLY with every die source still live");
t.stageBonusDie(6,"Bardic","bardic");
assert.equal(t.stagedList().length,1,"a die chosen after the roll is staged, not rolled on the spot");
// REWRITTEN (dock v5): the button never changes its name. Only the line under
// it says what pressing ROLL is about to do.
/* The point stands after round 7: what changes is the summary beside the die,
   never the die's own face -- the button does not rename itself to the action. */
assert.match(t.renderStageZone(),/alt="ROLL"[^>]*><small>1 new die<\/small>/,"ROLL announces the staged die beside itself instead of renaming itself");
queueRolls(6);t.rollStagedDice();
assert.deepEqual(Array.from(entry.d20s),locked,"applying a modifier never rerolls the d20");
assert.equal(entry.bardic.result,6);assert.equal(entry.total,14);
assert.equal(t.rollTransactionActive(),false,"REWRITTEN (dock v6): a plain bonus die never blocks — there is no popup left to be null");
assert.equal(t.rollOpen(),true,"the cycle reopens — a second modifier may still be added");
t.stageBonusDie(4,"Guidance","guidance");queueRolls(3);t.rollStagedDice();
assert.equal(entry.guidance.result,3,"the loop really is repeatable");
assert.equal(entry.total,17);settle();

// Accepting or defying a natural 1 keeps implications grouped and preserves the original die.
reset(3,[die("missing-d4",4,false)]);entry=natOne("accept");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"accept");
// REWRITTEN (tranche 2 · dock v6): the trailing result popup is gone, so the
// Fate summary stands alone — now as one line rather than one popup.
assert.equal(t.state.events.length,1,"one line for the whole Fate summary, and no result line after it");
assert.match(latest().text,/FATE ACCEPTED.*Gained 1 Destiny Point.*Current 4.*Gained a Destiny d4/);settle();

// REWRITTEN (tranche 3): defying a natural 1 no longer rolls Chaos on the spot.
reset(4);entry=natOne("defy");t.state.history=[entry];t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"chaos");
assert.equal(entry.d20s[0],1);assert.equal(entry.kept,20);assert.equal(entry.transformed,true);assert.equal(t.state.destiny.points,0);
assert.equal(entry.chaosRoll,undefined,"the 2d6 are deferred, not rolled while the table waits");
// REWRITTEN (dock v6): both lines land together instead of one popup at a time.
assert.equal(t.state.events.length,2,"Fate defied, then the pending-Chaos notice");
assert.match(t.state.events[1].text,/FATE DEFIED.*Destiny becomes 0/);
assert.equal(latest().kind,"chaos");assert.match(latest().text,/CHAOS IS PENDING.*1 fatigue point per round/);
settle();
assert.equal(t.pendingFate().length,1,"the Chaos roll is carried, not lost");
assert.equal(t.rollTransactionActive(),false,"a pending Chaos never blocks the next roll");
// REWRITTEN (dock v5): the red badge left the Destiny row for the transient
// strip above the tray, so the Major Arcana keeps its name.
assert.match(t.renderStageZone(),/data-pending-open/,"a red badge installs itself above the tray until it is faced");
assert.match(t.renderDestiny(t.state.character),/The Hermit/,"and the Destiny row keeps showing the Major Arcana");
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
t.state.history=[entry];t.state.rollSequence={phase:"open",entryId:entry.id,staged:[]};
t.stageDestinyDie("rescue-d8");
assert.equal(t.stagedList().length,1,"the pool die is staged by the click, not spent by it");
assert.equal(t.state.destiny.dice[0].available,true,"staging never spends the die");
queueRolls(5);t.rollStagedDice();
assert.deepEqual(Array.from(entry.d20s),[5]);assert.equal(entry.destiny.result,5);
// REWRITTEN (dock v6): two lines, not two popups — the staging notice is dropped
// the moment the die it described is spent, so only the outcomes remain.
assert.equal(t.state.events.length,2,"the spend summary and the Overreach notice — no result line after them");
assert.match(t.state.events[1].text,/Destiny d8 rolled 5.*Current 0/);assert.equal(t.state.destiny.overreach,3);assert.match(latest().text,/INT save DC 13/);
settle();
assert.equal(t.pendingFate().length,1,"the Overreach save is carried, not rolled mid-turn");
assert.equal(t.pendingFate()[0].dc,13,"the DC stays 10 + Overreach");
assert.equal(t.pendingFate()[0].kind,"overreach","Chaos and Overreach stay two separate mechanics");
// The badge strip is always offered, and what it carries outlives CLEAR TRAY.
assert.match(t.renderStageZone(),/data-pending-add/,"the strip always offers … to pin a badge of your own");
t.addPendingFate({kind:"note",label:"Concentration"});
assert.equal(t.pendingFate().length,2);
t.clearDiceTray(true);
assert.equal(t.pendingFate().length,2,"CLEAR TRAY empties the tray, never a debt or a pinned reminder");
assert.match(t.renderStageZone(),/fh-cd-pending is-note[^>]*>Concentration</,"a pinned badge reads its own name");
t.dropPendingFate(t.pendingFate().find(item=>item.kind==="note").id);
assert.equal(t.pendingFate().length,1,"cancelling a badge takes only that one");
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
assert.match(latest().text,/ARCANE CRITICAL SUCCESS/);assert.deepEqual(Array.from(entry.d20s),[10]);assert.equal(entry.destiny.result,4);assert.equal(t.state.destiny.points,3);assert.equal(t.state.destiny.dice[0].available,false);settle();

// A serialized mid-Destiny transaction resumes exactly once after refresh.
// REWRITTEN (dock v6): there is no queue to serialize, so what has to survive a
// refresh is the spent die itself — the sequence no longer waits on a click.
reset(5,[die("resume",4,true)]);queueRolls(2,12);t.state.rollConfig=Object.assign(t.rollInput("Hunting","WIS",4,{mode:"flat"}),{destinyDieId:"resume",destinyConfirmed:true});t.runConfiguredRoll();
const pending=JSON.parse(JSON.stringify({rollSequence:t.state.rollSequence,queueDone:t.state.queueDone,destiny:t.state.destiny,history:t.state.history,events:t.state.events}));
Object.assign(t.state,pending);
assert.equal(t.state.history.length,1);assert.deepEqual(Array.from(t.state.history[0].d20s),[12]);assert.equal(t.state.destiny.dice.find(item=>item.id==="resume").available,false,"refresh cannot spend the same Destiny die twice");settle();

/* ── Dock v6 · the four fixes ─────────────────────────────────────── */

// A seal renames the die every time, including on the way back to a plain bonus.
assert.equal(t.sealLabel("bardic"),"Bardic");
assert.equal(t.sealLabel("other-1"),"Bonus I");
assert.equal(t.sealLabel("other-3"),"Bonus III");
reset();t.state.rollSequence={phase:"open",entryId:"x",staged:[{id:"s1",kind:"bonus",label:"Bonus I",sides:6,sourceIcon:"other-1"}]};
t.state.history=[{id:"x",kind:"d20",name:"Arcana",baseBonus:0,d20s:[10],kept:10,natural:10,bonusDice:[],total:10,createdAt:new Date().toISOString()}];
t.state.diePrompt={stagedId:"s1"};
t.sealStagedDie("bardic");assert.equal(t.stagedList()[0].label,"Bardic");
t.sealStagedDie("other-1");assert.equal(t.stagedList()[0].label,"Bonus I","the label follows the seal back, instead of staying Bardic");
t.clearDiceTray(true);

// A Destiny die is picked up like a white one, in all three contexts, and put
// back the same way. Nothing is spent before ROLL.
reset(6,[die("pool-d6",6,true)]);
t.stageDestinyFromPool("pool-d6");
assert.equal(t.state.trayPrompt,null,"no popup stands between the pool and the tray any more");
assert.equal(t.state.destiny.dice[0].available,true,"the click spends nothing");
assert.equal(t.state.destinyStaged.dieId,"pool-d6","with nothing prepared it waits in the free tray");
assert.equal(t.trayDiceForDisplay()[0].flash,true,"and it blinks there until ROLL");
assert.match(latest().text,/Destiny d6 waits in the tray/,"a line says so");
t.state.diePrompt={poolId:"pool-d6"};
assert.equal(t.findStagedDie(t.state.diePrompt).scope,"pool-destiny","and a right click reaches it");
t.dropStagedDie();
assert.equal(t.state.destinyStaged,null,"cancelling takes the die back");
assert.equal(t.state.events.length,0,"and takes its line with it");
// ROLL is what spends it.
t.stageDestinyFromPool("pool-d6");queueRolls(4);t.rollTrayDice();
assert.equal(t.state.destiny.dice[0].available,false,"ROLL spends the die");
assert.equal(t.state.history[0].destiny.result,4);
settle();

// An Arcane Critical Failure is an offer. Accepting leaves the +1 point standing.
reset(3,[die("arc-d8",8,true)]);queueRolls(1);
t.state.rollConfig=Object.assign(t.rollInput("Arcana","INT",2,{mode:"flat"}),{destinyDieId:"arc-d8",destinyConfirmed:true});
t.runConfiguredRoll();
assert.equal(t.state.trayPrompt.type,"arcane1","a 1 on a Destiny die now asks before it decides");
assert.equal(t.rollTransactionActive(),true,"and it holds the roll while it asks");
assert.equal(t.state.history.length,0,"the d20 waits behind the question");
assert.match(t.renderEventList(),/data-arcane-fate="accept"[\s\S]*data-arcane-fate="chaos"/,"both answers are on the line");
queueRolls(12);t.resolveArcaneOne(t.state.trayPrompt.entryId,"accept");
entry=t.state.history[0];
assert.equal(entry.destiny.criticalFailure,true,"accepting leaves the failure standing");
assert.equal(t.state.destiny.points,4,"and keeps the point it granted");
assert.equal(entry.total,1+12+2,"the 1 still counts as 1");
settle();

// Refusing costs exactly what defying a natural 1 costs, and the 1 reads as the max face.
reset(3,[die("arc-d8b",8,true)]);queueRolls(1);
t.state.rollConfig=Object.assign(t.rollInput("Arcana","INT",2,{mode:"flat"}),{destinyDieId:"arc-d8b",destinyConfirmed:true});
t.runConfiguredRoll();
queueRolls(12);t.resolveArcaneOne(t.state.trayPrompt.entryId,"chaos");
entry=t.state.history[0];
assert.equal(entry.destiny.result,8,"the 1 becomes the die's highest face");
assert.equal(entry.destiny.criticalSuccess,true,"which makes it an Arcane Critical Success");
assert.equal(t.state.destiny.points,0,"paid for with every Destiny Point");
assert.equal(t.pendingFate()[0].kind,"chaos","and a 2d6 on the Chaos table, deferred like any other");
assert.equal(entry.total,8+12+2,"the total is recomputed from the face it now reads");
assert.equal(entry.outcome,"Critical success");
assert.equal(t.rollTransactionActive(),false,"answering releases the dock");
settle();

// Portent lands on a die that has already fallen: the entry is rewritten, not duplicated.
reset();queueRolls(9);t.state.rollConfig=t.rollInput("Arcana","INT",5,{mode:"flat",dc:20});t.runConfiguredRoll();
entry=t.state.history[0];const historyLength=t.state.history.length;
assert.equal(entry.total,14);assert.equal(entry.outcome,"Failure");
const fallen=t.state.trayResults.find(item=>item.landedKey==="d20");
assert.ok(fallen&&fallen.result===9,"the fallen d20 carries the key its menu answers to");
assert.match(t.visualDie(fallen,0,1,false),/data-die-landed="d20"/,"and the key reaches the DOM");
t.state.diePrompt={landedKey:"d20",entryId:entry.id};
const landedTarget=t.findStagedDie(t.state.diePrompt);
assert.equal(landedTarget.scope,"landed");
const landedMenu=t.renderEventContent();
assert.match(landedMenu,/data-die-portent/,"the menu offers a Portent");
assert.doesNotMatch(landedMenu,/data-die-seal/,"but no seal");
assert.doesNotMatch(landedMenu,/data-die-mode-set/,"and no A/D — the die has already fallen");
assert.doesNotMatch(landedMenu,/data-die-drop/,"and it cannot be taken out of its own roll");
t.retuneLandedDie(t.state.diePrompt,{forcedResult:18});
assert.equal(t.state.history.length,historyLength,"replacing a result never opens a second stream line");
assert.equal(entry.kept,18);assert.equal(entry.natural,18);assert.equal(entry.d20Forced,true,"and it is marked MANUAL");
assert.equal(entry.total,23);assert.equal(entry.outcome,"Success","the outcome is recomputed against the DC");
t.retuneLandedDie(t.state.diePrompt,{forcedResult:null});
assert.equal(entry.kept,9,"— as it fell — hands the roll back to the dice that rolled it");
assert.equal(entry.d20Forced,false);assert.equal(entry.total,14);
settle();

/* ── Exhaustion, and Chaos resolved for real ──────────────────────── */

// The Chaos tables are data, and the dock can read the exact row.
assert.equal(t.chaosRowText("INT",1).length>0,true,"row 1 exists");
assert.match(t.chaosRowText("STR",12),/fatal/i,"row 12 is the worst one");
assert.equal(t.chaosRowText("STR",99),t.chaosRowText("STR",12),"the table stops at 12 and the dice do not");
assert.equal(t.chaosRowText("STR",0),t.chaosRowText("STR",1),"and it starts at 1");
assert.equal(t.chaosRowText("XXX",5),"","an unknown ability degrades to nothing rather than throwing");

// A level of Exhaustion is a flat −1 that rides on every d20 test.
reset();t.setExhaustion(2,"Test");
assert.equal(t.exhaustionLevel(),2);
queueRolls(15);t.quickRoll("Arcana","INT",5);
entry=t.state.history[0];
assert.equal(entry.exhaustion,2,"the level is stamped on the entry as it rolls");
assert.equal(entry.total,15+5-2,"and comes straight off the total");
var token=t.state.trayResults.find(item=>item.kind==="modifier"&&item.label==="Exhaustion");
assert.ok(token,"a token sits beside the dice, like the FH +2 token");
assert.equal(token.result,-2,"carrying the malus itself");
assert.equal(token.tone,"exhaustion","in its own colour");
assert.match(t.visualDie(token,0,2,false),/−2/,"and it reads as a minus, not a stray hyphen");
// Changing the level afterwards must not rewrite a roll already in the stream.
t.setExhaustion(5,"Test");
assert.equal(entry.total,18,"a roll already filed keeps the level it rolled under");
settle();

// One level per short rest, once per long rest.
reset();t.setExhaustion(3,"Test");t.setVitals({shortRestUsed:false});
t.state.vitals.shortRestUsed=true;
assert.equal(t.exhaustionLevel(),3,"a spent short rest cannot clear a level");
t.setVitals({shortRestUsed:false});t.setExhaustion(t.exhaustionLevel()-1,"Short rest");
assert.equal(t.exhaustionLevel(),2,"a fresh one can");

// Refusing fate goes straight to 2d6 — no Overreach save on that path.
reset(4);entry=natOne("refuse-chaos");entry.ability="INT";t.state.history=[entry];
t.state.rollSequence={phase:"nat1",entryId:entry.id};t.resolveNatOne(entry.id,"chaos");
settle();
assert.equal(t.pendingFate()[0].ability,"INT","the marker remembers which table to read");
t.armPendingFate(t.pendingFate()[0].id);
assert.equal(t.state.trayResults.length,2,"2d6, not a save");
queueRolls(4,5);t.rollPendingFate();
var chaosEntry=t.state.history[0];
assert.equal(chaosEntry.total,9);
assert.equal(chaosEntry.chaosRow,t.chaosRowText("INT",9),"the row is quoted onto the entry");
assert.match(latest().text,/CHAOS RESOLVED · 2d6 = 4 \+ 5 = 9/,"and announced with the row");
assert.ok(latest().text.indexOf(t.chaosRowText("INT",9))>0,"the line carries the row text itself, not a link");
settle();

// Holding the Weave costs a level of Exhaustion.
reset(2,[die("hold-d8",8,true)]);
t.state.character={destinyBuild:{arcana:{name:"The Hermit"}},build:{},abilities:{STR:10,DEX:10,CON:10,INT:16,WIS:10,CHA:10},savingProficiencies:["INT"],pb:3};
t.addPendingFate({kind:"overreach",entryId:"x",ability:"INT",dc:13,overreach:3});
t.armPendingFate(t.pendingFate()[0].id);
queueRolls(11);t.rollPendingFate();
assert.equal(t.state.history[0].outcome,"Success","17 clears DC 13");
assert.equal(t.exhaustionLevel(),1,"a successful Overreach save costs one level of Exhaustion");
assert.match(latest().text,/EXHAUSTION 1/);
settle();

// Failing it rolls 1d6 + Overreach on the table, with a red token for the Overreach.
reset(2);
t.state.character={destinyBuild:{arcana:{name:"The Hermit"}},build:{},abilities:{STR:10,DEX:10,CON:10,INT:16,WIS:10,CHA:10},savingProficiencies:["INT"],pb:3};
t.addPendingFate({kind:"overreach",entryId:"y",ability:"INT",dc:18,overreach:8});
t.armPendingFate(t.pendingFate()[0].id);
queueRolls(2,5);t.rollPendingFate();
assert.equal(t.state.history[1].outcome,"Failure","7 misses DC 18");
assert.equal(t.exhaustionLevel(),0,"a failed save costs no Exhaustion — it costs the table");
var breakEntry=t.state.history[0];
assert.equal(breakEntry.dice[0].result,5,"the d6");
assert.equal(breakEntry.flatBonus,8,"plus the Overreach");
assert.equal(breakEntry.total,13,"read as 13");
assert.equal(breakEntry.chaosRow,t.chaosRowText("INT",13),"which reads row 12, the table's last");
var redToken=t.state.trayResults.find(item=>item.kind==="modifier");
assert.ok(redToken&&redToken.tone==="overreach","the Overreach sits beside the die as a red token");
assert.equal(redToken.result,8);
assert.match(latest().text,/CHAOS · d6 5 \+ Overreach 8 = 13/);
settle();

assert.equal(randomBuckets.length,0,"every deterministic die result was consumed exactly once");
console.log("Roller state-machine tests passed.");
