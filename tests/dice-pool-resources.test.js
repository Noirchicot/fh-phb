"use strict";

/* Phase 4 (architecture lot, dock-dice-tray): the COUNTED Dice Pool.
   "Dice Pool ≠ Dice Selector" — a reserve of counted play resources on the
   band, noted like inspiration. What this suite pins down:
     - the model persists per character and survives a reload;
     - spending a SINGLE DIE stages a tinted/sealed die and the pastille
       disappears (consumed like an inspiration);
     - spending a COUNTER stages the die of its nature (Tactical → the
       crimson tactical seal, the same robe a hand-sealed die wears) and
       decrements ×2 → ×1;
     - a spend is CANCELLABLE: every take-back path (die menu drop, the
       white picker's right click, CLEAR TRAY) re-credits the resource;
     - ROLL makes the spend final — a rolled pool die never comes back,
       and a free hand kept for re-rolling sheds its pool dice;
     - past the measured room the strip folds into a +N chip; Destiny's
       ledger is never folded. */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sourcePath=path.join(__dirname,"..","docs","javascripts","fh-player-sheet.js");
const source=fs.readFileSync(sourcePath,"utf8").replace(/\}\)\(\);\s*$/,`
  globalThis.__fhPool={
    state,poolList,visiblePoolResources,normalizePoolResources,normalizePoolResource,
    spendPoolResource,recreditPoolResource,recreditPoolDie,prunePoolResources,
    newPoolDraft,savePoolCard,deletePoolResource,openPoolEdit,
    renderPoolStrip,renderPoolCard,renderDestiny,
    persistPlayState,loadPlayState,storageKey,
    clearDiceTray,dropStagedDie,unstageDie,removeTrayDie,
    rollTrayDice,rollStagedDice,stagedList,rollOpen,openEntry,quickRoll,
    entryBonusDice,trayDiceForDisplay,
    onPoolCardInput,syncPoolCardInputs,trayDiceFromEntry,
    _setRoot:function(value){root=value;}
  };
})();
`);

let uuidCounter=0;
const randomBuckets=[];
const crypto={
  randomUUID:()=>`pool-${++uuidCounter}`,
  getRandomValues:array=>{if(!randomBuckets.length)throw new Error("Deterministic roll queue exhausted");array[0]=randomBuckets.shift();return array;}
};
function queueRolls(...results){randomBuckets.push(...results.map(result=>Number(result)-1));}

const storage=new Map();
const sandbox={URL,clearTimeout,console,crypto,setTimeout,window:{crypto,setTimeout,clearTimeout,history:null,location:{href:"https://example.test/player/"}},
  fetch:async()=>({ok:true,status:200,json:async()=>({profile:{}})}),
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
  document:{addEventListener(){}}};
sandbox.globalThis=sandbox;
const chaosPath=path.join(__dirname,"..","docs","javascripts","chaos-tables.js");
vm.runInNewContext(fs.readFileSync(chaosPath,"utf8"),sandbox,{filename:chaosPath});
vm.runInNewContext(source,sandbox,{filename:sourcePath});
const t=sandbox.__fhPool;

function resource(spec){return t.normalizePoolResource(Object.assign({id:"res-"+(spec.label||"x")},spec));}
function reset(resources=[]){
  randomBuckets.length=0;
  Object.assign(t.state,{
    code:"FH1",pseudo:"Harness",
    destiny:{score:8,points:5,dice:[{id:"gold-d4",sides:4,available:true}],pending:[],overreach:0,lastChange:null},
    history:[],events:[],prefs:{bardicSides:6},
    rollConfig:null,trayPrompt:null,diePrompt:null,destinyStaged:null,callUntil:0,
    traySelection:[],trayResults:[],trayTitle:"Dice Tray",trayResultText:"",trayVerdict:"",queueDone:"",rollSequence:null,
    message:"",messageKind:"",pendingArmed:null,builderOpen:false,freePop:false,destinyPoolMenu:false,
    poolResources:resources.map(resource),poolPrompt:null,poolFit:4,
    vitals:{current:null,max:null,exhaustion:0,shortRestUsed:false},
    character:{destinyBuild:{arcana:{name:"The Hermit"}},build:{}}
  });
}
const bardic={label:"Bardic",kind:"die",sides:8,tint:"violet",count:1};
const tactical={label:"Tactical",kind:"count",sides:10,tint:"crimson",count:2};

// ── The model: normalized, persisted per character, restored on load ──
reset([bardic,tactical]);
assert.equal(t.poolList().length,2);
assert.deepEqual(Array.from(t.poolList().map(r=>r.count)),[1,2],"a single die is count 1, the counter keeps its N");
t.persistPlayState();
const saved=JSON.parse(storage.get(t.storageKey()));
assert.equal(saved.poolResources.length,2,"the pool persists with the rest of the local play state");
assert.equal(saved.poolResources[1].tint,"crimson");
t.state.poolResources=[];
t.loadPlayState(t.state.character);
assert.deepEqual(Array.from(t.poolList().map(r=>r.label)),["Bardic","Tactical"],"a reload restores the counted pool");
assert.ok(t.storageKey().indexOf("FH1")>=0&&t.storageKey().indexOf("Harness")>=0,"the key is per campaign AND per character — no leak between sheets");

