"use strict";

const assert = require("node:assert/strict");
const core = require("../docs/javascripts/fh-soulforge-core.js");

assert.equal(core.isSoulforging("Tool - Soulforging"),true);
assert.equal(core.isSoulforging("Soulforge Tools"),true);
assert.equal(core.isSoulforging("Smith's Tools"),false);
assert.equal(core.tierName(4),"expert");
assert.equal(core.tierName("half proficiency"),"half");

const record={build:{
  character:{abilityScores:{CHA:10}},
  meta:{level:5},
  nativeSkillTiers:{Soulforging:"proficient"},
  skills:[]
}};
const profile={
  snapshot:{
    level:6,
    abilityScores:{CHA:12},
    tools:[{name:"Soulforging Tools",tier:"proficient"}],
    skillBonuses:[{name:"Soulforge",label:"Arcana boon",value:1}]
  },
  manualOverrides:{
    level:9,
    pb:4,
    abilities:{CHA:16},
    tools:[{name:"Soulforging",tier:"expert"}],
    specialBonuses:{Soulforging:[{label:"Arcana boon",value:2,active:true},{label:"Forge focus",value:1,active:true}]}
  }
};
const score=core.soulforgingScore(record,profile);
assert.deepEqual({level:score.level,cha:score.cha,pb:score.pb,tier:score.tierKey,base:score.baseBonus,special:score.special,bonus:score.bonus},
  {level:9,cha:16,pb:4,tier:"expert",base:11,special:3,bonus:14},
  "the workshop applies sheet corrections and named bonuses after build and DDB data");
assert.equal(score.specialBonuses.filter(x=>x.label==="Arcana boon").length,1,"a manual bonus replaces the synced bonus with the same label");

const deleted=core.soulforgingScore(record,{manualOverrides:{deletedTools:["Soulforge Tools"]}});
assert.equal(deleted.tierKey,"none","deleting Soulforging on the sheet removes its proficiency in the workshop");

const raw={id:"raw-1",name:"Dragon hide",kind:"raw",partType:"structure",stage:"raw",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:3};
const body={id:"body-1",name:"Sword body",kind:"part",partType:"structure",stage:"body",baseItem:"Longsword",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:3};
const soulgem={id:"gem-1",name:"Soulgem — Ruby",kind:"part",partType:"essence",stage:"soulgem",gemName:"Ruby",creature:"Fiend",creatureType:"Fiend",cr:"5",pp:3,valueGp:500};
const catalyst={id:"cat-1",name:"Flame gland",kind:"part",partType:"catalyst",stage:"identified",creature:"Dragon",creatureType:"Dragon",cr:"5",pp:2,power:{name:"Flame tongue",pp:2,uses:1}};
const equipment={id:"eq-1",name:"Rope",kind:"other",subtype:"equipment"};
const legacy={id:"legacy-1",name:"Potion"};
const groups=core.groupInventory([raw,body,equipment,legacy]);
assert.equal(groups.raw.length,1);
assert.equal(groups.part.length,1);
assert.equal(groups.other.length,2,"legacy inventory records remain visible as other equipment");

const workshop=core.serverInventory([raw,body,soulgem,catalyst,equipment]);
assert.equal(workshop.parts.length,3);
assert.equal(workshop.parts.find(x=>x.id==="body-1").crafted,true);
assert.equal(workshop.parts.find(x=>x.id==="cat-1").identified,true);
assert.equal(workshop.soulgems[0].gemName,"Ruby");
assert.equal(workshop.gems.length,0);

console.log("Soulforge core tests passed.");
