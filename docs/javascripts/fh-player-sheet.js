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
  /* Both picker rows (Destiny, white dice) render at this size. Kept in step
     with the .fh-cd-ddie / .fh-cd-wdie widths in companion-dock.css. */
  var PICKER_DIE_PX = 31;
  var MAX_HISTORY = 20;
  var MAX_EXHAUSTION = 6;

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
  /* The text scale's usable range. Declared here because `var state` below
     reads FS_MIN when it is evaluated, and var hoists the name, not the value. */
  var FS_MIN=1.15,FS_MAX=1.45;
  var state = {
    code:"", pseudo:"", requestedPseudo:"", party:[], record:null, profile:null, character:null,
    destiny:null, history:[], events:[], prefs:{bardicSides:6}, rollConfig:null, trayPrompt:null,
    traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayLabel:"Damage roll",trayResultText:"",queueDone:"",rollSequence:null,chromeOpen:false,
    activeContext:"loop", target:"Aberration", cr:"1", inventory:null,editDraft:null,
    loading:false, message:"", messageKind:"",
    dockOpen:false, menuOpen:false, popOpen:"", diceSignatures:{}, destinyPoolMenu:false, consoleMenu:false,
    trayQuietTitle:"", trayRevealAt:0, trayRevealTimer:null,
    vitals:{current:null,max:null}, hpOpen:false, scoreEditing:false, windowMode:"margin", pendingArmed:null,
    diePrompt:null, destinyStaged:null, callUntil:0, callTimer:null, textSize:FS_MIN,
    panel:"skills", panelData:{},
    // The shared campaign feed. Live only — it is refetched on load, never
    // persisted, so none of this reaches localStorage or the profile.
    streamView:"mine",
    // tableState is one of three named states (plan §12.5): "recent" (no live
    // table, reading the cloud backstop — the default), "live" (the DM's table
    // server is up and this dock is on it), "off" (a table exists but this
    // dock cannot reach it — never silently treated as "recent").
    feed:{events:[],seen:{},sent:{},cursor:"",status:"",timer:null,lastEventAt:0,
      tableState:"recent",tableUrl:"",wsCursor:"",ws:null,wsRetry:0,wsRetryTimer:null,
      rendezvousTimer:null,manualUrl:""}
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
  // Text size. The old 1.0 baseline is gone -- it was too small to read at the
  // table, so the scale starts where the useful range starts. Width follows the
  // same number (400px x scale), which is why these read as sizes of the whole
  // dock rather than of the type alone: 460 / 520 / 580px.
  var TEXT_SIZES=[["1.15","A","Compact — 460px"],["1.3","A","Comfortable — 520px"],["1.45","A","Large — 580px"]];
  function renderTextSizeControl() {
    var active=String(state.textSize);
    return "<div class=\"fh-cd-seg fh-cd-textsize\" role=\"group\" aria-label=\"Companion text size\">"+TEXT_SIZES.map(function(entry,i){
      var on=entry[0]===active;
      return "<button class=\"fh-cd-tsz-btn"+(on?" is-on":"")+"\" type=\"button\" data-text-size=\""+entry[0]+"\" title=\""+entry[2]+"\" aria-label=\"Text size: "+entry[2]+"\""+(on?" aria-pressed=\"true\"":"")+" style=\"font-size:"+(11+i*2)+"px\">"+entry[1]+"</button>";
    }).join("")+"</div>";
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
      // A card drawn at the table outranks the one the build was created with.
      destinyBuild:Object.assign({},build.destiny||{},overrides.arcana?{arcana:overrides.arcana}:{}),
      build:build,importReport:importReport
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
    return {score:score,points:Math.max(0,points),dice:dice,overreach:overreach,pending:pending,
      awakeningOwed:!!raw.awakeningOwed,lastChange:raw.lastChange || null};
  }
  // Hit points are tracked here, not imported: DDB stays the source for the
  // standard sheet but the dock is what the player touches mid-combat.
  function normalizeVitals(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var max = raw.max == null || raw.max === "" ? null : Math.max(0, Math.round(Number(raw.max) || 0));
    var current = raw.current == null || raw.current === "" ? null : Math.round(Number(raw.current) || 0);
    if (current != null) current = Math.max(-999, max == null ? current : Math.min(current, max));
    if (max != null && current == null) current = max;
    // House Exhaustion: six levels, a flat −1 each, level 6 is death. The short
    // rest that can clear a level is spent until the next long rest.
    return {current:current, max:max,
      exhaustion:clamp(raw.exhaustion,0,MAX_EXHAUSTION),
      shortRestUsed:!!raw.shortRestUsed};
  }
  function exhaustionLevel(){return clamp(state.vitals&&state.vitals.exhaustion,0,MAX_EXHAUSTION);}
  /* Every level is a flat −1 on any d20 test, so the malus rides along with the
     dice of every roll instead of being remembered by the player. */
  function exhaustionPenalty(){return -exhaustionLevel();}
  function exhaustionNote(level){
    if(level>=MAX_EXHAUSTION)return "level 6 is death";
    return level?"−"+level+" on every d20 test":"clear";
  }
  /* silent lets a caller fold the announcement into its own batch, so the
     consequence lands above its cause in a newest-first list instead of under it. */
  function setExhaustion(level,reason,silent){
    var before=exhaustionLevel();
    level=clamp(level,0,MAX_EXHAUSTION);
    if(level===before)return before;
    setVitals({exhaustion:level});
    if(!silent)pushEvent(exhaustionText(level,reason),level>before?"loss":"gain");
    return level;
  }
  function exhaustionText(level,reason){return "EXHAUSTION "+level+" · "+(reason||"Adjusted")+" · "+exhaustionNote(level);}
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
    state.rollSequence=pending.rollSequence||null;state.trayPrompt=pending.trayPrompt||null;state.queueDone=pending.queueDone||"";
    state.trayResults=Array.isArray(pending.trayResults)?pending.trayResults:[];state.trayTitle=pending.trayTitle||"Dice Tray";state.trayResultText=pending.trayResultText||"";state.pendingArmed=pending.pendingArmed||null;
    state.destinyStaged=pending.destinyStaged||null;
    state.diePrompt=null;
    // rollConfig is derived, never stored: a refresh mid-roll rebuilds the console
    // from the entry so the head keeps naming the check instead of saying FREE ROLL.
    if(rollOpen()){var resumed=openEntry();state.rollConfig=resumed?configFromEntry(resumed):null;}
    state.prefs = Object.assign({bardicSides:6},local.prefs || {},profile.rollPrefs || {});
    // Each belt panel's own bucket, restored wholesale: core never reads inside it.
    state.panelData = (local.panelData && typeof local.panelData === "object") ? local.panelData : {};
  }
  function persistPlayState() {
    if (!state.code || !state.pseudo || !state.destiny) return;
    var safePrompt=state.trayPrompt&&["nat1","arcane1","chaos","awakening","die-choice","arcana-draw"].indexOf(state.trayPrompt.type)>=0?state.trayPrompt:null;
    var pendingRoll={rollSequence:state.rollSequence,trayPrompt:safePrompt,queueDone:state.queueDone,trayResults:state.trayResults,trayTitle:state.trayTitle,trayResultText:state.trayResultText,pendingArmed:state.pendingArmed,destinyStaged:state.destinyStaged};
    var payload = {destiny:state.destiny,vitals:state.vitals,history:state.history.slice(0,MAX_HISTORY),events:state.events.slice(0,10),traySelection:state.traySelection,trayLabel:state.trayLabel,prefs:state.prefs,pendingRoll:pendingRoll,panelData:state.panelData};
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
  /* ── The event zone ──────────────────────────────────────────────
     Not a queue of popups any more: a list. An informational event is
     one line that announces itself and stacks under the one before it,
     costing no click and blocking nothing. Only a real decision — a
     natural 1, an Arcane Critical Failure, an A/D choice — carries
     buttons, and only a decision holds the roll. */
  var MAX_EVENTS=10,SHOWN_EVENTS=4;
  function refreshEventPanel(){if(root)render();}
  function recordEvent(spec){
    var event={id:uuid(),text:spec.text,kind:spec.kind||"info",entryId:spec.entryId||null,
      chaosRoll:spec.chaosRoll||null,tag:spec.tag||"",createdAt:new Date().toISOString()};
    state.events.unshift(event);state.events=state.events.slice(0,MAX_EVENTS);
    return event;
  }
  function pushEvent(text,kind,entryId){var event=recordEvent({text:text,kind:kind,entryId:entryId});persistPlayState();return event;}
  /* A line that only makes sense while something is still pending — a die
     waiting in the tray — carries a tag, so cancelling that thing takes its
     line away with it instead of leaving a lie on screen. */
  function dropEventsTagged(tag){if(!tag)return;state.events=state.events.filter(function(event){return event.tag!==tag;});}
  /* Announce, then continue. A decision is the one thing that can interrupt:
     it parks what came next in queueDone until the player answers. */
  function announceEvents(events,done,decision){
    (events||[]).forEach(recordEvent);
    if(decision){state.queueDone=done||"";openDecision(decision);return;}
    var next=done||"";state.queueDone="";persistPlayState();runQueueDone(next);
  }
  function openDecision(decision){
    state.rollSequence=state.rollSequence||{};
    if(decision.entryId)state.rollSequence.entryId=decision.entryId;
    state.rollSequence.phase=decision.type;
    state.trayPrompt=Object.assign({},decision);
    persistPlayState();render();
  }
  function closeDecision(){
    var done=state.queueDone;state.queueDone="";state.trayPrompt=null;
    // The question is answered, so the phase must stop holding the dock even
    // when nothing was parked behind it.
    if(state.rollSequence&&BLOCKING_PHASES[state.rollSequence.phase])state.rollSequence.phase="open-after-events";
    return done;
  }
  /* One place recomputes an entry after it has been rewritten — by a Portent
     dropped on a fallen die, or by an Arcane failure refused. A free roll keeps
     its own verdict; a check earns its outcome back from the numbers. */
  function recomputeEntry(entry){
    if(!entry)return;
    // flatBonus is what a Chaos roll adds on top of its die — the Overreach.
    if(entry.kind==="tray"){entry.total=(entry.dice||[]).reduce(function(sum,die){return sum+(Number(die.result)||0);},0)+(Number(entry.flatBonus)||0);return;}
    entry.total=entryTotal(entry);entry.outcome=outcomeFor(entry);
  }
  /* The Chaos tables are data now (window.FH_CHAOS, built by sync_from_vault.py),
     so the dock reads the row out loud instead of pointing at the chapter. The
     table stops at 12 and the dice do not, so anything past the end reads the
     last row. Missing data degrades to the link, never to a crash. */
  function chaosTableFor(ability){
    var data=typeof window!=="undefined"&&window.FH_CHAOS;
    if(!data||!data.tables)return null;
    return data.tables[String(ability||"").slice(0,3).toUpperCase()]||null;
  }
  function chaosRowText(ability,total){
    var table=chaosTableFor(ability);
    if(!table)return "";
    var top=Number((window.FH_CHAOS||{}).max)||12;
    return table.rows[String(clamp(total,1,top))]||"";
  }
  function chaosVerdict(ability,total){
    var row=chaosRowText(ability,total),top=Number((window.FH_CHAOS||{}).max)||12;
    var capped=total>top?" (table stops at "+top+")":"";
    return row?row+capped:"read the "+(ability||"matching")+" Chaos table";
  }
  function refreshEntryTray(entry){
    if(!entry)return;
    if(rollOpen()&&state.rollSequence&&state.rollSequence.entryId===entry.id){refreshOpenTray(entry);return;}
    setTrayFromEntry(entry);
  }
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
    if(changed)pushEvent((direction>0?"Gained ":"Removed ")+"a Destiny d"+sides,direction>0?"die-gain":"die-loss");
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
    if(!silent&&next!==before)pushEvent((next>before?"Gained ":"Lost ")+Math.abs(next-before)+" Destiny Point"+(Math.abs(next-before)===1?"":"s"),next>before?"gain":"loss");
    if(!silent&&recovered)pushEvent("Gained a Destiny d"+recovered.sides,"die-gain");
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
  function normalizeBonusDie(die,index){die=die||{};var sides=ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0?Number(die.sides):6,label=String(die.label||"Other I").slice(0,32);return {id:die.id||("bonus-"+index+"-"+uuid()),label:label,sides:sides,advantageMode:rollMode(die.advantageMode||die.mode),forcedResult:forcedDieResult(die.forcedResult,sides),rolls:Array.isArray(die.rolls)?die.rolls.map(Number):undefined,result:die.result!=null?Number(die.result):undefined,chosenIndex:die.chosenIndex!=null?Number(die.chosenIndex):undefined,forced:!!die.forced,origin:die.origin||undefined,sourceIcon:bonusSourceFor(label,index,die.sourceIcon),colour:dieColour(die.colour)};}
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
    // Exhaustion is stamped on the entry when it rolls, not read live: changing
    // the level later must not silently rewrite a roll already in the stream.
    var total = (Number(entry.kept)||0) + (Number(entry.baseBonus)||0) + (entry.plusTwo?2:0) + (Number(entry.custom)||0) - (Number(entry.exhaustion)||0);
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
    if(!silent&&criticalSuccess)pushEvent("ARCANE CRITICAL SUCCESS · Destiny d"+die.sides+" rolled "+result,"arcane-critical-success");
    else if(!silent&&criticalFailure)pushEvent("ARCANE CRITICAL FAILURE · Destiny d"+die.sides+" rolled 1","arcane-critical-failure");
    return {dieId:die.id,sides:die.sides,result:result,rolls:(plan.rolls||[result]).slice(),chosenIndex:plan.chosenIndex==null?0:plan.chosenIndex,advantageMode:rollMode(plan.mode),forced:!!plan.forced,cost:cost,pointsBefore:before,pointsAfter:state.destiny.points,criticalSuccess:criticalSuccess,criticalFailure:criticalFailure,chaos:chaos,recovered:recovered};
  }
  /* A 1 on a Destiny die is no longer a verdict, it is an offer — the mirror of
     a natural 1. Accept it and the critical failure stands for +1 Destiny Point;
     refuse it and the 1 reads as the die's highest face instead, an Arcane
     Critical Success bought with every Destiny Point and a 2d6 on Chaos. */
  function arcaneDecision(spent,entryId){
    if(!spent||!spent.criticalFailure||spent.arcaneChoice)return null;
    return {type:"arcane1",entryId:entryId,sides:spent.sides};
  }
  function entryById(id){
    if(state.rollSequence&&state.rollSequence.entry&&state.rollSequence.entry.id===id)return state.rollSequence.entry;
    return state.history.find(function(item){return item.id===id;})||null;
  }
  /* A Destiny die waiting in the tray carries whatever its own menu gave it.
     A/D is the exception: choosing after the fact needs a resolver this path
     has none of, so its menu never offers it and a stray value falls back flat. */
  function destinyPlanFor(item){
    var mode=rollMode(item&&item.advantageMode);
    return makeDiePlan(item.sides,mode==="choice"?"flat":mode,item&&item.forcedResult);
  }
  function destinyEventSpecs(spent,entryId){
    if(!spent)return [];
    var change=spent.pointsAfter-spent.pointsBefore,events=[],parts=[],rollEntry=state.rollSequence&&state.rollSequence.entry||state.history.find(function(entry){return entry.id===entryId;});
    var offered=!!arcaneDecision(spent,entryId);
    if(spent.criticalSuccess)parts.push("ARCANE CRITICAL SUCCESS","Destiny d"+spent.sides+" rolled "+spent.result);
    else if(spent.criticalFailure)parts.push("ARCANE CRITICAL FAILURE","Destiny d"+spent.sides+" rolled 1");
    else parts.push("Destiny d"+spent.sides+" rolled "+spent.result);
    // A failure still waiting on its answer announces the roll and nothing else:
    // the points it moved may be undone, and a line must not claim what may be undone.
    if(!offered){
      if(change)parts.push((change>0?"Gained ":"Lost ")+Math.abs(change)+" Destiny Point"+(Math.abs(change)===1?"":"s"),"Current "+spent.pointsAfter);
      if(spent.recovered)parts.push("Gained a Destiny d"+spent.recovered.sides);
    }
    events.push({text:parts.join(" · "),kind:spent.criticalSuccess?"arcane-critical-success":spent.criticalFailure?"arcane-critical-failure":"destiny",entryId:entryId});
    // The save itself is deferred behind a pending marker; this line only announces it.
    if(spent.chaos){var saveAbility=rollEntry&&rollEntry.ability||"";addPendingFate({kind:"overreach",entryId:entryId,ability:saveAbility,dc:spent.chaos.dc,overreach:spent.chaos.overreach});events.push({text:"CHAOS RISK · Overreach "+spent.chaos.overreach+" · "+(saveAbility||"Ability")+" save DC "+spent.chaos.dc+" · pending",kind:"chaos",entryId:entryId});}
    return events;
  }
  /* Both answers are already half-applied: spendDestinyDie granted the point the
     moment the 1 landed, so accepting only has to announce it and refusing has
     to take it — and the die it may have brought back — away again. */
  function resolveArcaneOne(id,choice){
    var entry=entryById(id),spent=entry&&entry.destiny;
    if(!entry||!spent||!spent.criticalFailure||spent.arcaneChoice)return;
    var events=[];
    if(choice==="accept"){
      spent.arcaneChoice="accept";
      var accepted=["ARCANE FATE ACCEPTED · Critical failure","Gained 1 Destiny Point","Current "+state.destiny.points];
      if(spent.recovered)accepted.push("Gained a Destiny d"+spent.recovered.sides);
      events.push({text:accepted.join(" · "),kind:"arcane-critical-failure",entryId:entry.id});
    }else{
      if(spent.recovered){var back=state.destiny.dice.find(function(die){return die.id===spent.recovered.id;});if(back)back.available=false;}
      spent.arcaneChoice="chaos";spent.transformed=true;spent.originalResult=spent.result;
      spent.result=spent.sides;spent.rolls=[spent.sides];spent.chosenIndex=0;spent.recovered=null;
      spent.criticalFailure=false;spent.criticalSuccess=true;
      var hadPoints=state.destiny.points;
      setDestinyPoints(0,"Arcane fate refused",false,true);
      addPendingFate({kind:"chaos",entryId:entry.id,ability:entry.ability||"",name:entry.name||"Arcane failure refused"});
      events.push({text:"ARCANE FATE REFUSED · The 1 becomes "+spent.sides+" · Arcane Critical Success"+(hadPoints?" · Destiny becomes 0":""),kind:"arcane-critical-success",entryId:entry.id},
        {text:"CHAOS IS PENDING · 1 fatigue point per round until you face it",kind:"chaos",entryId:entry.id});
    }
    recomputeEntry(entry);
    var done=closeDecision();
    if(state.history.indexOf(entry)>=0)refreshEntryTray(entry);
    announceEvents(events,done);
  }
  function naturalDestiny(entry) {
    var events=[];
    if (entry.natural === 20) {
      var before = state.destiny.points,recovered=setDestinyPoints(before-1,"Natural 20",true,true);
      entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 20"};
      entry.awakening=state.destiny.points===0;
      // The draw is owed from this moment until the card is actually dealt.
      if(entry.awakening)state.destiny.awakeningOwed=true;
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
      // Each fallen die carries the key its own menu answers to, so a Portent
      // dropped on it later reaches this entry and no other.
      trayDiceForPlan(d20Plan,"d20",{dieRole:"base",colour:entry.d20Colour||"",landedKey:"d20",entryId:entry.id}).forEach(function(die,index){die.natural=die.result;if(entry.transformed&&index===Number(d20Plan.chosenIndex)){die.label="Original d20";die.dropped=true;}results.push(die);});
      if(entry.transformed)results.push({sides:20,result:20,label:"FATE 1→20",natural:20,special:"transformed"});
      entryBonusDice(entry).forEach(function(die){trayDiceForPlan(die,die.label,{dieRole:"bonus",landedKey:"bonus:"+die.id,entryId:entry.id}).forEach(function(item){results.push(item);});});
      if(entry.destiny)trayDiceForPlan(entry.destiny,"Destiny",{dieRole:"destiny",special:entry.destiny.criticalSuccess?"arcane-critical-success":entry.destiny.criticalFailure?"arcane-critical-failure":""}).reverse().forEach(function(item){results.unshift(item);});
      if(entry.plusTwo)results.push({kind:"modifier",result:2,label:"FH bonus"});
      if(entry.exhaustion)results.push({kind:"modifier",result:-Number(entry.exhaustion),label:"Exhaustion",tone:"exhaustion"});
    }else if(entry.kind==="destiny")results=trayDiceForPlan(entry.destiny,"Destiny",{dieRole:"destiny",special:entry.destiny.criticalSuccess?"arcane-critical-success":entry.destiny.criticalFailure?"arcane-critical-failure":""});
    else if(entry.kind==="tray"){
      // Through trayDiceForPlan so a free die on A/D shows the die it dropped,
      // struck through, exactly as the d20 does.
      results=[];
      (entry.dice||[]).forEach(function(die,index){
        trayDiceForPlan({sides:die.sides,rolls:die.rolls&&die.rolls.length?die.rolls:[die.result],result:die.result,chosenIndex:die.chosenIndex,mode:die.advantageMode,forced:die.forced,colour:die.colour},"d"+die.sides,{dieRole:"base",landedKey:"free:"+index,entryId:entry.id})
          .forEach(function(item){item.natural=die.sides===20?item.result:null;results.push(item);});
      });
    }
    state.trayResults=results;state.trayTitle=rollVerdictText(entry);state.trayResultText=rollDetailText(entry);
    // The name alone, for the moment the dice are still in the air.
    state.trayQuietTitle=entry.name||"Roll";
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
    if(exhaustionLevel())dice.push({kind:"modifier",result:exhaustionPenalty(),label:"Exhaustion",tone:"exhaustion",pending:true});
    state.traySelection=[];state.trayResults=dice;state.trayTitle=cfg.name+" "+signed(cfg.baseBonus);state.trayResultText="Ready";
  }
  /* CLEAR TRAY empties the hand and, with it, the running commentary above the
     dice — the Stream keeps the permanent record. Badges are debts, not
     commentary, so they stay. */
  function clearDiceTray(closeConsole){state.traySelection=[];state.trayResults=[];state.trayTitle="Dice Tray";state.trayResultText="";state.trayQuietTitle="";state.diceSignatures={};state.trayPrompt=null;state.queueDone="";state.rollSequence=null;state.pendingArmed=null;state.diePrompt=null;state.destinyStaged=null;state.events=[];stopCalling();stopTrayReveal();if(closeConsole!==false)state.rollConfig=null;persistPlayState();render();}
  /* An OPEN roll no longer locks the dock: it has already reached the stream,
     and CLEAR TRAY or the next roll are its two legitimate exits. Now that an
     announcement costs no click, the only phases left that hold the dock are
     the four that genuinely ask the player a question. */
  var BLOCKING_PHASES={nat1:1,arcane1:1,"roll-choice":1,"destiny-choice":1,"adjustment-choice":1};
  function rollTransactionActive(){var sequence=state.rollSequence;return !!(sequence&&BLOCKING_PHASES[sequence.phase]);}
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
  /* ── Holding the answer until the dice stop ──────────────────────
     The result used to be printed the instant the roll resolved, while the
     dice still had most of a second of rolling left -- so the tray spoiled
     its own reveal. The verdict, the arithmetic and the newest stream line
     all wait for the last die to settle. Nothing about the roll itself
     changes: the result is still resolved before the animation begins. */
  var ROLL_STAGGER_MS=42;
  function prefersReducedMotion(){
    try{return !!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);}
    catch(error){return false;}
  }
  function rollAnimationMs(){
    var renderer=window.FHStaticDice&&window.FHStaticDice.sound&&Number(window.FHStaticDice.sound.rollDuration);
    return renderer>0?renderer:960;
  }
  function armTrayReveal(dieCount){
    // Nothing is rolling when motion is suppressed, so nothing needs hiding.
    if(prefersReducedMotion()){state.trayRevealAt=0;return;}
    var span=rollAnimationMs()+Math.max(0,(Number(dieCount)||1)-1)*ROLL_STAGGER_MS+90;
    state.trayRevealAt=Date.now()+span;
    clearTimeout(state.trayRevealTimer);
    state.trayRevealTimer=window.setTimeout(function(){state.trayRevealAt=0;if(root)render();},span);
  }
  function trayRevealPending(){return !!(state.trayRevealAt&&Date.now()<state.trayRevealAt);}
  function stopTrayReveal(){state.trayRevealAt=0;clearTimeout(state.trayRevealTimer);}
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
    state.trayPrompt=null;state.queueDone="";
    state.rollConfig=configFromEntry(entry);
    startCalling();refreshOpenTray(entry);persistPlayState();render();
    // Every d20 path converges here, and an open roll that gains a staged die
    // comes back through — which is exactly when the table wants the update.
    broadcastEntry(entry);
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
    state.rollSequence.staged=stagedList().concat([{id:uuid(),kind:"destiny",destinyDieId:die.id,label:"Destiny",sides:die.sides,advantageMode:"flat",forcedResult:null}]);
    refreshOpenTray(entry);persistPlayState();render();
  }
  /* ── The Destiny pool behaves like the white picker ───────────────
     Clicking a gold die never spends it and never asks a question: it puts
     the die in the tray, in whichever of the three contexts is live — a roll
     still open, a console prepared, or nothing at all. ROLL is the only thing
     that spends Destiny, which is what makes cancelling free. */
  function announceStagedDestiny(die){
    dropEventsTagged("staged-destiny");
    recordEvent({text:"Destiny d"+die.sides+" waits in the tray · nothing is spent until ROLL",kind:"destiny",tag:"staged-destiny"});
    persistPlayState();render();
  }
  function stageDestinyFromPool(dieId){
    var die=state.destiny.dice.find(function(item){return item.id===dieId&&item.available;});
    if(!die){state.message="That Destiny die is no longer available.";state.messageKind="warn";renderMessage();return;}
    if(rollOpen()){
      var entry=openEntry();
      if(!entry||entry.destiny||stagedList().some(function(item){return item.kind==="destiny";})){
        state.message="This roll already carries a Destiny die.";state.messageKind="warn";renderMessage();return;}
      stageDestinyDie(dieId);announceStagedDestiny(die);return;
    }
    var cfg=state.rollConfig;
    if(cfg){
      var edited=cfg.editingId&&state.history.find(function(item){return item.id===cfg.editingId;});
      if(edited&&edited.destiny){state.message="This roll already carries a Destiny die.";state.messageKind="warn";renderMessage();return;}
      cfg.destinyDieId=die.id;cfg.destinyConfirmed=true;cfg.destinyForcedResult=null;
      prepareTrayForConfig(cfg);announceStagedDestiny(die);return;
    }
    state.destinyStaged={dieId:die.id,sides:die.sides,advantageMode:"flat",forcedResult:null};
    announceStagedDestiny(die);
  }
  /* The roll landed but stays open. Nothing has to be "applied" — it is already
     in the stream. Only two things end it: CLEAR TRAY, or a new roll. */
  function releaseRoll(){
    state.rollSequence=null;state.queueDone="";state.trayPrompt=null;state.diePrompt=null;
  }
  /* ROLL on an open roll: only the newly staged dice leave the hand, and they
     join the same stream entry. With nothing staged it simply rolls the same
     check again, as a fresh entry — the button says ROLL, so it rolls. */
  function rollStagedDice(){
    var entry=openEntry(),staged=stagedList();
    if(!rollOpen()||!entry)return;
    if(!staged.length){repeatOpenRoll(entry);return;}
    var events=[],settled=false,decision=null;
    staged.forEach(function(item){
      if(item.kind==="destiny"){
        if(entry.destiny)return;
        // A staged Destiny die keeps whatever its own menu gave it — a Portent,
        // advantage — exactly like every other die in the hand.
        var spent=spendDestinyDie(item.destinyDieId,true,destinyPlanFor(item));
        if(!spent)return;
        entry.destiny=spent;
        dropEventsTagged("staged-destiny");
        events=events.concat(destinyEventSpecs(spent,entry.id));
        decision=decision||arcaneDecision(spent,entry.id);
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
    if(events.length||decision){state.rollSequence.phase="open-after-events";persistPlayState();announceEvents(events,settled?"finish-sequence":"open-roll",decision);return;}
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
    if(events.length){state.rollSequence.phase="open-after-events";persistPlayState();announceEvents(events,"open-roll");return;}
    openRollState(entry);
  }
  function quickRoll(name, ability, bonus, note) {
    clearDiceTray(false);state.rollConfig=null;
    var natural = rollDie(20);
    var entry = {id:uuid(),kind:"d20",name:name,ability:ability,baseBonus:Number(bonus)||0,exhaustion:exhaustionLevel(),d20Mode:"flat",d20s:[natural],d20Roll:{sides:20,mode:"flat",rolls:[natural],result:natural,chosenIndex:0,forced:false},d20Choice:0,d20Forced:false,kept:natural,natural:natural,plusTwo:false,custom:0,bonusDice:[],guidance:null,bardic:null,destiny:null,dc:"",note:note||"",createdAt:new Date().toISOString(),adjusted:false};
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
    if(events.length){state.rollSequence.phase="open-after-events";persistPlayState();announceEvents(events,"open-roll");return;}
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
    if (cfg.editingId) { applyHistoryAdjustment(cfg); return; }
    var entry={id:uuid(),kind:"d20",name:cfg.name,ability:cfg.ability,baseBonus:cfg.baseBonus,exhaustion:exhaustionLevel(),d20Mode:cfg.d20Mode,d20s:[],kept:null,natural:null,plusTwo:cfg.plusTwo,custom:cfg.custom,dc:cfg.dc,note:cfg.note,createdAt:new Date().toISOString(),adjusted:false,bonusDice:[],guidance:null,bardic:null,destiny:null};
    state.rollSequence={phase:cfg.destinyDieId?"destiny":"remaining",cfg:snapshotRollConfig(cfg),entry:entry,entryId:entry.id};persistPlayState();
    if(cfg.destinyDieId)rollSequenceDestiny();else rollSequenceRemaining();
  }
  function rollSequenceDestiny(){
    var sequence=state.rollSequence;if(!sequence||!sequence.cfg)return;var cfg=sequence.cfg,die=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId&&item.available;});if(!die){pushEvent("That Destiny die is no longer available.","error");state.rollSequence=null;render();return;}
    if(!sequence.destinyPlan)sequence.destinyPlan=makeDiePlan(die.sides,cfg.destinyMode,cfg.destinyForcedResult);
    prepareTrayForConfig(cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==die.id;});trayDiceForPlan(sequence.destinyPlan,"Destiny",{flash:true,destinyDieId:die.id,dieRole:"destiny"}).reverse().forEach(function(item){state.trayResults.unshift(item);});state.trayResultText=sequence.destinyPlan.result==null?"Choose the Destiny result":"Destiny result selected";
    if(sequence.destinyPlan.result==null){showDieChoice("destiny",0,sequence.destinyPlan,"Destiny d"+die.sides);return;}
    var spent=spendDestinyDie(cfg.destinyDieId,true,sequence.destinyPlan);if(!spent){pushEvent("That Destiny die is no longer available.","error");state.rollSequence=null;render();return;}
    sequence.entry.destiny=spent;sequence.phase="destiny-events";prepareTrayForConfig(sequence.cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==spent.dieId;});trayDiceForPlan(spent,"Destiny",{destinyDieId:spent.dieId,dieRole:"destiny",special:spent.criticalSuccess?"arcane-critical-success":spent.criticalFailure?"arcane-critical-failure":""}).reverse().forEach(function(item){state.trayResults.unshift(item);});state.trayResultText="Destiny d"+spent.sides+" = "+spent.result;announceEvents(destinyEventSpecs(spent,sequence.entry.id),sequence.adjustment?"adjustment-remaining":"roll-remaining",arcaneDecision(spent,sequence.entry.id));
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
  /* ROLL on a Destiny die that waits in the tray with nothing else prepared.
     The click that put it there spent nothing; this is where it is spent. */
  function standaloneDestiny(dieId,plan) {
    clearDiceTray(false);state.rollConfig=null;var spent = spendDestinyDie(dieId,true,plan); if (!spent) return;
    var entry={id:uuid(),kind:"destiny",name:"Destiny d"+spent.sides,createdAt:new Date().toISOString(),destiny:spent,total:spent.result,outcome:spent.criticalSuccess?"Arcane Critical Success":spent.criticalFailure?"Arcane Critical Failure":spent.chaos?"Chaos risk":"Destiny spent"};
    addHistory(entry);setTrayFromEntry(entry);state.rollSequence={phase:"standalone",entryId:entry.id};
    var decision=arcaneDecision(spent,entry.id),specs=destinyEventSpecs(spent,entry.id);
    // The verdict line waits when the verdict is still the player's to give.
    if(!decision)specs=specs.concat([{text:entry.name+" · "+entry.outcome,kind:"result",entryId:entry.id}]);
    announceEvents(specs,"finish-sequence",decision);
  }
  function resolveNatOne(id, choice) {
    var entry=state.history.find(function (item) { return item.id===id; }); if(!entry||entry.natural!==1||entry.natChoice)return;
    var events=[];
    if(choice==="accept") { var before=state.destiny.points,recovered=setDestinyPoints(before+1,"Natural 1 accepted",true,true);entry.natChoice="accept";entry.destinyPointChange={before:before,after:state.destiny.points,reason:"Natural 1 accepted"};var accepted=["FATE ACCEPTED · Critical failure","Gained 1 Destiny Point","Current "+state.destiny.points];if(recovered)accepted.push("Gained a Destiny d"+recovered.sides);events.push({text:accepted.join(" · "),kind:"nat1",entryId:entry.id}); }
    // Defying fate no longer rolls Chaos on the spot: the 2d6 are deferred
    // behind a pending marker so the table is never blocked mid-turn.
    else { var oldPoints=state.destiny.points;entry.natChoice="chaos";entry.originalKept=entry.kept;entry.transformed=true;entry.kept=20;setDestinyPoints(0,"Invoked Chaos",false,true);entry.total=entryTotal(entry);addPendingFate({kind:"chaos",entryId:entry.id,ability:entry.ability||"",name:entry.name||"Defied roll"});events.push({text:"FATE DEFIED · The 1 becomes 20"+(oldPoints?" · Destiny becomes 0":""),kind:"nat1",entryId:entry.id},{text:"CHAOS IS PENDING · 1 fatigue point per round until you face it",kind:"chaos",entryId:entry.id}); }
    setTrayFromEntry(entry);entry.outcome=outcomeFor(entry);state.trayPrompt=null;persistPlayState();
    state.rollSequence=state.rollSequence||{};state.rollSequence.entryId=entry.id;state.rollSequence.phase="open-after-events";
    announceEvents(events,"open-roll");
  }
  function runQueueDone(action){
    if(action==="roll-remaining"){rollSequenceRemaining();return;}
    if(action==="adjustment-remaining"){var sequence=state.rollSequence,adjusted=sequence&&state.history.find(function(item){return item.id===sequence.entryId;})||sequence&&sequence.entry;if(adjusted&&sequence&&sequence.cfg){if(sequence.entry&&sequence.entry.destiny)adjusted.destiny=sequence.entry.destiny;applyHistoryAdjustmentRemaining(adjusted,sequence.cfg);}else render();return;}
    if(action==="open-roll"){var landed=openEntry();if(landed)openRollState(landed);else render();return;}
    // A standalone Destiny die never opens a roll, so it settles here instead.
    if(action==="finish-sequence"){
      var settled=state.rollSequence&&state.history.find(function(item){return item.id===state.rollSequence.entryId;});
      if(settled)broadcastEntry(settled);
      state.rollSequence=null;persistPlayState();render();return;}
    render();
  }
  /* ── Deferred fate ───────────────────────────────────────────────
     Chaos and the Overreach save no longer interrupt the turn. They are
     carried as a pending marker: the tray stays free, a red button waits,
     and the player pays a fatigue point per round until it is resolved.
     The two mechanics stay separate — a defied natural 1 resolves 2d6 on
     the Chaos table, an Overreach resolves a save against 10 + Overreach. */
  /* ── The Major Arcana ─────────────────────────────────────────────
     An Awakening deals a real card. The deck is the vault's own list of 22,
     generated into window.FH_ARCANA, so the card the dock hands you carries the
     powers the book gives it — no going and looking it up mid-turn. */
  function arcanaDeck(){var deck=typeof window!=="undefined"&&window.FH_ARCANA;return Array.isArray(deck)&&deck.length?deck:[];}
  function currentArcana(){return state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};}
  function arcanaDrawn(){return !!(currentArcana().name);}
  /* Card art is keyed by numeral, never by filename or English name — so the
     placeholder Rider-Waite-Smith deck can be swapped wholesale for the Saints
     d'AvA later by dropping 22 files into the same folder under the same names. */
  function arcanaArtUrl(numeral){return numeral?(SITE_ROOT||"../")+"assets/img/tarot/major/"+numeral+".jpg":"";}
  /* The Awakening is owed until the card is drawn: that is what the backdrop
     behind the dice is saying, and it says it until this stops being null. */
  function awakeningOwed(){return !!(state.destiny&&state.destiny.awakeningOwed);}
  function drawArcana(){
    var deck=arcanaDeck();
    if(!deck.length){state.message="The Arcana deck did not load — draw from the chapter instead.";state.messageKind="warn";renderMessage();return;}
    var card=deck[rollDie(deck.length)-1];
    // §5: the draw pays either way — +1 Score and 10 temporary Points — and only
    // then does the player choose whether to switch. So the card is a proposal.
    // It is dealt face down (revealed:false) — the flip is the player's own click.
    state.trayPrompt={type:"arcana-draw",card:card,previous:currentArcana().name||"",revealed:false};
    persistPlayState();render();
  }
  function flipArcana(){
    var prompt=state.trayPrompt;
    if(!prompt||prompt.type!=="arcana-draw"||prompt.revealed)return;
    prompt.revealed=true;persistPlayState();render();
  }
  function keepArcana(card,replace){
    var before=state.destiny.score;
    state.destiny.score=clamp(before+1,0,99);
    setDestinyPoints((Number(state.destiny.points)||0)+10,"Arcane Awakening",true,true);
    state.destiny.awakeningOwed=false;
    var events=[{text:"ARCANE AWAKENING · Drew "+card.numeral+" · "+card.name+" · Score "+state.destiny.score+" · +10 temporary Points",kind:"awakening"}];
    if(replace){
      var arcana={name:card.name,numeral:card.numeral,power:card.power,vibration:card.vibration,meaning:card.meaning};
      var overrides=Object.assign({},(state.profile&&state.profile.manualOverrides)||{},{arcana:arcana});
      saveProfile({manualOverrides:overrides}).then(function(){state.character=effectiveCharacter();render();})
        .catch(function(){state.message="Card kept on this device; server sync is unavailable.";state.messageKind="warn";renderMessage();});
      if(state.profile)state.profile.manualOverrides=overrides;
      state.character=effectiveCharacter();
      events.push({text:"ARCANA SWITCHED · "+card.name+" · "+card.power,kind:"awakening"});
    }else events.push({text:"ARCANA KEPT · "+(currentArcana().name||"your card")+" · the drawn powers are discarded",kind:"destiny"});
    state.trayPrompt=null;persistPlayState();announceEvents(events,"");
  }
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
      state.pendingArmed={id:item.id,kind:"chaos",sides:[6,6],ability:item.ability||""};
      state.trayResults=[0,1].map(function(index){return {sides:6,result:null,label:"Chaos #"+(index+1),pending:true,special:"chaos",dieRole:"chaos"};});
      state.trayTitle="Chaos";state.trayResultText="Roll 2d6 and read the Chaos table";
    }else{
      state.pendingArmed={id:item.id,kind:"overreach",sides:[20],dc:Number(item.dc)||10,ability:item.ability||"",overreach:Number(item.overreach)||0};
      state.trayResults=[{sides:20,result:null,label:(item.ability||"")+" save",pending:true,dieRole:"base"}];
      state.trayTitle="Overreach save";state.trayResultText="DC "+(Number(item.dc)||10)+" — roll to hold the Weave";
    }
    persistPlayState();render();
  }
  function rollPendingFate(){
    var armed=state.pendingArmed;if(!armed)return;
    var item=pendingFate().find(function(entry){return entry.id===armed.id;});
    var entry=item&&state.history.find(function(row){return row.id===item.entryId;});
    /* Refusing fate — a natural 1 or an Arcane Critical Failure — skips the
       Overreach save entirely and goes straight to 2d6 on the table. */
    if(armed.kind==="chaos"){
      var chaosAbility=armed.ability||item&&item.ability||entry&&entry.ability||"";
      var chaos=[rollDie(6),rollDie(6)],total=chaos[0]+chaos[1];
      if(entry){entry.chaosRoll=chaos;entry.chaosTotal=total;}
      state.trayResults=chaos.map(function(result,index){return {sides:6,result:result,label:"Chaos #"+(index+1),special:"chaos",dieRole:"chaos"};});
      var chaosEntry={id:uuid(),kind:"tray",name:"Chaos"+(chaosAbility?" · "+chaosAbility:"")+(item&&item.name?" · "+item.name:""),ability:chaosAbility,
        dice:chaos.map(function(result){return {sides:6,result:result};}),flatBonus:0,total:total,
        createdAt:new Date().toISOString(),outcome:"Chaos "+total,chaosRow:chaosRowText(chaosAbility,total)};
      state.trayTitle="Chaos";state.trayResultText="2d6 = "+chaos.join(" + ")+" = "+total;
      addHistory(chaosEntry);
      if(item)dropPendingFate(item.id);
      state.pendingArmed=null;state.rollSequence={phase:"free-tray",entryId:chaosEntry.id};
      // No chaosRoll on the line: the text already spells the 2d6 out, and the
      // renderer would append "total 5" a second time.
      announceEvents([{text:"CHAOS RESOLVED · 2d6 = "+chaos.join(" + ")+" = "+total+" · "+chaosVerdict(chaosAbility,total),kind:"chaos",entryId:chaosEntry.id}],"finish-sequence");
      return;
    }
    var ability=armed.ability||"",save={bonus:0};
    try{if(ability&&state.character)save=saveInfo(ability,state.character);}catch(error){}
    var overreach=Number(armed.overreach)||Number(item&&item.overreach)||0;
    var natural=rollDie(20),total=natural+(Number(save.bonus)||0)-exhaustionLevel(),dc=Number(armed.dc)||10,held=total>=dc;
    var saveEntry={id:uuid(),kind:"d20",name:"Overreach save"+(ability?" · "+ability:""),ability:ability,exhaustion:exhaustionLevel(),baseBonus:Number(save.bonus)||0,d20Mode:"flat",d20s:[natural],d20Roll:{sides:20,mode:"flat",rolls:[natural],result:natural,chosenIndex:0,forced:false},d20Choice:0,d20Forced:false,kept:natural,natural:natural,plusTwo:false,custom:0,bonusDice:[],guidance:null,bardic:null,destiny:null,dc:String(dc),note:"Deferred Overreach",createdAt:new Date().toISOString(),adjusted:false,total:total,outcome:held?"Success":"Failure"};
    addHistory(saveEntry);setTrayFromEntry(saveEntry);
    if(item)dropPendingFate(item.id);
    state.pendingArmed=null;
    var saveEvents=[{text:(held?"WEAVE HELD":"OVERREACH BREAKS")+" · "+(ability||"Save")+" "+total+" vs DC "+dc,kind:held?"result":"chaos",entryId:saveEntry.id}];
    /* Holding the Weave is not free: the rules pay for it in Exhaustion. */
    if(held){
      state.rollSequence={phase:"free-tray",entryId:saveEntry.id};
      var beforeLevel=exhaustionLevel(),after=setExhaustion(beforeLevel+1,"Overreach held",true);
      if(after!==beforeLevel)saveEvents.push({text:exhaustionText(after,"Overreach held"),kind:after>=MAX_EXHAUSTION?"nat1":"loss",entryId:saveEntry.id});
      announceEvents(saveEvents,"finish-sequence");
      return;
    }
    /* Failing it rolls 1d6 + Overreach on the table — one gesture, because the
       save and its consequence are one moment at the table. */
    var chaosDie=rollDie(6),chaosTotal=chaosDie+overreach;
    var breakEntry={id:uuid(),kind:"tray",name:"Chaos"+(ability?" · "+ability:""),ability:ability,
      dice:[{sides:6,result:chaosDie}],flatBonus:overreach,total:chaosTotal,
      createdAt:new Date().toISOString(),outcome:"Chaos "+chaosTotal,chaosRow:chaosRowText(ability,chaosTotal)};
    addHistory(breakEntry);
    state.trayResults=[{sides:6,result:chaosDie,label:"Chaos",special:"chaos",dieRole:"chaos"}];
    if(overreach)state.trayResults.push({kind:"modifier",result:overreach,label:"Overreach",tone:"overreach"});
    state.trayTitle="Chaos";state.trayResultText="d6 "+chaosDie+(overreach?" + Overreach "+overreach:"")+" = "+chaosTotal;
    state.rollSequence={phase:"free-tray",entryId:breakEntry.id};
    saveEvents.push({text:"CHAOS · d6 "+chaosDie+(overreach?" + Overreach "+overreach:"")+" = "+chaosTotal+" · "+chaosVerdict(ability,chaosTotal),kind:"chaos",entryId:breakEntry.id});
    announceEvents(saveEvents,"finish-sequence");
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
      "<button class=\"fh-cd-mstat"+(exhaustionLevel()?" is-exhausted":"")+(state.hpOpen?" is-active":"")+"\" type=\"button\" data-hp-open title=\"Exhaustion — "+esc(exhaustionNote(exhaustionLevel()))+"\">EXH <b>"+exhaustionLevel()+"</b></button>"+
      "<button class=\"fh-cd-mstat is-rest\" id=\"fhPsShortRest\" type=\"button\""+(exhaustionLevel()&&!(state.vitals||{}).shortRestUsed?"":" disabled")+
        " title=\""+(!exhaustionLevel()?"No Exhaustion to shake off":(state.vitals||{}).shortRestUsed?"Already used today's extra short rest — sleep first":"Short rest: one extra level of Exhaustion, once per day")+"\">SHORT</button>"+
      "<button class=\"fh-cd-mstat is-rest\" id=\"fhPsLongRest\" type=\"button\" title=\"Long rest: +1 Destiny Point, hit points back to full, one level of Exhaustion cleared, and the day's short rest is available again\">"+iconSvg("rest")+"REST</button>";
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
      "<span class=\"fh-cd-hpsep\">·</span>"+
      "<span class=\"fh-cd-hplbl\">EXH</span>"+
      "<button type=\"button\" data-exh-step=\"-1\""+(exhaustionLevel()?"":" disabled")+" aria-label=\"One level of Exhaustion less\">−</button>"+
      "<input data-exh-field type=\"number\" min=\"0\" max=\""+MAX_EXHAUSTION+"\" value=\""+exhaustionLevel()+"\" aria-label=\"Exhaustion level\">"+
      "<button type=\"button\" data-exh-step=\"1\""+(exhaustionLevel()>=MAX_EXHAUSTION?" disabled":"")+" aria-label=\"One level of Exhaustion more\">+</button>"+
      "<button class=\"fh-cd-hpx\" type=\"button\" data-hp-open aria-label=\"Close the vitals tracker\">"+iconSvg("close")+"</button></div>";
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
    state.message="Saving edited sheet…";state.messageKind="roll";renderMessage();saveProfile({manualOverrides:manualOverrides}).then(function(){state.editDraft=null;state.character=effectiveCharacter();state.message="Character sheet corrections saved.";state.messageKind="success";pushEvent("Character sheet edited","corrected");render();}).catch(function(error){state.message="Could not save edited sheet: "+error.message;state.messageKind="danger";renderMessage();});
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
    if(state.traySelection.length>=MAX_FREE_DICE){pushEvent("The free-roll tray holds at most "+MAX_FREE_DICE+" dice","warn");refreshEventPanel();return;}
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
    // A Destiny die waiting in the free tray is what ROLL is for: it resolves
    // alone, on the Destiny pool's own terms.
    if(state.destinyStaged){var waiting=state.destinyStaged;state.destinyStaged=null;dropEventsTagged("staged-destiny");standaloneDestiny(waiting.dieId,destinyPlanFor(waiting));return;}
    if(!state.traySelection.length)state.traySelection=[newFreeDie(20)];
    var labelInput=root&&root.querySelector("#fhPsTrayLabel");if(labelInput)state.trayLabel=String(labelInput.value||"Damage roll").slice(0,48);
    var dice=state.traySelection.map(function(die){var plan=makeDiePlan(die.sides,die.advantageMode,die.forcedResult);return {sides:die.sides,result:plan.result,rolls:(plan.rolls||[plan.result]).slice(),chosenIndex:plan.chosenIndex==null?0:plan.chosenIndex,advantageMode:rollMode(plan.mode),forced:!!plan.forced,colour:die.colour||""};}),entry={id:uuid(),kind:"tray",name:state.trayLabel||"Damage roll",dice:dice,total:dice.reduce(function(sum,die){return sum+(Number(die.result)||0);},0),createdAt:new Date().toISOString(),outcome:"Free roll"};
    addHistory(entry);setTrayFromEntry(entry);
    // No trailing result popup here either: the tray shows the verdict and the
    // stream keeps it. Only a natural 20 or 1 is worth stopping for.
    var special=dice.find(function(die){return die.sides===20&&(die.result===1||die.result===20);}),events=[];
    if(special)events.push({text:(special.result===20?"NATURAL 20 IN THE TRAY":"NATURAL 1 IN THE TRAY")+" · "+entry.name+" · Total "+entry.total,kind:special.result===20?"nat20":"nat1",entryId:entry.id});
    state.rollSequence=null;state.queueDone="";
    if(events.length){state.rollSequence={phase:"free-tray",entryId:entry.id};announceEvents(events,"finish-sequence");return;}
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
  /* The Destiny and white-dice pickers are buttons, not rolled dice: no
     rotation, no result face, ever. They show the same static 3D shapes as
     the tray, pre-rendered to a cached image by fh-static-dice.js so the
     picker row never opens a live WebGL context. Falls back to the flat SVG
     glyph -- with its label painted on the face -- if the renderer or WebGL
     is unavailable. */
  function pickerFace(sides,size,materialName,label){
    var image=window.FHStaticDice&&window.FHStaticDice.pickerImage&&window.FHStaticDice.pickerImage(sides,materialName,size);
    if(!image)return dieSvg(sides,size,materialName,label);
    return "<img class=\"fh-cd-pickerimg\" data-sides=\""+Number(sides)+"\" width=\""+size+"\" height=\""+size+"\" alt=\"\" aria-hidden=\"true\" src=\""+image+"\">"+
      "<b class=\"fh-cd-pickerlabel\">"+esc(label)+"</b>";
  }
  /* Tokens are not dice — they are the flat numbers a roll carries. Gold is the
     Fate's Hand bonus, yellow is Exhaustion, red is the Overreach a Chaos roll
     adds, copper is anything the player typed in by hand. */
  var TOKEN_TONES={
    fh:{fill:"#d9b25e",rim:"#6d4a10",facet:"#7a5a14",num:"#3a2606"},
    mod:{fill:"#b0763a",rim:"#6e451a",facet:"#8a5a26",num:"#fdf3dd"},
    exhaustion:{fill:"#e0c34a",rim:"#7a6410",facet:"#9a7f16",num:"#3a3106"},
    overreach:{fill:"#b51d25",rim:"#4a0c10",facet:"#7d161c",num:"#fff0ee"}
  };
  function tokenSvg(size,label,tone){
    var body=TOKEN_TONES[tone]||TOKEN_TONES.mod;
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
      var tone=die.tone||(die.label==="FH bonus"?"fh":"mod"),text=(Number(die.result)||0)>=0?"+"+Math.abs(Number(die.result)||0):"−"+Math.abs(Number(die.result)||0);
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
      else if(die.poolDestinyId)handle=" data-die-pool=\""+esc(die.poolDestinyId)+"\"";
      else if(die.destinyDieId)handle=" data-die-destiny=\""+esc(die.destinyDieId)+"\"";
      else if(die.freeId)handle=" data-die-free=\""+esc(die.freeId)+"\"";
      else if(die.dieRole==="base")handle=" data-die-base=\"1\"";
      if(handle){classes.push("is-tunable");handle+=" title=\"Right click or long press: colour, advantage, Portent\"";}
    }
    /* A die that has already fallen keeps answering — a Diviner replaces
       results after the fact, which is the whole of Portent. Destiny dice are
       the exception: what they read is what they cost. */
    else if(die.landedKey&&die.result!=null&&!die.dropped&&die.dieRole!=="destiny"){
      handle=" data-die-landed=\""+esc(die.landedKey)+"\" data-die-entry=\""+esc(die.entryId||"")+"\""+
        " title=\"Right click or long press: colour, Portent\"";
      classes.push("is-tunable");
    }
    var materialName=dieMaterialName(die),face=dieSvg(die.sides,size,materialName,die.result==null?"?":die.result);
    /* The WebGL renderer is deliberately only a renderer: the face was chosen
       before this markup exists. Larger pools retain the lightweight SVG tray
       and its lower GPU cost. */
    if(ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0&&count<=LIGHTWEIGHT_DICE_THRESHOLD){
      var resolved=die.result!=null,staticResult=resolved?Number(die.result):1,staticLabel=resolved?"result "+staticResult:"ready";
      var staticBody="";
      if(Number(die.sides)===100){
        var percentile=staticResult===100?"00":String(staticResult).padStart(2,"0");
        staticBody="<span class=\"fh-cd-static3d-part\"><canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static3d-result\" aria-hidden=\"true\">"+(resolved?percentile.charAt(0):"")+"</b></span>"+
          "<span class=\"fh-cd-static3d-part\"><canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static3d-result\" aria-hidden=\"true\">"+(resolved?percentile.charAt(1):"")+"</b></span>";
        dieClasses+=" is-percentile";
      }else{
        var staticText=Number(die.sides)===10&&staticResult===10?"0":staticResult;
        staticBody="<canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static3d-result\" aria-hidden=\"true\">"+(resolved?staticText:"")+"</b>";
      }
      face="<span class=\"fh-cd-static3d"+(Number(die.sides)===100?" is-percentile":"")+"\" data-sides=\""+Number(die.sides)+"\" data-result=\""+staticResult+"\" data-pending=\""+(resolved?"0":"1")+"\" data-material=\""+esc(materialName)+"\" data-index=\""+Number(index||0)+"\" data-animate=\""+(resolved&&animate?"1":"0")+"\" style=\"--fh-static-die-size:"+size+"px\" role=\"img\" aria-label=\"d"+Number(die.sides)+" "+staticLabel+"\">"+
        staticBody+"<span class=\"fh-cd-static3d-fallback\">"+face+"</span></span>";
      dieClasses+=" is-static3d";
    }
    return "<span class=\""+classes.join(" ")+"\""+handle+">"+source+
      "<span class=\""+dieClasses+"\">"+face+"</span>"+
      "<em>"+esc((die.label||("d"+die.sides))+status)+"</em></span>";
  }
  /* ── The event list, above the dice ─────────────────────────────
     Announcements have no button and never wait: they stack, newest first,
     and the newest is simply larger and brighter than the ones under it.
     A decision is the one line that carries buttons, because it is the one
     line that is asking rather than telling. */
  function eventLine(event,current){
    var parts=String(event.text||"").split(" · "),headline=parts.shift()||"Fate moves";
    if(event.kind==="awakening"){var arcana=state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};if(arcana.name)parts.push(arcana.name);}
    if(event.chaosRoll)parts.push("total "+(Number(event.chaosRoll[0])+Number(event.chaosRoll[1])));
    var link=event.kind==="chaos"?"<a class=\"fh-cd-elink\" href=\""+esc(toolUrl("rules",""))+"chapters/chaos-tables/\">table</a>":"";
    return "<li class=\"fh-cd-eline is-"+esc(event.kind)+(current?" is-current":"")+"\">"+
      "<b>"+esc(headline)+"</b>"+(parts.length?"<i>"+esc(parts.join(" · "))+"</i>":"")+link+"</li>";
  }
  function renderDecisionLine(){
    var prompt=state.trayPrompt;
    if(prompt&&prompt.type==="die-choice"){
      return "<li class=\"fh-cd-eline is-decision is-die-choice is-current\"><b>"+(prompt.mode==="choice"?"A / D":"CHOOSE RESULT")+"</b>"+
        "<i>"+esc(prompt.label)+" — either result may be kept</i>"+
        "<span class=\"fh-cd-eacts is-dice\">"+(prompt.rolls||[]).map(function(result,index){
          return "<button type=\"button\" data-die-choice=\""+index+"\" class=\"fh-cd-die\" aria-label=\"Keep "+result+"\">"+dieSvg(prompt.sides,30,dieMaterialName({sides:prompt.sides,result:result,dieRole:prompt.dieRole}),result)+"</button>";
        }).join("")+"</span></li>";
    }
    if(prompt&&prompt.type==="nat1"){
      return "<li class=\"fh-cd-eline is-decision is-nat1 is-current\"><b>NATURAL 1 · do you accept your fate?</b>"+
        "<i>Accept: critical failure, +1 Destiny Point. Refuse: the 1 becomes 20, Destiny falls to 0, Chaos becomes pending.</i>"+
        "<span class=\"fh-cd-eacts\"><button type=\"button\" data-tray-accept-fate>Accept</button>"+
        "<button type=\"button\" class=\"is-danger\" data-tray-refuse-fate>Refuse</button></span></li>";
    }
    if(prompt&&prompt.type==="arcane1"){
      var sides=Number(prompt.sides)||4;
      return "<li class=\"fh-cd-eline is-decision is-arcane-critical-failure is-current\"><b>ARCANE CRITICAL FAILURE · do you accept your fate?</b>"+
        "<i>Accept: the failure stands, +1 Destiny Point. Refuse: the 1 reads as "+sides+" — Arcane Critical Success — Destiny falls to 0, Chaos becomes pending.</i>"+
        "<span class=\"fh-cd-eacts\"><button type=\"button\" data-arcane-fate=\"accept\">Accept</button>"+
        "<button type=\"button\" class=\"is-danger\" data-arcane-fate=\"chaos\">Refuse</button></span></li>";
    }
    return "";
  }
  function renderEventList(){
    var decision=renderDecisionLine();
    var lines=state.events.slice(0,SHOWN_EVENTS).map(function(event,index){return eventLine(event,!index&&!decision);}).join("");
    if(!decision&&!lines)return "";
    return "<ul class=\"fh-cd-events\" aria-live=\"polite\">"+decision+lines+"</ul>";
  }
  /* Menus, under the dice: a die's own card, a badge's card, and the deferred
     fate cards. These are things the player opened, not things that happened. */
  function renderEventContent(){
    var prompt=state.trayPrompt;
    /* Pinning a badge by hand: anything the table must not forget. */
    if(prompt&&prompt.type==="pending-new"){
      return "<div class=\"fh-cd-card is-badgemenu\"><small>PIN A BADGE</small><b>What must not be forgotten?</b>"+
        "<p>It stays above the tray until you cancel it — CLEAR TRAY does not touch it.</p>"+
        "<div class=\"fh-cd-dmrow\"><input id=\"fhPsBadgeLabel\" maxlength=\"24\" value=\"\" placeholder=\"Concentration, Rage, 2 rounds…\" aria-label=\"Badge label\"></div>"+
        // Exhaustion is the one badge the dock can also do the arithmetic for,
        // so it is offered as a type rather than typed in as free text.
        "<div class=\"fh-cd-dmrow\"><span>Or</span><button type=\"button\" class=\"fh-cd-dmmode\" data-pending-exhaustion"+
        (exhaustionLevel()>=MAX_EXHAUSTION?" disabled":"")+" title=\"Take a level of Exhaustion — the dock tracks the −1 and puts it on every roll\">Exhaustion +1</button></div>"+
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
    if(prompt&&prompt.type==="chaos"){
      var chaosEntry=state.history.find(function(item){return item.id===prompt.entryId;}),roll=chaosEntry&&chaosEntry.chaosRoll||[0,0];
      return "<div class=\"fh-cd-card is-chaos\"><small>FATE DEFIED</small><b>Chaos has noticed.</b><p>2d6 = "+roll[0]+" + "+roll[1]+" = "+(roll[0]+roll[1])+" · the d20 becomes 20 · Destiny becomes 0.</p><div class=\"fh-cd-acts\"><a href=\""+esc(toolUrl("rules",""))+"chapters/chaos-tables/\">Chaos table</a><button data-tray-close>OK</button></div></div>";
    }
    /* The card the deck just dealt, with the powers it actually carries — and
       the one choice §5 leaves you: take it, or keep what you had. */
    if(prompt&&prompt.type==="arcana-draw"&&prompt.card){
      var drawn=prompt.card,revealed=!!prompt.revealed,art=arcanaArtUrl(drawn.numeral);
      var stage="<div class=\"fh-tarot-stage\">"+
        (revealed
          ?"<div class=\"fh-tarot-card is-flipped\"><span class=\"fh-tarot-face fh-tarot-back\"></span>"+
            "<span class=\"fh-tarot-face fh-tarot-front\"><img src=\""+esc(art)+"\" alt=\""+esc(drawn.name)+"\" loading=\"lazy\" onerror=\"this.parentNode.classList.add('is-artless')\"><em>"+esc(drawn.numeral)+"</em></span></div>"
          :"<button type=\"button\" class=\"fh-tarot-card\" data-arcana-flip aria-label=\"Reveal the drawn card\">"+
            "<span class=\"fh-tarot-face fh-tarot-back\"></span>"+
            "<span class=\"fh-tarot-face fh-tarot-front\"><img src=\""+esc(art)+"\" alt=\"\" loading=\"lazy\" onerror=\"this.parentNode.classList.add('is-artless')\"><em>"+esc(drawn.numeral)+"</em></span></button>")+
        "</div>";
      return "<div class=\"fh-cd-card is-awakening is-arcana is-tarot"+(revealed?" is-revealed":"")+"\">"+
        "<small>ARCANE AWAKENING"+(revealed?" · "+esc(drawn.numeral):"")+"</small>"+
        "<b>"+(revealed?esc(drawn.name):"A card is dealt, face down")+"</b>"+stage+
        (revealed
          ?"<p><b>Power</b> "+esc(drawn.power||"—")+(drawn.vibration?"<br><b>Vibration</b> "+esc(drawn.vibration):"")+
            (drawn.meaning?"<br><em>"+esc(drawn.meaning)+"</em>":"")+"</p>"+
            "<p class=\"fh-cd-arcnote\">+1 Destiny Score and 10 temporary Points either way"+(prompt.previous?" · you currently hold "+esc(prompt.previous):"")+".</p>"+
            "<div class=\"fh-cd-acts\"><button data-arcana-take>Switch to "+esc(drawn.name)+"</button>"+
            (prompt.previous?"<button class=\"is-ghost\" data-arcana-keep>Keep "+esc(prompt.previous)+"</button>":"")+"</div>"
          :"<p class=\"fh-cd-arcnote\">+1 Destiny Score and 10 temporary Points either way"+(prompt.previous?" · you currently hold "+esc(prompt.previous):"")+" — tap the card to reveal it.</p>")+
        "</div>";
    }
    if(prompt&&prompt.type==="awakening"){
      var arcana=state.character&&state.character.destinyBuild&&state.character.destinyBuild.arcana||{};
      return "<div class=\"fh-cd-card is-awakening\"><small>DESTINY REACHES ZERO</small><b>Arcane Awakening</b><p>Natural 20 · "+esc(arcana.name||"Major Arcana")+"</p><div class=\"fh-cd-acts\"><button data-tray-close>OK</button></div></div>";
    }
    /* Right click on a die: its colour, its seal and its own advantage, in one
       card instead of three menus. The card offers only what THAT die can do —
       a fallen die can no longer be re-rolled or re-sealed, but a Diviner may
       still replace what it reads. */
    if(state.diePrompt){
      var target=findStagedDie(state.diePrompt);
      if(target){
        var seals=[["","None"],["guidance","Guidance"],["bardic","Bardic"],["other-1","I"],["other-2","II"],["other-3","III"]];
        var poolReady=state.destiny.dice.some(function(die){return die.available&&die.sides===target.sides;});
        var landed=target.scope==="landed";
        var isDestiny=target.scope==="destiny"||target.scope==="staged-destiny"||target.scope==="pool-destiny";
        var canSeal=target.scope==="bonus"||target.scope==="staged";
        /* A/D means "roll two, choose afterwards" — that needs a resolver, and
           only the console's own Destiny slot and a check's bonus dice have one.
           Free dice and staged Destiny dice get A and D, which settle themselves. */
        var modes=landed?[]
          :target.scope==="free"||target.scope==="staged-destiny"||target.scope==="pool-destiny"?["flat","advantage","disadvantage"]
          :["flat","advantage","disadvantage","choice"];
        // A free damage die has neither a source nor an advantage: only a colour.
        var sealRow=!canSeal?"":"<div class=\"fh-cd-dmrow\"><span>Seal</span>"+seals.map(function(pair){
            return "<button type=\"button\" class=\"fh-cd-dmseal"+((target.sourceIcon||"")===pair[0]?" is-on":"")+"\" data-die-seal=\""+pair[0]+"\" title=\""+pair[1]+"\">"+(pair[0]?bonusSourceMark(pair[0]):"—")+"</button>";
          }).join("")+
          "<button type=\"button\" class=\"fh-cd-dmseal is-destiny\" data-die-seal=\"destiny\""+(poolReady?"":" disabled")+" title=\""+(poolReady?"Take a Destiny d"+target.sides+" from the pool instead — ROLL is what spends it":"No Destiny d"+target.sides+" available")+"\">★</button></div>";
        // Gold is a Destiny die's identity, not a preference, so it is not offered a palette.
        var colourRow=isDestiny?"":"<div class=\"fh-cd-dmrow\"><span>Colour</span>"+DIE_COLOURS.map(function(pair){
            return "<button type=\"button\" class=\"fh-cd-dmcol"+((target.colour||"ivory")===pair[0]?" is-on":"")+"\" data-die-colour=\""+pair[0]+"\" title=\""+pair[1]+"\">"+dieSvg(6,15,pair[0],"")+"</button>";
          }).join("")+"</div>";
        var modeRow=!modes.length?"":"<div class=\"fh-cd-dmrow\"><span>Roll</span>"+modes.map(function(mode){
            var short=mode==="flat"?"—":mode==="advantage"?"A":mode==="disadvantage"?"D":"A/D";
            return "<button type=\"button\" class=\"fh-cd-dmmode"+((target.advantageMode||"flat")===mode?" is-on":"")+"\" data-die-mode-set=\""+mode+"\">"+short+"</button>";
          }).join("")+"</div>";
        /* The Portent used to hide in a FINE TUNE drawer. It belongs to one die,
           so it lives with that die — as a dropdown, not a number spinner. */
        var forced=target.forcedResult==null?"":String(target.forcedResult);
        var portentRow="<div class=\"fh-cd-dmrow\"><span>Portent</span>"+
          "<select class=\"fh-cd-dmportent"+(forced?" is-on":"")+"\" data-die-portent aria-label=\"Force this die's result\" title=\""+(landed?"Replace what this die reads — the roll is recomputed and marked MANUAL":"Force this die to a chosen result — the roll is marked MANUAL")+"\">"+
          "<option value=\"\">"+(landed?"— as it fell":"— roll it")+"</option>"+
          Array.from({length:target.sides},function(_,index){var value=index+1;return "<option value=\""+value+"\""+(forced===String(value)?" selected":"")+">"+value+"</option>";}).join("")+
          "</select></div>";
        var head="d"+target.sides+(target.label&&target.label!=="d"+target.sides?" · "+esc(target.label):"")+(landed?" · FALLEN":"");
        // Removes THIS die only — emptying the whole tray is the permanent CLEAR TRAY.
        var removable=target.scope!=="base"&&!landed;
        return "<div class=\"fh-cd-card is-diemenu\"><small>"+head+"</small>"+sealRow+colourRow+modeRow+portentRow+
          "<div class=\"fh-cd-acts\">"+(removable?"<button class=\"is-ghost\" data-die-drop>Remove this die</button>":"")+"<button data-tray-close>Done</button></div></div>";
      }
      state.diePrompt=null;
    }
    return "";
  }
  function trayDiceForDisplay(){
    if(state.trayResults.length)return state.trayResults;
    if(state.rollConfig)return [];
    var dice=state.traySelection.map(function(die){return {sides:die.sides,result:forcedDieResult(die.forcedResult,die.sides),label:"d"+die.sides,dieRole:"base",pending:true,freeId:die.id,colour:die.colour||"",forced:die.forcedResult!=null};});
    // A Destiny die picked up with nothing else prepared waits here, first in
    // the row and pulsing, until ROLL decides to spend it.
    var waiting=state.destinyStaged;
    if(waiting){
      if(state.destiny&&state.destiny.dice.some(function(die){return die.id===waiting.dieId&&die.available;}))
        dice.unshift({sides:waiting.sides,result:forcedDieResult(waiting.forcedResult,waiting.sides),label:"Destiny",dieRole:"destiny",pending:true,flash:true,poolDestinyId:waiting.dieId,forced:waiting.forcedResult!=null});
      else state.destinyStaged=null;
    }
    return dice;
  }
  /* ── What the frame is saying behind the dice ─────────────────────
     Two kinds of backdrop. A DEBT persists — Chaos or an Overreach waiting, an
     Awakening not yet drawn — and keeps its streaks up until the thing is faced.
     A MOMENT is whatever the newest event was, and fades with it. The debt wins:
     a critical you already read matters less than a table you still owe. */
  function frameMood(){
    if(state.pendingArmed)return state.pendingArmed.kind==="chaos"?"chaos-armed":"overreach-armed";
    if(awakeningOwed())return "awakening";
    var owed=pendingFate().filter(pendingResolvable);
    if(owed.length)return owed.some(function(item){return item.kind==="chaos";})?"chaos-owed":"overreach-owed";
    var newest=state.events[0];
    if(!newest)return "";
    return {"arcane-critical-success":"arcane-success","arcane-critical-failure":"arcane-failure",
      nat20:"crit-success",nat1:"crit-failure",awakening:"awakening",chaos:"chaos-owed"}[newest.kind]||"";
  }
  /* A die's animation identity. entryId is folded in so re-rolling the same
     skill to the same number still counts as a new landing, while a die that
     is merely being re-rendered keeps its key and stays still. */
  function dieAnimationKey(die,index){
    if(die.entryId&&die.landedKey)return die.entryId+"/"+die.landedKey;
    return String(die.landedKey||die.stagedId||die.bonusId||die.poolDestinyId||die.destinyDieId||die.freeId||
      ((die.dieRole||"die")+":"+die.sides+":"+index));
  }
  function renderFrameInner(){
    var dice=trayDiceForDisplay();
    /* Each die decides for itself whether it has just landed. This used to be
       one tray-wide signature, which meant that adding a single bonus die
       re-rolled every die already lying in the tray -- the landed d20 span
       again without its value ever changing. */
    var previous=state.diceSignatures||{},signatures={},animated=false;
    dice.forEach(function(die,index){signatures[dieAnimationKey(die,index)]=die.result==null?"?":String(die.result);});
    var flags=dice.map(function(die,index){
      var key=dieAnimationKey(die,index);
      var animate=die.result!=null&&previous[key]!==signatures[key];
      if(animate)animated=true;
      return animate;
    });
    state.diceSignatures=signatures;
    if(animated)armTrayReveal(dice.length);
    /* While the dice are in the air the total stays out of sight: printing it
       instantly answered the question before the roll could. */
    var quiet=trayRevealPending();
    var title=quiet&&state.trayQuietTitle?state.trayQuietTitle:state.trayTitle;
    var detail=quiet?"Rolling…":state.trayResultText;
    var status=detail||title
      ? "<b>"+esc(title||"")+"</b>"+(detail?"<em>"+esc(detail)+"</em>":"")
      : "<em>Ready — click a skill, a save or an ability.</em>";
    // The verdict docks to the bottom of the frame; popups now live outside it.
    return "<div class=\"fh-cd-dicerow\">"+dice.map(function(die,index){return visualDie(die,index,dice.length,flags[index]);}).join("")+"</div>"+
      "<div class=\"fh-cd-status\" aria-live=\"polite\">"+status+"</div>";
  }
  /* One ROLL, one CLEAR TRAY. Nothing else is permanent. Below them the
     transient badges, then the tray, then whatever popup is owed — which
     pushes the stream down instead of covering the dice. */
  function rollSummaryText(){
    var cfg=state.rollConfig,staged=stagedList().length;
    if(state.pendingArmed)return state.pendingArmed.kind==="chaos"?"2d6 · Chaos table":"d20 save · DC "+(Number(state.pendingArmed.dc)||10);
    if(rollOpen())return staged?staged+" new die"+(staged===1?"":"s"):"the same check again";
    if(state.destinyStaged&&!cfg)return "★ Destiny d"+state.destinyStaged.sides+" · spends it";
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
    /* Exhaustion is not a debt the player pinned, it is a condition the sheet
       already knows about — so it leads the strip and opens the tracker rather
       than a rename card. */
    var badges=(exhaustionLevel()
      ? "<button type=\"button\" class=\"fh-cd-pending is-exhaustion\" data-hp-open title=\"Exhaustion "+exhaustionLevel()+" — "+esc(exhaustionNote(exhaustionLevel()))+"\">EXHAUSTION "+exhaustionLevel()+"</button>"
      : "")+
      pendingFate().map(function(item){
      return "<button type=\"button\" class=\"fh-cd-pending"+(item.kind==="note"?" is-note":"")+"\" data-pending-open=\""+esc(item.id)+"\" data-pending-id=\""+esc(item.id)+"\" title=\""+esc(pendingTitle(item))+"\">"+esc(pendingLabel(item))+"</button>";
    }).join("")+
      "<button type=\"button\" class=\"fh-cd-pendadd\" data-pending-add title=\"Pin a reminder of your own\" aria-label=\"Pin a badge\">…</button>";
    var menu=renderEventContent();
    /* Events sit between the badges and the dice: what just happened reads
       above the dice it happened to, and a menu the player opened stays under
       them so it never pushes the roll off screen. */
    return "<section class=\"fh-cd-stage\" data-zone=\"roller\">"+
      "<div class=\"fh-cd-acts-bar\">"+
      /* The d20 carries the word ROLL on its own face, so the button is the
         die: no separate label competing with it. What the roll is made of
         stays as text beside the die, where it can be read without crowding
         the face. */
      /* alt carries the word rather than aria-label: it names the button for a
         screen reader AND is what the browser paints if the artwork ever fails
         to load, so the primary action is never a blank square. */
      "<button class=\"fh-cd-mainroll"+(armed?" is-chaos":"")+"\" type=\"button\" data-roll-now"+(busy?" disabled":"")+">"+
      "<img class=\"fh-cd-rolldie\" src=\""+esc((SITE_ROOT||"../")+"assets/img/roll-d20.webp")+"\" alt=\"ROLL\" width=\"120\" height=\"120\">"+
      "<small>"+esc(rollSummaryText())+"</small></button>"+
      "<button class=\"fh-cd-mainclear\" type=\"button\" data-clear-tray"+(busy?" disabled title=\"Answer the question above the dice first\"":"")+">CLEAR<i> TRAY</i></button></div>"+
      "<div class=\"fh-cd-temps\">"+badges+"</div>"+
      renderEventList()+
      "<div class=\"fh-cd-frame"+(frameMood()?" mood-"+frameMood():"")+"\">"+renderFrameInner()+"</div>"+
      (menu?"<div class=\"fh-cd-popups\">"+menu+"</div>":"")+
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
      // Selected means "waiting in the tray", wherever the tray is holding it.
      var selected=!!die&&((state.rollConfig&&state.rollConfig.destinyDieId===die.id)||
        (state.destinyStaged&&state.destinyStaged.dieId===die.id)||
        stagedList().some(function(item){return item.kind==="destiny"&&item.destinyDieId===die.id;}));
      return "<span class=\"fh-cd-poolwrap\"><button type=\"button\" class=\"fh-cd-ddie"+(die?"":" is-empty")+(selected?" is-selected":"")+(die&&calling?" is-calling":"")+"\" "+(die?"data-destiny-die=\""+die.id+"\"":"disabled")+" aria-label=\""+(die?"Spend":"No")+" Destiny d"+sides+"\">"+
        pickerFace(sides,PICKER_DIE_PX,die?"gold":"ivory","d"+sides)+(available.length>1?"<span class=\"fh-cd-mult\">×"+available.length+"</span>":"")+"</button></span>";
    }).join("");
    // One ⋮ pilots every size's pool from a single popup -- not five separate
    // menus scattered across the row. It never touches Points or Score, only
    // how many dice of each size are in the pool.
    var poolMenuOpen=!!state.destinyPoolMenu;
    var poolMenu=poolMenuOpen?"<div class=\"fh-cd-dpoolmenu\">"+DIE_SEQUENCE.map(function(sides){
      var count=state.destiny.dice.filter(function(die){return die.sides===sides&&die.available;}).length;
      return "<div class=\"fh-cd-dpoolrow\"><b>d"+sides+"</b><span class=\"fh-cd-dpoolcount\">"+count+"</span>"+
        "<button type=\"button\" data-destiny-pool=\""+sides+":-1\""+(count?"":" disabled")+" aria-label=\"Remove one Destiny d"+sides+"\">−</button>"+
        "<button type=\"button\" data-destiny-pool=\""+sides+":1\""+(count>=3?" disabled":"")+" aria-label=\"Add one Destiny d"+sides+"\">+</button></div>";
    }).join("")+"</div>":"";
    // The Score changes once in a campaign, so it is plain text with a
    // click-to-edit affordance instead of a permanently locked input.
    var score=state.scoreEditing
      ? "<input class=\"fh-cd-scorein\" data-destiny-field=\"score\" type=\"number\" value=\""+state.destiny.score+"\" aria-label=\"Destiny Score\">"
      : "<button class=\"fh-cd-score\" type=\"button\" data-score-edit title=\"Click to change the Destiny Score\">"+state.destiny.score+"</button>";
    return "<section class=\"fh-cd-zone\" data-zone=\"destiny\"><div class=\"fh-cd-cap\">DESTINY<small>⋮ manages the pool · click a die to spend it</small></div>"+
      "<div class=\"fh-cd-destiny-row\">"+
      "<span class=\"fh-cd-dgroup is-pts\"><span class=\"fh-cd-pts\">"+
      "<button type=\"button\" data-destiny-step=\"points:-1\" aria-label=\"One Destiny Point less\">−</button>"+
      "<input data-destiny-field=\"points\" type=\"number\" value=\""+state.destiny.points+"\" aria-label=\"Current Destiny Points\">"+
      "<button type=\"button\" data-destiny-step=\"points:1\" aria-label=\"One Destiny Point more\">+</button></span>"+
      "<span class=\"fh-cd-dlab\">POINTS</span></span>"+
      "<span class=\"fh-cd-dslash\">/</span>"+
      "<span class=\"fh-cd-dgroup is-score\"><span class=\"fh-cd-dlab\">SCORE</span>"+score+"</span>"+
      (overflow?"<b class=\"fh-cd-overflow\" title=\"Points above your Score\">+"+overflow+"</b>":"")+
      /* The ⋮ lives INSIDE .fh-cd-pool, right against d4 -- .fh-cd-pool carries
         margin-left:auto to push the whole dice group toward the Arcana side,
         which left a ~100px gap when the ⋮ sat just outside it as a sibling. */
      "<span class=\"fh-cd-pool\"><span class=\"fh-cd-poolmenuwrap\"><button type=\"button\" class=\"fh-cd-dmenu"+(poolMenuOpen?" is-active":"")+"\" data-destiny-poolmenu aria-haspopup=\"true\" aria-expanded=\""+(poolMenuOpen?"true":"false")+"\" aria-label=\"Manage the Destiny dice pool\">"+glyph("dots")+"</button>"+poolMenu+"</span>"+dice+"</span>"+
      "<button type=\"button\" class=\"fh-cd-arcana"+(awakeningOwed()?" is-owed":"")+(arcanaDrawn()?"":" is-empty")+"\" data-arcana-draw"+
      " title=\""+(awakeningOwed()?"An Arcane Awakening is owed — draw your card":arcanaDrawn()?esc(arcana.power||"Your Major Arcana")+" — click to draw a new card":"No Major Arcana yet — click to draw one")+"\">"+
      esc(arcana.name||"Draw an Arcana")+(awakeningOwed()?" ✦":"")+"</button>"+
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
      if(entry.exhaustion)parts.push({k:"Exhaustion "+entry.exhaustion,v:"−"+entry.exhaustion});
      if(entry.custom)parts.push({k:"Mod",v:signed(entry.custom)});
      if(entry.destiny)parts.push({k:"Destiny d"+entry.destiny.sides+(entry.destiny.forced?" · MANUAL":""),v:String(entry.destiny.result)});
    }else if(entry.kind==="tray"){
      (entry.dice||[]).forEach(function(die){parts.push({k:"d"+die.sides,v:String(die.result)});});
      if(entry.flatBonus)parts.push({k:"Overreach",v:signed(entry.flatBonus)});
    }else if(entry.destiny){
      parts.push({k:"Destiny d"+entry.destiny.sides,v:String(entry.destiny.result)});
    }
    return parts;
  }
  /* Badges that report how the roll GAVE, not how it was set up: these are the
     ones a still-rolling line has to keep quiet about. "MANUAL" and "adjusted"
     say something about the roll's construction and give nothing away. */
  var SPOILER_BADGE_KINDS={n20:true,chaos:true,destiny:true};
  function rollBadges(entry){
    var badges=[];
    if(entry.natural===20)badges.push({t:"NATURAL 20",k:"n20"});
    if(entry.natural===1&&entry.natChoice==="accept")badges.push({t:"NATURAL 1 accepted",k:"chaos"});
    if(entry.natChoice==="chaos")badges.push({t:"Fate refused",k:"chaos"});
    if(entry.chaosRoll)badges.push({t:"Chaos 2d6 = "+(entry.chaosRoll[0]+entry.chaosRoll[1]),k:"chaos"});
    // The row the dice landed on, quoted rather than linked — the stream is what
    // the player scrolls back through after the session.
    if(entry.chaosRow)badges.push({t:entry.chaosRow,k:"chaos"});
    if(entry.exhaustion)badges.push({t:"Exhaustion "+entry.exhaustion+" · −"+entry.exhaustion,k:"manual"});
    if(entry.destiny){
      var spent=entry.destiny,change=Number(spent.pointsAfter)-Number(spent.pointsBefore);
      var head=spent.criticalSuccess?"Arcane Critical Success":spent.criticalFailure?"Arcane Critical Failure":"Destiny d"+spent.sides+"="+spent.result;
      badges.push({t:head+(isFinite(change)&&change?" · "+(change>0?"+":"")+change+" pt → "+spent.pointsAfter:""),k:"destiny"});
      if(spent.arcaneChoice==="chaos")badges.push({t:"Arcane fate refused · 1 → "+spent.sides,k:"chaos"});
      if(spent.chaos)badges.push({t:"Overreach "+spent.chaos.overreach+" · save DC "+spent.chaos.dc,k:"chaos"});
    }
    if(entry.destinyPointChange)badges.push({t:entry.destinyPointChange.reason+" · Destiny "+entry.destinyPointChange.after,k:"destiny"});
    if(entry.awakening)badges.push({t:"ARCANE AWAKENING",k:"n20"});
    if(!!entry.d20Forced||!!(entry.destiny&&entry.destiny.forced)||entryBonusDice(entry).some(function(die){return die.forced;})||(entry.dice||[]).some(function(die){return die.forced;}))badges.push({t:"MANUAL",k:"manual"});
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

  /* ── The shared campaign feed ─────────────────────────────────────
     Private assembly, public result: the moment a roll settles it is posted to
     a campaign-wide log every Companion polls, so the table sees the outcome
     without watching anyone build it.

     WHEN a roll has settled is the whole difficulty, and addHistory is not the
     answer even though every roll passes through it. finishRolledEntry calls
     addHistory and then RETURNS on a natural 1, leaving the player to accept or
     defy — broadcasting there would show the table a critical failure that then
     silently becomes a 20. And an adjusted roll never reaches addHistory at
     all: completeHistoryAdjustment mutates the entry in place.

     openRollState is where every path converges. But an open roll can still
     accrete staged dice, so the same entry legitimately settles more than once
     — hence revisions. The post carries rollId + rev, and a signature of what
     the table can actually see decides whether anything changed, so calling
     broadcastEntry on an unchanged entry costs nothing. */
  var FEED_POLL_FAST=3000,FEED_POLL_IDLE=12000,FEED_IDLE_AFTER=120000,FEED_MAX=60,FEED_LOOKBACK=5000;
  // The table server (plan §12): the DM's own machine, found through a
  // one-key rendezvous record on the Worker, reached over WebSocket — a Quick
  // Tunnel measurably does not stream SSE, so WS is the production path, not
  // a fallback (plan §12.11). Everything below this line is additive; the
  // cloud poll above is untouched and remains the RECENT-state reader.
  var TABLE_RENDEZVOUS_INTERVAL=60000,TABLE_WS_RETRY_MAX=30000;
  function feedActive(){return !!(state.code&&state.pseudo);}
  function feedPad(ms){var text=String(ms);while(text.length<13)text="0"+text;return text;}
  function setFeedStatus(next){if(state.feed.status===next)return;state.feed.status=next;renderFeedZone();}
  /* The display layer says "Natural 20"; a machine needs "critical-success".
     Anything genuinely undecided stays null rather than guessing a verdict —
     a nat 20 with no DC is a great roll, not a stated success. */
  function intentOutcome(entry){
    if(entry.destiny&&entry.destiny.criticalFailure)return "critical-failure";
    if(entry.destiny&&entry.destiny.criticalSuccess)return "critical-success";
    if(entry.natChoice==="chaos"||entry.natural===20)return "critical-success";
    if(entry.natural===1)return entry.natChoice==="accept"?"critical-failure":null;
    if(entry.dc!==""&&entry.dc!=null&&isFinite(Number(entry.dc)))return entry.total>=Number(entry.dc)?"success":"failure";
    return null;
  }
  function intentFor(entry){
    if(entry.kind!=="d20")return null;
    return {kind:"check",check:entry.name||null,ability:entry.ability||null,
      total:Number(entry.total)||0,natural:entry.natural==null?null:entry.natural,
      dc:entry.dc===""||entry.dc==null?null:Number(entry.dc),outcome:intentOutcome(entry)};
  }
  function feedSignature(entry){
    return [entry.total,entry.outcome||"",entry.natural==null?"":entry.natural,
      entry.dc===""||entry.dc==null?"":entry.dc,entry.adjusted?1:0,entry.natChoice||"",
      entryBonusDice(entry).length,entry.destiny?entry.destiny.result:""].join("|");
  }
  // The table server serves the same POST shape as the Worker (its whole
  // point, per plan §12.10), so this is api()'s pattern pointed at a
  // different base rather than a new protocol.
  function tablePost(body){
    return fetch(state.feed.tableUrl+"/feed/"+encodeURIComponent(state.code),
      {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
      .then(function(response){
        return response.json().catch(function(){return {};}).then(function(data){
          if(!response.ok){var error=new Error(data.error||("HTTP "+response.status));error.status=response.status;throw error;}
          return data;
        });
      });
  }
  /* One writer at a time (plan §12.5 rule 2): LIVE posts to the table, RECENT
     posts to the cloud, OFF posts nowhere — a roll the table did not see must
     look like a roll the table did not see, never quietly land somewhere the
     player did not expect. */
  function broadcastEntry(entry){
    if(!entry||!feedActive()||rollTransactionActive())return;
    var signature=feedSignature(entry),known=state.feed.sent[entry.id];
    if(known&&known.signature===signature)return;
    if(state.feed.tableState==="off"){setFeedStatus("offline");return;}
    var rev=known?known.rev+1:0;
    state.feed.sent[entry.id]={signature:signature,rev:rev};
    var body={id:uuid(),type:"roll",rollId:entry.id,rev:rev,
      actor:{pseudo:state.pseudo,character:state.character&&state.character.name||state.pseudo,
        ddbCharacterId:state.profile&&state.profile.characterId||null},
      display:rollExport(entry),intent:intentFor(entry)};
    var sent=state.feed.tableState==="live"?tablePost(body):post("/feed/"+encodeURIComponent(state.code),body);
    sent.then(function(){
      setFeedStatus("");
    }).catch(function(){
      // The roll happened locally either way; what failed is the table seeing
      // it. Say so — a player must never believe they were heard when they
      // were not.
      setFeedStatus("offline");
    });
  }
  function feedMerge(events){
    var changed=false;
    (events||[]).forEach(function(event){
      if(!event||!event.id||state.feed.seen[event.id])return;
      state.feed.seen[event.id]=1;
      // A revision replaces the line it revises instead of adding a second one.
      var key=event.rollId||event.id,at=-1;
      state.feed.events.forEach(function(item,index){if(at<0&&(item.rollId||item.id)===key)at=index;});
      if(at>=0){
        if(Number(event.rev||0)<Number(state.feed.events[at].rev||0))return;
        state.feed.events.splice(at,1);
      }
      state.feed.events.unshift(event);changed=true;
    });
    if(state.feed.events.length>FEED_MAX)state.feed.events=state.feed.events.slice(0,FEED_MAX);
    return changed;
  }
  /* Edge clocks disagree by a few milliseconds, so an event written by a
     lagging edge can sort behind a cursor we have already passed. Rewinding
     the cursor by the server's own lookback window re-reads a few seconds on
     every poll; seen ids make that free. */
  function feedRewind(cursor,lookbackMs){
    var ms=Number(String(cursor).split("-")[0]);
    if(!isFinite(ms))return cursor;
    return feedPad(Math.max(0,ms-(Number(lookbackMs)||FEED_LOOKBACK)))+"-0000";
  }
  function pollFeed(){
    if(!feedActive())return;
    var since=state.feed.cursor;
    api("/feed/"+encodeURIComponent(state.code)+(since?"?since="+encodeURIComponent(since):"")).then(function(data){
      var events=data.events||[];
      if(data.cursor)state.feed.cursor=feedRewind(data.cursor,data.lookbackMs);
      if(events.length)state.feed.lastEventAt=Date.now();
      var changed=feedMerge(events);
      if(state.feed.status==="offline"){state.feed.status="";changed=true;}
      if(changed)renderFeedZone();
    }).catch(function(){setFeedStatus("offline");});
  }
  function feedStopTimer(){if(state.feed.timer){clearTimeout(state.feed.timer);state.feed.timer=null;}}
  /* KV reads are the one metered resource here, so a hidden tab and a quiet
     table both poll slowly — but neither ever stops. Suppressing the poll
     outright looked cheaper and was wrong: Table mode runs the dock in a
     picture-in-picture window, and this reads the MAIN document, which is
     hidden precisely then. The feed would have gone silent exactly when a
     player was using it at the table. Slower, never off. */
  function feedTick(){
    feedStopTimer();
    if(!feedActive())return;
    // The cloud poll is the RECENT-state reader only. LIVE and OFF do not
    // read it — a table that exists but is unreachable must show OFF, not a
    // quiet slide onto the ~30s-stale backstop (plan §12.5 rule 1). This timer
    // chain keeps running regardless, cheaply, so a later demotion back to
    // RECENT (from checkRendezvous) resumes polling without restarting it.
    if(state.feed.tableState==="recent")pollFeed();
    var hidden=typeof document!=="undefined"&&document.hidden;
    var quiet=Date.now()-(state.feed.lastEventAt||0)>FEED_IDLE_AFTER;
    state.feed.timer=window.setTimeout(feedTick,hidden||quiet?FEED_POLL_IDLE:FEED_POLL_FAST);
  }
  function setTableState(next){
    if(state.feed.tableState===next)return;
    state.feed.tableState=next;
    renderFeedZone();
  }
  function tableWsUrl(httpUrl,code,since){
    var base=String(httpUrl||"").replace(/^https:/,"wss:").replace(/^http:/,"ws:").replace(/\/+$/,"");
    return base+"/feed/"+encodeURIComponent(code)+"/ws"+(since?"?since="+encodeURIComponent(since):"");
  }
  function manualTableKey(code){return "fh-table-url-"+code;}
  function disconnectTableWs(){
    if(state.feed.wsRetryTimer){clearTimeout(state.feed.wsRetryTimer);state.feed.wsRetryTimer=null;}
    if(state.feed.ws){
      var ws=state.feed.ws;state.feed.ws=null;
      try{ws.onopen=ws.onmessage=ws.onclose=ws.onerror=null;ws.close();}catch(e){}
    }
  }
  function scheduleTableRetry(){
    if(!state.feed.tableUrl||!feedActive())return;
    if(state.feed.wsRetryTimer)return;
    var n=state.feed.wsRetry||0;
    state.feed.wsRetry=Math.min(n+1,6);
    var delay=Math.min(1000*Math.pow(2,n),TABLE_WS_RETRY_MAX);
    state.feed.wsRetryTimer=window.setTimeout(function(){
      state.feed.wsRetryTimer=null;
      connectTableWs();
    },delay);
  }
  /* Resume is an explicit ?since= here — WebSocket has no Last-Event-ID, which
     is the real cost the plan's SSE-to-WS fallback paid (§12.11). Replay may
     overlap what this dock already holds; feedMerge's dedupe-by-id (unchanged
     from plan §11) is what makes that safe. */
  function connectTableWs(){
    if(!state.feed.tableUrl||!feedActive())return;
    if(state.feed.ws)return;
    var url=tableWsUrl(state.feed.tableUrl,state.code,state.feed.wsCursor);
    var ws;
    try{ws=new WebSocket(url);}catch(e){scheduleTableRetry();return;}
    state.feed.ws=ws;
    ws.onopen=function(){
      state.feed.wsRetry=0;
      setTableState("live");
    };
    ws.onmessage=function(evt){
      var data;
      try{data=JSON.parse(evt.data);}catch(e){return;}
      if(!data||!data.event)return;
      if(data.seq&&String(data.seq)>state.feed.wsCursor)state.feed.wsCursor=String(data.seq);
      state.feed.lastEventAt=Date.now();
      if(state.feed.status==="offline")state.feed.status="";
      if(feedMerge([data.event]))renderFeedZone();
    };
    ws.onclose=function(){
      if(state.feed.ws!==ws)return; // a newer socket already replaced this one
      state.feed.ws=null;
      // A live table whose socket dropped is OFF, never a silent slide back
      // to RECENT (plan §12.5 rule 1) — only an explicit live:false from
      // checkRendezvous does that.
      if(state.feed.tableUrl)setTableState("off");
      scheduleTableRetry();
    };
    ws.onerror=function(){ /* onclose always follows on a WebSocket; the state
      transition lives there so it happens exactly once per drop. */ };
  }
  /* The one-key rendezvous (plan §12.4): "is a table live, and where." A
     manual URL (the DM reading it out loud as the escape hatch of last
     resort) skips this network round trip entirely. Promotion (RECENT→a
     table appearing) and demotion (a table disappearing) both happen only
     here — never from a WebSocket drop, which is what keeps rule 1 honest. */
  function checkRendezvous(){
    if(!feedActive())return;
    if(state.feed.manualUrl){
      if(state.feed.tableUrl!==state.feed.manualUrl){
        disconnectTableWs();state.feed.tableUrl=state.feed.manualUrl;state.feed.wsRetry=0;connectTableWs();
      }else if(!state.feed.ws&&!state.feed.wsRetryTimer){
        connectTableWs();
      }
      return;
    }
    api("/table/"+encodeURIComponent(state.code)).then(function(data){
      if(data&&data.live&&data.url){
        if(state.feed.tableUrl!==data.url){
          disconnectTableWs();state.feed.tableUrl=data.url;state.feed.wsRetry=0;connectTableWs();
        }else if(!state.feed.ws&&!state.feed.wsRetryTimer&&state.feed.tableState!=="live"){
          connectTableWs();
        }
      }else if(state.feed.tableUrl){
        disconnectTableWs();state.feed.tableUrl="";setTableState("recent");
      }
    }).catch(function(){
      // The rendezvous check itself failing changes nothing: a dock already
      // connected to a live table keeps trusting it rather than demoting on
      // a Worker hiccup that has nothing to do with the table server.
    });
  }
  function rendezvousTick(){
    checkRendezvous();
    state.feed.rendezvousTimer=window.setTimeout(rendezvousTick,TABLE_RENDEZVOUS_INTERVAL);
  }
  function startFeed(){
    feedStopTimer();
    disconnectTableWs();
    if(state.feed.rendezvousTimer){clearTimeout(state.feed.rendezvousTimer);state.feed.rendezvousTimer=null;}
    state.feed.events=[];state.feed.seen={};state.feed.sent={};state.feed.cursor="";state.feed.wsCursor="";
    state.feed.tableUrl="";state.feed.tableState="recent";state.feed.wsRetry=0;
    try{state.feed.manualUrl=localStorage.getItem(manualTableKey(state.code))||"";}catch(e){state.feed.manualUrl="";}
    // Treat a fresh load as active so the first two minutes poll quickly: a
    // player who just opened the dock is the likeliest to be mid-scene.
    state.feed.status="";state.feed.lastEventAt=Date.now();
    if(feedActive()){feedTick();rendezvousTick();}
  }
  function stopFeed(){
    feedStopTimer();
    disconnectTableWs();
    if(state.feed.rendezvousTimer){clearTimeout(state.feed.rendezvousTimer);state.feed.rendezvousTimer=null;}
    state.feed.events=[];state.feed.seen={};state.feed.sent={};state.feed.cursor="";state.feed.wsCursor="";
    state.feed.tableUrl="";state.feed.tableState="recent";state.feed.status="";
  }
  function feedTone(display){
    var outcome=String(display&&display.outcome||"");
    if(/critical success|natural 20/i.test(outcome))return "n20";
    if(/failure/i.test(outcome))return "bad";
    if(/^success/i.test(outcome))return "ok";
    return "";
  }
  /* Renders another player's roll from the fh-roll/1 `display` layer alone —
     the same shape this dock exports, so the table log and the personal stream
     read identically. */
  function renderFeedEntry(event){
    var display=event.display||{},tone=feedTone(display);
    var icon=tone==="ok"?"✓":tone==="bad"?"✗":tone==="n20"?"✦":"";
    var parts=(display.parts||[]).map(function(part){
      return "<span class=\"fh-cd-part\">"+esc(part.k)+" <b>"+esc(part.v)+"</b></span>";}).join("<span>·</span>");
    var badges=(display.badges||[]).map(function(badge){
      return "<span class=\"fh-cd-badge\">"+esc(badge)+"</span>";}).join("");
    var dc=display.dc!=null?"<span class=\"fh-cd-vs\">vs DC "+esc(display.dc)+"</span>":"";
    var mine=!!(event.actor&&event.actor.pseudo===state.pseudo);
    return "<li class=\"fh-cd-sentry fh-cd-fentry"+(mine?" is-mine":"")+"\"><button type=\"button\" disabled>"+
      "<span class=\"fh-cd-sl1\"><time>"+nowLabel(event.ts)+"</time>"+
      "<span class=\"fh-cd-who\">"+esc(event.actor&&event.actor.character||"—")+"</span>"+
      "<span class=\"fh-cd-title\">"+esc(display.title||"Roll")+"</span>"+
      "<span class=\"fh-cd-total is-"+tone+"\">"+esc(display.total)+"</span>"+
      "<span class=\"fh-cd-oic\">"+icon+"</span></span>"+
      "<span class=\"fh-cd-sl2\">"+parts+dc+badges+"</span></button></li>";
  }
  function renderStreamEntry(entry,index){
    var tone=outcomeTone(entry),icon=tone==="ok"?"✓":tone==="bad"?"✗":tone==="n20"?"✦":"";
    var who=state.character&&state.character.name||state.pseudo||"Character";
    /* The newest line is the roll still rolling in the tray just above, so it
       keeps the outcome to itself until the dice settle. What it still shows is
       everything the player already knew before rolling: the DC, and the
       badges that describe how the roll was set up rather than how it went.
       Older lines are history and always read plainly. */
    var quiet=index===0&&trayRevealPending();
    var parts=quiet?"":rollParts(entry).map(function(part){return "<span class=\"fh-cd-part\">"+esc(part.k)+" <b>"+esc(part.v)+"</b></span>";}).join("<span>·</span>");
    var dc=entry.dc!==""&&entry.dc!=null?"<span class=\"fh-cd-vs\">vs DC "+esc(entry.dc)+"</span>":"";
    var badges=rollBadges(entry).filter(function(badge){return !(quiet&&SPOILER_BADGE_KINDS[badge.k]);})
      .map(function(badge){return "<span class=\"fh-cd-badge is-"+badge.k+"\">"+esc(badge.t)+"</span>";}).join("");
    var reopen=entry.kind==="d20";
    return "<li class=\"fh-cd-sentry\"><button type=\"button\""+(reopen?" data-history-id=\""+esc(entry.id)+"\"":" disabled")+" data-roll='"+attrJson(rollExport(entry))+"'>"+
      "<span class=\"fh-cd-sl1\"><time>"+nowLabel(entry.createdAt)+"</time><span class=\"fh-cd-who\">"+esc(who)+"</span>"+
      "<span class=\"fh-cd-title\">"+esc(entry.name)+"</span><span class=\"fh-cd-total is-"+(quiet?"quiet":tone)+"\">"+(quiet?"…":entry.total)+"</span><span class=\"fh-cd-oic\">"+(quiet?"":icon)+"</span></span>"+
      "<span class=\"fh-cd-sl2\">"+parts+dc+badges+"</span></button></li>";
  }
  /* One zone, two readings. The table log is NOT a belt tab: the belt is
     everything inside the character, and the party is not inside the character
     — and a feed you have to navigate to defeats the point, which is that the
     moment someone rolls, everyone sees it. Sharing the stream's zone costs no
     vertical space, which the dock does not have to spare. */
  /* Three named states, three captions (plan §12.5) — never a binary
     on/off. A post that failed folds into OFF's caption regardless of which
     source it failed against: if nothing this dock sends is reaching
     anywhere, "not reaching the table" is the true statement either way. */
  function streamZoneInner(){
    var table=state.streamView==="table";
    var ts=state.feed.tableState,offline=ts==="off"||state.feed.status==="offline";
    var caption=table
      ? (offline?"not reaching the table"
        :ts==="live"?"every roll at the table, live"
        :"no live table — cloud log, about 30s behind")
      : "every roll, fully resolved";
    var tableClass=(table?"is-on":"")+(offline?" is-off":ts==="live"?" is-live":"");
    // The manual override (plan §12.4's escape hatch): only offered when
    // there is a reason to reach for it — a table is not already live.
    var manual=table&&ts!=="live"
      ? "<button type=\"button\" class=\"fh-cd-tableurl\" data-table-url-set title=\"Paste the DM's table URL\">"+(state.feed.manualUrl?"URL set":"URL…")+"</button>"
      : "";
    var cap="<div class=\"fh-cd-cap\">"+(table?"TABLE":"STREAM")+"<small>"+esc(caption)+"</small>"+manual+
      "<span class=\"fh-cd-streamtabs\">"+
      "<button type=\"button\" data-stream-view=\"mine\" class=\""+(table?"":"is-on")+"\">Mine</button>"+
      "<button type=\"button\" data-stream-view=\"table\" class=\""+tableClass+"\">Table</button></span></div>";
    var list;
    if(table){
      list=state.feed.events.length?state.feed.events.map(renderFeedEntry).join("")
        :"<p>"+(!feedActive()?"Load a character to join the campaign feed.":offline?"Not reaching the table.":"Nothing from the table yet.")+"</p>";
    }else{
      var rolls=state.history.slice(0,MAX_HISTORY);
      list=rolls.length?rolls.map(renderStreamEntry).join(""):"<p>No rolls yet.</p>";
    }
    return cap+"<ul class=\"fh-cd-streamlist\">"+list+"</ul>";
  }
  /* Polling must never call render(): a full re-render every three seconds
     would tear the console out from under a player who is mid-configuration.
     Only this one zone is repainted, and only when its markup actually moved. */
  function renderFeedZone(){
    if(!root)return;
    var zone=root.querySelector("[data-zone=\"stream\"]");
    if(!zone)return;
    var next=streamZoneInner();
    if(zone.innerHTML!==next)zone.innerHTML=next;
  }
  function renderStream(){
    return "<section class=\"fh-cd-zone fh-cd-stream\" data-zone=\"stream\">"+streamZoneInner()+"</section>";
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
    /* Head: a loaded check names itself. A free roll gets a plain, borderless
       field to name itself: no "FREE ROLL" label repeating what the empty
       console already says, no box competing with the boxed controls that
       actually need one. */
    var head=cfg
      ? "<div class=\"fh-cd-crow fh-cd-chead\"><span class=\"fh-cd-cname\">"+esc(cfg.name)+" <b>"+signed(cfg.baseBonus)+"</b></span>"+
        "<span class=\"fh-cd-cmeta\">"+esc(cfg.note||cfg.ability||"")+"</span>"+
        "<button class=\"fh-cd-cclose\" id=\"fhPsCloseConsole\" type=\"button\" aria-label=\"Close the roll console\">"+iconSvg("close")+"</button></div>"
      : "<div class=\"fh-cd-crow fh-cd-chead\">"+
        "<input id=\"fhPsTrayLabel\" class=\"fh-cd-freelabel\" maxlength=\"48\" value=\""+esc(state.trayLabel)+"\" placeholder=\"Damage / free roll…\" aria-label=\"Roll label\"></div>";
    /* Row 1 is what a check is rolled WITH: its mode, the fixed +2, and the
       white dice. MOD and DC are set once and then just sit there taking room,
       so they move behind the ⋮ -- which is also where the standing damage
       rules will land once that design is settled. */
    var row1="";
    if(cfg){
      row1="<div class=\"fh-cd-crow fh-cd-consolerow\"><span class=\"fh-cd-seg\">"+
        "<button type=\"button\" class=\"is-disadvantage"+(cfg.d20Mode==="disadvantage"?" is-on":"")+"\" data-die-mode=\"disadvantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Disadvantage\">D</button>"+
        "<button type=\"button\" class=\""+(cfg.d20Mode==="flat"?"is-on":"")+"\" data-die-mode=\"flat\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Flat roll\">—</button>"+
        "<button type=\"button\" class=\"is-advantage"+(cfg.d20Mode==="advantage"?" is-on":"")+"\" data-die-mode=\"advantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" aria-label=\"Advantage\">A</button></span>"+
        "<button type=\"button\" id=\"fhPsPlusTwo\" class=\"fh-cd-chip"+(cfg.plusTwo?" is-on":"")+"\" title=\"Fixed Fate's Hand +2\">FH +2</button>"+
        renderWhiteDice(cfg)+"</div>";
    }else{
      row1="<div class=\"fh-cd-crow fh-cd-consolerow is-free\">"+renderWhiteDice(null)+"</div>";
    }
    // The FINE TUNE drawer is gone: a Portent belongs to one die, so it lives in
    // that die's own right-click menu rather than in a console-wide panel.
    return "<section class=\"fh-cd-zone fh-cd-console\" data-zone=\"console\"><div class=\"fh-cd-cap\">ROLL CONSOLE</div>"+
      head+row1+"</section>";
  }
  /* The console's ⋮: what a roll is tuned WITH rather than rolled with. MOD and
     the DC live here -- both are set once and would otherwise sit in the row
     taking space from the dice. The standing damage rules (minimums on damage
     dice) are meant to join them, once Eric settles whether they belong here or
     with the badges, which is why this is a list and not two controls. */
  function renderConsoleMenu(cfg){
    var open=!!state.consoleMenu;
    if(!open)return "<span class=\"fh-cd-cmenuwrap\"><button type=\"button\" class=\"fh-cd-dmenu\" data-console-menu aria-haspopup=\"true\" aria-expanded=\"false\" aria-label=\"Roll options\">"+glyph("dots")+"</button></span>";
    var rows=cfg
      ? "<div class=\"fh-cd-cmenurow\"><span>MOD</span>"+
        "<input id=\"fhPsCustom\" type=\"number\" value=\""+(Number(cfg.custom)||0)+"\" aria-label=\"Manual modifier\"></div>"+
        "<div class=\"fh-cd-cmenurow\"><span>DC</span>"+
        "<input id=\"fhPsDc\" type=\"number\" min=\"0\" value=\""+esc(cfg.dc)+"\" placeholder=\"—\" aria-label=\"Difficulty Class\"></div>"
      : "<div class=\"fh-cd-cmenunote\">Load a check to set a modifier or a DC.</div>";
    return "<span class=\"fh-cd-cmenuwrap\"><button type=\"button\" class=\"fh-cd-dmenu is-active\" data-console-menu aria-haspopup=\"true\" aria-expanded=\"true\" aria-label=\"Roll options\">"+glyph("dots")+"</button>"+
      "<div class=\"fh-cd-cmenu\">"+rows+"</div></span>";
  }
  /* The one place dice come from. A blank die per size: left click adds one to
     the tray, right click takes one back. Once in the tray, a right click on the
     die itself gives it a colour, a seal and its own advantage. */
  /* The ⋮ leads this row exactly as it leads the Destiny pool, so both dice
     groups share one shape -- [⋮][dice…] -- and can therefore share one column
     and line up die-for-die, without either row needing a magic offset that
     would drift the moment the Arcana's name changed width. */
  function renderWhiteDice(cfg){
    var checkLoaded=!!cfg,counts=trayDieCounts(),calling=callingNow();
    var full=checkLoaded&&trayBonusCount()>=MAX_BONUS_DICE;
    return "<div class=\"fh-cd-whiterow\">"+renderConsoleMenu(cfg)+ROLL_DIE_SIZES.map(function(sides){
      var count=counts[sides]||0;
      var disabled=!!state.pendingArmed||(checkLoaded&&(sides===20||sides===100))||(full&&!count)||(!checkLoaded&&state.traySelection.length>=MAX_FREE_DICE&&!count);
      return "<button type=\"button\" class=\"fh-cd-wdie"+(calling&&!disabled?" is-calling":"")+"\" data-add-tray-die=\""+sides+"\""+(disabled?" disabled":"")+
        " title=\"Left click adds a d"+sides+" · right click or long press takes one back\" aria-label=\"Add a d"+sides+"; right-click to remove one\">"+
        pickerFace(sides,PICKER_DIE_PX,"white","d"+(sides===100?"%":sides))+(count?"<span class=\"fh-cd-mult\">×"+count+"</span>":"")+"</button>";
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
    /* A staged Destiny die answers to a right click like any other die in the
       hand — that is the whole point of it no longer being a popup. */
    if(prompt.stagedId){var item=stagedList().find(function(die){return die.id===prompt.stagedId;});return item?Object.assign({scope:item.kind==="destiny"?"staged-destiny":"staged"},item):null;}
    if(prompt.poolId){
      var waiting=state.destinyStaged;
      if(!waiting||waiting.dieId!==prompt.poolId)return null;
      if(!state.destiny.dice.some(function(die){return die.id===waiting.dieId&&die.available;}))return null;
      return {scope:"pool-destiny",sides:waiting.sides,label:"Destiny d"+waiting.sides,advantageMode:waiting.advantageMode||"flat",forcedResult:waiting.forcedResult,colour:"",sourceIcon:""};
    }
    if(prompt.bonusId){var bonus=cfg&&(cfg.bonusDice||[]).find(function(die){return die.id===prompt.bonusId&&!die.locked;});return bonus?Object.assign({scope:"bonus"},bonus):null;}
    if(prompt.freeId){
      var free=state.traySelection.find(function(die){return die.id===prompt.freeId;});
      return free?Object.assign({scope:"free",label:"d"+free.sides,sourceIcon:""},free):null;
    }
    /* A die that has already fallen. Nothing about it can be re-rolled or
       re-sealed, but a Diviner may still replace what it reads. */
    if(prompt.landedKey){
      var landed=entryById(prompt.entryId),part=landedDiePart(landed,prompt.landedKey);
      if(!part)return null;
      return {scope:"landed",entryId:landed.id,landedKey:prompt.landedKey,sides:part.sides,label:part.label,
        colour:part.colour||"",forcedResult:part.forced?part.result:null,advantageMode:"flat",sourceIcon:part.sourceIcon||""};
    }
    return null;
  }
  /* The three kinds of die a resolved entry owns, addressed by a stable key so
     the menu reaches the same die after any number of re-renders. */
  function landedDiePart(entry,key){
    if(!entry||!key)return null;
    if(key==="d20")return entry.kind==="d20"?{sides:20,label:"d20",result:entry.kept,forced:!!entry.d20Forced,colour:entry.d20Colour||""}:null;
    var bonus=String(key).match(/^bonus:(.+)$/);
    if(bonus){
      var die=entryBonusDice(entry).find(function(item){return item.id===bonus[1];});
      return die?{sides:die.sides,label:die.label,result:die.result,forced:!!die.forced,colour:die.colour||"",sourceIcon:die.sourceIcon||""}:null;
    }
    var free=String(key).match(/^free:(\d+)$/);
    if(free){
      var item=(entry.dice||[])[Number(free[1])];
      return item?{sides:item.sides,label:"d"+item.sides,result:item.result,forced:!!item.forced,colour:item.colour||""}:null;
    }
    return null;
  }
  /* Replacing a fallen die rewrites the entry in place, so the stream line it
     already owns is corrected rather than a second one appearing beneath it.
     The first Portent keeps what the dice actually said, so "— roll it" can
     hand the roll back to fate instead of being a dead option. */
  function retuneLandedDie(prompt,patch){
    var entry=entryById(prompt&&prompt.entryId),key=String(prompt&&prompt.landedKey||"");
    if(!entry)return;
    var setsResult=patch.forcedResult!==undefined;
    if(key==="d20"){
      if(entry.kind!=="d20")return;
      if(patch.colour!=null)entry.d20Colour=patch.colour;
      if(setsResult){
        if(!entry.d20Origin)entry.d20Origin={rolls:(entry.d20s||[]).slice(),kept:entry.kept,chosenIndex:entry.d20Choice,mode:entry.d20Mode||"flat",forced:!!entry.d20Forced};
        var value=forcedDieResult(patch.forcedResult,20),origin=entry.d20Origin;
        var rolls=value==null?origin.rolls.slice():[value],kept=value==null?origin.kept:value;
        entry.d20Roll={sides:20,mode:value==null?origin.mode:"flat",rolls:rolls,result:kept,chosenIndex:value==null?origin.chosenIndex:0,forced:value!=null||(value==null&&origin.forced)};
        entry.d20s=rolls;entry.d20Choice=entry.d20Roll.chosenIndex;entry.d20Mode=entry.d20Roll.mode;
        entry.d20Forced=!!entry.d20Roll.forced;entry.kept=kept;entry.natural=kept;
      }
    }else{
      var bonus=String(key).match(/^bonus:(.+)$/),free=String(key).match(/^free:(\d+)$/),die=null;
      if(bonus)die=(entry.bonusDice||[]).find(function(item){return item.id===bonus[1];});
      else if(free)die=(entry.dice||[])[Number(free[1])];
      if(!die)return;
      if(patch.colour!=null)die.colour=patch.colour;
      if(setsResult){
        if(!die.origin)die.origin={rolls:(die.rolls||[die.result]).slice(),result:die.result,chosenIndex:die.chosenIndex==null?0:die.chosenIndex,forced:!!die.forced};
        var forcedValue=forcedDieResult(patch.forcedResult,die.sides);
        if(forcedValue==null){die.rolls=die.origin.rolls.slice();die.result=die.origin.result;die.chosenIndex=die.origin.chosenIndex;die.forced=die.origin.forced;}
        else {die.rolls=[forcedValue];die.result=forcedValue;die.chosenIndex=0;die.forced=true;}
      }
      if(bonus)mirrorNamedBonusDice(entry);
    }
    if(setsResult){entry.adjusted=true;entry.adjustedAt=new Date().toISOString();recomputeEntry(entry);}
    refreshEntryTray(entry);persistPlayState();render();
  }
  function refreshTrayForState(){
    if(rollOpen()){var entry=openEntry();if(entry)refreshOpenTray(entry);return;}
    if(state.rollConfig)prepareTrayForConfig(state.rollConfig);else state.trayResults=[];
  }
  function mutateStagedDie(patch){
    var prompt=state.diePrompt,target=findStagedDie(prompt),cfg=state.rollConfig;
    if(!target)return;
    if(target.scope==="landed"){retuneLandedDie(prompt,patch);return;}
    if(target.scope==="pool-destiny"){Object.assign(state.destinyStaged,patch);persistPlayState();render();return;}
    if(target.scope==="base"){
      if(patch.advantageMode!=null)cfg.d20Mode=patch.advantageMode;
      if(patch.forcedResult!==undefined)cfg.d20ForcedResult=forcedDieResult(patch.forcedResult,20);
      if(patch.colour!=null)cfg.d20Colour=patch.colour;
    }
    else if(target.scope==="destiny"){
      if(patch.advantageMode!=null)cfg.destinyMode=patch.advantageMode;
      if(patch.forcedResult!==undefined)cfg.destinyForcedResult=forcedDieResult(patch.forcedResult,target.sides);
    }
    else if(target.scope==="staged"||target.scope==="staged-destiny"){var item=stagedList().find(function(die){return die.id===prompt.stagedId;});if(item)Object.assign(item,patch);}
    else if(target.scope==="bonus"){var bonus=(cfg.bonusDice||[]).find(function(die){return die.id===prompt.bonusId;});if(bonus)Object.assign(bonus,patch);}
    else if(target.scope==="free"){var freeDie=state.traySelection.find(function(die){return die.id===prompt.freeId;});if(freeDie)Object.assign(freeDie,patch);}
    refreshTrayForState();persistPlayState();render();
  }
  function dropStagedDie(){
    var prompt=state.diePrompt,target=findStagedDie(prompt);if(!target)return;
    // The base d20 is the roll itself — it cannot be taken out of its own tray.
    if(target.scope==="base"){state.message="The d20 is the roll — it cannot be removed.";state.messageKind="warn";renderMessage();return;}
    // A die that has already fallen belongs to a resolved roll: it can be
    // replaced, never withdrawn.
    if(target.scope==="landed"){state.message="A die that has fallen stays in its roll.";state.messageKind="warn";renderMessage();return;}
    if(target.scope==="pool-destiny"){state.destinyStaged=null;dropEventsTagged("staged-destiny");}
    else if(target.scope==="destiny"){var cfg=state.rollConfig;cfg.destinyDieId="";cfg.destinyConfirmed=false;cfg.destinyForcedResult=null;dropEventsTagged("staged-destiny");}
    else if(target.scope==="staged"||target.scope==="staged-destiny"){
      state.rollSequence.staged=stagedList().filter(function(die){return die.id!==prompt.stagedId;});
      if(target.scope==="staged-destiny")dropEventsTagged("staged-destiny");
    }
    else if(target.scope==="bonus"){var config=state.rollConfig;config.bonusDice=(config.bonusDice||[]).filter(function(die){return die.id!==prompt.bonusId;});syncPresetFlags(config);}
    else if(target.scope==="free")state.traySelection=state.traySelection.filter(function(die){return die.id!==prompt.freeId;});
    state.diePrompt=null;refreshTrayForState();persistPlayState();render();
  }
  /* A seal renames the die it is put on, every time. Reading the old label back
     was the bug: pick Bardic, then Bonus I, and the die stayed "Bardic". */
  function sealLabel(seal){
    if(seal==="guidance")return "Guidance";
    if(seal==="bardic")return "Bardic";
    var other=String(seal||"").match(/^other-([123])$/);
    return other?"Bonus "+["","I","II","III"][Number(other[1])]:"Bonus";
  }
  /* Sealing a die "Destiny" is not decoration: it takes a die out of the pool.
     Nothing is spent by the seal either — the pool die simply moves into the
     hand, and ROLL is still what spends it. */
  function sealStagedDie(seal){
    var target=findStagedDie(state.diePrompt);if(!target)return;
    if(seal!=="destiny"){mutateStagedDie({sourceIcon:seal,label:sealLabel(seal)});return;}
    var poolDie=state.destiny.dice.find(function(die){return die.available&&die.sides===target.sides;});
    if(!poolDie){state.message="No Destiny d"+target.sides+" is available in the pool.";state.messageKind="warn";renderMessage();return;}
    dropStagedDie();
    stageDestinyFromPool(poolDie.id);
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
    saveProfile({manualOverrides:manualOverrides}).then(function(){state.character=effectiveCharacter();pushEvent("Manual AC, skills and tools saved","corrected");render();}).catch(function(error){var box=root.querySelector("#fhPsCorrectionStatus");if(box)box.textContent="Could not save: "+error.message;});
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
  /* The header is identity and window chrome, and nothing else: portrait, name,
     the seal, the ... menu, the window modes. The satchel/loupe/anvil buttons
     that used to live here are gone -- Gear and Craft are belt tabs now, and
     navigation belongs to the belt. renderPops still draws those panels; only
     the way in moved. */
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
      "<div class=\"fh-cd-menurow\"><span>Text size</span>"+renderTextSizeControl()+"</div>"+
      "<div class=\"fh-cd-msep\"></div>"+
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
      "<button class=\"fh-cd-hbtn"+(state.menuOpen?" is-active":"")+"\" type=\"button\" data-menu-toggle title=\"More\" aria-label=\"More actions\">"+glyph("dots")+"</button>"+
      renderModeControl()+
      menu+"</div><p id=\"fhPsMessage\" class=\"fh-cd-msg\"></p>";
  }
  /* ── The belt ──────────────────────────────────────────────────────
     Six panels between the passives and the body. Skills is declared here
     because it predates the belt and still draws from this file; every other
     panel lives in its own docs/javascripts/fh-panel-*.js and pushes itself
     onto window.FH.panels. That is the point of the registry: a chat can own
     one panel without ever opening this file.

     A panel is:
       id           the belt tab, and the key for its own persisted store
       label/tint   what the belt shows, and its colour when lit
       order        belt position
       showsRoller  true -> core draws Destiny + Console + Tray underneath
       render(ctx)  returns the panel body's HTML
       onClick(event,ctx)  optional; return true when it handled the click
     ctx comes from panelContext() and is the only surface a panel may use. */
  var BUILT_IN_PANELS=[{
    id:"skills", label:"Skills", tint:"#9c6b16", order:10, showsRoller:true,
    render:function(ctx){return renderSkills(ctx.character);}
  }];
  function allPanels(){
    var extra=[];
    try{if(window.FH&&Array.isArray(window.FH.panels))extra=window.FH.panels;}catch(error){}
    return BUILT_IN_PANELS.concat(extra).sort(function(a,b){return (a.order||99)-(b.order||99);});
  }
  function activePanel(){
    var panels=allPanels();
    for(var i=0;i<panels.length;i++)if(panels[i].id===state.panel)return panels[i];
    return panels[0]||null;
  }
  /* A panel's own corner of the persisted play state, so Notes can keep its
     text and Features its tracker without either touching core's schema. */
  function panelStore(id){
    if(!state.panelData||typeof state.panelData!=="object")state.panelData={};
    if(!state.panelData[id]||typeof state.panelData[id]!=="object")state.panelData[id]={};
    return state.panelData[id];
  }
  function panelContext(){
    return {
      character:state.character, destiny:state.destiny, profile:state.profile,
      esc:esc, icon:iconSvg, signed:signed, mod:mod,
      roll:function(name,ability,bonus,note){quickRoll(name,ability,bonus,note);},
      openConsole:function(name,ability,bonus,note,dc){openConfig(name,ability,bonus,note,dc);},
      note:function(text,kind){pushEvent(text,kind||"note");renderMessage();refreshEventPanel();},
      store:panelStore,
      save:function(){persistPlayState();},
      refresh:function(){render();}
    };
  }
  /* A panel gets first refusal on events inside its own body, for every hook it
     declares. Core uses `click` and `change` itself, so those run the panel first
     and fall through when it returns falsy; `input` and `focusout` are panel-only,
     and exist so a panel can autosave while typing or on leaving a field instead
     of being forced to hang everything off a Save button. */
  function delegateToPanel(event,hook){
    if(!event.target||!event.target.closest||!event.target.closest("[data-panel-body]"))return false;
    var panel=activePanel();
    if(!panel||typeof panel[hook]!=="function")return false;
    try{return !!panel[hook](event,panelContext());}
    catch(error){
      state.message=(panel.label||panel.id)+" panel error: "+(error&&error.message||"unknown error");
      state.messageKind="danger";renderMessage();
      if(window.console&&console.error)console.error(error);
      return true;
    }
  }
  function setPanel(id){
    if(!id||id===state.panel)return;
    state.panel=id;state.menuOpen=false;
    try{localStorage.setItem("fh-cd-panel",id);}catch(error){}
    render();
  }
  function renderBelt(){
    var current=activePanel();
    return "<nav class=\"fh-cd-belt\" role=\"tablist\" aria-label=\"Companion sections\">"+allPanels().map(function(panel){
      var on=!!(current&&panel.id===current.id);
      return "<button class=\"fh-cd-belttab"+(on?" is-on":"")+"\" type=\"button\" role=\"tab\" data-panel=\""+esc(panel.id)+"\""+
        " style=\"--cd-tab:"+esc(panel.tint||"#9c6b16")+"\" aria-selected=\""+(on?"true":"false")+"\">"+esc(panel.label||panel.id)+"</button>";
    }).join("")+"</nav>";
  }
  /* display:contents on the wrapper -- it exists to scope a panel's clicks,
     not to become a flex item and steal the zones' own layout. */
  function renderPanelBody(){
    var panel=activePanel();
    if(!panel)return "";
    var body="";
    try{body=panel.render(panelContext())||"";}
    catch(error){
      body="<div class=\"fh-cd-zone\"><p class=\"fh-cd-msg is-danger\">The "+esc(panel.label||panel.id)+" panel failed to draw: "+esc(error&&error.message||"unknown error")+"</p></div>";
      if(window.console&&console.error)console.error(error);
    }
    return "<div class=\"fh-cd-panelbody\" data-panel-body=\""+esc(panel.id)+"\">"+body+"</div>";
  }
  function render() {
    if(!root)return;
    var floating=inPip();
    root.className="fh-cd-root"+(state.dockOpen?" is-open":"")+(floating?" is-floating":"");
    /* --cd-width is computed at :root from var(--cd-fs), so the override has to land
       on :root (the <html> element) too — setting it on the dock's own node only
       reaches the font-size rules that read --cd-fs directly at their own selector,
       leaving --cd-width locked to whatever it resolved to at :root (1). Use
       ownerDocument so this still lands on the right :root when Table mode has
       moved the node into the Picture-in-Picture window. */
    (root.ownerDocument||document).documentElement.style.setProperty("--cd-fs-pref",state.textSize);
    // While the dock floats, the page must not keep a gutter for it.
    try{if(document.body&&document.body.classList)document.body.classList.toggle("fh-cd-docked",!!state.dockOpen&&!floating);}catch(error){}
    var seal="<button class=\"fh-cd-seal-fab\" type=\"button\" data-dock-open aria-label=\"Open the Player Companion\">FH</button>";
    var inner;
    if(state.loading)inner=renderDockHeader(state.character)+"<div class=\"fh-cd-loading\">Loading the character sheet…</div>";
    else if(!state.record||!state.character)inner=renderDockHeader(null)+renderAccessZone()+"<div class=\"fh-cd-welcome\"><span>⚔</span><h1>Player Companion</h1><p>Enter your campaign code and pick a character. D&amp;D Beyond stays the source for the standard sheet; this dock runs the Fate's Hand layer.</p></div>";
    else{
      var ch=state.character;
      var panel=activePanel();
      /* A roll in flight keeps the roller on screen even on a panel that does
         not normally carry it -- otherwise switching tabs mid-transaction
         strands the dice where nobody can finish them. */
      var roller=!!(panel&&panel.showsRoller)||rollTransactionActive()||rollOpen();
      inner=renderDockHeader(ch)+(state.chromeOpen?renderAccessZone():"")+
        renderStats(ch)+renderBelt()+renderPanelBody()+
        (roller?renderDestiny(ch)+renderConsole()+renderStageZone():"")+
        renderStream()+renderPops(ch);
    }
    root.innerHTML=seal+"<div class=\"fh-cd-dock\">"+inner+"</div>";
    renderMessage();
    if(window.FHStaticDice&&window.FHStaticDice.mount)window.FHStaticDice.mount(root);
    /* Picker buttons (Destiny row, white-dice row) are cached static images,
       not live dice -- their generator canvas exists only long enough to
       fill that cache. releasePickerContext is a no-op once the cache is
       warm, so calling it every render costs nothing after the first. */
    if(window.FHStaticDice&&window.FHStaticDice.releasePickerContext)window.FHStaticDice.releasePickerContext();
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
  function loadParty(){var input=root.querySelector("#fhPsCode"),code=(input?input.value:state.code).trim().toUpperCase();state.code=code;state.party=[];state.record=null;state.character=null;state.pseudo="";state.inventory=null;state.loading=!!code;stopFeed();render();if(!code)return;try{localStorage.setItem("fh-my-campcode",code);}catch(e){}api("/party/"+encodeURIComponent(code)).then(function(data){state.party=(data.builds||[]).map(function(entry){return entry.pseudo;}).sort();var last=state.requestedPseudo||"";if(!last)try{last=localStorage.getItem("fh-my-pseudo")||"";}catch(e){}state.requestedPseudo="";state.loading=false;if(state.party.indexOf(last)>=0){state.pseudo=last;loadBuild();}else render();}).catch(function(error){state.requestedPseudo="";state.loading=false;state.message=error.message||"Could not reach the campaign server.";state.messageKind="danger";render();});}
  function loadBuild(){var who=state.pseudo;if(!state.code||!who)return;state.loading=true;render();try{localStorage.setItem("fh-my-pseudo",who);}catch(e){}Promise.all([api("/party/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)),api("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)).catch(function(){return {profile:emptyProfile()};})]).then(function(results){state.record=results[0];state.profile=results[1].profile||emptyProfile();state.character=effectiveCharacter();loadPlayState(state.character);state.loading=false;state.inventory=null;state.message="";rememberRoute();render();startFeed();}).catch(function(error){state.loading=false;state.record=null;state.character=null;stopFeed();state.message=error.message||"Could not load this character.";state.messageKind="danger";render();});}

  function showModal(html){var overlay=document.createElement("div");overlay.className="fh-mc-modal-wrap";overlay.innerHTML="<div class=\"fh-mc-modal\" role=\"dialog\" aria-modal=\"true\"><button class=\"fh-mc-modal-x\" type=\"button\" aria-label=\"Close\">×</button>"+html+"</div>";function close(){overlay.remove();}overlay.addEventListener("click",function(event){if(event.target===overlay||event.target.closest(".fh-mc-modal-x"))close();});document.body.appendChild(overlay);return {element:overlay,close:close};}
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
    if(button.dataset.pendingExhaustion!==undefined){setExhaustion(exhaustionLevel()+1,"Taken by hand");state.trayPrompt=null;render();return;}
    if(button.dataset.arcanaDraw!==undefined){drawArcana();return;}
    if(button.dataset.arcanaFlip!==undefined){flipArcana();return;}
    if(button.dataset.arcanaTake!==undefined||button.dataset.arcanaKeep!==undefined){
      var drawPrompt=state.trayPrompt;
      if(drawPrompt&&drawPrompt.card)keepArcana(drawPrompt.card,button.dataset.arcanaTake!==undefined);
      return;
    }
    if(button.dataset.pendingSave!==undefined){savePendingLabel(button.dataset.pendingSave);return;}
    if(button.dataset.pendingDrop!==undefined){dropPendingFate(button.dataset.pendingDrop);state.trayPrompt=null;persistPlayState();render();return;}
    // Switching Mine/Table repaints its own zone only — it must not disturb an
    // open roll, and it is legal in every phase because it changes nothing.
    if(button.dataset.streamView!==undefined){state.streamView=button.dataset.streamView==="table"?"table":"mine";renderFeedZone();return;}
    /* The escape hatch (plan §12.4): the DM reads the table URL out loud, a
       player pastes it here. Bypasses the rendezvous entirely — there is
       nothing to discover once a human has already said where it is. Blank
       clears the override and returns to normal rendezvous discovery. */
    if(button.dataset.tableUrlSet!==undefined){
      var current=state.feed.manualUrl||"";
      var next=window.prompt("Table server URL from the DM (blank to clear):",current);
      if(next===null)return;
      next=next.trim();
      try{
        if(next)localStorage.setItem(manualTableKey(state.code),next);
        else localStorage.removeItem(manualTableKey(state.code));
      }catch(e){}
      state.feed.manualUrl=next;
      disconnectTableWs();state.feed.tableUrl="";state.feed.wsRetry=0;
      setTableState("recent");checkRendezvous();
      return;
    }
    if(button.dataset.clearTray!==undefined){if(rollTransactionActive())warnRollLocked();else clearDiceTray(true);return;}
    if(button.dataset.addTrayDie!==undefined){if(rollOpen())stageBonusDie(button.dataset.addTrayDie);else if(rollTransactionActive())warnRollLocked();else addTrayDie(button.dataset.addTrayDie);return;}
    if(button.dataset.removeTrayDie!==undefined){if(rollTransactionActive())warnRollLocked();else removeTrayDie(button.dataset.removeTrayDie);return;}
    if(button.dataset.removeTraySize!==undefined){if(rollTransactionActive())warnRollLocked();else removeTrayDieSize(button.dataset.removeTraySize);return;}
    if(button.dataset.trayCancel!==undefined||button.dataset.trayClose!==undefined){state.trayPrompt=null;state.diePrompt=null;render();return;}
    if(button.dataset.trayAcceptFate!==undefined||button.dataset.trayRefuseFate!==undefined){var fatePrompt=state.trayPrompt,choice=button.dataset.trayAcceptFate!==undefined?"accept":"chaos";state.trayPrompt=null;if(fatePrompt)resolveNatOne(fatePrompt.entryId,choice);return;}
    if(button.dataset.arcaneFate!==undefined){var arcanePrompt=state.trayPrompt;if(arcanePrompt)resolveArcaneOne(arcanePrompt.entryId,button.dataset.arcaneFate);return;}
    /* Dock chrome never touches roll state, so it stays reachable mid-transaction. */
    if(button.dataset.dockOpen!==undefined){setDockOpen(true);return;}
    if(button.dataset.dockClose!==undefined){setDockOpen(false);return;}
    if(button.dataset.menuToggle!==undefined){state.menuOpen=!state.menuOpen;render();return;}
    if(button.dataset.openPop!==undefined){state.popOpen=button.dataset.openPop;state.activeContext=button.dataset.openPop;state.menuOpen=false;render();return;}
    if(button.dataset.closePop!==undefined){if(state.editDraft)state.editDraft=null;state.popOpen="";render();return;}
    if(button.dataset.chromeToggle!==undefined){state.chromeOpen=!state.chromeOpen;state.menuOpen=false;render();return;}
    if(button.dataset.cdMode!==undefined){setWindowMode(button.dataset.cdMode);return;}
    if(button.dataset.textSize!==undefined){setTextSize(button.dataset.textSize);return;}
    if(button.dataset.panel!==undefined){setPanel(button.dataset.panel);return;}
    if(button.dataset.hpOpen!==undefined){state.hpOpen=!state.hpOpen;render();return;}
    if(button.dataset.hpStep!==undefined){var hp=state.vitals||{};if(hp.max==null){state.message="Set a maximum first.";state.messageKind="warn";renderMessage();return;}setVitals({current:(hp.current==null?hp.max:hp.current)+Number(button.dataset.hpStep)});render();return;}
    if(button.dataset.hpFull!==undefined){setVitals({current:(state.vitals||{}).max});render();return;}
    if(button.dataset.scoreEdit!==undefined){state.scoreEditing=true;render();return;}
    /* A gold die is picked up exactly like a white one: the click stages it,
       ROLL spends it, and a right click on it in the tray puts it back. */
    if(button.dataset.destinyDie!==undefined){state.destinyPoolMenu=false;stageDestinyFromPool(button.dataset.destinyDie);return;}
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
    if(button.dataset.destinyPoolmenu!==undefined){state.destinyPoolMenu=!state.destinyPoolMenu;render();return;}
    // Opening the console's ⋮ syncs first: its own inputs are what render()
    // is about to rebuild, so an unsynced value would be thrown away.
    if(button.dataset.consoleMenu!==undefined){if(state.rollConfig)syncConsoleInputs();state.consoleMenu=!state.consoleMenu;render();return;}
    if(button.dataset.destinyPool){var pool=button.dataset.destinyPool.split(":");adjustDestinyDie(pool[0],pool[1]);return;}
    if(button.dataset.destinyStep){var parts=button.dataset.destinyStep.split(":"),field=parts[0],step=Number(parts[1]);updateDestinyField(field,Number(state.destiny[field])+step,"Manual correction");return;}
    if(button.dataset.exhStep!==undefined){setExhaustion(exhaustionLevel()+Number(button.dataset.exhStep),"Adjusted by hand");render();return;}
    /* A long rest always clears a level; a short rest may clear one MORE, but
       only once a day — once between two long rests, which is what resets it. */
    if(button.id==="fhPsShortRest"){
      if(!exhaustionLevel()){state.message="No Exhaustion to shake off.";state.messageKind="warn";renderMessage();return;}
      if((state.vitals||{}).shortRestUsed){state.message="A short rest only clears one extra level per day.";state.messageKind="warn";renderMessage();return;}
      setVitals({shortRestUsed:true});setExhaustion(exhaustionLevel()-1,"Short rest");render();return;
    }
    if(button.id==="fhPsLongRest"){
      var restMax=(state.vitals||{}).max;
      setVitals(restMax!=null?{current:restMax,shortRestUsed:false}:{shortRestUsed:false});
      setDestinyPoints(Math.min(state.destiny.score,state.destiny.points+1),"Long rest",true);
      if(exhaustionLevel())setExhaustion(exhaustionLevel()-1,"Long rest");
      render();return;
    }
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
    var tunable=event.target.closest("[data-die-staged],[data-die-bonus],[data-die-destiny],[data-die-pool],[data-die-free],[data-die-base],[data-die-landed]");
    return tunable?{kind:"die",node:tunable}:null;
  }
  function openDieMenu(node){
    var data=node.dataset;
    state.diePrompt=data.dieStaged!==undefined?{stagedId:data.dieStaged}
      :data.dieBonus!==undefined?{bonusId:data.dieBonus}
      :data.dieDestiny!==undefined?{destinyDieId:data.dieDestiny}
      :data.diePool!==undefined?{poolId:data.diePool}
      :data.dieLanded!==undefined?{landedKey:data.dieLanded,entryId:data.dieEntry}
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
  /* A panel owns the clicks inside its own body, and gets them BEFORE
     handleClick -- which bails on anything that is not a <button>, so a panel's
     clickable row or tracker pip would otherwise never reach it. Core still
     handles everything outside a panel body, and anything the panel declines. */
  function onClick(event){if(state.trayHeld){state.trayHeld=false;return;}if(delegateToPanel(event,"onClick"))return;try{handleClick(event);}catch(error){state.message="Roll Console error: "+(error&&error.message||"unknown error");state.messageKind="danger";pushEvent(state.message,"error");renderMessage();refreshEventPanel();if(window.console&&console.error)console.error(error);}}
  /* ── General rule: a click outside an open dropdown closes it ─────
     Applies to every small anchored popup (the header's ⋮, the Destiny pool
     menu, and whatever the same pattern grows next) -- not to the belt's
     full panels or a roll's decision prompts, which already carry their own
     explicit close/cancel and shouldn't vanish on a stray click. New popups
     of the same kind register themselves here rather than each wiring up
     their own outside-click listener. */
  var OUTSIDE_CLICK_POPUPS=[
    {isOpen:function(){return !!state.menuOpen;},close:function(){state.menuOpen=false;},box:".fh-cd-menu",toggle:"[data-menu-toggle]"},
    {isOpen:function(){return !!state.destinyPoolMenu;},close:function(){state.destinyPoolMenu=false;},box:".fh-cd-dpoolmenu",toggle:"[data-destiny-poolmenu]"},
    /* Closing this one commits first: it holds live MOD/DC inputs, and a
       value typed and then dismissed by clicking away must not be lost. */
    {isOpen:function(){return !!state.consoleMenu;},close:function(){if(state.rollConfig)syncConsoleInputs();state.consoleMenu=false;},box:".fh-cd-cmenu",toggle:"[data-console-menu]"}
  ];
  function onOutsideClick(event){
    if(!root)return;
    var changed=false;
    OUTSIDE_CLICK_POPUPS.forEach(function(popup){
      if(!popup.isOpen())return;
      var target=event.target;
      if(target&&target.closest&&(target.closest(popup.box)||target.closest(popup.toggle)))return;
      popup.close();changed=true;
    });
    if(changed)render();
  }
  function onChange(event){
    if(delegateToPanel(event,"onChange"))return;
    if(event.target.dataset.diePortent!==undefined){mutateStagedDie({forcedResult:event.target.value===""?null:Number(event.target.value)});return;}
    if(/^fhPs(Custom|Dc)$/.test(event.target.id)||event.target.dataset.bonusLabel!==undefined||event.target.dataset.bonusSides!==undefined||event.target.dataset.bonusForced!==undefined){syncConsoleInputs();prepareTrayForConfig(state.rollConfig);render();return;}if(event.target.id==="fhPsTrayLabel"){state.trayLabel=String(event.target.value||"Damage roll").slice(0,48);persistPlayState();return;}if(event.target.id==="fhPsWho"){state.editDraft=null;state.pseudo=event.target.value;if(state.pseudo)loadBuild();return;}if(event.target.id==="fhPsCode"){return;}if(event.target.dataset.hpField){setVitals(event.target.dataset.hpField==="max"?{max:event.target.value}:{current:event.target.value});render();return;}if(event.target.dataset.exhField!==undefined){setExhaustion(event.target.value,"Set by hand");render();return;}if(event.target.dataset.destinyField){if(event.target.dataset.destinyField==="score")state.scoreEditing=false;updateDestinyField(event.target.dataset.destinyField,event.target.value,"Manual correction");return;}if(event.target.id==="fhPsTarget"){state.target=event.target.value;render();return;}if(event.target.id==="fhPsCr"){state.cr=event.target.value||"0";render();return;}}
  function onKeydown(event){if(event.target.id==="fhPsCode"&&event.key==="Enter"){event.preventDefault();loadParty();return;}if(/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;var key=String(event.key||"").toLowerCase();if(key==="c"||key==="escape"){event.preventDefault();if(rollTransactionActive())warnRollLocked();else clearDiceTray(true);return;}if(!state.rollConfig||state.rollConfig.editingId)return;if(key==="a"||key==="d"||key==="f"){event.preventDefault();state.rollConfig.plusTwo=false;state.rollConfig.d20Mode=key==="a"?"advantage":key==="d"?"disadvantage":"flat";prepareTrayForConfig(state.rollConfig);render();return;}if(key===" "){event.preventDefault();var roll=root&&root.querySelector("[data-roll-now]");if(roll&&!roll.disabled)roll.click();}}

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
  function setTextSize(size){
    state.textSize=clamp(size,FS_MIN,FS_MAX)||FS_MIN;
    try{localStorage.setItem("fh-cd-textsize",String(state.textSize));}catch(error){}
    render();
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
    /* Bubble-phase on document, not root: it must also fire for a click on the
       Handbook page around the dock while the dock floats, and it runs after
       root's own click handling so a click that just opened a popup (via its
       toggle) is not immediately read as "outside" and closed again. */
    document.addEventListener("click",onOutsideClick);
    /* Panel-only hooks. focusout rather than blur, because blur does not bubble
       and a delegated listener would never see it. */
    root.addEventListener("input",function(event){delegateToPanel(event,"onInput");});
    root.addEventListener("focusout",function(event){delegateToPanel(event,"onBlur");});
    // Coming back to the tab should show the table as it is now, not as it was
    // when the tab was hidden and polling had backed off.
    document.addEventListener("visibilitychange",function(){if(!document.hidden&&feedActive())feedTick();});
    root.addEventListener("contextmenu",onTrayContext);
    root.addEventListener("touchstart",onTrayTouchStart,{passive:true});
    root.addEventListener("touchend",onTrayTouchEnd);root.addEventListener("touchcancel",onTrayTouchEnd);
    var linkedCampaign=routeValue("campaign"),linkedCharacter=routeValue("character");
    try{state.code=(linkedCampaign||localStorage.getItem("fh-my-campcode")||"").trim().toUpperCase();}catch(error){state.code=String(linkedCampaign||"").trim().toUpperCase();}
    state.requestedPseudo=linkedCharacter;
    var remembered=null;try{remembered=localStorage.getItem("fh-cd-open");}catch(error){}
    state.dockOpen=ownsPage||!!linkedCampaign||remembered==="1";
    var rememberedSize=null;try{rememberedSize=localStorage.getItem("fh-cd-textsize");}catch(error){}
    /* The scale was rebased from 1/1.15/1.3 to 1.15/1.3/1.45. Anything at or
       below the old baseline lands on the new floor rather than on a step that
       no longer exists, so a returning player never gets the size we removed. */
    if(rememberedSize)state.textSize=clamp(rememberedSize,FS_MIN,FS_MAX)||FS_MIN;
    /* Only honour a remembered tab that still exists -- a panel file that was
       removed must not leave the belt pointing at nothing. */
    var rememberedPanel=null;try{rememberedPanel=localStorage.getItem("fh-cd-panel");}catch(error){}
    if(rememberedPanel&&allPanels().some(function(panel){return panel.id===rememberedPanel;}))state.panel=rememberedPanel;
    render();
    if(state.dockOpen&&state.code)loadParty();
  });
})();
