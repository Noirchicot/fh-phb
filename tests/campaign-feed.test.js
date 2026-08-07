"use strict";
/* Package 11 — the shared campaign feed.
   What is worth testing here is not "does a POST happen" but the two things
   that were genuinely hard: WHEN a roll counts as settled (a natural 1 is not
   settled the moment it lands in history), and how a revision of a roll folds
   into a log that is append-only on the wire. */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const sourcePath=path.join(__dirname,"..","docs","javascripts","fh-player-sheet.js");
const source=fs.readFileSync(sourcePath,"utf8").replace(/\}\)\(\);\s*$/,`
  globalThis.__fhFeed={
    state,feedActive,intentOutcome,intentFor,feedSignature,broadcastEntry,feedMerge,
    feedRewind,feedTone,streamZoneInner,renderFeedEntry,startFeed,stopFeed,
    quickRoll,rollExport,clearDiceTray,rollOpen,rollTransactionActive,resolveNatOne
  };
})();
`);

let uuidCounter=0;
const randomBuckets=[];
const crypto={
  randomUUID:()=>`feed-${++uuidCounter}`,
  getRandomValues:array=>{if(!randomBuckets.length)throw new Error("Deterministic roll queue exhausted");array[0]=randomBuckets.shift();return array;}
};
function queueRolls(...results){randomBuckets.push(...results.map(result=>Number(result)-1));}

// Every request the dock makes, captured. The feed is the only thing under
// test, so anything else simply succeeds.
const posts=[];
let failNextPost=false;
const sandbox={URL,clearTimeout,console,crypto,setTimeout,
  window:{crypto,setTimeout,clearTimeout,history:null,location:{href:"https://example.test/player/"}},
  fetch:async(url,options)=>{
    if(options&&options.method==="POST"&&String(url).includes("/feed/")){
      posts.push({url:String(url),body:JSON.parse(options.body)});
      if(failNextPost)return {ok:false,status:500,json:async()=>({error:"down"})};
    }
    return {ok:true,status:200,json:async()=>({profile:{}})};
  },
  localStorage:{getItem:()=>null,setItem:()=>{}},
  document:{addEventListener(){}}};
sandbox.globalThis=sandbox;
const chaosPath=path.join(__dirname,"..","docs","javascripts","chaos-tables.js");
vm.runInNewContext(fs.readFileSync(chaosPath,"utf8"),sandbox,{filename:chaosPath});
/* fh-utils.js et fh-dice-visual.js sont chargés avant le dock par mkdocs.yml
   (extraction du 2026-08-07) ; le bac à sable doit faire pareil. */
["fh-utils.js", "fh-dice-visual.js"].forEach(function (f) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "docs", "javascripts", f), "utf8"), sandbox, {filename: f});
});
vm.runInNewContext(source,sandbox,{filename:sourcePath});
const t=sandbox.__fhFeed;

const flush=()=>new Promise(resolve=>setImmediate(resolve));
function reset(){
  randomBuckets.length=0;posts.length=0;failNextPost=false;
  Object.assign(t.state,{
    code:"FH1",pseudo:"Sol",destiny:{score:8,points:5,dice:[],lastChange:null,pending:[]},
    history:[],events:[],prefs:{bardicSides:6},rollConfig:null,trayPrompt:null,diePrompt:null,
    destinyStaged:null,trayColours:{},callUntil:0,traySelection:[20],trayResults:[],
    trayTitle:"Dice Tray",trayResultText:"",queueDone:"",rollSequence:null,message:"",messageKind:"",
    pendingArmed:null,streamView:"mine",
    vitals:{current:null,max:null,exhaustion:0,shortRestUsed:false},
    profile:{characterId:123456789},
    character:{name:"Yedrivel",destinyBuild:{arcana:{name:"The Hermit"}},build:{}},
    feed:{events:[],seen:{},sent:{},cursor:"",status:"",timer:null,lastEventAt:0}
  });
}
const entry=(over={})=>Object.assign({
  id:"e1",kind:"d20",name:"Hunting",ability:"WIS",baseBonus:5,total:27,natural:12,
  dc:"",outcome:"",adjusted:false,natChoice:null,destiny:null,bonusDice:[],createdAt:new Date().toISOString()
},over);

