"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto").webcrypto;
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("/tmp/fh-player-test/node_modules/linkedom");
const core = require("../docs/javascripts/fh-soulforge-core.js");

function inlineSource(html) {
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if(!scripts.length)throw new Error("inline script not found");
  return scripts[scripts.length-1][1];
}

function response(data,status=200) {
  return {ok:status>=200&&status<300,status,json:async()=>data};
}

function selectValue(select,value) {
  Array.from(select.querySelectorAll("option")).forEach(option=>{
    if(option.getAttribute("value")===String(value)||(!option.hasAttribute("value")&&option.textContent===String(value)))option.setAttribute("selected","");
    else option.removeAttribute("selected");
  });
}

function makeSandbox(html,fetchMock,url) {
  const {window}=parseHTML(html),{document}=window,storage=new Map();
  const location=new URL(url);
  window.SF_DATA={catalysts:[],ingredients:[]};
  window.FHSoulforgeCore=core;
  window.confirm=()=>true;
  window.prompt=()=>"Longsword";
  window.alert=message=>{throw new Error("Unexpected alert: "+message);};
  window.setTimeout=setTimeout;
  window.clearTimeout=clearTimeout;
  const sandbox={
    URL,URLSearchParams,clearTimeout,console,crypto,document,fetch:fetchMock,
    FHSoulforgeCore:core,location,Math,requestAnimationFrame:fn=>fn(),setTimeout,
    SF_DATA:window.SF_DATA,window,
    alert:window.alert,confirm:window.confirm,prompt:window.prompt,
    localStorage:{getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}
  };
  sandbox.globalThis=sandbox;
  return {sandbox,window,document};
}

async function inventoryPageTest() {
  const html=fs.readFileSync(path.join(__dirname,"..","docs","party-inventory.html"),"utf8");
  const calls=[];
  let items=[
    {id:"raw-1",name:"Dragon hide",kind:"raw",partType:"structure",stage:"raw",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:3},
    {id:"part-1",name:"Sword body",kind:"part",partType:"structure",stage:"body",baseItem:"Longsword",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:3},
    {id:"other-1",name:"Rope",kind:"other",subtype:"equipment",stage:"ready"}
  ];
  async function fetchMock(url,options={}) {
    const parsed=new URL(url),method=options.method||"GET",body=options.body?JSON.parse(options.body):null;
    calls.push({path:parsed.pathname,method,body});
    if(parsed.pathname==="/party/TEST")return response({builds:[{pseudo:"Forger"}]});
    if(parsed.pathname==="/inv/TEST"&&method==="GET")return response({schemaVersion:2,items});
    if(parsed.pathname==="/inv/TEST"&&method==="POST"){
      const item=Object.assign({id:"added-"+(items.length+1)},body);items=items.concat([item]);return response({ok:true,item});
    }
    return response({error:"not found"},404);
  }
  const {sandbox,document}=makeSandbox(html,fetchMock,"https://noirchicot.github.io/fh-phb/party-inventory.html");
  vm.runInNewContext(inlineSource(html),sandbox,{filename:"party-inventory.html"});
  document.getElementById("code").value="TEST";
  await sandbox.load();
  assert.match(document.getElementById("rawCount").textContent,/1 item/);
  assert.match(document.getElementById("partCount").textContent,/1 item/);
  assert.match(document.getElementById("otherCount").textContent,/1 item/);
  assert.match(document.getElementById("part").textContent,/Send to the Soulforge/);

  document.getElementById("showIngredient").onclick();
  const modal=document.querySelector(".modal-overlay");
  modal.querySelector("#aiCreature").value="Troll";
  selectValue(modal.querySelector("#aiRole"),"structure");
  selectValue(modal.querySelector("#aiType"),"Giant");
  selectValue(modal.querySelector("#aiCR"),"5");
  modal.querySelector("#aiName").value="Troll hide";
  await modal.querySelector("#aiAdd").onclick();
  const added=calls.find(call=>call.method==="POST"&&call.path==="/inv/TEST");
  assert.equal(added.body.kind,"raw");
  assert.equal(added.body.partType,"structure");
  assert.equal(added.body.pp,3);
  assert.match(document.getElementById("rawCount").textContent,/2 item/);
}

