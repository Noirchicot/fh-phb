"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sandbox = {window:{FH:{panels:[]}},console};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname,"..","docs","javascripts","fh-panel-spells.js"),"utf8"),
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
assert.match(html,/no spell or slot data/i,"the missing character-data source is explicit");
assert.equal(store.spells.length,0);

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
