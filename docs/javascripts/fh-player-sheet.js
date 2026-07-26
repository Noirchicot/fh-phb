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
  var ROLL_DIE_SIZES = [4,6,8,10,12,20,100];
  var MAX_BONUS_DICE = 3;
  var MAX_FREE_DICE = 40;
  var LIGHTWEIGHT_DICE_THRESHOLD = 6;
  var MAX_HISTORY = 20;

  var root;
  var persistTimer = null;
  /* Where the site is served from — lets the dock link to its tools from any page. */
  var SITE_ROOT = (function () {
    try {
      var script = (typeof document !== "undefined" && document.currentScript) || null;
      if (!script && typeof document !== "undefined" && document.querySelector) script = document.querySelector('script[src*="fh-player-sheet"]');
      if (script && script.src) return String(script.src).replace(/javascripts\/fh-player-sheet\.js.*$/, "");
    } catch (error) {}
    return "";
  })();
  var TOOL_PATHS = {inventory:"party-inventory.html", soulforge:"soulforge-tool.html", rules:"", builder:"skill-builder.html"};
  var state = {
    code:"", pseudo:"", requestedPseudo:"", party:[], record:null, profile:null, character:null,
    destiny:null, history:[], events:[], prefs:{bardicSides:6}, rollConfig:null, trayPrompt:null,
    traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayLabel:"Damage roll",trayResultText:"",currentEvent:null,eventQueue:[],queueDone:"",queueTotal:0,rollSequence:null,eventTimer:null,chromeOpen:false,
    activeContext:"loop", target:"Aberration", cr:"1", inventory:null,editDraft:null,
    loading:false, message:"", messageKind:"",
    dockOpen:false, menuOpen:false, popOpen:"", diceSignature:"",
    vitals:{current:null,max:null}, hpOpen:false, scoreEditing:false, windowMode:"margin", pendingArmed:null,
    diePrompt:null, callUntil:0, callTimer:null
  };
  // The five passives shown in the vitals zone, in Eric's reading order.
  var PASSIVES = [["vigilance","Vigilance"],["delve","Delve"],["survival","Survival"],["insight","Insight"],["investigation","Investigation"]];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }
  function iconSvg(name, extraClass) {
    var icons={
      roll:'<path d="M12 2 21 7.5 18 21H6L3 7.5Z"/><path d="m12 2-4 5.5h8L12 2ZM3 7.5h18M6 21l2-13.5m10 13.5L16 7.5"/><path d="M15.8 9.1a4.5 4.5 0 1 0 1.1 6.6"/><path d="m15.5 6.9 3.4 2-3.6 1.1"/>',
      guidance:'<path d="m12 3 1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8Z"/>',
      tactical:'<path d="m14.8 3.2 6 6-3 1-4-4 1-3Z"/><path d="m15.7 8.3-8.9 8.9m-2 0 2 2m-3.4.6.8.8 3.4-3.4-1.6-1.6-3.4 3.4.8.8Z"/>',
      bardic:'<path d="M8 5v10.5a3 3 0 1 0 1.8 2.75V8l7-1.6v7.1a3 3 0 1 0 1.8 2.75V3.8L8 6.2"/>',
      destiny:'<path d="M7.2 18.5c1.8-3.8 4.1-5.7 7-5.7 1.9 0 3.3.7 4.3 2.1-1.3 3.7-4.2 5.6-8.7 5.6H5.2"/><path d="M14.5 3.7a4.2 4.2 0 1 0 4.8 6.4 4.7 4.7 0 0 1-4.8-6.4Z"/>',
      other:'<path d="M4.2 8.8 10 5.5l5.8 10-5.8 3.3Z"/><path d="M9 6.2 15.5 4l3.8 11.2-6.2 2.1"/><path d="M13.2 5.2h6.6v11.6h-6.6Z"/>',
      gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.1m0 14.2v2.1M2.8 12h2.1m14.2 0h2.1M5.5 5.5 7 7m10 10 1.5 1.5m0-13L17 7M7 17l-1.5 1.5"/><circle cx="12" cy="12" r="7.1"/>',
      close:'<path d="m6 6 12 12M18 6 6 18"/>',
      rest:'<path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/>',
      lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      unlock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.3-2.2"/>'
    };
    return '<svg class="fh-icon'+(extraClass?' '+extraClass:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.other)+'</svg>';
  }
  // Header glyphs live on a 16px grid: each one is tuned to stay legible at
  // that size rather than being a shrunk-down 24px icon.
  function glyph(name) {
    var stroke='fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
    var shapes={
      satchel:'<svg viewBox="0 0 16 16" '+stroke+' stroke-width="1.15">'+
        '<path d="M4.2 13.5A1.4 1.4 0 0 1 2.8 12.1V7.9a4 4 0 0 1 4-4h2.4a4 4 0 0 1 4 4v4.2a1.4 1.4 0 0 1-1.4 1.4z"/>'+
        '<path d="M2.9 8.4h10.2"/>'+
        '<path d="M6.3 10.7h3.4v2.8H6.3z"/>'+
        '<path d="M6.6 3.9V3a1 1 0 0 1 1-1h.8a1 1 0 0 1 1 1v.9"/></svg>',
      loupe:'<svg viewBox="0 0 16 16" '+stroke+' stroke-width="1.35">'+
        '<circle cx="6.9" cy="6.9" r="4.1"/><path d="M9.9 9.9 13.7 13.7"/>'+
        '<path d="M5.4 5.3a2.2 2.2 0 0 1 2.5-.7" stroke-width="1"/></svg>',
      anvil:'<svg viewBox="0 0 16 16" fill="currentColor">'+
        '<path d="M4.2 3.6h11v1.7c0 1-.8 1.8-1.8 1.8h-2.5v1.5c0 .9.6 1.5 1.5 2 .9.5 1.4 1.2 1.4 2.2v.6H4.2v-.6c0-1 .5-1.7 1.4-2.2.9-.5 1.5-1.1 1.5-2V7.1H4.2C2.5 7.1 1.2 6.6.5 5.8c-.3-.4-.1-.9.4-1.1.9-.5 2-.9 3.3-1.1z"/></svg>',
      dots:'<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3.5" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="8" cy="12.5" r="1.3"/></svg>',
      margin:'<svg viewBox="0 0 16 16" '+stroke+' stroke-width="1.2">'+
        '<rect x="1.6" y="3" width="12.8" height="10" rx="1.4"/>'+
        '<path d="M9.8 3v10" /><path d="M9.8 3.6h4v8.8h-4z" fill="currentColor" stroke="none" opacity=".5"/></svg>',
      table:'<svg viewBox="0 0 16 16" '+stroke+' stroke-width="1.2">'+
        '<rect x="1.4" y="3" width="10" height="7.4" rx="1.2"/>'+
        '<rect x="7" y="7.2" width="7.6" height="6" rx="1.2" fill="currentColor" stroke="none"/></svg>',
      seal:'<svg viewBox="0 0 16 16" '+stroke+' stroke-width="1.5"><path d="M5 3l6 5-6 5"/></svg>'
    };
    return shapes[name]||shapes.dots;
  }
  var MODES=[["margin","Margin","Docked beside the rules"],["table","Table","Floating window, always on top"],["seal","Seal","Collapse to the FH seal"]];
  function renderModeControl() {
    var active=inPip()?"table":"margin";
    return "<span class=\"fh-cd-modes\" role=\"group\" aria-label=\"Companion window mode\">"+MODES.map(function(entry){
      var on=entry[0]===active&&entry[0]!=="seal";
      return "<button class=\"fh-cd-hbtn fh-cd-mode"+(on?" is-on":"")+"\" type=\"button\" data-cd-mode=\""+entry[0]+"\" title=\""+entry[1]+" — "+entry[2]+"\" aria-label=\""+entry[1]+": "+entry[2]+"\""+(on?" aria-pressed=\"true\"":"")+">"+glyph(entry[0])+"</button>";
    }).join("")+"</span>";
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function numberOr(value,fallback){return value!==null&&value!==""&&isFinite(Number(value))?Number(value):fallback;}
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
  function lookupKey(value) {
    var text=String(value||"").trim().replace(/[’‘`´]/g,"'");
    if(text.normalize)text=text.normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
    return text.toLowerCase()
      .replace(/^tool\s*[-:]\s*/i,"")
      .replace(/^proficiency\s+(?:with|in)\s+/i,"")
      .replace(/^proficient\s+(?:with|in)\s+/i,"")
      .replace(/^skill\s*[-:]\s*/i,"")
      .replace(/&/g," and ")
      .replace(/[^a-z0-9]+/g," ")
      .replace(/\s+/g," ").trim();
  }
  var TOOL_ALIASES={};
  function registerToolAliases(canonical,aliases){
    [canonical,"Tool - "+canonical].concat(aliases||[]).forEach(function(alias){TOOL_ALIASES[lookupKey(alias)]="Tool - "+canonical;});
  }
  registerToolAliases("Alchemist's",["Alchemist's Supplies","Alchemist Supplies"]);
  registerToolAliases("Brewer's",["Brewer's Supplies","Brewer Supplies"]);
  registerToolAliases("Calligrapher's",["Calligrapher's Supplies","Calligrapher Supplies"]);
  registerToolAliases("Carpenter's",["Carpenter's Tools","Carpenter Tools"]);
  registerToolAliases("Card Set",["Playing Card Set","Playing Cards","Cards","Gaming Set - Playing Cards"]);
  registerToolAliases("Cartographer's",["Cartographer's Tools","Cartographer Tools"]);
  registerToolAliases("Cobbler's",["Cobbler's Tools","Cobbler Tools"]);
  registerToolAliases("Cook's",["Cook's Utensils","Cook Utensils","Cooking Utensils"]);
  registerToolAliases("Dice Set",["Dice","Gaming Set - Dice"]);
  registerToolAliases("Disguise Kit",["Disguise Tools"]);
  registerToolAliases("Dragonchess Set",["Dragonchess","Gaming Set - Dragonchess"]);
  registerToolAliases("Forgery Kit",["Forger's Kit","Forgery Tools"]);
  registerToolAliases("Garrot",["Garrote"]);
  registerToolAliases("Glassblower's",["Glassblower's Tools","Glassblower Tools"]);
  registerToolAliases("Herbalism Kit",["Herbalist Kit","Herbalism Tools"]);
  registerToolAliases("Instrument (Strings)",["Dulcimer","Lute","Lyre","Viol","String Instrument","Musical Instrument - Strings"]);
  registerToolAliases("Instrument (Wind)",["Bagpipes","Flute","Horn","Pan Flute","Shawm","Wind Instrument","Musical Instrument - Wind"]);
  registerToolAliases("Instrument (Other)",["Drum","Musical Instrument","Instrument","Musical Instrument - Other"]);
  registerToolAliases("Jeweler's",["Jeweler's Tools","Jeweller's Tools","Jeweler Tools","Jeweller Tools"]);
  registerToolAliases("Leatherworker's",["Leatherworker's Tools","Leatherworker Tools"]);
  registerToolAliases("Mason's",["Mason's Tools","Mason Tools"]);
  registerToolAliases("Mount (Air)",["Air Mount","Flying Mount"]);
  registerToolAliases("Mount (Land)",["Land Mount","Ground Mount"]);
  registerToolAliases("Mount (Water)",["Water Mount","Aquatic Mount"]);
  registerToolAliases("Navigator's",["Navigator's Tools","Navigator Tools"]);
  registerToolAliases("Painter's",["Painter's Supplies","Painter Supplies"]);
  registerToolAliases("Poisoner's",["Poisoner's Kit","Poisoner Kit"]);
  registerToolAliases("Potter's",["Potter's Tools","Potter Tools"]);
  registerToolAliases("Smith's",["Smith's Tools","Smith Tools"]);
  registerToolAliases("Soulforging",["Soulforging Tools","Soulforge","Soulforge Tools"]);
  registerToolAliases("Thieves'",["Thieves' Tools","Thief's Tools","Thief Tools"]);
  registerToolAliases("Three-Dragon Ante",["Three Dragon Ante","Three-Dragon Ante Set","Gaming Set - Three-Dragon Ante"]);
  registerToolAliases("Tinker's",["Tinker's Tools","Tinkerer's Tools","Tinker Tools"]);
  registerToolAliases("Vehicles (Air)",["Air Vehicles","Vehicle - Air","Vehicles - Air"]);
  registerToolAliases("Vehicles (Land)",["Land Vehicles","Vehicle - Land","Vehicles - Land"]);
  registerToolAliases("Vehicles (Water)",["Water Vehicles","Vehicle - Water","Vehicles - Water"]);
  registerToolAliases("Weaver's",["Weaver's Tools","Weaver Tools"]);
  registerToolAliases("Woodcarver's",["Woodcarver's Tools","Woodcarver Tools"]);
  function canonicalToolName(value) {
    var known=TOOL_ALIASES[lookupKey(value)];
    if(known)return known;
    var raw=String(value||"").trim().replace(/^Tool\s*-\s*/i,"").replace(/[’‘`´]/g,"'");
    return "Tool - "+raw;
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
  var SKILL_ALIASES={academic:"Academics",appraisal:"Appraise"};
  function knownSkillName(value) {
    var key=lookupKey(value),found=SKILLS.find(function(item){return lookupKey(item[0])===key;});
    return (found&&found[0])||SKILL_ALIASES[key]||null;
  }
  function knownToolName(value) {
    var key=lookupKey(value);
    return TOOL_ALIASES[key]||TOOL_ALIASES[key.replace(/\btool$/,"tools")]||TOOL_ALIASES[key.replace(/\btools$/,"tool")]||null;
  }
  function emptyImportReport(){return {importedSkills:[],importedTools:[],unmappedSkills:[],unmappedTools:[]};}
  function reportImport(report,field,value,source){
    if(!report||!value)return;
    var key=lookupKey(value),exists=report[field].some(function(item){return lookupKey(item.name)===key;});
    if(!exists)report[field].push({name:String(value).trim(),source:source||"D&D Beyond"});
  }
  function importedRecordName(entry){
    return typeof entry==="string"?entry:(entry&&(entry.name||entry.label||entry.skillName||entry.toolName||entry.friendlySubtypeName||entry.subtypeName||entry.subtype));
  }
  function hasTierMarker(entry){
    return !!(entry&&typeof entry==="object"&&(entry.tier!=null||entry.level!=null||entry.proficiencyLevel!=null||entry.proficient!=null||entry.proficiency!=null||entry.isProficient!=null||entry.expertise!=null||entry.expert!=null||entry.isExpertise!=null));
  }
  function applyImportedRecord(skills,entry,isTool,report,source,implicitProficiency) {
    if(!entry)return;
    var raw=importedRecordName(entry);
    if(!raw)return;
    var skillName=knownSkillName(raw),toolName=knownToolName(raw),name;
    if(isTool){
      if(!toolName){reportImport(report,"unmappedTools",raw,source);return false;}
      name=toolName;
    }else if(skillName)name=skillName;
    else if(toolName){name=toolName;isTool=true;}
    else {reportImport(report,"unmappedSkills",raw,source);return false;}
    var old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||(entry.ability||"INT")};
    var tier=typeof entry==="string"||implicitProficiency&&!hasTierMarker(entry)?"proficient":importedTier(entry);
    if(tier==="none")return false;
    old.ability=importedAbility(entry,old.ability||SKILL_ABILITY[name]||"INT");
    old.tier=tier;
    skills[name]=old;
    reportImport(report,isTool?"importedTools":"importedSkills",name.replace(/^Tool - /,""),source);
    return true;
  }
  function applyDdbModifiers(skills, modifiers, report) {
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
      applyImportedRecord(skills,normalized,!!tool,report,"DDB modifier",true);
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
    var importReport=emptyImportReport();
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
    level=Math.max(1,numberOr(overrides.level,level));
    var abilities = {};
    ABILITIES.forEach(function (key) {
      var imported=snapshotAbility(snap,key);
      abilities[key] = imported!=null?imported:Number((base.abilityScores && base.abilityScores[key]) || 10);
    });
    pending.forEach(function (entry) {
      ABILITIES.forEach(function (key) { abilities[key] += Number(entry.abilityIncreases && entry.abilityIncreases[key]) || 0; });
    });
    ABILITIES.forEach(function(key){if(overrides.abilities&&overrides.abilities[key]!=null&&overrides.abilities[key]!=="")abilities[key]=numberOr(overrides.abilities[key],abilities[key]);});
    var skills = {};
    SKILLS.forEach(function (entry) { skills[entry[0]] = {name:entry[0],ability:entry[1],tier:"none"}; });
    Object.keys(build.nativeSkillTiers || {}).forEach(function (name) {
      var skillName=knownSkillName(name),toolName=knownToolName(name),canonical=skillName||toolName;
      if(!canonical||tierName(build.nativeSkillTiers[name])==="none")return;
      skills[canonical] = {name:canonical,ability:SKILL_ABILITY[canonical] || (skills[canonical] && skills[canonical].ability) || "INT",tier:tierName(build.nativeSkillTiers[name])};
    });
    (build.skills || []).forEach(function (skill) {
      applyImportedRecord(skills,skill,false,null,"FH build",false);
    });
    if (snap) {
      importedEntries(snap.skills).forEach(function(skill){applyImportedRecord(skills,skill,false,importReport,"DDB skills",false);});
      importedEntries(snap.proficiencies&&snap.proficiencies.skills).forEach(function(skill){applyImportedRecord(skills,skill,false,importReport,"DDB skill proficiencies",true);});
      importedEntries(snap.tools).forEach(function(tool){applyImportedRecord(skills,tool,true,importReport,"DDB tools",Number(snap.schemaVersion)>=2);});
      importedEntries(snap.toolProficiencies).forEach(function(tool){applyImportedRecord(skills,tool,true,importReport,"DDB tool proficiencies",true);});
      importedEntries(snap.proficiencies&&snap.proficiencies.tools).forEach(function(tool){applyImportedRecord(skills,tool,true,importReport,"DDB tool proficiencies",true);});
      applyDdbModifiers(skills,snap.modifiers,importReport);
      // Custom proficiencies are the Fate's Hand layer written onto the DDB
      // sheet; their tier is authoritative, so they are applied after every
      // native source (a pencilled half must beat a granted "proficient").
      importedEntries(snap.customSkills).forEach(function(skill){applyImportedRecord(skills,skill,false,importReport,"DDB custom skills",false);});
      if(snap.importReport&&typeof snap.importReport==="object"){
        ["importedTools","unmappedSkills","unmappedTools"].forEach(function(key){(snap.importReport[key]||[]).forEach(function(item){var entry=typeof item==="string"?{name:item,source:"Worker import report"}:{name:item.name||"Unknown",source:item.source||"Worker import report"};if(!importReport[key].some(function(old){return old.name===entry.name&&old.source===entry.source;}))importReport[key].push(entry);});});
      }
    }
    pending.forEach(function (entry) {
      (entry.essentialSkills || []).forEach(function (skill) {
        var name=knownSkillName(skill.name);if(!name)return;
        var old = skills[name];old.tier = tierName(skill.tier);skills[name] = old;
      });
    });
    Object.keys(overrides.skills||{}).forEach(function(key){var name=knownSkillName(key);if(!name)return;var old=skills[name];old.tier=tierName(overrides.skills[key]);skills[name]=old;});
    (overrides.tools||[]).forEach(function(tool){var name=knownToolName(tool.name||tool);if(!name)return;var old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||"INT"};old.ability=tool.ability||old.ability;old.tier=tierName(tool.tier||"proficient");skills[name]=old;});
    Object.keys(overrides.toolTiers||{}).forEach(function(key){var name=knownToolName(key);if(!name)return;var old=skills[name]||{name:name,ability:SKILL_ABILITY[name]||"INT"};old.tier=tierName(overrides.toolTiers[key]);skills[name]=old;});
    (overrides.deletedTools||[]).forEach(function(key){var name=knownToolName(key);if(name)delete skills[name];});
    var spells = {};
    if (snap) (snap.spells || []).forEach(function (spell) { spells[spell.name.toLowerCase()] = {name:spell.name,level:spell.level}; });
    pending.forEach(function (entry) { (entry.spells || []).forEach(function (name) { spells[name.toLowerCase()] = {name:name,level:null}; }); });
    var firstClass = classes[0] && classes[0].name;
    var savingProficiencies = (snap && snap.savingThrowProficiencies) || CLASS_SAVES[firstClass] || [];
    var pb=Math.max(0,numberOr(overrides.pb,pbFor(level))),identity=overrides.identity||{};
    var initiative=numberOr(overrides.initiative,mod(abilities.DEX));
    var passiveDefaults={vigilance:10,delve:10,survival:10,insight:10,investigation:10},passiveOverrides=overrides.passives||{};
    // Synced skill bonuses (e.g. a class feature adding WIS to Arcana) come
    // from the Worker snapshot each pull; manual bonuses are applied last and
    // replace a synced bonus with the same label so edits never duplicate.
    var specialBonuses={};
    if(snap)importedEntries(snap.skillBonuses).forEach(function(entry){
      if(!entry||typeof entry!=="object")return;
      var name=knownSkillName(entry.name)||knownToolName(entry.name);
      var value=Number(entry.value);
      if(!name||!isFinite(value)||!value)return;
      (specialBonuses[name]||(specialBonuses[name]=[])).push({id:"sync:"+name+":"+(entry.label||"bonus"),label:entry.label||"DDB bonus",value:value,active:true,synced:true});
    });
    var manualSpecials=overrides.specialBonuses&&typeof overrides.specialBonuses==="object"?overrides.specialBonuses:{};
    Object.keys(manualSpecials).forEach(function(name){
      var manual=Array.isArray(manualSpecials[name])?manualSpecials[name]:[];
      specialBonuses[name]=(specialBonuses[name]||[]).filter(function(item){return !manual.some(function(entry){return entry&&entry.label===item.label;});}).concat(manual);
      if(!specialBonuses[name].length)delete specialBonuses[name];
    });
    return {
      name:identity.name||((snap && snap.name) || base.name || state.pseudo),
      species:identity.species||((snap && (snap.species||(snap.race&&(snap.race.fullName||snap.race.baseRaceName||snap.race.name)))) || meta.species || "Unknown species"),
      avatarUrl:snap && (snap.avatarUrl||snap.avatarUrlRaw||snap.decorations&&snap.decorations.avatarUrl),
      classes:classes,level:level,liveLevel:liveLevel,pb:pb,abilities:abilities,skills:skills,
      spells:Object.keys(spells).map(function (key) { return spells[key]; }).sort(function (a,b) { return (Number(a.level)||0)-(Number(b.level)||0)||a.name.localeCompare(b.name); }),
      preparation:profile.preparation || {transferEssence:false,identify:false,tools:[]},
      savingProficiencies:savingProficiencies,
      armorClass:overrides.armorClass!=null&&overrides.armorClass!==""?Number(overrides.armorClass):firstImportNumber([snap&&snap.armorClass,snap&&snap.ac,snap&&snap.armorClassTotal,snap&&snap.defenses&&snap.defenses.armorClass,snap&&snap.combat&&snap.combat.armorClass,snap&&snap.stats&&snap.stats.armorClass,base.armorClass,build.armorClass]),
      speed:(snap && (snap.speed || snap.walkingSpeed || snap.movement&&snap.movement.walk)) || null,
      initiative:initiative,passiveOverrides:passiveOverrides,passiveDefaults:passiveDefaults,specialBonuses:specialBonuses,
      syncedAt:(snap && snap.syncedAt)||(storedSnap&&storedSnap.syncedAt),pending:pending,
      destinyBuild:build.destiny || {},build:build,importReport:importReport
    };
  }
  function skillInfo(name, ch, extra) {
    var skill = ch.skills[name] || {name:name,ability:SKILL_ABILITY[name] || "INT",tier:"none"};
    var tier = tierName(skill.tier);
    var proficiency = TIERS[tier] === .5 ? Math.floor(ch.pb/2) : ch.pb * TIERS[tier];
    var bonuses=(ch.specialBonuses&&ch.specialBonuses[name]||[]).filter(function(item){return item&&item.active!==false&&isFinite(Number(item.value));});
    var special=bonuses.reduce(function(total,item){return total+Number(item.value);},0);
    return {name:name,ability:skill.ability || "INT",tier:tier,bonus:mod(ch.abilities[skill.ability] || 10)+proficiency+(Number(extra)||0)+special,specialBonuses:bonuses,specialTotal:special};
  }
  function saveInfo(ability, ch) {
    var proficient = ch.savingProficiencies.indexOf(ability) >= 0;
    return {name:ABILITY_NAMES[ability]+" Save",ability:ability,tier:proficient?"proficient":"none",bonus:mod(ch.abilities[ability])+(proficient?ch.pb:0)};
  }

  function storageKey() { return "fh-player-v2:" + state.code + ":" + state.pseudo; }
  function routeValue(name){try{return new URL(window.location.href).searchParams.get(name)||"";}catch(error){return "";}}
  function rememberRoute(){if(!state.code||!state.pseudo||!window.history||!window.history.replaceState)return;try{var url=new URL(window.location.href);url.searchParams.set("campaign",state.code);url.searchParams.set("character",state.pseudo);window.history.replaceState(null,"",url.href);}catch(error){}}
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
    // Saved profiles from before the floor may still carry negative points.
    var overreach = Math.max(0, Number(raw.overreach)||0, points<0 ? -points : 0);
    // Deferred fate: Chaos and Overreach saves are carried, not rolled on the spot.
    var pending = Array.isArray(raw.pending) ? raw.pending.filter(function(item){return item&&(item.kind==="chaos"||item.kind==="overreach"||item.kind==="note");}).slice(0,6) : [];
    return {score:score,points:Math.max(0,points),dice:dice,overreach:overreach,pending:pending,lastChange:raw.lastChange || null};
  }
  // Hit points are tracked here, not imported: DDB stays the source for the
  // standard sheet but the dock is what the player touches mid-combat.
  function normalizeVitals(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var max = raw.max == null || raw.max === "" ? null : Math.max(0, Math.round(Number(raw.max) || 0));
    var current = raw.current == null || raw.current === "" ? null : Math.round(Number(raw.current) || 0);
    if (current != null) current = Math.max(-999, max == null ? current : Math.min(current, max));
    if (max != null && current == null) current = max;
    return {current:current, max:max};
  }
  function setVitals(patch, message) {
    state.vitals = normalizeVitals(Object.assign({}, state.vitals || {}, patch));
    if (message) { state.message = message; state.messageKind = "success"; }
    persistPlayState();
  }
  function loadPlayState(ch) {
    var local = {};
    try { local = JSON.parse(localStorage.getItem(storageKey()) || "{}"); } catch (error) {}
    var profile = state.profile || {};
    state.vitals = normalizeVitals(profile.vitalsState || local.vitals);
    state.hpOpen = false; state.scoreEditing = false;
    state.destiny = normalizeDestiny(profile.destinyState || local.destiny, ch);
    state.history = Array.isArray(profile.rollHistory) ? profile.rollHistory.slice(0,MAX_HISTORY) : Array.isArray(local.history) ? local.history.slice(0,MAX_HISTORY) : [];
    state.events = Array.isArray(profile.rollEvents) ? profile.rollEvents.slice(0,10) : Array.isArray(local.events) ? local.events.slice(0,10) : [];
    state.traySelection = Array.isArray(local.traySelection) ? local.traySelection.map(normalizeFreeDie).filter(Boolean).slice(0,MAX_FREE_DICE) : [newFreeDie(20)];
    state.trayLabel = String(local.trayLabel||"Damage roll").slice(0,48);
    var pending=profile.pendingRoll||local.pendingRoll||{};
    state.rollSequence=pending.rollSequence||null;state.eventQueue=Array.isArray(pending.eventQueue)?pending.eventQueue:[];state.currentEvent=pending.currentEvent||null;state.trayPrompt=pending.trayPrompt||null;state.queueDone=pending.queueDone||"";state.queueTotal=Number(pending.queueTotal)||0;
    state.trayResults=Array.isArray(pending.trayResults)?pending.trayResults:[];state.trayTitle=pending.trayTitle||"Dice Tray";state.trayResultText=pending.trayResultText||"";state.pendingArmed=pending.pendingArmed||null;
    state.diePrompt=null;
    // rollConfig is derived, never stored: a refresh mid-roll rebuilds the console
    // from the entry so the head keeps naming the check instead of saying FREE ROLL.
    if(rollOpen()){var resumed=openEntry();state.rollConfig=resumed?configFromEntry(resumed):null;}
    state.prefs = Object.assign({bardicSides:6},local.prefs || {},profile.rollPrefs || {});
  }
  function persistPlayState() {
    if (!state.code || !state.pseudo || !state.destiny) return;
    var safePrompt=state.trayPrompt&&["nat1","chaos","awakening","die-choice"].indexOf(state.trayPrompt.type)>=0?state.trayPrompt:null;
    var pendingRoll={rollSequence:state.rollSequence,eventQueue:state.eventQueue,currentEvent:state.currentEvent,trayPrompt:safePrompt,queueDone:state.queueDone,queueTotal:state.queueTotal,trayResults:state.trayResults,trayTitle:state.trayTitle,trayResultText:state.trayResultText,pendingArmed:state.pendingArmed};
    var payload = {destiny:state.destiny,vitals:state.vitals,history:state.history.slice(0,MAX_HISTORY),events:state.events.slice(0,10),traySelection:state.traySelection,trayLabel:state.trayLabel,prefs:state.prefs,pendingRoll:pendingRoll};
    try { localStorage.setItem(storageKey(), JSON.stringify(payload)); } catch (error) {}
    clearTimeout(persistTimer);
    persistTimer = window.setTimeout(function () {
      saveProfile({destinyState:state.destiny,vitalsState:state.vitals,rollHistory:state.history.slice(0,MAX_HISTORY),rollEvents:state.events.slice(0,10),rollPrefs:state.prefs,pendingRoll:pendingRoll}).catch(function () {
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
  function refreshEventPanel(){var panel=root&&root.querySelector(".fh-cd-frame");if(panel)panel.innerHTML=renderFrameInner();else if(root)render();}
  function pushEvent(text,kind,sticky,entryId) {
    var event={id:uuid(),text:text,kind:kind||"info",entryId:entryId||null,createdAt:new Date().toISOString()};
    state.events.unshift(event);state.events=state.events.slice(0,10);state.currentEvent=event;
    clearTimeout(state.eventTimer);
    if(!sticky)state.eventTimer=window.setTimeout(function(){if(state.currentEvent&&state.currentEvent.id===event.id){state.currentEvent=null;refreshEventPanel();}},1800);
    persistPlayState();return event;
  }
  function showNextQueuedEvent(){
    if(!state.eventQueue.length){var done=state.queueDone;state.queueDone="";state.queueTotal=0;state.currentEvent=null;persistPlayState();runQueueDone(done);return;}
    var spec=state.eventQueue.shift(),shown=state.queueTotal-state.eventQueue.length;
    var event={id:uuid(),text:spec.text,kind:spec.kind||"info",entryId:spec.entryId||null,chaosRoll:spec.chaosRoll||null,createdAt:new Date().toISOString(),blocking:true,progress:shown,total:state.queueTotal};
    state.events.unshift(event);state.events=state.events.slice(0,10);state.currentEvent=event;persistPlayState();render();
  }
  function queueEvents(events,done){state.eventQueue=(events||[]).slice();state.queueDone=done||"";state.queueTotal=state.eventQueue.length;state.currentEvent=null;showNextQueuedEvent();}
  function acknowledgeEvent(){state.currentEvent=null;if(state.eventQueue.length)showNextQueuedEvent();else{var done=state.queueDone;state.queueDone="";state.queueTotal=0;persistPlayState();runQueueDone(done);}}
  function recoverLowestDie() {
    for(var missingIndex=0;missingIndex<DIE_SEQUENCE.length;missingIndex++){
      var missingSides=DIE_SEQUENCE[missingIndex],missing=state.destiny.dice.find(function(die){return die.sides===missingSides&&!die.available;});
      if(missing){missing.available=true;return missing;}
    }
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
  function setDestinyPoints(next, reason, recover, silent) {
    var before = Number(state.destiny.points)||0;
    next = Math.max(-99,Math.min(999,Number(next)||0));
    // Points never fall below zero. Whatever they would have gone under is
    // recorded as Overreach, which is what Chaos reads to set its DC.
    var shortfall = next<0 ? -next : 0;
    state.destiny.overreach = shortfall
      ? (Number(state.destiny.overreach)||0)+shortfall
      : (next>before ? 0 : Number(state.destiny.overreach)||0);
    next = Math.max(0,next);
    state.destiny.points = next;
    var recovered = null;
    if (recover !== false && next > before && next > 0 && next % 2 === 0) recovered = recoverLowestDie();
    if(!silent&&next!==before)pushEvent((next>before?"Gained ":"Lost ")+Math.abs(next-before)+" Destiny Point"+(Math.abs(next-before)===1?"":"s"),next>before?"gain":"loss",false);
    if(!silent&&recovered)pushEvent("Gained a Destiny d"+recovered.sides,"die-gain",false);
    state.destiny.lastChange = {before:before,after:next,reason:reason || "Correction",recovered:recovered && recovered.id,at:new Date().toISOString()};
    persistPlayState();
    return recovered;
  }
  function updateDestinyField(field, value, reason) {
    if (field === "score") state.destiny.score = clamp(value,0,99);
    else setDestinyPoints(value,reason || "Manual correction",true);
    persistPlayState(); render();
  }

  // "choice" is Eric's A/D: roll two, decide afterwards. Advantage and
  // disadvantage are decisions taken *before* the roll, so they resolve
  // themselves — offering a choice on top of them was the old bug.
  function rollMode(value){return value==="advantage"||value==="disadvantage"||value==="choice"?value:"flat";}
  function forcedDieResult(value,sides){if(value==null||value==="")return null;return clamp(value,1,Number(sides)||20);}
  function bonusSourceFor(label,index,source){
    if(source)return String(source);
    var key=String(label||"").trim().toLowerCase();
    if(key==="guidance")return "guidance";
    if(key==="tactical mind")return "tactical";
    if(key==="bardic")return "bardic";
    var roman=key.match(/^other\s+(i{1,3})$/);if(roman)return "other-"+({i:1,ii:2,iii:3}[roman[1]]||1);
    return "other-"+Math.min(3,Math.max(1,Number(index)+1||1));
  }
  function dieColour(value){return DIE_MATERIAL[value]&&value!=="white"&&value!=="chaos"?value:"";}
  /* A die in the free tray is a real object, not a bare number: that is what
     lets it keep a colour through the roll and carry its own Portent. */
  function newFreeDie(sides,colour){return {id:uuid(),sides:Number(sides),colour:dieColour(colour),advantageMode:"flat",forcedResult:null};}
  function normalizeFreeDie(raw){
    var sides=Number(raw&&raw.sides!=null?raw.sides:raw);
    if(ROLL_DIE_SIZES.indexOf(sides)<0)return null;
    raw=raw&&typeof raw==="object"?raw:{};
    return {id:raw.id||uuid(),sides:sides,colour:dieColour(raw.colour),advantageMode:rollMode(raw.advantageMode),forcedResult:forcedDieResult(raw.forcedResult,sides)};
  }
  function newBonusDie(label,sides,sourceIcon,colour){return {id:uuid(),label:String(label||"Other I").slice(0,32),sides:ROLL_DIE_SIZES.indexOf(Number(sides))>=0?Number(sides):6,advantageMode:"flat",forcedResult:null,sourceIcon:bonusSourceFor(label,0,sourceIcon),colour:dieColour(colour)};}
  function normalizeBonusDie(die,index){die=die||{};var sides=ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0?Number(die.sides):6,label=String(die.label||"Other I").slice(0,32);return {id:die.id||("bonus-"+index+"-"+uuid()),label:label,sides:sides,advantageMode:rollMode(die.advantageMode||die.mode),forcedResult:forcedDieResult(die.forcedResult,sides),rolls:Array.isArray(die.rolls)?die.rolls.map(Number):undefined,result:die.result!=null?Number(die.result):undefined,chosenIndex:die.chosenIndex!=null?Number(die.chosenIndex):undefined,forced:!!die.forced,sourceIcon:bonusSourceFor(label,index,die.sourceIcon),colour:dieColour(die.colour)};}
  function entryBonusDice(entry){
    if(Array.isArray(entry&&entry.bonusDice))return entry.bonusDice.map(normalizeBonusDie).slice(0,MAX_BONUS_DICE);
    var dice=[];
    if(entry&&entry.guidance)dice.push(normalizeBonusDie({id:"legacy-guidance",label:"Guidance",sourceIcon:"guidance",sides:entry.guidance.sides||4,result:entry.guidance.result,rolls:entry.guidance.rolls,chosenIndex:entry.guidance.chosenIndex,advantageMode:entry.guidance.advantageMode,forced:entry.guidance.forced},0));
    if(entry&&entry.bardic)dice.push(normalizeBonusDie({id:"legacy-bardic",label:"Bardic",sourceIcon:"bardic",sides:entry.bardic.sides||6,result:entry.bardic.result,rolls:entry.bardic.rolls,chosenIndex:entry.bardic.chosenIndex,advantageMode:entry.bardic.advantageMode,forced:entry.bardic.forced},1));
    return dice;
  }
  function mirrorNamedBonusDice(entry){
    var dice=entryBonusDice(entry),guidance=dice.find(function(die){return die.label.toLowerCase()==="guidance";}),bardic=dice.find(function(die){return die.label.toLowerCase()==="bardic";});
    entry.guidance=guidance?{sides:guidance.sides,result:guidance.result,rolls:guidance.rolls,chosenIndex:guidance.chosenIndex,advantageMode:guidance.advantageMode,forced:guidance.forced}:null;
    entry.bardic=bardic?{sides:bardic.sides,result:bardic.result,rolls:bardic.rolls,chosenIndex:bardic.chosenIndex,advantageMode:bardic.advantageMode,forced:bardic.forced}:null;
  }
  function makeDiePlan(sides,mode,forced){
    sides=Number(sides)||20;mode=rollMode(mode);var manual=forcedDieResult(forced,sides);
    if(manual!=null)return {sides:sides,mode:mode,rolls:[manual],result:manual,chosenIndex:0,forced:true};
    var rolls=mode==="flat"?[rollDie(sides)]:[rollDie(sides),rollDie(sides)];
    if(mode==="flat")return {sides:sides,mode:mode,rolls:rolls,result:rolls[0],chosenIndex:0,forced:false};
    if(mode==="choice")return {sides:sides,mode:mode,rolls:rolls,result:null,chosenIndex:null,forced:false};
    var pick=mode==="advantage"?(rolls[0]>=rolls[1]?0:1):(rolls[0]<=rolls[1]?0:1);
    return {sides:sides,mode:mode,rolls:rolls,result:rolls[pick],chosenIndex:pick,forced:false};
  }
  function chooseDiePlan(plan,index){index=clamp(index,0,plan.rolls.length-1);plan.chosenIndex=index;plan.result=plan.rolls[index];return plan;}
  function rollInput(name, ability, bonus, options) {
    options = options || {};
    return {
      name:name,ability:ability,baseBonus:Number(bonus)||0,d20Mode:rollMode(options.mode),d20ForcedResult:null,plusTwo:!!options.plusTwo,
      guidance:false,bardic:false,bardicSides:Number(state.prefs.bardicSides)||6,bonusDice:[],destinyDieId:"",destinyConfirmed:false,destinyMode:"flat",destinyForcedResult:null,custom:0,
      dc:options.dc != null ? String(options.dc) : "",note:options.note || "",editingId:null
    };
  }
  function ensureConfigBonusDice(cfg){cfg.bonusDice=(Array.isArray(cfg.bonusDice)?cfg.bonusDice:[]).slice(0,MAX_BONUS_DICE);if(cfg.guidance&&!cfg.bonusDice.some(function(die){return String(die.label).toLowerCase()==="guidance";})&&cfg.bonusDice.length<MAX_BONUS_DICE)cfg.bonusDice.push(newBonusDie("Guidance",4));if(cfg.bardic&&!cfg.bonusDice.some(function(die){return String(die.label).toLowerCase()==="bardic";})&&cfg.bonusDice.length<MAX_BONUS_DICE)cfg.bonusDice.push(newBonusDie("Bardic",Number(cfg.bardicSides)||6));return cfg;}
  function entryTotal(entry) {
    var total = (Number(entry.kept)||0) + (Number(entry.baseBonus)||0) + (entry.plusTwo?2:0) + (Number(entry.custom)||0);
    var bonusDice=entryBonusDice(entry);if(bonusDice.length)bonusDice.forEach(function(die){total+=Number(die.result)||0;});else [entry.guidance,entry.bardic].forEach(function(die){if(die)total+=Number(die.result)||0;});
    if(entry.destiny)total+=Number(entry.destiny.result)||0;
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
  function spendDestinyDie(dieId, silent, rolled) {
    var die = state.destiny.dice.find(function (item) { return item.id === dieId && item.available; });
    if (!die) return null;
    die.available = false;
    var plan=rolled||makeDiePlan(die.sides,"flat",null),result=Number(plan.result),before = Number(state.destiny.points)||0, cost, criticalSuccess=false, criticalFailure=false, chaos=null;
    var recovered=null;
    if (result === die.sides) { cost = 1; criticalSuccess = true; recovered=setDestinyPoints(before-1,"Arcane Critical Success d"+die.sides,true,!!silent); }
    else if (result === 1) { cost = -1; criticalFailure = true; recovered=setDestinyPoints(before+1,"Arcane Critical Failure d"+die.sides,true,!!silent); }
    else {
      cost = result; recovered=setDestinyPoints(before-result,"Destiny d"+die.sides,true,!!silent);
      var over = Number(state.destiny.overreach)||0;
      if (over > 0) chaos = {overreach:over,dc:10+over};
    }
    if(!silent&&criticalSuccess)pushEvent("ARCANE CRITICAL SUCCESS · Destiny d"+die.sides+" rolled "+result,"arcane-critical-success",false);
    else if(!silent&&criticalFailure)pushEvent("ARCANE CRITICAL FAILURE · Destiny d"+die.sides+" rolled 1","arcane-critical-failure",false);
    return {dieId:die.id,sides:die.sides,result:result,rolls:(plan.rolls||[result]).slice(),chosenIndex:plan.chosenIndex==null?0:plan.chosenIndex,advantageMode:rollMode(plan.mode),forced:!!plan.forced,cost:cost,pointsBefore:before,pointsAfter:state.destiny.points,criticalSuccess:criticalSuccess,criticalFailure:criticalFailure,chaos:chaos,recovered:recovered};
  }
  function destinyEventSpecs(spent,entryId){
    if(!spent)return [];
    var change=spent.pointsAfter-spent.pointsBefore,events=[],parts=[],rollEntry=state.rollSequence&&state.rollSequence.entry||state.history.find(function(entry){return entry.id===entryId;});
    if(spent.criticalSuccess)parts.push("ARCANE CRITICAL SUCCESS","Destiny d"+spent.sides+" rolled "+spent.result);
    else if(spent.criticalFailure)parts.push("ARCANE CRITICAL FAILURE","Destiny d"+spent.sides+" rolled 1");
    else parts.push("Destiny d"+spent.sides+" rolled "+spent.result);
    if(change)parts.push((change>0?"Gained ":"Lost ")+Math.abs(change)+" Destiny Point"+(Math.abs(change)===1?"":"s"),"Current "+spent.pointsAfter);
    if(spent.recovered)parts.push("Gained a Destiny d"+spent.recovered.sides);
    events.push({text:parts.join(" · "),kind:spent.criticalSuccess?"arcane-critical-success":spent.criticalFailure?"arcane-critical-failure":"destiny",entryId:entryId});
    // The save itself is deferred behind a pending marker; this popup only announces it.
    if(spent.chaos){var saveAbility=rollEntry&&rollEntry.ability||"";addPendingFate({kind:"overreach",entryId:entryId,ability:saveAbility,dc:spent.chaos.dc,overreach:spent.chaos.overreach});events.push({text:"CHAOS RISK · Overreach "+spent.chaos.overreach+" · "+(saveAbility||"Ability")+" save DC "+spent.chaos.dc+" · pending",kind:"chaos",entryId:entryId});}
    return events;
  }
  function naturalDestiny(entry) {
    var events=[];
    if (entry.natural === 20) {
      var before = state.destiny.points,recovered=setDestinyPoints(before-1,"Natural 20",true,true);
      entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 20"};
      entry.awakening=state.destiny.points===0;
      var parts=[entry.awakening?"ARCANE AWAKENING · Natural 20 at Destiny 0":"NATURAL 20 · Fate bends in your favor","Lost 1 Destiny Point","Current "+state.destiny.points];
      if(recovered)parts.push("Gained a Destiny d"+recovered.sides);
      events.push({text:parts.join(" · "),kind:entry.awakening?"awakening":"nat20",entryId:entry.id});
    } else if (entry.natural === 1) entry.natChoice = null;
    return events;
  }
  function addHistory(entry) {
    state.history.unshift(entry); state.history = state.history.slice(0,MAX_HISTORY); persistPlayState();
  }
  function trayDiceForPlan(plan,label,extra){
    extra=extra||{};var rolls=Array.isArray(plan&&plan.rolls)&&plan.rolls.length?plan.rolls:[plan&&plan.result];
    return rolls.map(function(result,index){return Object.assign({sides:plan.sides,result:result,label:label+(rolls.length>1?" #"+(index+1):""),dropped:rolls.length>1&&plan.chosenIndex!=null&&index!==Number(plan.chosenIndex),choiceMode:rollMode(plan.mode||plan.advantageMode),forced:!!plan.forced,sourceIcon:plan.sourceIcon||"",colour:plan.colour||""},extra);});
  }
  function pendingTrayDice(sides,label,mode,forced,extra){
    var manual=forcedDieResult(forced,sides),count=manual!=null||rollMode(mode)==="flat"?1:2,dice=[];
    for(var i=0;i<count;i++)dice.push(Object.assign({sides:sides,result:manual,label:label+(count>1?" #"+(i+1):""),pending:true,forced:manual!=null},extra||{}));
    return dice;
  }
  function setTrayFromEntry(entry) {
    var results=[];
    if(entry.kind==="d20"){
      var d20Plan=entry.d20Roll||{sides:20,rolls:entry.d20s||[entry.kept],result:entry.kept,chosenIndex:entry.d20Choice!=null?entry.d20Choice:(entry.d20s||[]).indexOf(entry.kept),mode:entry.d20Mode,forced:!!entry.d20Forced};
      trayDiceForPlan(d20Plan,"d20",{dieRole:"base"}).forEach(function(die,index){die.natural=die.result;if(entry.transformed&&index===Number(d20Plan.chosenIndex)){die.label="Original d20";die.dropped=true;}results.push(die);});
      if(entry.transformed)results.push({sides:20,result:20,label:"FATE 1→20",natural:20,special:"transformed"});
      entryBonusDice(entry).forEach(function(die){trayDiceForPlan(die,die.label,{dieRole:"bonus"}).forEach(function(item){results.push(item);});});
      if(entry.destiny)trayDiceForPlan(entry.destiny,"Destiny",{dieRole:"destiny",special:entry.destiny.criticalSuccess?"arcane-critical-success":entry.destiny.criticalFailure?"arcane-critical-failure":""}).reverse().forEach(function(item){results.unshift(item);});
      if(entry.plusTwo)results.push({kind:"modifier",result:2,label:"FH bonus"});
    }else if(entry.kind==="destiny")results=trayDiceForPlan(entry.destiny,"Destiny",{dieRole:"destiny",special:entry.destiny.criticalSuccess?"arcane-critical-success":entry.destiny.criticalFailure?"arcane-critical-failure":""});
    else if(entry.kind==="tray"){
      // Through trayDiceForPlan so a free die on A/D shows the die it dropped,
      // struck through, exactly as the d20 does.
      results=[];
      (entry.dice||[]).forEach(function(die){
        trayDiceForPlan({sides:die.sides,rolls:die.rolls&&die.rolls.length?die.rolls:[die.result],result:die.result,chosenIndex:die.chosenIndex,mode:die.advantageMode,forced:die.forced,colour:die.colour},"d"+die.sides,{dieRole:"base"})
          .forEach(function(item){item.natural=die.sides===20?item.result:null;results.push(item);});
      });
    }
    state.trayResults=results;state.trayTitle=rollVerdictText(entry);state.trayResultText=rollDetailText(entry);
  }
  function prepareTrayForConfig(cfg){
    if(!cfg)return;
    if(cfg.editingId){
      var original=state.history.find(function(item){return item.id===cfg.editingId;});if(!original)return;var locked=[];
      var originalD20=original.d20Roll||{sides:20,rolls:original.d20s||[original.kept],result:original.kept,chosenIndex:original.d20Choice!=null?original.d20Choice:(original.d20s||[]).indexOf(original.kept),mode:original.d20Mode,forced:!!original.d20Forced};trayDiceForPlan(originalD20,"d20",{dieRole:"base"}).forEach(function(die){die.natural=die.result;locked.push(die);});
      var existingIds={};entryBonusDice(original).forEach(function(die){existingIds[die.id]=true;trayDiceForPlan(die,die.label,{dieRole:"bonus"}).forEach(function(item){locked.push(item);});});
      (cfg.bonusDice||[]).filter(function(die){return !existingIds[die.id];}).forEach(function(die){pendingTrayDice(die.sides,die.label,die.advantageMode,die.forcedResult,{dieRole:"bonus",sourceIcon:die.sourceIcon,colour:die.colour||"",bonusId:die.id}).forEach(function(item){locked.push(item);});});
      if(original.destiny)trayDiceForPlan(original.destiny,"Destiny",{dieRole:"destiny",special:original.destiny.criticalSuccess?"arcane-critical-success":original.destiny.criticalFailure?"arcane-critical-failure":""}).reverse().forEach(function(item){locked.unshift(item);});
      else if(cfg.destinyDieId){var pendingDestiny=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId;});if(pendingDestiny)pendingTrayDice(pendingDestiny.sides,"Destiny",cfg.destinyMode,cfg.destinyForcedResult,{flash:true,destinyDieId:pendingDestiny.id,dieRole:"destiny"}).reverse().forEach(function(item){locked.unshift(item);});}
      if(cfg.plusTwo)locked.push({kind:"modifier",result:2,label:"FH bonus",pending:!original.plusTwo});
      state.traySelection=[];state.trayResults=locked;state.trayTitle=cfg.name+" "+signed(cfg.baseBonus);state.trayResultText="Original d20 locked";return;
    }
    var dice=pendingTrayDice(20,"d20",cfg.d20Mode,cfg.d20ForcedResult,{dieRole:"base"});
    (cfg.bonusDice||[]).forEach(function(bonusDie){pendingTrayDice(bonusDie.sides,bonusDie.label,bonusDie.advantageMode,bonusDie.forcedResult,{dieRole:"bonus",sourceIcon:bonusDie.sourceIcon,colour:bonusDie.colour||"",bonusId:bonusDie.id}).forEach(function(item){dice.push(item);});});
    if(cfg.destinyDieId){var die=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId;});if(die)pendingTrayDice(die.sides,"Destiny",cfg.destinyMode,cfg.destinyForcedResult,{flash:true,destinyDieId:die.id,dieRole:"destiny"}).reverse().forEach(function(item){dice.unshift(item);});}
    if(cfg.plusTwo)dice.push({kind:"modifier",result:2,label:"FH bonus",pending:true});
    state.traySelection=[];state.trayResults=dice;state.trayTitle=cfg.name+" "+signed(cfg.baseBonus);state.trayResultText="Ready";
  }
  function clearDiceTray(closeConsole){state.traySelection=[];state.trayResults=[];state.trayTitle="Dice Tray";state.trayResultText="";state.trayPrompt=null;state.currentEvent=null;state.eventQueue=[];state.queueDone="";state.queueTotal=0;state.rollSequence=null;state.pendingArmed=null;state.diePrompt=null;stopCalling();if(closeConsole!==false)state.rollConfig=null;persistPlayState();render();}
  /* An OPEN roll no longer locks the dock: it has already reached the stream,
     and CLEAR TRAY or the next roll are its two legitimate exits. Only the
     phases that genuinely must be answered still hold the dock. */
  function rollTransactionActive(){return !!(state.rollSequence&&state.rollSequence.phase&&state.rollSequence.phase!=="resolved"&&state.rollSequence.phase!=="open");}
  /* Everything that can still change an open roll calls for three seconds,
     then goes quiet — a nudge, not a permanent flicker. */
  var CALL_MS=3000;
  function callingNow(){return !!(state.callUntil&&Date.now()<state.callUntil);}
  function startCalling(){
    state.callUntil=Date.now()+CALL_MS;
    clearTimeout(state.callTimer);
    state.callTimer=window.setTimeout(function(){state.callUntil=0;if(root)render();},CALL_MS+40);
  }
  function stopCalling(){state.callUntil=0;clearTimeout(state.callTimer);}
  function warnRollLocked(){state.message="Finish the current roll before starting or clearing another one.";state.messageKind="warn";renderMessage();}
  /* ── The APPLY flow ──────────────────────────────────────────────
     A landed roll no longer ends in a blocking result popup. It stays
     OPEN: the tray keeps its dice, APPLY blinks, and every source of a
     new die (tray sizes, Bardic/Guidance, the Destiny pool) stays live.
     Adding one turns APPLY into APPLY NEW MODIFIERS; applying rolls the
     staged dice, folds them into the same entry and reopens the loop.
     Only three things still block: the A/D choice, a natural 1, and the
     consequences of a Destiny die. */
  function stagedList(){var sequence=state.rollSequence;return sequence&&Array.isArray(sequence.staged)?sequence.staged:[];}
  function rollOpen(){return !!(state.rollSequence&&state.rollSequence.phase==="open");}
  function openEntry(){var sequence=state.rollSequence;if(!sequence)return null;return state.history.find(function(item){return item.id===sequence.entryId;})||null;}
  function stagedBonusCount(){return stagedList().filter(function(item){return item.kind!=="destiny";}).length;}
  function openStatusText(entry){
    var staged=stagedList().length;
    return rollDetailText(entry)+(staged?" · "+staged+" new die"+(staged===1?"":"s")+" ready":"");
  }
  /* The verdict is the headline; the arithmetic that produced it stays legible
     but discreet underneath. */
  function rollVerdictText(entry){return (entry.name||"Roll")+" "+(entry.total==null?"":entry.total);}
  function rollDetailText(entry){
    var parts=rollParts(entry).map(function(part){return part.k+" "+part.v;});
    if(entry.outcome)parts.push(entry.outcome);
    if(entry.dc!==""&&entry.dc!=null&&isFinite(Number(entry.dc)))parts.push("DC "+entry.dc);
    return parts.join(" · ");
  }
  function refreshOpenTray(entry){
    setTrayFromEntry(entry);
    stagedList().forEach(function(item){
      var dice=pendingTrayDice(item.sides,item.label,item.advantageMode||"flat",null,{dieRole:item.kind==="destiny"?"destiny":"bonus",sourceIcon:item.sourceIcon||"",colour:item.colour||"",flash:item.kind==="destiny",stagedId:item.id});
      if(item.kind==="destiny")dice.reverse().forEach(function(die){state.trayResults.unshift(die);});
      else dice.forEach(function(die){state.trayResults.push(die);});
    });
    state.trayResultText=openStatusText(entry);
  }
  function openRollState(entry){
    if(!entry)return;
    state.rollSequence=state.rollSequence||{};
    state.rollSequence.entryId=entry.id;state.rollSequence.phase="open";state.rollSequence.staged=stagedList();
    state.trayPrompt=null;state.currentEvent=null;state.eventQueue=[];state.queueDone="";state.queueTotal=0;
    state.rollConfig=configFromEntry(entry);
    startCalling();refreshOpenTray(entry);persistPlayState();render();
  }
  function stageBonusDie(sides,label,sourceIcon){
    var entry=openEntry();if(!rollOpen()||!entry)return;
    sides=Number(sides);if(ROLL_DIE_SIZES.indexOf(sides)<0||sides===20||sides===100){state.message="The d20 is the base die; d% stays a free roll.";state.messageKind="warn";renderMessage();return;}
    if(entryBonusDice(entry).length+stagedBonusCount()>=MAX_BONUS_DICE){state.message="A roll carries at most "+MAX_BONUS_DICE+" bonus dice.";state.messageKind="warn";renderMessage();return;}
    var used=entryBonusDice(entry).concat(stagedList()).map(function(die){var match=String(die.sourceIcon||"").match(/^other-([123])$/);return match?Number(match[1]):0;});
    var slot=[1,2,3].find(function(value){return used.indexOf(value)<0;})||1;
    state.rollSequence.staged=stagedList().concat([{id:uuid(),kind:"bonus",label:label||("Bonus "+["","I","II","III"][slot]),sides:sides,sourceIcon:sourceIcon||("other-"+slot)}]);
    refreshOpenTray(entry);persistPlayState();render();
  }
  function unstageDie(sides){
    var entry=openEntry();if(!rollOpen()||!entry)return false;
    var staged=stagedList();
    for(var i=staged.length-1;i>=0;i--){if(staged[i].kind!=="destiny"&&Number(staged[i].sides)===Number(sides)){staged.splice(i,1);refreshOpenTray(entry);persistPlayState();render();return true;}}
    return false;
  }
  function stageDestinyDie(dieId){
    var entry=openEntry();if(!rollOpen()||!entry||entry.destiny)return;
    if(stagedList().some(function(item){return item.kind==="destiny";}))return;
    var die=state.destiny.dice.find(function(item){return item.id===dieId&&item.available;});if(!die)return;
    state.rollSequence.staged=stagedList().concat([{id:uuid(),kind:"destiny",destinyDieId:die.id,label:"Destiny",sides:die.sides}]);
    refreshOpenTray(entry);persistPlayState();render();
  }
  /* The roll landed but stays open. Nothing has to be "applied" — it is already
     in the stream. Only two things end it: CLEAR TRAY, or a new roll. */
  function releaseRoll(){
    state.rollSequence=null;state.currentEvent=null;state.eventQueue=[];state.queueDone="";state.queueTotal=0;state.trayPrompt=null;state.diePrompt=null;
  }
  /* ROLL on an open roll: only the newly staged dice leave the hand, and they
     join the same stream entry. With nothing staged it simply rolls the same
     check again, as a fresh entry — the button says ROLL, so it rolls. */
  function rollStagedDice(){
    var entry=openEntry(),staged=stagedList();
    if(!rollOpen()||!entry)return;
    if(!staged.length){repeatOpenRoll(entry);return;}
    var events=[],settled=false;
    staged.forEach(function(item){
      if(item.kind==="destiny"){
        if(entry.destiny)return;
        var spent=spendDestinyDie(item.destinyDieId,true);
        if(!spent)return;
        entry.destiny=spent;
        events=events.concat(destinyEventSpecs(spent,entry.id));
        // A 1 or the maximum on a Destiny die settles the roll on the spot.
        if(spent.criticalSuccess||spent.criticalFailure)settled=true;
        return;
      }
      if(entryBonusDice(entry).length>=MAX_BONUS_DICE)return;
      var plan=Object.assign(newBonusDie(item.label,item.sides,item.sourceIcon,item.colour),makeDiePlan(item.sides,item.advantageMode||"flat",item.forcedResult));
      entry.bonusDice=entryBonusDice(entry).concat([plan]);
    });
    mirrorNamedBonusDice(entry);
    entry.total=entryTotal(entry);entry.outcome=outcomeFor(entry);entry.adjusted=true;entry.adjustedAt=new Date().toISOString();
    state.rollSequence.staged=[];
    setTrayFromEntry(entry);
    if(events.length){state.rollSequence.phase="open-after-events";persistPlayState();queueEvents(events,settled?"finish-sequence":"open-roll");return;}
    if(settled){releaseRoll();setTrayFromEntry(entry);persistPlayState();render();return;}
    openRollState(entry);
  }
  /* ROLL again on the same check: the setup is kept, the dice are not. */
  function repeatOpenRoll(entry){
    var cfg=configFromEntry(entry);
    cfg.editingId=null;cfg.d20ForcedResult=null;cfg.destinyForcedResult=null;cfg.destinyDieId="";cfg.destinyConfirmed=false;
    cfg.bonusDice=(cfg.bonusDice||[]).map(function(die){return newBonusDie(die.label,die.sides,die.sourceIcon,die.colour);});
    releaseRoll();state.rollConfig=cfg;prepareTrayForConfig(cfg);persistPlayState();runConfiguredRoll();
  }
  function finishRolledEntry(entry,events){
    entry.total=entryTotal(entry);entry.outcome=outcomeFor(entry);addHistory(entry);setTrayFromEntry(entry);state.rollConfig=configFromEntry(entry);state.message="";
    if(entry.natural===1){state.rollSequence=state.rollSequence||{};state.rollSequence.entryId=entry.id;state.rollSequence.phase="nat1";state.trayPrompt={type:"nat1",entryId:entry.id};persistPlayState();render();return;}
    events=(events||[]).concat(naturalDestiny(entry));entry.outcome=outcomeFor(entry);state.trayResultText="Total "+entry.total+(entry.outcome?" · "+entry.outcome:"");
    state.rollSequence=state.rollSequence||{};state.rollSequence.entryId=entry.id;
    if(events.length){state.rollSequence.phase="open-after-events";persistPlayState();queueEvents(events,"open-roll");return;}
    openRollState(entry);
  }
  function quickRoll(name, ability, bonus, note) {
    clearDiceTray(false);state.rollConfig=null;
    var natural = rollDie(20);
    var entry = {id:uuid(),kind:"d20",name:name,ability:ability,baseBonus:Number(bonus)||0,d20Mode:"flat",d20s:[natural],d20Roll:{sides:20,mode:"flat",rolls:[natural],result:natural,chosenIndex:0,forced:false},d20Choice:0,d20Forced:false,kept:natural,natural:natural,plusTwo:false,custom:0,bonusDice:[],guidance:null,bardic:null,destiny:null,dc:"",note:note||"",createdAt:new Date().toISOString(),adjusted:false};
    state.rollSequence={phase:"remaining",entryId:entry.id};finishRolledEntry(entry,[]);
  }
  function snapshotRollConfig(cfg){ensureConfigBonusDice(cfg);var copy=Object.assign({},cfg);copy.bonusDice=(cfg.bonusDice||[]).map(function(die,index){return normalizeBonusDie(die,index);});return copy;}
  function showDieChoice(target,index,plan,label){
    state.rollSequence.phase=target==="destiny"?"destiny-choice":target==="adjustment"?"adjustment-choice":"roll-choice";
    state.trayPrompt={type:"die-choice",target:target,index:index,label:label,sides:plan.sides,mode:plan.mode,rolls:plan.rolls.slice(),dieRole:target==="destiny"?"destiny":target==="d20"?"base":"bonus"};
    persistPlayState();render();
  }
  function continueRemainingChoices(){
    var sequence=state.rollSequence;if(!sequence||!sequence.entry)return;var next=(sequence.choiceQueue||[]).shift();
    if(next){var plan=next.target==="d20"?sequence.entry.d20Roll:sequence.entry.bonusDice[next.index];showDieChoice(next.target,next.index,plan,next.label);return;}
    var entry=sequence.entry;entry.kept=entry.d20Roll.result;entry.natural=entry.kept;entry.d20Choice=entry.d20Roll.chosenIndex;entry.d20Forced=!!entry.d20Roll.forced;mirrorNamedBonusDice(entry);state.trayPrompt=null;sequence.phase="result";finishRolledEntry(entry,[]);
  }
  function completeHistoryAdjustment(entry,cfg,plans){
    // A plain bonus die never blocks: it simply lands in the tray and the APPLY loop reopens.
    var existing=entryBonusDice(entry),events=[];entry.plusTwo=cfg.plusTwo;entry.custom=cfg.custom;entry.dc=cfg.dc;entry.bonusDice=existing.concat(plans||[]).slice(0,MAX_BONUS_DICE).map(normalizeBonusDie);mirrorNamedBonusDice(entry);
    entry.total=entryTotal(entry);entry.adjusted=true;entry.adjustedAt=new Date().toISOString();entry.outcome=outcomeFor(entry);state.trayPrompt=null;setTrayFromEntry(entry);
    state.rollSequence.entryId=entry.id;
    if(events.length){state.rollSequence.phase="open-after-events";persistPlayState();queueEvents(events,"open-roll");return;}
    openRollState(entry);
  }
  function continueAdjustmentChoices(){
    var sequence=state.rollSequence;if(!sequence||!sequence.entry)return;var next=(sequence.choiceQueue||[]).shift();
    if(next){showDieChoice("adjustment",next.index,sequence.adjustmentPlans[next.index],next.label);return;}
    completeHistoryAdjustment(sequence.entry,sequence.cfg,sequence.adjustmentPlans||[]);
  }
  function resolveDieChoice(index){
    var prompt=state.trayPrompt,sequence=state.rollSequence;if(!prompt||prompt.type!=="die-choice"||!sequence)return;state.trayPrompt=null;
    if(prompt.target==="destiny"){chooseDiePlan(sequence.destinyPlan,index);rollSequenceDestiny();return;}
    if(prompt.target==="d20")chooseDiePlan(sequence.entry.d20Roll,index);
    else if(prompt.target==="bonus")chooseDiePlan(sequence.entry.bonusDice[prompt.index],index);
    else if(prompt.target==="adjustment"){chooseDiePlan(sequence.adjustmentPlans[prompt.index],index);continueAdjustmentChoices();return;}
    setTrayFromEntry(sequence.entry);state.trayResultText="Choice recorded";continueRemainingChoices();
  }
  function runConfiguredRoll() {
    syncConsoleInputs();
    var cfg = state.rollConfig;
    if (!cfg) return;
    ensureConfigBonusDice(cfg);
    if(state.rollSequence&&state.rollSequence.phase&&state.rollSequence.phase!=="resolved")return;
    if(cfg.destinyDieId&&!cfg.destinyConfirmed){confirmDestinyUse(cfg.destinyDieId,"Add this die to "+cfg.name,function(){cfg.destinyConfirmed=true;prepareTrayForConfig(cfg);render();},"add-destiny");return;}
    if (cfg.editingId) { applyHistoryAdjustment(cfg); return; }
    var entry={id:uuid(),kind:"d20",name:cfg.name,ability:cfg.ability,baseBonus:cfg.baseBonus,d20Mode:cfg.d20Mode,d20s:[],kept:null,natural:null,plusTwo:cfg.plusTwo,custom:cfg.custom,dc:cfg.dc,note:cfg.note,createdAt:new Date().toISOString(),adjusted:false,bonusDice:[],guidance:null,bardic:null,destiny:null};
    state.rollSequence={phase:cfg.destinyDieId?"destiny":"remaining",cfg:snapshotRollConfig(cfg),entry:entry,entryId:entry.id};persistPlayState();
    if(cfg.destinyDieId)rollSequenceDestiny();else rollSequenceRemaining();
  }
  function rollSequenceDestiny(){
    var sequence=state.rollSequence;if(!sequence||!sequence.cfg)return;var cfg=sequence.cfg,die=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId&&item.available;});if(!die){pushEvent("That Destiny die is no longer available.","error",true);state.rollSequence=null;render();return;}
    if(!sequence.destinyPlan)sequence.destinyPlan=makeDiePlan(die.sides,cfg.destinyMode,cfg.destinyForcedResult);
    prepareTrayForConfig(cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==die.id;});trayDiceForPlan(sequence.destinyPlan,"Destiny",{flash:true,destinyDieId:die.id,dieRole:"destiny"}).reverse().forEach(function(item){state.trayResults.unshift(item);});state.trayResultText=sequence.destinyPlan.result==null?"Choose the Destiny result":"Destiny result selected";
    if(sequence.destinyPlan.result==null){showDieChoice("destiny",0,sequence.destinyPlan,"Destiny d"+die.sides);return;}
    var spent=spendDestinyDie(cfg.destinyDieId,true,sequence.destinyPlan);if(!spent){pushEvent("That Destiny die is no longer available.","error",true);state.rollSequence=null;render();return;}
    sequence.entry.destiny=spent;sequence.phase="destiny-events";prepareTrayForConfig(sequence.cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==spent.dieId;});trayDiceForPlan(spent,"Destiny",{destinyDieId:spent.dieId,dieRole:"destiny",special:spent.criticalSuccess?"arcane-critical-success":spent.criticalFailure?"arcane-critical-failure":""}).reverse().forEach(function(item){state.trayResults.unshift(item);});state.trayResultText="Destiny d"+spent.sides+" = "+spent.result;queueEvents(destinyEventSpecs(spent,sequence.entry.id),sequence.adjustment?"adjustment-remaining":"roll-remaining");
  }
  function rollSequenceRemaining(){
    var sequence=state.rollSequence;if(!sequence||!sequence.cfg||!sequence.entry)return;var cfg=sequence.cfg,entry=sequence.entry;
    entry.d20Roll=makeDiePlan(20,cfg.d20Mode,cfg.d20ForcedResult);entry.d20s=entry.d20Roll.rolls.slice();entry.bonusDice=(cfg.bonusDice||[]).map(function(die,index){return Object.assign(normalizeBonusDie(die,index),makeDiePlan(die.sides,die.advantageMode,die.forcedResult));});
    sequence.choiceQueue=[];if(entry.d20Roll.result==null)sequence.choiceQueue.push({target:"d20",index:0,label:"d20"});entry.bonusDice.forEach(function(die,index){if(die.result==null)sequence.choiceQueue.push({target:"bonus",index:index,label:die.label+" d"+die.sides});});
    setTrayFromEntry(entry);state.trayResultText=sequence.choiceQueue.length?"Choose which result to keep":"Rolling…";continueRemainingChoices();
  }
  function applyHistoryAdjustment(cfg) {
    var entry = state.history.find(function (item) { return item.id === cfg.editingId; });
    if (!entry || entry.kind !== "d20") return;
    if(!entry.destiny&&cfg.destinyDieId){state.rollSequence={phase:"destiny",cfg:snapshotRollConfig(cfg),entry:entry,entryId:entry.id,adjustment:true};persistPlayState();rollSequenceDestiny();return;}
    state.rollSequence={phase:"adjustment",cfg:snapshotRollConfig(cfg),entry:entry,entryId:entry.id,adjustment:true};
    applyHistoryAdjustmentRemaining(entry,cfg);
  }
  function applyHistoryAdjustmentRemaining(entry,cfg) {
    var existingIds={};entryBonusDice(entry).forEach(function(die){existingIds[die.id]=true;});var plans=(cfg.bonusDice||[]).filter(function(die){return !existingIds[die.id];}).slice(0,Math.max(0,MAX_BONUS_DICE-entryBonusDice(entry).length)).map(function(die,index){return Object.assign(normalizeBonusDie(die,index),makeDiePlan(die.sides,die.advantageMode,die.forcedResult));});
    var sequence=state.rollSequence||{phase:"adjustment",entry:entry,cfg:snapshotRollConfig(cfg),entryId:entry.id,adjustment:true};state.rollSequence=sequence;sequence.entry=entry;sequence.cfg=snapshotRollConfig(cfg);sequence.adjustmentPlans=plans;sequence.choiceQueue=[];plans.forEach(function(die,index){if(die.result==null)sequence.choiceQueue.push({target:"adjustment",index:index,label:die.label+" d"+die.sides});});
    if(sequence.choiceQueue.length){setTrayFromEntry(entry);plans.forEach(function(die){trayDiceForPlan(die,die.label,{dieRole:"bonus"}).forEach(function(item){state.trayResults.push(item);});});state.trayResultText="Original d20 locked · choose bonus";continueAdjustmentChoices();return;}
    completeHistoryAdjustment(entry,cfg,plans);
  }
  function standaloneDestiny(dieId) {
    clearDiceTray(false);state.rollConfig=null;var spent = spendDestinyDie(dieId,true); if (!spent) return;
    var entry={id:uuid(),kind:"destiny",name:"Destiny d"+spent.sides,createdAt:new Date().toISOString(),destiny:spent,total:spent.result,outcome:spent.criticalSuccess?"Arcane Critical Success":spent.criticalFailure?"Arcane Critical Failure":spent.chaos?"Chaos risk":"Destiny spent"};
    addHistory(entry);setTrayFromEntry(entry);state.rollSequence={phase:"standalone",entryId:entry.id};queueEvents(destinyEventSpecs(spent,entry.id).concat([{text:entry.name+" · "+entry.outcome,kind:"result",entryId:entry.id}]),"finish-sequence");
  }
  function resolveNatOne(id, choice) {
    var entry=state.history.find(function (item) { return item.id===id; }); if(!entry||entry.natural!==1||entry.natChoice)return;
    var events=[];
    if(choice==="accept") { var before=state.destiny.points,recovered=setDestinyPoints(before+1,"Natural 1 accepted",true,true);entry.natChoice="accept";entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 1 accepted"};var accepted=["FATE ACCEPTED · Critical failure","Gained 1 Destiny Point","Current "+state.destiny.points];if(recovered)accepted.push("Gained a Destiny d"+recovered.sides);events.push({text:accepted.join(" · "),kind:"nat1",entryId:entry.id}); }
    // Defying fate no longer rolls Chaos on the spot: the 2d6 are deferred
    // behind a pending marker so the table is never blocked mid-turn.
    else { var oldPoints=state.destiny.points;entry.natChoice="chaos";entry.originalKept=entry.kept;entry.transformed=true;entry.kept=20;setDestinyPoints(0,"Invoked Chaos",false,true);entry.total=entryTotal(entry);addPendingFate({kind:"chaos",entryId:entry.id,name:entry.name||"Defied roll"});events.push({text:"FATE DEFIED · The 1 becomes 20"+(oldPoints?" · Destiny becomes 0":""),kind:"nat1",entryId:entry.id},{text:"CHAOS IS PENDING · 1 fatigue point per round until you face it",kind:"chaos",entryId:entry.id}); }
    setTrayFromEntry(entry);entry.outcome=outcomeFor(entry);state.trayPrompt=null;persistPlayState();
    state.rollSequence=state.rollSequence||{};state.rollSequence.entryId=entry.id;state.rollSequence.phase="open-after-events";
    queueEvents(events,"open-roll");
  }
  function runQueueDone(action){
    if(action==="roll-remaining"){rollSequenceRemaining();return;}
    if(action==="adjustment-remaining"){var sequence=state.rollSequence,adjusted=sequence&&state.history.find(function(item){return item.id===sequence.entryId;})||sequence&&sequence.entry;if(adjusted&&sequence&&sequence.cfg){if(sequence.entry&&sequence.entry.destiny)adjusted.destiny=sequence.entry.destiny;applyHistoryAdjustmentRemaining(adjusted,sequence.cfg);}else render();return;}
    if(action==="open-roll"){var landed=openEntry();if(landed)openRollState(landed);else render();return;}
    if(action==="finish-sequence"){state.rollSequence=null;state.currentEvent=null;state.eventQueue=[];persistPlayState();render();return;}
    render();
  }
  /* ── Deferred fate ───────────────────────────────────────────────
     Chaos and the Overreach save no longer interrupt the turn. They are
     carried as a pending marker: the tray stays free, a red button waits,
     and the player pays a fatigue point per round until it is resolved.
     The two mechanics stay separate — a defied natural 1 resolves 2d6 on
     the Chaos table, an Overreach resolves a save against 10 + Overreach. */
  function pendingFate(){return (state.destiny&&Array.isArray(state.destiny.pending))?state.destiny.pending:[];}
  function addPendingFate(spec){
    if(!state.destiny)return null;
    var item=Object.assign({id:uuid(),createdAt:new Date().toISOString()},spec);
    state.destiny.pending=pendingFate().concat([item]).slice(-4);
    return item;
  }
  function dropPendingFate(id){if(state.destiny)state.destiny.pending=pendingFate().filter(function(item){return item.id!==id;});}
  /* One field serves both cards: with an id it renames that badge, without one
     it pins a new note. An empty label is not a badge. */
  function savePendingLabel(id){
    var field=root&&root.querySelector("#fhPsBadgeLabel"),label=String(field&&field.value||"").trim().slice(0,24);
    if(!label){state.message="Give the badge a name first.";state.messageKind="warn";renderMessage();return;}
    if(id){var item=pendingFate().find(function(entry){return entry.id===id;});if(item)item.label=label;}
    else if(pendingFate().length>=6){state.message="Six badges is the most the strip holds.";state.messageKind="warn";renderMessage();return;}
    else addPendingFate({kind:"note",label:label});
    state.trayPrompt=null;persistPlayState();render();
  }
  // The destiny row is crowded, so the button is a short red word; the whole
  // rule lives in its tooltip and in the card it opens.
  function pendingLabel(item){
    if(item.label)return String(item.label).slice(0,24);
    return item.kind==="chaos"?"CHAOS":item.kind==="overreach"?"OVERREACH "+(Number(item.overreach)||0):"NOTE";
  }
  function pendingResolvable(item){return item.kind==="chaos"||item.kind==="overreach";}
  function pendingTitle(item){
    if(item.kind==="note")return "A reminder you pinned yourself. Click to open · right click to rename or cancel it.";
    return (item.kind==="chaos"?"Chaos is pending":"An Overreach save is pending, DC "+(Number(item.dc)||10))+
      " — 1 fatigue point per round until you face it. Click to resolve · right click to rename or cancel it.";
  }
  /* Arming a pending marker only fills the tray — ROLL is still the player's call. */
  function armPendingFate(id){
    var item=pendingFate().find(function(entry){return entry.id===id;});if(!item||!pendingResolvable(item))return;
    if(rollTransactionActive()){warnRollLocked();return;}
    state.trayPrompt=null;state.rollConfig=null;state.traySelection=[];
    if(item.kind==="chaos"){
      state.pendingArmed={id:item.id,kind:"chaos",sides:[6,6]};
      state.trayResults=[0,1].map(function(index){return {sides:6,result:null,label:"Chaos #"+(index+1),pending:true,special:"chaos",dieRole:"chaos"};});
      state.trayTitle="Chaos";state.trayResultText="Roll 2d6 and read the Chaos table";
    }else{
      state.pendingArmed={id:item.id,kind:"overreach",sides:[20],dc:Number(item.dc)||10,ability:item.ability||""};
      state.trayResults=[{sides:20,result:null,label:(item.ability||"")+" save",pending:true,dieRole:"base"}];
      state.trayTitle="Overreach save";state.trayResultText="DC "+(Number(item.dc)||10)+" — roll to hold the Weave";
    }
    persistPlayState();render();
  }
  function rollPendingFate(){
    var armed=state.pendingArmed;if(!armed)return;
    var item=pendingFate().find(function(entry){return entry.id===armed.id;});
    var entry=item&&state.history.find(function(row){return row.id===item.entryId;});
    if(armed.kind==="chaos"){
      var chaos=[rollDie(6),rollDie(6)],total=chaos[0]+chaos[1];
      if(entry){entry.chaosRoll=chaos;entry.chaosTotal=total;}
      state.trayResults=chaos.map(function(result,index){return {sides:6,result:result,label:"Chaos #"+(index+1),special:"chaos",dieRole:"chaos"};});
      state.trayTitle="Chaos";state.trayResultText="2d6 = "+chaos.join(" + ")+" = "+total;
      var chaosEntry={id:uuid(),kind:"tray",name:"Chaos"+(item&&item.name?" · "+item.name:""),dice:chaos.map(function(result){return {sides:6,result:result};}),total:total,createdAt:new Date().toISOString(),outcome:"Chaos "+total};
      addHistory(chaosEntry);
      if(item)dropPendingFate(item.id);
      state.pendingArmed=null;state.rollSequence={phase:"free-tray",entryId:chaosEntry.id};
      queueEvents([{text:"CHAOS RESOLVED · 2d6 = "+chaos.join(" + ")+" · read the "+(entry&&entry.ability||"matching")+" Chaos table",kind:"chaos",entryId:chaosEntry.id,chaosRoll:chaos}],"finish-sequence");
      return;
    }
    var ability=armed.ability||"",save={bonus:0};
    try{if(ability&&state.character)save=saveInfo(ability,state.character);}catch(error){}
    var natural=rollDie(20),total=natural+(Number(save.bonus)||0),dc=Number(armed.dc)||10,held=total>=dc;
    var saveEntry={id:uuid(),kind:"d20",name:"Overreach save"+(ability?" · "+ability:""),ability:ability,baseBonus:Number(save.bonus)||0,d20Mode:"flat",d20s:[natural],d20Roll:{sides:20,mode:"flat",rolls:[natural],result:natural,chosenIndex:0,forced:false},d20Choice:0,d20Forced:false,kept:natural,natural:natural,plusTwo:false,custom:0,bonusDice:[],guidance:null,bardic:null,destiny:null,dc:String(dc),note:"Deferred Overreach",createdAt:new Date().toISOString(),adjusted:false,total:total,outcome:held?"Success":"Failure"};
    addHistory(saveEntry);setTrayFromEntry(saveEntry);
    if(item)dropPendingFate(item.id);
    state.pendingArmed=null;state.rollSequence={phase:"free-tray",entryId:saveEntry.id};
    queueEvents([{text:(held?"WEAVE HELD":"OVERREACH BREAKS")+" · "+(ability||"Save")+" "+total+" vs DC "+dc,kind:held?"result":"chaos",entryId:saveEntry.id}],"finish-sequence");
  }

  function skillRow(info, compactName) {
    var name=compactName||info.name,bonuses=info.specialBonuses||[];
    var dots=bonuses.length?"<span class=\"fh-cd-sdots\" title=\""+esc(bonuses.map(function(item){return (item.label||"Special bonus")+" "+signed(item.value);}).join(" · "))+"\">"+bonuses.map(function(){return "<i></i>";}).join("")+"</span>":"";
    return "<div class=\"fh-cd-srow tier-"+info.tier+"\">"+
      "<button type=\"button\" data-quick-name=\""+esc(info.name)+"\" data-ability=\""+esc(info.ability)+"\" data-bonus=\""+info.bonus+"\" title=\"Roll "+esc(info.name)+" flat\">"+
      "<span class=\"fh-cd-dot\"></span><span class=\"fh-cd-sname\">"+esc(name)+dots+"</span>"+
      "<span class=\"fh-cd-sab\">"+esc(info.ability)+"</span><span class=\"fh-cd-sbonus\">"+signed(info.bonus)+"</span></button>"+
      "<button class=\"fh-cd-gear\" type=\"button\" data-config-name=\""+esc(info.name)+"\" data-ability=\""+esc(info.ability)+"\" data-bonus=\""+info.bonus+"\" aria-label=\"Configure the "+esc(info.name)+" roll\" title=\"Roll console\">"+iconSvg("gear")+"</button></div>";
  }
  function renderIdentity(ch) { return renderDockHeader(ch); }
  // Every rollable cell carries its own gear, exactly like a skill row:
  // the cell rolls flat, the gear opens the console.
  function statGear(name,ability,bonus){
    return "<button class=\"fh-cd-vgear\" type=\"button\" data-config-name=\""+esc(name)+"\" data-ability=\""+esc(ability)+"\" data-bonus=\""+bonus+"\" aria-label=\"Configure the "+esc(name)+" roll\" title=\"Roll console\">"+iconSvg("gear")+"</button>";
  }
  function renderStats(ch) {
    var chips=ABILITIES.map(function(key){
      var save=saveInfo(key,ch),abilityBonus=mod(ch.abilities[key]),checkName=ABILITY_NAMES[key]+" Check";
      return "<div class=\"fh-cd-vchip\">"+
        "<div class=\"fh-cd-vslot\">"+
        "<button class=\"fh-cd-vtop\" type=\"button\" data-quick-name=\""+checkName+"\" data-ability=\""+key+"\" data-bonus=\""+abilityBonus+"\" title=\"Roll a "+ABILITY_NAMES[key]+" check\">"+
        "<span class=\"fh-cd-vlbl\">"+key+"</span><span class=\"fh-cd-vscore\">"+ch.abilities[key]+"<sub>"+signed(abilityBonus)+"</sub></span></button>"+
        statGear(checkName,key,abilityBonus)+"</div>"+
        "<div class=\"fh-cd-vslot\">"+
        "<button class=\"fh-cd-vsave tier-"+save.tier+"\" type=\"button\" data-quick-name=\""+esc(save.name)+"\" data-ability=\""+key+"\" data-bonus=\""+save.bonus+"\" title=\"Roll a "+key+" save\">Save <b>"+signed(save.bonus)+"</b></button>"+
        statGear(save.name,key,save.bonus)+"</div></div>";
    }).join("");
    var initiative=numberOr(ch.initiative,mod(ch.abilities.DEX));
    var overrides=ch.passiveOverrides||{};
    var passives=PASSIVES.map(function(entry){
      var value=numberOr(overrides[entry[0]],10+skillInfo(entry[1],ch).bonus);
      return "<span class=\"fh-cd-pcell\" title=\"Passive "+entry[1]+"\"><small>"+entry[1]+"</small><b>"+value+"</b></span>";
    }).join("");
    var hp=state.vitals||{},hpText=hp.max==null?"—":(hp.current==null?hp.max:hp.current)+"/"+hp.max;
    var hpLow=hp.max!=null&&hp.current!=null&&hp.current<=Math.floor(hp.max/2);
    // PB, AC and the passives are read-outs, never rolls: they wear the flat
    // pill so nothing on the strip looks clickable unless it is.
    var mini="<span class=\"fh-cd-minfo\">PB <b>+"+ch.pb+"</b></span>"+
      "<span class=\"fh-cd-vslot\"><button class=\"fh-cd-mstat\" type=\"button\" data-quick-name=\"Initiative\" data-ability=\"DEX\" data-bonus=\""+initiative+"\" title=\"Roll initiative\">INIT <b>"+signed(initiative)+"</b></button>"+
      statGear("Initiative","DEX",initiative)+"</span>"+
      "<span class=\"fh-cd-minfo\">AC <b>"+(ch.armorClass==null?"—":ch.armorClass)+"</b></span>"+
      "<button class=\"fh-cd-mstat"+(hpLow?" is-hurt":"")+(state.hpOpen?" is-active":"")+"\" type=\"button\" data-hp-open title=\"Track hit points\">HP <b>"+hpText+"</b></button>"+
      "<button class=\"fh-cd-mstat is-rest\" id=\"fhPsLongRest\" type=\"button\" title=\"Long rest: +1 Destiny Point and hit points back to full\">"+iconSvg("rest")+"REST</button>";
    return "<section class=\"fh-cd-zone\" data-zone=\"vitals\"><div class=\"fh-cd-vitals\">"+chips+"</div>"+
      "<div class=\"fh-cd-mini\">"+mini+"</div>"+renderHpTracker()+
      "<div class=\"fh-cd-passives\"><span class=\"fh-cd-plabel\">PASSIVES</span>"+passives+"</div></section>";
  }
  // Collapsed to nothing until the HP cell is clicked, so it costs no height.
  function renderHpTracker() {
    if(!state.hpOpen)return "";
    var v=state.vitals||{current:null,max:null};
    return "<div class=\"fh-cd-hp\">"+
      "<button type=\"button\" data-hp-step=\"-5\" aria-label=\"Lose five hit points\">−5</button>"+
      "<button type=\"button\" data-hp-step=\"-1\" aria-label=\"Lose one hit point\">−1</button>"+
      "<input data-hp-field=\"current\" type=\"number\" value=\""+(v.current==null?"":v.current)+"\" aria-label=\"Current hit points\">"+
      "<span class=\"fh-cd-hpsep\">/</span>"+
      "<input data-hp-field=\"max\" type=\"number\" min=\"0\" value=\""+(v.max==null?"":v.max)+"\" placeholder=\"max\" aria-label=\"Maximum hit points\">"+
      "<button type=\"button\" data-hp-step=\"1\" aria-label=\"Regain one hit point\">+1</button>"+
      "<button type=\"button\" data-hp-step=\"5\" aria-label=\"Regain five hit points\">+5</button>"+
      "<button type=\"button\" data-hp-full"+(v.max==null?" disabled":"")+">FULL</button>"+
      "<button class=\"fh-cd-hpx\" type=\"button\" data-hp-open aria-label=\"Close the hit point tracker\">"+iconSvg("close")+"</button></div>";
  }
  function renderSkills(ch) {
    var half=Math.ceil(SKILLS.length/2);
    var columns=[SKILLS.slice(0,half),SKILLS.slice(half)].map(function(column){
      return "<div>"+column.map(function(entry){return skillRow(skillInfo(entry[0],ch));}).join("")+"</div>";
    }).join("");
    var tools=Object.keys(ch.skills).map(function(name){return skillInfo(name,ch);})
      .filter(function(info){return info.name.indexOf("Tool - ")===0&&info.tier!=="none";})
      .sort(function(a,b){var ai=TOOL_ORDER[a.name],bi=TOOL_ORDER[b.name];if(ai==null)ai=999;if(bi==null)bi=999;return ai-bi||a.name.localeCompare(b.name);});
    var toolHalf=Math.ceil(tools.length/2);
    var toolHtml=tools.length
      ? "<div>"+tools.slice(0,toolHalf).map(function(info){return skillRow(info,info.name.replace(/^Tool - /,""));}).join("")+"</div>"+
        "<div>"+tools.slice(toolHalf).map(function(info){return skillRow(info,info.name.replace(/^Tool - /,""));}).join("")+"</div>"
      : "<p class=\"fh-cd-notools\">No purchased tools.</p>";
    return "<section class=\"fh-cd-zone\" data-zone=\"skills\"><div class=\"fh-cd-cap\">SKILLS &amp; TOOLS<small>row = flat roll · gear = console</small></div>"+
      "<div class=\"fh-cd-skillcols\">"+columns+"<div class=\"fh-cd-tdiv\"><span>TOOLS</span><i></i></div>"+toolHtml+"</div></section>";
  }
  function cloneData(value){return JSON.parse(JSON.stringify(value==null?{}:value));}
  function characterWithoutOverrides(){
    var profile=state.profile||emptyProfile(),saved=profile.manualOverrides,character;
    profile.manualOverrides={};
    try{character=effectiveCharacter();}finally{profile.manualOverrides=saved;}
    return character;
  }
  function beginSheetEdit(source){
    var ch=source||state.character,base=characterWithoutOverrides(),passives=ch.passiveOverrides||{};
    var tools=Object.keys(ch.skills).filter(function(name){return name.indexOf("Tool - ")===0&&tierName(ch.skills[name].tier)!=="none";}).sort(function(a,b){var ai=TOOL_ORDER[a],bi=TOOL_ORDER[b];if(ai==null)ai=999;if(bi==null)bi=999;return ai-bi||a.localeCompare(b);}).map(function(name){return {name:name,ability:ch.skills[name].ability||SKILL_ABILITY[name]||"INT",tier:tierName(ch.skills[name].tier)};});
    state.editDraft={name:ch.name,species:ch.species,level:ch.level,pb:ch.pb,abilities:cloneData(ch.abilities),initiative:numberOr(ch.initiative,mod(ch.abilities.DEX)),armorClass:ch.armorClass,passives:PASSIVES.reduce(function(acc,entry){acc[entry[0]]=numberOr(passives[entry[0]],10+skillInfo(entry[1],ch).bonus);return acc;},{}),skills:{},tools:tools,specialBonuses:cloneData(ch.specialBonuses||{}),baseCharacter:base};
    Object.keys(state.editDraft.specialBonuses).forEach(function(name){state.editDraft.specialBonuses[name]=(state.editDraft.specialBonuses[name]||[]).map(function(item){return {id:item.id||uuid(),label:item.label||"Special bonus",value:numberOr(item.value,0),active:item.active!==false};});});
    SKILLS.forEach(function(entry){state.editDraft.skills[entry[0]]=tierName(ch.skills[entry[0]]&&ch.skills[entry[0]].tier);});
    state.rollConfig=null;state.activeContext=state.activeContext==="edit"?"loop":state.activeContext;render();
  }
  function captureEditDraft(){
    var d=state.editDraft;if(!d||!root)return d;
    function value(id,fallback){var input=root.querySelector(id);return input?input.value:fallback;}
    d.name=value("#fhPsEditName",d.name).trim()||d.name;d.species=value("#fhPsEditSpecies",d.species).trim()||d.species;
    d.level=Math.max(1,numberOr(value("#fhPsEditLevel",d.level),d.level));d.pb=Math.max(0,numberOr(value("#fhPsEditPb",d.pb),d.pb));
    ABILITIES.forEach(function(key){d.abilities[key]=numberOr(value('[data-edit-ability="'+key+'"]',d.abilities[key]),d.abilities[key]);});
    d.initiative=numberOr(value("#fhPsEditInitiative",d.initiative),d.initiative);var acValue=value("#fhPsEditAc",d.armorClass);d.armorClass=acValue===""?null:numberOr(acValue,d.armorClass);
    PASSIVES.forEach(function(entry){var key=entry[0];d.passives[key]=numberOr(value('[data-edit-passive="'+key+'"]',d.passives[key]),d.passives[key]);});
    root.querySelectorAll("[data-edit-skill-tier]").forEach(function(select){d.skills[select.dataset.editSkillTier]=tierName(select.value);});
    var tools=[];root.querySelectorAll("[data-edit-tool]").forEach(function(row){var name=row.dataset.editTool,tier=row.querySelector("[data-edit-tool-tier]"),ability=row.querySelector("[data-edit-tool-ability]");tools.push({name:name,tier:tierName(tier&&tier.value),ability:ability&&ability.value||SKILL_ABILITY[name]||"INT"});});d.tools=tools.filter(function(tool){return tool.tier!=="none";});
    var bonuses={};root.querySelectorAll("[data-edit-bonus-row]").forEach(function(row){var scope=row.dataset.editBonusRow,label=row.querySelector("[data-edit-bonus-label]"),amount=row.querySelector("[data-edit-bonus-value]");if(!scope||!label||!amount)return;var text=label.value.trim(),numeric=Number(amount.value);if(!text||!isFinite(numeric))return;(bonuses[scope]||(bonuses[scope]=[])).push({id:row.dataset.bonusId||uuid(),label:text,value:numeric,active:true});});d.specialBonuses=bonuses;
    return d;
  }
  function editBonusRows(name,d){
    var list=d.specialBonuses[name]||[];
    return "<div class=\"fh-ps-edit-bonuses\">"+list.map(function(item){return "<div data-edit-bonus-row=\""+esc(name)+"\" data-bonus-id=\""+esc(item.id||uuid())+"\"><i title=\"Special bonus\"></i><input data-edit-bonus-label value=\""+esc(item.label||"Special bonus")+"\" aria-label=\"Bonus name\"><input data-edit-bonus-value type=\"number\" value=\""+numberOr(item.value,0)+"\" aria-label=\"Bonus value\"><button type=\"button\" data-edit-remove-bonus=\""+esc(name)+"\" data-bonus-id=\""+esc(item.id||"")+"\" title=\"Remove bonus\">×</button></div>";}).join("")+"</div>";
  }
  function renderEditCheck(name,ability,tier,d,isTool){
    var abilityControl=isTool?"<select data-edit-tool-ability>"+ABILITIES.map(function(key){return "<option value=\""+key+"\" "+(key===ability?"selected":"")+">"+key+"</option>";}).join("")+"</select>":"<small>"+ability+"</small>";
    var attrs=isTool?"data-edit-tool=\""+esc(name)+"\"":"",tierAttr=isTool?"data-edit-tool-tier":"data-edit-skill-tier=\""+esc(name)+"\"";
    return "<div class=\"fh-ps-edit-check\" "+attrs+"><div><b>"+esc(name.replace(/^Tool - /,""))+"</b>"+abilityControl+"<select "+tierAttr+">"+tierOptions(tier)+"</select><button type=\"button\" data-edit-add-bonus=\""+esc(name)+"\" title=\"Add special bonus\">+ bonus</button>"+(isTool?"<button class=\"is-delete\" type=\"button\" data-edit-remove-tool=\""+esc(name)+"\" title=\"Remove tool\">×</button>":"")+"</div>"+editBonusRows(name,d)+"</div>";
  }
  function renderEditIdentity(d){
    return "<section class=\"fh-ps-edit-bar fh-ps-card\"><div><p>EDITING A WORKING COPY</p><b>Changes apply only after Save</b></div><div><button id=\"fhPsEditRestore\" type=\"button\">Restore DDB</button><button id=\"fhPsEditCancel\" type=\"button\">Cancel</button><button class=\"is-save\" id=\"fhPsEditSave\" type=\"button\">Save</button></div></section><section class=\"fh-ps-identity fh-ps-card is-editing\"><div class=\"fh-ps-edit-portrait\">EDIT</div><div class=\"fh-ps-edit-identity-fields\"><label>Name<input id=\"fhPsEditName\" value=\""+esc(d.name)+"\"></label><label>Species<input id=\"fhPsEditSpecies\" value=\""+esc(d.species)+"\"></label></div><div class=\"fh-ps-edit-level-fields\"><label>Level<input id=\"fhPsEditLevel\" type=\"number\" min=\"1\" max=\"30\" value=\""+d.level+"\"></label><label>PB<input id=\"fhPsEditPb\" type=\"number\" min=\"0\" max=\"20\" value=\""+d.pb+"\"></label></div></section>";
  }
  function renderEditStats(d){
    var abilities=ABILITIES.map(function(key){return "<label class=\"fh-ps-edit-stat\"><small>"+ABILITY_NAMES[key]+"</small><input data-edit-ability=\""+key+"\" type=\"number\" min=\"1\" max=\"40\" value=\""+d.abilities[key]+"\"><b>"+signed(mod(d.abilities[key]))+"</b></label>";}).join("");
    return "<section class=\"fh-ps-stats fh-ps-card is-editing\"><div class=\"fh-ps-stat-grid\">"+abilities+"</div><div class=\"fh-ps-derived fh-ps-edit-derived\"><label><small>Initiative</small><input id=\"fhPsEditInitiative\" type=\"number\" value=\""+d.initiative+"\"></label><label><small>AC</small><input id=\"fhPsEditAc\" type=\"number\" min=\"0\" max=\"99\" value=\""+(d.armorClass==null?"":d.armorClass)+"\"></label>"+PASSIVES.map(function(entry){return "<label><small>Passive "+entry[1]+"</small><input data-edit-passive=\""+entry[0]+"\" type=\"number\" value=\""+numberOr(d.passives[entry[0]],10)+"\"></label>";}).join("")+"</div></section>";
  }
  function renderEditSkills(d){
    var columns=[SKILLS.slice(0,9),SKILLS.slice(9,18),SKILLS.slice(18,26)],skillColumns=columns.map(function(column){return "<div class=\"fh-ps-edit-skill-col\">"+column.map(function(entry){return renderEditCheck(entry[0],entry[1],d.skills[entry[0]],d,false);}).join("")+"</div>";}).join("");
    var tools=d.tools.map(function(tool){return renderEditCheck(tool.name,tool.ability,tool.tier,d,true);}).join("");
    var present={};d.tools.forEach(function(tool){present[tool.name]=true;});var available=TOOLS.map(function(entry){return "Tool - "+entry[0];}).filter(function(name){return !present[name];});
    var add=available.length?"<div class=\"fh-ps-edit-add-tool\"><select id=\"fhPsEditToolChoice\">"+available.map(function(name){return "<option value=\""+esc(name)+"\">"+esc(name.replace(/^Tool - /,""))+"</option>";}).join("")+"</select><button id=\"fhPsEditAddTool\" type=\"button\">Add tool</button></div>":"";
    return "<section class=\"fh-ps-skill-board fh-ps-card is-editing\"><div class=\"fh-ps-board-title\"><div><p>26 FIXED SKILLS + OWNED TOOLS</p><h2>Edit skills &amp; tools</h2></div><span>Red dots mark persistent special bonuses</span></div><div class=\"fh-ps-edit-four-columns\">"+skillColumns+"<div class=\"fh-ps-edit-skill-col fh-ps-edit-tools\">"+tools+add+"</div></div></section>";
  }
  function renderEditSheet(){var d=state.editDraft,report=state.character&&state.character.importReport||emptyImportReport(),warnings=(report.unmappedSkills||[]).length+(report.unmappedTools||[]).length;return renderEditIdentity(d)+(warnings?renderImportReport(state.character):"")+renderEditStats(d)+renderEditSkills(d);}
  function saveSheetEdit(){
    var d=captureEditDraft(),base=d.baseCharacter||characterWithoutOverrides(),present={};d.tools.forEach(function(tool){present[tool.name]=true;});
    var deletedTools=Object.keys(base.skills||{}).filter(function(name){return name.indexOf("Tool - ")===0&&tierName(base.skills[name].tier)!=="none"&&!present[name];});
    var manualOverrides={identity:{name:d.name,species:d.species},level:d.level,pb:d.pb,abilities:d.abilities,initiative:d.initiative,armorClass:d.armorClass,passives:d.passives,skills:d.skills,tools:d.tools,deletedTools:deletedTools,specialBonuses:d.specialBonuses};
    state.message="Saving edited sheet…";state.messageKind="roll";renderMessage();saveProfile({manualOverrides:manualOverrides}).then(function(){state.editDraft=null;state.character=effectiveCharacter();state.message="Character sheet corrections saved.";state.messageKind="success";pushEvent("Character sheet edited","corrected",false);render();}).catch(function(error){state.message="Could not save edited sheet: "+error.message;state.messageKind="danger";renderMessage();});
  }
  function addEditTool(){var d=captureEditDraft(),select=root.querySelector("#fhPsEditToolChoice"),option=select&&select.querySelector("option:checked")||select&&select.querySelector("option"),raw=select&&(select.value||option&&option.getAttribute("value")),name=knownToolName(raw);if(!name||d.tools.some(function(tool){return tool.name===name;}))return;d.tools.push({name:name,ability:SKILL_ABILITY[name]||"INT",tier:"proficient"});render();}
  function removeEditTool(name){var d=captureEditDraft(),canonical=knownToolName(name);d.tools=d.tools.filter(function(tool){return tool.name!==canonical;});delete d.specialBonuses[canonical];render();}
  function addEditBonus(name){var d=captureEditDraft();if(!knownSkillName(name)&&!knownToolName(name))return;(d.specialBonuses[name]||(d.specialBonuses[name]=[])).push({id:uuid(),label:"Special bonus",value:0,active:true});render();}
  function removeEditBonus(name,id){var d=captureEditDraft();d.specialBonuses[name]=(d.specialBonuses[name]||[]).filter(function(item){return item.id!==id;});if(!d.specialBonuses[name].length)delete d.specialBonuses[name];render();}
  function addTrayDie(sides){
    sides=Number(sides);if(ROLL_DIE_SIZES.indexOf(sides)<0)return;
    /* With a console open the tray feeds the prepared roll instead of a free pool. */
    var cfg=state.rollConfig;
    if(cfg&&!cfg.editingId){
      if(sides===20||sides===100){state.message="The d20 is the base die; d% stays a free roll.";state.messageKind="warn";renderMessage();return;}
      syncConsoleInputs();
      if((cfg.bonusDice||[]).length>=MAX_BONUS_DICE){state.message="A roll carries at most "+MAX_BONUS_DICE+" bonus dice.";state.messageKind="warn";renderMessage();return;}
      var used=(cfg.bonusDice||[]).map(function(die){var match=String(die.sourceIcon||"").match(/^other-([123])$/);return match?Number(match[1]):0;});
      var slot=[1,2,3].find(function(value){return used.indexOf(value)<0;})||Math.min(3,cfg.bonusDice.length+1);
      cfg.bonusDice.push(newBonusDie("Bonus "+["","I","II","III"][slot],sides,"other-"+slot));
      syncPresetFlags(cfg);prepareTrayForConfig(cfg);render();return;
    }
    if(state.traySelection.length>=MAX_FREE_DICE){pushEvent("The free-roll tray holds at most "+MAX_FREE_DICE+" dice","warn",false);refreshEventPanel();return;}
    state.traySelection.push(newFreeDie(sides));state.trayResults=[];persistPlayState();render();
  }
  function removeTrayDie(index){state.traySelection.splice(Number(index),1);state.trayResults=[];persistPlayState();render();}
  function removeTrayDieSize(sides){sides=Number(sides);for(var i=state.traySelection.length-1;i>=0;i--){if(state.traySelection[i].sides===sides){removeTrayDie(i);return;}}}
  // The mirror of addTrayDie: right-click (or long press) takes one back off,
  // so a mis-clicked bonus die no longer forces cancelling the whole roll.
  function dropTrayDie(sides){
    sides=Number(sides);if(ROLL_DIE_SIZES.indexOf(sides)<0)return;
    var cfg=state.rollConfig;
    if(cfg&&!cfg.editingId){
      syncConsoleInputs();
      var dice=cfg.bonusDice||[];
      for(var i=dice.length-1;i>=0;i--){if(Number(dice[i].sides)===sides&&!dice[i].locked){dice.splice(i,1);syncPresetFlags(cfg);prepareTrayForConfig(cfg);render();return;}}
      return;
    }
    removeTrayDieSize(sides);
  }
  function rollTrayDice(){
    if(!state.traySelection.length)state.traySelection=[newFreeDie(20)];
    var labelInput=root&&root.querySelector("#fhPsTrayLabel");if(labelInput)state.trayLabel=String(labelInput.value||"Damage roll").slice(0,48);
    var dice=state.traySelection.map(function(die){var plan=makeDiePlan(die.sides,die.advantageMode,die.forcedResult);return {sides:die.sides,result:plan.result,rolls:(plan.rolls||[plan.result]).slice(),chosenIndex:plan.chosenIndex==null?0:plan.chosenIndex,advantageMode:rollMode(plan.mode),forced:!!plan.forced,colour:die.colour||""};}),entry={id:uuid(),kind:"tray",name:state.trayLabel||"Damage roll",dice:dice,total:dice.reduce(function(sum,die){return sum+(Number(die.result)||0);},0),createdAt:new Date().toISOString(),outcome:"Free roll"};
    addHistory(entry);setTrayFromEntry(entry);
    // No trailing result popup here either: the tray shows the verdict and the
    // stream keeps it. Only a natural 20 or 1 is worth stopping for.
    var special=dice.find(function(die){return die.sides===20&&(die.result===1||die.result===20);}),events=[];
    if(special)events.push({text:(special.result===20?"NATURAL 20 IN THE TRAY":"NATURAL 1 IN THE TRAY")+" · "+entry.name+" · Total "+entry.total,kind:special.result===20?"nat20":"nat1",entryId:entry.id});
    state.rollSequence=null;state.currentEvent=null;state.eventQueue=[];state.queueDone="";state.queueTotal=0;
    if(events.length){state.rollSequence={phase:"free-tray",entryId:entry.id};queueEvents(events,"finish-sequence");return;}
    persistPlayState();render();
  }
  function bonusSourceMark(source){
    source=String(source||"");
    if(source==="guidance")return iconSvg("guidance");
    if(source==="tactical")return iconSvg("tactical");
    if(source==="bardic")return iconSvg("bardic");
    var other=source.match(/^other-([123])$/);if(other)return "<b>"+["","I","II","III"][Number(other[1])]+"</b>";
    return iconSvg("other");
  }
  /* ── Faceted SVG dice ─────────────────────────────────────────── */
  var DIE_GEO = {
    20:{outer:"50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5",inner:["50,20 82,72 18,72"],
        edges:["50,3 50,20","9,26.5 18,72","91,26.5 82,72","9,26.5 50,20","91,26.5 50,20","50,97 18,72","50,97 82,72"],ny:56,fs:34},
    12:{outer:"50,3 95,36 78,90 22,90 5,36",inner:["50,22 76,41 66,72 34,72 24,41"],
        edges:["50,3 50,22","5,36 24,41","95,36 76,41","22,90 34,72","78,90 66,72"],ny:54,fs:32},
    10:{outer:"50,2 92,38 74,94 26,94 8,38",inner:["50,2 74,52 50,78 26,52"],
        edges:["8,38 26,52","92,38 74,52","26,94 50,78","74,94 50,78"],ny:46,fs:30},
    8:{outer:"50,2 94,50 50,98 6,50",inner:[],edges:["6,50 94,50"],ny:52,fs:30},
    6:{outer:"",inner:[],edges:[],ny:56,fs:36},
    4:{outer:"50,5 95,90 5,90",inner:[],edges:["50,5 50,62","5,90 50,62","95,90 50,62"],ny:75,fs:26},
    100:{outer:"50,2 92,38 74,94 26,94 8,38",inner:["50,2 74,52 50,78 26,52"],
         edges:["8,38 26,52","92,38 74,52","26,94 50,78","74,94 50,78"],ny:46,fs:24}
  };
  var DIE_MATERIAL = {
    ivory:{fill:"#f3ead6",light:"#fffaf0",dark:"#d5c9a9",rim:"#8a6a2a",facet:"#b3a276",num:"#58180d"},
    gold:{fill:"#d9b25e",light:"#f3dda0",dark:"#a87f26",rim:"#6d4a10",facet:"#7a5a14",num:"#3a2606"},
    green:{fill:"#3d7d56",light:"#5b9b71",dark:"#1f4a30",rim:"#143020",facet:"#1c4029",num:"#f2ead2"},
    crit:{fill:"#f0c550",light:"#fff0a8",dark:"#c68c22",rim:"#6d4a10",facet:"#8a6414",num:"#3a2606"},
    fumble:{fill:"#b51d25",light:"#d1494f",dark:"#6c1015",rim:"#4a0c10",facet:"#7d161c",num:"#fff0ee"},
    chaos:{fill:"#8f1118",light:"#e3535a",dark:"#3f0407",rim:"#ff5f67",facet:"#ff9aa0",num:"#fff0ee"},
    // The console picker: a blank die, waiting to be given a colour and a seal.
    white:{fill:"#fbf8f1",light:"#ffffff",dark:"#e3dccb",rim:"#9c8a5f",facet:"#cabfa0",num:"#5a4a2a"},
    // Player-chosen colours, offered on a right click once the die is in the tray.
    crimson:{fill:"#93303a",light:"#c05a63",dark:"#5b1620",rim:"#4a1018",facet:"#7a2530",num:"#ffeceb"},
    azure:{fill:"#2f5f86",light:"#5d8cb0",dark:"#173b57",rim:"#12293c",facet:"#23496a",num:"#eef6fd"},
    violet:{fill:"#5c3d7e",light:"#8563a6",dark:"#372049",rim:"#241432",facet:"#452c5e",num:"#f5edff"},
    slate:{fill:"#4a4f55",light:"#727880",dark:"#2b2f34",rim:"#1c1f22",facet:"#3a3e44",num:"#f0f2f4"}
  };
  // Offered in the right-click menu, in this order. "ivory" is the default.
  var DIE_COLOURS = [["ivory","Ivory"],["green","Green"],["gold","Gold"],["crimson","Crimson"],["azure","Azure"],["violet","Violet"],["slate","Slate"]];
  function dieMaterialName(die){
    if(die.special==="chaos")return "chaos";
    if(die.colour&&DIE_MATERIAL[die.colour])return die.colour;
    if(die.special==="arcane-critical-success")return "crit";
    if(die.special==="arcane-critical-failure")return "fumble";
    if(die.sides===20&&die.result===20)return "crit";
    if(die.sides===20&&die.result===1)return "fumble";
    if(die.dieRole==="destiny")return "gold";
    if(die.dieRole==="bonus")return "green";
    return "ivory";
  }
  function dieSvg(sides,size,materialName,text){
    var geo=DIE_GEO[sides]||DIE_GEO[20],m=DIE_MATERIAL[materialName]||DIE_MATERIAL.ivory,id="g"+materialName+sides;
    var out='<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
    out+='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="'+m.light+'"/><stop offset=".55" stop-color="'+m.fill+'"/><stop offset="1" stop-color="'+m.dark+'"/></linearGradient>'+
      '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
    if(sides===6){
      out+='<rect x="8" y="8" width="84" height="84" rx="16" fill="url(#'+id+')" stroke="'+m.rim+'" stroke-width="3"/>';
      out+='<rect x="19" y="19" width="62" height="62" rx="10" fill="none" stroke="'+m.facet+'" stroke-width="1.6"/>';
      out+='<rect class="fh-cd-glint" x="8" y="8" width="84" height="84" rx="16" fill="url(#'+id+'s)" opacity="0"/>';
    }else{
      out+='<polygon points="'+geo.outer+'" fill="url(#'+id+')" stroke="'+m.rim+'" stroke-width="3" stroke-linejoin="round"/>';
      geo.inner.forEach(function(points){out+='<polygon points="'+points+'" fill="none" stroke="'+m.facet+'" stroke-width="1.6" stroke-linejoin="round"/>';});
      geo.edges.forEach(function(points){out+='<polyline points="'+points+'" fill="none" stroke="'+m.facet+'" stroke-width="1.4"/>';});
      out+='<polygon class="fh-cd-glint" points="'+geo.outer+'" fill="url(#'+id+'s)" opacity="0"/>';
    }
    out+='<text class="fh-cd-num" x="50" y="'+geo.ny+'" font-size="'+geo.fs+'" text-anchor="middle" dominant-baseline="middle" fill="'+m.num+'">'+esc(text==null?"?":text)+'</text>';
    return out+"</svg>";
  }
  function tokenSvg(size,label,tone){
    var body=tone==="mod"?{fill:"#b0763a",rim:"#6e451a",facet:"#8a5a26",num:"#fdf3dd"}:{fill:"#d9b25e",rim:"#6d4a10",facet:"#7a5a14",num:"#3a2606"};
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'+
      '<circle cx="50" cy="50" r="42" fill="'+body.fill+'" stroke="'+body.rim+'" stroke-width="4"/>'+
      '<circle cx="50" cy="50" r="32" fill="none" stroke="'+body.facet+'" stroke-width="1.6"/>'+
      '<text class="fh-cd-num" x="50" y="54" font-size="28" text-anchor="middle" dominant-baseline="middle" fill="'+body.num+'">'+esc(label)+'</text></svg>';
  }
  function dieSize(count){return count>8?26:count>5?34:count>3?44:52;}
  function visualDie(die,index,count,animate){
    var classes=["fh-cd-diewrap"];
    if(die.dropped)classes.push("is-dropped");
    if(die.pending)classes.push("is-pending");
    if(die.flash)classes.push("is-flashing");
    if(die.forced)classes.push("is-forced");
    if(die.special==="chaos")classes.push("is-chaosdie");
    var status=die.forced?" · MANUAL":die.pending?" · ready":die.dieRole==="destiny"&&die.result!=null?" · spent":"";
    var size=dieSize(count||1);
    if(die.kind==="modifier"){
      var tone=die.label==="FH bonus"?"fh":"mod",text=(Number(die.result)||0)>=0?"+"+Math.abs(Number(die.result)||0):String(die.result);
      classes.push("is-modifier");
      return "<span class=\""+classes.join(" ")+"\"><span class=\"fh-cd-src\"></span><span class=\"fh-cd-die fh-cd-token\">"+tokenSvg(Math.round(size*.68),text,tone)+"</span><em>"+esc(die.label||"Bonus")+"</em></span>";
    }
    var source=die.dieRole==="bonus"?"<span class=\"fh-cd-src\" title=\""+esc(die.label||"Bonus die")+"\">"+bonusSourceMark(die.sourceIcon)+"</span>":"<span class=\"fh-cd-src\"></span>";
    var dieClasses="fh-cd-die"+(die.result!=null?" is-landed":"")+(animate&&die.result!=null?" is-spinning":"");
    // A die still in the hand carries its identity so a right click can reach it.
    var handle="";
    if(die.pending&&die.result==null){
      if(die.stagedId)handle=" data-die-staged=\""+esc(die.stagedId)+"\"";
      else if(die.bonusId)handle=" data-die-bonus=\""+esc(die.bonusId)+"\"";
      else if(die.destinyDieId)handle=" data-die-destiny=\""+esc(die.destinyDieId)+"\"";
      else if(die.freeId)handle=" data-die-free=\""+esc(die.freeId)+"\"";
      else if(die.dieRole==="base")handle=" data-die-base=\"1\"";
      if(handle){classes.push("is-tunable");handle+=" title=\"Right click or long press: colour, advantage, Portent\"";}
    }
    return "<span class=\""+classes.join(" ")+"\""+handle+">"+source+
      "<span class=\""+dieClasses+"\">"+dieSvg(die.sides,size,dieMaterialName(die),die.result==null?"?":die.result)+"</span>"+
      "<em>"+esc((die.label||("d"+die.sides))+status)+"</em></span>";
  }
  /* Prompts and blocking events only — the running log lives in the Stream zone. */
  function renderEventContent(){
    var prompt=state.trayPrompt;
    if(prompt&&prompt.type==="die-choice"){
      var choiceLabel=prompt.mode==="choice"?"A / D":"CHOOSE RESULT";
      return "<div class=\"fh-cd-card is-die-choice\"><small>"+choiceLabel+"</small><b>Choose the result to keep</b><p>"+esc(prompt.label)+" · either result may be chosen.</p><div class=\"fh-cd-choice\">"+(prompt.rolls||[]).map(function(result,index){
        return "<button type=\"button\" data-die-choice=\""+index+"\" class=\"fh-cd-die\" aria-label=\"Keep "+result+"\">"+dieSvg(prompt.sides,44,dieMaterialName({sides:prompt.sides,result:result,dieRole:prompt.dieRole}),result)+"</button>";
      }).join("")+"</div></div>";
    }
    if(prompt&&prompt.type==="add-destiny"){
      var addDie=state.destiny.dice.find(function(item){return item.id===prompt.dieId&&item.available;});
      if(addDie)return "<div class=\"fh-cd-card is-destiny\"><small>DESTINY d"+addDie.sides+"</small><b>Add this Destiny die to the Dice Tray?</b><p>"+esc(prompt.context||"")+(prompt.context?" · ":"")+"It is reserved, not spent. It will roll before every other die.</p><div class=\"fh-cd-acts\"><button class=\"is-ghost\" data-tray-cancel>Cancel</button><button data-tray-confirm-destiny>Add to tray</button></div></div>";
    }
    if(prompt&&prompt.type==="destiny"){
      var die=state.destiny.dice.find(function(item){return item.id===prompt.dieId&&item.available;});
      if(die)return "<div class=\"fh-cd-card is-destiny\"><small>DESTINY d"+die.sides+"</small><b>Roll and spend this Destiny die?</b><p>"+esc(prompt.context||"")+(prompt.context?" · ":"")+"Current Points: "+state.destiny.points+" · the result will change your Destiny.</p><div class=\"fh-cd-acts\"><button class=\"is-ghost\" data-tray-cancel>Cancel</button><button data-tray-confirm-destiny>Roll &amp; spend</button></div></div>";
    }
    /* Pinning a badge by hand: anything the table must not forget. */
    if(prompt&&prompt.type==="pending-new"){
      return "<div class=\"fh-cd-card is-badgemenu\"><small>PIN A BADGE</small><b>What must not be forgotten?</b>"+
        "<p>It stays above the tray until you cancel it — CLEAR TRAY does not touch it.</p>"+
        "<div class=\"fh-cd-dmrow\"><input id=\"fhPsBadgeLabel\" maxlength=\"24\" value=\"\" placeholder=\"Concentration, Rage, 2 rounds…\" aria-label=\"Badge label\"></div>"+
        "<div class=\"fh-cd-acts\"><button class=\"is-ghost\" data-tray-close>Cancel</button><button data-pending-save>Pin it</button></div></div>";
    }
    /* Right click on a badge: rename it, or take it back. */
    if(prompt&&prompt.type==="pending-menu"){
      var edited=pendingFate().find(function(item){return item.id===prompt.id;});
      if(edited){
        return "<div class=\"fh-cd-card is-badgemenu\"><small>BADGE · "+esc(pendingLabel(edited))+"</small><b>Rename it, or take it back</b>"+
          "<div class=\"fh-cd-dmrow\"><input id=\"fhPsBadgeLabel\" maxlength=\"24\" value=\""+esc(pendingLabel(edited))+"\" aria-label=\"Badge label\"></div>"+
          "<div class=\"fh-cd-acts\"><button class=\"is-danger\" data-pending-drop=\""+esc(edited.id)+"\">Cancel the badge</button>"+
          "<button data-pending-save=\""+esc(edited.id)+"\">Rename</button><button class=\"is-ghost\" data-tray-close>Close</button></div></div>";
      }
      state.trayPrompt=null;
    }
    /* Deferred fate: informational, never blocking. OK leaves it waiting. */
    if(prompt&&prompt.type==="pending"){
      var waiting=pendingFate().find(function(item){return item.id===prompt.id;});
      if(waiting&&waiting.kind==="note"){
        // A pinned reminder has nothing to resolve: opening it is editing it.
        return "<div class=\"fh-cd-card is-badgemenu\"><small>BADGE</small><b>"+esc(pendingLabel(waiting))+"</b>"+
          "<p>A reminder you pinned. It survives CLEAR TRAY and only goes when you cancel it.</p>"+
          "<div class=\"fh-cd-dmrow\"><input id=\"fhPsBadgeLabel\" maxlength=\"24\" value=\""+esc(pendingLabel(waiting))+"\" aria-label=\"Badge label\"></div>"+
          "<div class=\"fh-cd-acts\"><button class=\"is-danger\" data-pending-drop=\""+esc(waiting.id)+"\">Cancel the badge</button>"+
          "<button data-pending-save=\""+esc(waiting.id)+"\">Rename</button><button class=\"is-ghost\" data-tray-close>Close</button></div></div>";
      }
      if(waiting){
        var isChaos=waiting.kind==="chaos";
        return "<div class=\"fh-cd-card is-chaos\"><small>"+(isChaos?"CHAOS IS PENDING":"OVERREACH IS PENDING")+"</small><b>"+(isChaos?"Chaos has noticed.":"The Weave is over-drawn.")+"</b><p>"+
          (isChaos?"It resolves when you choose to face it. While it waits you take 1 fatigue point per round — no saving throw, no tracking."
            :esc(waiting.ability||"An ability")+" save against DC "+(Number(waiting.dc)||10)+", resolved when you choose. While it waits you take 1 fatigue point per round — no tracking.")+
          "</p><div class=\"fh-cd-acts\"><button class=\"is-ghost\" data-tray-close>OK</button><button class=\"is-danger\" data-pending-resolve=\""+esc(waiting.id)+"\">Resolve now</button></div></div>";
      }
    }
    if(prompt&&prompt.type==="nat1")return "<div class=\"fh-cd-card is-nat1\"><small>NATURAL 1</small><b>Do you accept your fate?</b><p>Yes: critical failure, +1 Destiny Point. No: the 1 becomes 20, Destiny falls to 0 and Chaos becomes pending.</p><div class=\"fh-cd-acts\"><button data-tray-accept-fate>Accept · +1 pt</button><button class=\"is-danger\" data-tray-refuse-fate>Refuse</button></div></div>";
    if(prompt&&prompt.type==="chaos"){
      var chaosEntry=state.history.find(function(item){return item.id===prompt.entryId;}),roll=chaosEntry&&chaosEntry.chaosRoll||[0,0];
      return "<div class=\"fh-cd-card is-chaos\"><small>FATE DEFIED</small><b>Chaos has noticed.</b><p>2d6 = "+roll[0]+" + "+roll[1]+" = "+(roll[0]+roll[1])+" · the d20 becomes 20 · Destiny becomes 0.</p><div class=\"fh-cd-acts\"><a href=\""+esc(toolUrl("rules",""))+"chapters/chaos-tables/\">Chaos table</a><button data-tray-close>OK</button></div></div>";
    }
    if(prompt&&prompt.type==="awakening"){
      var arcana=state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};
      return "<div class=\"fh-cd-card is-awakening\"><small>DESTINY REACHES ZERO</small><b>Arcane Awakening</b><p>Natural 20 · "+esc(arcana.name||"Major Arcana")+"</p><div class=\"fh-cd-acts\"><button data-tray-close>OK</button></div></div>";
    }
    /* Right click on a die that has not left the hand yet: its colour, its seal
       and its own advantage, in one card instead of three menus. */
    if(state.diePrompt){
      var target=findStagedDie(state.diePrompt);
      if(target){
        var seals=[["","None"],["guidance","Guidance"],["bardic","Bardic"],["other-1","I"],["other-2","II"],["other-3","III"]];
        var poolReady=state.destiny.dice.some(function(die){return die.available&&die.sides===target.sides;});
        var canSeal=target.scope==="bonus"||target.scope==="staged";
        var canTune=true;
        /* A/D means "roll two, choose afterwards" — that needs a choice prompt,
           and the free tray has no resolver for one. Free dice get A and D, which
           settle themselves, but not A/D. */
        var modes=target.scope==="free"?["flat","advantage","disadvantage"]:["flat","advantage","disadvantage","choice"];
        // A free damage die has neither a source nor an advantage: only a colour.
        var sealRow=!canSeal?"":"<div class=\"fh-cd-dmrow\"><span>Seal</span>"+seals.map(function(pair){
            return "<button type=\"button\" class=\"fh-cd-dmseal"+((target.sourceIcon||"")===pair[0]?" is-on":"")+"\" data-die-seal=\""+pair[0]+"\" title=\""+pair[1]+"\">"+(pair[0]?bonusSourceMark(pair[0]):"—")+"</button>";
          }).join("")+
          "<button type=\"button\" class=\"fh-cd-dmseal is-destiny\" data-die-seal=\"destiny\""+(poolReady?"":" disabled")+" title=\""+(poolReady?"Spend a Destiny d"+target.sides+" instead — this costs Destiny Points":"No Destiny d"+target.sides+" available")+"\">★</button></div>";
        var modeRow=!canTune?"":"<div class=\"fh-cd-dmrow\"><span>Roll</span>"+modes.map(function(mode){
            var short=mode==="flat"?"—":mode==="advantage"?"A":mode==="disadvantage"?"D":"A/D";
            return "<button type=\"button\" class=\"fh-cd-dmmode"+((target.advantageMode||"flat")===mode?" is-on":"")+"\" data-die-mode-set=\""+mode+"\">"+short+"</button>";
          }).join("")+"</div>";
        /* The Portent used to hide in a FINE TUNE drawer. It belongs to one die,
           so it lives with that die — as a dropdown, not a number spinner. */
        var forced=target.forcedResult==null?"":String(target.forcedResult);
        var portentRow=!canTune?"":"<div class=\"fh-cd-dmrow\"><span>Portent</span>"+
          "<select class=\"fh-cd-dmportent"+(forced?" is-on":"")+"\" data-die-portent aria-label=\"Force this die's result\" title=\"Force this die to a chosen result — the roll is marked MANUAL\">"+
          "<option value=\"\">— roll it</option>"+
          Array.from({length:target.sides},function(_,index){var value=index+1;return "<option value=\""+value+"\""+(forced===String(value)?" selected":"")+">"+value+"</option>";}).join("")+
          "</select></div>";
        return "<div class=\"fh-cd-card is-diemenu\"><small>d"+target.sides+" · "+esc(target.label||"Die")+"</small>"+sealRow+
          "<div class=\"fh-cd-dmrow\"><span>Colour</span>"+DIE_COLOURS.map(function(pair){
            return "<button type=\"button\" class=\"fh-cd-dmcol"+((target.colour||"ivory")===pair[0]?" is-on":"")+"\" data-die-colour=\""+pair[0]+"\" title=\""+pair[1]+"\">"+dieSvg(6,15,pair[0],"")+"</button>";
          }).join("")+"</div>"+modeRow+portentRow+
          // Removes THIS die only — emptying the whole tray is the permanent CLEAR TRAY.
          "<div class=\"fh-cd-acts\">"+(target.scope==="base"?"":"<button class=\"is-ghost\" data-die-drop>Remove this die</button>")+"<button data-tray-close>Done</button></div></div>";
      }
      state.diePrompt=null;
    }
    if(state.currentEvent){
      var current=state.currentEvent;
      var progress=current.total>1?"<small>EVENT "+current.progress+" OF "+current.total+"</small>":"<small>"+esc(String(current.kind||"event").toUpperCase().replace(/-/g," "))+"</small>";
      var isFinal=current.blocking&&current.progress===current.total&&state.queueDone==="finish-sequence",action=current.blocking?(isFinal?"Finish":"Continue"):"OK";
      var parts=String(current.text||"").split(" · "),headline=parts.shift()||"Fate moves";
      if(current.kind==="awakening"){var awakenArcana=state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};if(awakenArcana.name)parts.push(esc(awakenArcana.name));}
      if(current.chaosRoll)parts.push("total "+(Number(current.chaosRoll[0])+Number(current.chaosRoll[1])));
      return "<div class=\"fh-cd-card is-"+esc(current.kind)+"\">"+progress+"<b>"+esc(headline)+"</b><p>"+esc(parts.join(" · "))+"</p><div class=\"fh-cd-acts\">"+(current.kind==="chaos"?"<a href=\""+esc(toolUrl("rules",""))+"chapters/chaos-tables/\">Chaos table</a>":"")+"<button data-event-ok>"+action+"</button></div></div>";
    }
    return "";
  }
  function trayDiceForDisplay(){
    if(state.trayResults.length)return state.trayResults;
    if(state.rollConfig)return [];
    return state.traySelection.map(function(die){return {sides:die.sides,result:forcedDieResult(die.forcedResult,die.sides),label:"d"+die.sides,dieRole:"base",pending:true,freeId:die.id,colour:die.colour||"",forced:die.forcedResult!=null};});
  }
  function renderFrameInner(){
    var dice=trayDiceForDisplay();
    var signature=dice.map(function(die){return (die.label||"")+":"+(die.result==null?"?":die.result);}).join("|");
    var animate=signature!==state.diceSignature;state.diceSignature=signature;
    var status=state.trayResultText||state.trayTitle
      ? "<b>"+esc(state.trayTitle||"")+"</b>"+(state.trayResultText?"<em>"+esc(state.trayResultText)+"</em>":"")
      : "<em>Ready — click a skill, a save or an ability.</em>";
    // The verdict docks to the bottom of the frame; popups now live outside it.
    return "<div class=\"fh-cd-dicerow\">"+dice.map(function(die,index){return visualDie(die,index,dice.length,animate);}).join("")+"</div>"+
      "<div class=\"fh-cd-status\" aria-live=\"polite\">"+status+"</div>";
  }
  /* One ROLL, one CLEAR TRAY. Nothing else is permanent. Below them the
     transient badges, then the tray, then whatever popup is owed — which
     pushes the stream down instead of covering the dice. */
  function rollSummaryText(){
    var cfg=state.rollConfig,staged=stagedList().length;
    if(state.pendingArmed)return state.pendingArmed.kind==="chaos"?"2d6 · Chaos table":"d20 save · DC "+(Number(state.pendingArmed.dc)||10);
    if(rollOpen())return staged?staged+" new die"+(staged===1?"":"s"):"the same check again";
    if(!cfg)return state.traySelection.length?(state.traySelection.length===1?"1 die":state.traySelection.length+" dice"):"pick dice above";
    var summary=[(cfg.d20Mode==="advantage"?"2d20kh ":cfg.d20Mode==="disadvantage"?"2d20kl ":cfg.d20Mode==="choice"?"2d20 A/D ":"d20 ")+signed(Number(cfg.baseBonus)+(cfg.plusTwo?2:0)+(Number(cfg.custom)||0))];
    (cfg.bonusDice||[]).forEach(function(die){summary.push(die.label.slice(0,4)+" d"+die.sides);});
    if(cfg.destinyDieId)summary.unshift("★");
    return summary.join(" · ");
  }
  function renderStageZone(){
    var busy=rollTransactionActive(),armed=state.pendingArmed;
    /* The badge strip is always there: it carries what the table still owes,
       and the … pins a reminder of your own beside it. */
    var badges=pendingFate().map(function(item){
      return "<button type=\"button\" class=\"fh-cd-pending"+(item.kind==="note"?" is-note":"")+"\" data-pending-open=\""+esc(item.id)+"\" data-pending-id=\""+esc(item.id)+"\" title=\""+esc(pendingTitle(item))+"\">"+esc(pendingLabel(item))+"</button>";
    }).join("")+
      "<button type=\"button\" class=\"fh-cd-pendadd\" data-pending-add title=\"Pin a reminder of your own\" aria-label=\"Pin a badge\">…</button>";
    var popup=renderEventContent();
    return "<section class=\"fh-cd-stage\" data-zone=\"roller\">"+
      "<div class=\"fh-cd-acts-bar\">"+
      "<button class=\"fh-cd-mainroll"+(armed?" is-chaos":"")+"\" type=\"button\" data-roll-now"+(busy?" disabled":"")+">ROLL<small>"+esc(rollSummaryText())+"</small></button>"+
      "<button class=\"fh-cd-mainclear\" type=\"button\" data-clear-tray"+(busy?" disabled title=\"Answer the popup first\"":"")+">CLEAR<i> TRAY</i></button></div>"+
      "<div class=\"fh-cd-temps\">"+badges+"</div>"+
      "<div class=\"fh-cd-frame\">"+renderFrameInner()+"</div>"+
      (popup?"<div class=\"fh-cd-popups\">"+popup+"</div>":"")+
      "</section>";
  }
  function renderDestiny(ch) {
    var arcana=ch.destinyBuild&&ch.destinyBuild.arcana||{};
    var overflow=Math.max(0,Number(state.destiny.points)-Number(state.destiny.score));
    // An open roll can still take one Destiny die: the pool calls for it, briefly.
    var landed=rollOpen()?openEntry():null;
    var calling=callingNow()&&!!landed&&!landed.destiny&&!stagedList().some(function(item){return item.kind==="destiny";});
    var dice=DIE_SEQUENCE.map(function(sides){
      var available=state.destiny.dice.filter(function(die){return die.sides===sides&&die.available;}),die=available[0];
      var selected=die&&state.rollConfig&&state.rollConfig.destinyDieId===die.id;
      return "<span class=\"fh-cd-poolwrap\"><span class=\"fh-cd-poolstack\">"+
        "<button type=\"button\" data-destiny-pool=\""+sides+":1\""+(available.length>=3?" disabled":"")+" aria-label=\"Add one Destiny d"+sides+"\">+</button>"+
        "<button type=\"button\" data-destiny-pool=\""+sides+":-1\""+(available.length?"":" disabled")+" aria-label=\"Remove one Destiny d"+sides+"\">−</button></span>"+
        "<button type=\"button\" class=\"fh-cd-ddie"+(die?"":" is-empty")+(selected?" is-selected":"")+(die&&calling?" is-calling":"")+"\" "+(die?"data-destiny-die=\""+die.id+"\"":"disabled")+" aria-label=\""+(die?"Spend":"No")+" Destiny d"+sides+"\">"+
        dieSvg(sides,26,die?"gold":"ivory","d"+sides)+(available.length>1?"<span class=\"fh-cd-mult\">×"+available.length+"</span>":"")+"</button></span>";
    }).join("");
    // The Score changes once in a campaign, so it is plain text with a
    // click-to-edit affordance instead of a permanently locked input.
    var score=state.scoreEditing
      ? "<input class=\"fh-cd-scorein\" data-destiny-field=\"score\" type=\"number\" value=\""+state.destiny.score+"\" aria-label=\"Destiny Score\">"
      : "<button class=\"fh-cd-score\" type=\"button\" data-score-edit title=\"Click to change the Destiny Score\">"+state.destiny.score+"</button>";
    return "<section class=\"fh-cd-zone\" data-zone=\"destiny\"><div class=\"fh-cd-destiny-row\">"+
      "<span class=\"fh-cd-dgroup is-pts\"><span class=\"fh-cd-pts\">"+
      "<button type=\"button\" data-destiny-step=\"points:-1\" aria-label=\"One Destiny Point less\">−</button>"+
      "<input data-destiny-field=\"points\" type=\"number\" value=\""+state.destiny.points+"\" aria-label=\"Current Destiny Points\">"+
      "<button type=\"button\" data-destiny-step=\"points:1\" aria-label=\"One Destiny Point more\">+</button></span>"+
      "<span class=\"fh-cd-dlab\">POINTS</span></span>"+
      "<span class=\"fh-cd-dslash\">/</span>"+
      "<span class=\"fh-cd-dgroup is-score\"><span class=\"fh-cd-dlab\">SCORE</span>"+score+"</span>"+
      (overflow?"<b class=\"fh-cd-overflow\" title=\"Points above your Score\">+"+overflow+"</b>":"")+
      "<span class=\"fh-cd-pool\">"+dice+"</span>"+
      "<span class=\"fh-cd-arcana\" title=\"Your Major Arcana — a pool die powers or rescues a roll\">"+esc(arcana.name||"Major Arcana")+"</span>"+
      "</div></section>";
  }
  /* ── Stream: one finished roll per line, shaped for a later AboveVTT export ── */
  function outcomeTone(entry){
    var outcome=String(entry.outcome||"");
    if(/critical success|natural 20/i.test(outcome))return "n20";
    if(/failure/i.test(outcome))return "bad";
    if(/^success/i.test(outcome))return "ok";
    return "";
  }
  function rollParts(entry){
    var parts=[];
    if(entry.kind==="d20"){
      var mode=entry.d20Mode&&entry.d20Mode!=="flat"?" ("+(entry.d20Mode==="advantage"?"adv":entry.d20Mode==="choice"?"A/D":"dis")+")":"";
      var value=(entry.d20s||[]).join(" / ");
      if((entry.d20s||[]).length>1)value+=" → "+entry.kept;
      if(entry.transformed)value=(entry.originalKept!=null?entry.originalKept:1)+" → Fate refused → 20";
      parts.push({k:"d20"+mode+(entry.d20Forced?" · MANUAL":""),v:value});
      parts.push({k:entry.name,v:signed(entry.baseBonus)});
      entryBonusDice(entry).forEach(function(die){parts.push({k:die.label+" d"+die.sides+(die.forced?" · MANUAL":""),v:String(die.result)});});
      if(entry.plusTwo)parts.push({k:"FH",v:"+2"});
      if(entry.custom)parts.push({k:"Mod",v:signed(entry.custom)});
      if(entry.destiny)parts.push({k:"Destiny d"+entry.destiny.sides+(entry.destiny.forced?" · MANUAL":""),v:String(entry.destiny.result)});
    }else if(entry.kind==="tray"){
      (entry.dice||[]).forEach(function(die){parts.push({k:"d"+die.sides,v:String(die.result)});});
    }else if(entry.destiny){
      parts.push({k:"Destiny d"+entry.destiny.sides,v:String(entry.destiny.result)});
    }
    return parts;
  }
  function rollBadges(entry){
    var badges=[];
    if(entry.natural===20)badges.push({t:"NATURAL 20",k:"n20"});
    if(entry.natural===1&&entry.natChoice==="accept")badges.push({t:"NATURAL 1 accepted",k:"chaos"});
    if(entry.natChoice==="chaos")badges.push({t:"Fate refused",k:"chaos"});
    if(entry.chaosRoll)badges.push({t:"Chaos 2d6 = "+(entry.chaosRoll[0]+entry.chaosRoll[1]),k:"chaos"});
    if(entry.destiny){
      var spent=entry.destiny,change=Number(spent.pointsAfter)-Number(spent.pointsBefore);
      var head=spent.criticalSuccess?"Arcane Critical Success":spent.criticalFailure?"Arcane Critical Failure":"Destiny d"+spent.sides+"="+spent.result;
      badges.push({t:head+(isFinite(change)&&change?" · "+(change>0?"+":"")+change+" pt → "+spent.pointsAfter:""),k:"destiny"});
      if(spent.chaos)badges.push({t:"Overreach "+spent.chaos.overreach+" · save DC "+spent.chaos.dc,k:"chaos"});
    }
    if(entry.destinyPointChange)badges.push({t:entry.destinyPointChange.reason+" · Destiny "+entry.destinyPointChange.after,k:"destiny"});
    if(entry.awakening)badges.push({t:"ARCANE AWAKENING",k:"n20"});
    if(!!entry.d20Forced||!!(entry.destiny&&entry.destiny.forced)||entryBonusDice(entry).some(function(die){return die.forced;}))badges.push({t:"MANUAL",k:"manual"});
    if(entry.adjusted)badges.push({t:"adjusted",k:"adjusted"});
    return badges;
  }
  function rollExport(entry){
    return {schema:"fh-roll/1",id:entry.id,ts:entry.createdAt,campaign:state.code,
      character:state.character&&state.character.name||state.pseudo,kind:entry.kind,title:entry.name,
      ability:entry.ability||null,total:entry.total,dc:entry.dc===""||entry.dc==null?null:Number(entry.dc),
      outcome:entry.outcome||null,natural:entry.natural==null?null:entry.natural,
      parts:rollParts(entry),badges:rollBadges(entry).map(function(badge){return badge.t;})};
  }
  function attrJson(value){return esc(JSON.stringify(value)).replace(/'/g,"&#39;");}
  function renderStreamEntry(entry){
    var tone=outcomeTone(entry),icon=tone==="ok"?"✓":tone==="bad"?"✗":tone==="n20"?"✦":"";
    var who=state.character&&state.character.name||state.pseudo||"Character";
    var parts=rollParts(entry).map(function(part){return "<span class=\"fh-cd-part\">"+esc(part.k)+" <b>"+esc(part.v)+"</b></span>";}).join("<span>·</span>");
    var dc=entry.dc!==""&&entry.dc!=null?"<span class=\"fh-cd-vs\">vs DC "+esc(entry.dc)+"</span>":"";
    var badges=rollBadges(entry).map(function(badge){return "<span class=\"fh-cd-badge is-"+badge.k+"\">"+esc(badge.t)+"</span>";}).join("");
    var reopen=entry.kind==="d20";
    return "<li class=\"fh-cd-sentry\"><button type=\"button\""+(reopen?" data-history-id=\""+esc(entry.id)+"\"":" disabled")+" data-roll='"+attrJson(rollExport(entry))+"'>"+
      "<span class=\"fh-cd-sl1\"><time>"+nowLabel(entry.createdAt)+"</time><span class=\"fh-cd-who\">"+esc(who)+"</span>"+
      "<span class=\"fh-cd-title\">"+esc(entry.name)+"</span><span class=\"fh-cd-total is-"+tone+"\">"+entry.total+"</span><span class=\"fh-cd-oic\">"+icon+"</span></span>"+
      "<span class=\"fh-cd-sl2\">"+parts+dc+badges+"</span></button></li>";
  }
  function renderStream(){
    var rolls=state.history.slice(0,MAX_HISTORY);
    return "<section class=\"fh-cd-zone fh-cd-stream\" data-zone=\"stream\"><div class=\"fh-cd-cap\">STREAM<small>every roll, fully resolved</small></div>"+
      "<ul class=\"fh-cd-streamlist\">"+(rolls.length?rolls.map(renderStreamEntry).join(""):"<p>No rolls yet.</p>")+"</ul></section>";
  }
  function configFromEntry(entry) {
    var dice=entryBonusDice(entry).map(function(die){die.locked=true;return die;});
    return {editingId:entry.id,name:entry.name,ability:entry.ability,baseBonus:entry.baseBonus,d20Mode:entry.d20Mode||"flat",d20ForcedResult:entry.d20Forced?entry.kept:null,plusTwo:!!entry.plusTwo,guidance:!!entry.guidance,bardic:!!entry.bardic,bardicSides:entry.bardic?entry.bardic.sides:Number(state.prefs.bardicSides)||6,bonusDice:dice,destinyDieId:"",destinyConfirmed:false,destinyMode:entry.destiny&&entry.destiny.advantageMode||"flat",destinyForcedResult:entry.destiny&&entry.destiny.forced?entry.destiny.result:null,custom:Number(entry.custom)||0,dc:entry.dc,note:entry.note||""};
  }
  // Fine tune only — A/D (choose after the roll) comes from Major Arcana powers
  // on Destiny dice, so it is never offered on the main console strip.
  function renderConsole() {
    var cfg=state.rollConfig,entry=cfg&&cfg.editingId?state.history.find(function(item){return item.id===cfg.editingId;}):null;
    var locked=!!entry,open=rollOpen();
    var bonusDice=cfg?(cfg.bonusDice||[]):[];
    // Head: a loaded check names itself; a free roll gets a label to name itself.
    var head=cfg
      ? "<div class=\"fh-cd-crow fh-cd-chead\"><span class=\"fh-cd-cname\">"+esc(cfg.name)+" <b>"+signed(cfg.baseBonus)+"</b></span>"+
        "<span class=\"fh-cd-cmeta\">"+esc(cfg.note||cfg.ability||"")+"</span>"+
        "<button class=\"fh-cd-cclose\" id=\"fhPsCloseConsole\" type=\"button\" aria-label=\"Close the roll console\">"+iconSvg("close")+"</button></div>"
      : "<div class=\"fh-cd-crow fh-cd-chead\"><span class=\"fh-cd-cname is-free\">FREE ROLL</span>"+
        "<input id=\"fhPsTrayLabel\" maxlength=\"48\" value=\""+esc(state.trayLabel)+"\" placeholder=\"Damage / free roll…\" aria-label=\"Roll label\"></div>";
    // Row 1 belongs to a check: modes, the fixed +2, the manual modifier, the DC.
    var row1="";
    if(cfg){
      row1="<div class=\"fh-cd-crow\"><span class=\"fh-cd-seg\">"+
        "<button type=\"button\" class=\"is-disadvantage"+(cfg.d20Mode==="disadvantage"?" is-on":"")+"\" data-die-mode=\"disadvantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Disadvantage\">D</button>"+
        "<button type=\"button\" class=\""+(cfg.d20Mode==="flat"?"is-on":"")+"\" data-die-mode=\"flat\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Flat roll\">—</button>"+
        "<button type=\"button\" class=\"is-advantage"+(cfg.d20Mode==="advantage"?" is-on":"")+"\" data-die-mode=\"advantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Advantage\">A</button></span>"+
        "<button type=\"button\" id=\"fhPsPlusTwo\" class=\"fh-cd-chip"+(cfg.plusTwo?" is-on":"")+"\" title=\"Fixed Fate's Hand +2\">FH +2</button>"+
        "<span class=\"fh-cd-modctl\"><small>MOD</small><button type=\"button\" data-custom-step=\"-1\" aria-label=\"Lower the manual modifier\">−</button>"+
        "<input id=\"fhPsCustom\" type=\"number\" value=\""+(Number(cfg.custom)||0)+"\" aria-label=\"Manual modifier\">"+
        "<button type=\"button\" data-custom-step=\"1\" aria-label=\"Raise the manual modifier\">+</button></span>"+
        "<span class=\"fh-cd-dc\">DC <input id=\"fhPsDc\" type=\"number\" min=\"0\" value=\""+esc(cfg.dc)+"\" placeholder=\"—\"></span></div>";
    }
    // The FINE TUNE drawer is gone: a Portent belongs to one die, so it lives in
    // that die's own right-click menu rather than in a console-wide panel.
    return "<section class=\"fh-cd-zone fh-cd-console\" data-zone=\"console\"><div class=\"fh-cd-cap\">ROLL CONSOLE<small>left click adds a die · right click tunes it</small></div>"+
      head+row1+renderWhiteDice()+"</section>";
  }
  /* The one place dice come from. A blank die per size: left click adds one to
     the tray, right click takes one back. Once in the tray, a right click on the
     die itself gives it a colour, a seal and its own advantage. */
  function renderWhiteDice(){
    var cfg=state.rollConfig,checkLoaded=!!cfg,counts=trayDieCounts(),calling=callingNow();
    var full=checkLoaded&&trayBonusCount()>=MAX_BONUS_DICE;
    return "<div class=\"fh-cd-whiterow\">"+ROLL_DIE_SIZES.map(function(sides){
      var count=counts[sides]||0;
      var disabled=!!state.pendingArmed||(checkLoaded&&(sides===20||sides===100))||(full&&!count)||(!checkLoaded&&state.traySelection.length>=MAX_FREE_DICE&&!count);
      return "<button type=\"button\" class=\"fh-cd-wdie"+(calling&&!disabled?" is-calling":"")+"\" data-add-tray-die=\""+sides+"\""+(disabled?" disabled":"")+
        " title=\"Left click adds a d"+sides+" · right click or long press takes one back\" aria-label=\"Add a d"+sides+"; right-click to remove one\">"+
        dieSvg(sides,26,"white","d"+(sides===100?"%":sides))+(count?"<span class=\"fh-cd-mult\">×"+count+"</span>":"")+"</button>";
    }).join("")+"</div>";
  }
  /* Every die still in the hand answers to a right click, wherever it lives:
     the prepared d20, a reserved Destiny die, a bonus die, a staged die, or a
     plain die in the free tray. The menu then offers only what that die can do. */
  function findStagedDie(prompt){
    if(!prompt)return null;
    var cfg=state.rollConfig;
    if(prompt.base){
      if(!cfg||cfg.editingId)return null;
      return {scope:"base",sides:20,label:"Base d20",advantageMode:cfg.d20Mode||"flat",forcedResult:cfg.d20ForcedResult,colour:cfg.d20Colour||"",sourceIcon:""};
    }
    if(prompt.destinyDieId){
      if(!cfg)return null;
      var poolDie=state.destiny.dice.find(function(die){return die.id===prompt.destinyDieId&&die.available;});
      if(!poolDie||cfg.destinyDieId!==poolDie.id)return null;
      return {scope:"destiny",sides:poolDie.sides,label:"Destiny d"+poolDie.sides,advantageMode:cfg.destinyMode||"flat",forcedResult:cfg.destinyForcedResult,colour:"",sourceIcon:""};
    }
    if(prompt.stagedId){var item=stagedList().find(function(die){return die.id===prompt.stagedId&&die.kind!=="destiny";});return item?Object.assign({scope:"staged"},item):null;}
    if(prompt.bonusId){var bonus=cfg&&(cfg.bonusDice||[]).find(function(die){return die.id===prompt.bonusId&&!die.locked;});return bonus?Object.assign({scope:"bonus"},bonus):null;}
    if(prompt.freeId){
      var free=state.traySelection.find(function(die){return die.id===prompt.freeId;});
      return free?Object.assign({scope:"free",label:"d"+free.sides,sourceIcon:""},free):null;
    }
    return null;
  }
  function refreshTrayForState(){
    if(rollOpen()){var entry=openEntry();if(entry)refreshOpenTray(entry);return;}
    if(state.rollConfig)prepareTrayForConfig(state.rollConfig);else state.trayResults=[];
  }
  function mutateStagedDie(patch){
    var prompt=state.diePrompt,target=findStagedDie(prompt),cfg=state.rollConfig;
    if(!target)return;
    if(target.scope==="base"){
      if(patch.advantageMode!=null)cfg.d20Mode=patch.advantageMode;
      if(patch.forcedResult!==undefined)cfg.d20ForcedResult=forcedDieResult(patch.forcedResult,20);
      if(patch.colour!=null)cfg.d20Colour=patch.colour;
    }
    else if(target.scope==="destiny"){
      if(patch.advantageMode!=null)cfg.destinyMode=patch.advantageMode;
      if(patch.forcedResult!==undefined)cfg.destinyForcedResult=forcedDieResult(patch.forcedResult,target.sides);
    }
    else if(target.scope==="staged"){var item=stagedList().find(function(die){return die.id===prompt.stagedId;});if(item)Object.assign(item,patch);}
    else if(target.scope==="bonus"){var bonus=(cfg.bonusDice||[]).find(function(die){return die.id===prompt.bonusId;});if(bonus)Object.assign(bonus,patch);}
    else if(target.scope==="free"){var freeDie=state.traySelection.find(function(die){return die.id===prompt.freeId;});if(freeDie)Object.assign(freeDie,patch);}
    refreshTrayForState();persistPlayState();render();
  }
  function dropStagedDie(){
    var prompt=state.diePrompt,target=findStagedDie(prompt);if(!target)return;
    // The base d20 is the roll itself — it cannot be taken out of its own tray.
    if(target.scope==="base"){state.message="The d20 is the roll — it cannot be removed.";state.messageKind="warn";renderMessage();return;}
    if(target.scope==="destiny"){var cfg=state.rollConfig;cfg.destinyDieId="";cfg.destinyConfirmed=false;cfg.destinyForcedResult=null;}
    else if(target.scope==="staged")state.rollSequence.staged=stagedList().filter(function(die){return die.id!==prompt.stagedId;});
    else if(target.scope==="bonus"){var config=state.rollConfig;config.bonusDice=(config.bonusDice||[]).filter(function(die){return die.id!==prompt.bonusId;});syncPresetFlags(config);}
    else if(target.scope==="free")state.traySelection=state.traySelection.filter(function(die){return die.id!==prompt.freeId;});
    state.diePrompt=null;refreshTrayForState();persistPlayState();render();
  }
  /* Sealing a die "Destiny" is not decoration: it spends a die from the pool,
     with the same confirmation as clicking the pool itself. */
  function sealStagedDie(seal){
    var target=findStagedDie(state.diePrompt);if(!target)return;
    if(seal!=="destiny"){
      mutateStagedDie({sourceIcon:seal,label:seal==="guidance"?"Guidance":seal==="bardic"?"Bardic":target.label});
      return;
    }
    var poolDie=state.destiny.dice.find(function(die){return die.available&&die.sides===target.sides;});
    if(!poolDie){state.message="No Destiny d"+target.sides+" is available in the pool.";state.messageKind="warn";renderMessage();return;}
    confirmDestinyUse(poolDie.id,"Turn this d"+target.sides+" into a Destiny die",function(){
      dropStagedDie();
      if(rollOpen()){stageDestinyDie(poolDie.id);return;}
      if(state.rollConfig){state.rollConfig.destinyDieId=poolDie.id;state.rollConfig.destinyConfirmed=true;prepareTrayForConfig(state.rollConfig);}
      render();
    },"add-destiny");
  }
  function trayBonusCount(){
    var cfg=state.rollConfig;
    if(rollOpen()){var entry=openEntry();return (entry?entryBonusDice(entry).length:0)+stagedBonusCount();}
    return cfg?(cfg.bonusDice||[]).length:0;
  }
  function trayDieCounts(){
    var counts={};
    function add(sides){sides=Number(sides);counts[sides]=(counts[sides]||0)+1;}
    if(rollOpen())stagedList().forEach(function(item){if(item.kind!=="destiny")add(item.sides);});
    else if(state.rollConfig)(state.rollConfig.bonusDice||[]).forEach(function(die){if(!die.locked)add(die.sides);});
    else state.traySelection.forEach(function(die){add(die.sides);});
    return counts;
  }
  function renderBreakdown(entry) {
    var lines=["<span><small>Kept d20</small><b>"+entry.kept+"</b></span>","<span><small>Base bonus</small><b>"+signed(entry.baseBonus)+"</b></span>"];
    if(entry.plusTwo)lines.push("<span><small>FH bonus</small><b>+2</b></span>");if(entry.custom)lines.push("<span><small>Manual</small><b>"+signed(entry.custom)+"</b></span>");
    entryBonusDice(entry).forEach(function(die){lines.push("<span><small>"+esc(die.label)+" d"+die.sides+(die.forced?" · MANUAL":"")+"</small><b>+"+die.result+"</b></span>");});if(entry.destiny)lines.push("<span><small>Destiny d"+entry.destiny.sides+(entry.destiny.forced?" · MANUAL":"")+"</small><b>+"+entry.destiny.result+"</b></span>");if(entry.d20Forced)lines[0]="<span><small>Kept d20 · MANUAL</small><b>"+entry.kept+"</b></span>";
    var choice=entry.natural===1&&!entry.natChoice?"<div class=\"fh-ps-nat-choice\"><b>Do you accept your fate?</b><button data-nat-choice=\"accept\" data-entry-id=\""+entry.id+"\">Yes · fail &amp; +1 Destiny</button><button data-nat-choice=\"chaos\" data-entry-id=\""+entry.id+"\">No · turn it into 20</button></div>":"";
    var warnings="";if(entry.destiny&&entry.destiny.chaos)warnings="<p class=\"fh-ps-chaos\">Chaos · Overreach "+entry.destiny.chaos.overreach+" · "+entry.ability+" save DC "+entry.destiny.chaos.dc+"</p>";if(entry.awakening)warnings+="<p class=\"fh-ps-awakening\">Arcane Awakening — draw from the tarot deck.</p>";
    return "<div class=\"fh-ps-roll-result \" data-outcome=\""+esc(entry.outcome||"")+"\"><div>"+lines.join("")+"</div><strong>"+entry.total+"</strong><p>"+esc(entry.outcome||"")+(entry.dc!==""?" · DC "+esc(entry.dc):"")+"</p></div>"+choice+warnings;
  }
  function renderMessage() { var box=root&&root.querySelector("#fhPsMessage");if(!box)return;var loud=/^(danger|warn|success)$/.test(state.messageKind||"");box.className="fh-cd-msg "+(loud?"is-"+state.messageKind:"");box.textContent=loud?(state.message||""):""; }

  function contextRollRow(name,ch,extra,note,dc){var info=skillInfo(name,ch,extra||0);return "<div class=\"fh-ps-context-roll\"><div><b>"+esc(name)+"</b><small>"+info.ability+" · "+esc(note||TIER_LABEL[info.tier])+"</small></div><strong>"+signed(info.bonus)+"</strong><button data-quick-name=\""+esc(name)+"\" data-ability=\""+info.ability+"\" data-bonus=\""+info.bonus+"\">Roll</button><button data-config-name=\""+esc(name)+"\" data-ability=\""+info.ability+"\" data-bonus=\""+info.bonus+"\" data-note=\""+esc(note||"")+"\" data-dc=\""+(dc!=null?dc:"")+"\" aria-label=\"Configure "+esc(name)+"\">"+iconSvg("gear")+"</button></div>";}
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
  function renderImportReport(ch){
    var report=ch.importReport||emptyImportReport(),warnings=(report.unmappedSkills||[]).concat(report.unmappedTools||[]);
    var tools=(report.importedTools||[]).map(function(item){return item.name;});
    var summary="<p><b>"+tools.length+" DDB tool"+(tools.length===1?"":"s")+" imported</b>"+(tools.length?" · "+esc(tools.join(", ")):"")+"</p>";
    if(!warnings.length)return "<section class=\"fh-ps-import-report is-clean\"><h3>Import report</h3>"+summary+"<small>Only canonical Fate's Hand skills and tools are active.</small></section>";
    return "<section class=\"fh-ps-import-report has-warnings\"><h3>Import review</h3>"+summary+"<strong>"+warnings.length+" unrecognized entr"+(warnings.length===1?"y":"ies")+" ignored</strong><ul>"+warnings.map(function(item){return "<li><b>"+esc(item.name)+"</b><small>"+esc(item.source)+"</small></li>";}).join("")+"</ul><small>Ignored entries never become extra skills or tools.</small></section>";
  }
  function tierOptions(current){return [["none","Untrained"],["half","Half"],["proficient","Proficient"],["expert","Expert"]].map(function(option){return "<option value=\""+option[0]+"\" "+(current===option[0]?"selected":"")+">"+option[1]+"</option>";}).join("");}
  function renderCorrections(ch){
    var skills=SKILLS.map(function(entry){var info=skillInfo(entry[0],ch);return "<label><span>"+esc(entry[0])+"</span><select data-manual-skill=\""+esc(entry[0])+"\">"+tierOptions(info.tier)+"</select></label>";}).join("");
    var tools=TOOLS.map(function(entry){var name="Tool - "+entry[0],info=skillInfo(name,ch);return "<label><span>"+esc(entry[0])+" <small>"+entry[1]+"</small></span><select data-manual-tool=\""+esc(name)+"\">"+tierOptions(info.tier)+"</select></label>";}).join("");
    return "<div class=\"fh-ps-context-intro\"><p>MANUAL CORRECTIONS</p><h2>Imported character data</h2><span>These overrides apply after every DDB sync. Skills and tools always retain the canonical Fate's Hand order.</span></div>"+renderImportReport(ch)+"<section class=\"fh-ps-corrections\"><label class=\"fh-ps-ac-fix\"><span>Armor Class</span><input id=\"fhPsManualAc\" type=\"number\" min=\"0\" max=\"99\" value=\""+(ch.armorClass==null?"":ch.armorClass)+"\" placeholder=\"—\"></label><h3>26 Skills</h3><div class=\"fh-ps-correction-grid\">"+skills+"</div><h3>Tools</h3><div class=\"fh-ps-correction-grid\">"+tools+"</div><button id=\"fhPsSaveCorrections\" type=\"button\">Save corrections</button><p id=\"fhPsCorrectionStatus\"></p></section>";
  }
  function saveCorrections(){
    var skills={},toolTiers={};root.querySelectorAll("[data-manual-skill]").forEach(function(select){skills[select.dataset.manualSkill]=select.value;});root.querySelectorAll("[data-manual-tool]").forEach(function(select){toolTiers[select.dataset.manualTool]=select.value;});
    var ac=root.querySelector("#fhPsManualAc"),manualOverrides={armorClass:ac&&ac.value!==""?Number(ac.value):null,skills:skills,toolTiers:toolTiers};
    var status=root.querySelector("#fhPsCorrectionStatus");if(status)status.textContent="Saving…";
    saveProfile({manualOverrides:manualOverrides}).then(function(){state.character=effectiveCharacter();pushEvent("Manual AC, skills and tools saved","corrected",false);render();}).catch(function(error){var box=root.querySelector("#fhPsCorrectionStatus");if(box)box.textContent="Could not save: "+error.message;});
  }
  function renderPops(ch) {
    if(state.editDraft)return "<div class=\"fh-cd-pop\"><header><button type=\"button\" data-close-pop aria-label=\"Close the editor\">‹</button><h2>Edit sheet</h2><small>working copy</small></header><div class=\"fh-cd-popbody\">"+renderEditSheet()+"</div></div>";
    if(!state.popOpen)return "";
    var meta={inventory:["Inventory","campaign · shared"],loop:["Soulforging Loop","checks from the live sheet"],forge:["Soulforge","workshop"]}[state.popOpen]||["Panel",""];
    var body=state.popOpen==="inventory"?renderInventoryContext():state.popOpen==="forge"?renderForgeContext(ch):renderLoop(ch);
    return "<div class=\"fh-cd-pop\"><header><button type=\"button\" data-close-pop aria-label=\"Back to the sheet\">‹</button><h2>"+esc(meta[0])+"</h2><small>"+esc(meta[1])+"</small></header><div class=\"fh-cd-popbody\">"+body+"</div></div>";
  }
  function toolUrl(kind,fallback){
    var raw=(SITE_ROOT&&TOOL_PATHS[kind]!=null?SITE_ROOT+TOOL_PATHS[kind]:null)||(root&&root.dataset&&root.dataset[kind])||fallback;
    try{var url=new URL(raw,window.location.href);if(state.code&&(kind==="inventory"||kind==="soulforge"))url.searchParams.set("campaign",state.code);return url.href;}catch(error){return raw;}
  }

  function renderAccessZone(){
    var partyOptions="<option value=\"\">— character —</option>"+state.party.map(function(name){return "<option value=\""+esc(name)+"\" "+(name===state.pseudo?"selected":"")+">"+esc(name)+"</option>";}).join("");
    return "<div class=\"fh-cd-access\"><label>CAMPAIGN<input id=\"fhPsCode\" value=\""+esc(state.code)+"\" placeholder=\"Campaign code\"></label>"+
      "<label>CHARACTER<select id=\"fhPsWho\">"+partyOptions+"</select><button id=\"fhPsLoad\" type=\"button\">Load</button></label></div>";
  }
  function portraitFor(ch){
    if(!ch)return "";
    if(ch.avatarUrl)return ch.avatarUrl;
    var slug=String(ch.species||"").toLowerCase().replace(/\s*\(fh\)\s*/g,"").replace(/[^a-z]+/g,"-").replace(/^-|-$/g,"");
    if(!slug)return "";
    return (SITE_ROOT||"../")+"assets/img/species-"+slug+".jpg";
  }
  function renderDockHeader(ch){
    var linked=!!(state.profile&&state.profile.ddbLinked);
    var initials=String(ch&&ch.name||"FH").split(/\s+/).map(function(word){return word.charAt(0);}).join("").slice(0,3).toUpperCase();
    var portrait=portraitFor(ch);
    var classes=ch?ch.classes.map(function(entry){return entry.name+" "+entry.level;}).join(" / "):"";
    var subtitle=ch?esc(ch.species)+" · "+esc(classes)+(state.code?" · "+esc(state.code):""):"No character loaded";
    var avatar=portrait
      ? "<img class=\"fh-cd-portrait\" src=\""+esc(portrait)+"\" alt=\"\" onerror=\"this.replaceWith(Object.assign(document.createElement('span'),{className:'fh-cd-portrait',textContent:'"+esc(initials)+"'}))\">"
      : "<span class=\"fh-cd-portrait\">"+esc(initials)+"</span>";
    var menu=state.menuOpen?"<div class=\"fh-cd-menu\">"+
      "<button type=\"button\" id=\"fhPsSync\">"+(linked?"Sync D&amp;D Beyond":"Link D&amp;D Beyond")+"<small>pull</small></button>"+
      (linked?"<button type=\"button\" id=\"fhPsRelink\">Replace the DDB link</button>":"")+
      "<button type=\"button\" id=\"fhPsCorrect\">Edit sheet<small>overrides</small></button>"+
      (linked?"":"<button type=\"button\" id=\"fhPsLevel\">Level Up</button>")+
      "<div class=\"fh-cd-msep\"></div>"+
      "<button type=\"button\" data-chrome-toggle>Change character<small>"+esc(state.code||"—")+"</small></button>"+
      "<a href=\""+esc(toolUrl("rules","../"))+"\">Handbook</a>"+
      "<div class=\"fh-cd-msep\"></div>"+
      "<a href=\""+esc(toolUrl("inventory","../party-inventory.html"))+"\">Full inventory<small>↗</small></a>"+
      "<a href=\""+esc(toolUrl("soulforge","../soulforge-tool.html"))+"\">Full workshop<small>↗</small></a></div>":"";
    return "<div class=\"fh-cd-head\" data-zone=\"header\">"+
      "<a class=\"fh-cd-seal\" href=\""+esc(toolUrl("rules","../"))+"\" title=\"Back to the Handbook\">FH</a>"+avatar+
      "<div class=\"fh-cd-id\"><h1>"+esc(ch&&ch.name||"Player Companion")+"</h1><p>"+subtitle+"</p></div>"+
      "<button class=\"fh-cd-hbtn"+(state.popOpen==="inventory"?" is-active":"")+"\" type=\"button\" data-open-pop=\"inventory\" title=\"Inventory\" aria-label=\"Inventory\">"+glyph("satchel")+"</button>"+
      "<button class=\"fh-cd-hbtn"+(state.popOpen==="loop"?" is-active":"")+"\" type=\"button\" data-open-pop=\"loop\" title=\"Soulforging Loop\" aria-label=\"Soulforging Loop\">"+glyph("loupe")+"</button>"+
      "<button class=\"fh-cd-hbtn"+(state.popOpen==="forge"?" is-active":"")+"\" type=\"button\" data-open-pop=\"forge\" title=\"Soulforge\" aria-label=\"Soulforge\">"+glyph("anvil")+"</button>"+
      "<button class=\"fh-cd-hbtn"+(state.menuOpen?" is-active":"")+"\" type=\"button\" data-menu-toggle title=\"More\" aria-label=\"More actions\">"+glyph("dots")+"</button>"+
      renderModeControl()+
      menu+"</div><p id=\"fhPsMessage\" class=\"fh-cd-msg\"></p>";
  }
  function render() {
    if(!root)return;
    var floating=inPip();
    root.className="fh-cd-root"+(state.dockOpen?" is-open":"")+(floating?" is-floating":"");
    // While the dock floats, the page must not keep a gutter for it.
    try{if(document.body&&document.body.classList)document.body.classList.toggle("fh-cd-docked",!!state.dockOpen&&!floating);}catch(error){}
    var seal="<button class=\"fh-cd-seal-fab\" type=\"button\" data-dock-open aria-label=\"Open the Player Companion\">FH</button>";
    var inner;
    if(state.loading)inner=renderDockHeader(state.character)+"<div class=\"fh-cd-loading\">Loading the character sheet…</div>";
    else if(!state.record||!state.character)inner=renderDockHeader(null)+renderAccessZone()+"<div class=\"fh-cd-welcome\"><span>⚔</span><h1>Player Companion</h1><p>Enter your campaign code and pick a character. D&amp;D Beyond stays the source for the standard sheet; this dock runs the Fate's Hand layer.</p></div>";
    else{
      var ch=state.character;
      inner=renderDockHeader(ch)+(state.chromeOpen?renderAccessZone():"")+
        renderStats(ch)+renderSkills(ch)+renderDestiny(ch)+renderConsole()+renderStageZone()+renderStream()+renderPops(ch);
    }
    root.innerHTML=seal+"<div class=\"fh-cd-dock\">"+inner+"</div>";
    renderMessage();
    if(state.scoreEditing){var scoreInput=root.querySelector(".fh-cd-scorein");if(scoreInput&&scoreInput.focus){scoreInput.focus();if(scoreInput.select)scoreInput.select();}}
    if((state.popOpen==="inventory"||state.popOpen==="forge")&&state.inventory===null)loadInventory();
  }
  function syncPresetFlags(cfg){var guidance=(cfg.bonusDice||[]).find(function(die){return die.label.toLowerCase()==="guidance";}),bardic=(cfg.bonusDice||[]).find(function(die){return die.label.toLowerCase()==="bardic";});cfg.guidance=!!guidance;cfg.bardic=!!bardic;if(bardic){cfg.bardicSides=bardic.sides;state.prefs.bardicSides=bardic.sides;}}
  /* Only two free-text fields are left in the console; everything else is a
     button or lives in a die's own menu, and writes straight to the config. */
  function syncConsoleInputs(){
    if(!state.rollConfig||!root)return;
    var cfg=state.rollConfig,custom=root.querySelector("#fhPsCustom"),dc=root.querySelector("#fhPsDc");
    if(custom)cfg.custom=Number(custom.value)||0;
    if(dc)cfg.dc=dc.value;
  }
  function removeGenericBonusDie(index){var cfg=state.rollConfig;if(!cfg)return;syncConsoleInputs();index=Number(index);if(!cfg.bonusDice[index]||cfg.bonusDice[index].locked)return;cfg.bonusDice.splice(index,1);syncPresetFlags(cfg);prepareTrayForConfig(cfg);render();}
  function openConfig(name,ability,bonus,note,dc){clearDiceTray(false);state.rollConfig=rollInput(name,ability,bonus,{note:note,dc:dc});prepareTrayForConfig(state.rollConfig);state.message="";state.messageKind="";render();window.setTimeout(function(){var roll=root&&root.querySelector("[data-roll-now]");if(roll&&roll.focus)roll.focus({preventScroll:true});},0);}
  function loadInventory(){if(!state.code)return;state.inventory={loading:true};api("/inv/"+encodeURIComponent(state.code)).then(function(data){state.inventory=data;render();}).catch(function(error){state.inventory={error:"Could not load inventory: "+error.message};render();});}
  function loadParty(){var input=root.querySelector("#fhPsCode"),code=(input?input.value:state.code).trim().toUpperCase();state.code=code;state.party=[];state.record=null;state.character=null;state.pseudo="";state.inventory=null;state.loading=!!code;render();if(!code)return;try{localStorage.setItem("fh-my-campcode",code);}catch(e){}api("/party/"+encodeURIComponent(code)).then(function(data){state.party=(data.builds||[]).map(function(entry){return entry.pseudo;}).sort();var last=state.requestedPseudo||"";if(!last)try{last=localStorage.getItem("fh-my-pseudo")||"";}catch(e){}state.requestedPseudo="";state.loading=false;if(state.party.indexOf(last)>=0){state.pseudo=last;loadBuild();}else render();}).catch(function(error){state.requestedPseudo="";state.loading=false;state.message=error.message||"Could not reach the campaign server.";state.messageKind="danger";render();});}
  function loadBuild(){var who=state.pseudo;if(!state.code||!who)return;state.loading=true;render();try{localStorage.setItem("fh-my-pseudo",who);}catch(e){}Promise.all([api("/party/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)),api("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)).catch(function(){return {profile:emptyProfile()};})]).then(function(results){state.record=results[0];state.profile=results[1].profile||emptyProfile();state.character=effectiveCharacter();loadPlayState(state.character);state.loading=false;state.inventory=null;state.message="";rememberRoute();render();}).catch(function(error){state.loading=false;state.record=null;state.character=null;state.message=error.message||"Could not load this character.";state.messageKind="danger";render();});}

  function showModal(html){var overlay=document.createElement("div");overlay.className="fh-mc-modal-wrap";overlay.innerHTML="<div class=\"fh-mc-modal\" role=\"dialog\" aria-modal=\"true\"><button class=\"fh-mc-modal-x\" type=\"button\" aria-label=\"Close\">×</button>"+html+"</div>";function close(){overlay.remove();}overlay.addEventListener("click",function(event){if(event.target===overlay||event.target.closest(".fh-mc-modal-x"))close();});document.body.appendChild(overlay);return {element:overlay,close:close};}
  function confirmDestinyUse(dieId,context,onConfirm,mode){
    var die=state.destiny.dice.find(function(item){return item.id===dieId&&item.available;});
    if(!die){state.message="That Destiny die is no longer available.";state.messageKind="danger";renderMessage();return;}
    state.trayPrompt={type:mode||"destiny",dieId:dieId,context:context||"Spend this Destiny die",onConfirm:onConfirm};render();
    window.setTimeout(function(){var zone=root&&root.querySelector(".fh-cd-frame");if(zone&&zone.scrollIntoView)zone.scrollIntoView({behavior:"smooth",block:"nearest"});},0);
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
  function pullDdb(value,modal){var url=null;if(value){try{url=canonicalDdbUrl(value);}catch(error){modal.element.querySelector("#fhPsPullError").textContent=error.message;return;}}var preservedOverrides=cloneData(state.profile&&state.profile.manualOverrides||{});state.message="Syncing D&D Beyond…";state.messageKind="roll";renderMessage();post("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(state.pseudo)+"/pull",url?{shareUrl:url}:{}).then(function(data){state.profile=Object.assign({},state.profile||{},data.profile||{});state.profile.manualOverrides=preservedOverrides;state.character=effectiveCharacter();if(modal)modal.close();var report=state.character.importReport||emptyImportReport(),warnings=report.unmappedSkills.length+report.unmappedTools.length;state.message="Character refreshed · "+report.importedTools.length+" DDB tool"+(report.importedTools.length===1?"":"s")+" imported"+(warnings?" · "+warnings+" unrecognized entr"+(warnings===1?"y":"ies")+" ignored":"")+".";state.messageKind=warnings?"warn":"success";render();}).catch(function(error){var message=friendlyPullError(error);if(modal)modal.element.querySelector("#fhPsPullError").textContent=message;else{state.message=message;state.messageKind="danger";render();}});}
  function openLevelUp(ch){var classes=CLASS_NAMES.slice();ch.classes.forEach(function(entry){if(classes.indexOf(entry.name)<0)classes.unshift(entry.name);});var classOptions=classes.map(function(name){return "<option "+(ch.classes[0]&&ch.classes[0].name===name?"selected":"")+">"+esc(name)+"</option>";}).join("");var statOptions="<option value=\"\">No increase</option>"+ABILITIES.map(function(key){return "<option value=\""+key+"\">"+key+" — "+ABILITY_NAMES[key]+"</option>";}).join("");var skillOptions="<option value=\"\">No skill</option>"+SKILLS.map(function(s){return "<option>"+s[0]+"</option>";}).join("");var modal=showModal("<p class=\"fh-mc-modal-kicker\">LEVEL "+(ch.level+1)+"</p><h3>What gains a level?</h3><label><span>Class</span><select id=\"fhPsLevelClass\">"+classOptions+"</select></label><div class=\"fh-mc-modal-grid\"><label><span>Ability increase 1</span><select id=\"fhPsStat1\">"+statOptions+"</select></label><label><span>Ability increase 2</span><select id=\"fhPsStat2\">"+statOptions+"</select></label></div><div class=\"fh-mc-modal-grid\"><label><span>Essential skill</span><select id=\"fhPsSkill1\">"+skillOptions+"</select></label><label><span>New tier</span><select id=\"fhPsTier1\"><option value=\"half\">Half</option><option value=\"proficient\" selected>Proficient</option><option value=\"expert\">Expert</option></select></label></div><label><span>New essential spells</span><textarea id=\"fhPsNewSpells\" placeholder=\"One per line or comma-separated\"></textarea></label><p class=\"fh-mc-modal-error\" id=\"fhPsLevelError\"></p><button class=\"fh-mc-modal-save\" id=\"fhPsLevelSave\">Apply Level Up</button>");modal.element.querySelector("#fhPsLevelSave").onclick=function(){var increases={};["#fhPsStat1","#fhPsStat2"].forEach(function(sel){var value=modal.element.querySelector(sel).value;if(value)increases[value]=(increases[value]||0)+1;});var skillName=modal.element.querySelector("#fhPsSkill1").value;var entry={id:uuid(),targetLevel:ch.level+1,className:modal.element.querySelector("#fhPsLevelClass").value,abilityIncreases:increases,essentialSkills:skillName?[{name:skillName,tier:modal.element.querySelector("#fhPsTier1").value}]:[],spells:modal.element.querySelector("#fhPsNewSpells").value.split(/[\n,]+/).map(function(x){return x.trim();}).filter(Boolean),createdAt:new Date().toISOString()};saveProfile({levelUps:(state.profile.levelUps||[]).concat([entry])}).then(function(){modal.close();state.character=effectiveCharacter();state.message="Level-up saved. PB updated automatically.";state.messageKind="success";render();}).catch(function(error){modal.element.querySelector("#fhPsLevelError").textContent=error.message;});};}

  function handleClick(event){var button=event.target.closest("button");if(!button||!root.contains(button))return;
    if(state.rollConfig)syncConsoleInputs();
    if(button.dataset.dieChoice!==undefined){resolveDieChoice(button.dataset.dieChoice);return;}
    if(button.dataset.eventOk!==undefined){clearTimeout(state.eventTimer);acknowledgeEvent();return;}
    /* The one ROLL: it arms nothing and asks nothing, it rolls whatever the
       tray is currently holding. */
    if(button.dataset.rollNow!==undefined){
      if(state.pendingArmed){rollPendingFate();return;}
      if(rollOpen()){rollStagedDice();return;}
      if(rollTransactionActive()){warnRollLocked();return;}
      if(state.rollConfig)runConfiguredRoll();else rollTrayDice();
      return;
    }
    if(button.dataset.dieSeal!==undefined){sealStagedDie(button.dataset.dieSeal);return;}
    if(button.dataset.dieColour!==undefined){mutateStagedDie({colour:button.dataset.dieColour==="ivory"?"":button.dataset.dieColour});return;}
    if(button.dataset.dieModeSet!==undefined){mutateStagedDie({advantageMode:button.dataset.dieModeSet});return;}
    if(button.dataset.dieDrop!==undefined){dropStagedDie();return;}
    if(button.dataset.pendingOpen!==undefined){state.trayPrompt={type:"pending",id:button.dataset.pendingOpen};state.diePrompt=null;render();return;}
    if(button.dataset.pendingResolve!==undefined){armPendingFate(button.dataset.pendingResolve);return;}
    if(button.dataset.pendingAdd!==undefined){state.trayPrompt={type:"pending-new"};state.diePrompt=null;render();return;}
    if(button.dataset.pendingSave!==undefined){savePendingLabel(button.dataset.pendingSave);return;}
    if(button.dataset.pendingDrop!==undefined){dropPendingFate(button.dataset.pendingDrop);state.trayPrompt=null;persistPlayState();render();return;}
    if(button.dataset.clearTray!==undefined){if(rollTransactionActive())warnRollLocked();else clearDiceTray(true);return;}
    if(button.dataset.addTrayDie!==undefined){if(rollOpen())stageBonusDie(button.dataset.addTrayDie);else if(rollTransactionActive())warnRollLocked();else addTrayDie(button.dataset.addTrayDie);return;}
    if(button.dataset.removeTrayDie!==undefined){if(rollTransactionActive())warnRollLocked();else removeTrayDie(button.dataset.removeTrayDie);return;}
    if(button.dataset.removeTraySize!==undefined){if(rollTransactionActive())warnRollLocked();else removeTrayDieSize(button.dataset.removeTraySize);return;}
    if(button.dataset.trayCancel!==undefined||button.dataset.trayClose!==undefined){state.trayPrompt=null;state.diePrompt=null;render();return;}
    if(button.dataset.trayConfirmDestiny!==undefined){var destinyPrompt=state.trayPrompt,confirmAction=destinyPrompt&&destinyPrompt.onConfirm;state.trayPrompt=null;if(confirmAction)confirmAction();else render();return;}
    if(button.dataset.trayAcceptFate!==undefined||button.dataset.trayRefuseFate!==undefined){var fatePrompt=state.trayPrompt,choice=button.dataset.trayAcceptFate!==undefined?"accept":"chaos";state.trayPrompt=null;if(fatePrompt)resolveNatOne(fatePrompt.entryId,choice);return;}
    /* Dock chrome never touches roll state, so it stays reachable mid-transaction. */
    if(button.dataset.dockOpen!==undefined){setDockOpen(true);return;}
    if(button.dataset.dockClose!==undefined){setDockOpen(false);return;}
    if(button.dataset.menuToggle!==undefined){state.menuOpen=!state.menuOpen;render();return;}
    if(button.dataset.openPop!==undefined){state.popOpen=button.dataset.openPop;state.activeContext=button.dataset.openPop;state.menuOpen=false;render();return;}
    if(button.dataset.closePop!==undefined){if(state.editDraft)state.editDraft=null;state.popOpen="";render();return;}
    if(button.dataset.chromeToggle!==undefined){state.chromeOpen=!state.chromeOpen;state.menuOpen=false;render();return;}
    if(button.dataset.cdMode!==undefined){setWindowMode(button.dataset.cdMode);return;}
    if(button.dataset.hpOpen!==undefined){state.hpOpen=!state.hpOpen;render();return;}
    if(button.dataset.hpStep!==undefined){var hp=state.vitals||{};if(hp.max==null){state.message="Set a maximum first.";state.messageKind="warn";renderMessage();return;}setVitals({current:(hp.current==null?hp.max:hp.current)+Number(button.dataset.hpStep)});render();return;}
    if(button.dataset.hpFull!==undefined){setVitals({current:(state.vitals||{}).max});render();return;}
    if(button.dataset.scoreEdit!==undefined){state.scoreEditing=true;render();return;}
    /* A pool die clicked while a roll waits on APPLY is staged, not spent on the spot. */
    if(button.dataset.destinyDie!==undefined&&rollOpen()){
      var settled=openEntry();
      if(settled&&settled.kind==="d20"&&!settled.destiny&&!stagedList().some(function(item){return item.kind==="destiny";})){
        var boostDie=button.dataset.destinyDie;
        confirmDestinyUse(boostDie,"Boost "+settled.name+" · total "+settled.total,function(){stageDestinyDie(boostDie);},"add-destiny");
        return;
      }
    }
    if(rollTransactionActive()){warnRollLocked();return;}
    if(button.id==="fhPsChromeToggle"){state.chromeOpen=!state.chromeOpen;render();return;}
    if(button.id==="fhPsSync"||button.id==="fhPsRelink"||button.id==="fhPsLevel"||button.id==="fhPsCorrect")state.menuOpen=false;
    if(button.id==="fhPsEditSave"){saveSheetEdit();return;}if(button.id==="fhPsEditCancel"){state.editDraft=null;render();return;}if(button.id==="fhPsEditRestore"){beginSheetEdit(characterWithoutOverrides());return;}if(button.id==="fhPsEditAddTool"){addEditTool();return;}if(button.dataset.editRemoveTool){removeEditTool(button.dataset.editRemoveTool);return;}if(button.dataset.editAddBonus){addEditBonus(button.dataset.editAddBonus);return;}if(button.dataset.editRemoveBonus){removeEditBonus(button.dataset.editRemoveBonus,button.dataset.bonusId);return;}
    if(button.id==="fhPsLoad"){state.editDraft=null;loadParty();return;}if(button.id==="fhPsSync"){openPull(false);return;}if(button.id==="fhPsRelink"){openPull(true);return;}if(button.id==="fhPsLevel"){openLevelUp(state.character);return;}if(button.id==="fhPsCorrect"||button.dataset.sheetEdit!==undefined){if(!state.editDraft)beginSheetEdit();return;}if(button.id==="fhPsSaveCorrections"){saveCorrections();return;}
    if(button.dataset.quickName){quickRoll(button.dataset.quickName,button.dataset.ability,button.dataset.bonus,button.dataset.note);return;}
    if(button.dataset.configName){openConfig(button.dataset.configName,button.dataset.ability,button.dataset.bonus,button.dataset.note,button.dataset.dc);return;}
    if(button.id==="fhPsPlusTwo"){state.rollConfig.plusTwo=!state.rollConfig.plusTwo;prepareTrayForConfig(state.rollConfig);render();return;}
    if(button.dataset.removeBonus!==undefined){removeGenericBonusDie(button.dataset.removeBonus);return;}
    if(button.dataset.dieMode){var cfg=state.rollConfig,scope=button.dataset.dieScope,index=Number(button.dataset.dieIndex),next=button.dataset.dieMode;if(!cfg)return;if(scope==="d20")cfg.d20Mode=cfg.d20Mode===next?"flat":next;else if(scope==="destiny")cfg.destinyMode=cfg.destinyMode===next?"flat":next;else if(scope==="bonus"&&cfg.bonusDice[index]&&!cfg.bonusDice[index].locked)cfg.bonusDice[index].advantageMode=cfg.bonusDice[index].advantageMode===next?"flat":next;prepareTrayForConfig(cfg);render();return;}
    if(button.dataset.rollMode){if(!state.rollConfig||state.rollConfig.editingId)return;var mode=button.dataset.rollMode;state.rollConfig.plusTwo=mode==="plus2";state.rollConfig.d20Mode=mode==="plus2"?"flat":mode;prepareTrayForConfig(state.rollConfig);render();return;}
    if(button.dataset.openConsole){openConfig("Ability Check","STR",0,"Choose a skill row for its calculated bonus");return;}if(button.id==="fhPsCloseConsole"){clearDiceTray(true);return;}
    if(button.dataset.historyId){var entry=state.history.find(function(item){return item.id===button.dataset.historyId;});if(entry&&entry.kind==="d20"){state.rollConfig=configFromEntry(entry);setTrayFromEntry(entry);render();}return;}
    if(button.dataset.destinyDie){var dieId=button.dataset.destinyDie,activeEntry=state.rollConfig&&state.rollConfig.editingId&&state.history.find(function(item){return item.id===state.rollConfig.editingId;});if(state.rollConfig&&!(activeEntry&&activeEntry.destiny)){confirmDestinyUse(dieId,"Add this die to "+state.rollConfig.name,function(){state.rollConfig.destinyDieId=dieId;state.rollConfig.destinyConfirmed=true;prepareTrayForConfig(state.rollConfig);render();},"add-destiny");}else confirmDestinyUse(dieId,"Roll directly from the Destiny pool",function(){standaloneDestiny(dieId);},"destiny");return;}
    if(button.dataset.destinyPool){var pool=button.dataset.destinyPool.split(":");adjustDestinyDie(pool[0],pool[1]);return;}
    if(button.dataset.destinyStep){var parts=button.dataset.destinyStep.split(":"),field=parts[0],step=Number(parts[1]);updateDestinyField(field,Number(state.destiny[field])+step,"Manual correction");return;}
    if(button.id==="fhPsLongRest"){var restMax=(state.vitals||{}).max;if(restMax!=null)setVitals({current:restMax});setDestinyPoints(Math.min(state.destiny.score,state.destiny.points+1),"Long rest",true);render();return;}
    if(button.dataset.natChoice){state.trayPrompt=null;resolveNatOne(button.dataset.entryId,button.dataset.natChoice);return;}
    if(button.dataset.context){state.activeContext=button.dataset.context;render();return;}
  }
  /* Two right-click surfaces, two meanings, two places:
     on a WHITE console die it takes one back; on a die already IN THE TRAY it
     opens that die's own menu (colour, seal, advantage). */
  function trayDieTarget(event){
    if(!event.target||!event.target.closest)return null;
    var picker=event.target.closest("[data-add-tray-die]");
    if(picker)return picker.disabled?null:{kind:"picker",node:picker};
    var badge=event.target.closest("[data-pending-id]");
    if(badge)return {kind:"badge",node:badge};
    var tunable=event.target.closest("[data-die-staged],[data-die-bonus],[data-die-destiny],[data-die-free],[data-die-base]");
    return tunable?{kind:"die",node:tunable}:null;
  }
  function openDieMenu(node){
    var data=node.dataset;
    state.diePrompt=data.dieStaged!==undefined?{stagedId:data.dieStaged}
      :data.dieBonus!==undefined?{bonusId:data.dieBonus}
      :data.dieDestiny!==undefined?{destinyDieId:data.dieDestiny}
      :data.dieBase!==undefined?{base:true}
      :{freeId:data.dieFree};
    state.trayPrompt=null;render();
  }
  function takeBackDie(node){
    if(rollOpen())unstageDie(node.dataset.addTrayDie);
    else if(rollTransactionActive())warnRollLocked();
    else dropTrayDie(node.dataset.addTrayDie);
  }
  function onTrayContext(event){
    var target=trayDieTarget(event);if(!target)return;
    event.preventDefault();
    if(target.kind==="badge")openBadgeMenu(target.node);
    else if(target.kind==="die")openDieMenu(target.node);
    else takeBackDie(target.node);
  }
  function openBadgeMenu(node){state.trayPrompt={type:"pending-menu",id:node.dataset.pendingId};state.diePrompt=null;render();}
  function onTrayTouchStart(event){
    var target=trayDieTarget(event);if(!target)return;
    clearTimeout(state.trayHoldTimer);
    state.trayHeld=false;
    state.trayHoldTimer=window.setTimeout(function(){
      state.trayHeld=true;
      if(target.kind==="badge")openBadgeMenu(target.node);
      else if(target.kind==="die")openDieMenu(target.node);
      else takeBackDie(target.node);
    },500);
  }
  function onTrayTouchEnd(event){
    clearTimeout(state.trayHoldTimer);
    if(state.trayHeld){state.trayHeld=false;if(event.cancelable)event.preventDefault();}
  }
  function onClick(event){if(state.trayHeld){state.trayHeld=false;return;}try{handleClick(event);}catch(error){state.message="Roll Console error: "+(error&&error.message||"unknown error");state.messageKind="danger";pushEvent(state.message,"error",true);renderMessage();refreshEventPanel();if(window.console&&console.error)console.error(error);}}
  function onChange(event){
    if(event.target.dataset.diePortent!==undefined){mutateStagedDie({forcedResult:event.target.value===""?null:Number(event.target.value)});return;}
    if(/^fhPs(Custom|Dc)$/.test(event.target.id)||event.target.dataset.bonusLabel!==undefined||event.target.dataset.bonusSides!==undefined||event.target.dataset.bonusForced!==undefined){syncConsoleInputs();prepareTrayForConfig(state.rollConfig);render();return;}if(event.target.id==="fhPsTrayLabel"){state.trayLabel=String(event.target.value||"Damage roll").slice(0,48);persistPlayState();return;}if(event.target.id==="fhPsWho"){state.editDraft=null;state.pseudo=event.target.value;if(state.pseudo)loadBuild();return;}if(event.target.id==="fhPsCode"){return;}if(event.target.dataset.hpField){setVitals(event.target.dataset.hpField==="max"?{max:event.target.value}:{current:event.target.value});render();return;}if(event.target.dataset.destinyField){if(event.target.dataset.destinyField==="score")state.scoreEditing=false;updateDestinyField(event.target.dataset.destinyField,event.target.value,"Manual correction");return;}if(event.target.id==="fhPsTarget"){state.target=event.target.value;render();return;}if(event.target.id==="fhPsCr"){state.cr=event.target.value||"0";render();return;}}
  function onKeydown(event){if(event.target.id==="fhPsCode"&&event.key==="Enter"){event.preventDefault();loadParty();return;}if(/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;var key=String(event.key||"").toLowerCase();if(key==="c"||key==="escape"){event.preventDefault();if(rollTransactionActive())warnRollLocked();else clearDiceTray(true);return;}if(state.currentEvent&&key===" "){event.preventDefault();acknowledgeEvent();return;}if(!state.rollConfig||state.rollConfig.editingId)return;if(key==="a"||key==="d"||key==="f"){event.preventDefault();state.rollConfig.plusTwo=false;state.rollConfig.d20Mode=key==="a"?"advantage":key==="d"?"disadvantage":"flat";prepareTrayForConfig(state.rollConfig);render();return;}if(key===" "){event.preventDefault();var roll=root&&root.querySelector("[data-roll-now]");if(roll&&!roll.disabled)roll.click();}}

  function setDockOpen(open){
    state.dockOpen=!!open;state.menuOpen=false;
    try{localStorage.setItem("fh-cd-open",state.dockOpen?"1":"0");}catch(error){}
    render();
    if(state.dockOpen&&state.code&&!state.record&&!state.loading)loadParty();
  }
  /* Table mode moves the dock's node into a Document Picture-in-Picture window.
     The engine keeps running in this JS realm and the click/change listeners are
     bound to the node itself, so nothing about roll behaviour changes. */
  var pipWindow=null,homeParent=null,homeNext=null;
  function inPip(){return !!(pipWindow&&!pipWindow.closed);}
  function pipSupported(){try{return typeof window!=="undefined"&&"documentPictureInPicture" in window;}catch(error){return false;}}
  function copyStylesInto(win){
    Array.prototype.forEach.call(document.styleSheets,function(sheet){
      try{
        var css=Array.prototype.map.call(sheet.cssRules,function(rule){return rule.cssText;}).join("\n");
        var style=win.document.createElement("style");style.textContent=css;win.document.head.appendChild(style);
      }catch(error){
        if(sheet.href){var link=win.document.createElement("link");link.rel="stylesheet";link.href=sheet.href;win.document.head.appendChild(link);}
      }
    });
  }
  function enterPip(){
    if(inPip())return;
    if(!pipSupported()){state.message="Table mode needs Chrome or Edge 116+.";state.messageKind="warn";state.menuOpen=false;render();return;}
    var box=root.getBoundingClientRect();
    var width=Math.round(Math.min(760,Math.max(380,box.width||440)));
    var height=Math.round(Math.min(1000,Math.max(520,(window.screen&&window.screen.availHeight||900)*0.92)));
    window.documentPictureInPicture.requestWindow({width:width,height:height}).then(function(win){
      pipWindow=win;
      copyStylesInto(win);
      win.document.title="Fate's Hand — Player Companion";
      win.document.body.classList.add("fh-cd-pip-body");
      win.document.body.appendChild(root);
      win.addEventListener("pagehide",function(){restoreFromPip();});
      state.windowMode="table";state.menuOpen=false;render();
    }).catch(function(error){
      state.message="Could not open the floating window: "+(error&&error.message||error);state.messageKind="warn";render();
    });
  }
  function restoreFromPip(){
    if(!pipWindow)return;
    var closing=pipWindow;pipWindow=null;
    try{if(homeParent)homeParent.insertBefore(root,homeNext);else document.body.appendChild(root);}catch(error){document.body.appendChild(root);}
    try{if(!closing.closed)closing.close();}catch(error){}
    state.windowMode="margin";render();
  }
  function setWindowMode(mode){
    state.menuOpen=false;
    if(mode==="table"){if(!state.dockOpen)setDockOpen(true);enterPip();return;}
    if(mode==="seal"){if(inPip())restoreFromPip();setDockOpen(false);return;}
    if(inPip()){restoreFromPip();return;}
    setDockOpen(true);
  }
  document.addEventListener("DOMContentLoaded",function(){
    /* The dock lives on every page: the handbook stays readable beside the sheet. */
    var mount=document.getElementById("fhPlayerSheet"),ownsPage=!!mount;
    if(!mount){mount=document.createElement("div");mount.id="fhCompanionDock";document.body.appendChild(mount);}
    root=mount;root.className="fh-cd-root";
    homeParent=root.parentNode;homeNext=root.nextSibling;
    root.addEventListener("click",onClick);root.addEventListener("change",onChange);root.addEventListener("keydown",onKeydown);
    root.addEventListener("contextmenu",onTrayContext);
    root.addEventListener("touchstart",onTrayTouchStart,{passive:true});
    root.addEventListener("touchend",onTrayTouchEnd);root.addEventListener("touchcancel",onTrayTouchEnd);
    var linkedCampaign=routeValue("campaign"),linkedCharacter=routeValue("character");
    try{state.code=(linkedCampaign||localStorage.getItem("fh-my-campcode")||"").trim().toUpperCase();}catch(error){state.code=String(linkedCampaign||"").trim().toUpperCase();}
    state.requestedPseudo=linkedCharacter;
    var remembered=null;try{remembered=localStorage.getItem("fh-cd-open");}catch(error){}
    state.dockOpen=ownsPage||!!linkedCampaign||remembered==="1";
    render();
    if(state.dockOpen&&state.code)loadParty();
  });
})();