async function workshopPageTest() {
  const html=fs.readFileSync(path.join(__dirname,"..","docs","soulforge-tool.html"),"utf8");
  const calls=[];
  const body={id:"body-1",name:"Sword body",kind:"part",partType:"structure",stage:"body",baseItem:"Longsword",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:3};
  const soulgem={id:"gem-1",name:"Soulgem — Ruby",kind:"part",partType:"essence",stage:"soulgem",gemName:"Ruby",creature:"Fiend",creatureType:"Fiend",cr:"5",pp:3,valueGp:500};
  const catalyst={id:"cat-1",name:"Flame gland",kind:"part",partType:"catalyst",stage:"identified",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:2,power:{name:"Flame tongue",pp:2,uses:1,family:"Signature",text:"Burns"}};
  let items=[body,soulgem,catalyst];
  const record={pseudo:"Forger",build:{character:{abilityScores:{CHA:10}},meta:{level:5},nativeSkillTiers:{Soulforging:"proficient"},skills:[]}};
  const profile={manualOverrides:{level:9,pb:4,abilities:{CHA:16},tools:[{name:"Soulforging",tier:"expert"}],specialBonuses:{Soulforging:[{label:"Forge focus",value:2,active:true}]}}};
  async function fetchMock(url,options={}) {
    const parsed=new URL(url),method=options.method||"GET",payload=options.body?JSON.parse(options.body):null;
    calls.push({path:parsed.pathname,method,body:payload});
    if(parsed.pathname==="/party/TEST")return response({builds:[{pseudo:"Forger"}]});
    if(parsed.pathname==="/party/TEST/Forger")return response(record);
    if(parsed.pathname==="/profile/TEST/Forger")return response({profile});
    if(parsed.pathname==="/inv/TEST"&&method==="GET")return response({schemaVersion:2,items});
    if(parsed.pathname==="/inv/TEST/forge"&&method==="POST"){
      const result={id:"item-1",name:payload.name,owner:payload.owner,kind:"other",subtype:"soulforged",stage:"complete",soulforge:{
        baseItem:"Longsword",structure:{creature:"Dragon",ctype:"Dragon",cr:"5",pp:3},
        soulgems:[{id:"mounted-gem",gemName:"Ruby",value:500,creature:"Fiend",ctype:"Fiend",pp:3}],
        catalysts:[{id:"mounted-cat",name:"Flame tongue",creature:"Dragon",ctype:"Dragon",pp:2,uses:1,family:"Signature",text:"Burns"}],
        boons:[],flaws:[],supplyBonus:0,attunedTo:payload.owner,forgedBy:payload.forgedBy,history:[]
      }};
      items=[result];return response({ok:true,item:result,consumed:["body-1","gem-1","cat-1"]});
    }
    return response({error:"not found"},404);
  }
  const {sandbox,document}=makeSandbox(html,fetchMock,"https://noirchicot.github.io/fh-phb/soulforge-tool.html");
  vm.runInNewContext(inlineSource(html),sandbox,{filename:"soulforge-tool.html"});
  document.getElementById("campaignCode").value="TEST";
  await sandbox.loadCampaign();
  assert.match(document.getElementById("tab-workbench").textContent,/special \+2/);
  assert.match(document.getElementById("tab-workbench").textContent,/\+13/,
    "the active forger uses corrected CHA, PB, expertise and the named bonus");

  sandbox.selectWorkbenchPart("body-1");
  sandbox.selectWorkbenchPart("gem-1");
  sandbox.selectWorkbenchPart("cat-1");
  sandbox.renderForge();
  assert.equal(document.getElementById("fgBonus").value,"13");
  assert.ok(document.getElementById("fgOverride"),"the table can still override the calculated score by hand");
  assert.ok(document.getElementById("fgFixed"),"fixed modifiers remain available");
  assert.ok(document.getElementById("fgDie1"),"bonus dice remain available");

  const workshop=core.serverInventory([body,soulgem,catalyst]);
  const forged=await sandbox.commitForge({
    name:"Fang of Fire",owner:"Forger",forger:"Forger",char:{name:"Forger"},
    body:workshop.parts.find(x=>x.id==="body-1"),
    selGems:workshop.soulgems,
    selCats:workshop.parts.filter(x=>x.role==="Catalyst")
  });
  assert.equal(forged.name,"Fang of Fire");
  const forgeCall=calls.find(call=>call.path==="/inv/TEST/forge");
  assert.deepEqual(forgeCall.body.soulgemIds,["gem-1"]);
  assert.deepEqual(forgeCall.body.catalystIds,["cat-1"]);
  assert.equal(calls.filter(call=>call.path==="/inv/TEST/forge").length,1,"forging is one server transaction");
}

Promise.resolve()
  .then(inventoryPageTest)
  .then(workshopPageTest)
  .then(()=>console.log("Soulforge / Party Inventory DOM integration tests passed."))
  .catch(error=>{console.error(error);process.exitCode=1;});
