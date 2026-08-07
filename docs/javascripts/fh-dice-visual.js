/* Fate's Hand — présentation des dés.
   Extrait de fh-player-sheet.js le 2026-08-07. Tout ici est PUR : une entrée
   (un dé, un nombre, un mot) rend un SVG ou une chaîne. Rien ne touche
   `state`, rien ne redessine, rien ne rappelle le dock. C'est cette propriété
   qui rend la coupe sûre — et c'est elle qu'il faut préserver si ce fichier
   grossit. Dépend de fh-utils.js (esc, mod) ; chargé après lui, avant le dock. */
(function () {
  "use strict";
  var FH = (window.FH = window.FH || {});
  var esc = FH.utils.esc, mod = FH.utils.mod;

  var ROLL_DIE_SIZES = [4,6,8,10,12,20,100];
  var LIGHTWEIGHT_DICE_THRESHOLD = 6;
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
    /* P17: ash sat at 1.34 from ivory — two dice side by side, all but
       indistinguishable. Darkening it would have traded one confusion for the
       other (the further it moves from ivory, the deeper it sinks into the
       ramp), so the brightness is KEPT and the difference moves onto the
       temperature: the fill is pushed blue and the rim goes cold, nearly
       black, where ivory wears a warm gold rim (#8a6a2a). On 38px a 3px rim
       is an enormous signal. */
    ash:{fill:"#c2c9d4",light:"#e8ecf2",dark:"#98a0ab",rim:"#2f353c",facet:"#a7b0bd",num:"#2b3138"}
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
  /* ── P7 : une entrée du lexique, DEUX formes — et c'est la surface qui
     choisit (ratifiée Eric, 2026-08-07) ───────────────────────────────
     There is no second list of words here. `die.label` stays the long form
     and keeps going everywhere a long form belongs — the judgment box, the
     die's card, the Stream, the hover, the wire (rollExportDice flattens the
     same list, so a rename in this function reaches no machine). What this
     function returns is the SHORT form, and it is read by exactly the three
     narrow surfaces P7 names: under a die (38px), under a coin (26px), the
     band's pool pastille (24px).

     THE INVARIANT IS THE PIXEL, NOT THE CHARACTER COUNT (P29's own
     correction): 38px is the width of the die, 26px the width of the coin,
     and both are true at every zoom because they ARE the object. The
     character count quoted in P4 is an aide-mémoire with a wide bracket,
     which is precisely why the table below rules word by word instead of
     truncating by length.

     P3 governs the silences: a label never repeats the die's own shape.
     « d20 », « d8 » die here — a d8 that says "d8" has said nothing. The
     base d20 keeps a word because « Base d20 » names its ROLE, which the
     shape does not say. */
  var HAND_LABELS={
    "d20":"Base d20",          // P30 — the role, not the form
    "Original d20":"Base d20", // struck through and dimmed: the strike says "original"
    "FATE 1→20":"Fate→20",
    "FATE 1→1":"Fate→1",
    "Guidance":"Guide",        // P8 — 40.6px overflowed by 2
    "Overreach":"Over.R",      // P8, amended by Eric: OVER.R, not OVER
    "FH bonus":"FH",           // P24 — the coin already prints "+2"; the word says WHAT, not how much
    "Exhaustion":"EXH",        // P8/P30 — « Exhaust. » is 34px on a 26px coin
    "Manual":"Mod"             // P8 — ends the Mod/Manual divergence between surfaces
  };
  var ABILITY_SHORT={Strength:"STR",Dexterity:"DEX",Constitution:"CON",Intelligence:"INT",Wisdom:"WIS",Charisma:"CHA"};
  /* The short form of one label. `opts.short` is P9's « Court » field when the
     die came from a pool resource that has one; without it the fallback is the
     first word, which is the same default P9 pre-fills the field with. */
  function shortDieLabel(text,opts){
    opts=opts||{};
    text=String(text==null?"":text).trim();
    if(!text)return "";
    if(HAND_LABELS[text]!=null)return HAND_LABELS[text];
    // P3: the shape is drawn, it is not written. A bare « d8 » says nothing.
    if(/^d(4|6|8|10|12|20|100)$/.test(text))return "";
    // P8/P30 — the six saves, on the « XXX sv » pattern: « CON save » is 39px,
    // over the die's 38, and « save » spelled out breaks on two abilities.
    var save=/^(.+?)\s+save$/i.exec(text);
    if(save){
      var abbr=ABILITY_SHORT[save[1]]||(/^[A-Z]{3}$/.test(save[1])?save[1]:"");
      if(abbr)return abbr+" sv";
    }
    // P8 — the two Chaos dice sit side by side; the number adds nothing.
    if(/^Chaos\s*#\d+$/.test(text))return "Chaos";
    if(opts.short)return String(opts.short).trim();
    // P9's default, and P12's cascade one surface further in: the first word.
    // The CSS ellipse is the last net, never the first (P6).
    var first=text.split(/\s+/)[0];
    return first;
  }
  /* What a die shows under itself in the hand. The long form is what the
     wrapper's title carries, so P6's contrepartie holds: nothing is ever cut
     without the whole word remaining one hover (Mac) or one card (iPad) away. */
  function handLabel(die){
    if(!die)return "";
    return shortDieLabel(die.label,{short:die.short});
  }
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
      /* P20/P24: in the hand the coin keeps a word under it — but the SHORT
         one, on 26px of coin rather than 38px of die, and it never repeats
         the value already printed on the face. The long form stays on the
         title, always, so P6's contrepartie holds whether or not the label
         is drawn (it used to appear only when the label was suppressed). */
      var coinShort=handLabel(die),coinFull=die.label||"Bonus";
      return "<span class=\""+classes.join(" ")+"\" title=\""+esc(coinFull)+"\"><span class=\"fh-cd-die fh-cd-token\">"+tokenSvg(Math.round(size*.68),text,tone)+"</span>"+((opts.noLabel||!coinShort)?"":"<em>"+esc(coinShort)+"</em>")+"</span>";
    }
    /* The source token AND its empty 12px slot are gone (Eric: "violet +
       Bardic, rien de plus") — the die's tint says destiny/tactical/bardic/
       guidance/plain, the label names it, and for a label-less die the
       wrapper's title keeps the full name on hover (same pattern as naked). */
    /* P6: whatever is written under a die, the WHOLE word stays one hover
       away — and on iPad, where there is no hover, one tap on the die's card.
       So the full label is the title of every die, not only of the ones whose
       label was suppressed; when a handle claims the hover for its own hint,
       the name goes in FRONT of it rather than being displaced by it. */
    var fullLabel=die.label||(die.dieRole==="destiny"?ROLL_SOURCES.destiny.label:die.dieRole==="bonus"?rollSource(die.sourceIcon).label:"");
    /* P18 (ratifiée Eric, 2026-08-07): a forced die used to be said by writing
       its label in violet #7a4a9c — 1.18:1 on the live band, i.e. invisible,
       in production, today. The tray's ground stays dark (R8 not reopened) and
       the lettering under the dice stays white, so violet has nowhere left to
       live as INK. It goes where it carries its own ground instead: a corner
       badge on the die itself, the same form as P10's ×N — #f5edff on solid
       #5c3d7e, 8.12:1. The label goes back to white, the flank says « Manual »
       in informative ink, and a forced die is findable in a hand of thirty. */
    var portent=die.forced?"<span class=\"fh-cd-portent\" aria-hidden=\"true\">M</span>":"";
    var srcTitle=fullLabel;
    var shortLabel=handLabel(die);
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
      if(handle){classes.push("is-tunable");handle+=" title=\""+(fullLabel?esc(fullLabel)+" — ":"")+"Right click or long press: colour, advantage, Portent\"";}
    }
    /* A die that has already fallen keeps answering — a Diviner replaces
       results after the fact, which is the whole of Portent. Destiny dice are
       the exception: what they read is what they cost. */
    else if(die.landedKey&&die.result!=null&&!die.dropped&&die.dieRole!=="destiny"){
      handle=" data-die-landed=\""+esc(die.landedKey)+"\" data-die-entry=\""+esc(die.entryId||"")+"\""+
        " title=\""+(fullLabel?esc(fullLabel)+" — ":"")+"Right click or long press: colour, Portent\"";
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
      var nakedTitle=fullLabel;
      return "<span class=\""+classes.join(" ")+" is-naked\""+(handle||(nakedTitle?" title=\""+esc(nakedTitle)+"\"":""))+">"+
        "<span class=\""+dieClasses+"\">"+face+"</span>"+portent+"</span>";
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
        "<span class=\""+dieClasses+"\">"+face+"</span>"+portent+
        ((opts.noLabel||!shortLabel)?"":"<em>"+esc(shortLabel+status)+"</em>")+"</span>";
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
      "<span class=\""+dieClasses+"\">"+face+"</span>"+portent+
      ((opts.noLabel||!shortLabel)?"":"<em>"+esc(shortLabel+status)+"</em>")+"</span>";
  }
  FH.diceVisual = {
    ROLL_DIE_SIZES: ROLL_DIE_SIZES, LIGHTWEIGHT_DICE_THRESHOLD: LIGHTWEIGHT_DICE_THRESHOLD,
    ROLL_SOURCES: ROLL_SOURCES, UNKNOWN_SOURCE: UNKNOWN_SOURCE, HAND_LABELS: HAND_LABELS,
    SEALABLE_SOURCES: SEALABLE_SOURCES, DIE_GEO: DIE_GEO, DIE_MATERIAL: DIE_MATERIAL,
    DIE_COLOURS: DIE_COLOURS, SOURCE_TINT: SOURCE_TINT, TOKEN_TONES: TOKEN_TONES,
    rollSource: rollSource, dieMaterialName: dieMaterialName, dieSvg: dieSvg,
    pickerFace: pickerFace, tokenSvg: tokenSvg, dieSize: dieSize,
    shortDieLabel: shortDieLabel, handLabel: handLabel, visualDie: visualDie
  };
})();