// ── the semantic layer ───────────────────────────────────────────────
// display says "Natural 20"; a machine needs a verdict it can act on.
reset();
assert.equal(t.intentOutcome(entry({natural:20})),"critical-success");
assert.equal(t.intentOutcome(entry({natural:1,natChoice:"accept"})),"critical-failure");
assert.equal(t.intentOutcome(entry({natural:1,natChoice:"chaos"})),"critical-success");
assert.equal(t.intentOutcome(entry({total:27,dc:15})),"success");
assert.equal(t.intentOutcome(entry({total:9,dc:15})),"failure");
assert.equal(t.intentOutcome(entry({destiny:{criticalFailure:true}})),"critical-failure");
// The two honest nulls: an unanswered natural 1 has no verdict yet, and a roll
// with no DC has no stated one. Guessing either would put a lie on the table.
assert.equal(t.intentOutcome(entry({natural:1,natChoice:null})),null,"an unresolved natural 1 has no outcome");
assert.equal(t.intentOutcome(entry({natural:12,dc:""})),null,"no DC means no stated verdict");

const intent=t.intentFor(entry({dc:15}));
assert.equal(intent.kind,"check");
assert.equal(intent.check,"Hunting");
assert.equal(intent.ability,"WIS");
assert.equal(intent.dc,15);
assert.equal(intent.total,27);
assert.equal(t.intentFor(entry({kind:"tray"})),null,"only a d20 check produces a check intent");

// ── revisions ────────────────────────────────────────────────────────
// The signature is what decides whether the table needs telling again, so it
// must move when the visible result moves and hold still otherwise.
reset();
assert.equal(t.feedSignature(entry()),t.feedSignature(entry()),"an unchanged entry has a stable signature");
assert.notEqual(t.feedSignature(entry()),t.feedSignature(entry({total:31})),"a new total is a new signature");
assert.notEqual(t.feedSignature(entry()),t.feedSignature(entry({natChoice:"chaos"})),"defying fate is a new signature");

reset();
t.broadcastEntry(entry());
assert.equal(posts.length,1,"a settled roll reaches the feed");
assert.equal(posts[0].body.rev,0);
assert.equal(posts[0].body.rollId,"e1");
assert.equal(posts[0].body.actor.character,"Yedrivel");
assert.equal(posts[0].body.actor.ddbCharacterId,123456789);
assert.equal(posts[0].body.display.schema,"fh-roll/1","the display layer is exported unchanged");
assert.equal(posts[0].body.intent.kind,"check");
t.broadcastEntry(entry());
assert.equal(posts.length,1,"broadcasting an unchanged entry again costs nothing");
t.broadcastEntry(entry({total:31}));
assert.equal(posts.length,2,"a changed entry is re-announced");
assert.equal(posts[1].body.rev,1,"as a revision of the same roll");
assert.equal(posts[1].body.rollId,"e1");

// ── settlement ───────────────────────────────────────────────────────
// This is the finding that shaped the hook: a natural 1 is in history but the
// player has not chosen yet, and defying turns it into a 20. Announcing at
// addHistory would show the table a critical failure that silently reverses.
reset();queueRolls(1);
t.quickRoll("Arcana","INT",3,"");
assert.equal(t.rollTransactionActive(),true,"a natural 1 still holds the roll");
assert.equal(posts.length,0,"an unresolved natural 1 must not reach the table");
const pending=t.state.history[0];
t.resolveNatOne(pending.id,"chaos");
assert.equal(posts.length,1,"the table hears about it once the player has answered");
assert.equal(posts[0].body.display.total,23,"and hears the 20, not the 1");
assert.equal(posts[0].body.intent.outcome,"critical-success");

