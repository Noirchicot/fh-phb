"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto").webcrypto;
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sourcePath = path.join(__dirname, "..", "docs", "javascripts", "fh-player-sheet.js");
const source = fs.readFileSync(sourcePath, "utf8");
const instrumented = source.replace(/\}\)\(\);\s*$/, `
  globalThis.__fhPlayerSheetTest = {
    SKILLS, TOOLS, tierName, canonicalDdbUrl, canonicalToolName, knownToolName, importedTier,
    makeDestinySlots, normalizeDestiny, entryTotal, skillInfo, renderSkills, routeValue, rememberRoute,
    renderDestiny, renderStageZone, renderEventContent, resolveNatOne, renderStream, renderStreamEntry, rollExport,
    outcomeFor, effectiveCharacter, addTrayDie, state
  };
})();
`);

const storage = new Map();
let replacedRoute="";
const testWindow = {crypto,setTimeout,clearTimeout,location:{href:"https://noirchicot.github.io/fh-phb/player/?campaign=FH1&character=Awki%20Test"},history:{replaceState:(_state,_title,url)=>{replacedRoute=url;}}};
const sandbox = {
  URL,
  clearTimeout,
  console,
  crypto,
  fetch: () => Promise.reject(new Error("Network disabled in unit test")),
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  setTimeout,
  window: testWindow
};
sandbox.document = {addEventListener() {}};
sandbox.globalThis = sandbox;
vm.runInNewContext(instrumented, sandbox, {filename:sourcePath});

const t = sandbox.__fhPlayerSheetTest;
assert.equal(t.SKILLS.length, 26, "the complete Fate's Hand skill list is present");
assert.equal(new Set(t.SKILLS.map(skill => skill[0])).size, 26, "skill names are unique");
assert.equal(t.canonicalDdbUrl("123456"),"https://www.dndbeyond.com/characters/123456");
assert.throws(()=>t.canonicalDdbUrl("http://www.dndbeyond.com/characters/123456"),/HTTPS/);
assert.equal(t.routeValue("campaign"),"FH1","player deep links can prefill the campaign");
assert.equal(t.routeValue("character"),"Awki Test","player deep links can target a precise character");
t.state.code="FH1";t.state.pseudo="Awki Test";t.rememberRoute();
assert.match(replacedRoute,/campaign=FH1/);assert.match(replacedRoute,/character=Awki(?:%20|\+)Test/);
assert.equal(t.knownToolName("Cook’s Utensils"),"Tool - Cook's","curly apostrophes and DDB tool suffixes map to FH names");
assert.equal(t.knownToolName("Playing Card Set"),"Tool - Card Set","DDB gaming-set names map to the FH taxonomy");
assert.equal(t.knownToolName("Lute"),"Tool - Instrument (Strings)","specific DDB instruments map to an FH instrument category");
assert.equal(t.knownToolName("Imaginary Toolkit"),null,"unknown tools never become ad-hoc FH tools");
t.TOOLS.forEach(([name])=>assert.equal(t.knownToolName(name),"Tool - "+name,"every canonical FH tool resolves through the closed mapper"));

const slots = t.makeDestinySlots(8, 8);
assert.deepEqual(Array.from(slots, die => die.sides), [4, 6, 8, 10, 12]);
assert.deepEqual(Array.from(slots, die => die.available), [true, true, true, true, false]);

const capped = t.normalizeDestiny({score:20, points:20, dice:[
  {sides:4,available:true},{sides:4,available:true},{sides:4,available:true},{sides:4,available:true}
]}, {pb:2,destinyBuild:{score:8},build:{}});
assert.equal(capped.dice.length, 3, "Destiny pools cap each die size at ×3");

assert.equal(t.tierName(1), "none");
assert.equal(t.tierName(2), "half");
assert.equal(t.tierName(3), "proficient");
assert.equal(t.tierName(4), "expert");

assert.equal(t.entryTotal({kept:14, baseBonus:7, plusTwo:true, custom:-1, guidance:{result:3}, bardic:null, destiny:{result:5}}), 30);

