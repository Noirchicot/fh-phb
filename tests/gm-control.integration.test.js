"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {parseHTML} = require("linkedom");

async function main() {
  const html=fs.readFileSync(path.join(__dirname,"..","docs","gm.html"),"utf8");
  const {window}=parseHTML(html);
  const {document}=window;
  const storage=new Map();
  const calls=[];
  Object.defineProperty(window,"location",{value:{href:"https://noirchicot.github.io/fh-phb/gm.html?campaign=FH1"},configurable:true});
  window.confirm=()=>true;

  async function fetchMock(url,options={}) {
    const parsed=new URL(url),method=options.method||"GET",body=options.body?JSON.parse(options.body):null;
    calls.push({path:parsed.pathname+parsed.search,method,body,headers:options.headers||{}});
    let status=200,data={};
    if(parsed.pathname==="/builds")data={builds:[{campaign:"FH1",pseudo:"Awki Test",updatedAt:"2026-07-21T01:00:00.000Z"}]};
    else if(parsed.pathname==="/admin/campaigns"&&method==="GET")data={campaigns:[{code:"FH1",name:"Tentacule",characters:1},{code:"FH2",name:"Second",characters:0}]};
    else if(parsed.pathname==="/admin/campaigns"&&method==="POST")data={campaign:body};
    else if(/\/characters\/import$/.test(parsed.pathname))data={pseudo:"Imported Hero"};
    else if(/\/characters\/[^/]+\/pull$/.test(parsed.pathname))data={ok:true};
    else if(method==="DELETE")data={ok:true};
    else if(/^\/inv\//.test(parsed.pathname))data={item:{name:body.name,qty:body.qty}};
    else {status=404;data={error:"not found"};}
    return {ok:status>=200&&status<300,status,json:async()=>data};
  }

  const source=fs.readFileSync(path.join(__dirname,"..","docs","javascripts","fh-gm.js"),"utf8");
  const sandbox={AbortController,Blob,URL,clearTimeout,console,document,fetch:fetchMock,setTimeout,window,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))}};
  sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox,{filename:"fh-gm.js"});
  document.dispatchEvent(new window.Event("DOMContentLoaded"));
  const gm=sandbox.__fhGm;

  assert.equal(document.getElementById("campaign").value,"FH1","the DM link can preselect a campaign");
  assert.equal(gm.canonicalDdbUrl("123456"),"https://www.dndbeyond.com/characters/123456");
  assert.equal(gm.canonicalDdbUrl("https://www.dndbeyond.com/characters/123456/shared"),"https://www.dndbeyond.com/characters/123456");
  assert.throws(()=>gm.canonicalDdbUrl("https://evil.example/characters/123456"),/public HTTPS/);

  document.getElementById("token").value="test-token";
  await gm.refreshGm();
  assert.match(document.getElementById("workerStatus").textContent,/connected/i,"a successful admin handshake is visible");
  assert.equal(document.querySelectorAll("#list tr").length,2,"the character list renders after authentication");
  const open=document.querySelector("[data-open-player]");
  assert.match(open.href,/campaign=FH1/);
  assert.match(open.href,/character=Awki(?:%20|\+)Test/,"Open sheet deep-links to the exact character");
  assert.ok(document.querySelector('[data-select-campaign="FH1"]').closest(".campaign-chip").classList.contains("is-selected"),"the active campaign is highlighted");

  document.getElementById("importCampaign").value="fh1";
  document.getElementById("importUrl").value="https://dndbeyond.com/characters/987654321/share-token";
  document.getElementById("importPseudo").value="Imported Hero";
  await gm.importCharacter();
  const imported=calls.find(call=>/\/characters\/import$/.test(call.path));
  assert.deepEqual(imported.body,{shareUrl:"https://www.dndbeyond.com/characters/987654321",pseudo:"Imported Hero"},"first import sends only a canonical DDB URL and optional pseudo");
  assert.match(document.getElementById("importNote").textContent,/Imported Hero imported/i);

  const syncButton=document.querySelector("[data-sync-player]");
  await gm.characterAction(syncButton);
  assert.ok(calls.some(call=>call.method==="POST"&&/\/admin\/campaigns\/FH1\/characters\/Awki%20Test\/pull$/.test(call.path)),"DM Sync uses the stored character link and encoded pseudo");

  document.getElementById("newCampaignCode").value="fh3";
  document.getElementById("newCampaignName").value="Third Campaign";
  await gm.createCampaign();
  assert.ok(calls.some(call=>call.method==="POST"&&call.path==="/admin/campaigns"&&call.body.code==="FH3"),"campaign creation canonicalizes the join code");

  document.getElementById("lootCode").value="FH1";
  document.getElementById("lootName").value="Soulgem";
  document.getElementById("lootQty").value="2";
  await gm.addLoot();
  assert.ok(calls.some(call=>call.method==="POST"&&call.path==="/inv/FH1"&&call.body.name==="Soulgem"),"DM loot still uses the campaign inventory endpoint");
  assert.ok(calls.filter(call=>call.path.startsWith("/admin/")).every(call=>call.headers.Authorization==="Bearer test-token"),"every admin request carries the GM bearer token");

  console.log("GM Control DOM integration tests passed.");
}

main().catch(error=>{console.error(error);process.exitCode=1;});
