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
    SKILLS, tierName, makeDestinySlots, normalizeDestiny, entryTotal,
    skillInfo, renderSkills, state
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

const slots = t.makeDestinySlots(8, 8);
assert.deepEqual(Array.from(slots, die => die.sides), [4, 6, 8, 10, 12]);
assert.deepEqual(Array.from(slots, die => die.available), [true, true, true, true, false]);

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
assert.match(board, /Soulforging/);
assert.doesNotMatch(board, /Unbought/);

console.log("Player sheet unit tests passed.");