const skills = {};
t.SKILLS.forEach(([name, ability]) => { skills[name] = {name, ability, tier:"none"}; });
skills.Arcana.tier = "proficient";
skills["Tool - Soulforging"] = {name:"Tool - Soulforging", ability:"CHA", tier:"proficient"};
skills["Tool - Unbought"] = {name:"Tool - Unbought", ability:"INT", tier:"none"};
const character = {
  pb:3,
  abilities:{STR:10,DEX:12,CON:14,INT:16,WIS:13,CHA:14},
  skills
};
assert.equal(t.skillInfo("Arcana", character).bonus, 6);
const board = t.renderSkills(character);
assert.equal((board.match(/class="fh-cd-srow/g) || []).length, 27, "26 skills plus one purchased tool are rendered");
assert.equal((board.match(/data-config-name=/g) || []).length, 27, "every check keeps its console gear");
assert.match(board, /fh-cd-tdiv/, "purchased tools sit under their own divider");
assert.doesNotMatch(board, /Skills [123]/, "numbered skill column labels are removed");
assert.match(board, /Soulforging/);
assert.doesNotMatch(board, /Unbought/);

t.state.destiny = {score:8,points:8,dice:t.makeDestinySlots(18,18)};
t.state.prefs={bardicSides:6};
t.state.history = [];
const destiny = t.renderDestiny({destinyBuild:{arcana:{name:"The Hermit"}}});
assert.equal((destiny.match(/class="fh-cd-poolwrap/g) || []).length, 5, "Destiny dice render as five compact size groups");
assert.match(destiny, /×2/, "duplicate Destiny dice use a compact multiplier");
assert.match(destiny, /data-destiny-die/, "an available Destiny die is clickable in the pool");
assert.match(destiny, /data-score-edit/, "the rarely changed Score is plain text you click to edit, with no lock");
assert.doesNotMatch(destiny, /data-destiny-lock/, "the padlock is gone with the Score input box");
assert.match(destiny, /fh-cd-dlab">POINTS</, "POINTS labels the left number");
assert.match(destiny, /fh-cd-dlab">SCORE</, "SCORE labels the right number");
assert.doesNotMatch(destiny, /fhPsLongRest/, "Rest moved out of Destiny into the vitals line");
assert.match(destiny, /fh-cd-arcana[^>]*>The Hermit</, "the Arcana name replaces the two-line caption");
assert.doesNotMatch(destiny, /fh-cd-cap/, "the Destiny caption line is gone");
t.state.destiny.points=10;
assert.match(t.renderDestiny({destinyBuild:{arcana:{name:"The Hermit"}}}),/fh-cd-overflow"[^>]*>\+2</,"points above the Score use a label-free visual overflow cue");
t.state.destiny.points=8;
assert.doesNotMatch(destiny, /TRAY/, "Destiny remains a compact horizontal strip");
assert.doesNotMatch(destiny, /Prepared magic/, "unused prepared magic is omitted");
assert.match(t.renderStageZone(), /fh-cd-tray/, "the roller carries its own tray bar");
assert.match(t.renderStageZone(), /data-add-tray-die="100"/, "the free tray exposes d4 through d100 calls");

t.state.record = {build:{
  character:{name:"Imported",abilityScores:{STR:9,DEX:9,CON:9,INT:9,WIS:9,CHA:9}},
  meta:{class:"Rogue",level:2,species:"Human"},nativeSkillTiers:{},skills:[],destiny:{}
}};
t.state.pseudo = "Imported";
t.state.profile = {
  snapshot:{data:{
    name:"Every Import",race:{fullName:"Tiefling"},classes:[{definition:{name:"Wizard"},level:6}],
    stats:[{id:4,value:18},{id:1,value:8},{id:2,value:14},{id:3,value:12},{id:5,value:13},{id:6,value:10}],
    armorClass:{value:17},skills:{arcana:{proficiencyLevel:1},Stealth:{expertise:true}},
    toolProficiencies:{"Thieves' Tools":true},
    modifiers:{background:[{type:"proficiency",friendlySubtypeName:"Smith's Tools"}]},
    savingThrowProficiencies:[],spells:[]
  }},
  manualOverrides:{armorClass:19,skills:{Arcana:"expert"},toolTiers:{"Tool - Soulforging":"proficient"}},
  levelUps:[],preparation:{tools:[]}
};
const imported = t.effectiveCharacter();
assert.equal(imported.name,"Every Import","wrapped DDB snapshots are accepted");
assert.equal(imported.level,6,"class level is recovered when a top-level level is absent");
assert.equal(imported.abilities.INT,18,"array-form DDB ability scores are normalized by stat id");
assert.equal(imported.armorClass,19,"manual AC correction remains authoritative after sync");
assert.equal(imported.skills.Arcana.tier,"expert","manual skill corrections override imported tiers");
assert.equal(imported.skills.Stealth.tier,"expert","object-map skill imports are normalized independent of order");
assert.equal(imported.skills["Tool - Thieves'"].tier,"proficient","tool aliases ending in Tools are canonicalized");
assert.equal(imported.skills["Tool - Smith's"].tier,"proficient","DDB proficiency modifiers can supply purchased tools");
assert.equal(imported.skills["Tool - Soulforging"].tier,"proficient","manual tool corrections survive every import");
const importedBoard=t.renderSkills(imported);
assert.ok(importedBoard.indexOf("Smith's")<importedBoard.indexOf("Soulforging")&&importedBoard.indexOf("Soulforging")<importedBoard.indexOf("Thieves'"),"purchased tools use canonical order, not import order");

t.state.profile = {
  snapshot:{data:{
    name:"Strict Import",level:4,classes:[{name:"Ranger",level:4}],
    abilityScores:{STR:12,DEX:16,CON:13,INT:10,WIS:15,CHA:8},
    skills:[
      {name:"Hunting",tier:"proficient"},
      {name:"Bogus Skill",tier:"expert"},
      {name:"Smith's Tools",tier:"proficient"},
      {name:"Stealth",tier:"proficient"},
      {name:"Insight",tier:"half"}
    ],
    customSkills:[
      {name:"Academic",tier:"half"},
      {name:"Appraisal",tier:"none"},
      {name:"Carpenter's Tool",tier:"half"}
    ],
    tools:[
      {name:"Cook’s Utensils",tier:"proficient"},
      {name:"Lute",tier:"proficient"},
      {name:"Herbalism Kit"},
      {name:"Imaginary Toolkit",tier:"proficient"},
      {name:"Carpenter's Tools",tier:"proficient"}
    ],
    toolProficiencies:[{name:"Thieves’ Tools"}],
    inventory:[{name:"Alchemist's Supplies"}],
    modifiers:{background:[
      {type:"proficiency",friendlySubtypeName:"Painter's Supplies"},
      {type:"bonus",friendlySubtypeName:"Poisoner's Kit"}
    ]},importReport:{unmappedTools:[{name:"Worker Mystery Kit",source:"Worker parser"}]},
    skillBonuses:[{name:"Arcana",label:"DDB bonus (WIS)",value:2}],spells:[]
  }},manualOverrides:{},levelUps:[],preparation:{tools:[]}
};
const strictImport=t.effectiveCharacter();
const strictKeys=Object.keys(strictImport.skills);
assert.equal(strictKeys.filter(name=>name.indexOf("Tool - ")!==0).length,26,"a pull can never create a 27th FH skill");
assert.equal(strictImport.skills.Hunting.tier,"proficient","known FH skills still import normally");
assert.equal(strictImport.skills["Tool - Smith's"].tier,"proficient","tools mixed into a proficiency list are recovered by name");
assert.equal(strictImport.skills["Tool - Cook's"].tier,"proficient","official DDB tool names translate to canonical FH names");
assert.equal(strictImport.skills["Tool - Instrument (Strings)"].tier,"proficient","specific instruments translate to their FH category");
assert.equal(strictImport.skills["Tool - Thieves'"].tier,"proficient","a named entry in an explicit tool-proficiency collection implies proficiency");
assert.equal(strictImport.skills["Tool - Painter's"].tier,"proficient","DDB proficiency modifiers remain a valid tool source");
assert.equal(strictImport.skills["Tool - Herbalism Kit"],undefined,"a tool without proficiency evidence is not imported");
assert.equal(strictImport.skills["Tool - Alchemist's"],undefined,"inventory equipment is never mistaken for a tool proficiency");
assert.equal(strictImport.skills["Tool - Poisoner's"],undefined,"non-proficiency modifiers do not purchase tools");
assert.equal(strictImport.skills["Tool - Imaginary Toolkit"],undefined,"unknown tools are ignored rather than displayed");
assert.equal(strictImport.skills["Bogus Skill"],undefined,"unknown skill names are ignored rather than displayed");
assert.ok(strictImport.importReport.unmappedSkills.some(item=>item.name==="Bogus Skill"),"ignored skills appear in the import report");
assert.ok(strictImport.importReport.unmappedTools.some(item=>item.name==="Imaginary Toolkit"),"ignored tools appear in the import report");
assert.ok(strictImport.importReport.unmappedTools.some(item=>item.name==="Worker Mystery Kit"),"a normalized Worker's import diagnostics survive into Edit mode");
assert.equal(strictImport.skills.Stealth.tier,"proficient","pencilled native proficiencies emitted by the Worker reach the sheet");
assert.equal(strictImport.skills.Insight.tier,"half","pencilled native half tiers reach the sheet");
assert.equal(strictImport.skills.Academics.tier,"half","the DDB custom name Academic maps to the FH skill Academics");
assert.equal(strictImport.skills["Tool - Carpenter's"].tier,"half","the FH custom tool tier overrides the native binary proficiency");
assert.equal(strictImport.specialBonuses.Arcana[0].value,2,"Worker skill bonuses become named special bonuses");
assert.equal(t.skillInfo("Arcana",strictImport).specialTotal,2,"synced special bonuses feed the displayed skill bonus");
t.state.profile.manualOverrides={specialBonuses:{Arcana:[{id:"m1",label:"DDB bonus (WIS)",value:3,active:true}]}};
const dedupedImport=t.effectiveCharacter();
assert.equal(dedupedImport.specialBonuses.Arcana.length,1,"a manual bonus with the same label replaces the synced one instead of duplicating");
assert.equal(dedupedImport.specialBonuses.Arcana[0].value,3,"the manual copy of a synced bonus wins");
t.state.profile.manualOverrides={};

t.state.traySelection=[];
[20,20,20,4,6,8,10].forEach(t.addTrayDie);
assert.equal(t.state.traySelection.length,7,"the free/damage tray accepts pools larger than a structured check");
assert.match(t.renderStageZone(),/width="34"/,"large pools shrink their dice to stay inside the frame");
assert.doesNotMatch(t.renderStageZone(),/width="52"/,"a crowded pool never keeps the full-size die");
t.state.traySelection=[];Array.from({length:8},()=>6).forEach(t.addTrayDie);
assert.equal(t.state.traySelection.length,8,"an 8d6 Fireball pool fits without a special case");

function natOneEntry(id) {
  return {id,kind:"d20",name:"Arcana",ability:"INT",baseBonus:3,d20Mode:"flat",d20s:[1],kept:1,natural:1,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"",createdAt:new Date().toISOString(),total:4,natChoice:null};
}
t.state.destiny = {score:8,points:5,dice:t.makeDestinySlots(8,5)};
let fate = natOneEntry("accept-fate");
t.state.history = [fate];
t.resolveNatOne(fate.id,"accept");
assert.equal(t.state.destiny.points,6,"accepting a natural 1 gains one Destiny Point");
assert.equal(t.outcomeFor(fate),"Critical failure · Fate accepted");

t.state.destiny.points=5;
fate=natOneEntry("defy-fate");
t.state.history=[fate];
t.resolveNatOne(fate.id,"chaos");
assert.equal(fate.kept,20,"refusing fate transforms the kept die into 20");
assert.equal(fate.total,23,"the transformed total is recalculated without rerolling bonuses");
assert.equal(fate.d20s[0],1,"the original natural 1 remains immutable in history");
assert.equal(t.state.destiny.points,0,"invoking Chaos drops Destiny to zero");
assert.equal(fate.chaosRoll.length,2,"invoking Chaos records two d6");

t.state.character={destinyBuild:{arcana:{name:"The Hermit"}}};
t.state.trayPrompt={type:"nat1",entryId:fate.id};
assert.match(t.renderEventContent(),/Do you accept your fate\?/,"the natural-1 choice is rendered in the animation zone");
t.state.trayPrompt={type:"chaos",entryId:fate.id};
assert.match(t.renderEventContent(),/Chaos has noticed/,"the Chaos result replaces the animation-zone content");
t.state.trayPrompt={type:"awakening",entryId:fate.id};
assert.match(t.renderEventContent(),/Arcane Awakening/,"Arcane Awakening is rendered inside the animation zone");

t.state.trayPrompt=null;
t.state.currentEvent=null;
assert.equal(t.renderEventContent(),"","with no prompt the roller frame stays clear for the dice");

t.state.code="FH1";
t.state.pseudo="Mar";
t.state.character={name:"Mar del Ran",destinyBuild:{arcana:{name:"The Hermit"}}};
t.state.history=[{id:"stream-1",kind:"d20",name:"Hunting",ability:"WIS",baseBonus:4,d20Mode:"advantage",d20s:[7,18],kept:18,natural:18,
  plusTwo:true,custom:1,bonusDice:[{id:"b1",label:"Guidance",sides:4,result:3}],destiny:null,dc:"15",total:26,outcome:"Success",
  createdAt:new Date().toISOString()}];
const stream=t.renderStream();
assert.match(stream,/Mar del Ran/,"every stream line names the character who rolled");
assert.match(stream,/d20 \(adv\)/,"the stream shows the roll mode");
assert.match(stream,/7 \/ 18 → 18/,"the stream shows both faces and the kept one");
assert.match(stream,/Guidance d4/,"bonus dice are itemised");
assert.match(stream,/FH/,"the fixed \+2 is itemised");
assert.match(stream,/Mod/,"the manual modifier is itemised");
assert.match(stream,/vs DC 15/,"the DC is carried on the line");
assert.match(stream,/data-history-id="stream-1"/,"a d20 line can be reopened");

const exported=t.rollExport(t.state.history[0]);
assert.equal(exported.schema,"fh-roll/1","stream lines expose a versioned export shape");
assert.equal(exported.character,"Mar del Ran","the export names the character for a later AboveVTT bridge");
assert.equal(exported.total,26);
assert.equal(exported.dc,15);
assert.ok(exported.parts.length>=5,"the export keeps every contributing part");

console.log("Player sheet unit tests passed.");
