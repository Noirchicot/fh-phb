"use strict";

const assert = require("node:assert/strict");
const {spawnSync} = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sandbox = {window:{FH:{panels:[]}},console};
const spellPanelSourcePath = path.join(__dirname,"..","docs","javascripts","fh-panel-spells.js");
vm.runInNewContext(
  fs.readFileSync(spellPanelSourcePath,"utf8"),
  sandbox,
  {filename:"fh-panel-spells.js"}
);
const panel = sandbox.window.FH.panels.find(candidate=>candidate.id==="spells");
assert.ok(panel,"the Spells panel registers itself");
assert.equal(panel.showsRoller,true,"spell attacks reuse the shared roller");

const store = {};
const calls = {save:0,refresh:0,notes:[],console:[]};
const ctx = {
  character:{name:"Harness"},
  esc:value=>String(value).replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[char]),
  store:id=>{assert.equal(id,"spells");return store;},
  save:()=>{calls.save+=1;},
  refresh:()=>{calls.refresh+=1;},
  note:(text,kind)=>calls.notes.push({text,kind}),
  openConsole:(...args)=>calls.console.push(args)
};

let html = panel.render(ctx);
assert.match(html,/MANUAL V1/);
assert.match(html,/No character spell catalogue/i,"a genuinely absent character catalogue is explicit");
assert.equal(store.spells.length,0);

function renderStore(value, character) {
  const localCtx={...ctx,character:character||{name:"Adversarial"},store:id=>{assert.equal(id,"spells");return value;}};
  return panel.render(localCtx);
}

const nullSpellStore={spells:[null],slots:null,nextId:null};
assert.doesNotThrow(()=>renderStore(nullSpellStore),"spells:[null] never blocks the panel");
assert.deepEqual(JSON.parse(JSON.stringify(nullSpellStore.spells)),[]);
assert.deepEqual(JSON.parse(JSON.stringify(nullSpellStore.slots)),{});
assert.equal(nullSpellStore.nextId,1);

const wrongTypeStore={spells:"not-an-array",slots:[],nextId:true};
assert.doesNotThrow(()=>renderStore(wrongTypeStore),"wrong top-level store types normalize to an empty V1 store");
assert.deepEqual(JSON.parse(JSON.stringify(wrongTypeStore)),{spells:[],slots:{},nextId:1,version:1});

const legacyStore={
  spells:[
    null,7,{},
    {id:"manual-4",name:" Legacy Spell ",level:"2",prepared:"yes",castType:"bogus",notes:42},
    {id:"manual-4",name:"Duplicate Id",level:99,prepared:true,castType:"none"}
  ],
  slots:{"0":{max:1},"1":{max:"4",used:"9"},"01":{max:2,used:0},"2":null,"3":{max:"many"},"4":{max:true},"9":{max:1,used:-3},"10":{max:1},bad:{max:1}},
  nextId:"2"
};
const legacyHtml=renderStore(legacyStore);
assert.match(legacyHtml,/Legacy Spell/);
assert.match(legacyHtml,/Duplicate Id/);
assert.equal(legacyStore.spells.length,2,"null, primitives and nameless legacy rows are discarded");
assert.equal(legacyStore.spells[0].name,"Legacy Spell");
assert.equal(legacyStore.spells[0].level,2,"numeric legacy levels are normalized");
assert.equal(legacyStore.spells[0].prepared,null,"bad preparation types are not guessed");
assert.equal(legacyStore.spells[0].castType,null,"bad cast types require configuration");
assert.equal(legacyStore.spells[0].notes,"","bad note types do not leak into markup");
assert.equal(legacyStore.spells[1].level,null,"out-of-range spell levels are not turned into a real level");
assert.equal(legacyStore.spells[1].id,"manual-5","duplicate legacy ids are replaced deterministically");
assert.equal(legacyStore.nextId,6,"nextId advances beyond every normalized manual id");
assert.deepEqual(JSON.parse(JSON.stringify(legacyStore.slots)),{"1":{max:4,used:4},"9":{max:1,used:0}},"only canonical slot levels 1–9 survive and usage is clamped");
assert.match(legacyHtml,/CAST DETAILS NEEDED/);

const hostileIdScript = [
  '"use strict";',
  'const fs=require("node:fs"),vm=require("node:vm");',
  'const sandbox={window:{FH:{panels:[]}},console};',
  'vm.runInNewContext(fs.readFileSync(' + JSON.stringify(spellPanelSourcePath) + ',"utf8"),sandbox);',
  'const panel=sandbox.window.FH.panels.find(candidate=>candidate.id==="spells");',
  'const store={spells:[',
  '  {id:"manual-9007199254740991",name:"Safe edge",level:1},',
  '  {id:"manual-9007199254740992",name:"Beyond edge",level:1},',
  '  {id:"manual-9007199254740991",name:"Duplicate edge",level:1}',
  '],slots:{},nextId:9007199254740992};',
  'panel.render({character:{},store:()=>store,esc:String});',
  'process.stdout.write(JSON.stringify({ids:store.spells.map(spell=>spell.id),nextId:store.nextId}));'
].join("\n");
const hostileIdRun = spawnSync(process.execPath,["-e",hostileIdScript],{
  encoding:"utf8",timeout:2000,killSignal:"SIGKILL"
});
assert.equal(hostileIdRun.error,undefined,
  "MAX_SAFE_INTEGER id recovery terminates inside the 2 second isolation deadline");
