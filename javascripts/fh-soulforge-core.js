(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FHSoulforgeCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var TIER_VALUE = {none:0,half:.5,proficient:1,expert:2};

  function numberOr(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function proficiencyBonus(level) {
    return 2 + Math.floor((Math.max(1, numberOr(level, 1)) - 1) / 4);
  }

  function normalizedLabel(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[’‘`]/g, "'")
      .replace(/^\s*tool\s*[-:–—]\s*/i, "")
      .replace(/\s+tools?\s*$/i, "")
      .replace(/[^a-z0-9]+/gi, "")
      .toLowerCase();
  }

  function isSoulforging(value) {
    var label = normalizedLabel(value);
    return label === "soulforging" || label === "soulforge";
  }

  function tierName(value) {
    if (value == null || value === "") return "none";
    if (typeof value === "number" || /^\d+$/.test(String(value))) {
      return ({1:"none",2:"half",3:"proficient",4:"expert"})[Number(value)] || "none";
    }
    var text = String(value).trim().toLowerCase();
    if (text === "½" || text === "half" || text === "half-proficient" || text === "half proficiency") return "half";
    if (text === "prof" || text === "proficiency" || text === "proficient") return "proficient";
    if (text === "expertise" || text === "expert") return "expert";
    return "none";
  }

  function entries(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    return Object.keys(value).map(function (key) {
      var item = value[key];
      return item && typeof item === "object" ? Object.assign({name:key}, item) : {name:key,tier:item};
    });
  }

  function snapshotAbility(snapshot, key) {
    var abilities = snapshot && (snapshot.abilityScores || snapshot.abilities || snapshot.stats);
    if (abilities && !Array.isArray(abilities)) {
      var value = abilities[key];
      if (value == null) value = abilities[key.toLowerCase()];
      if (value && typeof value === "object") value = value.value != null ? value.value : value.score;
      if (isFinite(Number(value))) return Number(value);
    }
    if (Array.isArray(abilities)) {
      var order = ["STR","DEX","CON","INT","WIS","CHA"], index = order.indexOf(key), item = abilities[index];
      if (item && typeof item === "object") item = item.value != null ? item.value : item.score;
      if (isFinite(Number(item))) return Number(item);
    }
    return null;
  }

  function tierFromRecord(record) {
    var build = record && record.build || record || {}, tier = "none";
    Object.keys(build.nativeSkillTiers || {}).forEach(function (name) {
      if (isSoulforging(name)) tier = tierName(build.nativeSkillTiers[name]);
    });
    entries(build.skills).forEach(function (skill) {
      if (isSoulforging(skill && skill.name)) tier = tierName(skill.tier != null ? skill.tier : skill.proficiencyLevel);
    });
    return tier;
  }

  function tierFromSnapshot(snapshot, fallback) {
    var tier = fallback || "none";
    [snapshot && snapshot.skills,snapshot && snapshot.tools,snapshot && snapshot.toolProficiencies,
      snapshot && snapshot.proficiencies && snapshot.proficiencies.tools,snapshot && snapshot.customSkills]
      .forEach(function (source) {
        entries(source).forEach(function (item) {
          if (isSoulforging(item && item.name)) tier = tierName(item.tier != null ? item.tier : item.proficiencyLevel);
        });
      });
    return tier;
  }

  function tierFromOverrides(overrides, fallback) {
    var tier = fallback || "none", deleted = false;
    entries(overrides && overrides.tools).forEach(function (tool) {
      if (isSoulforging(tool && tool.name)) tier = tierName(tool.tier != null ? tool.tier : tool.proficiencyLevel);
    });
    Object.keys(overrides && overrides.toolTiers || {}).forEach(function (name) {
      if (isSoulforging(name)) tier = tierName(overrides.toolTiers[name]);
    });
    (overrides && overrides.deletedTools || []).forEach(function (name) {
      if (isSoulforging(name)) deleted = true;
    });
    return deleted ? "none" : tier;
  }

  function activeSpecialBonuses(snapshot, overrides) {
    var synced = entries(snapshot && snapshot.skillBonuses).filter(function (item) {
      return isSoulforging(item && item.name) && item.active !== false && isFinite(Number(item.value));
    }).map(function (item) {
      return {label:item.label || "DDB bonus",value:Number(item.value),synced:true};
    });
    var manual = [];
    Object.keys(overrides && overrides.specialBonuses || {}).forEach(function (name) {
      if (!isSoulforging(name)) return;
      entries(overrides.specialBonuses[name]).forEach(function (item) {
        if (item && item.active !== false && isFinite(Number(item.value))) manual.push({label:item.label || "Special bonus",value:Number(item.value)});
      });
    });
    synced = synced.filter(function (item) {
      return !manual.some(function (entry) { return entry.label === item.label; });
    });
    return synced.concat(manual);
  }

  function soulforgingScore(record, profile) {
    var build = record && record.build || record || {};
    profile = profile && profile.profile || profile || {};
    var storedSnapshot = profile.snapshot || null;
    var snapshot = storedSnapshot && storedSnapshot.data && typeof storedSnapshot.data === "object" ? storedSnapshot.data : storedSnapshot;
    var overrides = profile.manualOverrides || {};
    var level = Math.max(1, numberOr(overrides.level, numberOr(snapshot && snapshot.level, numberOr(build.meta && build.meta.level, 1))));
    var baseAbilities = build.character && build.character.abilityScores || {};
    var importedCha = snapshotAbility(snapshot, "CHA");
    var cha = numberOr(overrides.abilities && overrides.abilities.CHA, importedCha == null ? numberOr(baseAbilities.CHA, 10) : importedCha);
    var pb = Math.max(0, numberOr(overrides.pb, proficiencyBonus(level)));
    var tier = tierFromOverrides(overrides, tierFromSnapshot(snapshot, tierFromRecord(record)));
    var proficiency = tier === "half" ? Math.floor(pb / 2) : pb * (TIER_VALUE[tier] || 0);
    var specials = activeSpecialBonuses(snapshot, overrides);
    var special = specials.reduce(function (sum, item) { return sum + item.value; }, 0);
    var abilityModifier = Math.floor((cha - 10) / 2);
    return {
      bonus:abilityModifier + proficiency + special,
      baseBonus:abilityModifier + proficiency,
      special:special,
      specialBonuses:specials,
      cha:cha,
      mod:abilityModifier,
      pb:pb,
      tier:tier === "half" ? "½ proficiency" : tier === "proficient" ? "proficient" : tier === "expert" ? "expertise" : "untrained",
      tierKey:tier,
      level:level
    };
  }

  function emptyWorkshopInventory() {
    return {parts:[],gems:[],soulgems:[],items:[]};
  }

  function serverInventory(items) {
    var inventory = emptyWorkshopInventory();
    (Array.isArray(items) ? items : []).forEach(function (item) {
      if (!item || !item.id) return;
      if (item.kind === "raw" || item.kind === "part") {
        if (item.stage === "soulgem") {
          inventory.soulgems.push({id:item.id,server:item,gemName:item.gemName || item.name,value:item.valueGp || 0,creature:item.creature,ctype:item.creatureType,cr:item.cr,pp:item.pp,upgraded:!!item.upgraded,owner:item.owner});
        } else {
          var role = ({structure:"Structure",essence:"Essence",catalyst:"Catalyst"})[item.partType] || item.partType;
          inventory.parts.push({id:item.id,server:item,name:item.name,creature:item.creature,ctype:item.creatureType,cr:item.cr,role:role,pp:item.pp,ppCap:item.ppCap,crafted:item.stage === "body",baseItem:item.baseItem,identified:item.stage === "identified",power:item.power || null,owner:item.owner});
        }
        return;
      }
      if (item.kind === "other" && item.subtype === "gem") {
        inventory.gems.push({id:item.id,server:item,name:item.name,value:item.valueGp || 0,qty:item.qty || 1,owner:item.owner});
        return;
      }
      if (item.kind === "other" && item.subtype === "soulforged" && item.soulforge) {
        inventory.items.push(Object.assign({id:item.id,name:item.name,owner:item.owner,server:item}, JSON.parse(JSON.stringify(item.soulforge))));
      }
    });
    return inventory;
  }

  function groupInventory(items) {
    var groups = {raw:[],part:[],other:[]};
    (Array.isArray(items) ? items : []).forEach(function (item) {
      if (!item) return;
      var kind = item.kind === "raw" || item.kind === "part" ? item.kind : "other";
      groups[kind].push(item);
    });
    return groups;
  }

  return {
    groupInventory:groupInventory,
    isSoulforging:isSoulforging,
    normalizedLabel:normalizedLabel,
    proficiencyBonus:proficiencyBonus,
    serverInventory:serverInventory,
    soulforgingScore:soulforgingScore,
    tierName:tierName
  };
});
