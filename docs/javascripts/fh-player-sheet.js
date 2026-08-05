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
  var MAX_FREE_DICE = 50;
  var LIGHTWEIGHT_DICE_THRESHOLD = 6;
  /* The white picker row renders at this size. Kept in step with the
     .fh-cd-picker-die / .fh-cd-calling-die widths in companion-dock.css. */
  var PICKER_DIE_PX = 31;
  /* The Destiny dice live in the 44px band now (phase 1, dock-dice-tray):
     22px keeps five dice + the ledger + the arcana inside one 425px-wide
     strip. Kept in step with .fh-cd-band .fh-cd-picker-die. */
  var BAND_DIE_PX = 22;
  var MAX_HISTORY = 20;
  /* The Dice Tray holds ten rolls (Eric, 2026-08-03) — the first in large
     dice, three more in small ones, the rest as static snapshots. Beyond ten
     the record lives in the Stream, or on AboveVTT's own log. */
  var TRAY_MAX = 10;
  /* Die sizes per tray CROWD, not per band (grille ratifiée Eric, lot
     BACKLOG-B 2026-08-05): a skill hand of 1-5 keeps the wrapper and its
     label at 38px; 6-10 go naked on one row, 30 down to 20; 11-30 hold
     rows of exactly ten at 20px — 20 is the FLOOR, because the floor is
     the numeral: ~11px of digit at 20, ~8px (texture) at the old 16. */
  var TRAY_DIE_SKILL = 38;
  var TRAY_DIE_ROW = 20;
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
  /* Zoom (UI-DIMENSIONS.md): five manual steps, a 90% auto-fit floor, and the
     425x680 reference the steps scale from. Declared here because `var state`
     below reads ZOOM_DEFAULT when it is evaluated, and var hoists the name,
     not the value. */
  var ZOOM_STEPS=[80,90,100,125,150];
  var ZOOM_AUTO_FLOOR=90;
  var ZOOM_REF_W=425,ZOOM_REF_H=680;
  var ZOOM_BASE_FS=1.15; // --cd-fs at 100% zoom -- unchanged from the old default
  var ZOOM_DEFAULT=100;
  var state = {
    code:"", pseudo:"", requestedPseudo:"", party:[], record:null, profile:null, profileRevision:null, character:null,
    destiny:null, history:[], events:[], prefs:{bardicSides:6}, rollConfig:null, trayPrompt:null,
    traySelection:[20],trayResults:[],trayTitle:"Dice Tray",trayLabel:"Damage roll",trayResultText:"",queueDone:"",rollSequence:null,chromeOpen:false,
    activeContext:"loop", target:"Aberration", cr:"1", inventory:null,editDraft:null,
    loading:false, message:"", messageKind:"",
    dockOpen:false, menuOpen:false, popOpen:"", diceSignatures:{}, destinyPoolMenu:false, consoleMenu:false, trayCapMenu:false,
    // Stream is `optional`, off by default (UI-TERMINOLOGY.md zone 10) -- the
    // only zone the player toggles rather than one that opens on its own.
    streamOpen:false,
    trayQuietTitle:"", trayVerdict:"", trayRevealAt:0, trayRevealTimer:null,
    // A roll called back up by right-clicking its reading glass (display order only).
    traySurfaceId:"", traySurfaceAt:"",
    /* M3: the visible half of the climb — a one-shot line flash, a one-shot
       scroll-to-top, and the clicked die's persistent mark {lineId,di}. */
    traySurfaceFlash:false, trayScrollToTop:false, traySurfaceDie:null,
    vitals:{current:null,max:null}, hpOpen:false, scoreEditing:false, windowMode:"margin", pendingArmed:null,
    diePrompt:null, destinyStaged:null, callUntil:0, callTimer:null, zoom:ZOOM_DEFAULT, zoomAuto:true,
    panel:"skills", panelData:{},
    // The shared campaign feed. Live only — it is refetched on load, never
    // persisted, so none of this reaches localStorage or the profile.
    streamView:"mine",
    // tableState is one of three named states (plan §12.5): "recent" (no live
    // table, reading the cloud backstop — the default), "live" (the DM's table
    // server is up and this dock is on it), "off" (a table exists but this
    // dock cannot reach it — never silently treated as "recent").
    feed:{events:[],seen:{},sent:{},cursor:"",status:"",
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
  // Zoom (UI-DIMENSIONS.md): the browser/map/design-tool convention, replacing
  // the old 1.15/1.3/1.45 scale that meant nothing to a reader. 100% is the
  // 425x680 reference; Reset returns to auto-fit, never to a hard 100%.
  function renderZoomControl() {
    var active=state.zoom;
    return "<div class=\"fh-cd-seg fh-cd-zoomctl\" role=\"group\" aria-label=\"Companion zoom\">"+ZOOM_STEPS.map(function(step){
      var on=step===active;
      return "<button class=\"fh-cd-tsz-btn"+(on?" is-on":"")+"\" type=\"button\" data-zoom-set=\""+step+"\" title=\"Zoom "+step+"%\" aria-label=\"Zoom: "+step+"%\""+(on?" aria-pressed=\"true\"":"")+">"+step+"%</button>";
    }).join("")+
      "<button class=\"fh-cd-tsz-btn fh-cd-zoom-reset"+(state.zoomAuto?" is-on":"")+"\" type=\"button\" data-zoom-reset title=\"Reset to auto-fit\" aria-label=\"Reset zoom to auto-fit\""+(state.zoomAuto?" aria-pressed=\"true\"":"")+">Reset</button>"+
      "</div>";
  }
  // Largest step that fits the actual window, never below 90% on its own --
  // 80% is reachable only by hand (UI-DIMENSIONS.md: "chosen" vs "imposed").
  function autoFitZoom(){
    var w=(typeof window!=="undefined"&&window.innerWidth)||1024;
    var h=(typeof window!=="undefined"&&window.innerHeight)||768;
    var best=ZOOM_AUTO_FLOOR;
    ZOOM_STEPS.forEach(function(step){
      if(step<ZOOM_AUTO_FLOOR||step<=best)return;
      /* Rounded the same way UI-DIMENSIONS.md's own table is (425 * 1.25 =
         531.25, listed there as 531): comparing against the unrounded value
         made a window sized to exactly the documented step (531x850) fail
         its own fit check by a fraction of a pixel. */
      if(Math.round(ZOOM_REF_W*step/100)<=w&&Math.round(ZOOM_REF_H*step/100)<=h)best=step;
    });
    return best;
  }
  // Migrates an old fh-cd-textsize value (a raw --cd-fs like "1.3") to the
  // nearest of the five new steps -- compared in cd-fs space, since that is
  // the number the player actually saw represented by their old pick.
  function nearestZoomStep(pct){
    var best=ZOOM_STEPS[0],bestDiff=Infinity;
    ZOOM_STEPS.forEach(function(step){var diff=Math.abs(step-pct);if(diff<bestDiff){bestDiff=diff;best=step;}});
    return best;
  }
  function setZoom(pct){
    pct=Number(pct);
    if(ZOOM_STEPS.indexOf(pct)<0)return;
    state.zoom=pct;state.zoomAuto=false;
    try{localStorage.setItem("fh-cd-zoom",String(pct));localStorage.setItem("fh-cd-zoom-auto","0");}catch(error){}
    render();
  }
  function resetZoom(){
    state.zoomAuto=true;state.zoom=autoFitZoom();
    try{localStorage.setItem("fh-cd-zoom-auto","1");}catch(error){}
    render();
  }
  // ⌘+ / ⌘− step through the five manual stops in order, same as Reset does
  // for auto-fit: whichever step is closest to wherever zoom currently sits.
  function stepZoom(direction){
    var idx=ZOOM_STEPS.indexOf(state.zoom);
    if(idx<0){var bestDiff=Infinity;ZOOM_STEPS.forEach(function(step,i){var diff=Math.abs(step-state.zoom);if(diff<bestDiff){bestDiff=diff;idx=i;}});}
    idx=clamp(idx+direction,0,ZOOM_STEPS.length-1);
    setZoom(ZOOM_STEPS[idx]);
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
  function apiAt(base, path, options) {
    return fetch(base + path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || ("HTTP " + response.status));
          error.status = response.status;
          // §13.13.2: a 409 carries the record the server actually holds, so the
          // caller can offer "reload" without a second round trip.
          if (response.status === 409) {
            error.currentRevision = data.currentRevision;
            error.current = data.current;
          }
          throw error;
        }
        return data;
      });
    });
  }
  function api(path, options) {
    return apiAt(API, path, options);
  }
  function post(path, body) {
    return api(path, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  }
  function postAt(base, path, body) {
    return apiAt(base, path, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  }
  // /profile responses nest revision under profile.revision. POST /builds is
  // different: it returns the new revision at the top level (response.revision),
  // not nested under a build document — the build.revision check below only
  // matters for endpoints that echo back a nested build record.
  function revisionOf(data) {
    if (!data) return null;
    if (data.profile && data.profile.revision != null) return data.profile.revision;
    if (data.build && data.build.revision != null) return data.build.revision;
    return data.revision != null ? data.revision : null;
  }
  /* Every write to a profile record states the revision it was based on
     (plan §13.13.2). A 409 means the record changed elsewhere since load —
     never retried automatically, never silently overwritten (§13.13.4): the
     caller sees the rejection (error.silent marks it already surfaced here)
     and the player reloads before reapplying by hand (no auto-merge). */
  function showProfileConflict(error) {
    var modal = showModal(
      "<p class=\"fh-mc-modal-kicker\">CONFLIT</p><h3>Fiche modifiée ailleurs</h3>"+
      "<p>Cette fiche a été modifiée ailleurs depuis ton dernier chargement. Recharge-la avant de renvoyer tes changements.</p>"+
      "<button class=\"fh-mc-modal-save\" id=\"fhPsConflictReload\">Recharger</button>"
    );
    modal.element.querySelector("#fhPsConflictReload").onclick = function () {
      if (error.current) state.profile = error.current;
      state.profileRevision = error.currentRevision != null ? error.currentRevision : state.profileRevision;
      state.character = effectiveCharacter();
      loadPlayState(state.character);
      modal.close();
      state.message = "Fiche rechargée depuis le serveur. Réapplique tes changements.";
      state.messageKind = "warn";
      render();
    };
  }
  function profileWrite(suffix, body) {
    var payload = Object.assign({}, body, {revision: state.profileRevision});
    var base = state.feed.tableState === "live" ? state.feed.tableUrl : API;
    return postAt(base, "/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(state.pseudo)+suffix, payload)
      .then(function (data) {
        var revision = revisionOf(data);
        if (revision != null) state.profileRevision = revision;
        return data;
      })
      .catch(function (error) {
        if (error && error.status === 409) {
          showProfileConflict(error);
          error.silent = true;
        }
        throw error;
      });
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
    // A count of owed Arcana draws. Older saved profiles stored this as a
    // plain boolean — Number(true)===1 and Number(false)===0, so a saved
    // "true" upgrades cleanly into a single owed draw.
    return {score:score,points:Math.max(0,points),dice:dice,overreach:overreach,pending:pending,
      awakeningOwed:Math.max(0,Number(raw.awakeningOwed)||0),lastChange:raw.lastChange || null};
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
    state.trayResults=Array.isArray(pending.trayResults)?pending.trayResults:[];state.trayTitle=pending.trayTitle||"Dice Tray";state.trayResultText=pending.trayResultText||"";state.trayVerdict=pending.trayVerdict||"";state.pendingArmed=pending.pendingArmed||null;
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
    var pendingRoll={rollSequence:state.rollSequence,trayPrompt:safePrompt,queueDone:state.queueDone,trayResults:state.trayResults,trayTitle:state.trayTitle,trayResultText:state.trayResultText,trayVerdict:state.trayVerdict,pendingArmed:state.pendingArmed,destinyStaged:state.destinyStaged};
    var payload = {destiny:state.destiny,vitals:state.vitals,history:state.history.slice(0,MAX_HISTORY),events:state.events.slice(0,10),traySelection:state.traySelection,trayLabel:state.trayLabel,prefs:state.prefs,pendingRoll:pendingRoll,panelData:state.panelData};
    try { localStorage.setItem(storageKey(), JSON.stringify(payload)); } catch (error) {}
    clearTimeout(persistTimer);
    persistTimer = window.setTimeout(function () {
      saveProfile({destinyState:state.destiny,vitalsState:state.vitals,rollHistory:state.history.slice(0,MAX_HISTORY),rollEvents:state.events.slice(0,10),rollPrefs:state.prefs,pendingRoll:pendingRoll}).catch(function (error) {
        if (error && error.silent) return;
        state.message = "Saved on this device; server sync is unavailable."; state.messageKind = "warn"; renderMessage();
      });
    },450);
  }
  function saveProfile(patch) {
    return profileWrite("", patch).then(function (data) {
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
  // A die face is always an integer — a fractional or hostile value surviving
  // from stored state (a corrupted profile, a hand-edited localStorage entry)
  // must land on a real face, not ride into the total as a decimal.
  function forcedDieResult(value,sides){if(value==null||value==="")return null;return clamp(Math.round(Number(value)),1,Number(sides)||20);}
  /* ══ THE ROLL VOCABULARY ═══════════════════════════════════════════
     UI-ROLL-VOCABULARY.md, ratified 2026-08-02. The shared language of a roll:
     where a die came from, what happened to it, and how the whole thing reads
     as one line.

     Everything below is DECLARED ONCE and read by every surface. The Dice
     Tray, the Roll Builder, the Stream and every Console render the same
     objects; built surface by surface they would each invent their own way to
     draw a badge, and then there would be four truths about the same roll.
     Since the Dice Tray became the shared surface (2026-08-02) a divergence
     is no longer a private mistake — the whole table sees it. */

  /* ── §1 Source tokens ──────────────────────────────────────────────
     Every die carries its provenance. One token per source, here, once.

     THE GLYPH CARRIES THE IDENTITY; THE COLOUR ONLY REINFORCES IT. Never
     colour alone: at 12px blue and violet are not reliably distinguishable —
     not for a colour-blind player, not for anyone in a badly lit room on a
     Wednesday night. `tone` therefore never travels without `glyph`/`letter`.

     ∞ won Destiny partly because it is the only HORIZONTAL mark in the set: a
     star and a musical note are both "small spiky thing" at 12px, and ∞ is
     mistakable for neither. The shield won Tactical for the mirror reason —
     it is the only silhouette that NARROWS TOWARDS THE BOTTOM, so it survives
     being reduced to a smudge. Both sword candidates were rejected because
     glyphs are judged against their NEIGHBOURS: a single sword is a vertical
     stroke with a bar, which is the I · II · III numerals sitting beside it,
     and crossed swords are a radial spiky mass, which is the Guidance star on
     the other side. Both collisions are a few pixels apart in the same row. */
  var ROLL_SOURCES={
    destiny :{key:"destiny" ,label:"Destiny"  ,tone:"destiny" ,glyph:"destiny" },
    guidance:{key:"guidance",label:"Guidance" ,tone:"guidance",glyph:"guidance"},
    bardic  :{key:"bardic"  ,label:"Bardic"   ,tone:"bardic"  ,glyph:"bardic"  },
    tactical:{key:"tactical",label:"Tactical" ,tone:"tactical",glyph:"tactical"},
    "other-1":{key:"other-1",label:"Bonus I"  ,tone:"bonus"   ,letter:"I"  },
    "other-2":{key:"other-2",label:"Bonus II" ,tone:"bonus"   ,letter:"II" },
    "other-3":{key:"other-3",label:"Bonus III",tone:"bonus"   ,letter:"III"}
  };
  var UNKNOWN_SOURCE={key:"",label:"Other",tone:"bonus",glyph:"other"};
  /* What a player can seal a BONUS die with. Destiny is absent on purpose: a
     Destiny die is taken from the pool, it is not a sticker you put on an
     ordinary die, and the seal card has its own button for that. */
  var SEALABLE_SOURCES=["guidance","bardic","tactical","other-1","other-2","other-3"];
  function rollSource(key){return ROLL_SOURCES[String(key||"")]||UNKNOWN_SOURCE;}
  /* Drawn FOR 12px, not shrunk from 24px. iconSvg's 1.65 stroke on a 24 grid
     renders at 0.8 device px in the tray, which is a hairline; these are
     filled, or stroked heavy, and each is ONE CONTINUOUS PATH. The first ∞
     shipped in a mockup was three separate arcs whose ends did not meet — at
     48px it looked sloppy and at 12px it was a smudge. These glyphs are never
     seen large. They are seen at 12px, at an angle, mid-session. */
  var SOURCE_GLYPHS={
    /* One unbroken lemniscate: centre → left loop → centre → right loop →
       centre. Two semicircle arcs (endpoints a diameter apart), opposite
       sweeps, joined by cubics through the crossing. */
    destiny:'<path d="M12 12C10.8 9.2 9.4 6.4 7.6 6.4a5.6 5.6 0 1 0 0 11.2c1.8 0 3.2-2.8 4.4-5.6 1.2-2.8 2.6-5.6 4.4-5.6a5.6 5.6 0 1 1 0 11.2c-1.8 0-3.2-2.8-4.4-5.6Z" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>',
    /* A real five-pointed star, filled — an outline star at this size is a
       thin cross. Outer r 9.6, inner r 4.6, centre nudged down so the optical
       centre lands on the geometric one. */
    guidance:'<path d="M12 3 14.7 8.88 21.13 9.63 16.38 14.02 17.64 20.37 12 17.2 6.36 20.37 7.62 14.02 2.87 9.63 9.3 8.88Z"/>',
    /* Eighth note: solid stem and flag, solid head. The head overlaps the
       stem foot rather than meeting it edge to edge, so no join can open up. */
    bardic:'<path d="M13.2 3.8c4 1.5 6.6 3.9 6.6 6.9 0 1.7-.8 3.2-2.3 4.5.7-3.4-1.2-5.4-4.9-7v9.9h-2.7V3.8Z"/>'+
      '<ellipse cx="8.7" cy="18.2" rx="4.5" ry="3.4" transform="rotate(-20 8.7 18.2)"/>',
    /* Filled shield: square shoulders on top, then STRAIGHT sides converging
       to a point. The taper is the entire reason it beat the swords, so it has
       to be legible at 12px and not merely present in the path — the first
       version here was a heater shield with curved flanks, and rasterised at
       12px its corners rounded off and it read as a solid blob with no taper
       at all. Straight edges and a flat top survive the raster; curves at this
       size do not. Half block, half wedge, measured in the harness. */
    tactical:'<path d="M4.6 3H19.4V11L12 21.8 4.6 11Z"/>'
  };
  function sourceGlyphSvg(name){
    var body=SOURCE_GLYPHS[String(name||"")];
    if(!body)return "";
    return '<svg class="fh-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">'+body+'</svg>';
  }
  /* The mark a source token shows: a glyph, or a bold numeral. Since the
     wrappers lost their src slot this only dresses the robe pastilles in the
     die menu (.fh-cd-dmrobe — painted ON the tinted die face since R6). */
  function bonusSourceMark(source){
    var token=rollSource(source);
    if(token.letter)return "<b>"+token.letter+"</b>";
    return sourceGlyphSvg(token.glyph)||iconSvg("other");
  }
  function sourceToneClass(source){return "is-src-"+rollSource(source).tone;}
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
  /* ── §5 The verdict half of the Ruling ─────────────────────────────
     One table, two readings, and that is the point of it. `outcome` is the
     machine-facing string the feed and the tones already consume — outcomeTone
     and feedTone match on these exact words, so they are not free to change.
     `verdict` is what the Ruling says out loud, and it is allowed to be
     louder and more precise ("ARCANE CRITICAL SUCCESS", where the outcome
     only says "Critical success"). Declaring them SIDE BY SIDE is what stops
     the two drifting apart the way thirteen scattered pushes let badges drift.

     Order is the ruling order and it is load-bearing: an Arcane critical
     outranks a natural 20, and a DC is only consulted when nothing louder
     happened. */
  function rollHasDc(entry){return entry.dc !== "" && isFinite(Number(entry.dc));}
  var ROLL_VERDICTS=[
    {id:"arcane-critical-failure",when:function(e){return !!(e.destiny&&e.destiny.criticalFailure);},
      outcome:"Critical failure",verdict:"ARCANE CRITICAL FAILURE"},
    {id:"arcane-critical-success",when:function(e){return !!(e.destiny&&e.destiny.criticalSuccess);},
      outcome:"Critical success",verdict:"ARCANE CRITICAL SUCCESS"},
    {id:"fate-refused",when:function(e){return e.natChoice==="chaos";},
      outcome:"Critical success · Chaos",verdict:"FATE REFUSED"},
    {id:"natural-20",when:function(e){return e.natural===20;},
      outcome:"Natural 20",verdict:"NATURAL 20"},
    {id:"natural-1-accepted",when:function(e){return e.natural===1&&e.natChoice==="accept";},
      outcome:"Critical failure · Fate accepted",verdict:"CRITICAL FAILURE"},
    /* A 1 nobody has answered yet is undecided, and the Ruling says so rather
       than picking for the player. */
    {id:"natural-1-open",when:function(e){return e.natural===1;},
      outcome:"Natural 1 · choose fate",verdict:"NATURAL 1 · CHOOSE"},
    {id:"success",when:function(e){return rollHasDc(e)&&e.total>=Number(e.dc);},
      outcome:"Success",verdict:"SUCCESS"},
    {id:"failure",when:rollHasDc,outcome:"Failure",verdict:"FAILURE"}
  ];
  function rollVerdict(entry){
    if(!entry)return null;
    for(var i=0;i<ROLL_VERDICTS.length;i++)if(ROLL_VERDICTS[i].when(entry))return ROLL_VERDICTS[i];
    return null;
  }
  function outcomeFor(entry){var found=rollVerdict(entry);return found?found.outcome:"";}
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
      /* The Ruling and the destiny-spend badge both read pointsAfter off this
         record; refusing empties the pool, so the record must say so or every
         surface keeps quoting the pre-refusal balance forever. */
      spent.pointsAfter=state.destiny.points;
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
      // A count, not a flag: a second Natural 20 at 0 before the first card is
      // drawn owes a second draw, not the same one twice.
      if(entry.awakening)state.destiny.awakeningOwed=(Number(state.destiny.awakeningOwed)||0)+1;
      var parts=[entry.awakening?"ARCANE AWAKENING · Natural 20 at Destiny 0":"NATURAL 20 · Fate bends in your favor","Lost 1 Destiny Point","Current "+state.destiny.points];
      if(recovered)parts.push("Gained a Destiny d"+recovered.sides);
      events.push({text:parts.join(" · "),kind:entry.awakening?"awakening":"nat20",entryId:entry.id});
    } else if (entry.natural === 1) entry.natChoice = null;
    return events;
  }
  function addHistory(entry) {
    // M3c extinction: a new roll landing is "something else happening" —
    // the persistent mark left by the last climb goes out with it.
    state.traySurfaceDie=null;
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
  /* The dice a settled entry shows — extracted from setTrayFromEntry so every
     tray LINE can rebuild its own dice (each history roll is a line now), and
     so rollExport can put the same list on the wire for the table to draw. */
  function trayDiceFromEntry(entry){
    var results=[];
    if(entry.kind==="d20"){
      var d20Plan=entry.d20Roll||{sides:20,rolls:entry.d20s||[entry.kept],result:entry.kept,chosenIndex:entry.d20Choice!=null?entry.d20Choice:(entry.d20s||[]).indexOf(entry.kept),mode:entry.d20Mode,forced:!!entry.d20Forced};
      // Each fallen die carries the key its own menu answers to, so a Portent
      // dropped on it later reaches this entry and no other.
      trayDiceForPlan(d20Plan,"d20",{dieRole:"base",colour:entry.d20Colour||"",landedKey:"d20",entryId:entry.id}).forEach(function(die,index){die.natural=die.result;if(entry.transformed&&index===Number(d20Plan.chosenIndex)){die.label="Original d20";die.dropped=true;}results.push(die);});
      if(entry.transformed)results.push({sides:20,result:20,label:"FATE 1→20",natural:20,special:"transformed"});
      entryBonusDice(entry).forEach(function(die){trayDiceForPlan(die,die.label,{dieRole:"bonus",landedKey:"bonus:"+die.id,entryId:entry.id}).forEach(function(item){results.push(item);});});
      if(entry.destiny)trayDiceForPlan(entry.destiny,"Destiny",{dieRole:"destiny",special:entry.destiny.criticalSuccess?"arcane-critical-success":entry.destiny.criticalFailure?"arcane-critical-failure":""}).forEach(function(item){results.push(item);});
      if(entry.plusTwo)results.push({kind:"modifier",result:2,label:"FH bonus"});
      /* The manual +X is a coin like the others (R2) — a zero mints nothing.
         Through here it also reaches the wire: rollExportDice flattens this
         very list, so the table's feed lines grow the coin for free. */
      if(Number(entry.custom))results.push({kind:"modifier",result:Number(entry.custom),label:"Manual",tone:"mod"});
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
    return results;
  }
  function setTrayFromEntry(entry) {
    var results=trayDiceFromEntry(entry);
    /* The Ruling is derived here, once, from the entry — the frame only reads
       it. state.trayVerdict is what lets the frame tell an engine verdict from
       a prompt someone typed into the same slot ("Roll 2d6 and read the Chaos
       table"): the oxblood verdict styling lands only when the heading IS the
       Ruling's verdict, so an imperative overwrite silently loses the class
       instead of borrowing its authority. */
    var ruling=rollVocabulary(entry).ruling;
    state.trayResults=results;state.trayTitle=ruling.verdict||ruling.title;
    /* display, not account (T1): the dice enumeration stays off the wood —
       the Stream and the hover title keep the full record. */
    state.trayResultText=ruling.display.join(" · ");state.trayVerdict=ruling.verdict;
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
      if(original.destiny)trayDiceForPlan(original.destiny,"Destiny",{dieRole:"destiny",special:original.destiny.criticalSuccess?"arcane-critical-success":original.destiny.criticalFailure?"arcane-critical-failure":""}).forEach(function(item){locked.push(item);});
      else if(cfg.destinyDieId){var pendingDestiny=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId;});if(pendingDestiny)pendingTrayDice(pendingDestiny.sides,"Destiny",cfg.destinyMode,cfg.destinyForcedResult,{flash:true,destinyDieId:pendingDestiny.id,dieRole:"destiny"}).forEach(function(item){locked.push(item);});}
      if(cfg.plusTwo)locked.push({kind:"modifier",result:2,label:"FH bonus",pending:!original.plusTwo});
      if(Number(cfg.custom))locked.push({kind:"modifier",result:Number(cfg.custom),label:"Manual",tone:"mod",pending:Number(original.custom)!==Number(cfg.custom)});
      state.traySelection=[];state.trayResults=locked;state.trayTitle=cfg.name+" "+signed(cfg.baseBonus);state.trayResultText="Original d20 locked";return;
    }
    var dice=pendingTrayDice(20,"d20",cfg.d20Mode,cfg.d20ForcedResult,{dieRole:"base"});
    (cfg.bonusDice||[]).forEach(function(bonusDie){pendingTrayDice(bonusDie.sides,bonusDie.label,bonusDie.advantageMode,bonusDie.forcedResult,{dieRole:"bonus",sourceIcon:bonusDie.sourceIcon,colour:bonusDie.colour||"",bonusId:bonusDie.id}).forEach(function(item){dice.push(item);});});
    if(cfg.destinyDieId){var die=state.destiny.dice.find(function(item){return item.id===cfg.destinyDieId;});if(die)pendingTrayDice(die.sides,"Destiny",cfg.destinyMode,cfg.destinyForcedResult,{flash:true,destinyDieId:die.id,dieRole:"destiny"}).forEach(function(item){dice.push(item);});}
    if(cfg.plusTwo)dice.push({kind:"modifier",result:2,label:"FH bonus",pending:true});
    // The manual +X mints its coin the moment it is typed (R2); zero mints nothing.
    if(Number(cfg.custom))dice.push({kind:"modifier",result:Number(cfg.custom),label:"Manual",tone:"mod",pending:true});
    if(exhaustionLevel())dice.push({kind:"modifier",result:exhaustionPenalty(),label:"Exhaustion",tone:"exhaustion",pending:true});
    state.traySelection=[];state.trayResults=dice;state.trayTitle=cfg.name+" "+signed(cfg.baseBonus);state.trayResultText="Ready";
  }
  /* CLEAR TRAY empties the hand and, with it, the running commentary above the
     dice — the Stream keeps the permanent record. Badges are debts, not
     commentary, so they stay. */
  /* diceSignatures is deliberately NOT wiped here any more: the registre
     lines under the hand keep their entry-scoped keys, and wiping the map
     made every one of them re-roll visually the moment the hand was cleared. */
  function clearDiceTray(closeConsole){state.traySurfaceDie=null;state.traySelection=[];state.trayResults=[];state.trayTitle="Dice Tray";state.trayResultText="";state.trayQuietTitle="";state.trayVerdict="";state.trayPrompt=null;state.queueDone="";state.rollSequence=null;state.pendingArmed=null;state.diePrompt=null;state.destinyStaged=null;state.events=[];stopCalling();stopTrayReveal();if(closeConsole!==false)state.rollConfig=null;persistPlayState();render();}
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
    var count=Number(dieCount)||1;
    /* Past THIRTY dice the line renders an ∞ instead of dice (Eric,
       2026-08-04) — nothing rolls, so there is nothing to wait for and
       the total just appears. */
    if(count>30){state.trayRevealAt=0;return;}
    /* A 13+ hand rolls in WAVES of ten (fh-static-dice, WAVE_GAP 140ms —
       these two numbers are that scheduler's, mirrored). The reveal must
       outlive the LAST wave: the render it fires replaces the tray's DOM,
       and a wave still waiting its turn would be reborn already settled —
       which is exactly the bug Eric saw (first wave rolled, second did not). */
    var waves=count>12?Math.ceil(count/10):1;
    var span=waves>1
      ? waves*(rollAnimationMs()+10*ROLL_STAGGER_MS+140)+200
      : rollAnimationMs()+Math.max(0,count-1)*ROLL_STAGGER_MS+90;
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
    var staged=stagedList().length,base=rollDetailText(entry);
    return base+(staged?(base?" · ":"")+staged+" new die"+(staged===1?"":"s")+" ready":"");
  }
  /* The verdict is the headline; the account that produced it stays legible
     but discreet underneath. Both are read off the Ruling (§5) rather than
     assembled here — this pair is now just the tray's view of it. */
  function rollVerdictText(entry){var ruling=rollRuling(entry);return ruling.verdict||ruling.title;}
  /* display, not account (T1): what this feeds is the judgment box. */
  function rollDetailText(entry){return rollRuling(entry).display.join(" · ");}
  function refreshOpenTray(entry){
    setTrayFromEntry(entry);
    stagedList().forEach(function(item){
      var dice=pendingTrayDice(item.sides,item.label,item.advantageMode||"flat",null,{dieRole:item.kind==="destiny"?"destiny":"bonus",sourceIcon:item.sourceIcon||"",colour:item.colour||"",flash:item.kind==="destiny",stagedId:item.id});
      // Strict construction order (Eric, 2026-08-04): a staged Destiny die takes
      // its chronological place at the end, like every other die.
      dice.forEach(function(die){state.trayResults.push(die);});
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
  /* ROLL again on the same check: the setup is kept, the dice are not — and
     the BONUS dice are dice, not setup (M1, décision Eric 2026-08-06). They
     used to be carried into every repeat: with the roll staying open, each
     jet re-inherited the last jet's Guidance/Bardic/Bonus dice, the three
     slots filled one selection at a time and never came back — the white
     picker ended fully greyed and a robe used once was unusable for good.
     A seal robe is a boon granted for ONE roll: the next jet starts with the
     bare d20, every robe available again. The guidance/bardic flags must be
     cleared with the dice, or ensureConfigBonusDice would quietly re-add
     them from the flags configFromEntry copied off the landed entry. */
  function repeatOpenRoll(entry){
    var cfg=configFromEntry(entry);
    cfg.editingId=null;cfg.d20ForcedResult=null;cfg.destinyForcedResult=null;cfg.destinyDieId="";cfg.destinyConfirmed=false;
    cfg.bonusDice=[];cfg.guidance=false;cfg.bardic=false;
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
    prepareTrayForConfig(cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==die.id;});trayDiceForPlan(sequence.destinyPlan,"Destiny",{flash:true,destinyDieId:die.id,dieRole:"destiny"}).forEach(function(item){state.trayResults.push(item);});state.trayResultText=sequence.destinyPlan.result==null?"Choose the Destiny result":"Destiny result selected";
    if(sequence.destinyPlan.result==null){showDieChoice("destiny",0,sequence.destinyPlan,"Destiny d"+die.sides);return;}
    var spent=spendDestinyDie(cfg.destinyDieId,true,sequence.destinyPlan);if(!spent){pushEvent("That Destiny die is no longer available.","error");state.rollSequence=null;render();return;}
    sequence.entry.destiny=spent;sequence.phase="destiny-events";prepareTrayForConfig(sequence.cfg);state.trayResults=state.trayResults.filter(function(item){return item.destinyDieId!==spent.dieId;});trayDiceForPlan(spent,"Destiny",{destinyDieId:spent.dieId,dieRole:"destiny",special:spent.criticalSuccess?"arcane-critical-success":spent.criticalFailure?"arcane-critical-failure":""}).forEach(function(item){state.trayResults.push(item);});state.trayResultText="Destiny d"+spent.sides+" = "+spent.result;announceEvents(destinyEventSpecs(spent,sequence.entry.id),sequence.adjustment?"adjustment-remaining":"roll-remaining",arcaneDecision(spent,sequence.entry.id));
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
    // A draw settles exactly one owed Awakening — a second Natural 20 landed
    // before this card was dealt still owes its own draw.
    state.destiny.awakeningOwed=Math.max(0,(Number(state.destiny.awakeningOwed)||0)-1);
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
    var next=pendingFate().concat([item]);
    // The strip holds four; a debt that falls off the front must say so — a
    // Chaos roll or an Overreach save going quiet is exactly the silent
    // fallback §2 of the handoff forbids, not a housekeeping detail.
    if(next.length>4){
      var dropped=next.shift();
      pushEvent("A pending "+pendingLabel(dropped)+" debt was never faced and has expired.","chaos");
    }
    state.destiny.pending=next;
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
    state.message="Saving edited sheet…";state.messageKind="roll";renderMessage();saveProfile({manualOverrides:manualOverrides}).then(function(){state.editDraft=null;state.character=effectiveCharacter();state.message="Character sheet corrections saved.";state.messageKind="success";pushEvent("Character sheet edited","corrected");render();}).catch(function(error){if(error&&error.silent)return;state.message="Could not save edited sheet: "+error.message;state.messageKind="danger";renderMessage();});
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
    slate:{fill:"#4a4f55",light:"#727880",dark:"#2b2f34",rim:"#1c1f22",facet:"#3a3e44",num:"#f0f2f4"},
    // The plain-bonus tint (Eric, ratified 2026-08-03: "bonus lambda gris clair").
    ash:{fill:"#c9cdd2",light:"#eceef1",dark:"#9aa0a8",rim:"#6b7178",facet:"#aeb3ba",num:"#3a3f45"}
  };
  // Offered in the right-click menu, in this order. "ivory" is the default.
  var DIE_COLOURS = [["ivory","Ivory"],["green","Green"],["gold","Gold"],["crimson","Crimson"],["azure","Azure"],["violet","Violet"],["slate","Slate"]];
  /* The SEAL IS THE DIE (Eric, ratified 2026-08-03, wired 2026-08-04):
     "color and dice = all in one" — a bonus die's provenance is its tint,
     not a separate 12px token. Destiny gold, Tactical (the warrior's die)
     crimson, Bardic violet, Guidance azure, plain bonuses light-grey ash.
     A colour the player chose by hand still wins over everything. */
  var SOURCE_TINT={guidance:"azure",bardic:"violet",tactical:"crimson"};
  function dieMaterialName(die){
    if(die.special==="chaos")return "chaos";
    if(die.colour&&DIE_MATERIAL[die.colour])return die.colour;
    if(die.special==="arcane-critical-success")return "crit";
    if(die.special==="arcane-critical-failure")return "fumble";
    if(die.sides===20&&die.result===20)return "crit";
    if(die.sides===20&&die.result===1)return "fumble";
    if(die.dieRole==="destiny")return "gold";
    if(die.dieRole==="bonus")return SOURCE_TINT[String(die.sourceIcon||"")]||"ash";
    return "ivory";
  }
  /* M4: gradient ids must be UNIQUE PER SVG INSTANCE. url(#id) resolves
     against the WHOLE document, to the FIRST matching def — and when that
     first def lives inside a display:none container (e.g. the closed
     Stream), browsers refuse to paint the gradient and the die goes white.
     Measured on the public bench: gviolet6/gash6 defined only inside the
     hidden Stream turned every visible violet/ash pastille blank. A plain
     incrementing counter keeps each svg pointing at its own defs; renders
     are frequent but a Number counter never collides and never overflows
     in practice. */
  var dieSvgUid=0;
  function dieSvg(sides,size,materialName,text){
    var geo=DIE_GEO[sides]||DIE_GEO[20],m=DIE_MATERIAL[materialName]||DIE_MATERIAL.ivory,id="g-"+materialName+sides+"-"+(++dieSvgUid);
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
  /* opts (all optional): sizePx pins the die size instead of deriving it from
     the count (the tray's bands are fixed sizes, not crowd-relative), and
     snapshot renders the settled pose as a cached bitmap with NO live WebGL
     context — the Static Area's whole requirement (see fh-static-dice.js on
     the ~16-context browser cap). */
  function visualDie(die,index,count,animate,opts){
    opts=opts||{};
    var classes=["fh-cd-diewrap"];
    if(die.dropped)classes.push("is-dropped");
    if(die.pending)classes.push("is-pending");
    if(die.flash)classes.push("is-flashing");
    // M3c: the die a climb was aimed at keeps its small persistent mark.
    if(opts.picked)classes.push("is-picked");
    if(die.forced)classes.push("is-forced");
    if(die.special==="chaos")classes.push("is-chaosdie");
    /* plainLabel (the tray, the assembly frame): the label is the die's name
       and nothing else — the line's own heading already says ready/spent, and
       the suffixes were what made neighbouring labels collide (Eric,
       2026-08-03: "le texte sous les dés plus minimaliste"). */
    var status=opts.plainLabel?"":die.forced?" · MANUAL":die.pending?" · ready":die.dieRole==="destiny"&&die.result!=null?" · spent":"";
    var size=Number(opts.sizePx)||dieSize(count||1);
    if(die.kind==="modifier"){
      var tone=die.tone||(die.label==="FH bonus"?"fh":"mod"),text=(Number(die.result)||0)>=0?"+"+Math.abs(Number(die.result)||0):"−"+Math.abs(Number(die.result)||0);
      classes.push("is-modifier");
      /* In a swarm the coin sheds its label and rides at swarm scale — the
         value is printed on the coin, which is its nature. It never rolls. */
      if(opts.naked){
        return "<span class=\""+classes.join(" ")+" is-naked\"><span class=\"fh-cd-die fh-cd-token\">"+tokenSvg(Math.max(14,Math.round(size*.9)),text,tone)+"</span></span>";
      }
      return "<span class=\""+classes.join(" ")+"\""+(opts.noLabel?" title=\""+esc(die.label||"Bonus")+"\"":"")+"><span class=\"fh-cd-die fh-cd-token\">"+tokenSvg(Math.round(size*.68),text,tone)+"</span>"+(opts.noLabel?"":"<em>"+esc(die.label||"Bonus")+"</em>")+"</span>";
    }
    /* The source token AND its empty 12px slot are gone (Eric: "violet +
       Bardic, rien de plus") — the die's tint says destiny/tactical/bardic/
       guidance/plain, the label names it, and for a label-less die the
       wrapper's title keeps the full name on hover (same pattern as naked). */
    var srcTitle=die.dieRole==="bonus"?(die.label||rollSource(die.sourceIcon).label)
      :die.dieRole==="destiny"?ROLL_SOURCES.destiny.label:"";
    var dieClasses="fh-cd-die"+(die.result!=null?" is-landed":"")+(animate&&die.result!=null?" is-spinning":"");
    // A die still in the hand carries its identity so a right click can reach it.
    var handle="";
    if(opts.readOnly){
      /* Another player's die: the table reads it, nobody here tunes it. No
         handles means the existing menu delegation never matches it. */
    }
    else if(die.pending&&die.result==null){
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
    /* naked (Eric, 2026-08-03, sizes and wave 2026-08-04): a swarm die — no
       source token, no label, just the die, in real pseudo-3D. A die that is
       LANDING now is a live host: it tumbles at the roll size, and when its
       wave settles the renderer swaps it for the cached bitmap at
       data-settle-size — roll small, stop, zoom. A die merely re-rendered is
       born as the snapshot directly: zero live contexts. Pending dice keep
       the flat "?" face at roll scale. Colour will carry damage type later. */
    if(opts.naked&&die.kind!=="modifier"){
      if(ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0&&die.result!=null){
        var nakedValue=Number(die.result);
        var rolling=!!animate;
        var rollSize=Number(opts.rollSizePx)||size;
        var settleSize=Number(opts.settleSizePx)||size;
        var hostSize=rolling?rollSize:settleSize;
        face="<span class=\"fh-cd-static-die"+(Number(die.sides)===100?" is-percentile":"")+"\""+
          (rolling?" data-wave=\""+(opts.wave!=null?opts.wave:0)+"\" data-settle-size=\""+settleSize+"\"":" data-snapshot=\"1\"")+
          " data-sides=\""+Number(die.sides)+"\" data-result=\""+nakedValue+"\" data-pending=\"0\" data-material=\""+esc(materialName)+"\" data-index=\""+Number(opts.waveIndex!=null?opts.waveIndex:index||0)+"\" data-animate=\""+(rolling?"1":"0")+"\" style=\"--fh-static-die-size:"+hostSize+"px\" role=\"img\" aria-label=\"d"+Number(die.sides)+" result "+nakedValue+"\">"+
          "<canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static-die-result\" aria-hidden=\"true\"></b>"+
          "<span class=\"fh-cd-static-die-fallback\">"+dieSvg(die.sides,hostSize,materialName,nakedValue)+"</span></span>";
        dieClasses+=" is-static-die";
      }
      /* No corner mark in the swarm: the tint IS the provenance now
         ("all in one"), and the title still names it on hover. */
      var nakedTitle=die.dieRole==="bonus"?(die.label||rollSource(die.sourceIcon).label)
        :die.dieRole==="destiny"?ROLL_SOURCES.destiny.label:"";
      return "<span class=\""+classes.join(" ")+" is-naked\""+(handle||(nakedTitle?" title=\""+esc(nakedTitle)+"\"":""))+">"+
        "<span class=\""+dieClasses+"\">"+face+"</span></span>";
    }
    /* Static Area (tray rolls 5+): the settled pose as a cached bitmap. One
       host, one numeral slot — even for d100, whose snapshot pair is drawn
       into a single image by the generator. data-snapshot is what routes
       FHStaticDice.mount away from creating a live context. */
    if(opts.snapshot&&ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0&&die.result!=null){
      var snapValue=Number(die.result);
      face="<span class=\"fh-cd-static-die"+(Number(die.sides)===100?" is-percentile":"")+"\" data-snapshot=\"1\" data-sides=\""+Number(die.sides)+"\" data-result=\""+snapValue+"\" data-pending=\"0\" data-material=\""+esc(materialName)+"\" data-index=\""+Number(index||0)+"\" data-animate=\"0\" style=\"--fh-static-die-size:"+size+"px\" role=\"img\" aria-label=\"d"+Number(die.sides)+" result "+snapValue+"\">"+
        "<canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static-die-result\" aria-hidden=\"true\"></b>"+
        "<span class=\"fh-cd-static-die-fallback\">"+face+"</span></span>";
      dieClasses+=" is-static-die";
      return "<span class=\""+classes.join(" ")+"\""+(srcTitle?" title=\""+esc(srcTitle)+"\"":"")+">"+
        "<span class=\""+dieClasses+"\">"+face+"</span>"+
        (opts.noLabel?"":"<em>"+esc((die.label||("d"+die.sides))+status)+"</em>")+"</span>";
    }
    /* The WebGL renderer is deliberately only a renderer: the face was chosen
       before this markup exists. Larger pools retain the lightweight SVG tray
       and its lower GPU cost. */
    if(ROLL_DIE_SIZES.indexOf(Number(die.sides))>=0&&count<=LIGHTWEIGHT_DICE_THRESHOLD){
      var resolved=die.result!=null,staticResult=resolved?Number(die.result):1,staticLabel=resolved?"result "+staticResult:"ready";
      var staticBody="";
      if(Number(die.sides)===100){
        var percentile=staticResult===100?"00":String(staticResult).padStart(2,"0");
        staticBody="<span class=\"fh-cd-static-die-part\"><canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static-die-result\" aria-hidden=\"true\">"+(resolved?percentile.charAt(0):"")+"</b></span>"+
          "<span class=\"fh-cd-static-die-part\"><canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static-die-result\" aria-hidden=\"true\">"+(resolved?percentile.charAt(1):"")+"</b></span>";
        dieClasses+=" is-percentile";
      }else{
        var staticText=Number(die.sides)===10&&staticResult===10?"0":staticResult;
        staticBody="<canvas aria-hidden=\"true\"></canvas><b class=\"fh-cd-static-die-result\" aria-hidden=\"true\">"+(resolved?staticText:"")+"</b>";
      }
      face="<span class=\"fh-cd-static-die"+(Number(die.sides)===100?" is-percentile":"")+"\" data-sides=\""+Number(die.sides)+"\" data-result=\""+staticResult+"\" data-pending=\""+(resolved?"0":"1")+"\" data-material=\""+esc(materialName)+"\" data-index=\""+Number(index||0)+"\" data-animate=\""+(resolved&&animate?"1":"0")+"\" style=\"--fh-static-die-size:"+size+"px\" role=\"img\" aria-label=\"d"+Number(die.sides)+" "+staticLabel+"\">"+
        staticBody+"<span class=\"fh-cd-static-die-fallback\">"+face+"</span></span>";
      dieClasses+=" is-static-die";
    }
    /* noLabel (T9, Eric): on the tray's large line the tint already says the
       provenance and the wrapper's title still names it — the visible label
       under the die was the last redundant text. The judgment box's assembly
       keeps its labels (you need to read what you are adding). A tunable die
       keeps its interaction title; the source title only steps in when no
       handle claimed the hover. */
    return "<span class=\""+classes.join(" ")+"\""+(handle||(srcTitle?" title=\""+esc(srcTitle)+"\"":""))+">"+
      "<span class=\""+dieClasses+"\">"+face+"</span>"+
      (opts.noLabel?"":"<em>"+esc((die.label||("d"+die.sides))+status)+"</em>")+"</span>";
  }
  /* The event list and its decision line are gone (third fitting): the
     judgment window says the ruling and asks the decisions, the badge strip
     carries the debts, the Stream keeps the record. state.events itself
     stays — it persists, and frameMood still reads its newest entry. */
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
        /* The robe row reads the source table (§1) out loud, not a second
           hand-kept list — which is how Tactical came to be drawable by the
           engine and unreachable from this card. */
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
        /* SEAL and COLOUR were two rows for two facets of the SAME thing — the
           robe of the die (« le sceau EST le dé », R6, 2026-08-05). One row of
           robes now: the seal-bearing robes first, each a pastille in its
           SOURCE_TINT wearing its mark (★ on azure, ♪ on violet…), then the
           plain colour pastilles, naked. The DATA does not move — sourceIcon
           and colour stay two fields and a hand-picked colour still wins
           visually — only the wardrobe is presented on one rail. Exactly ONE
           pastille carries is-on: the robe the die actually wears. A sealed
           die recoloured by hand ("Bardic + crimson") lights the crimson
           pastille and paints the Bardic mark ON it — the seal follows the
           robe. Choosing a seal robe dresses the whole die (tint included);
           choosing a naked pastille recolours it and keeps its seal. */
        function robePastille(tint,mark,on,attrs,title,disabled){
          var m=DIE_MATERIAL[tint]||DIE_MATERIAL.ivory;
          return "<button type=\"button\" class=\"fh-cd-dmrobe"+(on?" is-on":"")+"\" "+attrs+(disabled?" disabled":"")+" title=\""+esc(title)+"\">"+
            dieSvg(6,15,tint,"")+(mark?"<span class=\"fh-cd-dmmark\" style=\"color:"+m.num+"\">"+mark+"</span>":"")+"</button>";
        }
        var robes="";
        if(canSeal){
          // "—" undresses the die completely: no seal, no manual colour.
          robes+="<button type=\"button\" class=\"fh-cd-dmrobe is-none"+(!target.sourceIcon&&!target.colour?" is-on":"")+"\" data-die-seal=\"\" title=\"None — the die&#39;s own robe\">—</button>";
          robes+=SEALABLE_SOURCES.map(function(key){
            var tint=SOURCE_TINT[key]||"ash";
            return robePastille(tint,bonusSourceMark(key),!target.colour&&(target.sourceIcon||"")===key,
              "data-die-seal=\""+key+"\"",ROLL_SOURCES[key].label+" · "+tint,false);
          }).join("");
          robes+=robePastille("gold",sourceGlyphSvg("destiny"),false,"data-die-seal=\"destiny\"",
            poolReady?"Destiny · gold — take a Destiny d"+target.sides+" from the pool instead; ROLL is what spends it":"No Destiny d"+target.sides+" available",!poolReady);
        }
        // Gold is a Destiny die's identity, not a preference, so it is not offered a palette.
        if(!isDestiny)robes+=DIE_COLOURS.filter(function(pair){
            /* On a sealable die the Ivory swatch was a lie twice over: colour
               "ivory" is stored as "" so it could never light up, and clicking
               it returned the die to its TINT, never to ivory. The seal robes
               are that reset now, so Ivory is only offered where it is true. */
            return !canSeal||pair[0]!=="ivory";
          }).map(function(pair){
            var on=target.colour?target.colour===pair[0]:!canSeal&&pair[0]==="ivory";
            var mark=on&&canSeal&&target.sourceIcon?bonusSourceMark(target.sourceIcon):"";
            return robePastille(pair[0],mark,on,"data-die-colour=\""+pair[0]+"\"",
              pair[1]+(mark?" · sealed "+sealLabel(target.sourceIcon):""),false);
          }).join("");
        var robeRow=robes?"<div class=\"fh-cd-dmrow fh-cd-dmrobes\">"+robes+"</div>":"";
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
        return "<div class=\"fh-cd-card is-diemenu\"><small>"+head+"</small>"+robeRow+modeRow+portentRow+
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
    // A Destiny die picked up with nothing else prepared waits here, pulsing,
    // until ROLL decides to spend it — at its construction-order place, like
    // every die since Eric's left-to-right ruling (2026-08-04).
    var waiting=state.destinyStaged;
    if(waiting){
      if(state.destiny&&state.destiny.dice.some(function(die){return die.id===waiting.dieId&&die.available;}))
        dice.push({sides:waiting.sides,result:forcedDieResult(waiting.forcedResult,waiting.sides),label:"Destiny",dieRole:"destiny",pending:true,flash:true,poolDestinyId:waiting.dieId,forced:waiting.forcedResult!=null});
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
  /* renderFrameInner is gone: the frame, its dice row and the Ruling line all
     live in the Dice Tray now (diceTrayInner) — the tray is the surface those
     things were always describing. The per-die signature machinery moved with
     them, line-prefixed so ten lines of dice can coexist. */
  /* One ROLL, one CLEAR TRAY. Nothing else is permanent. Below them the
     transient badges, then the tray, then whatever popup is owed — which
     pushes the stream down instead of covering the dice. */
  /* Currently uncalled, on purpose: this composition line came off the ROLL
     die (round 7c) and is going into the tray's legend next round rather than
     being rewritten from scratch there. */
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
    var busy=rollTransactionActive();
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
    /* Above the judgment window there are only the badges (Eric, 2026-08-03,
       third fitting): the stacked announcement lines are gone — a ruling
       reads in the window, a debt reads on the badge strip, and the Stream
       keeps the record. A menu the player opened still stays under the
       window so it never pushes anything off screen. */
    return "<section class=\"fh-cd-stage\" data-zone=\"roller\">"+
      /* CLEAR TRAY moved to the console (Eric, 2026-08-04, provisional seat
         — its final place is an open discussion). Above the judgment box
         there is only the badge strip: zero text. */
      "<div class=\"fh-cd-temps\">"+badges+"</div>"+
      renderJudgmentFrame()+
      (menu?"<div class=\"fh-cd-popups\">"+menu+"</div>":"")+
      "</section>";
  }
  /* ── The judgment window (Eric, 2026-08-03, third fitting) ────────
     The Roll Builder's frame is PERMANENT now, and everything the engine
     says to the player passes through it, by priority:
       1. a DECISION — Natural 1, an Arcane 1, an A/D choice: the one
          moment the dock genuinely asks;
       2. the ASSEMBLY — a hand with nothing landed, dice waiting on ROLL
          (past six dice, a bare swarm);
       3. the RULING of the roll just landed — verdict and account, the
          same equality rule as always: oxblood only when the heading IS
          the derived verdict;
       4. rest — an invitation.
     The stacked announcement lines above it are gone; the badge strip
     carries the debts and the Stream keeps the record. The mood streaks
     live here too — the moment's frame, not the registre's. */
  function judgmentDecisionHtml(){
    var prompt=state.trayPrompt;
    if(prompt&&prompt.type==="die-choice"){
      return "<div class=\"fh-cd-judgeask is-die-choice\"><b>"+(prompt.mode==="choice"?"A / D":"CHOOSE RESULT")+"</b>"+
        "<i>"+esc(prompt.label)+" — either result may be kept</i>"+
        "<span class=\"fh-cd-eacts is-dice\">"+(prompt.rolls||[]).map(function(result,index){
          return "<button type=\"button\" data-die-choice=\""+index+"\" class=\"fh-cd-die\" aria-label=\"Keep "+result+"\">"+dieSvg(prompt.sides,30,dieMaterialName({sides:prompt.sides,result:result,dieRole:prompt.dieRole}),result)+"</button>";
        }).join("")+"</span></div>";
    }
    if(prompt&&prompt.type==="nat1"){
      return "<div class=\"fh-cd-judgeask is-nat1\"><b>NATURAL 1 · do you accept your fate?</b>"+
        "<i>Accept: critical failure, +1 Destiny Point. Refuse: the 1 becomes 20, Destiny falls to 0, Chaos becomes pending.</i>"+
        "<span class=\"fh-cd-eacts\"><button type=\"button\" data-tray-accept-fate>Accept</button>"+
        "<button type=\"button\" class=\"is-danger\" data-tray-refuse-fate>Refuse</button></span></div>";
    }
    if(prompt&&prompt.type==="arcane1"){
      var sides=Number(prompt.sides)||4;
      return "<div class=\"fh-cd-judgeask is-arcane-critical-failure\"><b>ARCANE CRITICAL FAILURE · do you accept your fate?</b>"+
        "<i>Accept: the failure stands, +1 Destiny Point. Refuse: the 1 reads as "+sides+" — Arcane Critical Success — Destiny falls to 0, Chaos becomes pending.</i>"+
        "<span class=\"fh-cd-eacts\"><button type=\"button\" data-arcane-fate=\"accept\">Accept</button>"+
        "<button type=\"button\" class=\"is-danger\" data-arcane-fate=\"chaos\">Refuse</button></span></div>";
    }
    return "";
  }
  function renderJudgmentFrame(){
    var mood=frameMood();
    var decision=judgmentDecisionHtml();
    var dice=trayDiceForDisplay();
    /* A COIN carries its value from birth (result is its face, not a landing)
       — so "has anything landed?" must only read the real dice, or a +2
       toggled during assembly convinces the frame the hand already fell and
       the whole assembly (coin included) vanishes. That was bug R1. */
    var assembling=dice.length&&!dice.some(function(die){return die.kind!=="modifier"&&die.result!=null;});
    var assembly="";
    if(assembling&&!decision){
      var realDice=dice.filter(function(die){return die.kind!=="modifier";}).length;
      var swarm=realDice>5;
      var rows=realDice>10;
      /* While STAGING every die stays visible (you need to see what you
         are adding) — and the crowd reads on the SAME ratified grid as
         the tray (Eric, 2026-08-05): 1-5 wrapped at 38 with labels, 6-10
         naked 30→20, 11+ in rows of ten at 20 — never under 20 in a row
         of ten; the judgment frame is height:auto and simply grows. */
      var sizePx=rows?TRAY_DIE_ROW:swarm?Math.round(30-2.5*(realDice-6)):TRAY_DIE_SKILL;
      assembly="<span class=\"fh-cd-tray-dice is-build"+(swarm?" is-swarm":"")+(rows?" is-rows":"")+"\""+
        (swarm?" style=\"--fh-cd-tray-die-size:"+sizePx+"px\"":"")+">"+dice.map(function(die,index){
        return visualDie(die,index,dice.length,false,{sizePx:sizePx,plainLabel:true,naked:swarm});
      }).join("")+"</span>";
    }
    /* A decision COVERS the whole box (Eric: "pour les grandes occasions le
       texte couvre tout le builder") — no columns, just the question. */
    if(decision){
      return "<div class=\"fh-cd-frame is-judgment is-takeover"+(mood?" mood-"+mood:"")+"\">"+decision+"</div>";
    }
    /* Otherwise three spaces on the wood, left to right: the informative
       column (what Fate said — the Ruling, or the invitation), the dice
       building left→right, and the roll's identity — "History / +1" —
       centred on the right. The verdict-equality rule is unchanged. */
    var quiet=trayRevealPending();
    var heading=quiet&&state.trayQuietTitle?state.trayQuietTitle:state.trayTitle;
    var detail=quiet?"Rolling…":state.trayResultText;
    var isRuling=!quiet&&!!state.trayVerdict&&heading===state.trayVerdict;
    /* The right column: the roll's name and flat bonus, nothing else — the
       config while one is open, the open entry's identity otherwise. */
    var cfg=state.rollConfig,idEntry=openEntry();
    var rightName=cfg?cfg.name:idEntry?idEntry.name:(assembling?state.trayLabel||"Free roll":"");
    /* NOTHING SAID TWICE: the +2 and the manual mod are visible as coins in
       the assembly now (R1/R2), so the right column keeps the BASE bonus
       alone — folding them back in would state each of them twice. */
    var rightBonus=cfg&&isFinite(Number(cfg.baseBonus))?signed(Number(cfg.baseBonus))
      :idEntry&&idEntry.kind==="d20"&&isFinite(Number(idEntry.baseBonus))?signed(idEntry.baseBonus):"";
    /* Nothing said twice on the wood either: a heading that only restates
       the right column's identity — "Arcana +10" while preparing, "Arcana
       22" once landed (the no-verdict fallback title) — yields to it, and
       the left keeps the informative part alone. A real verdict, or a
       prompt like "Chaos", never starts with the roll's name and stays. */
    if(heading&&rightName&&heading.indexOf(rightName)===0)heading="";
    /* At rest the wood stays bare (T3): the invitation lives once, in the
       tray's empty state — saying it twice was the doublon. */
    var judgment=(heading&&heading!=="Dice Tray")||detail
      ? (heading&&heading!=="Dice Tray"?"<b"+(isRuling?" class=\"fh-cd-verdict\"":"")+">"+esc(heading)+"</b>":"")+
        (detail?"<em"+(isRuling?" class=\"fh-cd-account\"":"")+">"+esc(detail)+"</em>":"")
      : "";
    var right=rightName?"<span class=\"fh-cd-judgeright\"><b>"+esc(rightName)+"</b>"+(rightBonus?"<i>"+esc(rightBonus)+"</i>":"")+"</span>":"";
    return "<div class=\"fh-cd-frame is-judgment"+(assembling?" is-assembly":"")+(mood?" mood-"+mood:"")+"\">"+
      "<span class=\"fh-cd-judgment\">"+judgment+"</span>"+assembly+right+"</div>";
  }
  /* ── The Destiny & Dice Pool band (phase 1, dock-dice-tray) ─────────
     The old in-flow Destiny zone was rendered under the panel and covered
     permanently by the summoned group (constat C1: never actually visible).
     It is replaced by a persistent 44px strip anchored just ABOVE the Dice
     Tray — UI-TERMINOLOGY zone 6, so the section is data-zone="dice-pool"
     (the migration table retires data-zone="destiny": Destiny is the dice
     family's name now, not the zone's). Everything COUNTED lives here: the
     Points/Score ledger (one compact block; its −/+, Score edit and the
     pool ⋮ rows all moved into the menu the block itself opens), the gold
     dice at 22px with their staging behaviour intact, and the Major Arcana
     in compact form on the right. */
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
      return "<span class=\"fh-cd-poolwrap\"><button type=\"button\" class=\"fh-cd-picker-die"+(die?"":" is-empty")+(selected?" is-selected":"")+(die&&calling?" is-calling":"")+"\" "+(die?"data-destiny-die=\""+die.id+"\"":"disabled")+" title=\""+(die?"Left click waits it in the tray · right click takes it back":"")+"\" aria-label=\""+(die?"Spend":"No")+" Destiny d"+sides+"\">"+
        pickerFace(sides,BAND_DIE_PX,die?"gold":"ivory","d"+sides)+(available.length>1?"<span class=\"fh-cd-mult\">×"+available.length+"</span>":"")+"</button></span>";
    }).join("");
    /* One menu pilots the whole ledger from the block itself: the Points −/+
       and input, the Score click-to-edit, then the five pool rows the old ⋮
       carried. Same data hooks as before (data-destiny-step, -field,
       -score-edit, -destiny-pool), so every behaviour is conserved. */
    var poolMenuOpen=!!state.destinyPoolMenu;
    // The Score changes once in a campaign, so it is plain text with a
    // click-to-edit affordance instead of a permanently locked input.
    var score=state.scoreEditing
      ? "<input class=\"fh-cd-scorein\" data-destiny-field=\"score\" type=\"number\" value=\""+state.destiny.score+"\" aria-label=\"Destiny Score\">"
      : "<button class=\"fh-cd-score\" type=\"button\" data-score-edit title=\"Click to change the Destiny Score\">"+state.destiny.score+"</button>";
    var poolMenu=poolMenuOpen?"<div class=\"fh-cd-dpoolmenu is-band\">"+
      "<div class=\"fh-cd-dledrow\"><span class=\"fh-cd-dlab\">POINTS</span><span class=\"fh-cd-pts\">"+
      "<button type=\"button\" data-destiny-step=\"points:-1\" aria-label=\"One Destiny Point less\">−</button>"+
      "<input data-destiny-field=\"points\" type=\"number\" value=\""+state.destiny.points+"\" aria-label=\"Current Destiny Points\">"+
      "<button type=\"button\" data-destiny-step=\"points:1\" aria-label=\"One Destiny Point more\">+</button></span></div>"+
      "<div class=\"fh-cd-dledrow\"><span class=\"fh-cd-dlab\">SCORE</span>"+score+"</div>"+
      DIE_SEQUENCE.map(function(sides){
        var count=state.destiny.dice.filter(function(die){return die.sides===sides&&die.available;}).length;
        return "<div class=\"fh-cd-dpoolrow\"><b>d"+sides+"</b><span class=\"fh-cd-dpoolcount\">"+count+"</span>"+
          "<button type=\"button\" data-destiny-pool=\""+sides+":-1\""+(count?"":" disabled")+" aria-label=\"Remove one Destiny d"+sides+"\">−</button>"+
          "<button type=\"button\" data-destiny-pool=\""+sides+":1\""+(count>=3?" disabled":"")+" aria-label=\"Add one Destiny d"+sides+"\">+</button></div>";
      }).join("")+"</div>":"";
    return "<section class=\"fh-cd-zone fh-cd-band\" data-zone=\"dice-pool\">"+
      "<span class=\"fh-cd-bandledger\">"+
      "<button type=\"button\" class=\"fh-cd-bandpts"+(poolMenuOpen?" is-active":"")+"\" data-destiny-poolmenu aria-haspopup=\"true\" aria-expanded=\""+(poolMenuOpen?"true":"false")+"\""+
      " title=\"Destiny — "+state.destiny.points+" Points on a Score of "+state.destiny.score+" · click to adjust Points, Score and the dice pool\""+
      " aria-label=\"Destiny: "+state.destiny.points+" Points, Score "+state.destiny.score+" — open the Destiny menu\">"+
      sourceGlyphSvg("destiny")+"<b>"+state.destiny.points+"</b><i>/</i><span>"+state.destiny.score+"</span>"+
      (overflow?"<b class=\"fh-cd-overflow\" title=\"Points above your Score\">+"+overflow+"</b>":"")+
      "</button>"+poolMenu+"</span>"+
      "<span class=\"fh-cd-pool\">"+dice+"</span>"+
      "<button type=\"button\" class=\"fh-cd-arcana"+(awakeningOwed()?" is-owed":"")+(arcanaDrawn()?"":" is-empty")+"\" data-arcana-draw"+
      " title=\""+(awakeningOwed()?"An Arcane Awakening is owed — draw your card":arcanaDrawn()?esc(arcana.power||"Your Major Arcana")+" — click to draw a new card":"No Major Arcana yet — click to draw one")+"\">"+
      esc(arcana.name||"Draw an Arcana")+(awakeningOwed()?" ✦":"")+"</button>"+
      "</section>";
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
  /* ── §3 Badges: derived, not emitted ───────────────────────────────
     These thirteen used to be thirteen badges.push(...) calls scattered
     through the render path. That meant every surface RECOMPUTED them, and
     nothing whatsoever guaranteed that the Tray and the Stream said the same
     thing about the same roll.

     A BADGE IS A PROPERTY OF THE ROLL, NOT OF ITS RENDERING. So: a
     declarative condition → badge table, evaluated once on the entry by
     rollBadges, and every surface renders the same list because it reads the
     same list. Same principle as one Console with three field specs — what
     comes from the engine is computed once, what is specific is declared.

     `k` is the visual family (five of them: n20 · chaos · manual · adjusted ·
     destiny) and it also decides `spoiler`, which is carried ON the badge so a
     surface never has to know the families table to hide a result that has not
     been revealed yet. A rule returning "" emits nothing. Order is the reading
     order and is part of the declaration. */
  var ROLL_BADGE_RULES=[
    {id:"natural-20",k:"n20",when:function(e){return e.natural===20;},
      text:function(){return "NATURAL 20";}},
    {id:"natural-1-accepted",k:"chaos",when:function(e){return e.natural===1&&e.natChoice==="accept";},
      text:function(){return "NATURAL 1 accepted";}},
    {id:"fate-refused",k:"chaos",when:function(e){return e.natChoice==="chaos";},
      text:function(){return "Fate refused";}},
    {id:"chaos-roll",k:"chaos",when:function(e){return !!e.chaosRoll;},
      text:function(e){return "Chaos 2d6 = "+(e.chaosRoll[0]+e.chaosRoll[1]);}},
    /* The row the dice landed on, quoted rather than linked — the stream is
       what the player scrolls back through after the session. */
    {id:"chaos-row",k:"chaos",when:function(e){return !!e.chaosRow;},
      text:function(e){return e.chaosRow;}},
    {id:"exhaustion",k:"manual",when:function(e){return !!e.exhaustion;},
      text:function(e){return "Exhaustion "+e.exhaustion+" · −"+e.exhaustion;}},
    {id:"destiny-spend",k:"destiny",when:function(e){return !!e.destiny;},
      text:function(e){
        var spent=e.destiny,change=Number(spent.pointsAfter)-Number(spent.pointsBefore);
        var head=spent.criticalSuccess?"Arcane Critical Success":spent.criticalFailure?"Arcane Critical Failure":"Destiny d"+spent.sides+"="+spent.result;
        return head+(isFinite(change)&&change?" · "+(change>0?"+":"")+change+" pt → "+spent.pointsAfter:"");
      }},
    {id:"arcane-fate-refused",k:"chaos",when:function(e){return !!(e.destiny&&e.destiny.arcaneChoice==="chaos");},
      text:function(e){return "Arcane fate refused · 1 → "+e.destiny.sides;}},
    {id:"overreach",k:"chaos",when:function(e){return !!(e.destiny&&e.destiny.chaos);},
      text:function(e){return "Overreach "+e.destiny.chaos.overreach+" · save DC "+e.destiny.chaos.dc;}},
    {id:"destiny-points",k:"destiny",when:function(e){return !!e.destinyPointChange;},
      text:function(e){return e.destinyPointChange.reason+" · Destiny "+e.destinyPointChange.after;}},
    {id:"awakening",k:"n20",when:function(e){return !!e.awakening;},
      text:function(){return "ARCANE AWAKENING";}},
    {id:"manual",k:"manual",when:function(e){
        return !!e.d20Forced||!!(e.destiny&&e.destiny.forced)||
          entryBonusDice(e).some(function(die){return die.forced;})||
          (e.dice||[]).some(function(die){return die.forced;});
      },text:function(){return "MANUAL";}},
    {id:"adjusted",k:"adjusted",when:function(e){return !!e.adjusted;},
      text:function(){return "adjusted";}}
  ];
  function rollBadges(entry){
    if(!entry)return [];
    var badges=[];
    ROLL_BADGE_RULES.forEach(function(rule){
      if(!rule.when(entry))return;
      var text=rule.text(entry);
      if(text==null||text==="")return;
      badges.push({t:String(text),k:rule.k,id:rule.id,spoiler:!!SPOILER_BADGE_KINDS[rule.k]});
    });
    return badges;
  }
  /* ── §5 Ruling text ────────────────────────────────────────────────
     The line above a resolved roll:

       ARCANE CRITICAL SUCCESS   Destiny d8 rolled 8 · Lost 1 Destiny Point · Current 5

     A verdict, then the ACCOUNT — what was rolled, what it cost, where it
     leaves you. IT IS NEVER FLAVOUR. The name was chosen against "narrative
     text" for exactly that reason: call a field narrative and within months
     someone writes "the blade hisses in the dark" into it, and the day you
     need to check why you lost four Destiny Points the fact is drowned in
     prose. Ruling is the right word because at the table a ruling is what the
     DM decides — here it is what the ENGINE decided, said out loud. It is the
     concrete form of the dock's founding rule, never fall back silently.

     Same discipline as the badges: derived from the entry, never written at
     render time, so every surface says the same thing about the same roll.

     `title` (name + total) is what the heading falls back to when the engine
     decided nothing yet, and it moves into the account when there IS a
     verdict — so the identity of the roll is never lost and never doubled. */
  function rollRuling(entry){
    if(!entry)return {verdict:"",title:"Roll",account:[],display:[]};
    var found=rollVerdict(entry),verdict=found?found.verdict:"";
    var title=(entry.name||"Roll")+(entry.total==null?"":" "+entry.total);
    var head=verdict?[title]:[];
    /* The per-die enumeration ("d6 5 · d6 2 · …") lives in `account` — the
       FULL record, for the Stream and the hover title. It is condemned on
       screen (Eric, lot texte T1: the dice speak for themselves), so
       `display` is the same account WITHOUT it: title-fallback, what it
       cost, where it leaves you, the DC. On-screen surfaces read display;
       the record keeps account. */
    var parts=[];
    rollParts(entry).forEach(function(part){parts.push(part.k+" "+part.v);});
    /* What it cost, stated in points rather than left for the player to
       subtract two badges from each other. */
    var tail=[];
    var spent=entry.destiny;
    if(spent){
      var change=Number(spent.pointsAfter)-Number(spent.pointsBefore);
      if(isFinite(change)&&change){
        var moved=Math.abs(change);
        tail.push((change<0?"Lost ":"Gained ")+moved+" Destiny Point"+(moved===1?"":"s"));
        tail.push("Current "+spent.pointsAfter);
      }
    }
    if(entry.destinyPointChange)tail.push(entry.destinyPointChange.reason+" · Destiny "+entry.destinyPointChange.after);
    if(rollHasDc(entry)&&entry.dc!=null)tail.push("DC "+entry.dc);
    return {verdict:verdict,title:title,account:head.concat(parts,tail),display:head.concat(tail)};
  }
  /* The one derivation every surface calls. Badges and Ruling come off the
     same entry in the same pass, so a surface cannot read one without the
     other and cannot compute either for itself. */
  function rollVocabulary(entry){
    var ruling=rollRuling(entry);
    return {badges:rollBadges(entry),ruling:ruling,verdict:ruling.verdict};
  }
  /* The dice of a roll, flattened for the wire. Additive on fh-roll/1: the
     Dice Tray is the table's shared surface, so another player's dock draws
     these instead of guessing dice out of the display strings in `parts`.
     Old events simply lack the field and their lines render without dice —
     graceful degradation, the bridge's own contract. */
  function rollExportDice(entry){
    return trayDiceFromEntry(entry).map(function(die){
      return {sides:die.sides||null,result:die.result==null?null:Number(die.result),
        label:die.label||"",role:die.kind==="modifier"?"modifier":(die.dieRole||"base"),
        source:die.sourceIcon||"",dropped:!!die.dropped,colour:die.colour||"",tone:die.tone||"",
        special:die.special||""};
    });
  }
  function rollExport(entry){
    return {schema:"fh-roll/1",id:entry.id,ts:entry.createdAt,campaign:state.code,
      character:state.character&&state.character.name||state.pseudo,kind:entry.kind,title:entry.name,
      ability:entry.ability||null,total:entry.total,dc:entry.dc===""||entry.dc==null?null:Number(entry.dc),
      outcome:entry.outcome||null,natural:entry.natural==null?null:entry.natural,
      bonus:entry.kind==="d20"?Number(entry.baseBonus)||0:null,
      parts:rollParts(entry),badges:rollBadges(entry).map(function(badge){return badge.t;}),
      dice:rollExportDice(entry)};
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
  var FEED_MAX=60,FEED_LOOKBACK=5000;
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
    // Recorded optimistically, before the network result is known, so a
    // second synchronous call for this same still-unchanged entry (the next
    // render pass, before the first request even settles) never fires a
    // duplicate POST for the same revision.
    state.feed.sent[entry.id]={signature:signature,rev:rev};
    var body={id:uuid(),type:"roll",rollId:entry.id,rev:rev,
      actor:{pseudo:state.pseudo,character:state.character&&state.character.name||state.pseudo,
        ddbCharacterId:state.profile&&state.profile.characterId||null},
      display:rollExport(entry),intent:intentFor(entry)};
    var sent=state.feed.tableState==="live"?tablePost(body):post("/feed/"+encodeURIComponent(state.code),body);
    sent.then(function(){
      setFeedStatus("");
    }).catch(function(){
      // The send did not land. Un-claim it — unless a newer call has already
      // moved the record on — so the next broadcastEntry for this same entry
      // retries instead of believing the table already saw it.
      var current=state.feed.sent[entry.id];
      if(current&&current.signature===signature&&current.rev===rev)delete state.feed.sent[entry.id];
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
      var changed=feedMerge(events);
      if(state.feed.status==="offline"){state.feed.status="";changed=true;}
      if(changed)renderFeedZone();
    }).catch(function(){setFeedStatus("offline");});
  }
  /* KV list() is the one metered resource here (plan §13.9 fix 1 — the
     2026-07-30 outage), so RECENT is never polled on a timer. It reads the
     cloud backstop once when a player opens the TABLE tab, once again on any
     transition into RECENT (a table going offline shouldn't leave the view
     stuck on stale data), and otherwise only on an explicit refresh. It is
     also the honest cadence: the cloud feed is itself ~30s stale (plan
     §11.4), so polling it every few seconds was never buying freshness. */
  function refreshFeed(){
    if(!feedActive()||state.feed.tableState!=="recent")return;
    pollFeed();
  }
  function setTableState(next){
    if(state.feed.tableState===next)return;
    state.feed.tableState=next;
    renderFeedZone();
    if(next==="recent"&&state.streamView==="table")refreshFeed();
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
    disconnectTableWs();
    if(state.feed.rendezvousTimer){clearTimeout(state.feed.rendezvousTimer);state.feed.rendezvousTimer=null;}
    state.feed.events=[];state.feed.seen={};state.feed.sent={};state.feed.cursor="";state.feed.wsCursor="";
    state.feed.tableUrl="";state.feed.tableState="recent";state.feed.wsRetry=0;
    try{state.feed.manualUrl=localStorage.getItem(manualTableKey(state.code))||"";}catch(e){state.feed.manualUrl="";}
    state.feed.status="";
    /* The backstop still loads exactly ONCE and never on a timer (§13.9) —
       but the trigger moved: the Dice Tray is the shared surface now and it
       is persistent, so "the player opens the TABLE tab" became "the
       character loads". Same single list() as before, new doorway. Refresh
       stays the only way to a newer cloud log. */
    if(feedActive()){rendezvousTick();refreshFeed();}
  }
  function stopFeed(){
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
    /* The badge carries its own `spoiler` (§3), so this surface hides a result
       the dice have not revealed yet without holding a second copy of which
       families are spoilers. */
    var badges=rollVocabulary(entry).badges.filter(function(badge){return !(quiet&&badge.spoiler);})
      .map(function(badge){return "<span class=\"fh-cd-badge is-"+badge.k+"\">"+esc(badge.t)+"</span>";}).join("");
    var reopen=entry.kind==="d20";
    return "<li class=\"fh-cd-sentry\"><button type=\"button\""+(reopen?" data-history-id=\""+esc(entry.id)+"\"":" disabled")+" data-roll='"+attrJson(rollExport(entry))+"'>"+
      "<span class=\"fh-cd-sl1\"><time>"+nowLabel(entry.createdAt)+"</time><span class=\"fh-cd-who\">"+esc(who)+"</span>"+
      "<span class=\"fh-cd-title\">"+esc(entry.name)+"</span><span class=\"fh-cd-total is-"+(quiet?"quiet":tone)+"\">"+(quiet?"…":entry.total)+"</span><span class=\"fh-cd-oic\">"+(quiet?"":icon)+"</span></span>"+
      "<span class=\"fh-cd-sl2\">"+parts+dc+badges+"</span></button></li>";
  }
  /* ── The Dice Tray (zone 9) — the table's shared surface ──────────
     Extracted from the roller. Shape ruled by Eric 2026-08-03: TEN rolls,
     each line THREE spaces left to right with nothing said twice — the
     name in full (no portrait, no visible time; the time surfaces on
     hover), then the dice each carrying their full wrapper (source token /
     die / label), then the ruling on three tiers: the roll's name in bold,
     the total (with NATURAL 20/1 beside it), and the ruling itself,
     abridged when long. The newest roll's dice land LARGE; the three
     under it are small but still able to roll — simultaneous landings
     must be seen — and below those the Static Area freezes everything as
     bitmap snapshots (no live WebGL context: the ~16-context browser cap,
     already paid for once by the picker). Beyond ten rolls, the Stream
     keeps the record — or AboveVTT's own log does.

     Your roll, the party's and the DM's land in the same list: you never
     navigate to see what someone else rolled. So the tray inherits the
     three feed states — LIVE / RECENT / OFF — and the founding rule,
     never fall back silently: an unreachable table is written on the cap
     in plain words, not folded into a quieter caption. */
  function feedLineDice(event){
    var display=event&&event.display||{};
    if(!Array.isArray(display.dice))return [];
    return display.dice.map(function(die){
      var wire=die||{};
      var shaped={sides:wire.sides,result:wire.result,label:wire.label||(wire.sides?"d"+wire.sides:"Bonus"),
        sourceIcon:wire.source||"",dropped:!!wire.dropped,colour:wire.colour||"",tone:wire.tone||"",
        special:wire.special||""};
      if(wire.role==="modifier")shaped.kind="modifier";
      else shaped.dieRole=wire.role||"base";
      return shaped;
    });
  }
  /* Mine from history, everyone else from the feed, one list newest-first.
     My own rolls echo back through the feed too; the history copy is the
     richer one (it can reopen, its dice carry handles), so the echo is
     dropped rather than shown twice. */
  function trayLines(){
    var lines=[];
    state.history.slice(0,TRAY_MAX).forEach(function(entry){
      lines.push({kind:"mine",id:entry.id,ts:entry.createdAt||"",entry:entry});
    });
    var mineIds={};state.history.forEach(function(entry){mineIds[entry.id]=1;});
    state.feed.events.forEach(function(event){
      if(!event||event.type&&event.type!=="roll")return;
      if(event.actor&&event.actor.pseudo===state.pseudo)return;
      var key=String(event.rollId||event.id);
      if(mineIds[key])return;
      lines.push({kind:"feed",id:key,ts:event.ts||"",event:event});
    });
    /* A resurfaced roll (surfaceTrayLine — kept machinery, awaiting its
       eye icon; the reading glass that first carried the gesture is gone,
       Eric 2026-08-05) rides the moment it was called back up, not the
       moment it was rolled: it climbs to line 1 NOW, and the next real
       roll lands above it naturally. Display order only — createdAt, the
       wire and the Stream keep the true time. */
    lines.forEach(function(line){if(line.id===state.traySurfaceId&&state.traySurfaceAt)line.ts=state.traySurfaceAt;});
    lines.sort(function(a,b){return String(b.ts).localeCompare(String(a.ts));});
    return lines.slice(0,TRAY_MAX);
  }
  function surfaceTrayLine(id){
    if(!id)return;
    state.traySurfaceId=id;state.traySurfaceAt=new Date().toISOString();
    /* M3 (Eric, 2026-08-06): the climb must be SEEN. Two one-shot flags,
       each consumed by the next pass that honours it:
       — trayScrollToTop: the registre scrolls back to its top so the line
         that just moved to line 1 is actually in view (clicking from the
         10th roll used to leave the viewport at the bottom, the climb
         happening entirely above the fold). Consumed by render()'s scroll
         restore — it is a USER gesture, so it replaces the remembered
         position rather than fighting it.
       — traySurfaceFlash: the line announces itself once — is-surfaced, a
         brief liseré that plays on the first render after the climb and is
         not re-applied by later renders (so a feed poll cannot restart it;
         under prefers-reduced-motion the CSS keeps a static liseré instead,
         which the next render then clears). Consumed by diceTrayInner. */
    state.traySurfaceFlash=true;state.trayScrollToTop=true;
    render();
  }
  function trayBadgeChip(kindClass,text){
    return "<span class=\"fh-cd-badge is-"+esc(kindClass)+"\">"+esc(text)+"</span>";
  }
  /* The right-hand space: three tiers, nothing repeated from the other two
     spaces. Tier 3 is the Ruling wearing the same authority rule as the old
     frame: the oxblood verdict class lands only when the text IS the derived
     verdict — a Chaos prompt written into the same slot gets neither. */
  /* The line's two flanks (Eric, 2026-08-03, third fitting): the LEFT
     speaks — the verdict, what Fate said about this roll ("CRITICAL
     SUCCESS", "Fate accepted"), badges beside it — and the RIGHT
     identifies: the roll's name in bold over its total ("Arcana +5 / 24"),
     the account small under both. Nothing said twice; the dice keep the
     middle. */
  function trayLineSides(slot,quiet){
    var left="",right="";
    if(slot.kind==="feed"){
      var display=slot.event.display||{},tone=feedTone(display);
      /* T8 (Eric): a badge that restates the outcome word for word is the
         doublon — one line says it. Case-insensitive equality only; the
         wire and the Stream keep the full badge list. */
      var badges=(display.badges||[]).map(String).filter(function(text){
        return !display.outcome||text.toLowerCase()!==String(display.outcome).toLowerCase();});
      var natTexts=badges.filter(function(text){return /^NATURAL (20|1)\b|^ARCANE AWAKENING/i.test(text);});
      var rest=badges.filter(function(text){return natTexts.indexOf(text)<0;});
      left=(display.outcome?"<b class=\"fh-cd-tray-outcome is-"+(tone||"none")+"\">"+esc(display.outcome)+"</b>":"")+
        natTexts.map(function(text){return trayBadgeChip("n20",text);}).join("")+
        rest.map(function(text){return trayBadgeChip("adjusted",text);}).join("");
      /* T11: the CSS was already hiding the right flank's account — stop
         generating it. The hover keeps it: the total carries the title. */
      right="<b class=\"fh-cd-tray-title\">"+esc(String(display.title||"Roll")+(display.bonus!=null?" "+signed(display.bonus):""))+"</b>"+
        "<span class=\"fh-cd-tray-total is-"+(tone||"none")+"\""+(display.dc!=null?" title=\"vs DC "+esc(display.dc)+"\"":"")+">"+esc(display.total!=null?display.total:"—")+"</span>";
    }else if(slot.entry&&(slot.kind==="mine"||slot.structured)){
      var entry=slot.entry,vocab=rollVocabulary(entry),ruling=vocab.ruling,tone2=outcomeTone(entry);
      /* Quiet hides what the dice have not revealed — never what the player
         already knew: MANUAL and adjusted describe the roll's construction
         and stay visible while it rolls, exactly as the Stream always did. */
      /* T7 (Eric): the NATURAL 20 chip under the NATURAL 20 verdict was two
         lines for one fact. A badge whose text IS the verdict (case-
         insensitive) yields to it; ROLL_BADGE_RULES and the export are
         untouched — this is a surface filter, the Stream still says both. */
      var kept=vocab.badges.filter(function(badge){return !(quiet&&badge.spoiler)&&
        !(ruling.verdict&&badge.t.toLowerCase()===ruling.verdict.toLowerCase());});
      left=(quiet?"<em class=\"fh-cd-tray-account\">Rolling…</em>"
          :ruling.verdict?"<b class=\"fh-cd-tray-verdict\">"+esc(ruling.verdict)+"</b>":"")+
        kept.map(function(badge){return trayBadgeChip(badge.k,badge.t);}).join("");
      /* The live hand keeps trayResultText (it carries the open-roll status,
         staged-dice count included); a settled history line re-derives the
         account so it can never go stale. */
      var account=quiet?"":(slot.kind==="live"?state.trayResultText:ruling.account.join(" · "));
      /* T11: those two <em> were display:none on the carpet — dead text in
         every line's DOM. The account (full record, T1) and the DC now ride
         the total's hover title instead of being generated then hidden. */
      var hover=[account,(!quiet&&entry.dc!==""&&entry.dc!=null)?"vs DC "+entry.dc:""].filter(Boolean).join(" · ");
      right="<b class=\"fh-cd-tray-title\">"+esc(String(entry.name||"Roll")+(entry.kind==="d20"&&isFinite(Number(entry.baseBonus))?" "+signed(entry.baseBonus):""))+"</b>"+
        "<span class=\"fh-cd-tray-total is-"+(quiet?"quiet":(tone2||"none"))+"\""+(hover?" title=\""+esc(hover)+"\"":"")+">"+(quiet?"…":esc(entry.total))+"</span>";
    }else{
      /* A prompt that overwrote the tray fields while dice are engaged
         ("Chaos" · "Roll 2d6 and read the Chaos table"). Raw fields, verdict
         classes only by equality — never by flag. */
      var heading=quiet&&state.trayQuietTitle?state.trayQuietTitle:state.trayTitle;
      var detail=quiet?"Rolling…":state.trayResultText;
      var isRuling=!quiet&&!!state.trayVerdict&&heading===state.trayVerdict;
      /* T11: the detail's <em> was hidden on the carpet too — it rides the
         heading's hover title now, nothing dead in the DOM. */
      left="<b"+(isRuling?" class=\"fh-cd-tray-verdict\"":" class=\"fh-cd-tray-heading\"")+(detail?" title=\""+esc(detail)+"\"":"")+">"+esc(heading||"Dice Tray")+"</b>";
      right="";
    }
    return {left:left,right:right};
  }
  function trayLineHtml(slot,index,flags,quiet){
    var sizeClass=index===0?"is-l1":index<4?"is-mid":"is-static";
    var realDice=slot.dice.filter(function(die){return die.kind!=="modifier";}).length;
    /* The ratified grid (Eric, lot BACKLOG-B 2026-08-05) — ONE law for
       every line, L1 included, because every band is the same 56 now:
         1-5   a skill hand: the wrapper stays, 38px WITH its label
               (Bardic, Guidance…) — 38 + one label line ≈ 48, inside
               the band's content;
         6-10  one row of naked dice, 30 down to 20 as the crowd grows;
         11-20 two rows of exactly ten at 20px (2×20 + gap ≈ 49);
         21-30 three rows of ten at 20px — the one case that deepens
               the line (is-deep, 72);
         31+   the ∞ holds the zone, unchanged.
       20px is the FLOOR of the rows because the floor is the numeral:
       ~11px of digit at 20 reads, ~8px at the old 16 was texture. Roll
       size EQUALS settle size for the same reason — a row may never dip
       under 20 and a single row already sits at its legible size — so
       roll-small-stop-zoom collapses to a straight tumble; the wave and
       settle machinery stays (rows still land ten by ten under the
       ~16-context cap, and the settled die is still reborn a snapshot). */
    var swarm=realDice>5;
    var infinite=realDice>30;
    var rows=realDice>10&&!infinite;
    var waved=rows;
    var settlePx=rows?TRAY_DIE_ROW:swarm?Math.round(30-2.5*(realDice-6)):TRAY_DIE_SKILL;
    var rollPx=settlePx;
    var sizePx=swarm?rollPx:TRAY_DIE_SKILL;
    var snapshot=index>=4;
    var readOnly=slot.kind==="feed";
    var who=slot.kind==="feed"
      ? (slot.event.actor&&(slot.event.actor.character||slot.event.actor.pseudo)||"—")
      : (state.character&&state.character.name||state.pseudo||"Character");
    var ts=slot.kind==="feed"?slot.ts:(slot.entry&&slot.entry.createdAt||"");
    var time=ts?nowLabel(ts):"";
    var diceHtml=infinite
      ? "<b class=\"fh-cd-tray-inf\" title=\""+realDice+" dice — the full account is in the Stream\">∞</b>"
      : slot.dice.map(function(die,di){
      /* noLabel follows the grid, not T9 any more: a 1-5 skill hand keeps
         its labels (Bardic, Guidance… — ratifié 2026-08-05); a swarm die
         never had one to lose. And now that lines 2-4 can carry WRAPPED
         dice (they were always naked before), they take the same
         zero-context law the naked path already lives by: a die merely
         re-rendered down there is born a snapshot; only a die landing
         THIS pass animates as a live host — otherwise four lines of five
         wrapped dice could claim 20 of the ~16 WebGL contexts. */
      var landingNow=!!(flags&&flags[di]);
      /* M3c: the one die the climb was FOR keeps a small persistent mark, so
         it can be found again in a crowd once the line sits on top. */
      var picked=!!(state.traySurfaceDie&&state.traySurfaceDie.lineId===slot.id&&Number(state.traySurfaceDie.di)===di);
      return visualDie(die,di,slot.dice.length,landingNow,
        {sizePx:sizePx,snapshot:(snapshot||(index>0&&!swarm&&!landingNow))&&!die.pending,readOnly:readOnly,plainLabel:true,noLabel:swarm,naked:swarm,
         rollSizePx:rollPx,settleSizePx:settlePx,picked:picked,
         wave:swarm&&waved?Math.floor(di/10):null,waveIndex:swarm?di%10:null});
    }).join("");
    var reopen=slot.kind==="mine"&&slot.entry&&slot.entry.kind==="d20";
    /* The who is a CHIP, not a column (Eric, 2026-08-03: "faut gagner de la
       place à gauche"): my own face, zoomed — or two letters when there is
       no portrait, and always two letters for the table (the wire carries no
       avatar). The full name and the time surface on hover, and ride the
       title attribute for touch. */
    /* "Ha" for Harness, "BI" for Brakka Ironmaw: one word lends two letters,
       two words lend their initials. */
    var whoWords=String(who).trim().split(/\s+/).filter(Boolean);
    var initials=whoWords.length>1
      ? whoWords.slice(0,2).map(function(word){return word.charAt(0);}).join("").toUpperCase()
      : (whoWords[0]||"?").slice(0,2);
    var portrait=slot.kind==="feed"?"":portraitFor(state.character||{});
    var chip=(portrait?"<img src=\""+esc(portrait)+"\" alt=\"\" onerror=\"this.parentNode.classList.add('is-noimg')\">":"")+
      "<i class=\"fh-cd-tray-initials\">"+esc(initials)+"</i>";
    var hoverText=who+(time?" · "+time:"");
    var whoHtml="<span class=\"fh-cd-tray-who"+(portrait?"":" is-noimg")+"\" title=\""+esc(hoverText)+"\">"+
      (reopen?"<button type=\"button\" data-history-id=\""+esc(slot.entry.id)+"\" aria-label=\""+esc(who)+" — reopen this roll\">"+chip+"</button>":"<b aria-label=\""+esc(who)+"\">"+chip+"</b>")+
      "<i class=\"fh-cd-tray-name\">"+esc(hoverText)+"</i></span>";
    var sides=trayLineSides(slot,quiet);
    var row="<span class=\"fh-cd-tray-left\">"+whoHtml+"<span class=\"fh-cd-tray-speak\">"+sides.left+"</span></span>"+
      "<span class=\"fh-cd-tray-dice"+(swarm&&!infinite?" is-swarm":"")+(rows?" is-rows":"")+(infinite?" is-infinite":"")+"\""+
        (swarm&&!infinite?" style=\"--fh-cd-tray-die-size:"+settlePx+"px\"":"")+">"+diceHtml+"</span>"+
      "<span class=\"fh-cd-tray-right\">"+sides.right+"</span>";
    /* The live hand keeps the frame — and with it the mood streaks that say
       what the table still owes. History and feed lines carry no frame: a
       debt belongs to the moment, not to the registre under it. */
    if(slot.kind==="live"){
      var mood=frameMood();
      row="<div class=\"fh-cd-frame is-trayhand"+(mood?" mood-"+mood:"")+"\">"+row+"</div>";
    }
    /* 21-30 dice need three rows of ten at 20px — the ONE case that grows
       a line past the 56px nominal (to 72; règle Eric, lot BACKLOG-B
       2026-08-05). Past 30 the ∞ takes over and the line stays nominal. */
    var deep=realDice>20&&!infinite;
    /* M3b: the line that just climbed announces itself — once. The flag is
       consumed by diceTrayInner after this pass, so later renders (feed
       polls land every few seconds) never restart the liseré. */
    var surfaced=!!(state.traySurfaceFlash&&slot.id===state.traySurfaceId&&slot.kind!=="live");
    return "<li class=\"fh-cd-trayline "+sizeClass+(deep?" is-deep":"")+(slot.kind==="feed"?" is-feed":" is-mine")+(slot.kind==="live"?" is-livehand":"")+(surfaced?" is-surfaced":"")+"\" data-tray-line=\""+esc(slot.id)+"\">"+row+"</li>";
  }
  /* The three feed states, one derivation (T24): the tray cap's chip title
     and the Stream's cap read the SAME phrases instead of each keeping a
     copy. Never fall back silently: the state is always shown — by the chip;
     what moved to hover is only the paraphrase (T15). */
  function feedStatusCaption(ts,offline){
    return offline?"not reaching the table"
      :ts==="live"?"every roll at the table, live"
      :"no live table — cloud log, about 30s behind";
  }
  function diceTrayInner(){
    var ts=state.feed.tableState,offline=ts==="off"||state.feed.status==="offline";
    var caption=feedStatusCaption(ts,offline);
    var manual=feedActive()&&ts!=="live"
      ? "<button type=\"button\" class=\"fh-cd-tableurl\" data-table-url-set title=\"Paste the DM's table URL\">"+(state.feed.manualUrl?"URL set":"URL…")+"</button>":"";
    var refresh=feedActive()&&ts==="recent"&&!offline
      ? "<button type=\"button\" class=\"fh-cd-refresh\" data-feed-refresh title=\"Check the cloud log now\">Refresh</button>":"";
    /* The cap slimmed down (lot texte, D4 tranchée) : the DICE TRAY word is
       gone (T14 — the dice say it), the verbose status rides the chip's
       hover title (T15 — OFF stays loud through the chip itself), URL… and
       Refresh live behind the cap's ⋮ (T17), and CLEAR TRAY is the small ×
       at the cap's right edge (T19/D4) — same behaviour, same
       rollTransactionActive guard it had in the console. */
    var capMenu="";
    if(manual||refresh){
      var capMenuOpen=!!state.trayCapMenu;
      capMenu="<span class=\"fh-cd-cmenuwrap\"><button type=\"button\" class=\"fh-cd-dmenu is-capmenu"+(capMenuOpen?" is-active":"")+"\" data-tray-capmenu aria-haspopup=\"true\" aria-expanded=\""+(capMenuOpen?"true":"false")+"\" aria-label=\"Table feed options\">"+glyph("dots")+"</button>"+
        (capMenuOpen?"<div class=\"fh-cd-cmenu is-traycap\">"+
          (manual?"<div class=\"fh-cd-cmenurow is-traycap\">"+manual+"</div>":"")+
          (refresh?"<div class=\"fh-cd-cmenurow is-traycap\">"+refresh+"</div>":"")+"</div>":"")+"</span>";
    }
    var busy=rollTransactionActive();
    var clear="<button type=\"button\" class=\"fh-cd-trayclear\" data-clear-tray"+(busy?" disabled":"")+
      " title=\""+(busy?"Answer the question above the dice first":"Clear tray")+"\" aria-label=\"Clear tray\">"+iconSvg("close")+"</button>";
    var cap="<div class=\"fh-cd-cap\">"+
      "<span class=\"fh-cd-traystate is-"+(offline?"off":ts)+"\" title=\""+esc(caption)+"\">"+(offline?"OFF":ts==="live"?"LIVE":"RECENT")+"</span>"+
      (feedActive()?"":"<small>your rolls — load a character to join the table</small>")+
      "<span class=\"fh-cd-capacts\">"+capMenu+clear+"</span></div>";
    /* The live hand is the top line — but only once it has LANDED something.
       A hand still being assembled (every die pending, no entry) belongs to
       the Roll Builder, and renders in the roller's assembly frame instead:
       the tray shows rolls, the builder shows intentions (Eric, 2026-08-03 —
       "tu ne distingues pas le Dice Builder du Dice Tray ?"). The settled
       entry the hand points at is excluded from the merged list below so the
       same roll never appears twice. */
    var live=trayDiceForDisplay();
    /* Same law as the judgment frame's `assembling` (R1): a coin's result is
       its face, not a landing — only a real die decides the hand is engaged. */
    var engaged=live.some(function(die){return die.kind!=="modifier"&&die.result!=null;});
    var liveEntry=null;
    if(live.length&&engaged){
      liveEntry=openEntry();
      if(!liveEntry)for(var i=0;i<live.length&&!liveEntry;i++)if(live[i].entryId)liveEntry=entryById(live[i].entryId);
    }
    var slots=[];
    if(live.length&&engaged){
      var ruling=liveEntry?rollRuling(liveEntry):null;
      slots.push({kind:"live",id:liveEntry?liveEntry.id:"live",entry:liveEntry,dice:live,
        structured:!!(ruling&&(state.trayTitle===ruling.verdict||state.trayTitle===ruling.title))});
    }
    trayLines().forEach(function(line){
      if(liveEntry&&line.kind==="mine"&&line.entry.id===liveEntry.id)return;
      line.dice=line.kind==="mine"?trayDiceFromEntry(line.entry):feedLineDice(line.event);
      slots.push(line);
    });
    slots=slots.slice(0,TRAY_MAX);
    /* Per-die animation identity, prefixed by the line so two lines can hold
       the same die shape without stealing each other's landings. Only the
       first four lines may animate; the Static Area never does. */
    var previous=state.diceSignatures||{},signatures={},liveAnimated=0;
    slots.forEach(function(slot){
      slot.dice.forEach(function(die,di){
        signatures[slot.id+"§"+dieAnimationKey(die,di)]=die.result==null?"?":String(die.result);
      });
    });
    var flags=slots.map(function(slot,si){
      /* The reveal is timed on the dice that will actually animate — the
         coins never roll, and past 30 real dice nothing renders at all
         (armTrayReveal's own ∞ gate reads this same count). */
      var real=slot.dice.filter(function(die){return die.kind!=="modifier";}).length;
      return slot.dice.map(function(die,di){
        if(si>=4)return false;
        var key=slot.id+"§"+dieAnimationKey(die,di);
        var moved=die.result!=null&&previous[key]!==signatures[key];
        if(moved&&slot.kind==="live")liveAnimated=real;
        return moved;
      });
    });
    state.diceSignatures=signatures;
    /* Only my own landing holds its answer back — the reveal machinery keeps
       the total quiet until the dice stop. A feed roll was revealed on the
       dock that rolled it. */
    if(liveAnimated)armTrayReveal(liveAnimated);
    var quiet=trayRevealPending();
    var list=slots.length
      ? slots.map(function(slot,si){return trayLineHtml(slot,si,flags[si],quiet&&si===0&&slot.kind==="live");}).join("")
      : "<li class=\"fh-cd-trayline is-empty\"><em>Ready — click a skill, a save or an ability.</em></li>";
    /* The scroll arrows (Eric's héritage n°4, and the bug behind it: ~350px
       of rolls hide below the fold with NO affordance — "les dés dépassent
       sous les bords"). Two thin chevrons on the list's edges, each only
       shown when there is something on its side (syncTrayArrows toggles
       is-can-up/down on the zone), one click = one band of scroll. */
    var chevron=function(up){return "<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\""+(up?"M3 10l5-5 5 5":"M3 6l5 5 5-5")+"\"/></svg>";};
    var arrows="<button type=\"button\" class=\"fh-cd-trayarrow is-up\" data-tray-scroll=\"up\" aria-label=\"Scroll to newer rolls\">"+chevron(true)+"</button>"+
      "<button type=\"button\" class=\"fh-cd-trayarrow is-down\" data-tray-scroll=\"down\" aria-label=\"Scroll to older rolls\">"+chevron(false)+"</button>";
    // M3b: the announcement played this pass — it must not replay on the next.
    state.traySurfaceFlash=false;
    return cap+"<ul class=\"fh-cd-traylist\">"+list+"</ul>"+arrows;
  }
  /* Shown only where useful: up when something is newer above, down when
     rolls hide below the fold. Rides the zone so the arrows survive the
     list's own re-scrolls without re-rendering anything. */
  /* M3a's glide. Native scrollTo({behavior:"smooth"}) proved INERT on the
     reborn traylist at the bench (measured: scrollTop pinned across a full
     second), so the glide is driven by hand — ~240ms ease-out cubic on rAF,
     from the restored position down to 0. If a later render rebuilds the
     list mid-glide, the dead node's frame stops itself (isConnected) and
     that render read the live mid-glide scrollTop as the position to keep —
     the two mechanisms read/write the same live value, never fight. */
  function smoothTrayScrollTop(node,from){
    node.scrollTop=from;
    if(!window.requestAnimationFrame){node.scrollTop=0;syncTrayArrows();return;}
    var start=null,DURATION=240;
    function step(ts){
      if(!node.isConnected)return;
      if(start==null)start=ts;
      var k=Math.min(1,(ts-start)/DURATION);
      node.scrollTop=from*Math.pow(1-k,3);
      if(k<1)window.requestAnimationFrame(step);else syncTrayArrows();
    }
    window.requestAnimationFrame(step);
  }
  function syncTrayArrows(){
    if(!root)return;
    var zone=root.querySelector(".fh-cd-dicetray"),list=root.querySelector(".fh-cd-traylist");
    if(!zone||!list)return;
    zone.classList.toggle("is-can-up",list.scrollTop>2);
    zone.classList.toggle("is-can-down",list.scrollTop<list.scrollHeight-list.clientHeight-2);
  }
  function renderDiceTray(){
    return "<section class=\"fh-cd-zone fh-cd-dicetray\" data-zone=\"dice-tray\">"+diceTrayInner()+"</section>";
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
    /* One derivation with the tray cap (T24) — no second copy of the three
       phrases — and the same T15 treatment: the caption rides the tabs'
       hover titles, the tab's own colour (is-live / is-off) stays the loud
       part. */
    var tableClass=(table?"is-on":"")+(offline?" is-off":ts==="live"?" is-live":"");
    // The manual override (plan §12.4's escape hatch): only offered when
    // there is a reason to reach for it — a table is not already live.
    var manual=table&&ts!=="live"
      ? "<button type=\"button\" class=\"fh-cd-tableurl\" data-table-url-set title=\"Paste the DM's table URL\">"+(state.feed.manualUrl?"URL set":"URL…")+"</button>"
      : "";
    // RECENT is not polled (plan §13.9 fix 1) — this is the only way to
    // pull a newer cloud log short of leaving and reopening the tab.
    var refresh=table&&ts==="recent"
      ? "<button type=\"button\" class=\"fh-cd-refresh\" data-feed-refresh title=\"Check the cloud log now\">Refresh</button>"
      : "";
    var cap="<div class=\"fh-cd-cap\">"+(table?"TABLE":"STREAM")+"<small></small>"+manual+refresh+
      "<span class=\"fh-cd-streamtabs\">"+
      "<button type=\"button\" data-stream-view=\"mine\" class=\""+(table?"":"is-on")+"\" title=\"every roll, fully resolved\">Mine</button>"+
      "<button type=\"button\" data-stream-view=\"table\" class=\""+tableClass+"\" title=\""+esc(feedStatusCaption(ts,offline))+"\">Table</button></span>"+
      "<button type=\"button\" class=\"fh-cd-streamclose\" data-stream-toggle aria-label=\"Close the stream\" title=\"Close\">"+iconSvg("close")+"</button></div>";
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
    /* The Dice Tray is the shared surface, so a feed event repaints it first
       — same targeted-swap rule as the stream: never a full render() on a
       poll, and only when the markup actually moved. The remount is what
       makes freshly merged dice animate (their signatures are new), and the
       generator release right after is the snapshot pattern's contract. */
    var tray=root.querySelector("[data-zone=\"dice-tray\"]");
    if(tray){
      var nextTray=diceTrayInner();
      if(tray.innerHTML!==nextTray){
        tray.innerHTML=nextTray;
        if(window.FHStaticDice&&window.FHStaticDice.mount)window.FHStaticDice.mount(tray);
        if(window.FHStaticDice&&window.FHStaticDice.releasePickerContext)window.FHStaticDice.releasePickerContext();
      }
    }
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
    /* The console has no head at all now, loaded check or free roll: the tray
       right below already names what is being rolled, so anything here was
       saying it twice. The check's ✕ went with it and is not missed -- it only
       ever called clearDiceTray, which is what CLEAR TRAY and Escape do, and
       both of those refuse mid-transaction where the ✕ did not.
       NOTE: the free roll's naming field went too. state.trayLabel still names
       free rolls (it persists, and the read at roll time is guarded), but until
       that field reappears in the tray's legend it cannot be edited. */
    var head="";
    /* Row 1 is what a check is rolled WITH: its mode, the fixed +2, the ⋮ (MOD
       and DC, set once and tucked away rather than sitting in the row), and
       the white dice.
       Round 8: D, A and +2 are three independent toggles now, not a single-
       selection segment -- left OR right click lights one on, which turns any
       other of the three off (all off = flat). See toggleRollMode(). The ⋮
       used to lead the white dice row; it sits here now, right after +2. */
    var row1="";
    if(cfg){
      row1="<div class=\"fh-cd-crow fh-cd-consolerow\">"+
        "<span class=\"fh-cd-leadcol\">"+
        "<button type=\"button\" class=\"fh-cd-toggle is-d"+(cfg.d20Mode==="disadvantage"?" is-on":"")+"\" data-die-mode=\"disadvantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" title=\"Disadvantage · left or right click to toggle\" aria-label=\"Disadvantage\" aria-pressed=\""+(cfg.d20Mode==="disadvantage"?"true":"false")+"\">D</button>"+
        "<button type=\"button\" class=\"fh-cd-toggle is-a"+(cfg.d20Mode==="advantage"?" is-on":"")+"\" data-die-mode=\"advantage\" data-die-scope=\"d20\""+(locked?" disabled":"")+" title=\"Advantage · left or right click to toggle\" aria-label=\"Advantage\" aria-pressed=\""+(cfg.d20Mode==="advantage"?"true":"false")+"\">A</button>"+
        "<button type=\"button\" id=\"fhPsPlusTwo\" class=\"fh-cd-toggle is-plus2"+(cfg.plusTwo?" is-on":"")+"\""+(locked?" disabled":"")+" title=\"Fixed Fate's Hand +2 · left or right click to toggle\" aria-label=\"Fate's Hand plus two\" aria-pressed=\""+(cfg.plusTwo?"true":"false")+"\">+2</button>"+
        "</span>"+
        renderConsoleMenu(cfg)+
        renderWhiteDice(cfg)+"</div>";
    }else{
      row1="<div class=\"fh-cd-crow fh-cd-consolerow is-free\"><span class=\"fh-cd-leadcol\"></span>"+renderConsoleMenu(null)+renderWhiteDice(null)+"</div>";
    }
    // The FINE TUNE drawer is gone: a Portent belongs to one die, so it lives in
    // that die's own right-click menu rather than in a console-wide panel.
    /* The cap row is gone (T18, D4 tranchée) : "ROLL CONSOLE" said nothing
       the tray below was not already saying (UI-TERMINOLOGY had condemned
       it), and CLEAR TRAY found its final seat — the × on the Dice Tray's
       own cap, the zone it acts on. An empty cap row was 17px of chrome. */
    return "<section class=\"fh-cd-zone fh-cd-console\" data-zone=\"console\">"+
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
  /* Round 8: ROLL itself leads this row now, in the slot the ⋮ vacated -- the
     die IS the button, same artwork-carries-the-word design it always had,
     just no longer needing to break out of .fh-cd-acts-bar to reach here since
     it now lives in the row it used to only visually overlap. */
  function renderWhiteDice(cfg){
    var checkLoaded=!!cfg,counts=trayDieCounts(),calling=callingNow();
    var full=checkLoaded&&trayBonusCount()>=MAX_BONUS_DICE;
    var busy=rollTransactionActive(),armed=state.pendingArmed;
    var rollBtn="<button class=\"fh-cd-mainroll"+(armed?" is-chaos":"")+"\" type=\"button\" data-roll-now"+(busy?" disabled":"")+">"+
      "<img class=\"fh-cd-rolldie\" src=\""+esc((SITE_ROOT||"../")+"assets/img/roll-d20.webp")+"\" alt=\"ROLL\" width=\"120\" height=\"120\"></button>";
    return "<div class=\"fh-cd-whiterow\">"+rollBtn+ROLL_DIE_SIZES.map(function(sides){
      var count=counts[sides]||0;
      var disabled=!!state.pendingArmed||(checkLoaded&&(sides===20||sides===100))||(full&&!count)||(!checkLoaded&&state.traySelection.length>=MAX_FREE_DICE&&!count);
      return "<button type=\"button\" class=\"fh-cd-calling-die"+(calling&&!disabled?" is-calling":"")+"\" data-add-tray-die=\""+sides+"\""+(disabled?" disabled":"")+
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
  // The label a sealed die takes, read off the source table (§1) — one name
  // per source, here as everywhere else.
  function sealLabel(seal){return ROLL_SOURCES[String(seal||"")]?ROLL_SOURCES[String(seal)].label:"Bonus";}
  /* Sealing a die "Destiny" is not decoration: it takes a die out of the pool.
     Nothing is spent by the seal either — the pool die simply moves into the
     hand, and ROLL is still what spends it. */
  function sealStagedDie(seal){
    var target=findStagedDie(state.diePrompt);if(!target)return;
    /* Choosing a seal robe dresses the WHOLE die (R6): the seal's tint comes
       back, so the manual colour is cleared — recolour afterwards from the
       same row if you want "Bardic + crimson". "—" undresses both fields. */
    if(seal!=="destiny"){mutateStagedDie({sourceIcon:seal,label:sealLabel(seal),colour:""});return;}
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
      "<div class=\"fh-cd-menurow\"><span>Zoom</span>"+renderZoomControl()+"</div>"+
      "<button type=\"button\" data-stream-toggle>"+(state.streamOpen?"Close Stream":"Open Stream")+"<small>consultable history</small></button>"+
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
    /* --cd-width and --cd-fs both derive from --cd-zoom now, so the override has
       to land on :root (the <html> element) — setting it on the dock's own node
       only reaches the font-size rules that read --cd-fs directly at their own
       selector, leaving --cd-width locked to whatever it resolved to at :root
       (1). Use ownerDocument so this still lands on the right :root when Table
       mode has moved the node into the Picture-in-Picture window. */
    (root.ownerDocument||document).documentElement.style.setProperty("--cd-zoom-pref",String(state.zoom/100));
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
      /* Console and the roller (now just the Roll Builder's remnant) are
         `summoned` (UI-TERMINOLOGY.md zones 7-8): floated in .fh-cd-floatbottom,
         anchored just ABOVE the band -- never in the document flow that
         pushes the persistent stack down, and never covering the band or the
         tray where the dice land. Dice Pool (renderDestiny) is the 44px BAND
         since phase 1 of the architecture lot: anchored between the panel's
         flow and the tray (bottom:var(--cd-tray-h)), so the counted things
         stay visible and clickable even while the summoned group is up. It
         still shares the `roller` gate (a pre-existing gap, not this pass's
         job to close). The Dice Tray is `persistent` (zone 9): it renders on
         every panel, whatever the belt shows -- the table's rolls land here
         even while you are reading your Notes. */
      inner=renderDockHeader(ch)+(state.chromeOpen?renderAccessZone():"")+
        renderStats(ch)+renderBelt()+renderPanelBody()+
        (roller?renderDestiny(ch):"")+
        renderDiceTray()+
        (roller?"<div class=\"fh-cd-floatbottom\">"+renderConsole()+renderStageZone()+"</div>":"")+
        (state.streamOpen?renderStream():"")+renderPops(ch);
    }
    /* The registre must survive the render: every rebuild used to snap its
       scroll back to the top — a feed poll lands every few seconds, so
       reading an older roll was physically impossible (Eric: the dice
       "dépassent sous les bords" and you can never reach them). */
    var keepTrayScroll=(function(){var node=root.querySelector(".fh-cd-traylist");return node?node.scrollTop:0;})();
    root.innerHTML=seal+"<div class=\"fh-cd-dock\">"+inner+"</div>";
    renderMessage();
    if(window.FHStaticDice&&window.FHStaticDice.mount)window.FHStaticDice.mount(root);
    /* The traylist node is reborn on every render — restore where the
       reader was, rebind its scroll, re-derive which arrows have work. */
    var trayScroller=root.querySelector(".fh-cd-traylist");
    if(trayScroller){
      /* M3a: a climb (surfaceTrayLine) asked for the top — that is a USER
         gesture, so it wins over the kept position exactly once and BECOMES
         the remembered position (the next render reads the live scrollTop,
         which is now 0 or gliding there — the fbe871e preservation and this
         scroll never fight, they read/write the same live value in turn).
         The reborn list already sits at 0; to make the glide visible we
         restore the old position first and scroll smoothly from there —
         except under prefers-reduced-motion, where staying at 0 IS the
         no-animation path. */
      if(state.trayScrollToTop){
        state.trayScrollToTop=false;
        var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if(keepTrayScroll&&!reduced)smoothTrayScrollTop(trayScroller,keepTrayScroll);
        // reduced motion, or nothing to glide over: the reborn node already sits at 0.
      }
      else if(keepTrayScroll)trayScroller.scrollTop=keepTrayScroll;
      trayScroller.addEventListener("scroll",syncTrayArrows,{passive:true});
    }
    syncTrayArrows();
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
  function loadBuild(){var who=state.pseudo;if(!state.code||!who)return;state.loading=true;render();try{localStorage.setItem("fh-my-pseudo",who);}catch(e){}Promise.all([api("/party/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)),api("/profile/"+encodeURIComponent(state.code)+"/"+encodeURIComponent(who)).catch(function(){return {profile:emptyProfile()};})]).then(function(results){state.record=results[0];state.profile=results[1].profile||emptyProfile();state.profileRevision=revisionOf(results[1]);state.character=effectiveCharacter();loadPlayState(state.character);state.loading=false;state.inventory=null;state.message="";rememberRoute();render();startFeed();}).catch(function(error){state.loading=false;state.record=null;state.character=null;stopFeed();state.message=error.message||"Could not load this character.";state.messageKind="danger";render();});}

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
  function pullDdb(value,modal){var url=null;if(value){try{url=canonicalDdbUrl(value);}catch(error){modal.element.querySelector("#fhPsPullError").textContent=error.message;return;}}var preservedOverrides=cloneData(state.profile&&state.profile.manualOverrides||{});state.message="Syncing D&D Beyond…";state.messageKind="roll";renderMessage();profileWrite("/pull",url?{shareUrl:url}:{}).then(function(data){state.profile=Object.assign({},state.profile||{},data.profile||{});state.profile.manualOverrides=preservedOverrides;state.character=effectiveCharacter();if(modal)modal.close();var report=state.character.importReport||emptyImportReport(),warnings=report.unmappedSkills.length+report.unmappedTools.length;state.message="Character refreshed · "+report.importedTools.length+" DDB tool"+(report.importedTools.length===1?"":"s")+" imported"+(warnings?" · "+warnings+" unrecognized entr"+(warnings===1?"y":"ies")+" ignored":"")+".";state.messageKind=warnings?"warn":"success";render();}).catch(function(error){if(error&&error.silent){if(modal)modal.close();return;}var message=friendlyPullError(error);if(modal)modal.element.querySelector("#fhPsPullError").textContent=message;else{state.message=message;state.messageKind="danger";render();}});}
  function openLevelUp(ch){var classes=CLASS_NAMES.slice();ch.classes.forEach(function(entry){if(classes.indexOf(entry.name)<0)classes.unshift(entry.name);});var classOptions=classes.map(function(name){return "<option "+(ch.classes[0]&&ch.classes[0].name===name?"selected":"")+">"+esc(name)+"</option>";}).join("");var statOptions="<option value=\"\">No increase</option>"+ABILITIES.map(function(key){return "<option value=\""+key+"\">"+key+" — "+ABILITY_NAMES[key]+"</option>";}).join("");var skillOptions="<option value=\"\">No skill</option>"+SKILLS.map(function(s){return "<option>"+s[0]+"</option>";}).join("");var modal=showModal("<p class=\"fh-mc-modal-kicker\">LEVEL "+(ch.level+1)+"</p><h3>What gains a level?</h3><label><span>Class</span><select id=\"fhPsLevelClass\">"+classOptions+"</select></label><div class=\"fh-mc-modal-grid\"><label><span>Ability increase 1</span><select id=\"fhPsStat1\">"+statOptions+"</select></label><label><span>Ability increase 2</span><select id=\"fhPsStat2\">"+statOptions+"</select></label></div><div class=\"fh-mc-modal-grid\"><label><span>Essential skill</span><select id=\"fhPsSkill1\">"+skillOptions+"</select></label><label><span>New tier</span><select id=\"fhPsTier1\"><option value=\"half\">Half</option><option value=\"proficient\" selected>Proficient</option><option value=\"expert\">Expert</option></select></label></div><label><span>New essential spells</span><textarea id=\"fhPsNewSpells\" placeholder=\"One per line or comma-separated\"></textarea></label><p class=\"fh-mc-modal-error\" id=\"fhPsLevelError\"></p><button class=\"fh-mc-modal-save\" id=\"fhPsLevelSave\">Apply Level Up</button>");modal.element.querySelector("#fhPsLevelSave").onclick=function(){var increases={};["#fhPsStat1","#fhPsStat2"].forEach(function(sel){var value=modal.element.querySelector(sel).value;if(value)increases[value]=(increases[value]||0)+1;});var skillName=modal.element.querySelector("#fhPsSkill1").value;var entry={id:uuid(),targetLevel:ch.level+1,className:modal.element.querySelector("#fhPsLevelClass").value,abilityIncreases:increases,essentialSkills:skillName?[{name:skillName,tier:modal.element.querySelector("#fhPsTier1").value}]:[],spells:modal.element.querySelector("#fhPsNewSpells").value.split(/[\n,]+/).map(function(x){return x.trim();}).filter(Boolean),createdAt:new Date().toISOString()};saveProfile({levelUps:(state.profile.levelUps||[]).concat([entry])}).then(function(){modal.close();state.character=effectiveCharacter();state.message="Level-up saved. PB updated automatically.";state.messageKind="success";render();}).catch(function(error){if(error&&error.silent){modal.close();return;}modal.element.querySelector("#fhPsLevelError").textContent=error.message;});};}

  /* D, A and the +2 chip are one mutually-exclusive set now (Eric, round 8):
     lighting one turns off whichever of the other two was on, and lighting
     the one already on turns it back off -- landing on flat. Both a left
     click (handleClick) and a right click (onTrayContext) call this. */
  function toggleRollMode(node){
    var cfg=state.rollConfig;if(!cfg||cfg.editingId)return;
    if(node.id==="fhPsPlusTwo"){cfg.plusTwo=!cfg.plusTwo;if(cfg.plusTwo)cfg.d20Mode="flat";}
    else{var next=node.dataset.dieMode;cfg.d20Mode=cfg.d20Mode===next?"flat":next;cfg.plusTwo=false;}
    prepareTrayForConfig(cfg);render();
  }
  /* R3 (décision Eric, 2026-08-05): a LEFT click on a die of a lower tray
     line calls the roll back up — surfaceTrayLine, the machinery kept exactly
     for this. Display order only; a feed roll climbs too (local reading, no
     remote write). Guard rails: never a <button> (the who-chip's reopen and
     every other button keep their own actions), never the LIVE hand (its dice
     already answer to menus and choices — the only line whose dice carry
     interactions today), and the right click keeps the die menus untouched. */
  function surfaceClickedTrayDie(event){
    if(!event.target||!event.target.closest)return false;
    if(event.target.closest("button"))return false;
    var die=event.target.closest(".fh-cd-diewrap");
    if(!die)return false;
    var line=die.closest("li[data-tray-line]");
    if(!line||line.classList.contains("is-livehand"))return false;
    /* M3c (Eric: "si j'ai 30 d6, c'est pratique"): remember WHICH die was
       clicked — its position among the line's diewraps, which is the same
       index the re-render walks (visualDie emits exactly one .fh-cd-diewrap
       per die, coins included) — so the resurfaced line can keep a small
       persistent mark on that one die. Extinction rule (documented): the
       mark survives renders and stays until the next thing happens — another
       climb replaces it, a new roll landing (addHistory), any die menu
       opening (openDieMenu), or CLEAR TRAY clears it. */
    var wraps=line.querySelectorAll?line.querySelectorAll(".fh-cd-diewrap"):[];
    var di=Array.prototype.indexOf.call(wraps,die);
    state.traySurfaceDie=di>=0?{lineId:line.getAttribute("data-tray-line"),di:di}:null;
    surfaceTrayLine(line.getAttribute("data-tray-line"));
    return true;
  }
  function handleClick(event){if(surfaceClickedTrayDie(event))return;
    var button=event.target.closest("button");if(!button||!root.contains(button))return;
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
    if(button.dataset.streamToggle!==undefined){state.streamOpen=!state.streamOpen;state.menuOpen=false;render();return;}
    if(button.dataset.pendingSave!==undefined){savePendingLabel(button.dataset.pendingSave);return;}
    if(button.dataset.pendingDrop!==undefined){dropPendingFate(button.dataset.pendingDrop);state.trayPrompt=null;persistPlayState();render();return;}
    // Switching Mine/Table repaints its own zone only — it must not disturb an
    // open roll, and it is legal in every phase because it changes nothing.
    if(button.dataset.streamView!==undefined){
      var openingTable=button.dataset.streamView==="table"&&state.streamView!=="table";
      state.streamView=button.dataset.streamView==="table"?"table":"mine";
      renderFeedZone();
      if(openingTable)refreshFeed();
      return;
    }
    if(button.dataset.feedRefresh!==undefined){refreshFeed();return;}
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
    if(button.dataset.trayScroll!==undefined){var scrollList=root.querySelector(".fh-cd-traylist");if(scrollList){/* One click = one band: every line is the same 56px now (border-box,
       paddings and separator inside), so the chevron steps exactly one. */
      scrollList.scrollBy({top:button.dataset.trayScroll==="up"?-56:56,behavior:"smooth"});window.setTimeout(syncTrayArrows,220);}return;}
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
    if(button.dataset.zoomSet!==undefined){setZoom(button.dataset.zoomSet);return;}
    if(button.dataset.zoomReset!==undefined){resetZoom();return;}
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
    if(button.id==="fhPsPlusTwo"){toggleRollMode(button);return;}
    if(button.dataset.removeBonus!==undefined){removeGenericBonusDie(button.dataset.removeBonus);return;}
    if(button.dataset.dieMode&&button.dataset.dieScope==="d20"){toggleRollMode(button);return;}
    if(button.dataset.dieMode){var cfg=state.rollConfig,scope=button.dataset.dieScope,index=Number(button.dataset.dieIndex),next=button.dataset.dieMode;if(!cfg)return;if(scope==="destiny")cfg.destinyMode=cfg.destinyMode===next?"flat":next;else if(scope==="bonus"&&cfg.bonusDice[index]&&!cfg.bonusDice[index].locked)cfg.bonusDice[index].advantageMode=cfg.bonusDice[index].advantageMode===next?"flat":next;prepareTrayForConfig(cfg);render();return;}
    if(button.dataset.rollMode){if(!state.rollConfig||state.rollConfig.editingId)return;var mode=button.dataset.rollMode;state.rollConfig.plusTwo=mode==="plus2";state.rollConfig.d20Mode=mode==="plus2"?"flat":mode;prepareTrayForConfig(state.rollConfig);render();return;}
    if(button.dataset.openConsole){openConfig("Ability Check","STR",0,"Choose a skill row for its calculated bonus");return;}
    if(button.dataset.historyId){var entry=state.history.find(function(item){return item.id===button.dataset.historyId;});if(entry&&entry.kind==="d20"){state.rollConfig=configFromEntry(entry);setTrayFromEntry(entry);render();}return;}
    if(button.dataset.destinyPoolmenu!==undefined){state.destinyPoolMenu=!state.destinyPoolMenu;render();return;}
    // Opening the console's ⋮ syncs first: its own inputs are what render()
    // is about to rebuild, so an unsynced value would be thrown away.
    if(button.dataset.consoleMenu!==undefined){if(state.rollConfig)syncConsoleInputs();state.consoleMenu=!state.consoleMenu;render();return;}
    if(button.dataset.trayCapmenu!==undefined){state.trayCapMenu=!state.trayCapMenu;render();return;}
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
  /* Right-click surfaces, and what each one means:
     on a WHITE console die it takes one back; on a GOLD Destiny pool die it
     unstages it if it is the one currently waiting (round 8 -- left click
     adds exactly like the white picker, right click undoes it, same as the
     white/bonus dice; still only one Destiny die can wait at a time, enforced
     where it always was, in stageDestinyFromPool/stageDestinyDie); on D/A/+2
     it is just another way to fire the same toggle a left click does; on a
     die already IN THE TRAY it opens that die's own menu (colour, seal,
     advantage). */
  function trayDieTarget(event){
    if(!event.target||!event.target.closest)return null;
    var picker=event.target.closest("[data-add-tray-die]");
    if(picker)return picker.disabled?null:{kind:"picker",node:picker};
    var destinyPicker=event.target.closest("[data-destiny-die]");
    if(destinyPicker)return destinyPicker.disabled?null:{kind:"destinyPicker",node:destinyPicker};
    var rollToggle=event.target.closest("#fhPsPlusTwo,[data-die-mode][data-die-scope=\"d20\"]");
    if(rollToggle)return rollToggle.disabled?null:{kind:"rollToggle",node:rollToggle};
    var badge=event.target.closest("[data-pending-id]");
    if(badge)return {kind:"badge",node:badge};
    var tunable=event.target.closest("[data-die-staged],[data-die-bonus],[data-die-destiny],[data-die-pool],[data-die-free],[data-die-base],[data-die-landed]");
    return tunable?{kind:"die",node:tunable}:null;
  }
  function openDieMenu(node){
    // M3c extinction: opening any die's menu retires the climb's mark.
    state.traySurfaceDie=null;
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
  /* The mirror of stageDestinyFromPool: undoes whichever of the three places
     a waiting Destiny die can live (the open roll's staged list, a prepared
     console's destinyDieId, or the bare destinyStaged) -- but only if the die
     right-clicked is the one actually waiting. Right-clicking any other pool
     die (nothing is staged, or a different one is) does nothing, same as the
     white picker does nothing on a size you haven't added. Reuses
     dropStagedDie rather than repeating its three destiny branches here --
     just aims state.diePrompt at the right one first, the same shapes
     findStagedDie already recognizes. */
  function takeBackDestinyDie(node){
    var dieId=node.dataset.destinyDie;if(!dieId)return;
    if(rollOpen()){
      var item=stagedList().find(function(die){return die.kind==="destiny"&&die.destinyDieId===dieId;});
      if(!item)return;
      state.diePrompt={stagedId:item.id};dropStagedDie();return;
    }
    if(rollTransactionActive()){warnRollLocked();return;}
    if(state.rollConfig&&state.rollConfig.destinyDieId===dieId){state.diePrompt={destinyDieId:dieId};dropStagedDie();return;}
    if(state.destinyStaged&&state.destinyStaged.dieId===dieId){state.diePrompt={poolId:dieId};dropStagedDie();return;}
  }
  /* The reading glass is REMOVED (décision Eric, lot BACKLOG-B 2026-08-05).
     It went dark behind a kill switch first (fccf1d0); Eric then ruled it
     out for good — the switch, the hover clamp and the right-click
     "remonter le jet" gesture that lived ON the glass are gone with it.
     surfaceTrayLine SURVIVES as kept machinery: a future eye icon will
     call it to climb a roll back to line 1. */
  function onTrayContext(event){
    var target=trayDieTarget(event);if(!target)return;
    event.preventDefault();
    if(target.kind==="badge")openBadgeMenu(target.node);
    else if(target.kind==="die")openDieMenu(target.node);
    else if(target.kind==="destinyPicker")takeBackDestinyDie(target.node);
    else if(target.kind==="rollToggle")toggleRollMode(target.node);
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
      else if(target.kind==="destinyPicker")takeBackDestinyDie(target.node);
      else if(target.kind==="rollToggle")toggleRollMode(target.node);
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
  function onClick(event){if(state.trayHeld){state.trayHeld=false;return;}
    if(delegateToPanel(event,"onClick"))return;try{handleClick(event);}catch(error){state.message="Roll Console error: "+(error&&error.message||"unknown error");state.messageKind="danger";pushEvent(state.message,"error");renderMessage();refreshEventPanel();if(window.console&&console.error)console.error(error);}}
  /* ── General rule: a click outside an open dropdown closes it ─────
     Applies to every small anchored popup and floating menu card (the
     header's ⋮, the Destiny pool menu, the console ⋮ with its MOD/DC,
     the tray cap's ⋮, a die's own menu — the seal card — and the badge
     cards) -- not to the belt's full panels, the inline disclosures
     with their own × (HP/EXH tracker, Access zone, Stream), or a
     ROLL'S DECISION PROMPTS (nat1, die-choice, arcana-draw, chaos,
     awakening): those are the roll's state machine, they must never
     vanish on a stray click. A click INSIDE a popup never closes it.
     New popups of the same kind register themselves here rather than
     each wiring up their own outside-click listener. */
  var OUTSIDE_CLICK_POPUPS=[
    {isOpen:function(){return !!state.menuOpen;},close:function(){state.menuOpen=false;},box:".fh-cd-menu",toggle:"[data-menu-toggle]"},
    {isOpen:function(){return !!state.destinyPoolMenu;},close:function(){state.destinyPoolMenu=false;},box:".fh-cd-dpoolmenu",toggle:"[data-destiny-poolmenu]"},
    /* Closing this one commits first: it holds live MOD/DC inputs, and a
       value typed and then dismissed by clicking away must not be lost. */
    {isOpen:function(){return !!state.consoleMenu;},close:function(){if(state.rollConfig)syncConsoleInputs();state.consoleMenu=false;},box:".fh-cd-cmenu",toggle:"[data-console-menu]"},
    {isOpen:function(){return !!state.trayCapMenu;},close:function(){state.trayCapMenu=false;},box:".fh-cd-cmenu.is-traycap",toggle:"[data-tray-capmenu]"},
    /* The die menu (right click / long press on a die: seal, colour, roll
       mode, Portent). Its toggles are the dice themselves: a click landing
       on a die is dice-work, not "elsewhere" — and the synthetic click a
       long press leaves behind targets the OLD, detached die node, so
       matching the die selectors also keeps a fresh menu from closing
       itself. The Portent <select> sits inside the card and is safe. */
    {isOpen:function(){return !!state.diePrompt;},close:function(){state.diePrompt=null;},
     box:".fh-cd-card.is-diemenu",
     toggle:"[data-die-staged],[data-die-bonus],[data-die-destiny],[data-die-pool],[data-die-free],[data-die-base],[data-die-landed]"},
    /* The badge cards — pin (pending-new), rename (pending-menu), and the
       waiting overreach/chaos notice (pending) — are menus, not decisions:
       none of them is persisted with a roll sequence, and their own Close/
       OK buttons don't save either, so closing loses nothing a button
       wouldn't. The blocking prompts are filtered out by type here. */
    {isOpen:function(){return !!(state.trayPrompt&&/^pending/.test(String(state.trayPrompt.type||"")));},
     close:function(){state.trayPrompt=null;},
     box:".fh-cd-card",
     toggle:"[data-pending-id],[data-pending-open],[data-pending-add]"}
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
  function onKeydown(event){
    // Scoped to the dock (root's own listener, not a document-level one) so
    // this never fights the browser's own Cmd/Ctrl+/- when the player is just
    // reading the handbook beside it.
    if((event.metaKey||event.ctrlKey)&&/^[=+_-]$/.test(event.key)){
      event.preventDefault();stepZoom(event.key==="-"||event.key==="_"?-1:1);return;
    }
    if(event.target.id==="fhPsCode"&&event.key==="Enter"){event.preventDefault();loadParty();return;}if(/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;var key=String(event.key||"").toLowerCase();if(key==="c"||key==="escape"){event.preventDefault();if(rollTransactionActive())warnRollLocked();else clearDiceTray(true);return;}if(!state.rollConfig||state.rollConfig.editingId)return;if(key==="a"||key==="d"||key==="f"){event.preventDefault();state.rollConfig.plusTwo=false;state.rollConfig.d20Mode=key==="a"?"advantage":key==="d"?"disadvantage":"flat";prepareTrayForConfig(state.rollConfig);render();return;}if(key===" "){event.preventDefault();var roll=root&&root.querySelector("[data-roll-now]");if(roll&&!roll.disabled)roll.click();}}

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
    /* Table mode opens at the reference (UI-DIMENSIONS.md), not an incidental
       size computed from the current box and the screen -- 425x680 scaled by
       the dock's own current zoom, so the window a player gets is predictable
       and they resize from a known starting point instead of an accidental
       one. */
    var factor=state.zoom/100;
    var width=Math.round(ZOOM_REF_W*factor);
    var height=Math.round(ZOOM_REF_H*factor);
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
    /* Bubble-phase on document, not root: it must also fire for a click on the
       Handbook page around the dock while the dock floats, and it runs after
       root's own click handling so a click that just opened a popup (via its
       toggle) is not immediately read as "outside" and closed again. */
    document.addEventListener("click",onOutsideClick);
    /* Panel-only hooks. focusout rather than blur, because blur does not bubble
       and a delegated listener would never see it. */
    root.addEventListener("input",function(event){delegateToPanel(event,"onInput");});
    root.addEventListener("focusout",function(event){delegateToPanel(event,"onBlur");});
    // Coming back to the tab is treated like reopening the TABLE tab: one
    // refresh, not a resumed poll (plan §13.9 fix 1 — RECENT is never on a
    // timer). No-op unless the TABLE tab is actually the one showing.
    document.addEventListener("visibilitychange",function(){if(!document.hidden&&state.streamView==="table")refreshFeed();});
    root.addEventListener("contextmenu",onTrayContext);
    root.addEventListener("touchstart",onTrayTouchStart,{passive:true});
    root.addEventListener("touchend",onTrayTouchEnd);root.addEventListener("touchcancel",onTrayTouchEnd);
    var linkedCampaign=routeValue("campaign"),linkedCharacter=routeValue("character");
    try{state.code=(linkedCampaign||localStorage.getItem("fh-my-campcode")||"").trim().toUpperCase();}catch(error){state.code=String(linkedCampaign||"").trim().toUpperCase();}
    state.requestedPseudo=linkedCharacter;
    var remembered=null;try{remembered=localStorage.getItem("fh-cd-open");}catch(error){}
    state.dockOpen=ownsPage||!!linkedCampaign||remembered==="1";
    var rememberedZoom=null,rememberedZoomAuto=null;
    try{rememberedZoom=localStorage.getItem("fh-cd-zoom");rememberedZoomAuto=localStorage.getItem("fh-cd-zoom-auto");}catch(error){}
    if(rememberedZoomAuto==="0"&&ZOOM_STEPS.indexOf(Number(rememberedZoom))>=0){
      state.zoom=Number(rememberedZoom);state.zoomAuto=false;
    }else{
      /* The scale was rebased from 1.15/1.3/1.45 (a raw --cd-fs) to percent
         steps. A pre-zoom pick was an explicit choice, not a default, so it
         migrates as a manual step rather than being dropped into auto-fit. */
      var oldSize=null;try{oldSize=localStorage.getItem("fh-cd-textsize");}catch(error){}
      if(oldSize&&!rememberedZoomAuto){
        state.zoom=nearestZoomStep(Number(oldSize)/ZOOM_BASE_FS*100);state.zoomAuto=false;
        try{localStorage.setItem("fh-cd-zoom",String(state.zoom));localStorage.setItem("fh-cd-zoom-auto","0");}catch(error){}
      }else{
        state.zoomAuto=true;state.zoom=autoFitZoom();
      }
    }
    window.addEventListener("resize",function(){
      if(!state.zoomAuto||inPip())return;
      var next=autoFitZoom();
      if(next!==state.zoom){state.zoom=next;render();}
    });
    /* Only honour a remembered tab that still exists -- a panel file that was
       removed must not leave the belt pointing at nothing. */
    var rememberedPanel=null;try{rememberedPanel=localStorage.getItem("fh-cd-panel");}catch(error){}
    if(rememberedPanel&&allPanels().some(function(panel){return panel.id===rememberedPanel;}))state.panel=rememberedPanel;
    render();
    if(state.dockOpen&&state.code)loadParty();
  });
})();
