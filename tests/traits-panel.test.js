"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("/tmp/fh-player-test/node_modules/linkedom");

const windowStub = {FH:{panels:[]}};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname,"..","docs","javascripts","fh-panel-traits.js"),"utf8"),
  {console,Date,Math,window:windowStub},
  {filename:"fh-panel-traits.js"}
);
const panel = windowStub.FH.panels.find(candidate=>candidate.id==="traits");
assert.ok(panel,"the Traits panel registers itself");

const store = {};
const notes = [];
let saves = 0;
let document;
const ctx = {
  character:{name:"Harness",classes:[{name:"Wizard",level:5}],spells:[]},
  esc(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);},
  store(id){assert.equal(id,"traits");return store;},
  save(){saves+=1;},
  note(text,kind){notes.push({text,kind});},
  refresh(){render();}
};

function render(){
  ({document} = parseHTML("<html><body><div data-panel-body=\"traits\">"+
    panel.render(ctx)+"</div></body></html>"));
}
function click(selector){
  const target=document.querySelector(selector);
  assert.ok(target,"expected "+selector);
  assert.equal(panel.onClick({target},ctx),true,"click is handled: "+selector);
}
function input(selector,value,hook="onInput"){
  const target=document.querySelector(selector);
  assert.ok(target,"expected "+selector);
  if(target.localName==="select"){
    Array.from(target.querySelectorAll("option")).forEach(option=>{
      if(option.getAttribute("value")===String(value))option.setAttribute("selected","");
      else option.removeAttribute("selected");
    });
  }else target.value=String(value);
  assert.equal(panel[hook]({target},ctx),true,hook+" is handled: "+selector);
}

render();
assert.match(document.body.textContent,/Manual tracker/,"the absent source is disclosed");
assert.match(document.body.textContent,/No traits tracked yet/,"manual V1 starts empty");

click("[data-trait-add]");
assert.equal(store.items.length,1,"Add creates one persisted item");
assert.equal(store.items[0].maxUses,1,"new trackers start with one use");
assert.ok(document.querySelector("[data-trait-field=name]"),"new entries open in edit mode");

input("[data-trait-field=name]","Arcane Recovery <unsafe>");
input("[data-trait-field=details]","Recover spell slots once per day.");
input("[data-trait-field=maxUses]",2);
input("[data-trait-field=recharge]","short","onChange");
assert.equal(store.items[0].remaining,2,"raising a full tracker raises its remaining uses");
assert.equal(store.items[0].recharge,"short","recharge cadence persists");
click("[data-trait-done]");
assert.match(document.body.innerHTML,/Arcane Recovery &lt;unsafe&gt;/,"manual text is escaped");

click("[data-trait-spend]");
assert.equal(store.items[0].remaining,1,"Use spends exactly one charge");
assert.match(notes.at(-1).text,/1\/2 left/,"spending is reported to the event stream");
click("[data-trait-spend]");
assert.equal(store.items[0].remaining,0,"a second click exhausts the tracker");
assert.equal(document.querySelector("[data-trait-spend]").disabled,true,"an exhausted tracker cannot overspend");
click("[data-trait-reset=short]");
assert.equal(store.items[0].remaining,2,"Short Rest restores short-rest resources");

store.items.push({id:"long-one",name:"Long feature",details:"",maxUses:3,remaining:0,recharge:"long"});
store.items.push({id:"daily-one",name:"Daily feature",details:"",maxUses:1,remaining:0,recharge:"day"});
render();
click("[data-trait-reset=long]");
assert.equal(store.items.find(item=>item.id==="long-one").remaining,3,"Long Rest restores long-rest resources");
assert.equal(store.items.find(item=>item.id==="daily-one").remaining,0,"Long Rest does not guess at daily recovery");
click("[data-trait-reset=day]");
assert.equal(store.items.find(item=>item.id==="daily-one").remaining,1,"Daily restores daily resources");

const firstId=store.items[0].id;
click('[data-trait-id="'+firstId+'"] [data-trait-edit]');
click('[data-trait-id="'+firstId+'"] [data-trait-delete]');
assert.equal(store.items.some(item=>item.id===firstId),false,"Delete removes only the selected trait");
assert.ok(saves>=10,"every mutation persists through the panel contract");

console.log("Traits panel: all tests passed");
