/* Fate's Hand — interactive Player Sheet.
   D&D Beyond supplies the stable character snapshot; Fate's Hand owns rolls,
   Destiny, the Soulforging loop and campaign inventory. */
(function () {
  "use strict";

  var API = "https://fh-builds.noirchicot.workers.dev";
  var ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  var ABILITY_NAMES = {STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
  var SKILLS = [
    ["Academics","INT"],["Acrobatics","DEX"],["Animal Handling","WIS"],["Appraise","INT"],["Arcana","INT"],["Athletics","STR"],
    ["Deception","CHA"],["Delve","WIS"],["History","INT"],["Hunting","WIS"],["Insight","WIS"],["Intimidation","CHA"],
    ["Investigation","INT"],["Leadership","CHA"],["Medicine","WIS"],["Might","STR"],["Nature","INT"],["Performance","CHA"],
    ["Persuasion","CHA"],["Religion","INT"],["Sleight of Hand","DEX"],["Stealth","DEX"],["Streetwise","CHA"],["Survival","WIS"],
    ["Tactics","INT"],["Vigilance","WIS"]
  ];
  var SKILL_ABILITY = {};
  SKILLS.forEach(function (entry) { SKILL_ABILITY[entry[0]] = entry[1]; });
  var TOOLS = [
    ["Alchemist's","INT"],["Brewer's","INT"],["Calligrapher's","DEX"],["Carpenter's","STR"],["Card Set","WIS"],
    ["Cartographer's","WIS"],["Cobbler's","DEX"],["Cook's","WIS"],["Dice Set","WIS"],["Disguise Kit","CHA"],
    ["Dragonchess Set","WIS"],["Forgery Kit","DEX"],["Garrot","DEX"],["Glassblower's","INT"],["Herbalism Kit","INT"],
    ["Instrument (Other)","CHA"],["Instrument (Strings)","CHA"],["Instrument (Wind)","CHA"],["Jeweler's","INT"],
    ["Leatherworker's","INT"],["Mason's","INT"],["Mount (Air)","WIS"],["Mount (Land)","WIS"],["Mount (Water)","WIS"],
    ["Navigator's","WIS"],["Painter's","WIS"],["Poisoner's","INT"],["Potter's","WIS"],["Smith's","STR"],
    ["Soulforging","CHA"],["Thieves'","DEX"],["Three-Dragon Ante","WIS"],["Tinker's","INT"],["Vehicles (Air)","INT"],
    ["Vehicles (Land)","DEX"],["Vehicles (Water)","DEX"],["Weaver's","DEX"],["Woodcarver's","DEX"]
  ];
  var TOOL_ORDER = {};
  TOOLS.forEach(function(entry,index){SKILL_ABILITY["Tool - "+entry[0]]=entry[1];TOOL_ORDER["Tool - "+entry[0]]=index;});
  var CREATURES = ["Aberration","Beast","Celestial","Construct","Dragon","Elemental","Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Undead"];
  var KNOWLEDGE = {
    Aberration:["Arcana"],Beast:["Nature"],Celestial:["Religion"],Construct:["Investigation"],Dragon:["History"],
    Elemental:["Arcana"],Fey:["History"],Fiend:["Religion"],Giant:["Medicine"],Humanoid:["Medicine","History"],
    Monstrosity:["Investigation"],Ooze:["Nature"],Plant:["Nature"],Undead:["Religion","Medicine"]
  };
  var CLASS_SAVES = {
    Artificer:["CON","INT"],Barbarian:["STR","CON"],Bard:["DEX","CHA"],Cleric:["WIS","CHA"],Druid:["INT","WIS"],
    Fighter:["STR","CON"],Monk:["STR","DEX"],Paladin:["WIS","CHA"],Ranger:["STR","DEX"],Rogue:["DEX","INT"],
    Sorcerer:["CON","CHA"],Warlock:["WIS","CHA"],Wizard:["INT","WIS"]
  };
  var CLASS_NAMES = Object.keys(CLASS_SAVES);
  var TIERS = {none:0,half:.5,proficient:1,expert:2};
  var TIER_LABEL = {none:"Untrained",half:"Half",proficient:"Proficient",expert:"Expert"};
  var DIE_SEQUENCE = [4,6,8,10,12];
  var MAX_HISTORY = 20;

  var root;
  var persistTimer = null;
  var state = {
    code:"", pseudo:"", party:[], record:null, profile:null, character:null,
    destiny:null, history:[], events:[], prefs:{bardicSides:6}, rollConfig:null, trayPrompt:null,
    traySelection:[20],trayResults:[],currentEvent:null,eventTimer:null,chromeOpen:false,
    activeContext:"loop", target:"Aberration", cr:"1", inventory:null,
    loading:false, message:"", messageKind:""
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function mod(score) { return Math.floor(((Number(score) || 10) - 10) / 2); }
  function signed(value) { value = Number(value) || 0; return (value >= 0 ? "+" : "") + value; }
  function pbFor(level) { return 2 + Math.floor((Math.max(1, Number(level) || 1) - 1) / 4); }
  function uuid() { return window.crypto && crypto.randomUUID ? crypto.randomUUID() : "fh-" + Date.now() + "-" + Math.random().toString(16).slice(2); }
  function nowLabel(iso) { return new Date(iso).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
  function rollDie(sides) {
    sides = Math.max(2, Number(sides) || 20);
    if (window.crypto && crypto.getRandomValues) {
      var max = Math.floor(0x100000000 / sides) * sides;
      var bucket = new Uint32Array(1);
      do { crypto.getRandomValues(bucket); } while (bucket[0] >= max);
      return (bucket[0] % sides) + 1;
    }
    return 1 + Math.floor(Math.random() * sides);
  }
  function api(path, options) {
    return fetch(API + path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || ("HTTP " + response.status));
          error.status = response.status;
          throw error;
        }
        return data;
      });
    });
  }
  function post(path, body) {
    return api(path, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  }
  function tierName(value) {
    if (value === "prof" || value === "proficient" || value === 3) return "proficient";
    if (value === "exp" || value === "expert" || value === 4) return "expert";
    if (value === "half" || value === 2) return "half";
    return "none";
  }
  function importedTier(entry) {
    if (!entry) return "none";
    if (entry.expertise === true || entry.expert === true || entry.isExpertise === true) return "expert";
    if (entry.proficient === true || entry.proficiency === true || entry.isProficient === true) return "proficient";
    if(entry.tier!=null)return tierName(entry.tier);
    if(entry.proficiencyLevel!=null){var level=Number(entry.proficiencyLevel);if(level===1)return "proficient";if(level===2)return "expert";return tierName(entry.proficiencyLevel);}
    return tierName(entry.level);
  }
  function canonicalToolName(value) {
    var raw=String(value||"").trim().replace(/^Tool\s*-\s*/i,"").replace(/\s+Tools?$/i,"").replace(/[’]/g,"'");
    var lower=raw.toLowerCase();
    var found=TOOLS.find(function(entry){var name=entry[0].toLowerCase();return name===lower||name.replace(/'s$/i,"")===lower.replace(/'s$/i,"");});
    return "Tool - "+(found?found[0]:raw);
  }
  function importedAbility(entry, fallback) {
    var raw=entry&&(entry.ability||entry.abilityKey||entry.stat||entry.statName||entry.statId);
    if(typeof raw==="number"||/^\d+$/.test(String(raw||"")))return ABILITIES[Math.max(0,Number(raw)-1)]||fallback||"INT";
    raw=String(raw||"").trim().slice(0,3).toUpperCase();
    return ABILITIES.indexOf(raw)>=0?raw:(fallback||"INT");
  }
  function importedEntries(value) {
    if(!value)return [];
    if(Array.isArray(value))return value;
    if(typeof value!=="object")return [];
    if(value.name||value.label||value.skillName||value.toolName||value.friendlySubtypeName)return [value];
    return Object.keys(value).map(function(name){
      var entry=value[name];
      if(entry&&typeof entry==="object")return Object.assign({name:name},entry);
      if(typeof entry==="boolean")return {name:name,proficient:entry};
      if(typeof entry==="number")return {name:name,proficiencyLevel:entry};
      return {name:name,tier:entry};
    });
  }
  function knownSkillName(value) {
    var raw=String(value||"").trim().replace(/^Skill\s*-\s*/i,"");
    var found=SKILLS.find(function(item){return item[0].toLowerCase()===raw.toLowerCase();});
    return found&&found[0];
  }
  function knownToolName(value) {
    var canonical=canonicalToolName(value),raw=canonical.replace(/^Tool - /,"").toLowerCase();
    return TOOLS.some(function(entry){return entry[0].toLowerCase()===raw;})?canonical:null;
  }
  function applyImportedRecord(skills,entry,isTool) {
    if(!entry)return;
    var raw=typeof entry==="string"?entry:(entry.name||entry.label||entry.skillName||entry.toolName||entry.friendlySubtypeName||entry.subtypeName);
    if(!raw)return;
    var name=isTool?canonicalToolName(raw):String(raw).replace(/^Skill\s*-\s*/i,"");
    if(!isTool){var canonical=SKILLS.find(function(item){return item[0].toLowerCase()===name.toLowerCase();});if(canonical)name=canonical[0];}
    if(!isTool&&!skills[name]&&/^Tool\s*-\s*/i.test(raw))name=canonicalToolName(raw);
    var old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||(entry.ability||"INT")};
    var tier=typeof entry==="string"?"proficient":importedTier(entry);
    old.ability=importedAbility(entry,old.ability||SKILL_ABILITY[name]||"INT");
    old.tier=tier==="none"&&typeof entry!=="string"&&entry.proficient!==false?(old.tier||"none"):tier;
    skills[name]=old;
  }
  function applyDdbModifiers(skills, modifiers) {
    if(!modifiers)return;
    var list=Array.isArray(modifiers)?modifiers:Object.keys(modifiers).reduce(function(all,key){return all.concat(importedEntries(modifiers[key]));},[]);
    list.forEach(function(entry){
      if(!entry||typeof entry!=="object")return;
      var type=String(entry.type||entry.modifierType||"").toLowerCase();
      if(type.indexOf("profic")<0&&type.indexOf("expert")<0)return;
      var raw=entry.friendlySubtypeName||entry.subtypeName||entry.name||entry.label||entry.subtype;
      var skill=knownSkillName(raw),tool=knownToolName(raw);
      if(!skill&&!tool)return;
      var normalized=Object.assign({},entry,{name:skill||tool,tier:type.indexOf("expert")>=0?"expert":type.indexOf("half")>=0?"half":"proficient"});
      applyImportedRecord(skills,normalized,!!tool);
    });
  }
  function numericImportValue(value) {
    if(value&&typeof value==="object")value=value.value!=null?value.value:value.total!=null?value.total:value.score;
    var number=Number(value);return value!==null&&value!==""&&isFinite(number)?number:null;
  }
  function firstImportNumber(values) {
    for(var i=0;i<values.length;i++){var number=numericImportValue(values[i]);if(number!=null)return number;}
    return null;
  }
  function snapshotAbility(snap,key) {
    var scores=snap&&(snap.abilityScores||snap.abilities||snap.stats),value=null;
    if(Array.isArray(scores)){
      var index=ABILITIES.indexOf(key),entry=scores.find(function(item){return item&&(String(item.name||item.key||item.ability||"").slice(0,3).toUpperCase()===key||Number(item.id||item.statId)===index+1);});
      value=entry&&(entry.value!=null?entry.value:entry.score);
      if(value==null&&scores[index]!=null)value=typeof scores[index]==="object"?(scores[index].value!=null?scores[index].value:scores[index].score):scores[index];
    }else if(scores&&typeof scores==="object")value=scores[key]!=null?scores[key]:scores[key.toLowerCase()];
    return numericImportValue(value);
  }
  function crNumber(value) {
    var text = String(value || "0").trim();
    if (/^\d+\s*\/\s*\d+$/.test(text)) {
      var bits = text.split("/");
      return Number(bits[0]) / Math.max(1, Number(bits[1]));
    }
    var number = Number(text);
    return isFinite(number) ? Math.max(0, number) : 0;
  }
  function canonicalDdbUrl(value) {
    var text = String(value || "").trim();
    if (/^\d+$/.test(text)) return "https://www.dndbeyond.com/characters/" + text;
    var parsed;
    try { parsed = new URL(text); }
    catch (error) { throw new Error("Paste a valid D&D Beyond character link."); }
    var host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    var match = parsed.pathname.match(/(?:^|\/)characters\/(\d+)(?:\/[a-z0-9_-]+)?(?:\/|$)/i);
    if (parsed.protocol !== "https:" || host !== "dndbeyond.com" || !match) throw new Error("Use a public HTTPS D&D Beyond character link.");
    return "https://www.dndbeyond.com/characters/" + match[1];
  }
  function emptyProfile() {
    return {ddbLinked:false,snapshot:null,preparation:{transferEssence:false,identify:false,tools:[]},levelUps:[]};
  }

  function effectiveCharacter() {
    var build = (state.record && state.record.build) || {};
    var base = build.character || {};
    var meta = build.meta || {};
    var profile = state.profile || emptyProfile();
    var overrides=profile.manualOverrides||{};
    var storedSnap = profile.snapshot || null;
    var snap = storedSnap&&storedSnap.data&&typeof storedSnap.data==="object"?storedSnap.data:storedSnap;
    var pending = Array.isArray(profile.levelUps) ? profile.levelUps : [];
    var classes = snap && Array.isArray(snap.classes) && snap.classes.length
      ? snap.classes.map(function (entry) { return {name:entry.name||(entry.definition&&entry.definition.name)||entry.className||"Class",level:Number(entry.level||entry.classLevel)||1}; })
      : [{name:meta.class || "Class",level:Number(meta.level)||1}];
    pending.forEach(function (entry) {
      var found = classes.find(function (item) { return item.name === entry.className; });
      if (found) found.level += 1; else classes.push({name:entry.className,level:1});
    });
    var importedLevel=snap&&Number(snap.level),classLevel=classes.reduce(function(total,entry){return total+(Number(entry.level)||0);},0);
    var liveLevel = snap ? importedLevel||classLevel||1 : Number(meta.level)||1;
    var level = pending.reduce(function (value, entry) { return Math.max(value, Number(entry.targetLevel)||value); }, liveLevel);
    var abilities = {};
    ABILITIES.forEach(function (key) {
      var imported=snapshotAbility(snap,key);
      abilities[key] = imported!=null?imported:Number((base.abilityScores && base.abilityScores[key]) || 10);
    });
    pending.forEach(function (entry) {
      ABILITIES.forEach(function (key) { abilities[key] += Number(entry.abilityIncreases && entry.abilityIncreases[key]) || 0; });
    });
    var skills = {};
    SKILLS.forEach(function (entry) { skills[entry[0]] = {name:entry[0],ability:entry[1],tier:"none"}; });
    Object.keys(build.nativeSkillTiers || {}).forEach(function (name) {
      skills[name] = {name:name,ability:SKILL_ABILITY[name] || (skills[name] && skills[name].ability) || "INT",tier:tierName(build.nativeSkillTiers[name])};
    });
    (build.skills || []).forEach(function (skill) {
      var name = skill.name;
      skills[name] = {name:name,ability:ABILITIES[(Number(skill.statId)||1)-1] || SKILL_ABILITY[name] || "INT",tier:tierName(skill.proficiencyLevel)};
    });
    if (snap) {
      [snap.skills,snap.customSkills,snap.proficiencies&&snap.proficiencies.skills].forEach(function(group){importedEntries(group).forEach(function(skill){applyImportedRecord(skills,skill,false);});});
      [snap.tools,snap.toolProficiencies,snap.proficiencies&&snap.proficiencies.tools].forEach(function(group){importedEntries(group).forEach(function(tool){applyImportedRecord(skills,tool,true);});});
      applyDdbModifiers(skills,snap.modifiers);
    }
    pending.forEach(function (entry) {
      (entry.essentialSkills || []).forEach(function (skill) {
        var old = skills[skill.name] || {name:skill.name,ability:SKILL_ABILITY[skill.name] || "INT"};
        old.tier = tierName(skill.tier); skills[skill.name] = old;
      });
    });
    Object.keys(overrides.skills||{}).forEach(function(name){var old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||"INT"};old.tier=tierName(overrides.skills[name]);skills[name]=old;});
    (overrides.tools||[]).forEach(function(tool){var name=canonicalToolName(tool.name||tool),old=skills[name]||{name:name,ability:tool.ability||SKILL_ABILITY[name]||"INT"};old.ability=tool.ability||old.ability;old.tier=tierName(tool.tier||"proficient");skills[name]=old;});
    Object.keys(overrides.toolTiers||{}).forEach(function(key){var name=canonicalToolName(key),old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||"INT"};old.tier=tierName(overrides.toolTiers[key]);skills[name]=old;});
    var spells = {};
    if (snap) (snap.spells || []).forEach(function (spell) { spells[spell.name.toLowerCase()] = {name:spell.name,level:spell.level}; });
    pending.forEach(function (entry) { (entry.spells || []).forEach(function (name) { spells[name.toLowerCase()] = {name:name,level:null}; }); });
    var firstClass = classes[0] && classes[0].name;
    var savingProficiencies = (snap && snap.savingThrowProficiencies) || CLASS_SAVES[firstClass] || [];
    return {
      name:(snap && snap.name) || base.name || state.pseudo,
      species:(snap && (snap.species||(snap.race&&(snap.race.fullName||snap.race.baseRaceName||snap.race.name)))) || meta.species || "Unknown species",
      avatarUrl:snap && (snap.avatarUrl||snap.avatarUrlRaw||snap.decorations&&snap.decorations.avatarUrl),
      classes:classes,level:level,liveLevel:liveLevel,pb:pbFor(level),abilities:abilities,skills:skills,
      spells:Object.keys(spells).map(function (key) { return spells[key]; }).sort(function (a,b) { return (Number(a.level)||0)-(Number(b.level)||0)||a.name.localeCompare(b.name); }),
      preparation:profile.preparation || {transferEssence:false,identify:false,tools:[]},
      savingProficiencies:savingProficiencies,
      armorClass:overrides.armorClass!=null&&overrides.armorClass!==""?Number(overrides.armorClass):firstImportNumber([snap&&snap.armorClass,snap&&snap.ac,snap&&snap.armorClassTotal,snap&&snap.defenses&&snap.defenses.armorClass,snap&&snap.combat&&snap.combat.armorClass,snap&&snap.stats&&snap.stats.armorClass,base.armorClass,build.armorClass]),
      speed:(snap && (snap.speed || snap.walkingSpeed || snap.movement&&snap.movement.walk)) || null,
      syncedAt:(snap && snap.syncedAt)||(storedSnap&&storedSnap.syncedAt),pending:pending,
      destinyBuild:build.destiny || {},build:build
    };
  }
  function skillInfo(name, ch, extra) {
    var skill = ch.skills[name] || {name:name,ability:SKILL_ABILITY[name] || "INT",tier:"none"};
    var tier = tierName(skill.tier);
    var proficiency = TIERS[tier] === .5 ? Math.floor(ch.pb/2) : ch.pb * TIERS[tier];
    return {name:name,ability:skill.ability || "INT",tier:tier,bonus:mod(ch.abilities[skill.ability] || 10)+proficiency+(Number(extra)||0)};
  }
  function saveInfo(ability, ch) {
    var proficient = ch.savingProficiencies.indexOf(ability) >= 0;
    return {name:ABILITY_NAMES[ability]+" Save",ability:ability,tier:proficient?"proficient":"none",bonus:mod(ch.abilities[ability])+(proficient?ch.pb:0)};
  }

  function storageKey() { return "fh-player-v2:" + state.code + ":" + state.pseudo; }
  function makeDestinySlots(score, points) {
    var slotCount = Math.min(15, Math.max(5, Math.ceil(Math.max(0, Number(score)||0)/2), Math.ceil(Math.max(0, Number(points)||0)/2)));
    var fullCount = Math.min(15, Math.max(0, Math.floor((Number(points)||0)/2)));
    var slots = [];
    for (var i=0;i<slotCount;i++) slots.push({id:uuid(),sides:DIE_SEQUENCE[i%DIE_SEQUENCE.length],available:i<fullCount});
    return slots;
  }
  function normalizeDestiny(raw, ch) {
    var buildScore = Number(ch.destinyBuild && ch.destinyBuild.score) || Number(ch.build.destinyFeats && ch.build.destinyFeats.score) || ch.pb + 2;
    raw = raw && typeof raw === "object" ? raw : {};
    var score = raw.score != null ? Number(raw.score) : buildScore;
    var points = raw.points != null ? Number(raw.points) : score;
    var counts = {};
    var dice = Array.isArray(raw.dice) ? raw.dice.map(function (die,i) {
      return {id:die.id || uuid(),sides:DIE_SEQUENCE.indexOf(Number(die.sides))>=0?Number(die.sides):DIE_SEQUENCE[i%DIE_SEQUENCE.length],available:!!die.available};
    }).filter(function (die) { counts[die.sides]=(counts[die.sides]||0)+1;return counts[die.sides]<=3; }) : makeDestinySlots(score,points);
    if (!dice.length) dice = makeDestinySlots(score,points);
    return {score:score,points:points,dice:dice,lastChange:raw.lastChange || null};
  }
  function loadPlayState(ch) {
    var local = {};
    try { local = JSON.parse(localStorage.getItem(storageKey()) || "{}"); } catch (error) {}
    var profile = state.profile || {};
    state.destiny = normalizeDestiny(profile.destinyState || local.destiny, ch);
    state.history = Array.isArray(profile.rollHistory) ? profile.rollHistory.slice(0,MAX_HISTORY) : Array.isArray(local.history) ? local.history.slice(0,MAX_HISTORY) : [];
    state.events = Array.isArray(profile.rollEvents) ? profile.rollEvents.slice(0,10) : Array.isArray(local.events) ? local.events.slice(0,10) : [];
    state.traySelection = Array.isArray(local.traySelection) ? local.traySelection.map(Number).filter(function(s){return [4,6,8,10,12,20,100].indexOf(s)>=0;}).slice(0,5) : [20];
    state.prefs = Object.assign({bardicSides:6},local.prefs || {},profile.rollPrefs || {});
  }
  function persistPlayState() {
    if (!state.code || !state.pseudo || !state.destiny) return;
    var payload = {destiny:state.destiny,history:state.history.slice(0,MAX_HISTORY),events:state.events.slice(0,10),traySelection:state.traySelection,prefs:state.prefs};
    try { localStorage.setItem(storageKey(), JSON.stringify(payload)); } catch (error) {}
    clearTimeout(persistTimer);
    persistTimer = window.setTimeout(function () {
      saveProfile({destinyState:state.destiny,rollHistory:state.history.slice(0,MAX_HISTORY),rollEvents:state.events.slice(0,10),rollPrefs:state.prefs}).catch(function () {
        state.message = "Saved on this device; server sync is unavailable."; state.messageKind = "warn"; renderMessage();
      });
    },450);
  }
  function saveProfile(patch) {
    return post("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(state.pseudo),patch).then(function (data) {
      state.profile = Object.assign({},state.profile || {},data.profile || {},patch);
      return state.profile;
    });
  }
  function refreshEventPanel(){var panel=root&&root.querySelector(".fh-ps-event-zone");if(panel)panel.innerHTML=renderEventContent();}
  function pushEvent(text,kind,sticky,entryId) {
    var event={id:uuid(),text:text,kind:kind||"info",entryId:entryId||null,createdAt:new Date().toISOString()};
    state.events.unshift(event);state.events=state.events.slice(0,10);state.currentEvent=event;
    clearTimeout(state.eventTimer);
    if(!sticky)state.eventTimer=window.setTimeout(function(){if(state.currentEvent&&state.currentEvent.id===event.id){state.currentEvent=null;refreshEventPanel();}},1800);
    persistPlayState();return event;
  }
  function recoverLowestDie() {
    var missing = state.destiny.dice.find(function (die) { return !die.available; });
    if (missing) { missing.available = true; return missing; }
    for (var round=0;round<3;round++) for (var i=0;i<DIE_SEQUENCE.length;i++) {
      var sides=DIE_SEQUENCE[i],count=state.destiny.dice.filter(function(die){return die.sides===sides;}).length;
      if(count<=round){var die={id:uuid(),sides:sides,available:true};state.destiny.dice.push(die);return die;}
    }
    return null;
  }
  function adjustDestinyDie(sides, direction) {
    sides=Number(sides);direction=Number(direction);
    var matching=state.destiny.dice.filter(function(die){return die.sides===sides;});
    var changed=false;
    if(direction>0){
      var spent=matching.find(function(die){return !die.available;});
      if(spent){spent.available=true;changed=true;}
      else if(matching.length<3){state.destiny.dice.push({id:uuid(),sides:sides,available:true});changed=true;}
    }else{
      var full=matching.slice().reverse().find(function(die){return die.available;});
      if(full){full.available=false;changed=true;}
    }
    if(changed)pushEvent((direction>0?"Gained ":"Removed ")+"a Destiny d"+sides,direction>0?"die-gain":"die-loss",false);
    state.destiny.lastChange={reason:"Manual d"+sides+" pool correction",at:new Date().toISOString()};
    persistPlayState();render();
  }
  function setDestinyPoints(next, reason, recover) {
    var before = Number(state.destiny.points)||0;
    next = Math.max(-99,Math.min(999,Number(next)||0));
    state.destiny.points = next;
    var recovered = null;
    if (recover !== false && next !== before && next > 0 && next % 2 === 0) recovered = recoverLowestDie();
    if(next!==before)pushEvent((next>before?"Gained ":"Lost ")+Math.abs(next-before)+" Destiny Point"+(Math.abs(next-before)===1?"":"s"),next>before?"gain":"loss",false);
    if(recovered)pushEvent("Gained a Destiny d"+recovered.sides,"die-gain",false);
    state.destiny.lastChange = {before:before,after:next,reason:reason || "Correction",recovered:recovered && recovered.id,at:new Date().toISOString()};
    persistPlayState();
    return recovered;
  }
  function updateDestinyField(field, value, reason) {
    if (field === "score") state.destiny.score = clamp(value,0,99);
    else setDestinyPoints(value,reason || "Manual correction",true);
    persistPlayState(); render();
  }

  function rollInput(name, ability, bonus, options) {
    options = options || {};
    return {
      name:name,ability:ability,baseBonus:Number(bonus)||0,d20Mode:options.mode || "flat",plusTwo:!!options.plusTwo,
      guidance:false,bardic:false,bardicSides:Number(state.prefs.bardicSides)||6,destinyDieId:"",destinyConfirmed:false,custom:0,
      dc:options.dc != null ? String(options.dc) : "",note:options.note || "",editingId:null
    };
  }
  function entryTotal(entry) {
    var total = Number(entry.kept)||0 + Number(entry.baseBonus)||0;
    total = (Number(entry.kept)||0) + (Number(entry.baseBonus)||0) + (entry.plusTwo?2:0) + (Number(entry.custom)||0);
    [entry.guidance,entry.bardic,entry.destiny].forEach(function (die) { if (die) total += Number(die.result)||0; });
    return total;
  }
  function outcomeFor(entry) {
    if (entry.destiny && entry.destiny.criticalFailure) return "Critical failure";
    if (entry.destiny && entry.destiny.criticalSuccess) return "Critical success";
    if (entry.natChoice === "chaos") return "Critical success · Chaos";
    if (entry.natural === 20) return "Natural 20";
    if (entry.natural === 1) return entry.natChoice === "accept" ? "Critical failure · Fate accepted" : "Natural 1 · choose fate";
    if (entry.dc !== "" && isFinite(Number(entry.dc))) return entry.total >= Number(entry.dc) ? "Success" : "Failure";
    return "";
  }
  function spendDestinyDie(dieId) {
    var die = state.destiny.dice.find(function (item) { return item.id === dieId && item.available; });
    if (!die) return null;
    die.available = false;
    var result = rollDie(die.sides), before = Number(state.destiny.points)||0, cost, criticalSuccess=false, criticalFailure=false, chaos=null;
    if (result === die.sides) { cost = 1; criticalSuccess = true; setDestinyPoints(before-1,"Arcane critical d"+die.sides,true); }
    else if (result === 1) { cost = -1; criticalFailure = true; setDestinyPoints(before+1,"Destiny critical failure d"+die.sides,true); }
    else {
      cost = result; setDestinyPoints(before-result,"Destiny d"+die.sides,true);
      if (state.destiny.points <= 0) chaos = {overreach:Math.abs(state.destiny.points),dc:10+Math.abs(state.destiny.points)};
    }
    if(criticalSuccess)pushEvent("ARCANE CRITICAL · Destiny d"+die.sides+" rolled "+result,"arcane-critical",false);
    else if(criticalFailure)pushEvent("ARCANE FUMBLE · Destiny d"+die.sides+" rolled 1","arcane-fumble",false);
    return {dieId:die.id,sides:die.sides,result:result,cost:cost,pointsBefore:before,pointsAfter:state.destiny.points,criticalSuccess:criticalSuccess,criticalFailure:criticalFailure,chaos:chaos};
  }
  function naturalDestiny(entry) {
    if (entry.natural === 20) {
      var before = state.destiny.points;
      setDestinyPoints(before-1,"Natural 20",true);
      entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 20"};
      if (state.destiny.points === 0) entry.awakening = true;
      pushEvent(entry.awakening?"ARCANE AWAKENING · Natural 20 at Destiny 0":"NATURAL 20 · Fate bends in your favor",entry.awakening?"awakening":"nat20",false,entry.id);
    } else if (entry.natural === 1) entry.natChoice = null;
  }
  function addHistory(entry) {
    state.history.unshift(entry); state.history = state.history.slice(0,MAX_HISTORY); persistPlayState();
  }
  function setTrayFromEntry(entry) {
    var results=[];
    if(entry.kind==="d20"){
      (entry.d20s||[]).forEach(function(result,index){results.push({sides:20,result:result,label:index===0?"d20":"d20 #2",dropped:entry.d20s.length>1&&result!==entry.kept,natural:result});});
      if(entry.guidance)results.push({sides:entry.guidance.sides,result:entry.guidance.result,label:"Guidance"});
      if(entry.bardic)results.push({sides:entry.bardic.sides,result:entry.bardic.result,label:"Bardic"});
      if(entry.destiny)results.push({sides:entry.destiny.sides,result:entry.destiny.result,label:"Destiny",special:entry.destiny.criticalSuccess?"arcane-critical":entry.destiny.criticalFailure?"arcane-fumble":""});
    }else if(entry.kind==="destiny")results=[{sides:entry.destiny.sides,result:entry.destiny.result,label:"Destiny",special:entry.destiny.criticalSuccess?"arcane-critical":entry.destiny.criticalFailure?"arcane-fumble":""}];
    else if(entry.kind==="tray")results=(entry.dice||[]).map(function(die){return {sides:die.sides,result:die.result,label:"d"+die.sides,natural:die.sides===20?die.result:null};});
    state.trayResults=results.slice(0,5);
  }
  function quickRoll(name, ability, bonus, note) {
    var natural = rollDie(20);
    var entry = {id:uuid(),kind:"d20",name:name,ability:ability,baseBonus:Number(bonus)||0,d20Mode:"flat",d20s:[natural],kept:natural,natural:natural,plusTwo:false,custom:0,guidance:null,bardic:null,destiny:null,dc:"",note:note||"",createdAt:new Date().toISOString(),adjusted:false};
    entry.total = entryTotal(entry); naturalDestiny(entry); entry.outcome=outcomeFor(entry); addHistory(entry);
    state.message = name+": "+natural+" "+signed(entry.baseBonus)+" = "+entry.total+(entry.outcome?" · "+entry.outcome:"");
    setTrayFromEntry(entry);if(natural===1)pushEvent("NATURAL 1 · Do you accept your fate?","nat1",true,entry.id);else if(natural!==20)pushEvent(name+" · "+entry.total+(entry.outcome?" · "+entry.outcome:""),"roll",false,entry.id);
    state.messageKind = natural===20?"success":natural===1?"danger":"roll"; render();announceRoll(entry);
  }
  function runConfiguredRoll() {
    syncConsoleInputs();
    var cfg = state.rollConfig;
    if (!cfg) return;
    if(cfg.destinyDieId&&!cfg.destinyConfirmed){confirmDestinyUse(cfg.destinyDieId,"Add this die to "+cfg.name,function(){cfg.destinyConfirmed=true;runConfiguredRoll();});return;}
    if (cfg.editingId) { applyHistoryAdjustment(cfg); return; }
    var d20s = cfg.d20Mode === "flat" ? [rollDie(20)] : [rollDie(20),rollDie(20)];
    var kept = cfg.d20Mode === "advantage" ? Math.max.apply(Math,d20s) : cfg.d20Mode === "disadvantage" ? Math.min.apply(Math,d20s) : d20s[0];
    var entry = {id:uuid(),kind:"d20",name:cfg.name,ability:cfg.ability,baseBonus:cfg.baseBonus,d20Mode:cfg.d20Mode,d20s:d20s,kept:kept,natural:kept,plusTwo:cfg.plusTwo,custom:cfg.custom,dc:cfg.dc,note:cfg.note,createdAt:new Date().toISOString(),adjusted:false};
    entry.guidance = cfg.guidance ? {sides:4,result:rollDie(4)} : null;
    entry.bardic = cfg.bardic ? {sides:cfg.bardicSides,result:rollDie(cfg.bardicSides)} : null;
    entry.destiny = cfg.destinyDieId ? spendDestinyDie(cfg.destinyDieId) : null;
    entry.total=entryTotal(entry); naturalDestiny(entry); entry.outcome=outcomeFor(entry); addHistory(entry);
    setTrayFromEntry(entry);if(entry.natural===1)pushEvent("NATURAL 1 · Do you accept your fate?","nat1",true,entry.id);else if(entry.natural!==20)pushEvent(entry.name+" · "+entry.total+(entry.outcome?" · "+entry.outcome:""),"roll",false,entry.id);
    state.rollConfig=configFromEntry(entry); state.message=""; render();announceRoll(entry);
  }
  function applyHistoryAdjustment(cfg) {
    var entry = state.history.find(function (item) { return item.id === cfg.editingId; });
    if (!entry || entry.kind !== "d20") return;
    entry.plusTwo=cfg.plusTwo; entry.custom=cfg.custom; entry.dc=cfg.dc;
    if (cfg.guidance && !entry.guidance) entry.guidance={sides:4,result:rollDie(4)};
    if (!cfg.guidance && entry.guidance) entry.guidance=null;
    if (cfg.bardic && !entry.bardic) entry.bardic={sides:cfg.bardicSides,result:rollDie(cfg.bardicSides)};
    if (!cfg.bardic && entry.bardic) entry.bardic=null;
    if (!entry.destiny && cfg.destinyDieId) entry.destiny=spendDestinyDie(cfg.destinyDieId);
    entry.total=entryTotal(entry); entry.adjusted=true; entry.adjustedAt=new Date().toISOString(); entry.outcome=outcomeFor(entry);
    setTrayFromEntry(entry);pushEvent("Adjusted "+entry.name+" · "+entry.total,"adjusted",false,entry.id);persistPlayState(); render();
  }
  function standaloneDestiny(dieId) {
    var spent = spendDestinyDie(dieId); if (!spent) return;
    var entry={id:uuid(),kind:"destiny",name:"Destiny d"+spent.sides,createdAt:new Date().toISOString(),destiny:spent,total:spent.result,outcome:spent.criticalSuccess?"Arcane critical":spent.criticalFailure?"Critical failure":spent.chaos?"Chaos risk":"Destiny spent"};
    addHistory(entry);setTrayFromEntry(entry);if(!spent.criticalSuccess&&!spent.criticalFailure)pushEvent("Destiny d"+spent.sides+" · "+spent.result+" · Points "+spent.pointsAfter,"destiny",false);state.message="Destiny d"+spent.sides+": "+spent.result+" · Points "+spent.pointsBefore+" → "+spent.pointsAfter; state.messageKind=spent.criticalSuccess?"success":spent.criticalFailure?"danger":"roll"; render();
  }
  function resolveNatOne(id, choice) {
    var entry=state.history.find(function (item) { return item.id===id; }); if(!entry||entry.natural!==1||entry.natChoice)return;
    if(choice==="accept") { var before=state.destiny.points; setDestinyPoints(before+1,"Natural 1 accepted",true); entry.natChoice="accept"; entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 1 accepted"};pushEvent("FATE ACCEPTED · Critical failure · +1 Destiny","nat1",false,entry.id); }
    else { entry.natChoice="chaos";entry.originalKept=entry.kept;entry.transformed=true;entry.kept=20;entry.chaosRoll=[rollDie(6),rollDie(6)];setDestinyPoints(0,"Invoked Chaos",false);entry.total=entryTotal(entry);pushEvent("FATE DEFIED · The 1 becomes 20 · Chaos answers","chaos",true,entry.id); }
    setTrayFromEntry(entry);
    entry.outcome=outcomeFor(entry); persistPlayState(); render();
    if(choice==="chaos"&&root)window.setTimeout(function(){showChaosModal(entry);},80);
  }

  function skillRow(info, compactName) {
    var name=compactName || info.name;
    return "<div class=\"fh-ps-skill-row tier-"+info.tier+"\">"+
      "<button class=\"fh-ps-skill-main\" type=\"button\" data-quick-name=\""+esc(info.name)+"\" data-ability=\""+esc(info.ability)+"\" data-bonus=\""+info.bonus+"\" title=\"Roll "+esc(info.name)+" normally\"><i></i><span><b>"+esc(name)+"</b><small>"+info.ability+" · "+esc(TIER_LABEL[info.tier])+"</small></span><strong>"+signed(info.bonus)+"</strong></button>"+
      "<button class=\"fh-ps-configure\" type=\"button\" data-config-name=\""+esc(info.name)+"\" data-ability=\""+esc(info.ability)+"\" data-bonus=\""+info.bonus+"\" aria-label=\"Configure "+esc(info.name)+" roll\" title=\"Configure roll\">⚙</button></div>";
  }
  function renderIdentity(ch) {
    var classes=ch.classes.map(function(e){return e.name+" "+e.level;}).join(" / ");
    var portrait=ch.avatarUrl || "../assets/img/species-"+String(ch.species).toLowerCase().replace(/\s*\(fh\)\s*/g,"").replace(/[^a-z]+/g,"-").replace(/^-|-$/g,"")+".jpg";
    var sync=ch.syncedAt?"Synced "+new Date(ch.syncedAt).toLocaleString([], {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"Fate's Hand build";
    return "<section class=\"fh-ps-identity fh-ps-card\"><img src=\""+esc(portrait)+"\" alt=\"\" onerror=\"this.hidden=true\"><div class=\"fh-ps-who\"><p>FATE'S HAND CHARACTER</p><h1>"+esc(ch.name)+"</h1><span>"+esc(ch.species)+" · "+esc(classes)+"</span><small>"+esc(sync)+"</small></div><div class=\"fh-ps-identity-actions\"><button id=\"fhPsSync\" type=\"button\">"+(state.profile&&state.profile.ddbLinked?"Sync":"Link DDB")+"</button>"+(state.profile&&state.profile.ddbLinked?"<button id=\"fhPsRelink\" type=\"button\">Link</button>":"")+"<button id=\"fhPsLevel\" type=\"button\">Level Up</button><button id=\"fhPsCorrect\" type=\"button\">Correct</button></div></section>";
  }
  function renderStats(ch) {
    var cards=ABILITIES.map(function(key){var save=saveInfo(key,ch),abilityBonus=mod(ch.abilities[key]);return "<div class=\"fh-ps-stat\"><button type=\"button\" data-quick-name=\""+ABILITY_NAMES[key]+" Check\" data-ability=\""+key+"\" data-bonus=\""+abilityBonus+"\"><small>"+ABILITY_NAMES[key]+"</small><b>"+ch.abilities[key]+"</b><strong>"+signed(abilityBonus)+"</strong></button><div class=\"fh-ps-save-row\"><button class=\"fh-ps-save tier-"+save.tier+"\" type=\"button\" data-quick-name=\""+save.name+"\" data-ability=\""+key+"\" data-bonus=\""+save.bonus+"\"><i></i> Save "+signed(save.bonus)+"</button><button class=\"fh-ps-save-config\" type=\"button\" data-config-name=\""+save.name+"\" data-ability=\""+key+"\" data-bonus=\""+save.bonus+"\" aria-label=\"Configure "+save.name+"\">⚙</button></div><button class=\"fh-ps-stat-config\" type=\"button\" data-config-name=\""+ABILITY_NAMES[key]+" Check\" data-ability=\""+key+"\" data-bonus=\""+abilityBonus+"\" aria-label=\"Configure "+ABILITY_NAMES[key]+" check\">⚙</button></div>";}).join("");
    var initiative=mod(ch.abilities.DEX), vigilance=skillInfo("Vigilance",ch),investigation=skillInfo("Investigation",ch),insight=skillInfo("Insight",ch);
    return "<section class=\"fh-ps-stats fh-ps-card\"><div class=\"fh-ps-stat-grid\">"+cards+"</div><div class=\"fh-ps-derived\"><span><small>PB</small><b>+"+ch.pb+"</b></span><button data-quick-name=\"Initiative\" data-ability=\"DEX\" data-bonus=\""+initiative+"\"><small>Initiative</small><b>"+signed(initiative)+"</b></button><span><small>AC</small><b>"+(ch.armorClass||"—")+"</b></span><span><small>Passive Vigilance</small><b>"+(10+vigilance.bonus)+"</b></span><span><small>Investigation</small><b>"+(10+investigation.bonus)+"</b></span><span><small>Insight</small><b>"+(10+insight.bonus)+"</b></span></div></section>";
  }
  function renderSkills(ch) {
    var columns=[SKILLS.slice(0,9),SKILLS.slice(9,18),SKILLS.slice(18,26)];
    var skillColumns=columns.map(function(column){return "<div class=\"fh-ps-skill-col\">"+column.map(function(entry){return skillRow(skillInfo(entry[0],ch));}).join("")+"</div>";}).join("");
    var tools=Object.keys(ch.skills).map(function(name){return skillInfo(name,ch);}).filter(function(info){return info.name.indexOf("Tool - ")===0&&info.tier!=="none";}).sort(function(a,b){var ai=TOOL_ORDER[a.name],bi=TOOL_ORDER[b.name];if(ai==null)ai=999;if(bi==null)bi=999;return ai-bi||a.name.localeCompare(b.name);});
    var toolHtml=tools.length?tools.map(function(info){return skillRow(info,info.name.replace(/^Tool - /,""));}).join(""):"<p class=\"fh-ps-no-tools\">No purchased tools.</p>";
    return "<section class=\"fh-ps-skill-board fh-ps-card\"><div class=\"fh-ps-board-title\"><div><p>ALL 26 CHECKS + PURCHASED TOOLS</p><h2>Skills</h2></div><span>Click = flat roll · ⚙ = advanced roll</span></div><div class=\"fh-ps-four-columns\">"+skillColumns+"<div class=\"fh-ps-skill-col fh-ps-tools-col\">"+toolHtml+"</div></div></section>";
  }
  function addTrayDie(sides){
    sides=Number(sides);var d20Count=state.traySelection.filter(function(s){return s===20;}).length,extraCount=state.traySelection.filter(function(s){return s!==20;}).length;
    if((sides===20&&d20Count>=2)||(sides!==20&&extraCount>=3)){pushEvent(sides===20?"The tray holds at most two d20s":"The tray holds at most three bonus dice","warn",false);refreshEventPanel();return;}
    state.traySelection.push(sides);state.trayResults=[];persistPlayState();render();
  }
  function removeTrayDie(index){state.traySelection.splice(Number(index),1);state.trayResults=[];persistPlayState();render();}
  function rollTrayDice(){
    if(!state.traySelection.length)state.traySelection=[20];
    var dice=state.traySelection.map(function(sides){return {sides:sides,result:rollDie(sides)};}),entry={id:uuid(),kind:"tray",name:"Dice Tray",dice:dice,total:dice.reduce(function(sum,die){return sum+die.result;},0),createdAt:new Date().toISOString(),outcome:"Free roll"};
    addHistory(entry);setTrayFromEntry(entry);var special=dice.find(function(die){return die.sides===20&&(die.result===1||die.result===20);});pushEvent(special?(special.result===20?"NATURAL 20 IN THE TRAY":"NATURAL 1 IN THE TRAY"):("Dice tray · "+dice.map(function(d){return "d"+d.sides+"="+d.result;}).join(" · ")),special?(special.result===20?"nat20":"nat1"):"roll",false,entry.id);render();
  }
  function visualDie(die,index){
    var classes=["fh-ps-visual-die","die-d"+die.sides];if(die.dropped)classes.push("is-dropped");if(die.result==null)classes.push("is-ready");if(die.sides===20&&die.result===1)classes.push("is-nat1");if(die.sides===20&&die.result===20)classes.push("is-nat20");if(die.special)classes.push("is-"+die.special);
    return "<span class=\"fh-ps-die-wrap\"><span class=\""+classes.join(" ")+"\" style=\"--die-index:"+(index||0)+"\"><small>d"+die.sides+"</small><b>"+(die.result==null?"?":die.result)+"</b></span><em>"+esc(die.label||("d"+die.sides))+"</em></span>";
  }
  function renderDiceStage(entry,cfg) {
    var dice=[];
    if(entry&&entry.kind==="destiny"){
      dice.push("<span class=\"fh-ps-visual-die is-destiny "+(entry.destiny.criticalSuccess?"is-nat20":entry.destiny.criticalFailure?"is-nat1":"")+"\"><small>d"+entry.destiny.sides+"</small><b>"+entry.destiny.result+"</b></span>");
    }else if(entry&&entry.kind==="d20"){
      var keptIndex=0;
      if(entry.d20Mode==="advantage")keptIndex=entry.d20s.indexOf(Math.max.apply(Math,entry.d20s));
      else if(entry.d20Mode==="disadvantage")keptIndex=entry.d20s.indexOf(Math.min.apply(Math,entry.d20s));
      (entry.d20s||[]).forEach(function(value,index){
        var classes=index===keptIndex?"is-kept":"is-dropped";
        if(value===1)classes+=" is-nat1";if(value===20)classes+=" is-nat20";
        dice.push("<span class=\"fh-ps-visual-die "+classes+"\"><small>d20</small><b>"+value+"</b></span>");
      });
      if(entry.transformed)dice.push("<i class=\"fh-ps-fate-arrow\">→</i><span class=\"fh-ps-visual-die is-kept is-nat20 is-transformed\"><small>FATE</small><b>20</b></span>");
    }else{
      var count=cfg&&cfg.d20Mode!=="flat"?2:1;
      for(var i=0;i<count;i++)dice.push("<span class=\"fh-ps-visual-die is-ready\"><small>d20</small><b>?</b></span>");
    }
    var label=entry?(entry.name+" · "+(entry.outcome||("Total "+entry.total))):"Ready to roll";
    return "<div class=\"fh-ps-dice-stage\" aria-live=\"polite\"><div>"+dice.join("")+"</div><p>"+esc(label)+"</p></div>";
  }
  function renderEventContent(){
    var prompt=state.trayPrompt;
    if(prompt&&prompt.type==="destiny"){
      var die=state.destiny.dice.find(function(item){return item.id===prompt.dieId&&item.available;});
      if(die)return "<div class=\"fh-ps-event-special is-destiny\"><div class=\"fh-ps-event-icon\">d"+die.sides+"</div><b>Spend this Destiny die?</b><p>Current Points "+state.destiny.points+" · the result changes Destiny.</p><div><button data-tray-cancel>Cancel</button><button class=\"is-primary\" data-tray-confirm-destiny>Roll</button></div></div>";
    }
    if(prompt&&prompt.type==="nat1")return "<div class=\"fh-ps-event-special is-nat1\"><div class=\"fh-ps-event-icon\">1</div><b>Do you accept your fate?</b><p>Yes: critical failure +1 Destiny · No: 20, then Chaos.</p><div><button data-tray-accept-fate>Yes</button><button class=\"is-danger\" data-tray-refuse-fate>No</button></div></div>";
    if(prompt&&prompt.type==="chaos"){
      var chaosEntry=state.history.find(function(item){return item.id===prompt.entryId;}),roll=chaosEntry&&chaosEntry.chaosRoll||[0,0],total=roll[0]+roll[1];
      return "<div class=\"fh-ps-event-special is-chaos\"><div class=\"fh-ps-chaos-pair\"><i>"+roll[0]+"</i><i>"+roll[1]+"</i><strong>"+total+"</strong></div><b>Chaos has noticed.</b><p>The d20 becomes 20 · Destiny becomes 0.</p><div><a href=\"../chapters/chaos-tables/\">Chaos table</a><button data-tray-close>OK</button></div></div>";
    }
    if(prompt&&prompt.type==="awakening"){
      var arcana=state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};
      return "<div class=\"fh-ps-event-special is-awakening\"><div class=\"fh-ps-awakening-mark\">✦</div><b>Arcane Awakening</b><p>Natural 20 · Destiny 0 · "+esc(arcana.name||"Major Arcana")+"</p><div><button class=\"is-primary\" data-tray-close>OK</button></div></div>";
    }
    if(state.currentEvent)return "<div class=\"fh-ps-event-flash is-"+esc(state.currentEvent.kind)+"\"><span>"+(state.currentEvent.kind==="gain"||state.currentEvent.kind==="die-gain"?"↑":state.currentEvent.kind==="loss"||state.currentEvent.kind==="die-loss"?"↓":"✦")+"</span><b>"+esc(state.currentEvent.text)+"</b><button data-event-ok>OK</button></div>";
    var log=state.events.slice(0,10);
    return "<div class=\"fh-ps-event-log\"><h3>Last 10 events</h3>"+(log.length?log.map(function(event){var tag=event.entryId?"button":"div";return "<"+tag+" class=\"is-"+esc(event.kind)+"\""+(event.entryId?" data-history-id=\""+esc(event.entryId)+"\"":"")+"><time>"+nowLabel(event.createdAt)+"</time><span>"+esc(event.text)+"</span></"+tag+">";}).join(""):"<p>No events yet.</p>")+"</div>";
  }
  function renderEventZone(){return "<section class=\"fh-ps-event-zone fh-ps-card\" aria-live=\"polite\">"+renderEventContent()+"</section>";}
  function renderDiceTray() {
    var dice=state.trayResults.length?state.trayResults:state.traySelection.map(function(sides){return {sides:sides,result:null,label:"d"+sides};});
    var selected=state.traySelection.map(function(sides,index){return "<button data-remove-tray-die=\""+index+"\">d"+sides+" ×</button>";}).join("");
    var calls=[4,6,8,10,12,20,100].map(function(sides){return "<button data-add-tray-die=\""+sides+"\">d"+sides+"</button>";}).join("");
    return "<section class=\"fh-ps-dice-tray fh-ps-card\"><div class=\"fh-ps-dice-tray-head\"><div><p>DICE TRAY</p><h2>Up to 2d20 + 3 bonus dice</h2></div><button data-roll-tray>Roll all</button></div><div class=\"fh-ps-tray-dice\">"+dice.map(visualDie).join("")+"</div><div class=\"fh-ps-tray-selected\">"+(selected||"<span>Empty tray</span>")+"</div><div class=\"fh-ps-tray-calls\">"+calls+"</div></section>";
  }
  function renderDestiny(ch) {
    var arcana=ch.destinyBuild&&ch.destinyBuild.arcana||{};
    var dice=DIE_SEQUENCE.map(function(sides){
      var matching=state.destiny.dice.filter(function(die){return die.sides===sides;}),available=matching.filter(function(die){return die.available;}),die=available[0];
      return "<div class=\"fh-ps-destiny-group\"><div class=\"fh-ps-pool-stack\"><button type=\"button\" data-destiny-pool=\""+sides+":1\" "+(available.length>=3?"disabled":"")+" aria-label=\"Add one d"+sides+"\">+</button><button type=\"button\" data-destiny-pool=\""+sides+":-1\" "+(available.length?"":"disabled")+" aria-label=\"Remove one d"+sides+"\">−</button></div><button type=\"button\" class=\"fh-ps-destiny-die "+(die?"is-full":"is-empty")+"\" "+(die?"data-destiny-die=\""+die.id+"\"":"disabled")+" aria-label=\""+(die?"Roll":"No")+" Destiny d"+sides+"\"><span>d"+sides+(available.length>1?"<small>×"+available.length+"</small>":"")+"</span></button></div>";
    }).join("");
    return "<section class=\"fh-ps-destiny fh-ps-card\"><div class=\"fh-ps-destiny-head\"><div><p>DESTINY · "+esc(arcana.name||"Major Arcana")+"</p><h2>Pool &amp; score</h2></div></div><div class=\"fh-ps-destiny-values\"><label><span>Points</span><div><button data-destiny-step=\"points:-1\">−</button><input data-destiny-field=\"points\" type=\"number\" value=\""+state.destiny.points+"\"><button data-destiny-step=\"points:1\">+</button></div></label><label><span>Max</span><div><button data-destiny-step=\"score:-1\">−</button><input data-destiny-field=\"score\" type=\"number\" value=\""+state.destiny.score+"\"><button data-destiny-step=\"score:1\">+</button></div></label></div><div class=\"fh-ps-destiny-dice\">"+dice+"</div><button type=\"button\" id=\"fhPsLongRest\">Rest +1</button></section>";
  }
  function renderHistoryEntry(entry) {
    var dice=entry.kind==="d20"?(entry.d20s||[]).join("/"):"d"+(entry.destiny&&entry.destiny.sides||"");
    var badges=[]; if(entry.d20Mode&&entry.d20Mode!=="flat")badges.push(entry.d20Mode);if(entry.plusTwo)badges.push("+2");if(entry.guidance)badges.push("Guidance");if(entry.bardic)badges.push("Bardic");if(entry.destiny)badges.push("Destiny");if(entry.adjusted)badges.push("Adjusted");
    return "<button type=\"button\" class=\"fh-ps-history-row\" data-history-id=\""+entry.id+"\" "+(entry.kind==="d20"?"":"disabled")+"><time>"+nowLabel(entry.createdAt)+"</time><span><b>"+esc(entry.name)+"</b><small>"+esc(badges.join(" · ")||dice)+"</small></span><strong>"+entry.total+"</strong><i>"+esc(entry.outcome||"")+"</i></button>";
  }
  function configFromEntry(entry) {
    return {editingId:entry.id,name:entry.name,ability:entry.ability,baseBonus:entry.baseBonus,d20Mode:entry.d20Mode||"flat",plusTwo:!!entry.plusTwo,guidance:!!entry.guidance,bardic:!!entry.bardic,bardicSides:entry.bardic?entry.bardic.sides:Number(state.prefs.bardicSides)||6,destinyDieId:"",destinyConfirmed:false,custom:Number(entry.custom)||0,dc:entry.dc,note:entry.note||""};
  }
  function renderConsole() {
    var cfg=state.rollConfig,entry=cfg&&cfg.editingId?state.history.find(function(item){return item.id===cfg.editingId;}):null;
    if(!cfg) return "<section class=\"fh-ps-roll-zone fh-ps-console-panel\"><button class=\"fh-ps-console-toggle\" id=\"fhPsOpenConsole\" type=\"button\"><span>⚄</span><b>Roll Console</b><small>Open advanced options</small></button><p class=\"fh-ps-console-idle\">Click any skill to roll flat, or use ⚙ to configure disadvantage, +2, advantage and bonus dice.</p></section>";
    var locked=!!entry;
    var mode=cfg.d20Mode==="flat"&&cfg.plusTwo?"plus2":cfg.d20Mode;
    var modeButtons=[["disadvantage","Disadv."],["flat","Flat"],["plus2","+2"],["advantage","Advantage"]].map(function(item){return "<button type=\"button\" data-roll-mode=\""+item[0]+"\" class=\""+(mode===item[0]?"is-on":"")+"\" "+(locked?"disabled":"")+">"+item[1]+"</button>";}).join("");
    var availableDice=DIE_SEQUENCE.map(function(sides){return state.destiny.dice.filter(function(die){return die.available&&die.sides===sides;});}).filter(function(group){return group.length;});
    var destinyOptions="<option value=\"\">No Destiny die</option>"+availableDice.map(function(group){var die=group[0];return "<option value=\""+die.id+"\" "+(cfg.destinyDieId===die.id?"selected":"")+">d"+die.sides+(group.length>1?" ×"+group.length:"")+" · available</option>";}).join("");
    if(entry&&entry.destiny)destinyOptions="<option selected value=\"\">d"+entry.destiny.sides+" = "+entry.destiny.result+" · spent</option>";
    var d20Display=entry?"<div class=\"fh-ps-locked-dice\"><span>🔒 Original d20 "+entry.d20s.join(" / ")+(entry.transformed?" · Fate changed 1 → 20":"")+"</span><b>Kept "+entry.kept+"</b></div>":"";
    var breakdown=entry?renderBreakdown(entry):"";
    return "<section class=\"fh-ps-roll-zone fh-ps-console-panel is-open\"><div class=\"fh-ps-console-head\"><div><p>ROLL CONSOLE</p><h2>"+esc(cfg.name)+" <strong>"+signed(cfg.baseBonus)+"</strong></h2><small>"+esc(cfg.note||cfg.ability||"")+"</small></div><button id=\"fhPsCloseConsole\" type=\"button\" aria-label=\"Close roll console\">×</button></div>"+d20Display+"<div class=\"fh-ps-roll-modes\">"+modeButtons+"</div><div class=\"fh-ps-extras\"><label><input id=\"fhPsPlusTwo\" type=\"checkbox\" "+(cfg.plusTwo?"checked":"")+"> FH bonus <b>+2</b></label><label><input id=\"fhPsGuidance\" type=\"checkbox\" "+(cfg.guidance?"checked":"")+"> Guidance <b>d4"+(entry&&entry.guidance?" = "+entry.guidance.result:"")+"</b></label><label><input id=\"fhPsBardic\" type=\"checkbox\" "+(cfg.bardic?"checked":"")+"> Bardic <select id=\"fhPsBardicSides\" "+(entry&&entry.bardic?"disabled":"")+">"+[6,8,10,12].map(function(s){return "<option value=\""+s+"\" "+(cfg.bardicSides===s?"selected":"")+">d"+s+(entry&&entry.bardic&&entry.bardic.sides===s?" = "+entry.bardic.result:"")+"</option>";}).join("")+"</select></label><label>Destiny <select id=\"fhPsDestinyDie\" "+(entry&&entry.destiny?"disabled":"")+">"+destinyOptions+"</select></label><label>Modifier <input id=\"fhPsCustom\" type=\"number\" value=\""+cfg.custom+"\"></label><label>DC <input id=\"fhPsDc\" type=\"number\" min=\"0\" value=\""+esc(cfg.dc)+"\" placeholder=\"—\"></label></div><div class=\"fh-ps-console-actions\"><button class=\"fh-ps-roll-button\" id=\"fhPsRunRoll\" type=\"button\">"+(locked?"Apply adjustments":"Roll")+"</button>"+(locked?"<button id=\"fhPsRepeatRoll\" type=\"button\">Repeat setup</button>":"")+"</div>"+breakdown+"</section>";
  }
  function renderRollWorkbench(){return "<section class=\"fh-ps-roll-workbench\">"+renderConsole()+renderEventZone()+renderDiceTray()+"</section>";}
  function renderBreakdown(entry) {
    var lines=["<span><small>Kept d20</small><b>"+entry.kept+"</b></span>","<span><small>Base bonus</small><b>"+signed(entry.baseBonus)+"</b></span>"];
    if(entry.plusTwo)lines.push("<span><small>FH bonus</small><b>+2</b></span>");if(entry.custom)lines.push("<span><small>Manual</small><b>"+signed(entry.custom)+"</b></span>");
    if(entry.guidance)lines.push("<span><small>Guidance d4</small><b>+"+entry.guidance.result+"</b></span>");if(entry.bardic)lines.push("<span><small>Bardic d"+entry.bardic.sides+"</small><b>+"+entry.bardic.result+"</b></span>");if(entry.destiny)lines.push("<span><small>Destiny d"+entry.destiny.sides+"</small><b>+"+entry.destiny.result+"</b></span>");
    var choice=entry.natural===1&&!entry.natChoice?"<div class=\"fh-ps-nat-choice\"><b>Do you accept your fate?</b><button data-nat-choice=\"accept\" data-entry-id=\""+entry.id+"\">Yes · fail &amp; +1 Destiny</button><button data-nat-choice=\"chaos\" data-entry-id=\""+entry.id+"\">No · turn it into 20</button></div>":"";
    var warnings="";if(entry.destiny&&entry.destiny.chaos)warnings="<p class=\"fh-ps-chaos\">Chaos · Overreach "+entry.destiny.chaos.overreach+" · "+entry.ability+" save DC "+entry.destiny.chaos.dc+"</p>";if(entry.awakening)warnings+="<p class=\"fh-ps-awakening\">Arcane Awakening — draw from the tarot deck.</p>";
    return "<div class=\"fh-ps-roll-result \" data-outcome=\""+esc(entry.outcome||"")+"\"><div>"+lines.join("")+"</div><strong>"+entry.total+"</strong><p>"+esc(entry.outcome||"")+(entry.dc!==""?" · DC "+esc(entry.dc):"")+"</p></div>"+choice+warnings;
  }
  function renderMessage() { var box=root&&root.querySelector("#fhPsMessage");if(!box)return;box.className="fh-ps-message "+(state.messageKind?"is-"+state.messageKind:"");box.textContent=state.message||""; }

  function contextRollRow(name,ch,extra,note,dc){var info=skillInfo(name,ch,extra||0);return "<div class=\"fh-ps-context-roll\"><div><b>"+esc(name)+"</b><small>"+info.ability+" · "+esc(note||TIER_LABEL[info.tier])+"</small></div><strong>"+signed(info.bonus)+"</strong><button data-quick-name=\""+esc(name)+"\" data-ability=\""+info.ability+"\" data-bonus=\""+info.bonus+"\">Roll</button><button data-config-name=\""+esc(name)+"\" data-ability=\""+info.ability+"\" data-bonus=\""+info.bonus+"\" data-note=\""+esc(note||"")+"\" data-dc=\""+(dc!=null?dc:"")+"\">⚙</button></div>";}
  function renderLoop(ch) {
    var knowledge=KNOWLEDGE[state.target]||["Arcana"],specialist=knowledge.some(function(name){return TIERS[skillInfo(name,ch).tier]>=1;}),dc=12+crNumber(state.cr),harvestExtra=specialist?2:0;
    var creatureOptions=CREATURES.map(function(name){return "<option "+(name===state.target?"selected":"")+">"+name+"</option>";}).join("");
    var spells=ch.spells.map(function(s){return s.name.toLowerCase();}),hasIdentify=ch.preparation.identify||spells.indexOf("identify")>=0,hasTransfer=ch.preparation.transferEssence||spells.indexOf("transfer essence")>=0;
    return "<div class=\"fh-ps-context-intro\"><p>SOULFORGING LOOP</p><h2>From creature to artifact</h2><span>Choose the target once; every check is prepared from the live character sheet.</span></div><div class=\"fh-ps-target\"><label>Creature type<select id=\"fhPsTarget\">"+creatureOptions+"</select></label><label>CR<input id=\"fhPsCr\" value=\""+esc(state.cr)+"\"></label></div><section class=\"fh-ps-step\"><i>1</i><h3>Identify</h3><p>Use the appropriate Specialist Knowledge.</p>"+knowledge.map(function(name){return contextRollRow(name,ch,0,state.target+" lore");}).join("")+"</section><section class=\"fh-ps-step\"><i>2</i><h3>Harvest</h3><p>DC 12 + CR · +1 part for every 5 above the DC.</p>"+contextRollRow("Hunting",ch,harvestExtra,specialist?"specialist synergy +2":"no specialist synergy",dc)+"</section><section class=\"fh-ps-step\"><i>3</i><h3>Prepare</h3><p class=\"fh-ps-readiness\"><span class=\""+(hasTransfer?"is-ready":"")+"\">"+(hasTransfer?"✓":"○")+" Transfer Essence</span><span class=\""+(hasIdentify?"is-ready":"")+"\">"+(hasIdentify?"✓":"○")+" Identify</span></p></section><section class=\"fh-ps-step\"><i>4</i><h3>Soulforge</h3><p>Assemble a Structure, Soulgem and identified Catalyst.</p>"+contextRollRow("Tool - Soulforging",ch,0,"forge check")+"<a class=\"fh-ps-primary-link\" href=\""+esc(toolUrl("soulforge","../soulforge-tool.html"))+"\">Open full workshop →</a></section>";
  }
  function renderInventoryContext() {
    if(state.inventory===null)return "<div class=\"fh-ps-context-loading\">Loading campaign inventory…</div>";
    if(state.inventory&&state.inventory.error)return "<div class=\"fh-ps-context-loading\">"+esc(state.inventory.error)+"<a class=\"fh-ps-primary-link\" href=\""+esc(toolUrl("inventory","../party-inventory.html"))+"\">Open full inventory →</a></div>";
    var items=state.inventory&&state.inventory.items||[],groups={raw:[],part:[],other:[]};items.forEach(function(item){(groups[item.kind]||groups.other).push(item);});
    function group(title,list){return "<section class=\"fh-ps-inv-group\"><h3>"+title+" <span>"+list.length+"</span></h3>"+(list.length?list.slice(0,12).map(function(item){return "<div><b>"+esc(item.name)+"</b><small>"+esc([item.creature,item.partType,item.stage,item.owner].filter(Boolean).join(" · "))+"</small>"+(item.pp!=null?"<strong>"+item.pp+" PP</strong>":"")+"</div>";}).join(""):"<p>Nothing here.</p>")+"</section>";}
    return "<div class=\"fh-ps-context-intro\"><p>CAMPAIGN INVENTORY</p><h2>Everything ready for the table</h2><span>Quick view of ingredients and parts. Use the full inventory to edit or move items.</span></div>"+group("Raw ingredients",groups.raw)+group("Forgable parts",groups.part)+group("Other equipment",groups.other)+"<a class=\"fh-ps-primary-link\" href=\""+esc(toolUrl("inventory","../party-inventory.html"))+"\">Open full inventory →</a>";
  }
  function renderForgeContext(ch) {
    var forge=skillInfo("Tool - Soulforging",ch),items=state.inventory&&state.inventory.items||[],parts=items.filter(function(item){return item.kind==="part";});
    return "<div class=\"fh-ps-context-intro\"><p>SOULFORGE</p><h2>Prepare the workbench</h2><span>Your current character remains the active forger when the workshop opens.</span></div><div class=\"fh-ps-forger\"><span>Active forger</span><b>"+esc(ch.name)+"</b><small>CHA "+ch.abilities.CHA+" · PB +"+ch.pb+" · "+esc(TIER_LABEL[forge.tier])+"</small><strong>"+signed(forge.bonus)+"</strong></div><section class=\"fh-ps-inv-group\"><h3>Ready parts <span>"+parts.length+"</span></h3>"+(parts.length?parts.slice(0,16).map(function(item){return "<div><b>"+esc(item.name)+"</b><small>"+esc([item.partType,item.stage,item.creature].filter(Boolean).join(" · "))+"</small>"+(item.pp!=null?"<strong>"+item.pp+" PP</strong>":"")+"</div>";}).join(""):"<p>Prepare ingredients in Party Inventory first.</p>")+"</section>"+contextRollRow("Tool - Soulforging",ch,0,"forge check")+"<a class=\"fh-ps-primary-link\" href=\""+esc(toolUrl("soulforge","../soulforge-tool.html"))+"\">Open full Soulforge →</a>";
  }
  function tierOptions(current){return [["none","Untrained"],["half","Half"],["proficient","Proficient"],["expert","Expert"]].map(function(option){return "<option value=\""+option[0]+"\" "+(current===option[0]?"selected":"")+">"+option[1]+"</option>";}).join("");}
  function renderCorrections(ch){
    var skills=SKILLS.map(function(entry){var info=skillInfo(entry[0],ch);return "<label><span>"+esc(entry[0])+"</span><select data-manual-skill=\""+esc(entry[0])+"\">"+tierOptions(info.tier)+"</select></label>";}).join("");
    var tools=TOOLS.map(function(entry){var name="Tool - "+entry[0],info=skillInfo(name,ch);return "<label><span>"+esc(entry[0])+" <small>"+entry[1]+"</small></span><select data-manual-tool=\""+esc(name)+"\">"+tierOptions(info.tier)+"</select></label>";}).join("");
    return "<div class=\"fh-ps-context-intro\"><p>MANUAL CORRECTIONS</p><h2>Imported character data</h2><span>These overrides apply after every DDB sync. Skills and tools always retain the canonical Fate's Hand order.</span></div><section class=\"fh-ps-corrections\"><label class=\"fh-ps-ac-fix\"><span>Armor Class</span><input id=\"fhPsManualAc\" type=\"number\" min=\"0\" max=\"99\" value=\""+(ch.armorClass==null?"":ch.armorClass)+"\" placeholder=\"—\"></label><h3>26 Skills</h3><div class=\"fh-ps-correction-grid\">"+skills+"</div><h3>Tools</h3><div class=\"fh-ps-correction-grid\">"+tools+"</div><button id=\"fhPsSaveCorrections\" type=\"button\">Save corrections</button><p id=\"fhPsCorrectionStatus\"></p></section>";
  }
  function saveCorrections(){
    var skills={},toolTiers={};root.querySelectorAll("[data-manual-skill]").forEach(function(select){skills[select.dataset.manualSkill]=select.value;});root.querySelectorAll("[data-manual-tool]").forEach(function(select){toolTiers[select.dataset.manualTool]=select.value;});
    var ac=root.querySelector("#fhPsManualAc"),manualOverrides={armorClass:ac&&ac.value!==""?Number(ac.value):null,skills:skills,toolTiers:toolTiers};
    var status=root.querySelector("#fhPsCorrectionStatus");if(status)status.textContent="Saving…";
    saveProfile({manualOverrides:manualOverrides}).then(function(){state.character=effectiveCharacter();pushEvent("Manual AC, skills and tools saved","corrected",false);render();}).catch(function(error){var box=root.querySelector("#fhPsCorrectionStatus");if(box)box.textContent="Could not save: "+error.message;});
  }
  function renderContext(ch) {
    var content=state.activeContext==="inventory"?renderInventoryContext():state.activeContext==="forge"?renderForgeContext(ch):state.activeContext==="edit"?renderCorrections(ch):renderLoop(ch);
    return "<aside class=\"fh-ps-right\">"+renderAccessPanel()+"<header><span>"+esc(state.activeContext==="inventory"?"INVENTORY":state.activeContext==="forge"?"SOULFORGE":state.activeContext==="edit"?"CHARACTER CORRECTIONS":"SOULFORGING LOOP")+"</span><small>TEMPORARY PANEL</small></header><div class=\"fh-ps-context-body\">"+content+"</div></aside>";
  }
  function toolUrl(kind,fallback){var raw=root&&root.dataset&&root.dataset[kind]||fallback;try{var url=new URL(raw,window.location.href);if(state.code&&(kind==="inventory"||kind==="soulforge"))url.searchParams.set("campaign",state.code);return url.href;}catch(e){return raw;}}

  function renderTopbar() {
    var partyOptions="<option value=\"\">— character —</option>"+state.party.map(function(name){return "<option value=\""+esc(name)+"\" "+(name===state.pseudo?"selected":"")+">"+esc(name)+"</option>";}).join("");
    return "<header class=\"fh-ps-topbar\"><a href=\""+esc(toolUrl("rules","../"))+"\"><span>FH</span><b>Fate's Hand</b></a><div><label>Campaign<input id=\"fhPsCode\" value=\""+esc(state.code)+"\" placeholder=\"Campaign code\"></label><label>Character<select id=\"fhPsWho\">"+partyOptions+"</select></label><button id=\"fhPsLoad\" type=\"button\">Load</button></div><p id=\"fhPsMessage\" class=\"fh-ps-message\"></p></header>";
  }
  function renderAccessPanel(){
    var partyOptions="<option value=\"\">— character —</option>"+state.party.map(function(name){return "<option value=\""+esc(name)+"\" "+(name===state.pseudo?"selected":"")+">"+esc(name)+"</option>";}).join("");
    return "<section class=\"fh-ps-access "+(state.chromeOpen?"is-open":"")+"\"><button id=\"fhPsChromeToggle\" type=\"button\"><span>FH</span><b>"+esc(state.code||"Campaign")+" · "+esc(state.pseudo||"Character")+"</b><i>"+(state.chromeOpen?"▲":"▼")+"</i></button>"+(state.chromeOpen?"<div><label>Campaign<input id=\"fhPsCode\" value=\""+esc(state.code)+"\" placeholder=\"Campaign code\"></label><label>Character<select id=\"fhPsWho\">"+partyOptions+"</select></label><button id=\"fhPsLoad\" type=\"button\">Load</button><a href=\""+esc(toolUrl("rules","../"))+"\">Handbook</a></div>":"")+"<p id=\"fhPsMessage\" class=\"fh-ps-message\"></p></section>";
  }
  function renderRail(){
    return "<nav class=\"fh-ps-rail\" aria-label=\"Player panels\"><button data-context=\"inventory\" class=\""+(state.activeContext==="inventory"?"is-active":"")+"\"><span>▣</span><b>Inventory</b></button><button data-context=\"loop\" class=\""+(state.activeContext==="loop"?"is-active":"")+"\"><span>◇</span><b>Soulforging Loop</b></button><button data-context=\"forge\" class=\""+(state.activeContext==="forge"?"is-active":"")+"\"><span>⚒</span><b>Soulforge</b></button><button data-context=\"edit\" class=\""+(state.activeContext==="edit"?"is-active":"")+"\"><span>✎</span><b>Correct sheet</b></button><a href=\""+esc(toolUrl("rules","../"))+"\"><span>⌕</span><b>Rules</b></a></nav>";
  }
  function render() {
    if(!root)return;
    var top=renderTopbar();
    if(state.loading){root.innerHTML="<div class=\"fh-ps-app\">"+top+"<div class=\"fh-ps-loading\">Loading the character sheet…</div></div>";renderMessage();return;}
    if(!state.record||!state.character){root.innerHTML="<div class=\"fh-ps-app\">"+top+"<div class=\"fh-ps-welcome\"><span>⚔</span><h1>Player Companion</h1><p>Enter the campaign code and choose a character. D&D Beyond remains the source for the standard sheet; this page runs the Fate's Hand layer.</p></div></div>";renderMessage();return;}
    var ch=state.character;
    root.innerHTML="<div class=\"fh-ps-app\"><div class=\"fh-ps-layout\">"+renderRail()+"<main class=\"fh-ps-left\">"+renderIdentity(ch)+renderStats(ch)+renderSkills(ch)+renderDestiny(ch)+renderRollWorkbench()+"</main>"+renderContext(ch)+"</div></div>";
    renderMessage();
    if((state.activeContext==="inventory"||state.activeContext==="forge")&&state.inventory===null)loadInventory();
  }

  function syncConsoleInputs(){if(!state.rollConfig)return;var q=function(id){return root.querySelector(id);},cfg=state.rollConfig;var plusTwo=q("#fhPsPlusTwo"),guidance=q("#fhPsGuidance"),bardic=q("#fhPsBardic"),sides=q("#fhPsBardicSides"),destiny=q("#fhPsDestinyDie"),custom=q("#fhPsCustom"),dc=q("#fhPsDc");if(plusTwo)cfg.plusTwo=plusTwo.checked;if(guidance)cfg.guidance=guidance.checked;if(bardic)cfg.bardic=bardic.checked;if(sides){cfg.bardicSides=Number(sides.value)||6;state.prefs.bardicSides=cfg.bardicSides;}if(destiny&&cfg.destinyDieId!==destiny.value){cfg.destinyDieId=destiny.value;cfg.destinyConfirmed=false;}if(custom)cfg.custom=Number(custom.value)||0;if(dc)cfg.dc=dc.value;}
  function openConfig(name,ability,bonus,note,dc){state.rollConfig=rollInput(name,ability,bonus,{note:note,dc:dc});state.message="Advanced roller opened for "+name+".";state.messageKind="roll";render();window.setTimeout(function(){var zone=root.querySelector(".fh-ps-roll-zone"),roll=root.querySelector("#fhPsRunRoll");if(zone&&zone.scrollIntoView)zone.scrollIntoView({behavior:"smooth",block:"center"});if(roll&&roll.focus)roll.focus({preventScroll:true});},0);}
  function loadInventory(){if(!state.code)return;state.inventory={loading:true};api("/inv/"+encodeURIComponent(state.code)).then(function(data){state.inventory=data;render();}).catch(function(error){state.inventory={error:"Could not load inventory: "+error.message};render();});}
  function loadParty(){var input=root.querySelector("#fhPsCode"),code=(input?input.value:state.code).trim();state.code=code;state.party=[];state.record=null;state.character=null;state.pseudo="";state.inventory=null;state.loading=!!code;render();if(!code)return;try{localStorage.setItem("fh-my-campcode",code);}catch(e){}api("/party/"+encodeURIComponent(code)).then(function(data){state.party=(data.builds||[]).map(function(entry){return entry.pseudo;}).sort();var last="";try{last=localStorage.getItem("fh-my-pseudo")||"";}catch(e){}state.loading=false;if(state.party.indexOf(last)>=0){state.pseudo=last;loadBuild();}else render();}).catch(function(error){state.loading=false;state.message=error.message||"Could not reach the campaign server.";state.messageKind="danger";render();});}
  function loadBuild(){var who=state.pseudo;if(!state.code||!who)return;state.loading=true;render();try{localStorage.setItem("fh-my-pseudo",who);}catch(e){}Promise.all([api("/party/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)),api("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)).catch(function(){return {profile:emptyProfile()};})]).then(function(results){state.record=results[0];state.profile=results[1].profile||emptyProfile();state.character=effectiveCharacter();loadPlayState(state.character);state.loading=false;state.inventory=null;state.message="";render();}).catch(function(error){state.loading=false;state.record=null;state.character=null;state.message=error.message||"Could not load this character.";state.messageKind="danger";render();});}

  function showModal(html){var overlay=document.createElement("div");overlay.className="fh-mc-modal-wrap";overlay.innerHTML="<div class=\"fh-mc-modal\" role=\"dialog\" aria-modal=\"true\"><button class=\"fh-mc-modal-x\" type=\"button\" aria-label=\"Close\">×</button>"+html+"</div>";function close(){overlay.remove();}overlay.addEventListener("click",function(event){if(event.target===overlay||event.target.closest(".fh-mc-modal-x"))close();});document.body.appendChild(overlay);return {element:overlay,close:close};}
  function confirmDestinyUse(dieId,context,onConfirm){
    var die=state.destiny.dice.find(function(item){return item.id===dieId&&item.available;});
    if(!die){state.message="That Destiny die is no longer available.";state.messageKind="danger";renderMessage();return;}
    state.trayPrompt={type:"destiny",dieId:dieId,context:context||"Spend this Destiny die",onConfirm:onConfirm};render();
    window.setTimeout(function(){var zone=root&&root.querySelector(".fh-ps-event-zone");if(zone&&zone.scrollIntoView)zone.scrollIntoView({behavior:"smooth",block:"nearest"});},0);
  }
  function announceRoll(entry){
    if(!entry||entry.kind!=="d20")return;
    if(entry.natural===1&&!entry.natChoice)window.setTimeout(function(){showNatOnePrompt(entry.id);},180);
    else if(entry.awakening)window.setTimeout(function(){showAwakening(entry);},350);
  }
  function showNatOnePrompt(id){
    var entry=state.history.find(function(item){return item.id===id;});if(!entry||entry.natural!==1||entry.natChoice)return;
    state.trayPrompt={type:"nat1",entryId:id};render();
  }
  function showChaosModal(entry){
    if(!entry||!entry.chaosRoll)return;state.trayPrompt={type:"chaos",entryId:entry.id};render();
  }
  function showAwakening(entry){
    if(!entry)return;state.trayPrompt={type:"awakening",entryId:entry.id};render();
  }
  function friendlyPullError(error){if(error&&error.status===404)return "D&D Beyond could not open this sheet. Confirm that it is public or shared.";if(error&&(error.status===502||error.status===503||error.status===504))return "D&D Beyond did not answer in time. Wait a moment, then try Sync again.";if(error&&error.status===403)return "Check the campaign code and confirm that the D&D Beyond sheet is shared.";return error&&error.message||"The D&D Beyond pull failed.";}
  function openPull(force){if(!force&&state.profile&&state.profile.ddbLinked){pullDdb(null);return;}var modal=showModal("<p class=\"fh-mc-modal-kicker\">D&D BEYOND</p><h3>Connect the public sheet</h3><p>Paste a public character link, a Shareable Link or the numeric character ID.</p><label><span>D&D Beyond character link</span><input id=\"fhPsDdbUrl\" type=\"text\" inputmode=\"url\" placeholder=\"https://www.dndbeyond.com/characters/123456789\"></label><p class=\"fh-mc-modal-note\">Only the stable numeric character ID is retained for later syncs.</p><p class=\"fh-mc-modal-error\" id=\"fhPsPullError\"></p><button class=\"fh-mc-modal-save\" id=\"fhPsPullSave\">Connect & Pull</button>");var input=modal.element.querySelector("#fhPsDdbUrl");modal.element.querySelector("#fhPsPullSave").onclick=function(){if(input.value.trim())pullDdb(input.value.trim(),modal);};input.focus();}
  function pullDdb(value,modal){var url=null;if(value){try{url=canonicalDdbUrl(value);}catch(error){modal.element.querySelector("#fhPsPullError").textContent=error.message;return;}}state.message="Syncing D&D Beyond…";state.messageKind="roll";renderMessage();post("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(state.pseudo)+"/pull",url?{shareUrl:url}:{}).then(function(data){state.profile=Object.assign({},state.profile||{},data.profile||{});state.character=effectiveCharacter();if(modal)modal.close();state.message="Character refreshed from D&D Beyond.";state.messageKind="success";render();}).catch(function(error){var message=friendlyPullError(error);if(modal)modal.element.querySelector("#fhPsPullError").textContent=message;else{state.message=message;state.messageKind="danger";render();}});}
  function openLevelUp(ch){var classes=CLASS_NAMES.slice();ch.classes.forEach(function(entry){if(classes.indexOf(entry.name)<0)classes.unshift(entry.name);});var classOptions=classes.map(function(name){return "<option "+(ch.classes[0]&&ch.classes[0].name===name?"selected":"")+">"+esc(name)+"</option>";}).join("");var statOptions="<option value=\"\">No increase</option>"+ABILITIES.map(function(key){return "<option value=\""+key+"\">"+key+" — "+ABILITY_NAMES[key]+"</option>";}).join("");var skillOptions="<option value=\"\">No skill</option>"+SKILLS.map(function(s){return "<option>"+s[0]+"</option>";}).join("");var modal=showModal("<p class=\"fh-mc-modal-kicker\">LEVEL "+(ch.level+1)+"</p><h3>What gains a level?</h3><label><span>Class</span><select id=\"fhPsLevelClass\">"+classOptions+"</select></label><div class=\"fh-mc-modal-grid\"><label><span>Ability increase 1</span><select id=\"fhPsStat1\">"+statOptions+"</select></label><label><span>Ability increase 2</span><select id=\"fhPsStat2\">"+statOptions+"</select></label></div><div class=\"fh-mc-modal-grid\"><label><span>Essential skill</span><select id=\"fhPsSkill1\">"+skillOptions+"</select></label><label><span>New tier</span><select id=\"fhPsTier1\"><option value=\"half\">Half</option><option value=\"proficient\" selected>Proficient</option><option value=\"expert\">Expert</option></select></label></div><label><span>New essential spells</span><textarea id=\"fhPsNewSpells\" placeholder=\"One per line or comma-separated\"></textarea></label><p class=\"fh-mc-modal-error\" id=\"fhPsLevelError\"></p><button class=\"fh-mc-modal-save\" id=\"fhPsLevelSave\">Apply Level Up</button>");modal.element.querySelector("#fhPsLevelSave").onclick=function(){var increases={};["#fhPsStat1","#fhPsStat2"].forEach(function(sel){var value=modal.element.querySelector(sel).value;if(value)increases[value]=(increases[value]||0)+1;});var skillName=modal.element.querySelector("#fhPsSkill1").value;var entry={id:uuid(),targetLevel:ch.level+1,className:modal.element.querySelector("#fhPsLevelClass").value,abilityIncreases:increases,essentialSkills:skillName?[{name:skillName,tier:modal.element.querySelector("#fhPsTier1").value}]:[],spells:modal.element.querySelector("#fhPsNewSpells").value.split(/[\n,]+/).map(function(x){return x.trim();}).filter(Boolean),createdAt:new Date().toISOString()};saveProfile({levelUps:(state.profile.levelUps||[]).concat([entry])}).then(function(){modal.close();state.character=effectiveCharacter();state.message="Level-up saved. PB updated automatically.";state.messageKind="success";render();}).catch(function(error){modal.element.querySelector("#fhPsLevelError").textContent=error.message;});};}

  function handleClick(event){var button=event.target.closest("button");if(!button||!root.contains(button))return;
    if(state.rollConfig)syncConsoleInputs();
    if(button.dataset.eventOk!==undefined){state.currentEvent=null;clearTimeout(state.eventTimer);refreshEventPanel();return;}
    if(button.dataset.addTrayDie!==undefined){addTrayDie(button.dataset.addTrayDie);return;}
    if(button.dataset.removeTrayDie!==undefined){removeTrayDie(button.dataset.removeTrayDie);return;}
    if(button.dataset.rollTray!==undefined){rollTrayDice();return;}
    if(button.dataset.trayCancel!==undefined||button.dataset.trayClose!==undefined){state.trayPrompt=null;render();return;}
    if(button.dataset.trayConfirmDestiny!==undefined){var destinyPrompt=state.trayPrompt,confirmAction=destinyPrompt&&destinyPrompt.onConfirm;state.trayPrompt=null;if(confirmAction)confirmAction();else render();return;}
    if(button.dataset.trayAcceptFate!==undefined||button.dataset.trayRefuseFate!==undefined){var fatePrompt=state.trayPrompt,choice=button.dataset.trayAcceptFate!==undefined?"accept":"chaos";state.trayPrompt=null;if(fatePrompt)resolveNatOne(fatePrompt.entryId,choice);return;}
    if(button.id==="fhPsChromeToggle"){state.chromeOpen=!state.chromeOpen;render();return;}
    if(button.id==="fhPsLoad"){loadParty();return;}if(button.id==="fhPsSync"){openPull(false);return;}if(button.id==="fhPsRelink"){openPull(true);return;}if(button.id==="fhPsLevel"){openLevelUp(state.character);return;}if(button.id==="fhPsCorrect"){state.activeContext="edit";render();return;}if(button.id==="fhPsSaveCorrections"){saveCorrections();return;}
    if(button.dataset.quickName){quickRoll(button.dataset.quickName,button.dataset.ability,button.dataset.bonus,button.dataset.note);return;}
    if(button.dataset.configName){openConfig(button.dataset.configName,button.dataset.ability,button.dataset.bonus,button.dataset.note,button.dataset.dc);return;}
    if(button.dataset.rollMode){if(!state.rollConfig||state.rollConfig.editingId)return;var mode=button.dataset.rollMode;state.rollConfig.plusTwo=mode==="plus2";state.rollConfig.d20Mode=mode==="plus2"?"flat":mode;render();return;}
    if(button.id==="fhPsOpenConsole"||button.dataset.openConsole){openConfig("Ability Check","STR",0,"Choose a skill row for its calculated bonus");return;}if(button.id==="fhPsCloseConsole"){state.rollConfig=null;render();return;}if(button.id==="fhPsRunRoll"){runConfiguredRoll();return;}
    if(button.id==="fhPsRepeatRoll"){var old=state.history.find(function(item){return state.rollConfig&&item.id===state.rollConfig.editingId;});if(old){state.rollConfig=rollInput(old.name,old.ability,old.baseBonus,{mode:old.d20Mode,plusTwo:old.plusTwo,dc:old.dc,note:old.note});state.rollConfig.custom=old.custom||0;render();}return;}
    if(button.dataset.historyId){var entry=state.history.find(function(item){return item.id===button.dataset.historyId;});if(entry&&entry.kind==="d20"){state.rollConfig=configFromEntry(entry);render();}return;}
    if(button.dataset.destinyDie){var dieId=button.dataset.destinyDie;confirmDestinyUse(dieId,"Roll directly from the Destiny pool",function(){standaloneDestiny(dieId);});return;}
    if(button.dataset.destinyPool){var pool=button.dataset.destinyPool.split(":");adjustDestinyDie(pool[0],pool[1]);return;}
    if(button.dataset.destinyStep){var parts=button.dataset.destinyStep.split(":"),field=parts[0],step=Number(parts[1]);updateDestinyField(field,Number(state.destiny[field])+step,"Manual correction");return;}
    if(button.id==="fhPsLongRest"){setDestinyPoints(Math.min(state.destiny.score,state.destiny.points+1),"Long rest",true);render();return;}
    if(button.dataset.natChoice){state.trayPrompt=null;resolveNatOne(button.dataset.entryId,button.dataset.natChoice);return;}
    if(button.dataset.context){state.activeContext=button.dataset.context;render();return;}
  }
  function onClick(event){try{handleClick(event);}catch(error){state.message="Roll Console error: "+(error&&error.message||"unknown error");state.messageKind="danger";pushEvent(state.message,"error",true);renderMessage();refreshEventPanel();if(window.console&&console.error)console.error(error);}}
  function onChange(event){if(/^fhPs(PlusTwo|Guidance|Bardic|BardicSides|DestinyDie|Custom|Dc)$/.test(event.target.id)){syncConsoleInputs();return;}if(event.target.id==="fhPsWho"){state.pseudo=event.target.value;if(state.pseudo)loadBuild();return;}if(event.target.id==="fhPsCode"){return;}if(event.target.dataset.destinyField){updateDestinyField(event.target.dataset.destinyField,event.target.value,"Manual correction");return;}if(event.target.id==="fhPsTarget"){state.target=event.target.value;render();return;}if(event.target.id==="fhPsCr"){state.cr=event.target.value||"0";render();return;}}
  function onKeydown(event){if(event.target.id==="fhPsCode"&&event.key==="Enter"){event.preventDefault();loadParty();}}

  document.addEventListener("DOMContentLoaded",function(){root=document.getElementById("fhPlayerSheet");if(!root)return;document.body.classList.add("fh-player-body","fh-player-sheet-body");root.addEventListener("click",onClick);root.addEventListener("change",onChange);root.addEventListener("keydown",onKeydown);try{state.code=localStorage.getItem("fh-my-campcode")||"";}catch(e){}render();if(state.code)loadParty();});
})();