// ── Spending a single die from REST: staged in the free hand, invoked ──
reset([bardic]);
t.spendPoolResource("res-Bardic");
assert.equal(t.state.traySelection.length,1,"the die waits in the free hand");
const freeDie=t.state.traySelection[0];
assert.equal(freeDie.sides,8);
assert.equal(freeDie.colour,"violet","the Bardic seal's tint dresses the staged die");
assert.equal(freeDie.label,"Bardic");
assert.equal(freeDie.poolResourceId,"res-Bardic");
assert.equal(t.state.builderOpen,true,"spending from rest invokes the assembly, like the ⊕ would");
assert.equal(t.poolList()[0].count,0,"the resource is spent the moment it is staged");
assert.equal(t.visiblePoolResources().length,0,"…so its pastille disappears from the band");
assert.equal(t.renderPoolStrip(),"","an emptied pool renders no strip at all");
assert.match(t.trayDiceForDisplay()[0].label,/Bardic/,"the hand names the die, not a bare d8");

// ── Cancelling before ROLL re-credits (white picker's take-back) ──
t.removeTrayDie(0);
assert.equal(t.poolList()[0].count,1,"taking the die back re-credits the resource");
assert.equal(t.visiblePoolResources().length,1,"…and the pastille returns");

// ── Cancelling via CLEAR TRAY re-credits too ──
t.spendPoolResource("res-Bardic");
assert.equal(t.poolList()[0].count,0);
t.clearDiceTray(true);
assert.equal(t.poolList()[0].count,1,"CLEAR TRAY hands every waiting pool die back");

// ── ROLL makes it final: the free hand sheds the pool die, the resource dies ──
t.spendPoolResource("res-Bardic");
queueRolls(5);
t.rollTrayDice();
assert.equal(t.state.history.length,1);
assert.equal(t.state.history[0].dice.length,1);
assert.equal(t.state.history[0].dice[0].result,5);
assert.equal(t.state.traySelection.some(d=>d.poolResourceId),false,"the kept hand sheds its pool dice — one use is one use");
assert.equal(t.poolList().length,0,"rolled and unreferenced, the spent resource is pruned for good");

// ── A counter during an OPEN roll: the Tactical seal, reproduced ──
reset([tactical]);
queueRolls(10);
t.quickRoll("Tactics","INT",4,"");
assert.equal(t.rollOpen(),true,"the check landed and stays open");
t.spendPoolResource("res-Tactical");
assert.equal(t.poolList()[0].count,1,"×2 → ×1 on the spot");
const staged=t.stagedList();
assert.equal(staged.length,1);
assert.equal(staged[0].sides,10);
assert.equal(staged[0].sourceIcon,"tactical","crimson stages the tactical seal — the warrior's die, as a hand-sealed one would");
assert.equal(staged[0].poolResourceId,"res-Tactical");
queueRolls(7);
t.rollStagedDice();
const entry=t.openEntry();
assert.equal(t.entryBonusDice(entry).length,1,"ROLL folds the pool die into the same entry");
assert.equal(t.entryBonusDice(entry)[0].result,7);
assert.equal(t.entryBonusDice(entry)[0].sourceIcon,"tactical");
assert.equal(t.poolList()[0].count,1,"the decrement stands — nothing double-charges at ROLL");
assert.equal(t.visiblePoolResources().length,1,"×1 remains on the band");

// ── Cancelling a staged spend mid-roll re-credits (die menu's Remove) ──
t.spendPoolResource("res-Tactical");
assert.equal(t.poolList()[0].count,0);
t.state.diePrompt={stagedId:t.stagedList()[0].id};
t.dropStagedDie();
assert.equal(t.poolList()[0].count,1,"Remove this die gives the use back");
// …and the white picker's right click (unstageDie) does the same.
t.spendPoolResource("res-Tactical");
assert.equal(t.poolList()[0].count,0);
assert.equal(t.unstageDie(10),true);
assert.equal(t.poolList()[0].count,1,"the picker's take-back re-credits too");
t.clearDiceTray(true);

// ── The identity card: rename, retint, resize, remove ──
reset([tactical]);
t.openPoolEdit("res-Tactical");
assert.equal(t.state.poolPrompt.type,"edit");
const card=t.renderPoolCard();
assert.match(card,/fhPsPoolLabel/,"the card renames");
assert.match(card,/data-pool-tint="crimson"/,"the robe row is offered");
assert.match(card,/data-pool-count-step/,"a counter adjusts its count");
assert.match(card,/data-pool-delete/,"and the resource can be removed");
t.state.poolPrompt.draft.label="Tact. Mind";
t.state.poolPrompt.draft.count=3;
t.savePoolCard();
assert.equal(t.poolList()[0].label,"Tact. Mind");
assert.equal(t.poolList()[0].count,3);
t.deletePoolResource("res-Tactical");
assert.equal(t.poolList().length,0,"deletion empties the pool");

