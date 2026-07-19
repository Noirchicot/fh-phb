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
    SKILLS, tierName, canonicalDdbUrl, makeDestinySlots, normalizeDestiny, entryTotal,
    skillInfo, renderSkills, renderDestiny, renderDiceTray, resolveNatOne,
    outcomeFor, state
  };
})();
`);

const storage = new Map();
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
  window: {crypto}
};
sandbox.document = {addEventListener() {}};
sandbox.globalThis = sandbox;
vm.runInNewContext(instrumented, sandbox, {filename:sourcePath});

const t = sandbox.__fhPlayerSheetTest;
assert.equal(t.SKILLS.length, 26, "the complete Fate's Hand skill list is present");
assert.equal(new Set(t.SKILLS.map(skill => skill[0])).size, 26, "skill names are unique");
assert.equal(t.canonicalDdbUrl("123456"),"https://www.dndbeyond.com/characters/123456");
assert.throws(()=>t.canonicalDdbUrl("http://www.dndbeyond.com/characters/123456"),/HTTPS/);

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
assert.equal((board.match(/class="fh-ps-skill-row/g) || []).length, 27, "26 skills plus one purchased tool are rendered");
assert.equal((board.match(/class="fh-ps-skill-col/g) || []).length, 4, "all checks remain in four parallel columns");
assert.doesNotMatch(board, /Skills [123]/, "numbered skill column labels are removed");
assert.match(board, /Soulforging/);
assert.doesNotMatch(board, /Unbought/);

t.state.destiny = {score:8,points:8,dice:t.makeDestinySlots(18,18)};
t.state.history = [];
const destiny = t.renderDestiny({destinyBuild:{arcana:{name:"The Hermit"}}});
assert.equal((destiny.match(/class="fh-ps-destiny-group/g) || []).length, 5, "Destiny dice render as five compact size groups");
assert.match(destiny, /×2/, "duplicate Destiny dice use a compact multiplier");
assert.match(destiny, /DICE TRAY/, "the dice tray replaces the prepared-magic card");
assert.doesNotMatch(destiny, /Prepared magic/, "unused prepared magic is omitted");

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
assert.match(t.renderDiceTray(),/Do you accept your fate\?/,"the natural-1 choice is rendered inside the dice tray");
t.state.trayPrompt={type:"chaos",entryId:fate.id};
assert.match(t.renderDiceTray(),/Chaos has noticed/,"the Chaos result replaces the dice-tray content");
t.state.trayPrompt={type:"awakening",entryId:fate.id};
assert.match(t.renderDiceTray(),/Arcane Awakening/,"Arcane Awakening is rendered inside the dice tray");

console.log("Player sheet unit tests passed.");