assert.equal(hostileIdRun.status,0,"isolated hostile-id normalization exits cleanly: "+hostileIdRun.stderr);
const hostileIdResult=JSON.parse(hostileIdRun.stdout);
assert.deepEqual(hostileIdResult,{
  ids:["manual-9007199254740991","manual-9007199254740992","manual-1"],nextId:2
},"unsafe edge ids and their duplicate recover deterministically without collisions");

const safeEdgeStore={spells:[
  {id:"manual-9007199254740990",name:"Near edge",level:1},
  {id:"manual-9007199254740990",name:"Near-edge duplicate",level:1}
],slots:{},nextId:Number.MAX_SAFE_INTEGER};
assert.doesNotThrow(()=>renderStore(safeEdgeStore),"a safe nextId at the numeric edge wraps without hanging");
assert.deepEqual(JSON.parse(JSON.stringify(safeEdgeStore.spells.map(spell=>spell.id))),
  ["manual-9007199254740990","manual-9007199254740991"]);
assert.equal(safeEdgeStore.nextId,1,"the allocator wraps to the first free safe integer after MAX_SAFE_INTEGER");

[9007199254740992,"9007199254740992",Infinity,-1,1.5,"corrupt"].forEach(value=>{
  const corruptNextIdStore={spells:[],slots:{},nextId:value};
  assert.doesNotThrow(()=>renderStore(corruptNextIdStore),"non-safe nextId never blocks normalization: "+String(value));
  assert.equal(corruptNextIdStore.nextId,1,"non-safe nextId resets to the first safe id: "+String(value));
});

const catalogueStore={spells:[],slots:{},nextId:1};
const catalogueHtml=renderStore(catalogueStore,{name:"Wizard",spells:[
  null,
  {name:" Fire Bolt ",level:0,prepared:true,damageDice:"3d10"},
  {name:"Blur",level:"2",attackBonus:99},
  {name:"Bad Level",level:null},
  {name:42,level:1}
]});
assert.match(catalogueHtml,/CHARACTER LIST/);
assert.match(catalogueHtml,/Fire Bolt/);
assert.match(catalogueHtml,/Blur/);
assert.match(catalogueHtml,/Preparation, slots and casting details are not provided/);
assert.doesNotMatch(catalogueHtml,/3d10|99/,"the catalogue imports only name and level");
assert.doesNotMatch(catalogueHtml,/Bad Level/);
assert.equal(catalogueStore.spells.length,0,"minimal character spells are rendered without fabricating stored cast data");

function input(value, checked) { return {value:String(value),checked:!!checked}; }
const fields = {
  name:input("Burning Hands"),level:input(1),prepared:input("",true),castType:input("save"),
  ability:input("DEX"),attackBonus:input(0),saveDc:input(15),saveEffect:input("half"),
  areaShape:input("cone"),areaSize:input(15),damageDice:input("3d6"),damageType:input("FIRE"),notes:input("V, S")
};
const body = {
  querySelector(selector) {
    const fieldMatch = selector.match(/data-spell-field=\"([^\"]+)/);
    if (fieldMatch) return fields[fieldMatch[1]];
    if (selector==="[data-spell-slot-level]") return input(1);
    if (selector==="[data-spell-slot-max]") return input(4);
    throw new Error("Unexpected selector "+selector);
  }
};
function click(dataset) {
  const button={dataset};
  return panel.onClick({target:{closest:selector=>selector==="button"?button:body}},ctx);
}

assert.equal(click({spellAction:"slot-set"}),true);
assert.deepEqual(JSON.parse(JSON.stringify(store.slots["1"])),{max:4,used:0});
assert.equal(click({spellAction:"add"}),true);
assert.equal(store.spells.length,1);
assert.equal(store.spells[0].damageType,"fire");

const spellId=store.spells[0].id;
assert.equal(click({spellAction:"cast",spellId}),true);
assert.equal(store.slots["1"].used,1,"casting expends exactly one matching slot");
assert.deepEqual(JSON.parse(JSON.stringify(store.lastCast.intent)),{
  kind:"spell",name:"Burning Hands",level:1,
  area:{shape:"cone",size:15,unit:"ft"},
  save:{ability:"DEX",dc:15,effect:"half"},
  damage:[{dice:"3d6",type:"fire"}]
},"the pending semantic intent matches the frozen spell vocabulary");
assert.equal(store.lastCast.delivery,"core-hook-missing","the panel never claims an unavailable feed delivery");
assert.match(calls.notes.at(-1).text,/LOCAL ONLY/);
assert.equal(calls.console.length,0,"a target save does not roll a fake player d20");

store.spells[0].castType="attack";
store.spells[0].ability="INT";
store.spells[0].attackBonus=7;
assert.equal(click({spellAction:"cast",spellId}),true);
assert.deepEqual(calls.console.at(-1),["Burning Hands","INT",7,"Spell attack",null],"spell attacks open the shared advanced console");

store.slots["1"].used=4;
const savesBefore=calls.save;
assert.equal(click({spellAction:"cast",spellId}),true);
assert.equal(calls.save,savesBefore,"an exhausted level cannot spend a fifth slot");
assert.match(calls.notes.at(-1).text,/cannot be cast/);

html=panel.render(ctx);
assert.match(html,/Burning Hands/);
assert.match(html,/Spell intent is saved/);
assert.doesNotMatch(html,/font-size:\s*\d+px/,"panel markup does not bypass the dock text scale");

console.log("panel-spells.test.js: all assertions passed");