// ── Adding by hand through the card ──
reset([]);
t.state.poolPrompt={type:"add",draft:Object.assign(t.newPoolDraft(),{label:"Guidance",kind:"die",sides:4,tint:"azure"})};
t.savePoolCard();
assert.equal(t.poolList().length,1);
assert.equal(t.poolList()[0].count,1,"a single die is born with one use");
assert.equal(t.poolList()[0].tint,"azure");

// ── The +N fold: past the measured room the excess folds; Destiny never does ──
reset([bardic,tactical,{label:"Luck",kind:"count",sides:6,tint:"green",count:3},
  {label:"Favor",kind:"die",sides:12,tint:"slate",count:1},{label:"Omen",kind:"die",sides:4,tint:"ash",count:1}]);
t.state.poolFit=4;
let strip=t.renderPoolStrip();
assert.equal((strip.match(/data-pool-spend/g)||[]).length,3,"room for 4: three pastilles show…");
assert.match(strip,/data-pool-list[^>]*>\+2</,"…and the last slot is the +2 chip");
t.state.poolFit=10;
strip=t.renderPoolStrip();
assert.equal((strip.match(/data-pool-spend/g)||[]).length,5,"with room for all five, nothing folds");
assert.doesNotMatch(strip,/data-pool-list/);
const band=t.renderDestiny(t.state.character);
assert.match(band,/fh-cd-bandledger/,"the Destiny ledger is on the band…");
assert.match(band,/fh-cd-poolres/,"…beside the pool strip");
t.state.destinyPoolMenu=true;
assert.match(t.renderDestiny(t.state.character),/data-pool-add/,"the Destiny menu carries the sober Add seat");
t.state.destinyPoolMenu=false;
t.state.poolPrompt={type:"list"};
const list=t.renderPoolCard();
assert.equal((list.match(/fh-cd-poolrow\b/g)||[]).length,5,"the list card names every resource");
assert.match(list,/data-pool-edit/);

// ── R31 (racine) : le label tapé survit à N'IMPORTE QUEL re-render ──
// Au banc d'Eric, un render() asynchrone (timer du reveal, pulse d'appel)
// reconstruisait la carte d'ajout pendant la frappe : le champ renaissait
// depuis un draft jamais synchronisé, la saisie était effacée en silence et
// « Add it » sauvait le défaut « Resource ». Chaque frappe pousse désormais
// le champ dans le draft (onPoolCardInput), donc la carte reconstruite
// renaît AVEC le texte tapé et la sauvegarde ne voit jamais un champ vide.
reset([]);
t.state.poolPrompt={type:"add",draft:t.newPoolDraft()};
const labelField={value:"Tact"};
t._setRoot({querySelector:sel=>sel==="#fhPsPoolLabel"?labelField:null});
t.onPoolCardInput({target:{id:"fhPsPoolLabel"}});
assert.equal(t.state.poolPrompt.draft.label,"Tact","chaque frappe atterrit dans le draft…");
labelField.value="Tactical";
t.onPoolCardInput({target:{id:"fhPsPoolLabel"}});
assert.equal(t.state.poolPrompt.draft.label,"Tactical");
assert.match(t.renderPoolCard(),/value="Tactical"/,
  "…et une carte reconstruite par un render minuté renaît avec le texte tapé");
// Un événement input étranger ne touche pas au draft.
t.onPoolCardInput({target:{id:"fhPsCustom"}});
assert.equal(t.state.poolPrompt.draft.label,"Tactical");
t._setRoot(null);
t.savePoolCard();
assert.equal(t.poolList()[0].label,"Tactical","Add it sauve le label tapé, jamais le défaut « Resource »");

// ── R31 : un dé du pool lancé en JET LIBRE garde son nom sur la ligne du tray ──
reset([bardic]);
t.spendPoolResource("res-Bardic");
queueRolls(6);
t.rollTrayDice();
const freeLine=t.trayDiceFromEntry(t.state.history[0]);
assert.equal(freeLine.length,1);
assert.equal(freeLine[0].label,"Bardic","la ligne du tray nomme le dé du pool, pas un « d8 » anonyme");
assert.equal(freeLine[0].result,6);
// Un dé libre ordinaire, lui, reste un « d20 » : rien ne change pour lui.
reset([]);
t.state.traySelection=[];
queueRolls(11);
t.rollTrayDice();
const plainLine=t.trayDiceFromEntry(t.state.history[0]);
assert.equal(plainLine[0].label,"d20","un dé libre sans nom garde son d20");

console.log("Dice Pool counted-resources tests passed.");