reset();queueRolls(12);
t.quickRoll("Hunting","WIS",5,"");
assert.equal(posts.length,1,"an ordinary roll settles immediately");
assert.equal(posts[0].body.display.total,17);
assert.equal(t.state.feed.sent[t.state.history[0].id].rev,0);

// A dock with no campaign loaded has nowhere to post and must not try.
reset();t.state.code="";t.state.pseudo="";
t.broadcastEntry(entry());
assert.equal(posts.length,0,"no campaign, no feed");

// ── merging what comes back ──────────────────────────────────────────
reset();
const incoming=(over={})=>Object.assign({
  id:"i1",rollId:"r1",rev:0,ts:new Date().toISOString(),type:"roll",
  actor:{pseudo:"Mara",character:"Brakka"},display:{schema:"fh-roll/1",title:"Athletics",total:14,parts:[],badges:[]}
},over);
assert.equal(t.feedMerge([incoming()]),true);
assert.equal(t.state.feed.events.length,1);
assert.equal(t.feedMerge([incoming()]),false,"the same event id is never added twice");
assert.equal(t.state.feed.events.length,1);
// The lookback re-reads a few seconds on every poll, so this is the common case.
assert.equal(t.feedMerge([incoming({id:"i2",rev:1,display:{schema:"fh-roll/1",title:"Athletics",total:19,parts:[],badges:[]}})]),true);
assert.equal(t.state.feed.events.length,1,"a revision replaces its roll rather than adding a line");
assert.equal(t.state.feed.events[0].display.total,19);
t.feedMerge([incoming({id:"i3",rev:0,display:{schema:"fh-roll/1",title:"Athletics",total:14,parts:[],badges:[]}})]);
assert.equal(t.state.feed.events[0].display.total,19,"an out-of-order older revision does not win");
t.feedMerge([incoming({id:"i4",rollId:"r2",display:{schema:"fh-roll/1",title:"Stealth",total:8,parts:[],badges:[]}})]);
assert.equal(t.state.feed.events.length,2,"a different roll is a different line");
assert.equal(t.state.feed.events[0].display.title,"Stealth","newest first");

// ── the cursor ───────────────────────────────────────────────────────
// Edge clocks disagree, so the cursor deliberately walks backwards.
const rewound=t.feedRewind("1753845851234-ab3f",5000);
assert.equal(rewound,"1753845846234-0000");
assert.equal(rewound.split("-")[0].length,13,"the rewound cursor is still 13 digits and still sorts");
assert.ok(rewound<"1753845851234-ab3f","rewinding moves the cursor back, never forward");
assert.equal(t.feedRewind("not-a-cursor",5000),"not-a-cursor","a cursor we cannot parse is left alone");

// ── the zone ─────────────────────────────────────────────────────────
reset();
t.feedMerge([incoming(),incoming({id:"i9",rollId:"r9",actor:{pseudo:"Sol",character:"Yedrivel"}})]);
t.state.streamView="table";
let html=t.streamZoneInner();
assert.match(html,/TABLE/);
assert.match(html,/Brakka/,"another player's roll is listed");
assert.match(html,/is-mine/,"and this character's own line is marked as theirs");
assert.match(html,/data-stream-view="mine"/,"the toggle back to the personal stream is present");
t.state.streamView="mine";
assert.match(t.streamZoneInner(),/STREAM/);

// A feed that is not reaching the table has to say so on the control itself.
reset();t.state.streamView="table";
t.state.feed.status="offline";
html=t.streamZoneInner();
assert.match(html,/is-off/,"an offline feed is visible on the tab");
assert.match(html,/not reaching the table/);

(async()=>{
  // A failed POST must surface, not pass silently: the roll happened locally
  // and the player would otherwise believe the party saw it.
  reset();failNextPost=true;
  t.broadcastEntry(entry());
  await flush();await flush();
  assert.equal(t.state.feed.status,"offline","a rejected post marks the feed offline");

  reset();
  t.broadcastEntry(entry());
  await flush();await flush();
  assert.equal(t.state.feed.status,"","a successful post clears the warning");

  console.log("Campaign feed tests passed.");
})();
